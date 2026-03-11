import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, RefreshCw, Trophy } from "lucide-react";
import type { WhyUsItem } from "@shared/schema";

function WhyUsForm({ item, onClose }: { item?: WhyUsItem; onClose: () => void }) {
  const { toast } = useToast();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      icon: item?.icon || "✓",
      titleAr: item?.titleAr || "",
      titleEn: item?.titleEn || "",
      descAr: item?.descAr || "",
      descEn: item?.descEn || "",
      displayOrder: item?.displayOrder || 0,
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => item
      ? apiRequest("PATCH", `/api/cms/why-us/${item.id}`, data)
      : apiRequest("POST", "/api/cms/why-us", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/why-us"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/why-us"] });
      toast({ title: item ? "✅ تم التحديث" : "✅ تم الإضافة" });
      onClose();
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  return (
    <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>الأيقونة (إيموجي)</Label>
          <Input {...register("icon")} className="mt-1 text-xl" placeholder="✓ 🚀 ⭐" data-testid="input-icon" />
        </div>
        <div>
          <Label>ترتيب العرض</Label>
          <Input type="number" {...register("displayOrder", { valueAsNumber: true })} className="mt-1" data-testid="input-order" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>العنوان (عربي) *</Label>
          <Input {...register("titleAr", { required: true })} dir="rtl" className="mt-1 text-right" data-testid="input-title-ar" />
        </div>
        <div>
          <Label>Title (English)</Label>
          <Input {...register("titleEn")} className="mt-1" data-testid="input-title-en" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>الوصف (عربي)</Label>
          <Textarea {...register("descAr")} dir="rtl" className="mt-1 text-right resize-none" rows={3} data-testid="input-desc-ar" />
        </div>
        <div>
          <Label>Description (English)</Label>
          <Textarea {...register("descEn")} className="mt-1 resize-none" rows={3} data-testid="input-desc-en" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>إلغاء</Button>
        <Button type="submit" disabled={saveMutation.isPending} data-testid="btn-save-why-us">
          {saveMutation.isPending ? "جاري الحفظ..." : item ? "تحديث" : "إضافة"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function WhyUsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WhyUsItem | undefined>();

  const { data: items, isLoading } = useQuery<WhyUsItem[]>({ queryKey: ["/api/cms/why-us"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/why-us/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/why-us"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/why-us"] });
      toast({ title: "✅ تم الحذف" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiRequest("PATCH", `/api/cms/why-us/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cms/why-us"] }),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            لماذا Softlix؟
          </h1>
          <p className="text-gray-500 text-sm mt-1">إدارة مميزات وأسباب اختيار Softlix التي تظهر في الصفحات</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setOpen(true); }} data-testid="btn-add-why-us">
          <Plus className="w-4 h-4 me-2" />
          إضافة عنصر
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><RefreshCw className="w-6 h-6 animate-spin text-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items?.length === 0 && (
            <div className="md:col-span-2 text-center py-16 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد عناصر بعد.</p>
            </div>
          )}
          {items?.map(item => (
            <Card key={item.id} className={`transition-all ${!item.isActive ? "opacity-60" : ""}`} data-testid={`why-us-${item.id}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center text-xl shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{item.titleAr}</p>
                  {item.titleEn && <p className="text-xs text-gray-400">{item.titleEn}</p>}
                  {item.descAr && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.descAr}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Switch
                    checked={item.isActive ?? true}
                    onCheckedChange={v => toggleMutation.mutate({ id: item.id, isActive: v })}
                    data-testid={`toggle-why-us-${item.id}`}
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(item); setOpen(true); }} data-testid={`btn-edit-why-us-${item.id}`}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(item.id)} data-testid={`btn-delete-why-us-${item.id}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل العنصر" : "إضافة عنصر جديد"}</DialogTitle>
          </DialogHeader>
          <WhyUsForm item={editing} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
