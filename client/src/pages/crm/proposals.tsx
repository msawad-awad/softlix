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
import { Plus, FileText, Trash2, Edit, Eye, DollarSign, Calendar, Send, Share2, Loader2 } from "lucide-react";
import AttachmentsPanel from "@/components/crm/attachments-panel";

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

interface ProposalItem { title: string; description: string; quantity: string; unitPrice: string; lineTotal: string; }

const emptyItem = (): ProposalItem => ({ title: "", description: "", quantity: "1", unitPrice: "0", lineTotal: "0" });

function calcItem(item: ProposalItem): ProposalItem {
  const qt = parseFloat(item.quantity) || 0;
  const up = parseFloat(item.unitPrice) || 0;
  return { ...item, lineTotal: (qt * up).toFixed(2) };
}

export default function CrmProposals() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<any>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailProposal, setEmailProposal] = useState<any>(null);
  const [emailForm, setEmailForm] = useState({ to: "", subject: "", message: "" });
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", status: "draft", currency: "SAR",
    discountValue: "0", taxPercent: "15", termsAndNotes: "",
  });
  const [items, setItems] = useState<ProposalItem[]>([emptyItem()]);

  const { data: proposals = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/crm/proposals"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/crm/proposals", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] }); setShowForm(false); resetForm(); toast({ title: "تم إنشاء العرض" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/crm/proposals/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] }); setShowForm(false); setEditingProposal(null); resetForm(); toast({ title: "تم التحديث" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm/proposals/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] }); toast({ title: "تم الحذف" }); },
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("POST", `/api/crm/proposals/${id}/send-email`, data),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] });
      setShowEmailDialog(false);
      setEmailForm({ to: "", subject: "", message: "" });
      toast({ title: "تم إرسال العرض بالبريد الإلكتروني" });
      if (data.link) setShareLink(data.link);
    },
    onError: (e: any) => toast({ title: "خطأ في الإرسال", description: e.message, variant: "destructive" }),
  });

  const shareMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/crm/proposals/${id}/share-token`, {}),
    onSuccess: (data: any) => {
      setShareLink(data.link);
      navigator.clipboard?.writeText(data.link).catch(() => {});
      toast({ title: "تم نسخ الرابط", description: "رابط صالح لمدة 30 يوماً" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const resetForm = () => { setForm({ title: "", status: "draft", currency: "SAR", discountValue: "0", taxPercent: "15", termsAndNotes: "" }); setItems([emptyItem()]); };

  const openEdit = async (proposal: any) => {
    setEditingProposal(proposal);
    setForm({ title: proposal.title, status: proposal.status, currency: proposal.currency || "SAR", discountValue: proposal.discountValue || "0", taxPercent: proposal.taxPercent || "15", termsAndNotes: proposal.termsAndNotes || "" });
    const res = await fetch(`/api/crm/proposals/${proposal.id}`, { credentials: "include" });
    const data = await res.json();
    setItems(data.items?.length ? data.items.map((i: any) => ({ title: i.title, description: i.description || "", quantity: i.quantity || "1", unitPrice: i.unitPrice || "0", lineTotal: i.lineTotal || "0" })) : [emptyItem()]);
    setShowForm(true);
  };

  const updateItem = (index: number, field: keyof ProposalItem, value: string) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = calcItem({ ...updated[index], [field]: value });
      return updated;
    });
  };

  const subtotal = items.reduce((s, i) => s + parseFloat(i.lineTotal || "0"), 0);
  const discount = parseFloat(form.discountValue) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * (parseFloat(form.taxPercent) / 100);
  const total = taxable + tax;

  const handleSubmit = () => {
    if (!form.title) return toast({ title: "العنوان مطلوب", variant: "destructive" });
    const payload = { ...form, subtotal: subtotal.toFixed(2), taxAmount: tax.toFixed(2), total: total.toFixed(2), items };
    if (editingProposal) updateMutation.mutate({ id: editingProposal.id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">عروض الأسعار</h1>
          <p className="text-sm text-gray-500 mt-0.5">{proposals.length} عرض</p>
        </div>
        <Button onClick={() => { setEditingProposal(null); resetForm(); setShowForm(true); }} data-testid="button-new-proposal">
          <Plus className="h-4 w-4 ml-2" />
          عرض سعر جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["draft", "sent", "accepted", "rejected"].map(status => {
          const count = proposals.filter(p => p.status === status).length;
          return (
            <div key={status} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500">{STATUS_LABELS[status]}</p>
              <p className="text-2xl font-bold mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : proposals.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500">لا توجد عروض أسعار بعد</p>
            <Button className="mt-4" onClick={() => { setEditingProposal(null); resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء أول عرض
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right py-3 px-4 font-medium text-gray-600">رقم العرض</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">العنوان</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الإجمالي</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">التاريخ</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposals.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/50" data-testid={`proposal-row-${p.id}`}>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{p.proposalNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{p.title}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-green-600">
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{parseFloat(p.total || "0").toLocaleString()} {p.currency}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[p.status] || ""}`}>
                      {STATUS_LABELS[p.status] || p.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(p.createdAt).toLocaleDateString("ar-SA")}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" asChild data-testid={`button-preview-proposal-${p.id}`}>
                        <Link href={`/crm/proposals/${p.id}/preview`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => shareMutation.mutate(p.id)} disabled={shareMutation.isPending} title="نسخ رابط مشاركة">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEmailProposal(p); setEmailForm({ to: "", subject: `عرض سعر: ${p.title}`, message: "" }); setShowEmailDialog(true); }} title="إرسال بالبريد" data-testid={`button-email-proposal-${p.id}`}>
                        <Send className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)} data-testid={`button-edit-proposal-${p.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm("حذف العرض؟")) deleteMutation.mutate(p.id); }} data-testid={`button-delete-proposal-${p.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Dialog - Proposal Builder */}
      <Dialog open={showForm} onOpenChange={o => { setShowForm(o); if (!o) { setEditingProposal(null); resetForm(); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingProposal ? "تعديل عرض السعر" : "إنشاء عرض سعر جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            {/* Header info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <Label>عنوان العرض *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان عرض السعر" data-testid="input-proposal-title" />
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger data-testid="select-proposal-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>العملة</Label>
                <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                    <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نسبة الضريبة (%)</Label>
                <Input value={form.taxPercent} onChange={e => setForm(f => ({ ...f, taxPercent: e.target.value }))} type="number" data-testid="input-proposal-tax" />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">بنود العرض</Label>
                <Button variant="outline" size="sm" onClick={() => setItems(prev => [...prev, emptyItem()])} data-testid="button-add-item">
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة بند
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">البند</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600 w-20">الكمية</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600 w-32">سعر الوحدة</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600 w-32">الإجمالي</th>
                      <th className="py-2 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2 px-3">
                          <Input value={item.title} onChange={e => updateItem(index, "title", e.target.value)} placeholder="وصف البند" className="h-8 mb-1" data-testid={`input-item-title-${index}`} />
                          <Input value={item.description} onChange={e => updateItem(index, "description", e.target.value)} placeholder="تفاصيل إضافية" className="h-7 text-xs text-gray-500" />
                        </td>
                        <td className="py-2 px-3">
                          <Input value={item.quantity} onChange={e => updateItem(index, "quantity", e.target.value)} type="number" className="h-8 w-20" data-testid={`input-item-qty-${index}`} />
                        </td>
                        <td className="py-2 px-3">
                          <Input value={item.unitPrice} onChange={e => updateItem(index, "unitPrice", e.target.value)} type="number" className="h-8 w-32" data-testid={`input-item-price-${index}`} />
                        </td>
                        <td className="py-2 px-3 font-medium text-green-600">
                          {parseFloat(item.lineTotal).toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <button onClick={() => setItems(prev => prev.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600 p-1 rounded">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">المجموع الفرعي</span>
                  <span className="font-medium">{subtotal.toLocaleString()} {form.currency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">الخصم</span>
                  <Input value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} type="number" className="h-7 w-28 text-left" data-testid="input-proposal-discount" />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ضريبة القيمة المضافة ({form.taxPercent}%)</span>
                  <span className="font-medium">{tax.toFixed(2)} {form.currency}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <span>الإجمالي</span>
                  <span className="text-green-600">{total.toLocaleString()} {form.currency}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div>
              <Label>الشروط والملاحظات</Label>
              <Textarea value={form.termsAndNotes} onChange={e => setForm(f => ({ ...f, termsAndNotes: e.target.value }))} placeholder="شروط الدفع، مدة التنفيذ، ملاحظات..." rows={4} data-testid="textarea-proposal-terms" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingProposal(null); resetForm(); }}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-proposal">
              {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ العرض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Send Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              إرسال العرض بالبريد الإلكتروني
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>البريد الإلكتروني للمستلم *</Label>
              <Input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))} placeholder="client@example.com" type="email" data-testid="input-proposal-email-to" />
            </div>
            <div>
              <Label>الموضوع</Label>
              <Input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} data-testid="input-proposal-email-subject" />
            </div>
            <div>
              <Label>رسالة إضافية (اختياري)</Label>
              <Textarea value={emailForm.message} onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))} placeholder="نص مخصص يظهر في البريد..." rows={3} data-testid="textarea-proposal-email-message" />
            </div>
            {shareLink && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                <p className="text-xs text-green-700 font-medium mb-1">✅ تم إنشاء رابط مشاركة العميل:</p>
                <p className="text-xs text-green-600 break-all">{shareLink}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>إلغاء</Button>
            <Button onClick={() => sendEmailMutation.mutate({ id: emailProposal?.id, data: emailForm })} disabled={!emailForm.to || sendEmailMutation.isPending} data-testid="button-confirm-send-email">
              {sendEmailMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري الإرسال...</> : <><Send className="h-4 w-4 ml-2" />إرسال</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
