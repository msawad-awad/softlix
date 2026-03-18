import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Palette, Globe, Phone, Share2, Type, Save, Eye, RefreshCw, ImageIcon } from "lucide-react";
import type { SiteSettings } from "@shared/schema";

const FONTS = ["Cairo", "Tajawal", "IBM Plex Arabic", "Noto Kufi Arabic", "Almarai", "Rubik", "Inter", "Poppins"];

function ColorField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value || "#000000"}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
          data-testid={`color-${name}`}
        />
      </div>
      <div className="flex-1">
        <Label className="text-xs text-gray-500 mb-1 block">{label}</Label>
        <Input
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-sm h-8"
          data-testid={`input-color-${name}`}
        />
      </div>
    </div>
  );
}

export default function BrandingPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<SiteSettings>({ queryKey: ["/api/cms/site-settings"] });

  const { register, handleSubmit, watch, setValue, reset, formState: { isDirty } } = useForm<any>({
    defaultValues: {
      siteNameAr: "softlix", siteNameEn: "softlix",
      siteDescAr: "", siteDescEn: "",
      logoUrl: "", faviconUrl: "",
      colorPrimary: "#e59269", colorSecondary: "#82b735",
      colorAccent: "#0f172a", colorBg: "#f8fafc", colorText: "#0f172a",
      fontFamily: "Cairo",
      contactPhone: "", contactEmail: "",
      contactAddressAr: "", contactAddressEn: "",
      contactHoursAr: "", contactHoursEn: "",
      socialX: "", socialInstagram: "", socialLinkedIn: "",
      socialWhatsapp: "", socialFacebook: "", socialYoutube: "",
      footerDescAr: "", footerDescEn: "",
    }
  });

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", "/api/cms/site-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/site-settings"] });
      toast({ title: "✅ تم الحفظ", description: "تم حفظ إعدادات الموقع بنجاح" });
    },
    onError: () => toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 animate-spin text-[#ff6a00]" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-500" />
            البراندينج والإعدادات العامة
          </h1>
          <p className="text-gray-500 text-sm mt-1">تحكم في الشعار، الألوان، الخطوط، معلومات الاتصال والسوشيال ميديا</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild data-testid="btn-preview-site">
            <a href="/" target="_blank"><Eye className="w-4 h-4 me-1" />معاينة الموقع</a>
          </Button>
          <Button onClick={handleSubmit(d => saveMutation.mutate(d))} disabled={saveMutation.isPending} data-testid="btn-save-branding">
            <Save className="w-4 h-4 me-2" />
            {saveMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))}>
        <Tabs defaultValue="identity">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="identity"><Globe className="w-4 h-4 me-1" />الهوية</TabsTrigger>
            <TabsTrigger value="logo"><ImageIcon className="w-4 h-4 me-1" />الشعار واللوغو</TabsTrigger>
            <TabsTrigger value="colors"><Palette className="w-4 h-4 me-1" />الألوان</TabsTrigger>
            <TabsTrigger value="typography"><Type className="w-4 h-4 me-1" />الخطوط</TabsTrigger>
            <TabsTrigger value="contact"><Phone className="w-4 h-4 me-1" />التواصل</TabsTrigger>
            <TabsTrigger value="social"><Share2 className="w-4 h-4 me-1" />السوشيال</TabsTrigger>
          </TabsList>

          {/* Identity */}
          <TabsContent value="identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">اسم الموقع</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>الاسم بالعربية</Label>
                    <Input {...register("siteNameAr")} className="mt-1 text-right" dir="rtl" data-testid="input-site-name-ar" />
                  </div>
                  <div>
                    <Label>الاسم بالإنجليزية</Label>
                    <Input {...register("siteNameEn")} className="mt-1" data-testid="input-site-name-en" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">وصف الموقع (Meta)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>الوصف بالعربية</Label>
                    <Textarea {...register("siteDescAr")} className="mt-1 text-right resize-none" dir="rtl" rows={3} data-testid="input-site-desc-ar" />
                  </div>
                  <div>
                    <Label>الوصف بالإنجليزية</Label>
                    <Textarea {...register("siteDescEn")} className="mt-1 resize-none" rows={3} data-testid="input-site-desc-en" />
                  </div>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-base">نص الفوتر</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>وصف الشركة في الفوتر (عربي)</Label>
                    <Textarea {...register("footerDescAr")} className="mt-1 text-right resize-none" dir="rtl" rows={3} data-testid="input-footer-desc-ar" />
                  </div>
                  <div>
                    <Label>وصف الشركة في الفوتر (إنجليزي)</Label>
                    <Textarea {...register("footerDescEn")} className="mt-1 resize-none" rows={3} data-testid="input-footer-desc-en" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logo & Favicon */}
          <TabsContent value="logo">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">شعار الموقع (Logo)</CardTitle>
                  <CardDescription>يظهر في الهيدر والفوتر والبريد الإلكتروني. يُفضل PNG أو SVG بخلفية شفافة.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    value={watch("logoUrl")}
                    onChange={v => setValue("logoUrl", v, { shouldDirty: true })}
                    label="رفع الشعار أو إدخال رابطه"
                    hint="يُفضل أبعاد: 200×60 بكسل أو SVG"
                    data-testid="uploader-logo"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">أيقونة الموقع (Favicon)</CardTitle>
                  <CardDescription>الأيقونة الصغيرة التي تظهر في تبويب المتصفح. يجب أن تكون ICO أو PNG 32×32.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    value={watch("faviconUrl")}
                    onChange={v => setValue("faviconUrl", v, { shouldDirty: true })}
                    label="رفع الفافيكون أو إدخال رابطه"
                    hint="يُفضل أبعاد: 32×32 أو 64×64 بكسل (ICO أو PNG)"
                    data-testid="uploader-favicon"
                  />
                </CardContent>
              </Card>

              {/* Live preview */}
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-base">معاينة الهيدر</CardTitle></CardHeader>
                <CardContent>
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl border"
                    style={{ background: watch("colorBg") || "#f8fafc" }}
                  >
                    {watch("logoUrl") ? (
                      <img
                        src={watch("logoUrl")}
                        alt="logo preview"
                        className="h-10 w-auto max-w-[160px] object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div
                        className="h-10 px-4 rounded-lg flex items-center font-black text-white text-lg"
                        style={{ background: `linear-gradient(135deg, ${watch("colorPrimary") || "#e59269"}, ${watch("colorSecondary") || "#82b735"})` }}
                      >
                        {watch("siteNameEn") || "Softlix"}
                      </div>
                    )}
                    <span className="text-sm font-medium" style={{ color: watch("colorText") || "#0f172a" }}>
                      {watch("siteNameAr") || "سوفتلكس"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Colors */}
          <TabsContent value="colors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ألوان البراند</CardTitle>
                  <CardDescription>الألوان الرئيسية المستخدمة في الأزرار والتدرجات والتمييز</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ColorField label="اللون الأساسي (Primary)" name="primary" value={watch("colorPrimary")} onChange={v => setValue("colorPrimary", v)} />
                  <ColorField label="اللون الثانوي (Secondary)" name="secondary" value={watch("colorSecondary")} onChange={v => setValue("colorSecondary", v)} />
                  <ColorField label="لون التمييز (Accent)" name="accent" value={watch("colorAccent")} onChange={v => setValue("colorAccent", v)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ألوان الواجهة</CardTitle>
                  <CardDescription>خلفية الصفحة ولون النص الأساسي</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ColorField label="لون الخلفية (Background)" name="bg" value={watch("colorBg")} onChange={v => setValue("colorBg", v)} />
                  <ColorField label="لون النص الأساسي (Text)" name="text" value={watch("colorText")} onChange={v => setValue("colorText", v)} />
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-base">معاينة الألوان</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Primary", color: watch("colorPrimary") },
                      { label: "Secondary", color: watch("colorSecondary") },
                      { label: "Accent", color: watch("colorAccent") },
                      { label: "Background", color: watch("colorBg") },
                      { label: "Text", color: watch("colorText") },
                    ].map(c => (
                      <div key={c.label} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                        <div className="w-8 h-8 rounded-lg border border-gray-200" style={{ background: c.color }} />
                        <div>
                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.label}</div>
                          <div className="text-xs text-gray-400 font-mono">{c.color}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 rounded-xl border" style={{ background: watch("colorBg") }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${watch("colorPrimary")}, ${watch("colorSecondary")})` }} />
                      <span className="font-bold" style={{ color: watch("colorText"), fontFamily: watch("fontFamily") || "Cairo" }}>
                        {watch("siteNameAr") || "softlix"}
                      </span>
                    </div>
                    <button className="px-4 py-2 rounded-full text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${watch("colorPrimary")}, ${watch("colorSecondary")})` }}>
                      تواصل معنا
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Typography */}
          <TabsContent value="typography">
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle className="text-base">عائلة الخط</CardTitle>
                <CardDescription>الخط المستخدم في جميع نصوص الموقع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {FONTS.map(font => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => setValue("fontFamily", font)}
                      data-testid={`font-${font}`}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${watch("fontFamily") === font ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                    >
                      <div className="text-sm font-semibold" style={{ fontFamily: font }}>{font}</div>
                      <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: font }}>مرحباً بالعالم</div>
                    </button>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 mb-2">معاينة النص:</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: watch("fontFamily") || "Cairo" }}>
                    نحن نبني مستقبل الأعمال الرقمية
                  </p>
                  <p className="text-base text-gray-500 mt-2" style={{ fontFamily: watch("fontFamily") || "Cairo" }}>
                    We Build the Future of Digital Business
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">معلومات الاتصال</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>رقم الهاتف</Label>
                    <Input {...register("contactPhone")} className="mt-1" placeholder="0537861534" dir="ltr" data-testid="input-contact-phone" />
                  </div>
                  <div>
                    <Label>البريد الإلكتروني</Label>
                    <Input {...register("contactEmail")} className="mt-1" placeholder="info@softlix.net" dir="ltr" data-testid="input-contact-email" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">العنوان وساعات العمل</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>العنوان (عربي)</Label>
                    <Input {...register("contactAddressAr")} className="mt-1 text-right" dir="rtl" data-testid="input-address-ar" />
                  </div>
                  <div>
                    <Label>العنوان (إنجليزي)</Label>
                    <Input {...register("contactAddressEn")} className="mt-1" data-testid="input-address-en" />
                  </div>
                  <div>
                    <Label>ساعات العمل (عربي)</Label>
                    <Input {...register("contactHoursAr")} className="mt-1 text-right" dir="rtl" placeholder="السبت - الخميس: 9ص - 6م" data-testid="input-hours-ar" />
                  </div>
                  <div>
                    <Label>ساعات العمل (إنجليزي)</Label>
                    <Input {...register("contactHoursEn")} className="mt-1" placeholder="Sat - Thu: 9AM - 6PM" data-testid="input-hours-en" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social */}
          <TabsContent value="social">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="text-base">روابط السوشيال ميديا</CardTitle>
                <CardDescription>أضف روابط حساباتك على منصات التواصل الاجتماعي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "socialX", label: "X (تويتر)", placeholder: "https://x.com/softlix" },
                  { key: "socialInstagram", label: "Instagram", placeholder: "https://instagram.com/softlix" },
                  { key: "socialLinkedIn", label: "LinkedIn", placeholder: "https://linkedin.com/company/softlix" },
                  { key: "socialWhatsapp", label: "WhatsApp (رابط كامل)", placeholder: "https://wa.me/966537861534" },
                  { key: "socialFacebook", label: "Facebook", placeholder: "https://facebook.com/softlix" },
                  { key: "socialYoutube", label: "YouTube", placeholder: "https://youtube.com/@softlix" },
                ].map(s => (
                  <div key={s.key} className="flex items-center gap-3">
                    <Label className="w-36 text-sm shrink-0">{s.label}</Label>
                    <Input {...register(s.key as any)} placeholder={s.placeholder} dir="ltr" data-testid={`input-${s.key}`} />
                  </div>
                ))}
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                  💡 رابط WhatsApp يجب أن يكون كاملاً مثل: https://wa.me/966537861534
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
