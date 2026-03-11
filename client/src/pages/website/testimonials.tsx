import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Plus, Pencil, Trash2, Star, RefreshCw, MessageSquareQuote } from "lucide-react";
import type { Testimonial } from "@shared/schema";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={`w-5 h-5 ${n <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

function TestimonialForm({ item, onClose }: { item?: Testimonial; onClose: () => void }) {
  const { toast } = useToast();
  const [stars, setStars] = useState(item?.stars || 5);
  const [avatarUrl, setAvatarUrl] = useState(item?.avatarUrl || "");
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      nameAr: item?.nameAr || "",
      nameEn: item?.nameEn || "",
      roleAr: item?.roleAr || "",
      roleEn: item?.roleEn || "",
      textAr: item?.textAr || "",
      textEn: item?.textEn || "",
      displayOrder: item?.displayOrder || 0,
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => item
      ? apiRequest("PATCH", `/api/cms/testimonials/${item.id}`, { ...data, stars, avatarUrl })
      : apiRequest("POST", "/api/cms/testimonials", { ...data, stars, avatarUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/testimonials"] });
      toast({ title: item ? "✅ تم التحديث" : "✅ تم الإضافة" });
      onClose();
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  return (
    <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>الاسم (عربي) *</Label>
          <Input {...register("nameAr", { required: true })} dir="rtl" className="mt-1 text-right" data-testid="input-name-ar" />
        </div>
        <div>
          <Label>Name (English)</Label>
          <Input {...register("nameEn")} className="mt-1" data-testid="input-name-en" />
        </div>
        <div>
          <Label>الدور/المسمى (عربي)</Label>
          <Input {...register("roleAr")} dir="rtl" className="mt-1 text-right" data-testid="input-role-ar" />
        </div>
        <div>
          <Label>Role (English)</Label>
          <Input {...register("roleEn")} className="mt-1" data-testid="input-role-en" />
        </div>
      </div>
      <div>
        <Label>نص الشهادة (عربي) *</Label>
        <Textarea {...register("textAr", { required: true })} dir="rtl" className="mt-1 text-right resize-none" rows={3} data-testid="input-text-ar" />
      </div>
      <div>
        <Label>Testimonial Text (English)</Label>
        <Textarea {...register("textEn")} className="mt-1 resize-none" rows={3} data-testid="input-text-en" />
      </div>
      <ImageUploader
        value={avatarUrl}
        onChange={setAvatarUrl}
        label="صورة الشخص (Avatar)"
        hint="صورة شخصية للمراجع، مربعة 100×100 بكسل أو أكبر"
        data-testid="uploader-avatar"
      />
      <div>
        <Label>ترتيب العرض</Label>
        <Input type="number" {...register("displayOrder", { valueAsNumber: true })} className="mt-1 w-32" data-testid="input-order" />
      </div>
      <div>
        <Label className="mb-2 block">التقييم</Label>
        <StarRating value={stars} onChange={setStars} />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>إلغاء</Button>
        <Button type="submit" disabled={saveMutation.isPending} data-testid="btn-save-testimonial">
          {saveMutation.isPending ? "جاري الحفظ..." : item ? "تحديث" : "إضافة"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function TestimonialsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | undefined>();

  const { data: items, isLoading } = useQuery<Testimonial[]>({ queryKey: ["/api/cms/testimonials"] });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiRequest("PATCH", `/api/cms/testimonials/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cms/testimonials"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/testimonials"] });
      toast({ title: "✅ تم الحذف" });
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-purple-500" />
            إدارة الشهادات والتقييمات
          </h1>
          <p className="text-gray-500 text-sm mt-1">أضف وعدّل شهادات العملاء التي تظهر في الموقع</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setOpen(true); }} data-testid="btn-add-testimonial">
          <Plus className="w-4 h-4 me-2" />
          إضافة شهادة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><RefreshCw className="w-6 h-6 animate-spin text-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items?.length === 0 && (
            <div className="md:col-span-2 text-center py-16 text-gray-400">
              <MessageSquareQuote className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد شهادات بعد. أضف أول شهادة!</p>
            </div>
          )}
          {items?.map(t => (
            <Card key={t.id} className={`transition-all ${!t.isActive ? "opacity-60" : ""}`} data-testid={`testimonial-${t.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt={t.nameAr} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                        {t.nameAr?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{t.nameAr}</p>
                      {t.roleAr && <p className="text-xs text-gray-500">{t.roleAr}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={t.isActive ?? true}
                      onCheckedChange={v => toggleMutation.mutate({ id: t.id, isActive: v })}
                      data-testid={`toggle-testimonial-${t.id}`}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(t); setOpen(true); }} data-testid={`btn-edit-testimonial-${t.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(t.id)} data-testid={`btn-delete-testimonial-${t.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex mt-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < (t.stars || 5) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 text-right" dir="rtl">{t.textAr}</p>
                {t.isActive ? (
                  <Badge variant="default" className="mt-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">مُفعّل</Badge>
                ) : (
                  <Badge variant="secondary" className="mt-2 text-xs">مُخفي</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل الشهادة" : "إضافة شهادة جديدة"}</DialogTitle>
          </DialogHeader>
          <TestimonialForm item={editing} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
