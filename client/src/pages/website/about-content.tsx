import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Plus, Pencil, Trash2, RefreshCw, Info } from "lucide-react";
import type { AboutValue, AboutTimeline } from "@shared/schema";

const PAGE_SECTIONS = [
  { key: "hero", label: "الهيرو", fields: [
    { key: "badge", label: "نص الشارة", type: "input" },
    { key: "h1", label: "العنوان الرئيسي", type: "textarea" },
    { key: "subtitle", label: "النص التعريفي", type: "textarea" },
    { key: "cta1Text", label: "نص الزر الأول", type: "input" },
    { key: "cta2Text", label: "نص الزر الثاني", type: "input" },
  ]},
  { key: "who_we_are", label: "من نحن", fields: [
    { key: "h2", label: "العنوان", type: "input" },
    { key: "body", label: "نص المقطع", type: "textarea" },
  ]},
  { key: "cta", label: "CTA", fields: [
    { key: "h2", label: "العنوان", type: "input" },
    { key: "subtitle", label: "النص التعريفي", type: "textarea" },
    { key: "cta1Text", label: "نص الزر الأول", type: "input" },
    { key: "cta2Text", label: "نص الزر الثاني", type: "input" },
  ]},
];

function SectionEditor({ sectionKey, fields }: { sectionKey: string; fields: any[] }) {
  const { toast } = useToast();
  const page = "about";
  const { data: allSections } = useQuery<Record<string, any>>({
    queryKey: ["/api/cms/page-sections", page],
    queryFn: () => fetch(`/api/cms/page-sections/${page}`).then(r => r.json()),
  });
  const section = allSections?.[sectionKey];
  const [ar, setAr] = useState<Record<string, string>>({});
  const [en, setEn] = useState<Record<string, string>>({});

  useEffect(() => {
    if (section) { setAr(section.contentAr || {}); setEn(section.contentEn || {}); }
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
          <CardTitle className="text-base">{PAGE_SECTIONS.find(s => s.key === sectionKey)?.label}</CardTitle>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid={`btn-save-${sectionKey}`}>
            <Save className="w-3.5 h-3.5 me-1" />{saveMutation.isPending ? "..." : "حفظ"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <Label className="text-sm font-semibold mb-2 block">{f.label}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-orange-500 font-bold mb-1 block">عربي</span>
                  {f.type === "textarea" ? (
                    <Textarea value={ar[f.key] || ""} onChange={e => setAr(p => ({ ...p, [f.key]: e.target.value }))} className="resize-none text-right text-sm" dir="rtl" rows={3} data-testid={`ar-about-${f.key}`} />
                  ) : (
                    <Input value={ar[f.key] || ""} onChange={e => setAr(p => ({ ...p, [f.key]: e.target.value }))} className="text-right text-sm" dir="rtl" data-testid={`ar-about-${f.key}`} />
                  )}
                </div>
                <div>
                  <span className="text-xs text-blue-500 font-bold mb-1 block">English</span>
                  {f.type === "textarea" ? (
                    <Textarea value={en[f.key] || ""} onChange={e => setEn(p => ({ ...p, [f.key]: e.target.value }))} className="resize-none text-sm" rows={3} data-testid={`en-about-${f.key}`} />
                  ) : (
                    <Input value={en[f.key] || ""} onChange={e => setEn(p => ({ ...p, [f.key]: e.target.value }))} className="text-sm" data-testid={`en-about-${f.key}`} />
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

function ValueForm({ item, onClose }: { item?: AboutValue; onClose: () => void }) {
  const { toast } = useToast();
  const { register, handleSubmit } = useForm({
    defaultValues: { icon: item?.icon || "⭐", titleAr: item?.titleAr || "", titleEn: item?.titleEn || "", descAr: item?.descAr || "", descEn: item?.descEn || "", displayOrder: item?.displayOrder || 0 }
  });
  const saveMutation = useMutation({
    mutationFn: (d: any) => item ? apiRequest("PATCH", `/api/cms/about-values/${item.id}`, d) : apiRequest("POST", "/api/cms/about-values", d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/about-values"] }); queryClient.invalidateQueries({ queryKey: ["/api/public/about-values"] }); toast({ title: "✅ تم" }); onClose(); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });
  return (
    <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>أيقونة</Label><Input {...register("icon")} className="mt-1" /></div>
        <div><Label>ترتيب</Label><Input type="number" {...register("displayOrder", { valueAsNumber: true })} className="mt-1" /></div>
        <div><Label>العنوان (عربي) *</Label><Input {...register("titleAr", { required: true })} dir="rtl" className="mt-1 text-right" /></div>
        <div><Label>Title (EN)</Label><Input {...register("titleEn")} className="mt-1" /></div>
        <div><Label>الوصف (عربي)</Label><Textarea {...register("descAr")} dir="rtl" className="mt-1 text-right resize-none" rows={2} /></div>
        <div><Label>Desc (EN)</Label><Textarea {...register("descEn")} className="mt-1 resize-none" rows={2} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>إلغاء</Button>
        <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "..." : item ? "تحديث" : "إضافة"}</Button>
      </DialogFooter>
    </form>
  );
}

function TimelineForm({ item, onClose }: { item?: AboutTimeline; onClose: () => void }) {
  const { toast } = useToast();
  const { register, handleSubmit } = useForm({
    defaultValues: { year: item?.year || "", titleAr: item?.titleAr || "", titleEn: item?.titleEn || "", descAr: item?.descAr || "", descEn: item?.descEn || "", displayOrder: item?.displayOrder || 0 }
  });
  const saveMutation = useMutation({
    mutationFn: (d: any) => item ? apiRequest("PATCH", `/api/cms/about-timeline/${item.id}`, d) : apiRequest("POST", "/api/cms/about-timeline", d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/about-timeline"] }); queryClient.invalidateQueries({ queryKey: ["/api/public/about-timeline"] }); toast({ title: "✅ تم" }); onClose(); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });
  return (
    <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>السنة *</Label><Input {...register("year", { required: true })} className="mt-1" placeholder="2020" /></div>
        <div><Label>ترتيب</Label><Input type="number" {...register("displayOrder", { valueAsNumber: true })} className="mt-1" /></div>
        <div><Label>العنوان (عربي) *</Label><Input {...register("titleAr", { required: true })} dir="rtl" className="mt-1 text-right" /></div>
        <div><Label>Title (EN)</Label><Input {...register("titleEn")} className="mt-1" /></div>
        <div><Label>الوصف (عربي)</Label><Textarea {...register("descAr")} dir="rtl" className="mt-1 text-right resize-none" rows={2} /></div>
        <div><Label>Desc (EN)</Label><Textarea {...register("descEn")} className="mt-1 resize-none" rows={2} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>إلغاء</Button>
        <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "..." : item ? "تحديث" : "إضافة"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function AboutContentPage() {
  const { toast } = useToast();
  const [valueOpen, setValueOpen] = useState(false);
  const [tlOpen, setTlOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<AboutValue | undefined>();
  const [editingTl, setEditingTl] = useState<AboutTimeline | undefined>();

  const { data: values } = useQuery<AboutValue[]>({ queryKey: ["/api/cms/about-values"] });
  const { data: timeline } = useQuery<AboutTimeline[]>({ queryKey: ["/api/cms/about-timeline"] });

  const deleteValue = useMutation({ mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/about-values/${id}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/about-values"] }); queryClient.invalidateQueries({ queryKey: ["/api/public/about-values"] }); toast({ title: "✅ تم الحذف" }); } });
  const deleteTl = useMutation({ mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/about-timeline/${id}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/about-timeline"] }); queryClient.invalidateQueries({ queryKey: ["/api/public/about-timeline"] }); toast({ title: "✅ تم الحذف" }); } });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-6 h-6 text-green-500" />
            محتوى صفحة "من نحن"
          </h1>
          <p className="text-gray-500 text-sm mt-1">تحرير كل سكشن في صفحة من نحن</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/about" target="_blank"><Eye className="w-4 h-4 me-1" />معاينة</a>
        </Button>
      </div>

      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections">السكشنات النصية</TabsTrigger>
          <TabsTrigger value="values">القيم</TabsTrigger>
          <TabsTrigger value="timeline">التسلسل الزمني</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4 mt-4">
          {PAGE_SECTIONS.map(s => <SectionEditor key={s.key} sectionKey={s.key} fields={s.fields} />)}
        </TabsContent>

        <TabsContent value="values" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">قيم الشركة</h3>
            <Button size="sm" onClick={() => { setEditingValue(undefined); setValueOpen(true); }} data-testid="btn-add-value">
              <Plus className="w-4 h-4 me-1" />إضافة قيمة
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {values?.map(v => (
              <Card key={v.id} data-testid={`value-${v.id}`}>
                <CardContent className="p-3 flex items-start gap-3">
                  <span className="text-2xl">{v.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{v.titleAr}</p>
                    {v.descAr && <p className="text-xs text-gray-500 mt-0.5">{v.descAr}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingValue(v); setValueOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteValue.mutate(v.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">التسلسل الزمني</h3>
            <Button size="sm" onClick={() => { setEditingTl(undefined); setTlOpen(true); }} data-testid="btn-add-timeline">
              <Plus className="w-4 h-4 me-1" />إضافة حدث
            </Button>
          </div>
          <div className="space-y-3">
            {timeline?.map(t => (
              <Card key={t.id} data-testid={`timeline-${t.id}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <Badge variant="outline" className="font-black text-base shrink-0">{t.year}</Badge>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{t.titleAr}</p>
                    {t.descAr && <p className="text-xs text-gray-500 mt-0.5">{t.descAr}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingTl(t); setTlOpen(true); }}><Pencil className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteTl.mutate(t.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={valueOpen} onOpenChange={setValueOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingValue ? "تعديل القيمة" : "إضافة قيمة"}</DialogTitle></DialogHeader>
          <ValueForm item={editingValue} onClose={() => setValueOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={tlOpen} onOpenChange={setTlOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingTl ? "تعديل الحدث" : "إضافة حدث"}</DialogTitle></DialogHeader>
          <TimelineForm item={editingTl} onClose={() => setTlOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
