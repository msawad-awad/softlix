import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Globe, Smartphone, Monitor, Tablet, Chrome, Clock,
  Filter, Download, RefreshCw, Users, TrendingUp, Eye, Wifi,
  Link2, Search, Calendar, BarChart3, FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { VisitorLog } from "@shared/schema";

const COUNTRY_FLAGS: Record<string, string> = {
  "Saudi Arabia": "🇸🇦", "UAE": "🇦🇪", "United Arab Emirates": "🇦🇪",
  "Kuwait": "🇰🇼", "Qatar": "🇶🇦", "Bahrain": "🇧🇭", "Oman": "🇴🇲",
  "Jordan": "🇯🇴", "Egypt": "🇪🇬", "Iraq": "🇮🇶", "Yemen": "🇾🇪",
  "Palestine": "🇵🇸", "Lebanon": "🇱🇧", "Syria": "🇸🇾", "Morocco": "🇲🇦",
  "Tunisia": "🇹🇳", "Algeria": "🇩🇿", "Libya": "🇱🇾", "Sudan": "🇸🇩",
  "United States": "🇺🇸", "United Kingdom": "🇬🇧", "Germany": "🇩🇪",
  "France": "🇫🇷", "Turkey": "🇹🇷", "India": "🇮🇳", "Pakistan": "🇵🇰",
  "Indonesia": "🇮🇩", "Malaysia": "🇲🇾",
};

function getFlag(country: string | null) {
  if (!country) return "🌐";
  return COUNTRY_FLAGS[country] || "🌐";
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone size={14} className="text-[#ff6a00]" />;
  if (type === "tablet") return <Tablet size={14} className="text-purple-500" />;
  return <Monitor size={14} className="text-gray-500" />;
}

function formatDate(d: Date | string) {
  const date = new Date(d);
  return date.toLocaleString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function trimUrl(url: string | null) {
  if (!url) return "/";
  return url.length > 35 ? url.slice(0, 35) + "…" : url;
}

function formatPageName(url: string | null) {
  if (!url || url === "/") return "الصفحة الرئيسية";
  const path = url.replace(/^https?:\/\/[^/]+/, "").replace(/\?.*$/, "");
  const PAGE_NAMES: Record<string, string> = {
    "/": "الصفحة الرئيسية",
    "/about": "من نحن",
    "/services": "الخدمات",
    "/blog": "المدونة",
    "/contact": "تواصل معنا",
    "/projects": "المشاريع",
    "/pricing": "الأسعار",
  };
  return PAGE_NAMES[path] || path;
}

type Period = "7d" | "30d" | "90d" | "custom";

interface AnalyticsData {
  dailyVisits: Array<{ date: string; count: number; mobile: number; desktop: number }>;
  topPages: Array<{ pageUrl: string; count: number; percentage: number }>;
  kpi: { today: number; week: number; month: number; total: number };
}

interface VisitorDetailsResponse {
  logs: VisitorLog[];
  total: number;
  byDevice: Array<{ deviceType: string | null; count: number }>;
  byBrowser: Array<{ browser: string | null; count: number }>;
  byOS: Array<{ osName: string | null; count: number }>;
}

export default function VisitorsPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<"analytics" | "details">("analytics");
  const PAGE_SIZE = 50;

  const getDateRange = () => {
    if (period === "custom" && customFrom && customTo) {
      return { from: customFrom, to: customTo };
    }
    const now = new Date();
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { from: from.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
  };

  const dateRange = getDateRange();

  const customReady = period !== "custom" || (!!customFrom && !!customTo);

  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/dashboard/visitor-analytics", period, dateRange.from, dateRange.to],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (period === "custom") {
        params.set("from", customFrom);
        params.set("to", customTo);
      }
      const res = await fetch(`/api/dashboard/visitor-analytics?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: customReady,
  });

  const { data: detailsData, isLoading: detailsLoading, refetch: refetchDetails } = useQuery<VisitorDetailsResponse>({
    queryKey: ["/api/dashboard/visitor-details", countryFilter, deviceFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
      if (countryFilter) params.set("country", countryFilter);
      if (deviceFilter && deviceFilter !== "all") params.set("deviceType", deviceFilter);
      const res = await fetch(`/api/dashboard/visitor-details?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const logs = detailsData?.logs || [];
  const filteredLogs = search
    ? logs.filter(l =>
        l.country?.toLowerCase().includes(search.toLowerCase()) ||
        l.city?.toLowerCase().includes(search.toLowerCase()) ||
        l.ipAddress?.includes(search) ||
        l.pageUrl?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const maxDailyCount = Math.max(...(analytics?.dailyVisits || []).map(d => d.count), 1);

  const handleExport = () => {
    if (!logs.length) return;
    const header = ["IP", "الدولة", "المدينة", "المنطقة", "الجهاز", "المتصفح", "نظام التشغيل", "الصفحة", "المصدر", "ISP", "التوقيت"];
    const rows = logs.map(l => [
      l.ipAddress || "", l.country || "", l.city || "", l.region || "",
      l.deviceType || "", l.browser || "", l.osName || "",
      l.pageUrl || "", l.referrer || "", l.isp || "",
      new Date(l.timestamp).toLocaleString("ar-SA"),
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `visitors_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "تم تصدير البيانات بنجاح ✓" });
  };

  const kpiItems = [
    { label: "اليوم", value: analytics?.kpi.today ?? 0, icon: <Calendar size={20} className="text-[#ff6a00]" />, bg: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "آخر 7 أيام", value: analytics?.kpi.week ?? 0, icon: <TrendingUp size={20} className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "آخر 30 يوم", value: analytics?.kpi.month ?? 0, icon: <BarChart3 size={20} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "الإجمالي الكلي", value: analytics?.kpi.total ?? 0, icon: <Users size={20} className="text-purple-500" />, bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white" data-testid="heading-visitor-analytics">تحليلات الزوار</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">تقارير شاملة عن زيارات الموقع والصفحات</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={activeTab === "analytics" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("analytics")}
            className={activeTab === "analytics" ? "bg-[#ff6a00] hover:bg-[#ff8c00]" : ""}
            data-testid="tab-analytics"
          >
            <BarChart3 size={14} className="me-1" /> التقارير
          </Button>
          <Button
            variant={activeTab === "details" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("details")}
            className={activeTab === "details" ? "bg-[#ff6a00] hover:bg-[#ff8c00]" : ""}
            data-testid="tab-details"
          >
            <Eye size={14} className="me-1" /> سجل الزوار
          </Button>
          <Button variant="outline" size="sm" onClick={() => { refetchAnalytics(); refetchDetails(); }} data-testid="btn-refresh-visitors">
            <RefreshCw size={14} className="me-1" /> تحديث
          </Button>
          {activeTab === "details" && (
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="btn-export-visitors">
              <Download size={14} className="me-1" /> تصدير CSV
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiItems.map((k) => (
          <Card key={k.label} className="border-0 shadow-sm" data-testid={`kpi-${k.label}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}>
                {k.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{k.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeTab === "analytics" && (
        <>
          {/* Period Selector */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">الفترة:</span>
                {([
                  { key: "7d", label: "7 أيام" },
                  { key: "30d", label: "30 يوم" },
                  { key: "90d", label: "90 يوم" },
                  { key: "custom", label: "مخصص" },
                ] as { key: Period; label: string }[]).map(p => (
                  <Button
                    key={p.key}
                    variant={period === p.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPeriod(p.key)}
                    className={period === p.key ? "bg-[#ff6a00] hover:bg-[#ff8c00]" : ""}
                    data-testid={`btn-period-${p.key}`}
                  >
                    {p.label}
                  </Button>
                ))}
                {period === "custom" && (
                  <div className="flex items-center gap-2 ms-2">
                    <Input
                      type="date"
                      value={customFrom}
                      onChange={e => setCustomFrom(e.target.value)}
                      className="w-40 text-sm"
                      data-testid="input-custom-from"
                    />
                    <span className="text-gray-400">→</span>
                    <Input
                      type="date"
                      value={customTo}
                      onChange={e => setCustomTo(e.target.value)}
                      className="w-40 text-sm"
                      data-testid="input-custom-to"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Visits Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 size={18} className="text-[#ff6a00]" />
                الزيارات اليومية
                {analytics?.dailyVisits && (
                  <Badge className="text-xs bg-orange-100 text-[#ff6a00] border-0 ms-2">
                    {analytics.dailyVisits.reduce((s, d) => s + d.count, 0).toLocaleString()} زيارة
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw size={20} className="animate-spin text-gray-400" />
                </div>
              ) : !analytics?.dailyVisits?.length ? (
                <div className="text-center py-12 text-gray-400">
                  <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">لا توجد بيانات زيارات في هذه الفترة</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#ff6a00] inline-block" /> جوال</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#ff6a00]/40 inline-block" /> ديسكتوب</span>
                  </div>
                  <div className="flex items-end gap-[2px] h-48 overflow-x-auto pb-2" data-testid="chart-daily-visits">
                    {analytics.dailyVisits.map((d) => {
                      const height = (d.count / maxDailyCount) * 100;
                      const mobileH = d.count > 0 ? (d.mobile / d.count) * height : 0;
                      const desktopH = height - mobileH;
                      const dateObj = new Date(d.date);
                      const dayLabel = dateObj.toLocaleDateString("ar-SA", { day: "numeric" });
                      const monthLabel = dateObj.toLocaleDateString("ar-SA", { month: "short" });
                      return (
                        <div key={d.date} className="flex-1 min-w-[18px] max-w-[40px] flex flex-col items-center group relative">
                          <div className="absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {d.date} — {d.count} زيارة
                          </div>
                          <div className="w-full flex flex-col justify-end" style={{ height: "180px" }}>
                            <div className="w-full rounded-t bg-[#ff6a00]/40 transition-all" style={{ height: `${desktopH}%`, minHeight: desktopH > 0 ? "2px" : "0" }} />
                            <div className="w-full bg-[#ff6a00] transition-all" style={{ height: `${mobileH}%`, minHeight: mobileH > 0 ? "2px" : "0", borderRadius: desktopH > 0 ? "0" : "4px 4px 0 0" }} />
                          </div>
                          <span className="text-[9px] text-gray-400 mt-1 leading-none">{dayLabel}</span>
                          {(dateObj.getDate() === 1 || analytics.dailyVisits.indexOf(d) === 0) && (
                            <span className="text-[8px] text-gray-300 leading-none">{monthLabel}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Pages + Device Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Pages */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText size={16} className="text-[#ff6a00]" /> أكثر الصفحات زيارة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(analytics?.topPages || []).slice(0, 10).map((p, i) => {
                  return (
                    <div key={p.pageUrl} className="flex items-center gap-3" data-testid={`top-page-${i}`}>
                      <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate" title={p.pageUrl}>
                        {formatPageName(p.pageUrl)}
                      </span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 max-w-[120px]">
                        <div className="bg-[#ff6a00] h-2 rounded-full transition-all" style={{ width: `${Math.max(p.percentage, 3)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-500 w-20 text-left">{p.count.toLocaleString()} ({p.percentage}%)</span>
                    </div>
                  );
                })}
                {!analytics?.topPages?.length && (
                  <p className="text-sm text-gray-400 text-center py-6">لا توجد بيانات بعد</p>
                )}
              </CardContent>
            </Card>

            {/* Device / Browser / OS */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Smartphone size={16} className="text-[#ff6a00]" /> توزيع الأجهزة والمتصفحات
                  <span className="text-[10px] text-gray-400 font-normal">(إجمالي السجل)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">الأجهزة</p>
                  {(detailsData?.byDevice || []).filter(d => d.deviceType).map(d => {
                    const pct = detailsData?.total ? Math.round((d.count / detailsData.total) * 100) : 0;
                    return (
                      <div key={d.deviceType} className="flex items-center gap-3">
                        <DeviceIcon type={d.deviceType} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {d.deviceType === "mobile" ? "جوال" : d.deviceType === "tablet" ? "تابلت" : "ديسكتوب"}
                        </span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-16 text-left">{d.count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">المتصفحات</p>
                  {(detailsData?.byBrowser || []).filter(b => b.browser).slice(0, 5).map(b => {
                    const pct = detailsData?.total ? Math.round((b.count / detailsData.total) * 100) : 0;
                    return (
                      <div key={b.browser} className="flex items-center gap-3">
                        <Chrome size={14} className="text-orange-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{b.browser}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-16 text-left">{b.count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">أنظمة التشغيل</p>
                  {(detailsData?.byOS || []).filter(o => o.osName).slice(0, 5).map(o => {
                    const pct = detailsData?.total ? Math.round((o.count / detailsData.total) * 100) : 0;
                    return (
                      <div key={o.osName} className="flex items-center gap-3">
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{o.osName}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-16 text-left">{o.count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
                {!detailsData?.byDevice?.length && <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات بعد</p>}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "details" && (
        <>
          {/* Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Filter size={16} className="text-gray-400" />
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="ابحث بـ IP أو دولة أو مدينة أو صفحة..."
                    className="pr-9 text-sm"
                    data-testid="input-visitor-search"
                  />
                </div>
                <Select value={deviceFilter} onValueChange={v => { setDeviceFilter(v); setPage(0); }}>
                  <SelectTrigger className="w-40" data-testid="select-device-filter">
                    <SelectValue placeholder="نوع الجهاز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأجهزة</SelectItem>
                    <SelectItem value="mobile">جوال</SelectItem>
                    <SelectItem value="tablet">تابلت</SelectItem>
                    <SelectItem value="desktop">ديسكتوب</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={countryFilter}
                  onChange={e => { setCountryFilter(e.target.value); setPage(0); }}
                  placeholder="فلترة بالدولة..."
                  className="w-44 text-sm"
                  data-testid="input-country-filter"
                />
                <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setDeviceFilter("all"); setCountryFilter(""); setPage(0); }}>
                  مسح الفلاتر
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visitors Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Eye size={18} className="text-[#ff6a00]" />
                  سجل الزوار
                  {detailsData?.total !== undefined && (
                    <Badge className="text-xs bg-orange-100 text-[#ff6a00] border-0">{detailsData.total.toLocaleString()} زيارة</Badge>
                  )}
                </CardTitle>
                {detailsData && detailsData.total > PAGE_SIZE && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                      السابق
                    </Button>
                    <span className="text-sm text-gray-500">صفحة {page + 1} من {Math.ceil(detailsData.total / PAGE_SIZE)}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= detailsData.total}>
                      التالي
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {detailsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <RefreshCw size={20} className="animate-spin text-gray-400" />
                </div>
              ) : !filteredLogs.length ? (
                <div className="text-center py-16 text-gray-400">
                  <Globe size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">لا توجد بيانات زوار بعد</p>
                  <p className="text-sm mt-1">ستظهر هنا بيانات الزوار الفعليين بمجرد زيارتهم للموقع</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs">الوقت</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs">IP</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs">الموقع</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs">الجهاز</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs">المتصفح / OS</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs">الصفحة</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs">المصدر</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs">مزود الإنترنت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors" data-testid={`row-visitor-${log.id}`}>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                            <Clock size={11} className="inline me-1 opacity-60" />
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-gray-700 dark:text-gray-300">
                              {log.ipAddress || "—"}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{getFlag(log.country)}</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-xs">{log.country || "—"}</p>
                                {log.city && <p className="text-gray-400 text-xs">{log.city}{log.region ? `, ${log.region}` : ""}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <DeviceIcon type={log.deviceType} />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {log.deviceType === "mobile" ? "جوال" : log.deviceType === "tablet" ? "تابلت" : log.deviceType === "desktop" ? "ديسكتوب" : "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.browser || "—"}</p>
                            <p className="text-xs text-gray-400">{log.osName || "—"}</p>
                          </td>
                          <td className="px-4 py-3 max-w-[160px]">
                            <div className="flex items-center gap-1">
                              <Link2 size={11} className="text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-[#ff6a00] dark:text-[#ff6a00] truncate" title={log.pageUrl || ""}>
                                {trimUrl(log.pageUrl)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-[120px]">
                            {log.referrer ? (
                              <span className="text-xs text-gray-400 truncate block" title={log.referrer}>
                                {log.referrer.replace(/^https?:\/\/(www\.)?/, "").slice(0, 25)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">مباشر</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Wifi size={11} className="text-gray-400" />
                              <span className="text-xs text-gray-500 truncate max-w-[100px]" title={log.isp || ""}>
                                {log.isp ? log.isp.slice(0, 20) : "—"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Marketing Insights */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10">
        <CardContent className="p-5">
          <h3 className="font-bold text-[#ff6a00] dark:text-[#ff6a00] mb-3 flex items-center gap-2">
            <TrendingUp size={18} /> نصائح لتحسين الحملات بناءً على بيانات الزوار
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4">
              <p className="font-bold mb-1 text-[#ff6a00]">📱 استهداف الموبايل</p>
              <p className="text-xs leading-relaxed">إذا كانت نسبة الجوال أعلى من 60% فوجّه ميزانية الإعلانات للتنسيقات المخصصة للجوال</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4">
              <p className="font-bold mb-1 text-[#ff6a00]">🌍 الاستهداف الجغرافي</p>
              <p className="text-xs leading-relaxed">استخدم بيانات الدول والمدن لإنشاء جماهير مخصصة في Meta وGoogle Ads</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4">
              <p className="font-bold mb-1 text-[#ff6a00]">📊 الصفحات الأكثر زيارة</p>
              <p className="text-xs leading-relaxed">ركّز جهودك التسويقية على الصفحات ذات الزيارات العالية وحسّن معدلات التحويل فيها</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
