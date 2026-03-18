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
import { Plus, Pencil, Trash2, RefreshCw, ListOrdered } from "lucide-react";
import type { ProcessStep } from "@shared/schema";

function StepForm({ item, onClose }: { item?: ProcessStep; onClose: () => void }) {
  const { toast } = useToast();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      stepNumber: item?.stepNumber || 1,
      titleAr: item?.titleAr || "",
      titleEn: item?.titleEn || "",
      descAr: item?.descAr || "",
      descEn: item?.descEn || "",
      icon: item?.icon || "",
      displayOrder: item?.displayOrder || 0,
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => item
      ? apiRequest("PATCH", `/api/cms/process-steps/${item.id}`, data)
      : apiRequest("POST", "/api/cms/process-steps", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/process-steps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/process-steps"] });
      toast({ title: item ? "✅ تم التحديث" : "✅ تم الإضافة" });
      onClose();
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  return (
    <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>رقم الخطوة</Label>
          <Input type="number" {...register("stepNumber", { valueAsNumber: true })} className="mt-1" data-testid="input-step-number" />
        </div>
        <div>
          <Label>ترتيب العرض</Label>
          <Input type="number" {...register("displayOrder", { valueAsNumber: true })} className="mt-1" data-testid="input-order" />
        </div>
      </div>
      <div>
        <Label>أيقونة (إيموجي أو أيقونة)</Label>
        <Input {...register("icon")} className="mt-1" placeholder="🎯 أو اسم أيقونة" data-testid="input-icon" />
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
        <Button type="submit" disabled={saveMutation.isPending} data-testid="btn-save-step">
          {saveMutation.isPending ? "جاري الحفظ..." : item ? "تحديث" : "إضافة"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function ProcessStepsPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessStep | undefined>();

  const { data: items, isLoading } = useQuery<ProcessStep[]>({ queryKey: ["/api/cms/process-steps"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/process-steps/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/process-steps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/process-steps"] });
      toast({ title: "✅ تم الحذف" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiRequest("PATCH", `/api/cms/process-steps/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cms/process-steps"] }),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-[#ff6a00]" />
            خطوات العمل
          </h1>
          <p className="text-gray-500 text-sm mt-1">إدارة خطوات العمل التي تظهر في الصفحة الرئيسية وصفحة الأعمال</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setOpen(true); }} data-testid="btn-add-step">
          <Plus className="w-4 h-4 me-2" />
          إضافة خطوة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><RefreshCw className="w-6 h-6 animate-spin text-[#ff6a00]" /></div>
      ) : (
        <div className="space-y-3">
          {items?.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <ListOrdered className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد خطوات بعد. أضف أول خطوة!</p>
            </div>
          )}
          {items?.map((step, i) => (
            <Card key={step.id} className={`transition-all ${!step.isActive ? "opacity-60" : ""}`} data-testid={`step-${step.id}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                  {step.stepNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {step.icon && <span className="text-lg">{step.icon}</span>}
                    <p className="font-bold text-gray-900 dark:text-white">{step.titleAr}</p>
                    {step.titleEn && <span className="text-sm text-gray-400">| {step.titleEn}</span>}
                  </div>
                  {step.descAr && <p className="text-sm text-gray-500 mt-0.5 truncate">{step.descAr}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={step.isActive ?? true}
                    onCheckedChange={v => toggleMutation.mutate({ id: step.id, isActive: v })}
                    data-testid={`toggle-step-${step.id}`}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(step); setOpen(true); }} data-testid={`btn-edit-step-${step.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(step.id)} data-testid={`btn-delete-step-${step.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
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
            <DialogTitle>{editing ? "تعديل الخطوة" : "إضافة خطوة جديدة"}</DialogTitle>
          </DialogHeader>
          <StepForm item={editing} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
