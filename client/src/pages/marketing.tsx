import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Save, Megaphone, TrendingUp, Eye, Code2, Info, MessageCircle,
  SlidersHorizontal, Bell, Zap, Users, Phone, DollarSign,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { MarketingSettings } from "@shared/schema";
import { Link } from "wouter";

const TRACKING_TOOLS = [
  { key: "gtmId", label: "Google Tag Manager ID", placeholder: "GTM-XXXXXXX", icon: "📦", desc: "يُحمَّل تلقائياً في جميع صفحات الموقع — ضع المعرّف فقط مثل GTM-59G4JW2" },
  { key: "googleAnalyticsId", label: "Google Analytics 4 ID", placeholder: "G-XXXXXXXXXX", icon: "📊", desc: "تحليلات جوجل GA4 — المعرّف يبدأ بـ G-" },
  { key: "googleAdsId", label: "Google Ads (Conversion) ID", placeholder: "AW-XXXXXXXXX", icon: "🎯", desc: "تتبع إعلانات جوجل والتحويلات — مثل AW-467275968" },
  { key: "metaPixelId", label: "Meta (Facebook) Pixel ID", placeholder: "XXXXXXXXXXXXXX", icon: "📘", desc: "يتتبع الزوار من إعلانات فيسبوك وإنستجرام" },
  { key: "tiktokPixelId", label: "TikTok Pixel ID", placeholder: "CXXXXXXXXXXXXXXXXXX", icon: "🎵", desc: "تتبع إعلانات تيك توك" },
  { key: "snapchatPixelId", label: "Snapchat Pixel ID", placeholder: "XXXXXXXX-XXXX-XXXX", icon: "👻", desc: "تتبع إعلانات سناب شات" },
  { key: "linkedinInsightId", label: "LinkedIn Insight Tag ID", placeholder: "XXXXXXX", icon: "💼", desc: "تتبع إعلانات لينكدإن" },
];

type FormState = {
  gtmId: string; metaPixelId: string; googleAnalyticsId: string; googleAdsId: string;
  tiktokPixelId: string; snapchatPixelId: string; linkedinInsightId: string;
  customHeadScript: string; customBodyScript: string;
  whatsappEnabled: boolean; whatsappNumber: string; whatsappMessage: string; whatsappPosition: string;
  exitIntentEnabled: boolean; exitIntentTitleAr: string; exitIntentTitleEn: string;
  exitIntentSubtitleAr: string; exitIntentSubtitleEn: string;
  exitIntentButtonAr: string; exitIntentButtonEn: string;
  exitIntentButtonUrl: string; exitIntentDelay: number;
  socialProofEnabled: boolean; socialProofInterval: number;
  newsletterEnabled: boolean; newsletterTitleAr: string; newsletterTitleEn: string;
};

const DEFAULT_FORM: FormState = {
  gtmId: "", metaPixelId: "", googleAnalyticsId: "", googleAdsId: "",
  tiktokPixelId: "", snapchatPixelId: "", linkedinInsightId: "",
  customHeadScript: "", customBodyScript: "",
  whatsappEnabled: false, whatsappNumber: "", whatsappMessage: "مرحباً، أود الاستفسار عن خدماتكم", whatsappPosition: "bottom-right",
  exitIntentEnabled: false, exitIntentTitleAr: "لا تغادر قبل أن تعرف هذا!", exitIntentTitleEn: "Don't leave before knowing this!",
  exitIntentSubtitleAr: "احصل على استشارة مجانية لمشروعك خلال 24 ساعة", exitIntentSubtitleEn: "Get a free consultation within 24 hours",
  exitIntentButtonAr: "احصل على استشارتك المجانية", exitIntentButtonEn: "Get Your Free Consultation",
  exitIntentButtonUrl: "", exitIntentDelay: 3,
  socialProofEnabled: false, socialProofInterval: 8,
  newsletterEnabled: false, newsletterTitleAr: "اشترك في نشرتنا البريدية", newsletterTitleEn: "Subscribe to Our Newsletter",
};

export default function Marketing() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const { data: settings } = useQuery<MarketingSettings>({ queryKey: ["/api/marketing/settings"] });

  useEffect(() => {
    if (settings) {
      setForm({
        gtmId: settings.gtmId || "",
        metaPixelId: settings.metaPixelId || "",
        googleAnalyticsId: settings.googleAnalyticsId || "",
        googleAdsId: (settings as any).googleAdsId || "",
        tiktokPixelId: settings.tiktokPixelId || "",
        snapchatPixelId: settings.snapchatPixelId || "",
        linkedinInsightId: settings.linkedinInsightId || "",
        customHeadScript: settings.customHeadScript || "",
        customBodyScript: settings.customBodyScript || "",
        whatsappEnabled: settings.whatsappEnabled ?? false,
        whatsappNumber: settings.whatsappNumber || "",
        whatsappMessage: settings.whatsappMessage || "مرحباً، أود الاستفسار عن خدماتكم",
        whatsappPosition: settings.whatsappPosition || "bottom-right",
        exitIntentEnabled: settings.exitIntentEnabled ?? false,
        exitIntentTitleAr: settings.exitIntentTitleAr || "لا تغادر قبل أن تعرف هذا!",
        exitIntentTitleEn: settings.exitIntentTitleEn || "Don't leave before knowing this!",
        exitIntentSubtitleAr: settings.exitIntentSubtitleAr || "احصل على استشارة مجانية لمشروعك خلال 24 ساعة",
        exitIntentSubtitleEn: settings.exitIntentSubtitleEn || "Get a free consultation within 24 hours",
        exitIntentButtonAr: settings.exitIntentButtonAr || "احصل على استشارتك المجانية",
        exitIntentButtonEn: settings.exitIntentButtonEn || "Get Your Free Consultation",
        exitIntentButtonUrl: settings.exitIntentButtonUrl || "",
        exitIntentDelay: settings.exitIntentDelay ?? 3,
        socialProofEnabled: settings.socialProofEnabled ?? false,
        socialProofInterval: settings.socialProofInterval ?? 8,
        newsletterEnabled: settings.newsletterEnabled ?? false,
        newsletterTitleAr: settings.newsletterTitleAr || "اشترك في نشرتنا البريدية",
        newsletterTitleEn: settings.newsletterTitleEn || "Subscribe to Our Newsletter",
      });
    }
  }, [settings]);

  const saveMut = useMutation({
    mutationFn: (data: FormState) => apiRequest("PUT", "/api/marketing/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/marketing-settings"] });
      toast({ title: "✅ تم حفظ إعدادات التسويق بنجاح" });
    },
    onError: () => toast({ title: "حدث خطأ في الحفظ", variant: "destructive" }),
  });

  const F = (k: keyof FormState, v: string | boolean | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const activeTrackingCount = TRACKING_TOOLS.filter(t => (form as any)[t.key]?.trim()).length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">إعدادات التسويق والويدجت</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">ربط أكواد التتبع وإعدادات الأدوات التسويقية على الموقع</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {activeTrackingCount > 0 && (
            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
              {activeTrackingCount} خدمات تتبع مفعّلة
            </Badge>
          )}
          {form.whatsappEnabled && <Badge className="bg-green-100 text-green-700 border-0">WhatsApp مفعّل ✓</Badge>}
          {form.exitIntentEnabled && <Badge className="bg-orange-100 text-orange-700 border-0">Exit Popup مفعّل ✓</Badge>}
          {form.socialProofEnabled && <Badge className="bg-purple-100 text-purple-700 border-0">Social Proof مفعّل ✓</Badge>}
          {form.newsletterEnabled && <Badge className="bg-orange-100 text-[#ff6a00] border-0">Newsletter مفعّل ✓</Badge>}
          <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} data-testid="btn-save-marketing">
            <Save className="w-4 h-4 me-2" />
            {saveMut.isPending ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-[#ff6a00] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#ff6a00] dark:text-[#ff6a00]">
          <strong>تلميح:</strong> جميع الإعدادات هنا تنعكس مباشرة على الموقع العام بعد الحفظ.
        </p>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "النشرة البريدية", href: "/marketing/newsletter", icon: <Bell size={18} className="text-[#ff6a00]" />, badge: `${0} مشترك`, color: "blue" },
          { label: "باقات الأسعار", href: "/marketing/pricing", icon: <DollarSign size={18} className="text-green-600" />, badge: "إدارة الباقات", color: "green" },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <a className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
              <div className={`w-9 h-9 rounded-lg bg-${item.color}-50 flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400">{item.badge}</p>
              </div>
            </a>
          </Link>
        ))}
      </div>

      {/* === WHATSAPP WIDGET === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SiWhatsapp className="text-green-500" size={20} />
              زر WhatsApp العائم
            </div>
            <Switch
              checked={form.whatsappEnabled}
              onCheckedChange={v => F("whatsappEnabled", v)}
              data-testid="switch-whatsapp"
            />
          </CardTitle>
          <CardDescription>زر دائري عائم في أسفل الموقع يفتح محادثة WhatsApp مباشرة مع الزوار</CardDescription>
        </CardHeader>
        {form.whatsappEnabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>رقم WhatsApp (بدون + أو صفر)</Label>
                <Input
                  value={form.whatsappNumber}
                  onChange={e => F("whatsappNumber", e.target.value)}
                  placeholder="966537861534"
                  dir="ltr"
                  data-testid="input-whatsapp-number"
                />
                <p className="text-xs text-slate-400">مثال: 966537861534</p>
              </div>
              <div className="space-y-1.5">
                <Label>موضع الزر</Label>
                <Select value={form.whatsappPosition} onValueChange={v => F("whatsappPosition", v)}>
                  <SelectTrigger data-testid="select-whatsapp-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">أسفل اليمين</SelectItem>
                    <SelectItem value="bottom-left">أسفل اليسار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>رسالة ترحيبية افتراضية</Label>
              <Input
                value={form.whatsappMessage}
                onChange={e => F("whatsappMessage", e.target.value)}
                placeholder="مرحباً، أود الاستفسار عن خدماتكم"
                data-testid="input-whatsapp-message"
              />
              <p className="text-xs text-slate-400">ستظهر هذه الرسالة مسبقاً عند فتح WhatsApp</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* === EXIT INTENT POPUP === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="text-orange-500" size={20} />
              Exit Intent Popup
            </div>
            <Switch
              checked={form.exitIntentEnabled}
              onCheckedChange={v => F("exitIntentEnabled", v)}
              data-testid="switch-exit-intent"
            />
          </CardTitle>
          <CardDescription>نافذة منبثقة تظهر عندما يحاول الزائر مغادرة الموقع — لاسترداد الزوار قبل خروجهم</CardDescription>
        </CardHeader>
        {form.exitIntentEnabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>العنوان (عربي)</Label>
                <Input value={form.exitIntentTitleAr} onChange={e => F("exitIntentTitleAr", e.target.value)} placeholder="لا تغادر قبل أن تعرف هذا!" />
              </div>
              <div className="space-y-1.5">
                <Label>Title (English)</Label>
                <Input value={form.exitIntentTitleEn} onChange={e => F("exitIntentTitleEn", e.target.value)} placeholder="Don't leave before knowing this!" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>النص الفرعي (عربي)</Label>
                <Input value={form.exitIntentSubtitleAr} onChange={e => F("exitIntentSubtitleAr", e.target.value)} placeholder="احصل على استشارة مجانية" />
              </div>
              <div className="space-y-1.5">
                <Label>Subtitle (English)</Label>
                <Input value={form.exitIntentSubtitleEn} onChange={e => F("exitIntentSubtitleEn", e.target.value)} placeholder="Get a free consultation" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>نص الزر (عربي)</Label>
                <Input value={form.exitIntentButtonAr} onChange={e => F("exitIntentButtonAr", e.target.value)} placeholder="احصل على استشارتك المجانية" />
              </div>
              <div className="space-y-1.5">
                <Label>Button Text (EN)</Label>
                <Input value={form.exitIntentButtonEn} onChange={e => F("exitIntentButtonEn", e.target.value)} placeholder="Get Your Free Consultation" dir="ltr" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>رابط الزر (اختياري — يُحوّل بدلاً من نموذج)</Label>
                <Input value={form.exitIntentButtonUrl} onChange={e => F("exitIntentButtonUrl", e.target.value)} placeholder="/contact أو رابط خارجي" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>التأخير قبل التفعيل (بالثواني)</Label>
                <Input type="number" min={0} max={60} value={form.exitIntentDelay} onChange={e => F("exitIntentDelay", parseInt(e.target.value) || 0)} />
                <p className="text-xs text-slate-400">الحد الأدنى 0 — الموصى به 3 ثوانٍ</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* === SOCIAL PROOF === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="text-purple-500" size={20} />
              إشعارات Social Proof
            </div>
            <Switch
              checked={form.socialProofEnabled}
              onCheckedChange={v => F("socialProofEnabled", v)}
              data-testid="switch-social-proof"
            />
          </CardTitle>
          <CardDescription>
            إشعارات صغيرة تظهر في أسفل الصفحة تُظهر نشاط الزوار (مثل: "أحمد من الرياض حجز استشارة منذ 3 دقائق")
          </CardDescription>
        </CardHeader>
        {form.socialProofEnabled && (
          <CardContent>
            <div className="space-y-1.5">
              <Label>الفترة بين كل إشعار (بالثواني)</Label>
              <Input
                type="number" min={5} max={120} value={form.socialProofInterval}
                onChange={e => F("socialProofInterval", parseInt(e.target.value) || 8)}
                className="max-w-xs"
              />
              <p className="text-xs text-slate-400">الموصى به: 8-15 ثانية. الإشعارات مُولَّدة تلقائياً من قوالب واقعية.</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* === NEWSLETTER === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="text-[#ff6a00]" size={20} />
              النشرة البريدية
            </div>
            <Switch
              checked={form.newsletterEnabled}
              onCheckedChange={v => F("newsletterEnabled", v)}
              data-testid="switch-newsletter"
            />
          </CardTitle>
          <CardDescription>
            يُظهر نموذج الاشتراك في الـ Footer وفي صفحات الموقع
            <Link href="/marketing/newsletter" className="mr-2 text-orange-600 hover:underline text-xs font-bold">← عرض المشتركين</Link>
          </CardDescription>
        </CardHeader>
        {form.newsletterEnabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>عنوان النشرة (عربي)</Label>
                <Input value={form.newsletterTitleAr} onChange={e => F("newsletterTitleAr", e.target.value)} placeholder="اشترك في نشرتنا البريدية" />
              </div>
              <div className="space-y-1.5">
                <Label>Newsletter Title (EN)</Label>
                <Input value={form.newsletterTitleEn} onChange={e => F("newsletterTitleEn", e.target.value)} placeholder="Subscribe to Our Newsletter" dir="ltr" />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* === TRACKING CODES === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#ff6a00]" />
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
                  {(form as any)[tool.key] && <Badge className="text-xs bg-green-100 text-green-700 border-0 px-1.5 py-0">مفعّل</Badge>}
                </Label>
                <Input
                  data-testid={`input-${tool.key}`}
                  value={(form as any)[tool.key]}
                  onChange={e => F(tool.key as keyof FormState, e.target.value)}
                  placeholder={tool.placeholder}
                  className="font-mono text-sm"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">{tool.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* === CUSTOM SCRIPTS === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-600" />
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
            <p className="text-xs text-gray-500 mt-1">يُضاف قبل إغلاق الـ &lt;/head&gt;</p>
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
            <p className="text-xs text-gray-500 mt-1">يُضاف قبل إغلاق الـ &lt;/body&gt;</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start pb-8">
        <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} size="lg" data-testid="btn-save-marketing-bottom">
          <Save className="w-4 h-4 me-2" />
          {saveMut.isPending ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
        </Button>
      </div>
    </div>
  );
}
