import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Phone, Mail, Building2, MapPin, Calendar, Clock, Plus, MessageSquare, GitMerge, Loader2 } from "lucide-react";

const STATUSES = [
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

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  attempting_contact: "bg-yellow-100 text-yellow-700",
  contacted: "bg-indigo-100 text-indigo-700",
  qualified: "bg-green-100 text-green-700",
  unqualified: "bg-gray-100 text-gray-600",
  proposal_sent: "bg-orange-100 text-orange-700",
  negotiation: "bg-purple-100 text-purple-700",
  converted: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  note: "ملاحظة",
  call_log: "مكالمة",
  meeting_log: "اجتماع",
  email_log: "بريد إلكتروني",
  whatsapp_log: "واتساب",
  status_change: "تغيير حالة",
  assignment_change: "تغيير مسؤول",
  stage_change: "تغيير مرحلة",
  proposal_action: "عرض سعر",
  manual: "نشاط",
};

const ACTIVITY_ICONS: Record<string, string> = {
  note: "📝",
  call_log: "📞",
  meeting_log: "🤝",
  email_log: "📧",
  whatsapp_log: "💬",
  status_change: "🔄",
  assignment_change: "👤",
  stage_change: "📊",
  proposal_action: "📋",
  manual: "📌",
};

export default function LeadDetail() {
  const [, params] = useRoute("/crm/leads/:id");
  const id = params?.id!;
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [showConvert, setShowConvert] = useState(false);
  const [convertData, setConvertData] = useState({ pipelineId: "", stageId: "" });

  const { data: lead, isLoading } = useQuery<any>({ queryKey: [`/api/crm/leads/${id}`] });
  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/activities", "lead", id],
    queryFn: () => fetch(`/api/crm/activities?entityType=lead&entityId=${id}`, { credentials: "include" }).then(r => r.json()),
  });
  const { data: pipelines = [] } = useQuery<any[]>({ queryKey: ["/api/crm/pipelines"] });
  const { data: stages = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/stages", convertData.pipelineId],
    queryFn: () => convertData.pipelineId ? fetch(`/api/crm/stages?pipelineId=${convertData.pipelineId}`, { credentials: "include" }).then(r => r.json()) : Promise.resolve([]),
    enabled: !!convertData.pipelineId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/crm/leads/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/crm/leads/${id}`] }); toast({ title: "تم التحديث" }); },
  });

  const addActivityMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/crm/activities", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/activities", "lead", id] });
      setNoteText("");
      toast({ title: "تم إضافة النشاط" });
    },
  });

  const convertMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/crm/leads/${id}/convert`, data),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: [`/api/crm/leads/${id}`] });
      setShowConvert(false);
      toast({ title: "تم التحويل بنجاح" });
      if (data.deal?.id) setLocation(`/crm/deals`);
    },
    onError: () => toast({ title: "حدث خطأ في التحويل", variant: "destructive" }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  if (!lead) return <div className="text-center py-20 text-gray-400">لم يتم العثور على العميل</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir="rtl">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/crm/leads"><ArrowRight className="h-4 w-4" /> العودة</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.fullName}</h1>
            <p className="text-sm text-gray-500">{lead.leadNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {lead.status !== "converted" && (
            <Button variant="outline" size="sm" onClick={() => setShowConvert(true)} data-testid="button-convert-lead">
              <GitMerge className="h-4 w-4 ml-2" />
              تحويل إلى صفقة
            </Button>
          )}
          <Select value={lead.status} onValueChange={v => updateMutation.mutate({ status: v })}>
            <SelectTrigger className={`w-40 text-sm font-medium border-0 ${STATUS_COLORS[lead.status] || ""}`} data-testid="select-lead-status-detail">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.mobile && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a href={`tel:${lead.mobile}`} className="text-blue-600 hover:underline">{lead.mobile}</a>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                </div>
              )}
              {lead.companyName && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{lead.companyName}</span>
                </div>
              )}
              {(lead.city || lead.country) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{[lead.city, lead.country].filter(Boolean).join("، ")}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500">{new Date(lead.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {lead.serviceInterested && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الخدمة</span>
                  <span className="font-medium">{lead.serviceInterested}</span>
                </div>
              )}
              {lead.estimatedBudget && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الميزانية</span>
                  <span className="font-medium">{lead.estimatedBudget}</span>
                </div>
              )}
              {lead.sourceName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">المصدر</span>
                  <span className="font-medium">{lead.sourceName}</span>
                </div>
              )}
              {lead.priority && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الأولوية</span>
                  <Badge variant="outline" className="text-xs">{lead.priority}</Badge>
                </div>
              )}
              {lead.campaignName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">الحملة</span>
                  <span className="font-medium text-xs">{lead.campaignName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {lead.notes && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">الملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">{lead.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Timeline + Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                إضافة نشاط أو ملاحظة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                {[
                  { type: "note", label: "ملاحظة", icon: "📝" },
                  { type: "call_log", label: "مكالمة", icon: "📞" },
                  { type: "meeting_log", label: "اجتماع", icon: "🤝" },
                  { type: "email_log", label: "بريد", icon: "📧" },
                  { type: "whatsapp_log", label: "واتساب", icon: "💬" },
                ].map(t => (
                  <button key={t.type} onClick={() => setNoteType(t.type)}
                    className={`flex-1 py-2 rounded-lg text-xs border transition-all ${noteType === t.type ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="اكتب ملاحظتك هنا..." rows={3} data-testid="textarea-activity-note" />
              <Button size="sm" onClick={() => {
                if (!noteText.trim()) return;
                addActivityMutation.mutate({ entityType: "lead", entityId: id, type: noteType, subject: noteText, details: noteText });
              }} disabled={addActivityMutation.isPending || !noteText.trim()} data-testid="button-add-activity">
                <Plus className="h-4 w-4 ml-2" />
                {addActivityMutation.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                السجل الزمني ({activities.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد أنشطة بعد</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-100" />
                  <div className="space-y-4">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="flex gap-4 relative" data-testid={`activity-${activity.id}`}>
                        <div className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 text-base shadow-sm">
                          {ACTIVITY_ICONS[activity.type] || "📌"}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-700">{ACTIVITY_TYPE_LABELS[activity.type] || activity.type}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleString("ar-SA")}</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{activity.subject || activity.details}</p>
                          {activity.details && activity.details !== activity.subject && (
                            <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Convert Dialog */}
      <Dialog open={showConvert} onOpenChange={setShowConvert}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تحويل العميل المحتمل إلى صفقة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">سيتم إنشاء جهة اتصال {lead.companyName ? "وشركة" : ""} وصفقة جديدة تلقائياً.</p>
            <div>
              <Label>خط المبيعات</Label>
              <Select value={convertData.pipelineId} onValueChange={v => setConvertData(d => ({ ...d, pipelineId: v, stageId: "" }))}>
                <SelectTrigger data-testid="select-convert-pipeline">
                  <SelectValue placeholder="اختر خط المبيعات" />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {convertData.pipelineId && (
              <div>
                <Label>المرحلة</Label>
                <Select value={convertData.stageId} onValueChange={v => setConvertData(d => ({ ...d, stageId: v }))}>
                  <SelectTrigger data-testid="select-convert-stage">
                    <SelectValue placeholder="اختر المرحلة" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.filter((s: any) => !s.isWon && !s.isLost).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvert(false)}>إلغاء</Button>
            <Button onClick={() => convertMutation.mutate(convertData)} disabled={!convertData.pipelineId || !convertData.stageId || convertMutation.isPending} data-testid="button-confirm-convert">
              {convertMutation.isPending ? <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري التحويل...</> : "تحويل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
