import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Search } from "lucide-react";

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  note: "ملاحظة", call_log: "مكالمة", meeting_log: "اجتماع",
  email_log: "بريد إلكتروني", whatsapp_log: "واتساب",
  status_change: "تغيير حالة", assignment_change: "تغيير مسؤول",
  stage_change: "تغيير مرحلة", proposal_action: "عرض سعر", manual: "نشاط",
};

const ACTIVITY_ICONS: Record<string, string> = {
  note: "📝", call_log: "📞", meeting_log: "🤝", email_log: "📧",
  whatsapp_log: "💬", status_change: "🔄", assignment_change: "👤",
  stage_change: "📊", proposal_action: "📋", manual: "📌",
};

const ENTITY_LABELS: Record<string, string> = {
  lead: "عميل محتمل", contact: "جهة اتصال", company: "شركة", deal: "صفقة",
};

const ENTITY_COLORS: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700",
  contact: "bg-purple-100 text-purple-700",
  company: "bg-indigo-100 text-indigo-700",
  deal: "bg-green-100 text-green-700",
};

export default function CrmActivities() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const { data: activities = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/crm/activities"],
    queryFn: () => fetch("/api/crm/activities", { credentials: "include" }).then(r => r.json()),
  });

  const filtered = activities.filter(a => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (entityFilter !== "all" && a.entityType !== entityFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return a.subject?.toLowerCase().includes(s) || a.details?.toLowerCase().includes(s);
    }
    return true;
  });

  // Group by date
  const grouped: Record<string, any[]> = {};
  for (const activity of filtered) {
    const date = new Date(activity.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(activity);
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سجل الأنشطة</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} نشاط</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="بحث في الأنشطة..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" data-testid="input-search-activities" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44" data-testid="select-activity-type">
            <SelectValue placeholder="نوع النشاط" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {Object.entries(ACTIVITY_TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-40" data-testid="select-entity-filter">
            <SelectValue placeholder="نوع السجل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل السجلات</SelectItem>
            {Object.entries(ENTITY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">جاري التحميل...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20">
          <Clock className="h-16 w-16 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد أنشطة</h3>
          <p className="text-gray-500">ستظهر الأنشطة هنا عند إضافة ملاحظات أو مكالمات</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayActivities]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{date}</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              <div className="space-y-3">
                {dayActivities.map((activity: any) => (
                  <div key={activity.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-4" data-testid={`activity-item-${activity.id}`}>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 border text-xl">
                      {ACTIVITY_ICONS[activity.type] || "📌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm text-gray-900">{ACTIVITY_TYPE_LABELS[activity.type] || activity.type}</span>
                        {activity.entityType && (
                          <Badge variant="outline" className={`text-xs ${ENTITY_COLORS[activity.entityType] || ""}`}>
                            {ENTITY_LABELS[activity.entityType] || activity.entityType}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400 mr-auto">{new Date(activity.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {activity.subject && <p className="text-sm text-gray-700 mb-1">{activity.subject}</p>}
                      {activity.details && activity.details !== activity.subject && (
                        <p className="text-xs text-gray-500 leading-relaxed">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
