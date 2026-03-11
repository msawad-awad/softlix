import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Globe, Layers, FileText, Users2, ArrowUpRight, Settings2, Megaphone, Link2, Inbox, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Service, Project, BlogPost, FormLead } from "@shared/schema";

export default function WebsiteOverview() {
  const { t } = useTranslation();

  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/cms/services"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/cms/projects"] });
  const { data: posts } = useQuery<BlogPost[]>({ queryKey: ["/api/cms/blog"] });
  const { data: leads } = useQuery<FormLead[]>({ queryKey: ["/api/cms/leads"] });

  const stats = [
    { label: "الخدمات", labelEn: "Services", count: services?.length || 0, icon: Layers, href: "/website/services", color: "blue" },
    { label: "المشاريع", labelEn: "Projects", count: projects?.length || 0, icon: Globe, href: "/website/projects", color: "purple" },
    { label: "مقالات المدونة", labelEn: "Blog Posts", count: posts?.length || 0, icon: FileText, href: "/website/blog", color: "green" },
    { label: "العملاء المحتملون", labelEn: "Leads", count: leads?.filter(l => l.status === "new").length || 0, icon: Inbox, href: "/website/leads", color: "orange" },
  ];

  const quickLinks = [
    { label: "إدارة الخدمات", labelEn: "Manage Services", href: "/website/services", icon: Layers },
    { label: "إدارة المشاريع", labelEn: "Manage Projects", href: "/website/projects", icon: Globe },
    { label: "إدارة المدونة", labelEn: "Manage Blog", href: "/website/blog", icon: FileText },
    { label: "شعارات العملاء", labelEn: "Client Logos", href: "/website/clients", icon: Users2 },
    { label: "إدارة التحويلات", labelEn: "Manage Redirects", href: "/website/redirects", icon: Link2 },
    { label: "العملاء المحتملون", labelEn: "Leads", href: "/website/leads", icon: Inbox },
    { label: "الأرقام والإحصاءات", labelEn: "Site Stats", href: "/website/site-stats", icon: BarChart3 },
    { label: "إعدادات التسويق", labelEn: "Marketing Settings", href: "/marketing", icon: Megaphone },
  ];

  const newLeads = leads?.filter(l => l.status === "new").slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">الموقع الإلكتروني</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة محتوى الموقع وصفحاته</p>
        </div>
        <Button asChild variant="outline" size="sm" data-testid="btn-view-site">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Globe className="w-4 h-4 me-2" />
            عرض الموقع
            <ArrowUpRight className="w-3 h-3 me-1" />
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`stat-${stat.labelEn.toLowerCase().replace(/\s/g, "-")}`}>
                <CardContent className="pt-5 pb-5">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white">{stat.count}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">روابط سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {quickLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <Link key={i} href={link.href}>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group" data-testid={`quick-link-${i}`}>
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">أحدث العملاء المحتملين</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/website/leads">عرض الكل</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {newLeads.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد عملاء محتملون جدد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {newLeads.map((lead) => (
                  <div key={lead.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`lead-item-${lead.id}`}>
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 dark:text-blue-300 text-sm font-bold">{lead.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{lead.name}</span>
                        <Badge className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0">جديد</Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lead.phone || lead.email}</p>
                      {lead.message && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{lead.message}</p>}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(lead.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
