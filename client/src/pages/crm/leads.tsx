import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, Phone, Mail, Building2, Eye, Trash2, Edit, UserCheck } from "lucide-react";
import type { CrmLead } from "@shared/schema";

const STATUSES = [
  { value: "all", label: "كل الحالات" },
  { value: "new", label: "جديد" },
  { value: "attempting_contact", label: "محاولة تواصل" },
  { value: "contacted", label: "تم التواصل" },
  { value: "qualified", label: "مؤهل" },
  { value: "unqualified", label: "غير مؤهل" },
  { value: "proposal_sent", label: "تم إرسال عرض" },
  { value: "negotiation", label: "تفاوض" },
  { value: "converted", label: "تم التحويل" },
  { value: "lost", label: "خسارة" },
];

const PRIORITIES = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "urgent", label: "عاجل" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-orange-100 text-[#ff6a00] border-orange-200",
  attempting_contact: "bg-yellow-100 text-yellow-700 border-yellow-200",
  contacted: "bg-indigo-100 text-indigo-700 border-indigo-200",
  qualified: "bg-green-100 text-green-700 border-green-200",
  unqualified: "bg-gray-100 text-gray-600 border-gray-200",
  proposal_sent: "bg-orange-100 text-orange-700 border-orange-200",
  negotiation: "bg-purple-100 text-purple-700 border-purple-200",
  converted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function CrmLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);
  const [form, setForm] = useState({
    fullName: "", mobile: "", email: "", companyName: "", jobTitle: "",
    serviceInterested: "", estimatedBudget: "", sourceName: "", status: "new",
    priority: "medium", notes: "", country: "", city: "",
  });

  const { data: leads = [], isLoading } = useQuery<CrmLead[]>({
    queryKey: ["/api/crm/leads", statusFilter !== "all" ? statusFilter : undefined, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      return fetch(`/api/crm/leads?${params}`, { credentials: "include" }).then(r => r.json());
    },
  });

  const { data: sources = [] } = useQuery<any[]>({ queryKey: ["/api/crm/lead-sources"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/crm/leads", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      qc.invalidateQueries({ queryKey: ["/api/crm/dashboard"] });
      setShowForm(false);
      resetForm();
      toast({ title: "تم إضافة العميل المحتمل بنجاح" });
    },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/crm/leads/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      setShowForm(false);
      setEditingLead(null);
      resetForm();
      toast({ title: "تم تحديث العميل المحتمل" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/leads"] });
      qc.invalidateQueries({ queryKey: ["/api/crm/dashboard"] });
      toast({ title: "تم الحذف" });
    },
  });

  const resetForm = () => setForm({ fullName: "", mobile: "", email: "", companyName: "", jobTitle: "", serviceInterested: "", estimatedBudget: "", sourceName: "", status: "new", priority: "medium", notes: "", country: "", city: "" });

  const openEdit = (lead: CrmLead) => {
    setEditingLead(lead);
    setForm({
      fullName: lead.fullName, mobile: lead.mobile || "", email: lead.email || "",
      companyName: lead.companyName || "", jobTitle: lead.jobTitle || "",
      serviceInterested: lead.serviceInterested || "", estimatedBudget: lead.estimatedBudget || "",
      sourceName: lead.sourceName || "", status: lead.status, priority: lead.priority,
      notes: lead.notes || "", country: lead.country || "", city: lead.city || "",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.fullName) return toast({ title: "الاسم مطلوب", variant: "destructive" });
    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return l.fullName?.toLowerCase().includes(s) || l.email?.toLowerCase().includes(s) || l.mobile?.includes(s) || l.companyName?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العملاء المحتملون</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filteredLeads.length} عميل محتمل</p>
        </div>
        <Button onClick={() => { setEditingLead(null); resetForm(); setShowForm(true); }} data-testid="button-new-lead">
          <Plus className="h-4 w-4 ml-2" />
          إضافة عميل محتمل
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="بحث بالاسم، البريد، الهاتف..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" data-testid="input-search-leads" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44" data-testid="select-status-filter">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setStatusFilter(s.value)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${statusFilter === s.value ? "bg-[#ff6a00] text-white border-[#ff6a00]" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500">لا يوجد عملاء محتملون</p>
            <Button className="mt-4" onClick={() => { setEditingLead(null); resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة أول عميل
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right py-3 px-4 font-medium text-gray-600">العميل</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الشركة / الخدمة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">المصدر</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الأولوية</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">التاريخ</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors" data-testid={`lead-row-${lead.id}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {lead.fullName?.[0] || "؟"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.fullName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lead.mobile && <span className="text-xs text-gray-400 flex items-center gap-1"><Phone className="h-3 w-3" />{lead.mobile}</span>}
                          {lead.email && <span className="text-xs text-gray-400 flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      {lead.companyName && <p className="text-gray-700 flex items-center gap-1"><Building2 className="h-3 w-3 text-gray-400" />{lead.companyName}</p>}
                      {lead.serviceInterested && <p className="text-xs text-gray-400 mt-0.5">{lead.serviceInterested}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-600">{lead.sourceName || "—"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[lead.priority] || ""}`}>
                      {PRIORITIES.find(p => p.value === lead.priority)?.label || lead.priority}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[lead.status] || ""}`}>
                      {STATUSES.find(s => s.value === lead.status)?.label || lead.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" asChild data-testid={`button-view-lead-${lead.id}`}>
                        <Link href={`/crm/leads/${lead.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(lead)} data-testid={`button-edit-lead-${lead.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => { if (confirm("هل أنت متأكد من الحذف؟")) deleteMutation.mutate(lead.id); }} data-testid={`button-delete-lead-${lead.id}`}>
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

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={o => { setShowForm(o); if (!o) { setEditingLead(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingLead ? "تعديل العميل المحتمل" : "إضافة عميل محتمل جديد"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>الاسم الكامل *</Label>
              <Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="اسم العميل" data-testid="input-lead-name" />
            </div>
            <div>
              <Label>الجوال</Label>
              <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="+966..." data-testid="input-lead-mobile" />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="email@example.com" data-testid="input-lead-email" />
            </div>
            <div>
              <Label>الشركة</Label>
              <Input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="اسم الشركة" data-testid="input-lead-company" />
            </div>
            <div>
              <Label>المسمى الوظيفي</Label>
              <Input value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} placeholder="المسمى الوظيفي" />
            </div>
            <div>
              <Label>الخدمة المطلوبة</Label>
              <Input value={form.serviceInterested} onChange={e => setForm(f => ({ ...f, serviceInterested: e.target.value }))} placeholder="تطوير موقع، تطبيق..." data-testid="input-lead-service" />
            </div>
            <div>
              <Label>الميزانية المتوقعة</Label>
              <Input value={form.estimatedBudget} onChange={e => setForm(f => ({ ...f, estimatedBudget: e.target.value }))} placeholder="5000 - 10000 ريال" />
            </div>
            <div>
              <Label>المصدر</Label>
              <Select value={form.sourceName} onValueChange={v => setForm(f => ({ ...f, sourceName: v }))}>
                <SelectTrigger data-testid="select-lead-source">
                  <SelectValue placeholder="اختر المصدر" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الدولة</Label>
              <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="المملكة العربية السعودية" />
            </div>
            <div>
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger data-testid="select-lead-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.slice(1).map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الأولوية</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية..." rows={3} data-testid="textarea-lead-notes" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingLead(null); resetForm(); }}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-lead">
              {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
