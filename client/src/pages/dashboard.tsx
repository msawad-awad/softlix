import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, UserPlus, TrendingUp, Plus, FileText, Clock, Globe, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { LoadingPage } from "@/components/loading-spinner";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-provider";
import { Link } from "wouter";
import type { DashboardStats, ActivityLog } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: visitors } = useQuery<any>({
    queryKey: ["/api/dashboard/visitors"],
  });

  const { data: contactAnalytics } = useQuery<any>({
    queryKey: ["/api/dashboard/contact-analytics"],
  });

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case "company":
        return Building2;
      case "contact":
        return Users;
      default:
        return Clock;
    }
  };

  const formatActivityTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === "ar" ? ar : enUS,
    });
  };

  if (isLoading) {
    return <LoadingPage message={t("common.loading")} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${t("dashboard.welcome")}${user?.name ? `, ${user.name}` : ""}`}
        description={new Date().toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.totalCompanies")}
          value={stats?.totalCompanies || 0}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title={t("dashboard.totalContacts")}
          value={stats?.totalContacts || 0}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title={t("dashboard.newLeads")}
          value={stats?.newLeadsThisMonth || 0}
          icon={UserPlus}
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          title={t("dashboard.activeClients")}
          value={stats?.activeClients || 0}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="الزوار (آخر 30 يوم)"
          value={stats?.visitorsLast30Days || 0}
          icon={Globe}
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      {/* Visitors Analytics */}
      {visitors && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Countries */}
          <Card className="min-h-[380px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#ff6a00]" />
                أفضل الدول
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {visitors.topCountries && visitors.topCountries.length > 0 ? (
                <div className="space-y-3">
                  {visitors.topCountries.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover-elevate">
                      <span className="text-sm font-medium">{c.country || "غير معروف"}</span>
                      <Badge variant="secondary">{c.count} زائر</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">لا توجد بيانات</p>
              )}
            </CardContent>
          </Card>

          {/* Top Cities */}
          <Card className="min-h-[380px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                أفضل المدن
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {visitors.topCities && visitors.topCities.length > 0 ? (
                <div className="space-y-3">
                  {visitors.topCities.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover-elevate">
                      <div>
                        <p className="text-sm font-medium">{c.city || "غير معروف"}</p>
                        <p className="text-xs text-gray-400">{c.country}</p>
                      </div>
                      <Badge variant="secondary">{c.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">لا توجد بيانات</p>
              )}
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card className="min-h-[380px] flex flex-col lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">أكثر الصفحات زيارة</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {visitors.topPages && visitors.topPages.length > 0 ? (
                <div className="space-y-2">
                  {visitors.topPages.slice(0, 8).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover-elevate text-sm">
                      <span className="text-gray-700 truncate flex-1">{p.pageUrl || "/"}</span>
                      <Badge variant="secondary">{p.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">لا توجد بيانات</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg font-semibold">
              {t("dashboard.recentActivity")}
            </CardTitle>
            <Button variant="ghost" size="sm">
              {t("common.all")}
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.slice(0, 5).map((activity: ActivityLog) => {
                  const Icon = getActivityIcon(activity.entityType);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover-elevate"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {activity.action}{" "}
                          <span className="text-primary">{activity.entityType}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatActivityTime(activity.createdAt as unknown as string)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {activity.entityType}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("common.noData")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {t("dashboard.quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/companies/new">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                data-testid="button-add-company"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-[#ff6a00]">
                  <Building2 className="h-4 w-4" />
                </div>
                <span>{t("dashboard.addCompany")}</span>
              </Button>
            </Link>
            <Link href="/contacts/new">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                data-testid="button-add-contact"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                  <Users className="h-4 w-4" />
                </div>
                <span>{t("dashboard.addContact")}</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              disabled
              data-testid="button-create-quote"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <FileText className="h-4 w-4" />
              </div>
              <span>{t("dashboard.createQuote")}</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                Soon
              </Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {user?.subscription && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{t("subscription.title")}</h3>
                  <Badge
                    variant={user.subscription.status === "trial" ? "secondary" : "default"}
                  >
                    {t(`subscription.${user.subscription.status}`)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.expiresOn")}:{" "}
                  {new Date(user.subscription.trialEnd).toLocaleDateString(
                    language === "ar" ? "ar-SA" : "en-US"
                  )}
                </p>
              </div>
              <Button data-testid="button-upgrade">
                {t("subscription.upgrade")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Interactions Analytics */}
      {contactAnalytics && (
        <div className="grid gap-6 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">إجمالي التفاعلات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{contactAnalytics.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">جميع الوقت</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">آخر 7 أيام</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{contactAnalytics.last7Days || 0}</p>
              <p className="text-xs text-gray-500 mt-1">تفاعلات</p>
            </CardContent>
          </Card>

          {contactAnalytics.byButton && contactAnalytics.byButton.map((btn: any) => (
            <Card key={btn.buttonType}>
              <CardHeader>
                <CardTitle className="text-sm font-semibold capitalize">
                  {btn.buttonType === "whatsapp" ? "واتساب" :
                    btn.buttonType === "call" ? "اتصال" :
                    btn.buttonType === "message" ? "رسالة" :
                    "استشارة"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{btn.count}</p>
                <p className="text-xs text-gray-500 mt-1">ضغطات</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
