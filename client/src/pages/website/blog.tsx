import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, FileText, Eye } from "lucide-react";
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
import type { BlogPost } from "@shared/schema";

type PostForm = {
  title: string; titleEn: string; slug: string;
  excerpt: string; excerptEn: string;
  content: string; contentEn: string;
  featuredImageUrl: string; status: string;
};

const empty: PostForm = { title: "", titleEn: "", slug: "", excerpt: "", excerptEn: "", content: "", contentEn: "", featuredImageUrl: "", status: "draft" };

function slugify(t: string) { return t.toLowerCase().replace(/[^\w\u0600-\u06FF]+/g, "-").replace(/(^-|-$)/g, ""); }

export default function WebsiteBlog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(empty);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({ queryKey: ["/api/cms/blog"] });

  const createMut = useMutation({
    mutationFn: (d: PostForm) => apiRequest("POST", "/api/cms/blog", d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] }); setOpen(false); setForm(empty); toast({ title: "تم إضافة المقال" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PostForm> }) => apiRequest("PATCH", `/api/cms/blog/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] }); setOpen(false); setEditId(null); toast({ title: "تم التحديث" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/blog/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] }); toast({ title: "تم الحذف" }); },
  });

  const openEdit = (p: BlogPost) => {
    setForm({ title: p.title, titleEn: p.titleEn || "", slug: p.slug, excerpt: p.excerpt || "", excerptEn: p.excerptEn || "", content: p.content || "", contentEn: p.contentEn || "", featuredImageUrl: p.featuredImageUrl || "", status: p.status });
    setEditId(p.id); setOpen(true);
  };

  const F = (k: keyof PostForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">إدارة المدونة</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">كتابة ونشر مقالات المدونة</p>
        </div>
        <Button onClick={() => { setForm(empty); setEditId(null); setOpen(true); }} data-testid="btn-add-post">
          <Plus className="w-4 h-4 me-2" /> إضافة مقال
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">{[1,2,3].map(i=><div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"/>)}</div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"/><p className="text-gray-500 mb-4">لا توجد مقالات</p><Button onClick={()=>setOpen(true)}><Plus className="w-4 h-4 me-2"/>إضافة أول مقال</Button></CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {posts.map(p => (
            <Card key={p.id} data-testid={`post-row-${p.id}`}>
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-gray-900 dark:text-white truncate">{p.title}</span>
                      <Badge className={`text-xs border-0 flex-shrink-0 ${p.status === "published" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"}`}>{p.status === "published" ? "منشور" : "مسودة"}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{p.excerpt}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <code className="text-xs text-blue-500">/blog/{p.slug}</code>
                      {p.publishedAt && <span className="text-xs text-gray-400">{new Date(p.publishedAt).toLocaleDateString("ar-SA")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={()=>openEdit(p)} data-testid={`btn-edit-post-${p.id}`}><Pencil className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={()=>{if(confirm("حذف؟"))deleteMut.mutate(p.id)}} data-testid={`btn-delete-post-${p.id}`}><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "تعديل مقال" : "إضافة مقال جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>العنوان (عربي) *</Label><Input data-testid="input-post-title" value={form.title} onChange={e=>{F("title",e.target.value);if(!editId)F("slug",slugify(e.target.value));}} className="mt-1"/></div>
              <div><Label>Title (English)</Label><Input value={form.titleEn} onChange={e=>F("titleEn",e.target.value)} className="mt-1"/></div>
            </div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e=>F("slug",e.target.value)} className="mt-1 font-mono text-sm" dir="ltr"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>مقتطف (عربي)</Label><Textarea value={form.excerpt} onChange={e=>F("excerpt",e.target.value)} rows={2} className="mt-1"/></div>
              <div><Label>Excerpt (English)</Label><Textarea value={form.excerptEn} onChange={e=>F("excerptEn",e.target.value)} rows={2} className="mt-1"/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>المحتوى (عربي)</Label><Textarea value={form.content} onChange={e=>F("content",e.target.value)} rows={6} className="mt-1"/></div>
              <div><Label>Content (English)</Label><Textarea value={form.contentEn} onChange={e=>F("contentEn",e.target.value)} rows={6} className="mt-1"/></div>
            </div>
            <ImageUploader
              value={form.featuredImageUrl}
              onChange={v => F("featuredImageUrl", v)}
              label="الصورة الرئيسية للمقال"
              hint="تظهر في بطاقة المقال وأعلى صفحة التفاصيل"
              data-testid="uploader-post-image"
            />
            <div>
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={v=>F("status",v)}>
                <SelectTrigger data-testid="select-post-status" className="mt-1 w-48"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>إلغاء</Button>
            <Button data-testid="btn-save-post" onClick={()=>{if(!form.title||!form.slug){toast({title:"العنوان والـ Slug مطلوبان",variant:"destructive"});return;}if(editId)updateMut.mutate({id:editId,data:form});else createMut.mutate(form);}} disabled={createMut.isPending||updateMut.isPending}>{createMut.isPending||updateMut.isPending?"جاري الحفظ...":"حفظ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
