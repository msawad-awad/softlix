import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, UserPlus, TrendingUp, Plus, FileText, Clock } from "lucide-react";
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
      </div>

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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
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
    </div>
  );
}
