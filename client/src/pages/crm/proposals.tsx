import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, FileText, Trash2, Edit, Eye, Send, Share2, Loader2,
  ChevronRight, ChevronLeft, CheckCircle, Building2, Package,
  CreditCard, ClipboardCheck, Copy, X,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", pending_approval: "بانتظار الموافقة", approved: "معتمد",
  sent: "مرسل", viewed: "تمت المشاهدة", revised: "معدّل",
  accepted: "مقبول", rejected: "مرفوض", expired: "منتهي الصلاحية",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", pending_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700", sent: "bg-indigo-100 text-indigo-700",
  viewed: "bg-purple-100 text-purple-700", revised: "bg-orange-100 text-orange-700",
  accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700",
  expired: "bg-rose-100 text-rose-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  "mobile-app": "تطبيق جوال", "web-platform": "موقع ويب",
  erp: "نظام ERP", marketing: "تسويق", general: "عام",
};

interface ProposalItem {
  id?: string; title: string; description: string;
  quantity: string; unitPrice: string; lineTotal: string;
}

const emptyItem = (): ProposalItem => ({ title: "", description: "", quantity: "1", unitPrice: "0", lineTotal: "0" });

function calcItem(item: ProposalItem): ProposalItem {
  const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
  return { ...item, lineTotal: total.toFixed(2) };
}

function calcTotals(items: ProposalItem[], discountType: string, discountValue: string, taxPercent: string) {
  const subtotal = items.reduce((s, i) => s + parseFloat(i.lineTotal || "0"), 0);
  const discV = parseFloat(discountValue) || 0;
  const discount = discountType === "percent" ? (subtotal * discV) / 100 : discV;
  const afterDiscount = subtotal - discount;
  const taxP = parseFloat(taxPercent) || 0;
  const taxAmount = (afterDiscount * taxP) / 100;
  const total = afterDiscount + taxAmount;
  return { subtotal, discount, taxAmount, total };
}

const WIZARD_STEPS = [
  { id: 1, label: "بيانات العميل", icon: Building2 },
  { id: 2, label: "القالب والبنود", icon: Package },
  { id: 3, label: "الأسعار والشروط", icon: CreditCard },
  { id: 4, label: "المراجعة والإرسال", icon: ClipboardCheck },
];

export default function CrmProposals() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();

  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", companyId: "", contactId: "", dealId: "",
    currency: "SAR", discountType: "fixed", discountValue: "0",
    taxPercent: "15", termsAndNotes: "", status: "draft",
    expiryDate: "", internalNotes: "",
  });
  const [items, setItems] = useState<ProposalItem[]>([emptyItem()]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailProposal, setEmailProposal] = useState<any>(null);
  const [emailForm, setEmailForm] = useState({ to: "", subject: "", message: "" });
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const { data: proposals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/crm/proposals"],
    queryFn: () => apiRequest("GET", "/api/crm/proposals").then(r => r.json()),
  });
  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"],
    queryFn: () => apiRequest("GET", "/api/companies").then(r => r.json()),
  });
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
    queryFn: () => apiRequest("GET", "/api/contacts").then(r => r.json()),
  });
  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/proposal-templates"],
    queryFn: () => apiRequest("GET", "/api/crm/proposal-templates").then(r => r.json()),
  });

  const { subtotal, discount, taxAmount, total } = calcTotals(items, form.discountType, form.discountValue, form.taxPercent);

  const resetWizard = () => {
    setForm({ title: "", companyId: "", contactId: "", dealId: "", currency: "SAR", discountType: "fixed", discountValue: "0", taxPercent: "15", termsAndNotes: "", status: "draft", expiryDate: "", internalNotes: "" });
    setItems([emptyItem()]);
    setSelectedTemplate("");
    setWizardStep(1);
    setEditingId(null);
  };

  const openWizard = (proposal?: any) => {
    if (proposal) {
      setEditingId(proposal.id);
      setForm({
        title: proposal.title || "", companyId: proposal.companyId || "", contactId: proposal.contactId || "",
        dealId: proposal.dealId || "", currency: proposal.currency || "SAR",
        discountType: proposal.discountType || "fixed", discountValue: proposal.discountValue || "0",
        taxPercent: proposal.taxPercent || "15", termsAndNotes: proposal.termsAndNotes || "",
        status: proposal.status || "draft", expiryDate: proposal.expiryDate ? proposal.expiryDate.split("T")[0] : "",
        internalNotes: proposal.internalNotes || "",
      });
      setItems((proposal.items || []).map((i: any) => calcItem(i)));
    } else {
      resetWizard();
    }
    setShowWizard(true);
  };

  const applyTemplate = (tplId: string) => {
    const tpl = (templates as any[]).find((t) => t.id === tplId);
    if (!tpl) return;
    setSelectedTemplate(tplId);
    const tplItems = (tpl.items || []).map((i: any) => calcItem({ ...emptyItem(), ...i }));
    setItems(tplItems.length ? tplItems : [emptyItem()]);
    if (tpl.defaultTerms) setForm((f) => ({ ...f, termsAndNotes: tpl.defaultTerms }));
    if (tpl.defaultTaxPercent) setForm((f) => ({ ...f, taxPercent: tpl.defaultTaxPercent }));
    if (tpl.defaultValidity) {
      const d = new Date();
      d.setDate(d.getDate() + tpl.defaultValidity);
      setForm((f) => ({ ...f, expiryDate: d.toISOString().split("T")[0] }));
    }
    if (!form.title && tpl.name) setForm((f) => ({ ...f, title: `عرض سعر - ${tpl.name}` }));
  };

  const updateItem = (idx: number, field: keyof ProposalItem, val: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = calcItem({ ...next[idx], [field]: val });
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) return (await apiRequest("PATCH", `/api/crm/proposals/${editingId}`, data)).json();
      return (await apiRequest("POST", "/api/crm/proposals", data)).json();
    },
    onSuccess: (proposal: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] });
      toast({ title: editingId ? "تم تحديث العرض" : "تم إنشاء العرض بنجاح" });
      setShowWizard(false);
      const newId = editingId || proposal.id;
      resetWizard();
      if (newId) setLocation(`/crm/proposals/${newId}/preview`);
    },
    onError: () => toast({ title: "حدث خطأ أثناء الحفظ", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm/proposals/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] }); toast({ title: "تم الحذف" }); },
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("POST", `/api/crm/proposals/${id}/send-email`, data).then((r) => r.json()),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] });
      setShowEmailDialog(false);
      toast({ title: "تم إرسال العرض" });
      if (data.link) { setShareLink(data.link); setShowShareDialog(true); }
    },
    onError: (e: any) => toast({ title: "خطأ في الإرسال", description: e.message, variant: "destructive" }),
  });

  const shareMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/crm/proposals/${id}/share-token`, {}).then((r) => r.json()),
    onSuccess: (data: any) => {
      setShareLink(data.link);
      setShowShareDialog(true);
      navigator.clipboard?.writeText(data.link).catch(() => {});
      toast({ title: "تم إنشاء رابط المشاركة" });
    },
    onError: () => toast({ title: "خطأ في إنشاء الرابط", variant: "destructive" }),
  });

  const handleSave = () => {
    const payload = {
      ...form, items,
      subtotal: subtotal.toFixed(2),
      discountValue: discount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      expiryDate: form.expiryDate ? new Date(form.expiryDate) : null,
    };
    saveMutation.mutate(payload);
  };

  const nextStep = () => {
    if (wizardStep === 1 && !form.title.trim()) {
      toast({ title: "يرجى إدخال عنوان العرض", variant: "destructive" });
      return;
    }
    if (wizardStep < 4) setWizardStep((s) => s + 1);
    else handleSave();
  };

  const prevStep = () => { if (wizardStep > 1) setWizardStep((s) => s - 1); };

  const selectedCompany = (companies as any[]).find((c) => c.id === form.companyId);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">عروض الأسعار</h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة وإنشاء عروض الأسعار الاحترافية</p>
        </div>
        <Button onClick={() => openWizard()} className="gap-2 bg-blue-600 hover:bg-blue-700" data-testid="btn-new-proposal">
          <Plus className="h-4 w-4" />
          عرض سعر جديد
        </Button>
      </div>

      {/* Stats */}
      {(proposals as any[]).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "الكل", count: (proposals as any[]).length },
            { label: "مرسلة / مشاهدة", count: (proposals as any[]).filter((p) => ["sent", "viewed"].includes(p.status)).length },
            { label: "مقبولة", count: (proposals as any[]).filter((p) => p.status === "accepted").length },
            { label: "مسودة", count: (proposals as any[]).filter((p) => p.status === "draft").length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (proposals as any[]).length === 0 ? (
          <div className="text-center py-20 px-4">
            <FileText className="h-14 w-14 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد عروض أسعار</h3>
            <p className="text-gray-500 mb-6">أنشئ أول عرض سعر احترافي لعملائك</p>
            <Button onClick={() => openWizard()} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> إنشاء أول عرض
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(proposals as any[]).map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/60 transition-colors" data-testid={`proposal-row-${p.id}`}>
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.proposalNumber} · {new Date(p.createdAt).toLocaleDateString("ar-SA")}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span className="font-bold text-gray-900">{parseFloat(p.total || "0").toLocaleString()} {p.currency || "SAR"}</span>
                  {p.expiryDate && <span className="text-xs text-gray-400">ينتهي: {new Date(p.expiryDate).toLocaleDateString("ar-SA")}</span>}
                </div>
                <Badge className={`hidden sm:flex text-xs ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[p.status] || p.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/crm/proposals/${p.id}/preview`}><Eye className="h-4 w-4 text-gray-400" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEmailProposal(p); setEmailForm({ to: "", subject: `عرض سعر: ${p.title}`, message: "" }); setShowEmailDialog(true); }}>
                    <Send className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shareMutation.mutate(p.id)}>
                    <Share2 className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openWizard(p)}>
                    <Edit className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (confirm("هل تريد حذف هذا العرض؟")) deleteMutation.mutate(p.id); }}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== WIZARD DIALOG ===== */}
      <Dialog open={showWizard} onOpenChange={(open) => { if (!open) { setShowWizard(false); resetWizard(); } }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0" dir="rtl">
          {/* Wizard Header / Steps */}
          <div className="bg-gradient-to-l from-blue-700 to-blue-900 text-white p-5 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "تعديل عرض السعر" : "إنشاء عرض سعر جديد"}</h2>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8" onClick={() => { setShowWizard(false); resetWizard(); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center">
              {WIZARD_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = step.id === wizardStep;
                const isDone = step.id < wizardStep;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <button
                      onClick={() => isDone && setWizardStep(step.id)}
                      className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive ? "opacity-100" : isDone ? "opacity-80 cursor-pointer" : "opacity-40"}`}
                    >
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-white text-blue-700 shadow-lg" : isDone ? "bg-blue-400 text-white" : "bg-white/20 text-white"}`}>
                        {isDone ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className="text-xs font-medium hidden sm:block">{step.label}</span>
                    </button>
                    {idx < WIZARD_STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 transition-all ${isDone ? "bg-blue-400" : "bg-white/20"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* STEP 1 */}
            {wizardStep === 1 && (
              <>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">عنوان العرض *</Label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="مثال: عرض سعر تطوير تطبيق جوال" data-testid="input-proposal-title" className="text-base" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الشركة / العميل</Label>
                    <Select value={form.companyId} onValueChange={(v) => setForm((f) => ({ ...f, companyId: v }))}>
                      <SelectTrigger data-testid="select-company"><SelectValue placeholder="اختر شركة..." /></SelectTrigger>
                      <SelectContent>{(companies as any[]).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">جهة الاتصال</Label>
                    <Select value={form.contactId} onValueChange={(v) => setForm((f) => ({ ...f, contactId: v }))}>
                      <SelectTrigger><SelectValue placeholder="اختر جهة اتصال..." /></SelectTrigger>
                      <SelectContent>
                        {(contacts as any[]).filter((c) => !form.companyId || c.companyId === form.companyId).map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">العملة</Label>
                    <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                        <SelectItem value="KWD">دينار كويتي (KWD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">تاريخ انتهاء الصلاحية</Label>
                    <Input type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">ملاحظات داخلية (لا تظهر للعميل)</Label>
                  <Textarea value={form.internalNotes} onChange={(e) => setForm((f) => ({ ...f, internalNotes: e.target.value }))} placeholder="ملاحظات للفريق الداخلي..." rows={2} />
                </div>
              </>
            )}

            {/* STEP 2 */}
            {wizardStep === 2 && (
              <>
                {(templates as any[]).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">اختر قالباً جاهزاً (اختياري)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(templates as any[]).map((t: any) => (
                        <button
                          key={t.id}
                          onClick={() => applyTemplate(t.id)}
                          className={`p-3 rounded-xl border-2 text-right transition-all ${selectedTemplate === t.id ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"}`}
                          data-testid={`template-card-${t.id}`}
                        >
                          <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{CATEGORY_LABELS[t.category] || t.category}</p>
                          {selectedTemplate === t.id && <CheckCircle className="h-4 w-4 text-blue-500 mt-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700">بنود العرض</Label>
                    <Button variant="outline" size="sm" onClick={addItem} className="gap-1 h-7 text-xs">
                      <Plus className="h-3 w-3" /> إضافة بند
                    </Button>
                  </div>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600 w-8">#</th>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">اسم البند والوصف</th>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600 w-20">الكمية</th>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600 w-28">سعر الوحدة</th>
                          <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600 w-28">الإجمالي</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-2 px-3 text-gray-400 text-xs">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <Input value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} placeholder="اسم الخدمة أو المنتج" className="h-8 mb-1 text-sm" data-testid={`input-item-title-${idx}`} />
                              <Input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="وصف مختصر (اختياري)" className="h-7 text-xs text-gray-500" />
                            </td>
                            <td className="py-2 px-3">
                              <Input value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="h-8 text-sm w-full" type="number" min="0" />
                            </td>
                            <td className="py-2 px-3">
                              <Input value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} className="h-8 text-sm w-full" type="number" min="0" />
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-gray-900 text-sm">{parseFloat(item.lineTotal || "0").toLocaleString()}</span>
                            </td>
                            <td className="py-2 px-2">
                              {items.length > 1 && (
                                <button onClick={() => removeItem(idx)} className="text-red-300 hover:text-red-500 transition-colors">
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {wizardStep === 3 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">نوع الخصم</Label>
                    <Select value={form.discountType} onValueChange={(v) => setForm((f) => ({ ...f, discountType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                        <SelectItem value="percent">نسبة مئوية %</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      قيمة الخصم {form.discountType === "percent" ? "(%)" : `(${form.currency})`}
                    </Label>
                    <Input type="number" min="0" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">نسبة الضريبة (%)</Label>
                    <Input type="number" min="0" max="100" value={form.taxPercent} onChange={(e) => setForm((f) => ({ ...f, taxPercent: e.target.value }))} />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">ملخص الأسعار</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">المجموع الفرعي</span><span className="font-medium">{subtotal.toLocaleString()} {form.currency}</span></div>
                    {discount > 0 && <div className="flex justify-between text-sm text-red-600"><span>الخصم</span><span>- {discount.toLocaleString()} {form.currency}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-gray-600">ضريبة القيمة المضافة ({form.taxPercent}%)</span><span>{taxAmount.toLocaleString()} {form.currency}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t-2 border-blue-200 pt-2 text-blue-700">
                      <span>الإجمالي النهائي</span>
                      <span>{total.toLocaleString()} {form.currency}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الشروط والملاحظات (تظهر في العرض)</Label>
                  <Textarea
                    value={form.termsAndNotes}
                    onChange={(e) => setForm((f) => ({ ...f, termsAndNotes: e.target.value }))}
                    placeholder={"• صلاحية العرض 14 يوماً\n• شروط الدفع\n• ملاحظات أخرى..."}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الحالة</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* STEP 4 */}
            {wizardStep === 4 && (
              <>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">العرض جاهز للحفظ</p>
                    <p className="text-sm text-green-700 mt-0.5">راجع الملخص أدناه ثم اضغط "حفظ وعرض"</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">عنوان العرض</p>
                    <p className="font-semibold text-gray-900">{form.title || "—"}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">العميل</p>
                    <p className="font-semibold text-gray-900">{selectedCompany?.name || "غير محدد"}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">عدد البنود</p>
                    <p className="font-semibold text-gray-900">{items.filter((i) => i.title).length} بنود</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-1">إجمالي العرض</p>
                    <p className="font-bold text-blue-700 text-lg">{total.toLocaleString()} {form.currency}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-700">البنود المُدرجة</p>
                  </div>
                  {items.filter((i) => i.title).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{parseFloat(item.lineTotal || "0").toLocaleString()} {form.currency}</p>
                    </div>
                  ))}
                  <div className="px-4 py-3 bg-blue-50 flex justify-between items-center">
                    <span className="font-bold text-gray-900">الإجمالي (شامل الضريبة)</span>
                    <span className="font-bold text-blue-700 text-lg">{total.toLocaleString()} {form.currency}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
            <Button variant="outline" onClick={prevStep} disabled={wizardStep === 1} className="gap-2">
              <ChevronRight className="h-4 w-4" /> السابق
            </Button>
            <span className="text-sm text-gray-500">خطوة {wizardStep} من {WIZARD_STEPS.length}</span>
            <Button onClick={nextStep} disabled={saveMutation.isPending} className="gap-2 bg-blue-600 hover:bg-blue-700" data-testid="btn-wizard-next">
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {wizardStep === 4 ? (editingId ? "حفظ التعديلات" : "حفظ وعرض") : "التالي"}
              {wizardStep < 4 && <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle className="text-right">إرسال العرض بالبريد الإلكتروني</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="mb-1.5 block text-sm">البريد الإلكتروني للمستلم</Label><Input value={emailForm.to} onChange={(e) => setEmailForm((f) => ({ ...f, to: e.target.value }))} placeholder="example@company.com" type="email" /></div>
            <div><Label className="mb-1.5 block text-sm">الموضوع</Label><Input value={emailForm.subject} onChange={(e) => setEmailForm((f) => ({ ...f, subject: e.target.value }))} /></div>
            <div><Label className="mb-1.5 block text-sm">رسالة مرافقة</Label><Textarea value={emailForm.message} onChange={(e) => setEmailForm((f) => ({ ...f, message: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>إلغاء</Button>
            <Button onClick={() => emailProposal && sendEmailMutation.mutate({ id: emailProposal.id, data: emailForm })} disabled={sendEmailMutation.isPending} className="gap-2 bg-blue-600 hover:bg-blue-700">
              {sendEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              إرسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Link Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader><DialogTitle className="text-right">رابط العرض للعميل</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">شارك هذا الرابط مع العميل ليتمكن من قبول أو رفض العرض:</p>
            <div className="flex gap-2">
              <Input value={shareLink || ""} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={() => { navigator.clipboard?.writeText(shareLink || ""); toast({ title: "تم النسخ" }); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
              <a href={shareLink || "#"} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /> معاينة كالعميل</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
