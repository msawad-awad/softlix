import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Link2, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Redirect } from "@shared/schema";

type RedirectForm = { fromUrl: string; toUrl: string; statusCode: number; isActive: boolean };
const empty: RedirectForm = { fromUrl: "", toUrl: "", statusCode: 301, isActive: true };

const DEFAULT_REDIRECTS = [
  { from: "/about/", to: "/about" },
  { from: "/porjects/", to: "/projects" },
  { from: "/contact-us/", to: "/contact" },
  { from: "/porjects/maskaniun/", to: "/projects/maskaniun" },
  { from: "/porjects/taysir-app/", to: "/projects/taysir-app" },
  { from: "/porjects/jamala-app/", to: "/projects/jamala-app" },
  { from: "/porjects/saeid/", to: "/projects/saeid" },
  { from: "/porjects/transfer-application/", to: "/projects/transfer-application" },
  { from: "/mobile-app-development/", to: "/services/mobile-app-development" },
  { from: "/software-services/", to: "/services/software-services" },
  { from: "/technical-consulting/", to: "/services/technical-consulting" },
  { from: "/content-management-and-designs/", to: "/services/content-management" },
  { from: "/magnto/", to: "/services/ecommerce" },
];

export default function WebsiteRedirects() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RedirectForm>(empty);

  const { data: redirectsList = [], isLoading } = useQuery<Redirect[]>({ queryKey: ["/api/cms/redirects"] });

  const createMut = useMutation({
    mutationFn: (d: RedirectForm) => apiRequest("POST", "/api/cms/redirects", d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/redirects"] }); setOpen(false); setForm(empty); toast({ title: "تم إضافة التحويل" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { isActive: boolean } }) => apiRequest("PATCH", `/api/cms/redirects/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/redirects"] }); toast({ title: "تم التحديث" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/redirects/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/redirects"] }); toast({ title: "تم الحذف" }); },
  });

  const bulkAddDefaults = async () => {
    for (const r of DEFAULT_REDIRECTS) {
      await apiRequest("POST", "/api/cms/redirects", { fromUrl: r.from, toUrl: r.to, statusCode: 301, isActive: true }).catch(() => {});
    }
    queryClient.invalidateQueries({ queryKey: ["/api/cms/redirects"] });
    toast({ title: "تم إضافة التحويلات الافتراضية بنجاح" });
  };

  const F = (k: keyof RedirectForm, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">إدارة التحويلات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة روابط إعادة التوجيه للموقع</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={bulkAddDefaults} data-testid="btn-add-default-redirects">
            إضافة التحويلات الافتراضية
          </Button>
          <Button onClick={() => { setForm(empty); setOpen(true); }} data-testid="btn-add-redirect">
            <Plus className="w-4 h-4 me-2" /> إضافة تحويل
          </Button>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
        <p className="text-sm text-[#ff6a00] dark:text-[#ff6a00]">
          <strong>تلميح:</strong> اضغط على "إضافة التحويلات الافتراضية" لإضافة جميع التحويلات من الموقع القديم (softlixagency.com) تلقائياً، مثل /porjects/ → /projects
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3">{[1,2,3].map(i=><div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"/>)}</div>
      ) : redirectsList.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Link2 className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600"/><p className="text-gray-500 mb-4">لا توجد تحويلات</p></CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {redirectsList.map(r => (
            <Card key={r.id} className="hover:shadow-sm transition-shadow" data-testid={`redirect-row-${r.id}`}>
              <CardContent className="py-3 px-5">
                <div className="flex items-center gap-3">
                  <Badge className={`flex-shrink-0 text-xs border-0 ${r.statusCode === 301 ? "bg-orange-100 dark:bg-orange-900/30 text-[#ff6a00]" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700"}`}>{r.statusCode}</Badge>
                  <code className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1" dir="ltr">{r.fromUrl}</code>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <code className="text-sm text-[#ff6a00] dark:text-[#ff6a00] truncate flex-1" dir="ltr">{r.toUrl}</code>
                  <span className="text-xs text-gray-400 flex-shrink-0">{r.hitCount || 0} زيارة</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateMut.mutate({ id: r.id, data: { isActive: !r.isActive } })}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${r.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      data-testid={`btn-toggle-redirect-${r.id}`}>
                      {r.isActive ? <CheckCircle2 className="w-3.5 h-3.5"/> : <XCircle className="w-3.5 h-3.5"/>}
                    </button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500" onClick={()=>{if(confirm("حذف هذا التحويل؟"))deleteMut.mutate(r.id)}} data-testid={`btn-delete-redirect-${r.id}`}><Trash2 className="w-3.5 h-3.5"/></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة تحويل جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>الرابط القديم (من) *</Label><Input data-testid="input-from-url" value={form.fromUrl} onChange={e=>F("fromUrl",e.target.value)} placeholder="/about/" className="mt-1 font-mono text-sm" dir="ltr"/></div>
            <div><Label>الرابط الجديد (إلى) *</Label><Input data-testid="input-to-url" value={form.toUrl} onChange={e=>F("toUrl",e.target.value)} placeholder="/about" className="mt-1 font-mono text-sm" dir="ltr"/></div>
            <div><Label>نوع التحويل</Label>
              <Select value={String(form.statusCode)} onValueChange={v=>F("statusCode",parseInt(v))}>
                <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301 - دائم (Permanent)</SelectItem>
                  <SelectItem value="302">302 - مؤقت (Temporary)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>إلغاء</Button>
            <Button data-testid="btn-save-redirect" onClick={()=>{if(!form.fromUrl||!form.toUrl){toast({title:"الروابط مطلوبة",variant:"destructive"});return;}createMut.mutate(form);}} disabled={createMut.isPending}>{createMut.isPending?"جاري الحفظ...":"حفظ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
