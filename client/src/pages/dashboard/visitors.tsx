import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Globe, Smartphone, Monitor, Tablet, Chrome, MapPin, Clock,
  Filter, Download, RefreshCw, Users, TrendingUp, Eye, Wifi,
  Link2, Search,
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
  if (type === "mobile") return <Smartphone size={14} className="text-blue-500" />;
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

interface VisitorDetailsResponse {
  logs: VisitorLog[];
  total: number;
  byDevice: Array<{ deviceType: string | null; count: number }>;
  byBrowser: Array<{ browser: string | null; count: number }>;
  byOS: Array<{ osName: string | null; count: number }>;
}

export default function VisitorsPage() {
  const { toast } = useToast();
  const [countryFilter, setCountryFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const { data, isLoading, refetch } = useQuery<VisitorDetailsResponse>({
    queryKey: ["/api/dashboard/visitor-details", countryFilter, deviceFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
      if (countryFilter) params.set("country", countryFilter);
      if (deviceFilter && deviceFilter !== "all") params.set("deviceType", deviceFilter);
      const res = await fetch(`/api/dashboard/visitor-details?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const logs = data?.logs || [];
  const filteredLogs = search
    ? logs.filter(l =>
        l.country?.toLowerCase().includes(search.toLowerCase()) ||
        l.city?.toLowerCase().includes(search.toLowerCase()) ||
        l.ipAddress?.includes(search) ||
        l.pageUrl?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const kpiCards = [
    { label: "إجمالي الزوار", value: data?.total ?? 0, icon: <Users size={20} className="text-blue-500" />, color: "blue" },
    {
      label: "موبايل",
      value: data?.byDevice.find(d => d.deviceType === "mobile")?.count ?? 0,
      icon: <Smartphone size={20} className="text-green-500" />, color: "green"
    },
    {
      label: "سطح المكتب",
      value: data?.byDevice.find(d => d.deviceType === "desktop")?.count ?? 0,
      icon: <Monitor size={20} className="text-purple-500" />, color: "purple"
    },
    {
      label: "تابلت",
      value: data?.byDevice.find(d => d.deviceType === "tablet")?.count ?? 0,
      icon: <Tablet size={20} className="text-orange-500" />, color: "orange"
    },
  ];

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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">تحليلات الزوار التفصيلية</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">عناوين IP، الدول، المدن، الأجهزة، والمتصفحات لكل زائر</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="btn-refresh-visitors">
            <RefreshCw size={14} className="me-1" /> تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="btn-export-visitors">
            <Download size={14} className="me-1" /> تصدير CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <Card key={k.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-${k.color}-50 dark:bg-${k.color}-900/20 flex items-center justify-center flex-shrink-0`}>
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Device */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Smartphone size={16} className="text-blue-500" /> توزيع الأجهزة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.byDevice || []).filter(d => d.deviceType).map(d => {
              const pct = data?.total ? Math.round((d.count / data.total) * 100) : 0;
              return (
                <div key={d.deviceType} className="flex items-center gap-3">
                  <DeviceIcon type={d.deviceType} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {d.deviceType === "mobile" ? "موبايل" : d.deviceType === "tablet" ? "تابلت" : "سطح المكتب"}
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 w-12 text-left">{d.count} <span className="text-gray-400">({pct}%)</span></span>
                </div>
              );
            })}
            {!data?.byDevice?.length && <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات بعد</p>}
          </CardContent>
        </Card>

        {/* By Browser */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Chrome size={16} className="text-orange-500" /> المتصفحات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.byBrowser || []).filter(b => b.browser).slice(0, 6).map(b => {
              const pct = data?.total ? Math.round((b.count / data.total) * 100) : 0;
              return (
                <div key={b.browser} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{b.browser}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 w-12 text-left">{b.count} <span className="text-gray-400">({pct}%)</span></span>
                </div>
              );
            })}
            {!data?.byBrowser?.filter(b => b.browser).length && <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات بعد</p>}
          </CardContent>
        </Card>

        {/* By OS */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" /> أنظمة التشغيل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.byOS || []).filter(o => o.osName).slice(0, 6).map(o => {
              const pct = data?.total ? Math.round((o.count / data.total) * 100) : 0;
              return (
                <div key={o.osName} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{o.osName}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 w-12 text-left">{o.count} <span className="text-gray-400">({pct}%)</span></span>
                </div>
              );
            })}
            {!data?.byOS?.filter(o => o.osName).length && <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات بعد</p>}
          </CardContent>
        </Card>
      </div>

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
                <SelectItem value="mobile">موبايل</SelectItem>
                <SelectItem value="tablet">تابلت</SelectItem>
                <SelectItem value="desktop">سطح المكتب</SelectItem>
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
              <Eye size={18} className="text-blue-500" />
              سجل الزوار
              {data?.total !== undefined && (
                <Badge className="text-xs bg-blue-100 text-blue-700 border-0">{data.total.toLocaleString()} زيارة</Badge>
              )}
            </CardTitle>
            {data && data.total > PAGE_SIZE && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                  السابق
                </Button>
                <span className="text-sm text-gray-500">صفحة {page + 1} من {Math.ceil(data.total / PAGE_SIZE)}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= data.total}>
                  التالي
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
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
                            {log.deviceType === "mobile" ? "موبايل" : log.deviceType === "tablet" ? "تابلت" : log.deviceType === "desktop" ? "ديسكتوب" : "—"}
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
                          <span className="text-xs text-blue-600 dark:text-blue-400 truncate" title={log.pageUrl || ""}>
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

      {/* Marketing Insights Box */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-5">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <TrendingUp size={18} /> نصائح لتحسين الحملات بناءً على بيانات الزوار
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-300">
            <div className="bg-white/70 dark:bg-blue-900/30 rounded-xl p-4">
              <p className="font-bold mb-1">📱 استهداف الموبايل</p>
              <p className="text-xs leading-relaxed">إذا كانت نسبة الموبايل أعلى من 60% فوجّه ميزانية الإعلانات للتنسيقات المخصصة للجوال (Stories, Reels)</p>
            </div>
            <div className="bg-white/70 dark:bg-blue-900/30 rounded-xl p-4">
              <p className="font-bold mb-1">🌍 الاستهداف الجغرافي</p>
              <p className="text-xs leading-relaxed">استخدم بيانات الدول والمدن لإنشاء جماهير مخصصة (Custom Audiences) في Meta وGoogle Ads</p>
            </div>
            <div className="bg-white/70 dark:bg-blue-900/30 rounded-xl p-4">
              <p className="font-bold mb-1">🔄 إعادة الاستهداف</p>
              <p className="text-xs leading-relaxed">صدّر IPs والجلسات لاستخدامها في حملات الـ Retargeting وتحديد جماهير Lookalike</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
