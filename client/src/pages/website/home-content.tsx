import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Home, RefreshCw, ChevronRight } from "lucide-react";

const SECTIONS = [
  { key: "hero", label: "الهيرو (Hero)", fields: [
    { key: "badge", label: "نص الشارة", type: "input" },
    { key: "h1", label: "العنوان الرئيسي H1", type: "textarea", hint: "يدعم كلمة مميزة بـ **نص**" },
    { key: "subtitle", label: "النص التعريفي", type: "textarea" },
    { key: "cta1Text", label: "نص الزر الأول", type: "input" },
    { key: "cta1Href", label: "رابط الزر الأول", type: "input" },
    { key: "cta2Text", label: "نص الزر الثاني", type: "input" },
    { key: "cta2Href", label: "رابط الزر الثاني", type: "input" },
  ]},
  { key: "services_section", label: "قسم الخدمات", fields: [
    { key: "badge", label: "نص الشارة", type: "input" },
    { key: "h2", label: "العنوان الرئيسي", type: "input" },
    { key: "subtitle", label: "النص التعريفي", type: "textarea" },
  ]},
  { key: "projects_section", label: "قسم الأعمال", fields: [
    { key: "badge", label: "نص الشارة", type: "input" },
    { key: "h2", label: "العنوان الرئيسي", type: "input" },
    { key: "subtitle", label: "النص التعريفي", type: "textarea" },
  ]},
  { key: "why_us_section", label: "لماذا نحن؟", fields: [
    { key: "badge", label: "نص الشارة", type: "input" },
    { key: "h2", label: "العنوان الرئيسي", type: "input" },
    { key: "subtitle", label: "النص التعريفي", type: "textarea" },
  ]},
  { key: "process_section", label: "خطوات العمل", fields: [
    { key: "badge", label: "نص الشارة", type: "input" },
    { key: "h2", label: "العنوان الرئيسي", type: "input" },
    { key: "subtitle", label: "النص التعريفي", type: "textarea" },
  ]},
  { key: "testimonials_section", label: "الشهادات", fields: [
    { key: "badge", label: "نص الشارة", type: "input" },
    { key: "h2", label: "العنوان الرئيسي", type: "input" },
  ]},
  { key: "cta", label: "CTA النهائي", fields: [
    { key: "h2", label: "العنوان الرئيسي", type: "input" },
    { key: "subtitle", label: "النص التعريفي", type: "textarea" },
    { key: "cta1Text", label: "نص الزر الأول", type: "input" },
    { key: "cta2Text", label: "نص الزر الثاني", type: "input" },
  ]},
];

function SectionEditor({
  sectionKey, fields, page,
}: { sectionKey: string; fields: { key: string; label: string; type: string; hint?: string }[]; page: string }) {
  const { toast } = useToast();
  const { data: allSections } = useQuery<Record<string, any>>({ queryKey: ["/api/cms/page-sections", page] });
  const section = allSections?.[sectionKey];

  const [ar, setAr] = useState<Record<string, string>>({});
  const [en, setEn] = useState<Record<string, string>>({});

  useEffect(() => {
    if (section) {
      setAr((section.contentAr as Record<string, string>) || {});
      setEn((section.contentEn as Record<string, string>) || {});
    }
  }, [section]);

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", `/api/cms/page-sections/${page}/${sectionKey}`, { contentAr: ar, contentEn: en }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/page-sections", page] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/page-sections", page] });
      toast({ title: "✅ تم الحفظ" });
    },
    onError: () => toast({ title: "خطأ في الحفظ", variant: "destructive" }),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{SECTIONS.find(s => s.key === sectionKey)?.label}</CardTitle>
          </div>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid={`btn-save-${sectionKey}`}>
            <Save className="w-3.5 h-3.5 me-1" />
            {saveMutation.isPending ? "..." : "حفظ"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className="space-y-2">
              <Label className="text-sm font-semibold">{f.label}</Label>
              {f.hint && <p className="text-xs text-gray-400">{f.hint}</p>}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-orange-500 font-bold mb-1 block">عربي</span>
                  {f.type === "textarea" ? (
                    <Textarea
                      value={ar[f.key] || ""}
                      onChange={e => setAr(p => ({ ...p, [f.key]: e.target.value }))}
                      className="resize-none text-right text-sm"
                      dir="rtl"
                      rows={3}
                      data-testid={`ar-${sectionKey}-${f.key}`}
                    />
                  ) : (
                    <Input
                      value={ar[f.key] || ""}
                      onChange={e => setAr(p => ({ ...p, [f.key]: e.target.value }))}
                      className="text-right text-sm"
                      dir="rtl"
                      data-testid={`ar-${sectionKey}-${f.key}`}
                    />
                  )}
                </div>
                <div>
                  <span className="text-xs text-blue-500 font-bold mb-1 block">English</span>
                  {f.type === "textarea" ? (
                    <Textarea
                      value={en[f.key] || ""}
                      onChange={e => setEn(p => ({ ...p, [f.key]: e.target.value }))}
                      className="resize-none text-sm"
                      rows={3}
                      data-testid={`en-${sectionKey}-${f.key}`}
                    />
                  ) : (
                    <Input
                      value={en[f.key] || ""}
                      onChange={e => setEn(p => ({ ...p, [f.key]: e.target.value }))}
                      className="text-sm"
                      data-testid={`en-${sectionKey}-${f.key}`}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomeContentPage() {
  const page = "home";
  const { isLoading } = useQuery<Record<string, any>>({ queryKey: ["/api/cms/page-sections", page], queryFn: () => fetch(`/api/cms/page-sections/${page}`).then(r => r.json()) });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-500" />
            محتوى الصفحة الرئيسية
          </h1>
          <p className="text-gray-500 text-sm mt-1">تحرير كل سكشن في الصفحة الرئيسية بالعربية والإنجليزية</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/" target="_blank"><Eye className="w-4 h-4 me-1" />معاينة</a>
        </Button>
      </div>

      <div className="space-y-4">
        {SECTIONS.map(s => (
          <SectionEditor key={s.key} sectionKey={s.key} fields={s.fields} page={page} />
        ))}
      </div>
    </div>
  );
}
