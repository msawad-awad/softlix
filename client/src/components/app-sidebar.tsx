import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CheckSquare,
  TicketCheck,
  UserCog,
  Package,
  Calculator,
  Settings,
  LogOut,
  ChevronDown,
  CalendarCheck,
  Zap,
  Globe,
  Layers,
  BookOpen,
  Users2,
  Link2,
  Inbox,
  Megaphone,
  Palette,
  Home,
  Info,
  MessageSquareQuote,
  ListOrdered,
  Trophy,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  Mail,
  DollarSign,
  SlidersHorizontal,
  MapPin,
  UsersRound,
  Phone,
  Receipt,
  PenLine,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-provider";

export function AppSidebar() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  // Permissions helper
  const perms: string[] = user?.permissions ?? [];
  const hasPermission = (key: string) => {
    // admin/manager see everything regardless of stored permissions
    if (user?.role === "admin" || user?.role === "manager") return true;
    return perms.includes(key);
  };

  const mainMenuItems = [
    {
      title: t("nav.dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
      perm: "dashboard",
    },
  ];

  const crmItems = [
    { title: "لوحة تحكم CRM", url: "/crm", icon: Target },
    { title: "العملاء المحتملون", url: "/crm/leads", icon: Inbox },
    { title: "الصفقات", url: "/crm/deals", icon: TrendingUp },
    { title: "عروض الأسعار", url: "/crm/proposals", icon: FileText, perm: "proposals" },
    { title: "الفواتير", url: "/crm/invoices", icon: Receipt },
    { title: "سجل الأنشطة", url: "/crm/activities", icon: Activity },
    { title: "استيراد من جوجل", url: "/crm/google-import", icon: MapPin, perm: "google_import" },
    { title: t("nav.companies"), url: "/companies", icon: Building2 },
    { title: t("nav.contacts"), url: "/contacts", icon: Users },
  ];

  const moduleItems = [
    { title: t("nav.tasks"), url: "/tasks", icon: CheckSquare, disabled: false },
    { title: t("nav.tickets"), url: "/tickets", icon: TicketCheck, disabled: false },
    { title: t("nav.hr"), url: "/hr", icon: UserCog, disabled: false },
    { title: t("nav.inventory"), url: "/inventory", icon: Package, disabled: false },
    { title: t("nav.accounting"), url: "/accounting", icon: Calculator, disabled: true },
  ];

  const websiteItems = [
    { title: "نظرة عامة", url: "/website", icon: Globe },
    { title: "البراندينج والإعدادات", url: "/website/branding", icon: Palette },
    { title: "الصفحة الرئيسية", url: "/website/home-content", icon: Home },
    { title: "من نحن", url: "/website/about-content", icon: Info },
    { title: "الشهادات", url: "/website/testimonials", icon: MessageSquareQuote },
    { title: "خطوات العمل", url: "/website/process-steps", icon: ListOrdered },
    { title: "لماذا نحن؟", url: "/website/why-us", icon: Trophy },
    { title: "الأرقام والإحصاءات", url: "/website/site-stats", icon: BarChart3 },
    { title: "الخدمات", url: "/website/services", icon: Layers },
    { title: "المشاريع", url: "/website/projects", icon: Package },
    { title: "المدونة", url: "/website/blog", icon: BookOpen },
    { title: "العملاء", url: "/website/clients", icon: Users2 },
    { title: "التحويلات", url: "/website/redirects", icon: Link2 },
    { title: "العملاء المحتملون", url: "/website/leads", icon: Inbox },
    { title: "طلبات الاستشارة", url: "/website/bookings", icon: CalendarCheck },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDaysRemaining = () => {
    if (!user?.subscription?.trialEnd) return 0;
    const now = new Date();
    const end = new Date(user.subscription.trialEnd);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border" side={isRTL ? "right" : "left"}>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sidebar-foreground">
              {t("softlix.name")}
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              {t("softlix.tagline")}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.filter(i => hasPermission(i.perm)).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url} data-testid={`nav-${item.url.slice(1)}`}>
                      <item.icon className={isRTL ? "ml-2" : "mr-2"} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CRM */}
        {hasPermission("crm") && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.crm")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {crmItems
                  .filter(i => !i.perm || hasPermission(i.perm))
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                      >
                        <Link href={item.url} data-testid={`nav-${item.url.slice(1).replace(/\//g, "-")}`}>
                          <item.icon className={isRTL ? "ml-2" : "mr-2"} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Modules */}
        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <span>نظام أعمال متكامل</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {moduleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.disabled ? (
                        <SidebarMenuButton
                          tooltip={item.title}
                          disabled
                          className="opacity-50 cursor-not-allowed"
                        >
                          <item.icon className={isRTL ? "ml-2" : "mr-2"} />
                          <span>{item.title}</span>
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                            Soon
                          </Badge>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                        >
                          <Link href={item.url} data-testid={`nav-${item.url.slice(1).replace(/\//g, "-")}`}>
                            <item.icon className={isRTL ? "ml-2" : "mr-2"} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Website CMS */}
        {hasPermission("website") && (
          <SidebarGroup>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  <span>الموقع الإلكتروني</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {websiteItems.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                        >
                          <Link href={item.url} data-testid={`nav-${item.url.slice(1).replace(/\//g, "-")}`}>
                            <item.icon className={isRTL ? "ml-2" : "mr-2"} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Marketing */}
        {hasPermission("marketing") && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen={location.startsWith("/marketing")}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={location.startsWith("/marketing")} tooltip="التسويق">
                        <Megaphone className={isRTL ? "ml-2" : "mr-2"} />
                        <span>التسويق</span>
                        <ChevronDown className="mr-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isActive("/marketing") && !location.includes("newsletter") && !location.includes("pricing")}>
                            <Link href="/marketing" data-testid="nav-marketing-settings">
                              <SlidersHorizontal size={14} className={isRTL ? "ml-1.5" : "mr-1.5"} />
                              إعدادات التتبع والويدجت
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isActive("/marketing/newsletter")}>
                            <Link href="/marketing/newsletter" data-testid="nav-marketing-newsletter">
                              <Mail size={14} className={isRTL ? "ml-1.5" : "mr-1.5"} />
                              النشرة البريدية
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isActive("/marketing/pricing")}>
                            <Link href="/marketing/pricing" data-testid="nav-marketing-pricing">
                              <DollarSign size={14} className={isRTL ? "ml-1.5" : "mr-1.5"} />
                              باقات الأسعار
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isActive("/dashboard/visitors")}>
                            <Link href="/dashboard/visitors" data-testid="nav-visitors">
                              <Globe size={14} className={isRTL ? "ml-1.5" : "mr-1.5"} />
                              تحليلات الزوار
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        {user?.subscription && (
          <div className="mb-2 p-3 rounded-lg bg-sidebar-accent/50 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-sidebar-foreground/80">
                {t("subscription.plan")}
              </span>
              <Badge
                variant={user.subscription.status === "trial" ? "secondary" : "default"}
                className="text-[10px]"
              >
                {t(`subscription.${user.subscription.status}`)}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-sidebar-foreground">
              {getDaysRemaining()} {t("subscription.daysRemaining")}
            </p>
          </div>
        )}

        <SidebarMenu>
          {hasPermission("settings") && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/settings") && !isActive("/settings/integrations") && !isActive("/settings/users")}
                  tooltip={t("nav.settings")}
                >
                  <Link href="/settings" data-testid="nav-settings">
                    <Settings className={isRTL ? "ml-2" : "mr-2"} />
                    <span>{t("nav.settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/settings/integrations")}
                  tooltip="التكاملات"
                >
                  <Link href="/settings/integrations" data-testid="nav-integrations">
                    <Zap className={isRTL ? "ml-2" : "mr-2"} />
                    <span>التكاملات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          {hasPermission("team") && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/settings/users")}
                tooltip="إدارة الفريق"
              >
                <Link href="/settings/users" data-testid="nav-team-users">
                  <UsersRound className={isRTL ? "ml-2" : "mr-2"} />
                  <span>إدارة الفريق</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {hasPermission("team") && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/settings/phone")} tooltip="إدارة أرقام الهاتف">
                <Link href="/settings/phone" data-testid="nav-phone-settings">
                  <Phone className={isRTL ? "ml-2" : "mr-2"} />
                  <span>أرقام الهاتف</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {hasPermission("settings") && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/settings/proposal")} tooltip="إعدادات التوقيع والختم">
                <Link href="/settings/proposal" data-testid="nav-proposal-settings">
                  <PenLine className={isRTL ? "ml-2" : "mr-2"} />
                  <span>التوقيع والختم</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 rounded-md hover-elevate text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors group-data-[collapsible=icon]:hidden"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
