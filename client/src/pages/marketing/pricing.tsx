import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Star, DollarSign, Eye, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { PricingPlan, InsertPricingPlan } from "@shared/schema";

const COLOR_OPTIONS = [
  { value: "blue", label: "أزرق", color: "#2563eb" },
  { value: "orange", label: "برتقالي", color: "#ea580c" },
  { value: "green", label: "أخضر", color: "#16a34a" },
  { value: "purple", label: "بنفسجي", color: "#7c3aed" },
  { value: "dark", label: "داكن", color: "#0f172a" },
];

const EMPTY_PLAN: Partial<InsertPricingPlan> = {
  nameAr: "", nameEn: "", descAr: "", descEn: "",
  price: "", currency: "SAR", period: "one-time",
  featuresAr: [], featuresEn: [],
  isPopular: false, isActive: true,
  ctaTextAr: "ابدأ الآن", ctaTextEn: "Get Started",
  ctaUrl: "/contact", badgeAr: "", badgeEn: "",
  color: "blue", displayOrder: 0,
};

export default function PricingAdmin() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState<Partial<InsertPricingPlan>>(EMPTY_PLAN);
  const [featAr, setFeatAr] = useState("");
  const [featEn, setFeatEn] = useState("");

  const { data: plans = [], isLoading } = useQuery<PricingPlan[]>({ queryKey: ["/api/marketing/pricing"] });

  const saveMut = useMutation({
    mutationFn: (data: Partial<InsertPricingPlan>) => editing
      ? apiRequest("PUT", `/api/marketing/pricing/${editing.id}`, data)
      : apiRequest("POST", "/api/marketing/pricing", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/pricing"] });
      toast({ title: editing ? "تم تحديث الباقة" : "تم إضافة الباقة" });
      setOpen(false); setEditing(null); setForm(EMPTY_PLAN);
    },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/marketing/pricing/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/pricing"] });
      toast({ title: "تم حذف الباقة" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, val }: { id: string; val: boolean }) =>
      apiRequest("PUT", `/api/marketing/pricing/${id}`, { isActive: val }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/marketing/pricing"] }),
  });

  const openNew = () => { setEditing(null); setForm(EMPTY_PLAN); setFeatAr(""); setFeatEn(""); setOpen(true); };
  const openEdit = (p: PricingPlan) => {
    setEditing(p);
    setForm({ ...p });
    setFeatAr((p.featuresAr || []).join("\n"));
    setFeatEn((p.featuresEn || []).join("\n"));
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.nameAr || !form.price) return toast({ title: "الاسم عربي والسعر مطلوبان", variant: "destructive" });
    saveMut.mutate({
      ...form,
      featuresAr: featAr.split("\n").map(s => s.trim()).filter(Boolean),
      featuresEn: featEn.split("\n").map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <DollarSign className="text-orange-500" size={24} />
            إدارة باقات الأسعار
          </h1>
          <p className="text-slate-500 text-sm mt-1">باقات الأسعار التي تظهر في صفحة /pricing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href="/pricing" target="_blank" className="gap-2">
              <Eye size={15} /> معاينة الصفحة
            </a>
          </Button>
          <Button onClick={openNew} className="gap-2 bg-orange-500 hover:bg-orange-600" data-testid="btn-add-plan">
            <Plus size={16} /> إضافة باقة
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20">
          <DollarSign size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-600 mb-2">لا توجد باقات بعد</h2>
          <p className="text-slate-400 mb-6">أضف أول باقة لتظهر في صفحة الأسعار</p>
          <Button onClick={openNew} className="gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus size={16} /> إضافة باقة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <Card key={plan.id} className={`relative transition-all ${!plan.isActive ? "opacity-60" : ""}`}>
              {plan.isPopular && (
                <div className="absolute -top-3 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={11} fill="white" /> الأكثر طلباً
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black text-slate-800 text-base">{plan.nameAr}</h3>
                    {plan.nameEn && <p className="text-xs text-slate-400">{plan.nameEn}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={v => toggleActive.mutate({ id: plan.id, val: v })}
                    />
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-black text-orange-600">{plan.price}</span>
                  <span className="text-sm text-slate-400">{plan.currency}</span>
                </div>
                {plan.descAr && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{plan.descAr}</p>}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Button size="sm" variant="outline" onClick={() => openEdit(plan)} className="flex-1 h-8 gap-1 text-xs" data-testid={`btn-edit-${plan.id}`}>
                    <Pencil size={12} /> تعديل
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("حذف هذه الباقة؟")) deleteMut.mutate(plan.id); }} className="h-8 px-2 text-red-500 hover:bg-red-50" data-testid={`btn-delete-${plan.id}`}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Plan Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل الباقة" : "إضافة باقة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>الاسم (عربي) *</Label>
                <Input value={form.nameAr || ""} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="مثال: الباقة الأساسية" data-testid="input-nameAr" />
              </div>
              <div className="space-y-1">
                <Label>Name (English)</Label>
                <Input value={form.nameEn || ""} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} placeholder="e.g. Basic Plan" data-testid="input-nameEn" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>الوصف (عربي)</Label>
                <Textarea value={form.descAr || ""} onChange={e => setForm(p => ({ ...p, descAr: e.target.value }))} rows={2} placeholder="وصف مختصر..." />
              </div>
              <div className="space-y-1">
                <Label>Description (EN)</Label>
                <Textarea value={form.descEn || ""} onChange={e => setForm(p => ({ ...p, descEn: e.target.value }))} rows={2} placeholder="Short description..." />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>السعر *</Label>
                <Input value={form.price || ""} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="مثال: 1,500 أو تواصل معنا" data-testid="input-price" />
              </div>
              <div className="space-y-1">
                <Label>العملة</Label>
                <Input value={form.currency || "SAR"} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} placeholder="SAR" />
              </div>
              <div className="space-y-1">
                <Label>الفترة</Label>
                <Select value={form.period || "one-time"} onValueChange={v => setForm(p => ({ ...p, period: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">شهري</SelectItem>
                    <SelectItem value="year">سنوي</SelectItem>
                    <SelectItem value="one-time">مرة واحدة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>المميزات (عربي) — سطر لكل ميزة</Label>
                <Textarea value={featAr} onChange={e => setFeatAr(e.target.value)} rows={5} placeholder={"تصميم موقع احترافي\nدعم فني 3 أشهر\nنطاق مجاني"} />
              </div>
              <div className="space-y-1">
                <Label>Features (EN) — one per line</Label>
                <Textarea value={featEn} onChange={e => setFeatEn(e.target.value)} rows={5} placeholder={"Professional website\n3 months support\nFree domain"} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>نص CTA (عربي)</Label>
                <Input value={form.ctaTextAr || ""} onChange={e => setForm(p => ({ ...p, ctaTextAr: e.target.value }))} placeholder="ابدأ الآن" />
              </div>
              <div className="space-y-1">
                <Label>CTA Text (EN)</Label>
                <Input value={form.ctaTextEn || ""} onChange={e => setForm(p => ({ ...p, ctaTextEn: e.target.value }))} placeholder="Get Started" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>رابط CTA</Label>
                <Input value={form.ctaUrl || ""} onChange={e => setForm(p => ({ ...p, ctaUrl: e.target.value }))} placeholder="/contact" />
              </div>
              <div className="space-y-1">
                <Label>اللون</Label>
                <Select value={form.color || "blue"} onValueChange={v => setForm(p => ({ ...p, color: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color }} />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>شارة (عربي)</Label>
                <Input value={form.badgeAr || ""} onChange={e => setForm(p => ({ ...p, badgeAr: e.target.value }))} placeholder="الأفضل قيمة" />
              </div>
              <div className="space-y-1">
                <Label>Badge (EN)</Label>
                <Input value={form.badgeEn || ""} onChange={e => setForm(p => ({ ...p, badgeEn: e.target.value }))} placeholder="Best Value" />
              </div>
              <div className="space-y-1">
                <Label>الترتيب</Label>
                <Input type="number" value={form.displayOrder || 0} onChange={e => setForm(p => ({ ...p, displayOrder: parseInt(e.target.value) }))} />
              </div>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={!!form.isPopular} onCheckedChange={v => setForm(p => ({ ...p, isPopular: v }))} />
                <span className="text-sm font-medium">الأكثر طلباً</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={form.isActive !== false} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} />
                <span className="text-sm font-medium">مفعّل</span>
              </label>
            </div>
            <div className="flex gap-3 justify-start pt-2">
              <Button onClick={handleSave} disabled={saveMut.isPending} className="bg-orange-500 hover:bg-orange-600 gap-2" data-testid="btn-save-plan">
                {saveMut.isPending ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة الباقة"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
