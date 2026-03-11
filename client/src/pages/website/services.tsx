import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Globe, ToggleLeft, ToggleRight, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@shared/schema";

type ServiceForm = {
  title: string; titleEn: string; slug: string;
  shortDescription: string; shortDescriptionEn: string;
  fullDescription: string; fullDescriptionEn: string;
  imageUrl: string; iconName: string; status: string; displayOrder: number;
};

const empty: ServiceForm = {
  title: "", titleEn: "", slug: "",
  shortDescription: "", shortDescriptionEn: "",
  fullDescription: "", fullDescriptionEn: "",
  imageUrl: "", iconName: "", status: "published", displayOrder: 0,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function WebsiteServices() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(empty);

  const { data: services = [], isLoading } = useQuery<Service[]>({ queryKey: ["/api/cms/services"] });

  const createMut = useMutation({
    mutationFn: (data: ServiceForm) => apiRequest("POST", "/api/cms/services", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/services"] }); setOpen(false); setForm(empty); toast({ title: "تم إضافة الخدمة بنجاح" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceForm> }) => apiRequest("PATCH", `/api/cms/services/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/services"] }); setOpen(false); setForm(empty); setEditId(null); toast({ title: "تم تحديث الخدمة" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/services/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/services"] }); toast({ title: "تم حذف الخدمة" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (s: Service) => {
    setForm({
      title: s.title, titleEn: s.titleEn || "", slug: s.slug,
      shortDescription: s.shortDescription || "", shortDescriptionEn: s.shortDescriptionEn || "",
      fullDescription: s.fullDescription || "", fullDescriptionEn: s.fullDescriptionEn || "",
      imageUrl: s.imageUrl || "", iconName: s.iconName || "",
      status: s.status, displayOrder: s.displayOrder || 0,
    });
    setEditId(s.id); setOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.slug) { toast({ title: "العنوان والـ Slug مطلوبان", variant: "destructive" }); return; }
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  };

  const F = (key: keyof ServiceForm, value: string | number) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">إدارة الخدمات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إضافة وتعديل خدمات الموقع</p>
        </div>
        <Button onClick={openNew} data-testid="btn-add-service">
          <Plus className="w-4 h-4 me-2" /> إضافة خدمة
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">لا توجد خدمات بعد</p>
            <Button onClick={openNew} data-testid="btn-add-service-empty"><Plus className="w-4 h-4 me-2" /> إضافة أول خدمة</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-sm transition-shadow" data-testid={`service-row-${service.id}`}>
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-gray-900 dark:text-white">{service.title}</span>
                      {service.titleEn && <span className="text-sm text-gray-500">· {service.titleEn}</span>}
                      <Badge className={`text-xs border-0 ${service.status === "published" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                        {service.status === "published" ? "منشور" : "مسودة"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{service.shortDescription}</p>
                    <code className="text-xs text-blue-500 mt-1">/{service.slug}</code>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(service)} data-testid={`btn-edit-service-${service.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => { if (confirm("هل أنت متأكد من الحذف؟")) deleteMut.mutate(service.id); }}
                      data-testid={`btn-delete-service-${service.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>العنوان (عربي) *</Label>
                <Input data-testid="input-service-title" value={form.title} onChange={e => { F("title", e.target.value); if (!editId) F("slug", slugify(e.target.value)); }} placeholder="برمجة تطبيقات الجوال" className="mt-1" />
              </div>
              <div>
                <Label>Title (English)</Label>
                <Input value={form.titleEn} onChange={e => F("titleEn", e.target.value)} placeholder="Mobile App Development" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input data-testid="input-service-slug" value={form.slug} onChange={e => F("slug", e.target.value)} placeholder="mobile-app-development" className="mt-1 font-mono text-sm" dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>وصف مختصر (عربي)</Label>
                <Textarea value={form.shortDescription} onChange={e => F("shortDescription", e.target.value)} rows={2} className="mt-1" placeholder="وصف مختصر للخدمة..." />
              </div>
              <div>
                <Label>Short Description (English)</Label>
                <Textarea value={form.shortDescriptionEn} onChange={e => F("shortDescriptionEn", e.target.value)} rows={2} className="mt-1" placeholder="Short description..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>وصف كامل (عربي)</Label>
                <Textarea value={form.fullDescription} onChange={e => F("fullDescription", e.target.value)} rows={4} className="mt-1" />
              </div>
              <div>
                <Label>Full Description (English)</Label>
                <Textarea value={form.fullDescriptionEn} onChange={e => F("fullDescriptionEn", e.target.value)} rows={4} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>رابط الصورة</Label>
                <Input value={form.imageUrl} onChange={e => F("imageUrl", e.target.value)} placeholder="https://..." className="mt-1" dir="ltr" />
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => F("status", v)}>
                  <SelectTrigger data-testid="select-service-status" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>الترتيب</Label>
              <Input type="number" value={form.displayOrder} onChange={e => F("displayOrder", parseInt(e.target.value) || 0)} className="mt-1 w-32" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} data-testid="btn-save-service" disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
