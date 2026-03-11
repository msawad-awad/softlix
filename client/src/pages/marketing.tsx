import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Save, Megaphone, TrendingUp, Eye, Code2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { MarketingSettings } from "@shared/schema";

const TRACKING_TOOLS = [
  { key: "gtmId", label: "Google Tag Manager ID", placeholder: "GTM-XXXXXXX", icon: "📦", desc: "يُحمَّل تلقائياً في جميع صفحات الموقع العام" },
  { key: "metaPixelId", label: "Meta (Facebook) Pixel ID", placeholder: "XXXXXXXXXXXXXX", icon: "📘", desc: "يتتبع الزوار من إعلانات فيسبوك وإنستجرام" },
  { key: "googleAnalyticsId", label: "Google Analytics ID (GA4)", placeholder: "G-XXXXXXXXXX", icon: "📊", desc: "تحليلات جوجل لتتبع الزيارات والتحويلات" },
  { key: "tiktokPixelId", label: "TikTok Pixel ID", placeholder: "CXXXXXXXXXXXXXXXXXX", icon: "🎵", desc: "تتبع إعلانات تيك توك" },
  { key: "snapchatPixelId", label: "Snapchat Pixel ID", placeholder: "XXXXXXXX-XXXX-XXXX", icon: "👻", desc: "تتبع إعلانات سناب شات" },
  { key: "linkedinInsightId", label: "LinkedIn Insight Tag ID", placeholder: "XXXXXXX", icon: "💼", desc: "تتبع إعلانات لينكدإن" },
];

export default function Marketing() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    gtmId: "", metaPixelId: "", googleAnalyticsId: "",
    tiktokPixelId: "", snapchatPixelId: "", linkedinInsightId: "",
    customHeadScript: "", customBodyScript: "",
  });

  const { data: settings } = useQuery<MarketingSettings>({ queryKey: ["/api/marketing/settings"] });

  useEffect(() => {
    if (settings) {
      setForm({
        gtmId: settings.gtmId || "",
        metaPixelId: settings.metaPixelId || "",
        googleAnalyticsId: settings.googleAnalyticsId || "",
        tiktokPixelId: settings.tiktokPixelId || "",
        snapchatPixelId: settings.snapchatPixelId || "",
        linkedinInsightId: settings.linkedinInsightId || "",
        customHeadScript: settings.customHeadScript || "",
        customBodyScript: settings.customBodyScript || "",
      });
    }
  }, [settings]);

  const saveMut = useMutation({
    mutationFn: (data: typeof form) => apiRequest("PUT", "/api/marketing/settings", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/marketing/settings"] }); toast({ title: "تم حفظ إعدادات التسويق بنجاح" }); },
    onError: () => toast({ title: "حدث خطأ في الحفظ", variant: "destructive" }),
  });

  const F = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const activeCount = Object.entries(form).filter(([k, v]) => k !== "customHeadScript" && k !== "customBodyScript" && v.trim()).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">إعدادات التسويق والتتبع</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">ربط أكواد التتبع والتحليل بالموقع العام</p>
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
              {activeCount} {activeCount === 1 ? "خدمة" : "خدمات"} مفعّلة
            </Badge>
          )}
          <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} data-testid="btn-save-marketing">
            <Save className="w-4 h-4 me-2" />
            {saveMut.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <strong>تلميح:</strong> جميع الأكواد المضافة هنا ستُحمَّل تلقائياً في جميع صفحات الموقع العام. تأكد من صحة المعرفات (IDs) قبل الحفظ.
        </div>
      </div>

      {/* Tracking Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            أكواد التتبع والتحليل
          </CardTitle>
          <CardDescription>أضف معرفات أدوات التسويق لتتبع الزوار وقياس أداء الإعلانات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRACKING_TOOLS.map(tool => (
              <div key={tool.key}>
                <Label className="flex items-center gap-2 mb-1.5">
                  <span>{tool.icon}</span>
                  {tool.label}
                  {(form as any)[tool.key] && <Badge className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0 px-1.5 py-0">مفعّل</Badge>}
                </Label>
                <Input
                  data-testid={`input-${tool.key}`}
                  value={(form as any)[tool.key]}
                  onChange={e => F(tool.key, e.target.value)}
                  placeholder={tool.placeholder}
                  className="font-mono text-sm"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tool.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Scripts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            أكواد مخصصة
          </CardTitle>
          <CardDescription>أضف أكواد JavaScript أو HTML مخصصة في رأس أو نهاية الصفحات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="mb-1.5 block">كود الرأس &lt;head&gt;</Label>
            <Textarea
              data-testid="input-custom-head"
              value={form.customHeadScript}
              onChange={e => F("customHeadScript", e.target.value)}
              placeholder="<!-- أضف أكواد مخصصة هنا -->"
              rows={5}
              className="font-mono text-sm"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">يُضاف قبل إغلاق الـ &lt;/head&gt;</p>
          </div>
          <div>
            <Label className="mb-1.5 block">كود نهاية الصفحة &lt;body&gt;</Label>
            <Textarea
              data-testid="input-custom-body"
              value={form.customBodyScript}
              onChange={e => F("customBodyScript", e.target.value)}
              placeholder="<!-- أضف أكواد مخصصة هنا -->"
              rows={5}
              className="font-mono text-sm"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">يُضاف قبل إغلاق الـ &lt;/body&gt;</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} size="lg" data-testid="btn-save-marketing-bottom">
          <Save className="w-4 h-4 me-2" />
          {saveMut.isPending ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
        </Button>
      </div>
    </div>
  );
}
