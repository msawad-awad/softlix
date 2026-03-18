import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import {
  AlertCircle, Plus, MessageSquare, Clock, Trash2,
  Search, ChevronDown, Send, Tag, CheckCircle2, XCircle, Edit2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Ticket, TicketMessage } from "@shared/schema";

const STATUS_CONFIG: Record<string, { label: string; color: string; iconName: string }> = {
  open:        { label: "مفتوحة",       color: "bg-red-100 text-red-700 border-red-200",       iconName: "alert" },
  in_progress: { label: "قيد المعالجة", color: "bg-orange-100 text-orange-700 border-orange-200", iconName: "clock" },
  resolved:    { label: "محلولة",       color: "bg-green-100 text-green-700 border-green-200",  iconName: "check" },
  closed:      { label: "مغلقة",        color: "bg-gray-100 text-gray-600 border-gray-200",    iconName: "x" },
};
const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: "منخفض", color: "bg-green-100 text-green-700" },
  medium: { label: "متوسط", color: "bg-yellow-100 text-yellow-700" },
  high:   { label: "عالي",  color: "bg-orange-100 text-orange-700" },
  urgent: { label: "عاجل", color: "bg-red-100 text-red-700" },
};
const CATEGORY_LABELS: Record<string, string> = {
  support: "دعم تقني", bug: "خلل برمجي", feature: "طلب ميزة", billing: "فوترة", other: "أخرى",
};

interface TicketForm { title: string; description: string; priority: string; category: string; }
interface MessageForm { message: string; }

type TicketWithMeta = Ticket & { _msgCount?: number };

export default function Tickets() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TicketForm>({
    defaultValues: { title: "", description: "", priority: "medium", category: "support" },
  });
  const msgForm = useForm<MessageForm>({ defaultValues: { message: "" } });

  const { data: allTickets = [], isLoading } = useQuery<Ticket[]>({ queryKey: ["/api/tickets"] });

  const { data: messages = [] } = useQuery<TicketMessage[]>({
    queryKey: ["/api/tickets", selectedTicket?.id, "messages"],
    queryFn: () => fetch(`/api/tickets/${selectedTicket?.id}/messages`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedTicket,
  });

  const createMutation = useMutation({
    mutationFn: (data: TicketForm) => apiRequest("POST", "/api/tickets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setShowCreateDialog(false); reset();
      toast({ title: "تم إنشاء التذكرة" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ticket> }) =>
      apiRequest("PATCH", `/api/tickets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      if (selectedTicket) {
        queryClient.invalidateQueries({ queryKey: ["/api/tickets", selectedTicket.id, "messages"] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tickets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setShowDetailDialog(false); setSelectedTicket(null);
      toast({ title: "تم حذف التذكرة" });
    },
  });

  const sendMsgMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      apiRequest("POST", `/api/tickets/${id}/messages`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", selectedTicket?.id, "messages"] });
      msgForm.reset();
    },
  });

  const filtered = allTickets.filter(t => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.number?.includes(search);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: allTickets.length,
    open: allTickets.filter(t => t.status === "open").length,
    inProgress: allTickets.filter(t => t.status === "in_progress").length,
    resolved: allTickets.filter(t => t.status === "resolved" || t.status === "closed").length,
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="التذاكر والدعم" description="إدارة طلبات الدعم والتذاكر التقنية" />
        <Button
          onClick={() => { reset(); setShowCreateDialog(true); }}
          className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
          data-testid="button-add-ticket"
        >
          <Plus className="h-4 w-4 ml-2" />
          تذكرة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "الكل",        value: stats.total,     color: "text-gray-700",       bg: "bg-gray-50" },
          { label: "مفتوحة",      value: stats.open,      color: "text-red-600",        bg: "bg-red-50" },
          { label: "قيد المعالجة", value: stats.inProgress, color: "text-orange-600",   bg: "bg-orange-50" },
          { label: "محلولة",       value: stats.resolved,  color: "text-green-600",     bg: "bg-green-50" },
        ].map((s) => (
          <Card key={s.label} className={`border-0 ${s.bg}`}>
            <CardContent className="pt-5 pb-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في التذاكر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            data-testid="input-search-tickets"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "open", "in_progress", "resolved", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                filterStatus === s
                  ? "bg-[#ff6a00] text-white border-[#ff6a00]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
              }`}
              data-testid={`filter-${s}`}
            >
              {s === "all" ? "الكل" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-5 w-5 text-[#ff6a00]" />
            التذاكر ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا توجد تذاكر</p>
              <Button variant="link" className="text-[#ff6a00] mt-1" onClick={() => { reset(); setShowCreateDialog(true); }}>
                أنشئ تذكرة جديدة
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm hover:border-orange-100 transition-all cursor-pointer"
                  onClick={() => openTicket(ticket)}
                  data-testid={`ticket-item-${ticket.id}`}
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-[#ff6a00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ticket.number} • {CATEGORY_LABELS[ticket.category || "support"]}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(ticket.id); }}
                        className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                        data-testid={`button-delete-ticket-${ticket.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[ticket.status]?.color}`}>
                        {STATUS_CONFIG[ticket.status]?.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[ticket.priority]?.color}`}>
                        {PRIORITY_CONFIG[ticket.priority]?.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#ff6a00]" />
              تذكرة دعم جديدة
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">العنوان *</label>
              <Input
                {...register("title", { required: true })}
                placeholder="عنوان التذكرة"
                data-testid="input-ticket-title"
                className={errors.title ? "border-red-400" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الأولوية</label>
                <Select defaultValue="medium" onValueChange={(v) => setValue("priority", v)}>
                  <SelectTrigger data-testid="select-ticket-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                      <SelectItem key={v} value={v}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الفئة</label>
                <Select defaultValue="support" onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger data-testid="select-ticket-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف</label>
              <Textarea
                {...register("description")}
                placeholder="وصف المشكلة أو الطلب..."
                rows={4}
                data-testid="input-ticket-description"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
                disabled={createMutation.isPending}
                data-testid="button-save-ticket"
              >
                إنشاء التذكرة
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={(o) => { setShowDetailDialog(o); if (!o) setSelectedTicket(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#ff6a00]" />
                <span>{selectedTicket?.number} - {selectedTicket?.title}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="flex flex-col gap-4 overflow-hidden flex-1">
              {/* Status bar */}
              <div className="flex flex-wrap gap-3 items-center">
                <Select
                  value={selectedTicket.status}
                  onValueChange={(v) => {
                    updateMutation.mutate({ id: selectedTicket.id, data: { status: v } });
                    setSelectedTicket({ ...selectedTicket, status: v });
                  }}
                >
                  <SelectTrigger className="w-40" data-testid="select-ticket-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                      <SelectItem key={v} value={v}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className={`text-xs px-2.5 py-1 rounded-full ${PRIORITY_CONFIG[selectedTicket.priority]?.color}`}>
                  {PRIORITY_CONFIG[selectedTicket.priority]?.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[selectedTicket.category || "support"]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(selectedTicket.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>

              {selectedTicket.description && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  {selectedTicket.description}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px] max-h-[300px] border rounded-xl p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">لا توجد ردود بعد</p>
                ) : messages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply */}
              <form
                onSubmit={msgForm.handleSubmit((d) => {
                  if (selectedTicket) sendMsgMutation.mutate({ id: selectedTicket.id, message: d.message });
                })}
                className="flex gap-2"
              >
                <Input
                  {...msgForm.register("message", { required: true })}
                  placeholder="اكتب ردًا..."
                  data-testid="input-ticket-reply"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white flex-shrink-0"
                  disabled={sendMsgMutation.isPending}
                  data-testid="button-send-reply"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
