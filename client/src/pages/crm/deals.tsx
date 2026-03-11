import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, LayoutGrid, List, DollarSign, TrendingUp, Trash2, Edit, Zap } from "lucide-react";

const STATUS_LABELS: Record<string, string> = { open: "مفتوحة", won: "رابحة", lost: "خاسرة", archived: "مؤرشفة" };
const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
  archived: "bg-gray-100 text-gray-600",
};

export default function CrmDeals() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [selectedPipeline, setSelectedPipeline] = useState("all");
  const [form, setForm] = useState({ title: "", pipelineId: "", stageId: "", estimatedValue: "", serviceType: "", description: "", status: "open" });

  const { data: pipelines = [] } = useQuery<any[]>({ queryKey: ["/api/crm/pipelines"] });
  const { data: allStages = [] } = useQuery<any[]>({ queryKey: ["/api/crm/stages"] });
  const { data: deals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/crm/deals", selectedPipeline !== "all" ? selectedPipeline : undefined],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedPipeline !== "all") params.set("pipelineId", selectedPipeline);
      return fetch(`/api/crm/deals?${params}`, { credentials: "include" }).then(r => r.json());
    },
  });

  const setupMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/crm/setup", {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/pipelines"] });
      qc.invalidateQueries({ queryKey: ["/api/crm/stages"] });
      toast({ title: "تم إعداد CRM بنجاح" });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/crm/deals", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      qc.invalidateQueries({ queryKey: ["/api/crm/dashboard"] });
      setShowForm(false);
      resetForm();
      toast({ title: "تم إنشاء الصفقة" });
    },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/crm/deals/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      setShowForm(false);
      setEditingDeal(null);
      resetForm();
      toast({ title: "تم التحديث" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm/deals/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      toast({ title: "تم الحذف" });
    },
  });

  const moveStage = (dealId: string, stageId: string) => {
    const stage = allStages.find(s => s.id === stageId);
    const extraData: any = { stageId };
    if (stage?.isWon) extraData.status = "won";
    else if (stage?.isLost) extraData.status = "lost";
    updateMutation.mutate({ id: dealId, data: extraData });
  };

  const resetForm = () => setForm({ title: "", pipelineId: "", stageId: "", estimatedValue: "", serviceType: "", description: "", status: "open" });

  const openEdit = (deal: any) => {
    setEditingDeal(deal);
    setForm({ title: deal.title, pipelineId: deal.pipelineId, stageId: deal.stageId, estimatedValue: deal.estimatedValue || "", serviceType: deal.serviceType || "", description: deal.description || "", status: deal.status });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.pipelineId || !form.stageId) return toast({ title: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
    if (editingDeal) updateMutation.mutate({ id: editingDeal.id, data: form });
    else createMutation.mutate(form);
  };

  const stagesForPipeline = (pipelineId: string) => allStages.filter(s => s.pipelineId === pipelineId).sort((a, b) => a.displayOrder - b.displayOrder);
  const dealsForStage = (stageId: string) => deals.filter(d => d.stageId === stageId);

  const activePipeline = selectedPipeline !== "all" ? pipelines.find(p => p.id === selectedPipeline) : (pipelines[0] || null);
  const displayPipelineId = selectedPipeline !== "all" ? selectedPipeline : activePipeline?.id;
  const displayStages = displayPipelineId ? stagesForPipeline(displayPipelineId) : [];

  const totalValue = deals.filter(d => d.status === "open").reduce((s, d) => s + parseFloat(d.estimatedValue || "0"), 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الصفقات</h1>
          <p className="text-sm text-gray-500 mt-0.5">{deals.filter(d => d.status === "open").length} صفقة مفتوحة · {totalValue.toLocaleString()} ريال</p>
        </div>
        <div className="flex gap-2">
          {pipelines.length === 0 && (
            <Button variant="outline" size="sm" onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending} data-testid="button-crm-setup-deals">
              <Zap className="h-4 w-4 ml-2" />
              {setupMutation.isPending ? "جاري..." : "إعداد Pipeline"}
            </Button>
          )}
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setView("kanban")} className={`px-3 py-1.5 text-sm transition-colors ${view === "kanban" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`} data-testid="button-view-kanban">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("table")} className={`px-3 py-1.5 text-sm transition-colors ${view === "table" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`} data-testid="button-view-table">
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => { setEditingDeal(null); resetForm(); setShowForm(true); }} data-testid="button-new-deal">
            <Plus className="h-4 w-4 ml-2" />
            صفقة جديدة
          </Button>
        </div>
      </div>

      {/* Pipeline selector */}
      {pipelines.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSelectedPipeline("all")}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all ${selectedPipeline === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
            كل الصفقات
          </button>
          {pipelines.map((p: any) => (
            <button key={p.id} onClick={() => setSelectedPipeline(p.id)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-all ${selectedPipeline === p.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">جاري التحميل...</div>
      ) : pipelines.length === 0 ? (
        <div className="text-center py-20">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">لا يوجد Pipeline بعد</h3>
          <p className="text-gray-500 mb-4">ابدأ بإعداد خط المبيعات الخاص بك</p>
          <Button onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending}>
            <Zap className="h-4 w-4 ml-2" />
            إعداد CRM الآن
          </Button>
        </div>
      ) : view === "kanban" ? (
        /* Kanban View */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {displayStages.map((stage: any) => {
              const stageDeals = dealsForStage(stage.id);
              const stageValue = stageDeals.reduce((s, d) => s + parseFloat(d.estimatedValue || "0"), 0);
              return (
                <div key={stage.id} className="w-64 flex-shrink-0" data-testid={`kanban-stage-${stage.id}`}>
                  <div className="rounded-t-lg p-3 border-b-2" style={{ borderColor: stage.color || "#6366f1", backgroundColor: (stage.color || "#6366f1") + "15" }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-gray-800">{stage.name}</h3>
                      <Badge variant="secondary" className="text-xs">{stageDeals.length}</Badge>
                    </div>
                    {stageValue > 0 && <p className="text-xs text-gray-500 mt-0.5">{stageValue.toLocaleString()} ريال</p>}
                  </div>
                  <div className="bg-gray-50 rounded-b-lg p-2 space-y-2 min-h-32">
                    {stageDeals.map((deal: any) => (
                      <div key={deal.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer group hover:shadow-md transition-shadow" data-testid={`deal-card-${deal.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm text-gray-900 leading-tight">{deal.title}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(deal)} className="p-0.5 rounded hover:bg-gray-100"><Edit className="h-3 w-3 text-gray-500" /></button>
                            <button onClick={() => { if (confirm("حذف الصفقة؟")) deleteMutation.mutate(deal.id); }} className="p-0.5 rounded hover:bg-red-50"><Trash2 className="h-3 w-3 text-red-500" /></button>
                          </div>
                        </div>
                        {deal.estimatedValue && (
                          <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />{parseFloat(deal.estimatedValue).toLocaleString()} ريال
                          </p>
                        )}
                        {deal.serviceType && <p className="text-xs text-gray-400 mt-1">{deal.serviceType}</p>}
                        <div className="mt-2">
                          <Select value={deal.stageId} onValueChange={v => moveStage(deal.id, v)}>
                            <SelectTrigger className="h-6 text-xs border-dashed" data-testid={`deal-stage-select-${deal.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {displayStages.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="text-center py-4 text-gray-300 text-xs">لا توجد صفقات</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الصفقة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">المرحلة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">القيمة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">التاريخ</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deals.map((deal: any) => {
                const stage = allStages.find(s => s.id === deal.stageId);
                return (
                  <tr key={deal.id} className="hover:bg-gray-50/50" data-testid={`deal-row-${deal.id}`}>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{deal.title}</p>
                        {deal.dealNumber && <p className="text-xs text-gray-400">{deal.dealNumber}</p>}
                        {deal.serviceType && <p className="text-xs text-gray-400">{deal.serviceType}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: (stage?.color || "#6366f1") + "20", color: stage?.color || "#6366f1" }}>
                        {stage?.name || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-green-600">
                      {deal.estimatedValue ? `${parseFloat(deal.estimatedValue).toLocaleString()} ريال` : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`text-xs ${STATUS_COLORS[deal.status] || ""}`}>
                        {STATUS_LABELS[deal.status] || deal.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {new Date(deal.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(deal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm("حذف الصفقة؟")) deleteMutation.mutate(deal.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {deals.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">لا توجد صفقات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={o => { setShowForm(o); if (!o) { setEditingDeal(null); resetForm(); } }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingDeal ? "تعديل الصفقة" : "إنشاء صفقة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>عنوان الصفقة *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان الصفقة" data-testid="input-deal-title" />
            </div>
            <div>
              <Label>خط المبيعات *</Label>
              <Select value={form.pipelineId} onValueChange={v => setForm(f => ({ ...f, pipelineId: v, stageId: "" }))}>
                <SelectTrigger data-testid="select-deal-pipeline">
                  <SelectValue placeholder="اختر خط المبيعات" />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.pipelineId && (
              <div>
                <Label>المرحلة *</Label>
                <Select value={form.stageId} onValueChange={v => setForm(f => ({ ...f, stageId: v }))}>
                  <SelectTrigger data-testid="select-deal-stage">
                    <SelectValue placeholder="اختر المرحلة" />
                  </SelectTrigger>
                  <SelectContent>
                    {stagesForPipeline(form.pipelineId).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>القيمة المتوقعة (ريال)</Label>
              <Input value={form.estimatedValue} onChange={e => setForm(f => ({ ...f, estimatedValue: e.target.value }))} type="number" placeholder="50000" data-testid="input-deal-value" />
            </div>
            <div>
              <Label>نوع الخدمة</Label>
              <Input value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))} placeholder="تطوير موقع، تطبيق..." data-testid="input-deal-service" />
            </div>
            <div>
              <Label>وصف</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} data-testid="textarea-deal-description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingDeal(null); resetForm(); }}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-deal">
              {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
