import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Plus, Search, FileText, Trash2, Edit, Eye, Copy, Send, CheckCircle,
  Download, Share2, DollarSign, TrendingUp, Clock, XCircle, Printer
} from "lucide-react";
import type { Invoice } from "@shared/schema";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", sent: "مرسلة", viewed: "تم المشاهدة",
  paid: "مدفوعة", overdue: "متأخرة", cancelled: "ملغاة",
};
const STATUS_COLORS: Record<string, string> = {
  draft:     "bg-gray-100 text-gray-700 border-gray-200",
  sent:      "bg-blue-100 text-blue-700 border-blue-200",
  viewed:    "bg-purple-100 text-purple-700 border-purple-200",
  paid:      "bg-green-100 text-green-700 border-green-200",
  overdue:   "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};
const STATUS_ICONS: Record<string, any> = {
  draft: Clock, sent: Send, viewed: Eye,
  paid: CheckCircle, overdue: XCircle, cancelled: XCircle,
};

const TAX_RATES = ["0", "5", "10", "15"];
const CURRENCIES = ["SAR", "USD", "AED", "EUR", "GBP", "KWD", "QAR"];
const CURRENCY_SYMBOLS: Record<string, string> = {
  SAR: "ريال", USD: "USD", AED: "AED", EUR: "EUR", GBP: "GBP", KWD: "KWD", QAR: "QAR",
};

type InvoiceItem = {
  id: string; title: string; description: string;
  quantity: string; unitPrice: string; total: number;
};

function calcTotals(items: InvoiceItem[], taxPercent: string, discountAmount: string) {
  const subtotal = items.reduce((s, i) => s + parseFloat(i.unitPrice || "0") * parseFloat(i.quantity || "1"), 0);
  const tax = (subtotal * parseFloat(taxPercent || "0")) / 100;
  const discount = parseFloat(discountAmount || "0");
  return { subtotal, taxAmount: tax, discountAmount: discount, total: subtotal + tax - discount };
}

const EMPTY_ITEM = (): InvoiceItem => ({
  id: Math.random().toString(36).slice(2), title: "", description: "",
  quantity: "1", unitPrice: "", total: 0,
});

const defaultForm = () => ({
  invoiceNumber: "", clientName: "", clientEmail: "", clientPhone: "",
  clientAddress: "", status: "draft" as string,
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  taxPercent: "15", discountAmount: "0", currency: "SAR",
  notes: "", terms: "يسعدنا التعامل معكم، نرجو إتمام الدفع قبل تاريخ الاستحقاق المذكور أعلاه.",
  items: [EMPTY_ITEM()] as InvoiceItem[],
});

export default function CrmInvoices() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewInv, setPreviewInv] = useState<Invoice | null>(null);
  const [form, setForm] = useState(defaultForm());
  const printRef = useRef<HTMLDivElement>(null);

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/crm/invoices", statusFilter, search],
    queryFn: () => {
      const p = new URLSearchParams();
      if (statusFilter !== "all") p.set("status", statusFilter);
      if (search) p.set("search", search);
      return fetch(`/api/crm/invoices?${p}`, { credentials: "include" }).then(r => r.json());
    },
  });

  const { data: nextNum } = useQuery<{ invoiceNumber: string }>({
    queryKey: ["/api/crm/invoices/next-number"],
    enabled: showForm && !editingId,
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/crm/invoices", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/invoices"] });
      qc.invalidateQueries({ queryKey: ["/api/crm/invoices/next-number"] });
      toast({ title: "تم إنشاء الفاتورة بنجاح ✓" });
      setShowForm(false); setEditingId(null);
    },
    onError: () => toast({ title: "خطأ في إنشاء الفاتورة", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/crm/invoices/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/invoices"] });
      toast({ title: "تم تحديث الفاتورة بنجاح ✓" });
      setShowForm(false); setEditingId(null);
    },
    onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm/invoices/${id}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/invoices"] });
      toast({ title: "تم حذف الفاتورة" });
    },
  });

  const markPaidMut = useMutation({
    mutationFn: ({ id, paidAmount }: { id: string; paidAmount: string }) =>
      apiRequest("PATCH", `/api/crm/invoices/${id}`, { status: "paid", paidAmount, paidAt: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/invoices"] });
      toast({ title: "تم تسجيل الدفع ✓" });
    },
  });

  const openNew = () => {
    const f = defaultForm();
    if (nextNum?.invoiceNumber) f.invoiceNumber = nextNum.invoiceNumber;
    setForm(f); setEditingId(null); setShowForm(true);
  };

  const openEdit = (inv: Invoice) => {
    setForm({
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail || "",
      clientPhone: inv.clientPhone || "",
      clientAddress: inv.clientAddress || "",
      status: inv.status,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      taxPercent: String(inv.taxPercent || "15"),
      discountAmount: String(inv.discountAmount || "0"),
      currency: inv.currency || "SAR",
      notes: inv.notes || "",
      terms: inv.terms || "",
      items: ((inv.items as any[]) || []).map((i: any) => ({
        id: i.id || Math.random().toString(36).slice(2),
        title: i.title || "", description: i.description || "",
        quantity: String(i.quantity || "1"), unitPrice: String(i.unitPrice || ""),
        total: parseFloat(i.unitPrice || "0") * parseFloat(i.quantity || "1"),
      })),
    });
    setEditingId(inv.id); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.clientName.trim()) return toast({ title: "اسم العميل مطلوب", variant: "destructive" });
    if (!form.invoiceNumber.trim()) return toast({ title: "رقم الفاتورة مطلوب", variant: "destructive" });
    const totals = calcTotals(form.items, form.taxPercent, form.discountAmount);
    const payload = {
      ...form,
      ...totals,
      subtotal: totals.subtotal.toFixed(2),
      taxAmount: totals.taxAmount.toFixed(2),
      discountAmount: totals.discountAmount.toFixed(2),
      total: totals.total.toFixed(2),
      items: form.items.map(i => ({
        ...i,
        quantity: parseFloat(i.quantity || "1"),
        unitPrice: parseFloat(i.unitPrice || "0"),
        total: parseFloat(i.unitPrice || "0") * parseFloat(i.quantity || "1"),
      })),
    };
    if (editingId) updateMut.mutate({ id: editingId, data: payload });
    else createMut.mutate(payload);
  };

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html dir="rtl"><head><title>فاتورة</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
      <style>*{font-family:Cairo,sans-serif;box-sizing:border-box}body{margin:0;padding:24px;color:#1a1a1a}
      table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:right}
      th{background:#f5f5f5;font-weight:700}tr:nth-child(even){background:#fafafa}
      .total-row{font-weight:700;font-size:1.1em}
      @media print{body{padding:0}}</style></head>
      <body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const setItem = (idx: number, field: keyof InvoiceItem, value: string) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      items[idx].total = parseFloat(items[idx].unitPrice || "0") * parseFloat(items[idx].quantity || "1");
      return { ...f, items };
    });
  };

  const totals = calcTotals(form.items, form.taxPercent, form.discountAmount);
  const sym = CURRENCY_SYMBOLS[form.currency] || form.currency;

  // KPI summary
  const paid = invoices.filter(i => i.status === "paid");
  const totalRevenue = paid.reduce((s, i) => s + parseFloat(i.total || "0"), 0);
  const pending = invoices.filter(i => ["sent", "viewed"].includes(i.status));
  const pendingAmount = pending.reduce((s, i) => s + parseFloat(i.total || "0"), 0);
  const overdue = invoices.filter(i => i.status === "overdue");

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white" data-testid="heading-invoices">الفواتير</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة وتتبع فواتير العملاء والمدفوعات</p>
        </div>
        <Button onClick={openNew} className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white gap-2" data-testid="button-new-invoice">
          <Plus className="h-4 w-4" /> فاتورة جديدة
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-green-600 font-medium">إجمالي الإيرادات</p>
                <p className="text-xl font-black text-green-700">{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-500">من {paid.length} فاتورة مدفوعة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800"><Send className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-xs text-blue-600 font-medium">قيد الانتظار</p>
                <p className="text-xl font-black text-blue-700">{pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-blue-500">{pending.length} فاتورة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-800"><XCircle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-xs text-red-600 font-medium">متأخرة</p>
                <p className="text-xl font-black text-red-700">{overdue.length}</p>
                <p className="text-xs text-red-500">فاتورة تجاوزت الموعد</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-800"><FileText className="h-5 w-5 text-[#ff6a00]" /></div>
              <div>
                <p className="text-xs text-[#ff6a00] font-medium">إجمالي الفواتير</p>
                <p className="text-xl font-black text-[#ff6a00]">{invoices.length}</p>
                <p className="text-xs text-orange-400">جميع الحالات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم العميل..." className="pr-9" data-testid="input-search-invoices" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400">جاري التحميل...</div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا توجد فواتير بعد</p>
            <p className="text-gray-400 text-sm mb-4">أنشئ أول فاتورة لبدء تتبع مدفوعاتك</p>
            <Button onClick={openNew} className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white gap-2">
              <Plus className="h-4 w-4" /> فاتورة جديدة
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">العميل</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">تاريخ الإصدار</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">تاريخ الاستحقاق</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">المجموع</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {invoices.map(inv => {
                  const StatusIcon = STATUS_ICONS[inv.status] || FileText;
                  const isOverdue = inv.status !== "paid" && inv.status !== "cancelled" && new Date(inv.dueDate) < new Date();
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" data-testid={`row-invoice-${inv.id}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-[#ff6a00]">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{inv.clientName}</p>
                        {inv.clientEmail && <p className="text-xs text-gray-400">{inv.clientEmail}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{inv.issueDate}</td>
                      <td className="px-4 py-3">
                        <span className={isOverdue && inv.status !== "paid" ? "text-red-600 font-semibold" : "text-gray-600 dark:text-gray-300"}>
                          {inv.dueDate}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {parseFloat(inv.total || "0").toLocaleString()} {CURRENCY_SYMBOLS[inv.currency] || inv.currency}
                        </span>
                        {parseFloat(inv.paidAmount || "0") > 0 && parseFloat(inv.paidAmount || "0") < parseFloat(inv.total || "0") && (
                          <p className="text-xs text-green-600">دُفع: {parseFloat(inv.paidAmount || "0").toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${STATUS_COLORS[inv.status]} border gap-1 text-xs`}>
                          <StatusIcon size={11} />
                          {STATUS_LABELS[inv.status] || inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPreviewInv(inv)} data-testid={`button-preview-${inv.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(inv)} data-testid={`button-edit-${inv.id}`}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          {inv.status !== "paid" && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" title="تسجيل دفع"
                              onClick={() => markPaidMut.mutate({ id: inv.id, paidAmount: inv.total || "0" })}
                              data-testid={`button-mark-paid-${inv.id}`}>
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600"
                            onClick={() => { if (confirm("حذف هذه الفاتورة؟")) deleteMut.mutate(inv.id); }}
                            data-testid={`button-delete-${inv.id}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════ CREATE / EDIT FORM ═══════════════════ */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) { setShowForm(false); setEditingId(null); } }}>
        <DialogContent dir="rtl" className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>{editingId ? "تعديل الفاتورة" : "فاتورة جديدة"}</DialogTitle>
            <DialogDescription className="sr-only">نموذج إنشاء أو تعديل فاتورة</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {/* Header info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">رقم الفاتورة *</Label>
                <Input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                  placeholder="INV-2026-001" className="mt-1 font-mono" data-testid="input-invoice-number" />
              </div>
              <div>
                <Label className="text-xs font-semibold">تاريخ الإصدار</Label>
                <Input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">تاريخ الاستحقاق</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">العملة</Label>
                <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">بيانات العميل</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">اسم العميل *</Label>
                  <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                    placeholder="اسم الشركة أو العميل" className="mt-1" data-testid="input-client-name" />
                </div>
                <div>
                  <Label className="text-xs">رقم الجوال</Label>
                  <Input value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                    placeholder="+966 5X XXX XXXX" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">البريد الإلكتروني</Label>
                  <Input type="email" value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                    placeholder="email@example.com" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">العنوان</Label>
                  <Input value={form.clientAddress} onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))}
                    placeholder="المدينة، المملكة العربية السعودية" className="mt-1" />
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">البنود والخدمات</p>
                <Button size="sm" variant="outline" className="gap-1 text-xs h-7"
                  onClick={() => setForm(f => ({ ...f, items: [...f.items, EMPTY_ITEM()] }))}>
                  <Plus className="h-3 w-3" /> إضافة بند
                </Button>
              </div>
              <div className="border dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300 w-2/5">الخدمة / المنتج</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300 w-16">الكمية</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">سعر الوحدة</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">الإجمالي</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {form.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="px-2 py-1.5">
                          <Input value={item.title} onChange={e => setItem(idx, "title", e.target.value)}
                            placeholder="اسم الخدمة أو المنتج" className="h-8 text-xs border-0 bg-transparent focus:bg-white dark:focus:bg-gray-700 px-2" />
                          <Input value={item.description} onChange={e => setItem(idx, "description", e.target.value)}
                            placeholder="وصف مختصر (اختياري)" className="h-7 text-[10px] border-0 bg-transparent text-gray-400 px-2 mt-0.5" />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input type="number" min="1" value={item.quantity} onChange={e => setItem(idx, "quantity", e.target.value)}
                            className="h-8 text-xs w-14 text-center border-gray-200" />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input type="number" min="0" value={item.unitPrice} onChange={e => setItem(idx, "unitPrice", e.target.value)}
                            placeholder="0" className="h-8 text-xs w-28 text-left border-gray-200" />
                        </td>
                        <td className="px-2 py-1.5 font-semibold text-gray-800 dark:text-gray-200">
                          {item.total.toLocaleString()}
                        </td>
                        <td className="px-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600"
                            onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold">الضريبة (%)</Label>
                  <Select value={form.taxPercent} onValueChange={v => setForm(f => ({ ...f, taxPercent: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TAX_RATES.map(r => <SelectItem key={r} value={r}>{r}%</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">الخصم ({sym})</Label>
                  <Input type="number" min="0" value={form.discountAmount}
                    onChange={e => setForm(f => ({ ...f, discountAmount: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">المجموع الجزئي</span><span className="font-medium">{totals.subtotal.toLocaleString()} {sym}</span></div>
                {parseFloat(form.taxPercent) > 0 && <div className="flex justify-between"><span className="text-gray-500">الضريبة {form.taxPercent}%</span><span>{totals.taxAmount.toLocaleString()} {sym}</span></div>}
                {totals.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>الخصم</span><span>- {totals.discountAmount.toLocaleString()} {sym}</span></div>}
                <Separator />
                <div className="flex justify-between text-base font-black"><span>الإجمالي الكلي</span><span className="text-[#ff6a00]">{totals.total.toLocaleString()} {sym}</span></div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">ملاحظات</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="ملاحظات إضافية للعميل..." rows={3} className="mt-1 text-sm resize-none" />
              </div>
              <div>
                <Label className="text-xs font-semibold">الشروط والأحكام</Label>
                <Textarea value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
                  placeholder="شروط الدفع والتسليم..." rows={3} className="mt-1 text-sm resize-none" />
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}
              className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white gap-2" data-testid="button-save-invoice">
              <CheckCircle className="h-4 w-4" />
              {editingId ? "حفظ التعديلات" : "إنشاء الفاتورة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ PREVIEW DIALOG ═══════════════════ */}
      <Dialog open={!!previewInv} onOpenChange={open => !open && setPreviewInv(null)}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-3 border-b shrink-0 flex-row items-center justify-between">
            <DialogTitle className="text-base">معاينة الفاتورة: {previewInv?.invoiceNumber}</DialogTitle>
            <Button size="sm" variant="outline" className="gap-1 ml-2" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" /> طباعة
            </Button>
          </DialogHeader>
          {previewInv && (
            <div className="flex-1 overflow-y-auto p-6">
              <div ref={printRef} className="space-y-6 font-sans">
                {/* Invoice Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-black text-[#ff6a00]">فاتورة</h1>
                    <p className="font-mono text-lg font-semibold text-gray-700 mt-1">{previewInv.invoiceNumber}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600 space-y-1">
                    <p><span className="font-semibold">تاريخ الإصدار:</span> {previewInv.issueDate}</p>
                    <p><span className="font-semibold">تاريخ الاستحقاق:</span> {previewInv.dueDate}</p>
                    <Badge className={`${STATUS_COLORS[previewInv.status]} border mt-1`}>{STATUS_LABELS[previewInv.status]}</Badge>
                  </div>
                </div>

                {/* Client Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">فاتورة إلى:</p>
                  <p className="font-bold text-gray-900">{previewInv.clientName}</p>
                  {previewInv.clientEmail && <p className="text-sm text-gray-600">{previewInv.clientEmail}</p>}
                  {previewInv.clientPhone && <p className="text-sm text-gray-600">{previewInv.clientPhone}</p>}
                  {previewInv.clientAddress && <p className="text-sm text-gray-600">{previewInv.clientAddress}</p>}
                </div>

                {/* Items Table */}
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 text-right font-semibold">الخدمة</th>
                      <th className="py-2 px-3 text-center font-semibold w-16">الكمية</th>
                      <th className="py-2 px-3 text-left font-semibold">سعر الوحدة</th>
                      <th className="py-2 px-3 text-left font-semibold">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((previewInv.items as any[]) || []).map((item: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 px-3">
                          <p className="font-medium">{item.title}</p>
                          {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                        </td>
                        <td className="py-2 px-3 text-center">{item.quantity}</td>
                        <td className="py-2 px-3 text-left">{parseFloat(item.unitPrice || "0").toLocaleString()}</td>
                        <td className="py-2 px-3 text-left font-semibold">{(parseFloat(item.unitPrice || "0") * parseFloat(item.quantity || "1")).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">المجموع الجزئي:</span><span>{parseFloat(previewInv.subtotal || "0").toLocaleString()}</span></div>
                    {parseFloat(previewInv.taxPercent || "0") > 0 && (
                      <div className="flex justify-between"><span className="text-gray-500">الضريبة {previewInv.taxPercent}%:</span><span>{parseFloat(previewInv.taxAmount || "0").toLocaleString()}</span></div>
                    )}
                    {parseFloat(previewInv.discountAmount || "0") > 0 && (
                      <div className="flex justify-between text-green-600"><span>الخصم:</span><span>- {parseFloat(previewInv.discountAmount || "0").toLocaleString()}</span></div>
                    )}
                    <div className="border-t pt-1.5 flex justify-between font-black text-base">
                      <span>الإجمالي:</span>
                      <span className="text-[#ff6a00]">{parseFloat(previewInv.total || "0").toLocaleString()} {CURRENCY_SYMBOLS[previewInv.currency] || previewInv.currency}</span>
                    </div>
                    {parseFloat(previewInv.paidAmount || "0") > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>المبلغ المدفوع:</span><span>{parseFloat(previewInv.paidAmount || "0").toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes & Terms */}
                {(previewInv.notes || previewInv.terms) && (
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 border-t pt-4">
                    {previewInv.notes && <div><p className="font-bold mb-1">ملاحظات:</p><p>{previewInv.notes}</p></div>}
                    {previewInv.terms && <div><p className="font-bold mb-1">الشروط والأحكام:</p><p>{previewInv.terms}</p></div>}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
