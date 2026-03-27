import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Layers, GripVertical, LayoutTemplate, ExternalLink } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

type ProjectForm = {
  title: string; titleEn: string; slug: string;
  description: string; descriptionEn: string;
  thumbnailUrl: string; clientName: string; projectUrl: string;
  category: string; status: string; displayOrder: number;
};

const empty: ProjectForm = {
  title: "", titleEn: "", slug: "", description: "", descriptionEn: "",
  thumbnailUrl: "", clientName: "", projectUrl: "", category: "", status: "published", displayOrder: 0,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function WebsiteProjects() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(empty);

  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/cms/projects"],
    staleTime: 0,
    refetchOnMount: "always",
  });

  const createMut = useMutation({
    mutationFn: (data: ProjectForm) => apiRequest("POST", "/api/cms/projects", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/projects"] }); setOpen(false); setForm(empty); toast({ title: "تم إضافة المشروع" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectForm> }) => apiRequest("PATCH", `/api/cms/projects/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/projects"] }); setOpen(false); setEditId(null); toast({ title: "تم تحديث المشروع" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/projects/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/projects"] }); toast({ title: "تم الحذف" }); },
  });

  const openEdit = (p: Project) => {
    setForm({ title: p.title, titleEn: p.titleEn || "", slug: p.slug, description: p.description || "", descriptionEn: p.descriptionEn || "", thumbnailUrl: p.thumbnailUrl || "", clientName: p.clientName || "", projectUrl: p.projectUrl || "", category: p.category || "", status: p.status, displayOrder: p.displayOrder || 0 });
    setEditId(p.id); setOpen(true);
  };

  const F = (k: keyof ProjectForm, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">إدارة المشاريع</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إضافة وتعديل مشاريع Portfolio</p>
        </div>
        <Button onClick={() => { setForm(empty); setEditId(null); setOpen(true); }} data-testid="btn-add-project">
          <Plus className="w-4 h-4 me-2" /> إضافة مشروع
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : error ? (
        <Card><CardContent className="py-16 text-center"><Layers className="w-12 h-12 mx-auto mb-3 text-red-300" /><p className="text-red-500 mb-2 font-medium">خطأ في تحميل المشاريع</p><p className="text-gray-400 text-sm mb-4">{(error as Error).message}</p><Button variant="outline" onClick={() => window.location.reload()}>إعادة المحاولة</Button></CardContent></Card>
      ) : projects.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><Layers className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" /><p className="text-gray-500 mb-4">لا توجد مشاريع</p><Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 me-2" />إضافة أول مشروع</Button></CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {projects.map(p => (
            <Card key={p.id} data-testid={`project-row-${p.id}`}>
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  {p.thumbnailUrl && <img src={p.thumbnailUrl} alt={p.title} className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />}
                  {!p.thumbnailUrl && <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{p.title}</span>
                      {p.category && <Badge className="text-xs bg-orange-100 dark:bg-orange-900/30 text-[#ff6a00] dark:text-[#ff6a00] border-0">{p.category}</Badge>}
                      <Badge className={`text-xs border-0 ${p.status === "published" ? "bg-green-100 dark:bg-green-900/30 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.status === "published" ? "منشور" : "مسودة"}</Badge>
                    </div>
                    {p.clientName && <p className="text-xs text-gray-500 mt-0.5">{p.clientName}</p>}
                    <code className="text-xs text-[#ff6a00]">/projects/{p.slug}</code>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" asChild title="تفاصيل المشروع الكاملة">
                      <Link href={`/website/projects/${p.id}/details`} data-testid={`btn-details-project-${p.id}`}>
                        <LayoutTemplate className="w-4 h-4 text-[#ff6a00]" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="معاينة">
                      <a href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} data-testid={`btn-edit-project-${p.id}`}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => { if (confirm("تأكيد الحذف؟")) deleteMut.mutate(p.id); }} data-testid={`btn-delete-project-${p.id}`}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "تعديل مشروع" : "إضافة مشروع جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>العنوان (عربي) *</Label><Input data-testid="input-project-title" value={form.title} onChange={e => { F("title", e.target.value); if (!editId) F("slug", slugify(e.target.value)); }} className="mt-1" /></div>
              <div><Label>Title (English)</Label><Input value={form.titleEn} onChange={e => F("titleEn", e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>Slug</Label><Input data-testid="input-project-slug" value={form.slug} onChange={e => F("slug", e.target.value)} className="mt-1 font-mono text-sm" dir="ltr" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>الوصف (عربي)</Label><Textarea value={form.description} onChange={e => F("description", e.target.value)} rows={3} className="mt-1" /></div>
              <div><Label>Description (English)</Label><Textarea value={form.descriptionEn} onChange={e => F("descriptionEn", e.target.value)} rows={3} className="mt-1" /></div>
            </div>
            <ImageUploader
              value={form.thumbnailUrl}
              onChange={v => F("thumbnailUrl", v)}
              label="صورة مصغرة للمشروع"
              hint="تظهر في بطاقة المشروع وصفحة Portfolio"
              data-testid="uploader-project-thumbnail"
            />
            <div><Label>اسم العميل</Label><Input value={form.clientName} onChange={e => F("clientName", e.target.value)} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>التصنيف</Label>
                <Select value={form.category} onValueChange={v => F("category", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="اختر تصنيف" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile-app">تطبيق جوال</SelectItem>
                    <SelectItem value="web">موقع ويب</SelectItem>
                    <SelectItem value="marketing">تسويق</SelectItem>
                    <SelectItem value="ecommerce">تجارة إلكترونية</SelectItem>
                    <SelectItem value="fintech">تقنية مالية</SelectItem>
                    <SelectItem value="logistics">لوجستيات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => F("status", v)}>
                  <SelectTrigger data-testid="select-project-status" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button data-testid="btn-save-project" onClick={() => { if (!form.title || !form.slug) { toast({ title: "العنوان والـ Slug مطلوبان", variant: "destructive" }); return; } if (editId) updateMut.mutate({ id: editId, data: form }); else createMut.mutate(form); }} disabled={createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "جاري الحفظ..." : "حفظ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
