import { useState, useEffect, useRef } from "react";
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
  CreditCard, ClipboardCheck, Copy, X, BookOpen, Copy as CopyIcon,
  AlertTriangle, Bell, Star, Library, Search, SlidersHorizontal,
  CalendarClock, Layers, Info,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", pending_approval: "بانتظار الموافقة", approved: "معتمد",
  sent: "مرسل", viewed: "تمت المشاهدة", revised: "معدّل",
  accepted: "مقبول", rejected: "مرفوض", expired: "منتهي الصلاحية",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700", sent: "bg-indigo-100 text-indigo-700",
  viewed: "bg-purple-100 text-purple-700", revised: "bg-orange-100 text-orange-700",
  accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700",
  expired: "bg-rose-100 text-rose-700",
};
const CATEGORY_LABELS: Record<string, string> = {
  "mobile-app": "تطبيق جوال", "web-platform": "موقع ويب",
  erp: "نظام ERP", marketing: "تسويق", general: "عام",
};
const UNIT_LABELS: Record<string, string> = {
  item: "وحدة", hr: "ساعة", day: "يوم", month: "شهر", page: "صفحة",
};
const APPROVAL_DISCOUNT_THRESHOLD = 20; // % discount that triggers approval workflow

const WIZARD_STEPS = [
  { id: 1, label: "بيانات العميل", icon: Building2 },
  { id: 2, label: "القالب والبنود", icon: Package },
  { id: 3, label: "الأسعار والشروط", icon: CreditCard },
  { id: 4, label: "المراجعة والإرسال", icon: ClipboardCheck },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProposalItem {
  id?: string; title: string; description: string;
  quantity: string; unitPrice: string; lineTotal: string;
  sectionName?: string; isOptional?: boolean;
}
interface PaymentMilestone { label: string; percent: string; dueDate?: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyItem = (): ProposalItem => ({ title: "", description: "", quantity: "1", unitPrice: "0", lineTotal: "0", isOptional: false });

function calcItem(item: ProposalItem): ProposalItem {
  const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
  return { ...item, lineTotal: total.toFixed(2) };
}

function calcTotals(items: ProposalItem[], discountType: string, discountValue: string, taxPercent: string) {
  const requiredItems = items.filter(i => !i.isOptional);
  const subtotal = requiredItems.reduce((s, i) => s + parseFloat(i.lineTotal || "0"), 0);
  const optionalTotal = items.filter(i => i.isOptional).reduce((s, i) => s + parseFloat(i.lineTotal || "0"), 0);
  const discV = parseFloat(discountValue) || 0;
  const discount = discountType === "percent" ? (subtotal * discV) / 100 : discV;
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxP = parseFloat(taxPercent) || 0;
  const taxAmount = (afterDiscount * taxP) / 100;
  const total = afterDiscount + taxAmount;
  const discountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;
  return { subtotal, discount, discountPercent, taxAmount, total, optionalTotal };
}

function applyTemplateVariables(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
  }
  return result;
}

const LS_KEY = "proposal_wizard_draft";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CrmProposals() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();

  // Wizard open/step
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Wizard form
  const [form, setForm] = useState({
    title: "", companyId: "", contactId: "", dealId: "",
    currency: "SAR", discountType: "fixed", discountValue: "0",
    taxPercent: "15", termsAndNotes: "", status: "draft",
    expiryDate: "", internalNotes: "",
  });
  const [items, setItems] = useState<ProposalItem[]>([emptyItem()]);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentMilestone[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templatePreview, setTemplatePreview] = useState<any>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Email / Share dialogs
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailProposal, setEmailProposal] = useState<any>(null);
  const [emailForm, setEmailForm] = useState({ to: "", subject: "", message: "" });
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // ─── Queries ───────────────────────────────────────────────────────────────
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
  const { data: serviceLibraryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/service-library"],
    queryFn: () => apiRequest("GET", "/api/crm/service-library").then(r => r.json()),
  });

  // ─── Auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showWizard) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (!editingId) {
        localStorage.setItem(LS_KEY, JSON.stringify({ form, items, paymentSchedule, wizardStep, savedAt: new Date().toISOString() }));
      }
    }, 2000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [form, items, paymentSchedule, showWizard, editingId]);

  // ─── Calculations ──────────────────────────────────────────────────────────
  const { subtotal, discount, discountPercent, taxAmount, total, optionalTotal } = calcTotals(items, form.discountType, form.discountValue, form.taxPercent);
  const needsApproval = form.discountType === "percent"
    ? parseFloat(form.discountValue) > APPROVAL_DISCOUNT_THRESHOLD
    : discountPercent > APPROVAL_DISCOUNT_THRESHOLD;

  // ─── Expiry alerts ─────────────────────────────────────────────────────────
  const expiringProposals = (proposals as any[]).filter(p => {
    if (!p.expiryDate || ["accepted", "rejected", "expired"].includes(p.status)) return false;
    const days = (new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
  });

  // ─── Wizard helpers ────────────────────────────────────────────────────────
  const resetWizard = () => {
    setForm({ title: "", companyId: "", contactId: "", dealId: "", currency: "SAR", discountType: "fixed", discountValue: "0", taxPercent: "15", termsAndNotes: "", status: "draft", expiryDate: "", internalNotes: "" });
    setItems([emptyItem()]); setPaymentSchedule([]); setSelectedTemplate(""); setWizardStep(1); setEditingId(null);
  };

  const openWizard = (proposal?: any) => {
    if (proposal) {
      setEditingId(proposal.id);
      setForm({ title: proposal.title || "", companyId: proposal.companyId || "", contactId: proposal.contactId || "", dealId: proposal.dealId || "", currency: proposal.currency || "SAR", discountType: proposal.discountType || "fixed", discountValue: proposal.discountValue || "0", taxPercent: proposal.taxPercent || "15", termsAndNotes: proposal.termsAndNotes || "", status: proposal.status || "draft", expiryDate: proposal.expiryDate ? proposal.expiryDate.split("T")[0] : "", internalNotes: proposal.internalNotes || "" });
      setItems((proposal.items || []).map((i: any) => calcItem(i)));
      setPaymentSchedule(proposal.paymentSchedule || []);
    } else {
      // Restore auto-saved draft
      const draft = localStorage.getItem(LS_KEY);
      if (draft) {
        try {
          const saved = JSON.parse(draft);
          const savedAge = (Date.now() - new Date(saved.savedAt).getTime()) / 1000 / 60;
          if (savedAge < 60) {
            setForm(saved.form); setItems(saved.items); setPaymentSchedule(saved.paymentSchedule || []);
            setWizardStep(saved.wizardStep || 1);
            toast({ title: "تم استعادة المسودة المحفوظة تلقائياً" });
            setShowWizard(true); return;
          }
        } catch { }
      }
      resetWizard();
    }
    setShowWizard(true);
  };

  const applyTemplate = (tpl: any, force = false) => {
    if (!force) { setTemplatePreview(tpl); return; }
    setTemplatePreview(null);
    setSelectedTemplate(tpl.id);

    const company = (companies as any[]).find(c => c.id === form.companyId);
    const vars: Record<string, string> = {
      company_name: company?.name || "اسم العميل",
      date: new Date().toLocaleDateString("ar-SA"),
      validity_days: String(tpl.defaultValidity || 14),
    };

    const tplItems = (tpl.items || []).map((i: any) => calcItem({ ...emptyItem(), ...i }));
    setItems(tplItems.length ? tplItems : [emptyItem()]);
    if (tpl.defaultTerms) setForm(f => ({ ...f, termsAndNotes: applyTemplateVariables(tpl.defaultTerms, vars) }));
    if (tpl.defaultTaxPercent) setForm(f => ({ ...f, taxPercent: tpl.defaultTaxPercent }));
    if (tpl.defaultValidity) {
      const d = new Date(); d.setDate(d.getDate() + tpl.defaultValidity);
      setForm(f => ({ ...f, expiryDate: d.toISOString().split("T")[0] }));
    }
    if (!form.title && tpl.name) {
      const company = (companies as any[]).find(c => c.id === form.companyId);
      setForm(f => ({ ...f, title: applyTemplateVariables(`عرض سعر - ${tpl.name}${company ? ` - ${company.name}` : ""}`, vars) }));
    }
    setPaymentSchedule([]);
    toast({ title: `تم تطبيق قالب: ${tpl.name}` });
  };

  const addFromLibrary = (libItem: any) => {
    const newItem = calcItem({ ...emptyItem(), title: libItem.title, description: libItem.description || "", unitPrice: String(parseFloat(libItem.unitPrice || "0")) });
    setItems(prev => [...prev, newItem]);
    toast({ title: `تمت إضافة: ${libItem.title}` });
  };

  const updateItem = (idx: number, field: keyof ProposalItem, val: any) => {
    setItems(prev => { const next = [...prev]; next[idx] = calcItem({ ...next[idx], [field]: val }); return next; });
  };
  const addItem = (sectionName?: string) => setItems(prev => [...prev, { ...emptyItem(), sectionName: sectionName || "" }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const addPaymentMilestone = () => setPaymentSchedule(prev => [...prev, { label: "", percent: "", dueDate: "" }]);
  const updateMilestone = (idx: number, field: keyof PaymentMilestone, val: string) => {
    setPaymentSchedule(prev => { const n = [...prev]; n[idx] = { ...n[idx], [field]: val }; return n; });
  };
  const removeMilestone = (idx: number) => setPaymentSchedule(prev => prev.filter((_, i) => i !== idx));

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) return (await apiRequest("PATCH", `/api/crm/proposals/${editingId}`, data)).json();
      return (await apiRequest("POST", "/api/crm/proposals", data)).json();
    },
    onSuccess: (proposal: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] });
      localStorage.removeItem(LS_KEY);
      const newId = editingId || proposal.id;
      if (needsApproval) toast({ title: "⚠️ تم إرسال العرض للموافقة بسبب نسبة الخصم المرتفعة", description: "يحتاج العرض اعتماد المدير قبل الإرسال للعميل" });
      else toast({ title: editingId ? "تم تحديث العرض" : "تم إنشاء العرض بنجاح" });
      setShowWizard(false); resetWizard();
      if (newId) setLocation(`/crm/proposals/${newId}/preview`);
    },
    onError: () => toast({ title: "حدث خطأ أثناء الحفظ", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm/proposals/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] }); toast({ title: "تم الحذف" }); },
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/crm/proposals/${id}/clone`, {}).then(r => r.json()),
    onSuccess: (cloned: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] });
      toast({ title: "تم إنشاء نسخة من العرض" });
      setLocation(`/crm/proposals/${cloned.id}/preview`);
    },
    onError: () => toast({ title: "خطأ في النسخ", variant: "destructive" }),
  });

  const shareMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/crm/proposals/${id}/share-token`, {}).then(r => r.json()),
    onSuccess: (data: any) => { setShareLink(data.link); setShowShareDialog(true); navigator.clipboard?.writeText(data.link).catch(() => {}); toast({ title: "تم إنشاء رابط المشاركة" }); },
    onError: () => toast({ title: "خطأ في إنشاء الرابط", variant: "destructive" }),
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("POST", `/api/crm/proposals/${id}/send-email`, data).then(r => r.json()),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] });
      setShowEmailDialog(false); toast({ title: "تم إرسال العرض" });
      if (data.link) { setShareLink(data.link); setShowShareDialog(true); }
    },
    onError: (e: any) => toast({ title: "خطأ في الإرسال", description: e.message, variant: "destructive" }),
  });

  const handleSave = () => {
    const finalStatus = needsApproval && form.status === "draft" ? "pending_approval" : form.status;
    const payload = {
      ...form, status: finalStatus, items,
      paymentSchedule: paymentSchedule.filter(m => m.label),
      subtotal: subtotal.toFixed(2), discountValue: discount.toFixed(2),
      taxAmount: taxAmount.toFixed(2), total: total.toFixed(2),
      expiryDate: form.expiryDate || null,
    };
    saveMutation.mutate(payload);
  };

  const nextStep = () => {
    if (wizardStep === 1 && !form.title.trim()) { toast({ title: "يرجى إدخال عنوان العرض", variant: "destructive" }); return; }
    if (wizardStep < 4) setWizardStep(s => s + 1);
    else handleSave();
  };
  const prevStep = () => { if (wizardStep > 1) setWizardStep(s => s - 1); };

  const selectedCompany = (companies as any[]).find(c => c.id === form.companyId);
  const filteredLibrary = (serviceLibraryItems as any[]).filter(item =>
    !librarySearch || item.title.includes(librarySearch) || (item.description || "").includes(librarySearch)
  );

  // ─── Sections helper ───────────────────────────────────────────────────────
  const allSections = Array.from(new Set(items.map(i => i.sectionName || "").filter(Boolean)));

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5" dir="rtl">
      {/* Expiry Alert Banner */}
      {expiringProposals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3" data-testid="expiry-alert">
          <Bell className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {expiringProposals.length === 1 ? "عرض سعر" : `${expiringProposals.length} عروض أسعار`} تنتهي صلاحيتها خلال 7 أيام
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {expiringProposals.map(p => {
                const days = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return <span key={p.id} className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{p.title} ({days === 0 ? "اليوم" : `${days} أيام`})</span>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">عروض الأسعار</h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة وإنشاء عروض الأسعار الاحترافية</p>
        </div>
        <Button onClick={() => openWizard()} className="gap-2 bg-blue-600 hover:bg-blue-700" data-testid="btn-new-proposal">
          <Plus className="h-4 w-4" /> عرض سعر جديد
        </Button>
      </div>

      {/* Stats */}
      {(proposals as any[]).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "الكل", count: (proposals as any[]).length, color: "blue" },
            { label: "مسودة", count: (proposals as any[]).filter(p => p.status === "draft").length, color: "gray" },
            { label: "بانتظار موافقة", count: (proposals as any[]).filter(p => p.status === "pending_approval").length, color: "amber" },
            { label: "مرسلة / مشاهدة", count: (proposals as any[]).filter(p => ["sent", "viewed"].includes(p.status)).length, color: "indigo" },
            { label: "مقبولة", count: (proposals as any[]).filter(p => p.status === "accepted").length, color: "green" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
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
            {(proposals as any[]).map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors" data-testid={`proposal-row-${p.id}`}>
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{p.proposalNumber}</span>
                    {p.viewCount > 0 && (
                      <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" data-testid={`view-count-${p.id}`}>
                        <Eye className="h-2.5 w-2.5" /> {p.viewCount}
                      </span>
                    )}
                    {p.clientSignature && (
                      <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">✍️ موقّع</span>
                    )}
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end gap-1">
                  <span className="font-bold text-gray-900 text-sm">{parseFloat(p.total || "0").toLocaleString()} {p.currency || "SAR"}</span>
                  {p.expiryDate && <span className={`text-xs ${new Date(p.expiryDate) < new Date() ? "text-red-400" : "text-gray-400"}`}>ينتهي: {new Date(p.expiryDate).toLocaleDateString("ar-SA")}</span>}
                </div>
                <Badge className={`hidden sm:flex text-xs ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[p.status] || p.status}
                </Badge>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="معاينة">
                    <Link href={`/crm/proposals/${p.id}/preview`}><Eye className="h-3.5 w-3.5 text-gray-400" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="إرسال بريد" onClick={() => { setEmailProposal(p); setEmailForm({ to: "", subject: `عرض سعر: ${p.title}`, message: "" }); setShowEmailDialog(true); }}>
                    <Send className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="رابط مشاركة" onClick={() => shareMutation.mutate(p.id)}>
                    <Share2 className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="نسخ العرض" onClick={() => { if (confirm("إنشاء نسخة من هذا العرض؟")) cloneMutation.mutate(p.id); }} data-testid={`btn-clone-${p.id}`}>
                    <CopyIcon className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="تعديل" onClick={() => openWizard(p)}>
                    <Edit className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="حذف" onClick={() => { if (confirm("هل تريد حذف هذا العرض؟")) deleteMutation.mutate(p.id); }}>
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════ WIZARD DIALOG ═══════════════════ */}
      <Dialog open={showWizard} onOpenChange={open => { if (!open) { setShowWizard(false); } }}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0" dir="rtl">
          {/* Header / Steps */}
          <div className="bg-gradient-to-l from-blue-700 to-blue-900 text-white p-5 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{editingId ? "تعديل عرض السعر" : "إنشاء عرض سعر جديد"}</h2>
                {!editingId && <p className="text-xs text-blue-200 mt-0.5">يحفظ تلقائياً كل 2 ثانية</p>}
              </div>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8" onClick={() => setShowWizard(false)}>
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
                    <button onClick={() => isDone && setWizardStep(step.id)} className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive ? "opacity-100" : isDone ? "opacity-80 cursor-pointer" : "opacity-40"}`}>
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-white text-blue-700 shadow-lg" : isDone ? "bg-blue-400 text-white" : "bg-white/20 text-white"}`}>
                        {isDone ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className="text-xs font-medium hidden sm:block">{step.label}</span>
                    </button>
                    {idx < WIZARD_STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${isDone ? "bg-blue-400" : "bg-white/20"}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Approval Warning */}
          {needsApproval && wizardStep >= 3 && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                الخصم ({form.discountType === "percent" ? `${form.discountValue}%` : `${parseFloat(form.discountValue).toLocaleString()} ${form.currency}`}) يتجاوز الحد المسموح ({APPROVAL_DISCOUNT_THRESHOLD}%). سيتم إرسال العرض للموافقة الداخلية أولاً.
              </p>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* ── STEP 1: Client Info ──────────────────────────────── */}
            {wizardStep === 1 && (
              <>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">عنوان العرض *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="مثال: عرض سعر تطوير تطبيق جوال - شركة الأمل" data-testid="input-proposal-title" className="text-base" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الشركة / العميل</Label>
                    <Select value={form.companyId} onValueChange={v => setForm(f => ({ ...f, companyId: v, contactId: "" }))}>
                      <SelectTrigger data-testid="select-company"><SelectValue placeholder="اختر شركة..." /></SelectTrigger>
                      <SelectContent>{(companies as any[]).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">جهة الاتصال</Label>
                    <Select value={form.contactId} onValueChange={v => setForm(f => ({ ...f, contactId: v }))}>
                      <SelectTrigger><SelectValue placeholder="اختر جهة اتصال..." /></SelectTrigger>
                      <SelectContent>
                        {(contacts as any[]).filter(c => !form.companyId || c.companyId === form.companyId).map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">العملة</Label>
                    <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
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
                    <Input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">ملاحظات داخلية (لا تظهر للعميل)</Label>
                  <Textarea value={form.internalNotes} onChange={e => setForm(f => ({ ...f, internalNotes: e.target.value }))} placeholder="ملاحظات للفريق الداخلي..." rows={2} />
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">يمكن استخدام متغيرات ديناميكية في القوالب مثل <code className="bg-blue-100 px-1 rounded">{"{{company_name}}"}</code>، <code className="bg-blue-100 px-1 rounded">{"{{date}}"}</code>، <code className="bg-blue-100 px-1 rounded">{"{{validity_days}}"}</code> — تُملأ تلقائياً عند تطبيق القالب.</p>
                </div>
              </>
            )}

            {/* ── STEP 2: Template & Items ──────────────────────────── */}
            {wizardStep === 2 && (
              <>
                {/* Templates */}
                {(templates as any[]).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">اختر قالباً جاهزاً (اختياري)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(templates as any[]).map(t => (
                        <button
                          key={t.id}
                          onClick={() => applyTemplate(t)}
                          className={`p-3 rounded-xl border-2 text-right transition-all ${selectedTemplate === t.id ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"}`}
                          data-testid={`template-card-${t.id}`}
                        >
                          <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{CATEGORY_LABELS[t.category] || t.category}</p>
                          <p className="text-xs text-blue-600 mt-1">{(t.items || []).length} بنود</p>
                          {selectedTemplate === t.id && <CheckCircle className="h-4 w-4 text-blue-500 mt-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <Label className="text-sm font-medium text-gray-700">بنود العرض</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowLibrary(true)} className="gap-1 h-7 text-xs" data-testid="btn-library">
                        <Library className="h-3 w-3" /> مكتبة الخدمات
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addItem()} className="gap-1 h-7 text-xs">
                        <Plus className="h-3 w-3" /> إضافة بند
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 w-7">#</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">البند والوصف</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 w-20">الكمية</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 w-28">سعر الوحدة</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 w-28">الإجمالي</th>
                          <th className="w-16 py-2 px-2 text-center text-xs text-gray-600">خيارات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.map((item, idx) => (
                          <tr key={idx} className={`hover:bg-gray-50/50 ${item.isOptional ? "bg-amber-50/30" : ""}`}>
                            <td className="py-1.5 px-3 text-gray-400 text-xs">{idx + 1}</td>
                            <td className="py-1.5 px-3">
                              <Input value={item.title} onChange={e => updateItem(idx, "title", e.target.value)} placeholder="اسم الخدمة" className="h-7 mb-1 text-xs" data-testid={`input-item-title-${idx}`} />
                              <Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="وصف (اختياري)" className="h-6 text-xs text-gray-500" />
                              <Input value={item.sectionName || ""} onChange={e => updateItem(idx, "sectionName", e.target.value)} placeholder="القسم (مثال: مرحلة التصميم)" className="h-6 text-xs text-gray-400 mt-0.5 border-dashed" />
                            </td>
                            <td className="py-1.5 px-3"><Input value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} className="h-7 text-xs w-full" type="number" min="0" /></td>
                            <td className="py-1.5 px-3"><Input value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", e.target.value)} className="h-7 text-xs w-full" type="number" min="0" /></td>
                            <td className="py-1.5 px-3">
                              <span className={`font-semibold text-xs ${item.isOptional ? "text-amber-600" : "text-gray-900"}`}>
                                {parseFloat(item.lineTotal || "0").toLocaleString()}
                                {item.isOptional && <span className="text-xs text-amber-500 block">اختياري</span>}
                              </span>
                            </td>
                            <td className="py-1.5 px-2">
                              <div className="flex items-center gap-1 justify-center">
                                <button
                                  onClick={() => updateItem(idx, "isOptional", !item.isOptional)}
                                  className={`text-xs px-1.5 py-0.5 rounded transition-colors ${item.isOptional ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-600"}`}
                                  title="بند اختياري"
                                >opt</button>
                                {items.length > 1 && <button onClick={() => removeItem(idx)} className="text-red-300 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {items.some(i => i.isOptional) && (
                    <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      البنود الاختيارية لا تُحتسب في الإجمالي — تُعرض للعميل كخيارات إضافية
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ── STEP 3: Pricing & Terms ───────────────────────────── */}
            {wizardStep === 3 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">نوع الخصم</Label>
                    <Select value={form.discountType} onValueChange={v => setForm(f => ({ ...f, discountType: v }))}>
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
                    <Input type="number" min="0" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">نسبة الضريبة (%)</Label>
                    <Input type="number" min="0" max="100" value={form.taxPercent} onChange={e => setForm(f => ({ ...f, taxPercent: e.target.value }))} />
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">ملخص الأسعار</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">المجموع الفرعي (إلزامي)</span><span className="font-medium">{subtotal.toLocaleString()} {form.currency}</span></div>
                    {optionalTotal > 0 && <div className="flex justify-between text-sm text-amber-600"><span>البنود الاختيارية (غير محتسبة)</span><span>{optionalTotal.toLocaleString()} {form.currency}</span></div>}
                    {discount > 0 && <div className="flex justify-between text-sm text-red-600"><span>الخصم {form.discountType === "percent" ? `(${form.discountValue}%)` : ""}</span><span>- {discount.toLocaleString()} {form.currency}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-gray-600">ضريبة القيمة المضافة ({form.taxPercent}%)</span><span>{taxAmount.toLocaleString()} {form.currency}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t-2 border-blue-200 pt-2 text-blue-700">
                      <span>الإجمالي النهائي</span><span>{total.toLocaleString()} {form.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Schedule */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <CalendarClock className="h-4 w-4 text-blue-500" /> جدول الدفعات
                    </Label>
                    <Button variant="outline" size="sm" onClick={addPaymentMilestone} className="gap-1 h-7 text-xs">
                      <Plus className="h-3 w-3" /> إضافة دفعة
                    </Button>
                  </div>
                  {paymentSchedule.length === 0 ? (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 text-center">لا يوجد جدول دفعات — يمكنك إضافة دفعات (مقدم، عند التسليم، إلخ)</p>
                  ) : (
                    <div className="space-y-2">
                      {paymentSchedule.map((m, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-gray-50 rounded-xl p-2">
                          <Input value={m.label} onChange={e => updateMilestone(idx, "label", e.target.value)} placeholder="اسم الدفعة (مثال: دفعة مقدم)" className="h-7 text-xs flex-1" />
                          <Input value={m.percent} onChange={e => updateMilestone(idx, "percent", e.target.value)} placeholder="%" className="h-7 text-xs w-16" type="number" min="0" max="100" />
                          <Input value={m.dueDate || ""} onChange={e => updateMilestone(idx, "dueDate", e.target.value)} type="date" className="h-7 text-xs w-36" />
                          <span className="text-xs font-semibold text-gray-700 w-24 text-center">
                            {((parseFloat(m.percent) || 0) * total / 100).toLocaleString()} {form.currency}
                          </span>
                          <button onClick={() => removeMilestone(idx)} className="text-red-300 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                      {paymentSchedule.reduce((s, m) => s + (parseFloat(m.percent) || 0), 0) !== 100 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          مجموع النسب: {paymentSchedule.reduce((s, m) => s + (parseFloat(m.percent) || 0), 0)}% (يجب أن يكون 100%)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الشروط والملاحظات (تظهر في العرض)</Label>
                  <Textarea value={form.termsAndNotes} onChange={e => setForm(f => ({ ...f, termsAndNotes: e.target.value }))} placeholder={"• صلاحية العرض 14 يوماً\n• شروط الدفع\n• ملاحظات أخرى..."} rows={5} className="font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الحالة</Label>
                  <Select value={needsApproval ? "pending_approval" : form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* ── STEP 4: Review ─────────────────────────────────────── */}
            {wizardStep === 4 && (
              <>
                <div className={`rounded-xl p-4 border flex items-start gap-3 ${needsApproval ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100"}`}>
                  {needsApproval ? <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" /> : <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className={`font-semibold ${needsApproval ? "text-amber-800" : "text-green-800"}`}>
                      {needsApproval ? "العرض يحتاج موافقة داخلية" : "العرض جاهز للحفظ"}
                    </p>
                    <p className={`text-sm mt-0.5 ${needsApproval ? "text-amber-700" : "text-green-700"}`}>
                      {needsApproval ? "سيتم حفظ العرض بحالة 'بانتظار الموافقة' بسبب نسبة الخصم المرتفعة" : "راجع الملخص أدناه ثم اضغط حفظ وعرض"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "عنوان العرض", value: form.title || "—" },
                    { label: "العميل", value: selectedCompany?.name || "غير محدد" },
                    { label: "عدد البنود", value: `${items.filter(i => i.title && !i.isOptional).length} إلزامي · ${items.filter(i => i.isOptional && i.title).length} اختياري` },
                    { label: "إجمالي العرض", value: `${total.toLocaleString()} ${form.currency}`, highlight: true },
                    { label: "الخصم", value: discount > 0 ? `- ${discount.toLocaleString()} ${form.currency}` : "لا يوجد" },
                    { label: "الدفعات", value: paymentSchedule.length > 0 ? `${paymentSchedule.length} دفعات` : "غير محدد" },
                  ].map(card => (
                    <div key={card.label} className={`rounded-xl border p-3 ${card.highlight ? "bg-blue-50 border-blue-100" : "bg-white border-gray-100"}`}>
                      <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
                      <p className={`font-semibold text-sm ${card.highlight ? "text-blue-700" : "text-gray-900"}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Items summary */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-700">البنود المُدرجة</p>
                  </div>
                  {items.filter(i => i.title).map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center px-4 py-2.5 border-b border-gray-50 last:border-0 ${item.isOptional ? "bg-amber-50/40" : ""}`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title} {item.isOptional && <span className="text-xs text-amber-500 mr-1">(اختياري)</span>}</p>
                        {item.sectionName && <p className="text-xs text-blue-500">{item.sectionName}</p>}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{parseFloat(item.lineTotal || "0").toLocaleString()} {form.currency}</p>
                    </div>
                  ))}
                  <div className="px-4 py-3 bg-blue-50 flex justify-between items-center">
                    <span className="font-bold text-gray-900">الإجمالي (شامل الضريبة)</span>
                    <span className="font-bold text-blue-700 text-lg">{total.toLocaleString()} {form.currency}</span>
                  </div>
                </div>

                {/* Payment schedule summary */}
                {paymentSchedule.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-700">جدول الدفعات</p>
                    </div>
                    {paymentSchedule.filter(m => m.label).map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-50 last:border-0">
                        <p className="text-sm text-gray-900">{m.label} {m.dueDate && <span className="text-xs text-gray-400 mr-1">{new Date(m.dueDate).toLocaleDateString("ar-SA")}</span>}</p>
                        <p className="text-sm font-semibold text-gray-900">{m.percent}% = {((parseFloat(m.percent) || 0) * total / 100).toLocaleString()} {form.currency}</p>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* ═══════════════════ TEMPLATE PREVIEW ═══════════════════ */}
      <Dialog open={!!templatePreview} onOpenChange={open => !open && setTemplatePreview(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle className="text-right">معاينة القالب: {templatePreview?.name}</DialogTitle></DialogHeader>
          {templatePreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-0.5">الفئة</p><p className="font-medium">{CATEGORY_LABELS[templatePreview.category] || templatePreview.category}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-0.5">صلاحية افتراضية</p><p className="font-medium">{templatePreview.defaultValidity} يوم</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-0.5">الضريبة</p><p className="font-medium">{templatePreview.defaultTaxPercent}%</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-0.5">عدد البنود</p><p className="font-medium">{(templatePreview.items || []).length} بنود</p></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">البنود الجاهزة:</p>
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 overflow-hidden">
                  {(templatePreview.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between px-3 py-2">
                      <div><p className="text-sm font-medium text-gray-900">{item.title}</p>{item.description && <p className="text-xs text-gray-400">{item.description}</p>}</div>
                      <p className="text-sm font-semibold text-gray-900">{parseFloat(item.unitPrice || "0").toLocaleString()} ريال</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 font-bold">الإجمالي التقريبي: {(templatePreview.items || []).reduce((s: number, i: any) => s + parseFloat(i.unitPrice || "0") * parseFloat(i.quantity || "1"), 0).toLocaleString()} ريال (قبل الضريبة)</p>
              </div>
              {templatePreview.defaultTerms && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">الشروط الافتراضية:</p>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap leading-relaxed">{templatePreview.defaultTerms}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTemplatePreview(null)}>إلغاء</Button>
            <Button onClick={() => applyTemplate(templatePreview, true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <CheckCircle className="h-4 w-4" /> تطبيق هذا القالب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ SERVICE LIBRARY MODAL ═══════════════════ */}
      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="text-right flex items-center gap-2"><Library className="h-5 w-5 text-blue-600" /> مكتبة الخدمات الجاهزة</DialogTitle></DialogHeader>
          <div className="flex-shrink-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={librarySearch} onChange={e => setLibrarySearch(e.target.value)} placeholder="ابحث في الخدمات..." className="pr-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredLibrary.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => { addFromLibrary(item); }}
                  className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-right transition-all flex items-center gap-3 group"
                  data-testid={`library-item-${item.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.title}</p>
                    {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-sm font-bold text-blue-700">{parseFloat(item.unitPrice || "0").toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{UNIT_LABELS[item.unit] || item.unit}</p>
                  </div>
                  <Plus className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </button>
              ))}
              {filteredLibrary.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8 col-span-2">لا توجد خدمات مطابقة</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLibrary(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ EMAIL DIALOG ═══════════════════ */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle className="text-right">إرسال العرض بالبريد الإلكتروني</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="mb-1.5 block text-sm">البريد الإلكتروني للمستلم</Label><Input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))} placeholder="example@company.com" type="email" /></div>
            <div><Label className="mb-1.5 block text-sm">الموضوع</Label><Input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} /></div>
            <div><Label className="mb-1.5 block text-sm">رسالة مرافقة</Label><Textarea value={emailForm.message} onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))} rows={3} /></div>
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

      {/* ═══════════════════ SHARE LINK ═══════════════════ */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader><DialogTitle className="text-right">رابط العرض للعميل</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">شارك هذا الرابط مع العميل ليتمكن من مشاهدة العرض والتوقيع عليه رقمياً:</p>
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
