import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, ChevronLeft, Save, Loader2, ExternalLink, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

// ─── Types ────────────────────────────────────────────────
interface FeatureItem {
  icon: string; titleAr: string; titleEn: string; descAr: string; descEn: string;
}
interface TechItem {
  icon: string; name: string; descAr: string; descEn: string;
}
interface StatItem {
  number: string; labelAr: string; labelEn: string;
}
interface ArchItem {
  titleAr: string; titleEn: string; descAr: string; descEn: string;
}
interface UseCaseItem {
  icon: string; titleAr: string; titleEn: string; descAr: string; descEn: string;
}

interface ProjectDetails {
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  overviewAr: string;
  overviewEn: string;
  liveUrl: string;
  officialUrl: string;
  highlightAr: string;
  highlightEn: string;
  features: FeatureItem[];
  techStack: TechItem[];
  stats: StatItem[];
  architecture: ArchItem[];
  securityFeatures: ArchItem[];
  useCases: UseCaseItem[];
}

const emptyDetails: ProjectDetails = {
  heroSubtitleAr: "", heroSubtitleEn: "",
  overviewAr: "", overviewEn: "",
  liveUrl: "", officialUrl: "",
  highlightAr: "", highlightEn: "",
  features: [],
  techStack: [],
  stats: [],
  architecture: [],
  securityFeatures: [],
  useCases: [],
};

// ─── Section Card Helper ───────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-gray-900 dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

// ─── Array Item Row ────────────────────────────────────────
function ItemRow({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 space-y-3">
      {children}
      <Button type="button" variant="ghost" size="icon"
        className="absolute top-2 left-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 w-7"
        onClick={onRemove}>
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function ProjectDetailsEditor() {
  const [, params] = useRoute("/website/projects/:id/details");
  const id = params?.id || "";
  const { toast } = useToast();
  const [details, setDetails] = useState<ProjectDetails>(emptyDetails);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/cms/projects", id],
    queryFn: async () => {
      const res = await fetch(`/api/cms/projects/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (project?.details) {
      setDetails({ ...emptyDetails, ...(project.details as ProjectDetails) });
    }
  }, [project]);

  const saveMut = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/cms/projects/${id}`, { details }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/projects", id] });
      toast({ title: "✅ تم حفظ تفاصيل المشروع بنجاح" });
    },
    onError: () => toast({ title: "حدث خطأ أثناء الحفظ", variant: "destructive" }),
  });

  const set = <K extends keyof ProjectDetails>(key: K, val: ProjectDetails[K]) =>
    setDetails(d => ({ ...d, [key]: val }));

  // Features
  const addFeature = () => set("features", [...details.features, { icon: "⚡", titleAr: "", titleEn: "", descAr: "", descEn: "" }]);
  const updateFeature = (i: number, f: Partial<FeatureItem>) =>
    set("features", details.features.map((x, j) => j === i ? { ...x, ...f } : x));
  const removeFeature = (i: number) => set("features", details.features.filter((_, j) => j !== i));

  // Tech Stack
  const addTech = () => set("techStack", [...details.techStack, { icon: "🔧", name: "", descAr: "", descEn: "" }]);
  const updateTech = (i: number, f: Partial<TechItem>) =>
    set("techStack", details.techStack.map((x, j) => j === i ? { ...x, ...f } : x));
  const removeTech = (i: number) => set("techStack", details.techStack.filter((_, j) => j !== i));

  // Stats
  const addStat = () => set("stats", [...details.stats, { number: "", labelAr: "", labelEn: "" }]);
  const updateStat = (i: number, f: Partial<StatItem>) =>
    set("stats", details.stats.map((x, j) => j === i ? { ...x, ...f } : x));
  const removeStat = (i: number) => set("stats", details.stats.filter((_, j) => j !== i));

  // Architecture
  const addArch = () => set("architecture", [...details.architecture, { titleAr: "", titleEn: "", descAr: "", descEn: "" }]);
  const updateArch = (i: number, f: Partial<ArchItem>) =>
    set("architecture", details.architecture.map((x, j) => j === i ? { ...x, ...f } : x));
  const removeArch = (i: number) => set("architecture", details.architecture.filter((_, j) => j !== i));

  // Security Features
  const addSec = () => set("securityFeatures", [...details.securityFeatures, { titleAr: "", titleEn: "", descAr: "", descEn: "" }]);
  const updateSec = (i: number, f: Partial<ArchItem>) =>
    set("securityFeatures", details.securityFeatures.map((x, j) => j === i ? { ...x, ...f } : x));
  const removeSec = (i: number) => set("securityFeatures", details.securityFeatures.filter((_, j) => j !== i));

  // Use Cases
  const addUseCase = () => set("useCases", [...details.useCases, { icon: "👤", titleAr: "", titleEn: "", descAr: "", descEn: "" }]);
  const updateUseCase = (i: number, f: Partial<UseCaseItem>) =>
    set("useCases", details.useCases.map((x, j) => j === i ? { ...x, ...f } : x));
  const removeUseCase = (i: number) => set("useCases", details.useCases.filter((_, j) => j !== i));

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-[#ff6a00]" />
    </div>
  );

  if (!project) return (
    <div className="text-center py-20">
      <p className="text-gray-500">المشروع غير موجود</p>
      <Button asChild variant="outline" className="mt-4"><Link href="/website/projects">العودة</Link></Button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/website/projects"><ChevronLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-[#ff6a00]" />
              <h1 className="text-xl font-black text-gray-900 dark:text-white">تفاصيل المشروع الكاملة</h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500">{project.title}</span>
              <Badge variant="secondary" className="text-xs">{project.slug}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5 me-1.5" />معاينة
            </a>
          </Button>
          <Button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
            data-testid="btn-save-project-details"
          >
            {saveMut.isPending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Save className="w-4 h-4 me-2" />}
            حفظ التفاصيل
          </Button>
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <SectionCard title="🎯 قسم الهيرو (البانر الرئيسي)">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold mb-1 block">العنوان الفرعي (عربي)</Label>
            <Input value={details.heroSubtitleAr} onChange={e => set("heroSubtitleAr", e.target.value)}
              placeholder="منصة متقدمة للعالم العربي..." className="text-sm" />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1 block">Subtitle (English)</Label>
            <Input value={details.heroSubtitleEn} onChange={e => set("heroSubtitleEn", e.target.value)}
              placeholder="Advanced platform for the Arab world..." className="text-sm" dir="ltr" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold mb-1 block">رابط الموقع الحي (Live URL)</Label>
            <Input value={details.liveUrl} onChange={e => set("liveUrl", e.target.value)}
              placeholder="https://app.example.com" className="text-sm" dir="ltr" />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1 block">رابط الموقع الرسمي</Label>
            <Input value={details.officialUrl} onChange={e => set("officialUrl", e.target.value)}
              placeholder="https://example.com" className="text-sm" dir="ltr" />
          </div>
        </div>
      </SectionCard>

      {/* ─── Overview ─── */}
      <SectionCard title="📋 نبذة عن المشروع (Overview)">
        <div>
          <Label className="text-xs font-semibold mb-1 block">النص التفصيلي (عربي)</Label>
          <Textarea value={details.overviewAr} onChange={e => set("overviewAr", e.target.value)}
            rows={5} placeholder="وصف تفصيلي للمشروع وفكرته الأساسية..." className="text-sm" />
        </div>
        <div>
          <Label className="text-xs font-semibold mb-1 block">Detailed Text (English)</Label>
          <Textarea value={details.overviewEn} onChange={e => set("overviewEn", e.target.value)}
            rows={5} placeholder="Detailed description of the project and its core idea..." className="text-sm" dir="ltr" />
        </div>
        <div>
          <Label className="text-xs font-semibold mb-1 block">نص الهايلايت (عربي)</Label>
          <Input value={details.highlightAr} onChange={e => set("highlightAr", e.target.value)}
            placeholder="القيمة المضافة أو الهدف الرئيسي..." className="text-sm" />
        </div>
        <div>
          <Label className="text-xs font-semibold mb-1 block">Highlight Text (English)</Label>
          <Input value={details.highlightEn} onChange={e => set("highlightEn", e.target.value)}
            placeholder="Added value or main objective..." className="text-sm" dir="ltr" />
        </div>
      </SectionCard>

      {/* ─── Features ─── */}
      <SectionCard title="⭐ المميزات الرئيسية">
        <div className="space-y-3">
          {details.features.map((f, i) => (
            <ItemRow key={i} onRemove={() => removeFeature(i)}>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">أيقونة</Label>
                  <Input value={f.icon} onChange={e => updateFeature(i, { icon: e.target.value })}
                    className="text-center text-lg h-9" placeholder="⭐" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">العنوان (عربي)</Label>
                  <Input value={f.titleAr} onChange={e => updateFeature(i, { titleAr: e.target.value })}
                    className="text-sm h-9" placeholder="إدارة الإعلانات" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs mb-1 block">Title (English)</Label>
                  <Input value={f.titleEn} onChange={e => updateFeature(i, { titleEn: e.target.value })}
                    className="text-sm h-9" placeholder="Ad Management" dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">الوصف (عربي)</Label>
                  <Textarea value={f.descAr} onChange={e => updateFeature(i, { descAr: e.target.value })}
                    rows={2} className="text-sm resize-none" placeholder="وصف المميزة..." />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Description (English)</Label>
                  <Textarea value={f.descEn} onChange={e => updateFeature(i, { descEn: e.target.value })}
                    rows={2} className="text-sm resize-none" placeholder="Feature description..." dir="ltr" />
                </div>
              </div>
            </ItemRow>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addFeature} className="w-full border-dashed">
          <Plus className="w-4 h-4 me-2" /> إضافة ميزة
        </Button>
      </SectionCard>

      {/* ─── Tech Stack ─── */}
      <SectionCard title="💻 المكدس التقني (Tech Stack)">
        <div className="space-y-3">
          {details.techStack.map((t, i) => (
            <ItemRow key={i} onRemove={() => removeTech(i)}>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">أيقونة</Label>
                  <Input value={t.icon} onChange={e => updateTech(i, { icon: e.target.value })}
                    className="text-center text-lg h-9" placeholder="⚛️" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">اسم التقنية</Label>
                  <Input value={t.name} onChange={e => updateTech(i, { name: e.target.value })}
                    className="text-sm h-9" placeholder="React + Vite" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">الوصف (عربي)</Label>
                  <Input value={t.descAr} onChange={e => updateTech(i, { descAr: e.target.value })}
                    className="text-sm h-9" placeholder="واجهة سريعة وحديثة" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Description (En)</Label>
                  <Input value={t.descEn} onChange={e => updateTech(i, { descEn: e.target.value })}
                    className="text-sm h-9" placeholder="Fast modern UI" dir="ltr" />
                </div>
              </div>
            </ItemRow>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addTech} className="w-full border-dashed">
          <Plus className="w-4 h-4 me-2" /> إضافة تقنية
        </Button>
      </SectionCard>

      {/* ─── Stats ─── */}
      <SectionCard title="📊 الأرقام والإحصائيات">
        <div className="space-y-3">
          {details.stats.map((s, i) => (
            <ItemRow key={i} onRemove={() => removeStat(i)}>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">الرقم / القيمة</Label>
                  <Input value={s.number} onChange={e => updateStat(i, { number: e.target.value })}
                    className="text-sm h-9 font-bold text-center" placeholder="21" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">التسمية (عربي)</Label>
                  <Input value={s.labelAr} onChange={e => updateStat(i, { labelAr: e.target.value })}
                    className="text-sm h-9" placeholder="قسم في لوحة التحكم" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Label (English)</Label>
                  <Input value={s.labelEn} onChange={e => updateStat(i, { labelEn: e.target.value })}
                    className="text-sm h-9" placeholder="Admin Sections" dir="ltr" />
                </div>
              </div>
            </ItemRow>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addStat} className="w-full border-dashed">
          <Plus className="w-4 h-4 me-2" /> إضافة رقم / إحصائية
        </Button>
      </SectionCard>

      {/* ─── Architecture ─── */}
      <SectionCard title="🏗️ البنية المعمارية">
        <div className="space-y-3">
          {details.architecture.map((a, i) => (
            <ItemRow key={i} onRemove={() => removeArch(i)}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">العنوان (عربي)</Label>
                  <Input value={a.titleAr} onChange={e => updateArch(i, { titleAr: e.target.value })}
                    className="text-sm h-9" placeholder="الواجهة" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Title (English)</Label>
                  <Input value={a.titleEn} onChange={e => updateArch(i, { titleEn: e.target.value })}
                    className="text-sm h-9" placeholder="Frontend" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">الوصف (عربي)</Label>
                  <Input value={a.descAr} onChange={e => updateArch(i, { descAr: e.target.value })}
                    className="text-sm h-9" placeholder="React + Tailwind" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Description (English)</Label>
                  <Input value={a.descEn} onChange={e => updateArch(i, { descEn: e.target.value })}
                    className="text-sm h-9" placeholder="React + Tailwind" dir="ltr" />
                </div>
              </div>
            </ItemRow>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addArch} className="w-full border-dashed">
          <Plus className="w-4 h-4 me-2" /> إضافة طبقة معمارية
        </Button>
      </SectionCard>

      {/* ─── Security Features ─── */}
      <SectionCard title="🛡️ مميزات الأمان والتقنية">
        <div className="space-y-3">
          {details.securityFeatures.map((s, i) => (
            <ItemRow key={i} onRemove={() => removeSec(i)}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">العنوان (عربي)</Label>
                  <Input value={s.titleAr} onChange={e => updateSec(i, { titleAr: e.target.value })}
                    className="text-sm h-9" placeholder="معالجة الأخطاء" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Title (English)</Label>
                  <Input value={s.titleEn} onChange={e => updateSec(i, { titleEn: e.target.value })}
                    className="text-sm h-9" placeholder="Error Handling" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">الوصف (عربي)</Label>
                  <Input value={s.descAr} onChange={e => updateSec(i, { descAr: e.target.value })}
                    className="text-sm h-9" placeholder="تتبع دقيق للأخطاء..." />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Description (English)</Label>
                  <Input value={s.descEn} onChange={e => updateSec(i, { descEn: e.target.value })}
                    className="text-sm h-9" placeholder="Precise error tracking..." dir="ltr" />
                </div>
              </div>
            </ItemRow>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addSec} className="w-full border-dashed">
          <Plus className="w-4 h-4 me-2" /> إضافة ميزة أمان/تقنية
        </Button>
      </SectionCard>

      {/* ─── Use Cases ─── */}
      <SectionCard title="🎭 حالات الاستخدام">
        <div className="space-y-3">
          {details.useCases.map((u, i) => (
            <ItemRow key={i} onRemove={() => removeUseCase(i)}>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">أيقونة</Label>
                  <Input value={u.icon} onChange={e => updateUseCase(i, { icon: e.target.value })}
                    className="text-center text-lg h-9" placeholder="👤" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">العنوان (عربي)</Label>
                  <Input value={u.titleAr} onChange={e => updateUseCase(i, { titleAr: e.target.value })}
                    className="text-sm h-9" placeholder="التاجر الفردي" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs mb-1 block">Title (English)</Label>
                  <Input value={u.titleEn} onChange={e => updateUseCase(i, { titleEn: e.target.value })}
                    className="text-sm h-9" placeholder="Individual Trader" dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">الوصف (عربي)</Label>
                  <Textarea value={u.descAr} onChange={e => updateUseCase(i, { descAr: e.target.value })}
                    rows={2} className="text-sm resize-none" placeholder="وصف حالة الاستخدام..." />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Description (English)</Label>
                  <Textarea value={u.descEn} onChange={e => updateUseCase(i, { descEn: e.target.value })}
                    rows={2} className="text-sm resize-none" placeholder="Use case description..." dir="ltr" />
                </div>
              </div>
            </ItemRow>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addUseCase} className="w-full border-dashed">
          <Plus className="w-4 h-4 me-2" /> إضافة حالة استخدام
        </Button>
      </SectionCard>

      {/* Save CTA at bottom */}
      <div className="flex justify-end pb-8">
        <Button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          size="lg"
          className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white px-10"
        >
          {saveMut.isPending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Save className="w-4 h-4 me-2" />}
          حفظ جميع التفاصيل
        </Button>
      </div>
    </div>
  );
}
