import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, TrendingUp, DollarSign, CheckCircle, XCircle, FileText,
  Clock, AlertCircle, Plus, ArrowUpRight, Zap
} from "lucide-react";

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  attempting_contact: "محاولة تواصل",
  contacted: "تم التواصل",
  qualified: "مؤهل",
  unqualified: "غير مؤهل",
  proposal_sent: "تم إرسال عرض",
  negotiation: "تفاوض",
  converted: "تم التحويل",
  lost: "خسارة",
};

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "bg-orange-100 text-orange-800",
  attempting_contact: "bg-yellow-100 text-yellow-800",
  contacted: "bg-amber-100 text-amber-800",
  qualified: "bg-green-100 text-green-800",
  unqualified: "bg-gray-100 text-gray-600",
  proposal_sent: "bg-orange-100 text-orange-800",
  negotiation: "bg-purple-100 text-purple-800",
  converted: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
};

export default function CrmDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/crm/dashboard"],
  });

  const setupMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/crm/setup", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/crm/dashboard"] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "إجمالي العملاء المحتملين", value: stats?.totalLeads ?? 0, icon: Users, color: "text-[#ff6a00]", bg: "bg-orange-50", link: "/crm/leads" },
    { label: "عملاء جدد اليوم", value: stats?.newLeadsToday ?? 0, icon: ArrowUpRight, color: "text-emerald-600", bg: "bg-emerald-50", link: "/crm/leads" },
    { label: "الصفقات المفتوحة", value: stats?.openDeals ?? 0, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50", link: "/crm/deals" },
    { label: "قيمة الصفقات المفتوحة", value: `${(stats?.openDealsValue ?? 0).toLocaleString()} ريال`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", link: "/crm/deals" },
    { label: "صفقات رابحة (هذا الشهر)", value: stats?.wonDealsThisMonth ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", link: "/crm/deals" },
    { label: "صفقات خاسرة (هذا الشهر)", value: stats?.lostDealsThisMonth ?? 0, icon: XCircle, color: "text-red-600", bg: "bg-red-50", link: "/crm/deals" },
    { label: "عروض أسعار مرسلة", value: stats?.proposalsSent ?? 0, icon: FileText, color: "text-purple-600", bg: "bg-purple-50", link: "/crm/proposals" },
    { label: "مهام متأخرة", value: stats?.overdueTasks ?? 0, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", link: "/crm/tasks" },
  ];

  const hasData = (stats?.totalLeads ?? 0) > 0 || (stats?.openDeals ?? 0) > 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم CRM</h1>
          <p className="text-sm text-gray-500 mt-1">مرحباً {user?.name}، هذا ملخص أداء المبيعات</p>
        </div>
        <div className="flex gap-2">
          {!hasData && (
            <Button onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending} variant="outline" size="sm" data-testid="button-crm-setup">
              <Zap className="h-4 w-4 ml-2" />
              {setupMutation.isPending ? "جاري الإعداد..." : "إعداد CRM الأولي"}
            </Button>
          )}
          <Button asChild size="sm" data-testid="button-new-lead">
            <Link href="/crm/leads">
              <Plus className="h-4 w-4 ml-2" />
              عميل جديد
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link href={card.link} key={card.label}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm" data-testid={`stat-card-${card.label}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leads by Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">العملاء المحتملون حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.leadsByStatus && Object.keys(stats.leadsByStatus).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.leadsByStatus as Record<string, number>)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const total = stats.totalLeads || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEAD_STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
                          {LEAD_STATUS_LABELS[status] || status}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-[#ff6a00] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8 text-left">{count}</span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد بيانات بعد</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads by Source */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">العملاء المحتملون حسب المصدر</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.leadsBySource && Object.keys(stats.leadsBySource).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.leadsBySource as Record<string, number>)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([source, count]) => {
                    const total = stats.totalLeads || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={source} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-28 truncate">{source}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8 text-left">{count}</span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد بيانات بعد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">آخر العملاء المحتملين</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/crm/leads">عرض الكل</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats?.recentLeads?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentLeads.map((lead: any) => (
                <Link href={`/crm/leads/${lead.id}`} key={lead.id}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" data-testid={`lead-row-${lead.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ff8c00] flex items-center justify-center text-white font-semibold text-sm">
                        {lead.fullName?.[0] || "؟"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{lead.fullName}</p>
                        <p className="text-xs text-gray-400">{lead.companyName || lead.email || lead.mobile}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{lead.sourceName || "—"}</span>
                      <Badge variant="secondary" className={`text-xs ${LEAD_STATUS_COLORS[lead.status] || ""}`}>
                        {LEAD_STATUS_LABELS[lead.status] || lead.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 text-sm">لا يوجد عملاء محتملون بعد</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/crm/leads">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة أول عميل
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
