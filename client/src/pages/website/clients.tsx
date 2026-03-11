import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Users2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { SiteClient } from "@shared/schema";

type ClientForm = { name: string; logoUrl: string; websiteUrl: string; displayOrder: number };
const empty: ClientForm = { name: "", logoUrl: "", websiteUrl: "", displayOrder: 0 };

export default function WebsiteClients() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientForm>(empty);

  const { data: clients = [], isLoading } = useQuery<SiteClient[]>({ queryKey: ["/api/cms/clients"] });

  const createMut = useMutation({
    mutationFn: (d: ClientForm) => apiRequest("POST", "/api/cms/clients", d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/clients"] }); setOpen(false); setForm(empty); toast({ title: "تم الإضافة" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientForm> }) => apiRequest("PATCH", `/api/cms/clients/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/clients"] }); setOpen(false); setEditId(null); toast({ title: "تم التحديث" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/clients/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/clients"] }); toast({ title: "تم الحذف" }); },
  });

  const openEdit = (c: SiteClient) => { setForm({ name: c.name, logoUrl: c.logoUrl || "", websiteUrl: c.websiteUrl || "", displayOrder: c.displayOrder || 0 }); setEditId(c.id); setOpen(true); };
  const F = (k: keyof ClientForm, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">شعارات العملاء</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">عملاؤنا الكرام الذين يثقون بنا</p>
        </div>
        <Button onClick={() => { setForm(empty); setEditId(null); setOpen(true); }} data-testid="btn-add-client">
          <Plus className="w-4 h-4 me-2" /> إضافة عميل
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"/>)}
        </div>
      ) : clients.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><Users2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"/><p className="text-gray-500 mb-4">لا توجد عملاء بعد</p><Button onClick={()=>setOpen(true)}><Plus className="w-4 h-4 me-2"/>إضافة عميل</Button></CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clients.map(c => (
            <Card key={c.id} className="group" data-testid={`client-card-${c.id}`}>
              <CardContent className="p-4 text-center relative">
                <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={()=>openEdit(c)} data-testid={`btn-edit-client-${c.id}`}><Pencil className="w-3 h-3"/></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={()=>{if(confirm("حذف؟"))deleteMut.mutate(c.id)}} data-testid={`btn-delete-client-${c.id}`}><Trash2 className="w-3 h-3"/></Button>
                </div>
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.name} className="h-12 mx-auto object-contain mb-2" />
                ) : (
                  <div className="h-12 w-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-2">
                    <Users2 className="w-6 h-6 text-gray-400"/>
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                {c.websiteUrl && <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{c.websiteUrl}</a>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "تعديل العميل" : "إضافة عميل جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>اسم العميل *</Label><Input data-testid="input-client-name" value={form.name} onChange={e=>F("name",e.target.value)} placeholder="اسم الشركة أو العميل" className="mt-1"/></div>
            <div><Label>رابط الشعار (Logo URL)</Label><Input value={form.logoUrl} onChange={e=>F("logoUrl",e.target.value)} placeholder="https://..." className="mt-1" dir="ltr"/>
              {form.logoUrl && <img src={form.logoUrl} alt="preview" className="h-12 mt-2 object-contain" onError={e=>(e.currentTarget.style.display="none")}/>}
            </div>
            <div><Label>رابط الموقع</Label><Input value={form.websiteUrl} onChange={e=>F("websiteUrl",e.target.value)} placeholder="https://..." className="mt-1" dir="ltr"/></div>
            <div><Label>الترتيب</Label><Input type="number" value={form.displayOrder} onChange={e=>F("displayOrder",parseInt(e.target.value)||0)} className="mt-1 w-24"/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>إلغاء</Button>
            <Button data-testid="btn-save-client" onClick={()=>{if(!form.name){toast({title:"الاسم مطلوب",variant:"destructive"});return;}if(editId)updateMut.mutate({id:editId,data:form});else createMut.mutate(form);}} disabled={createMut.isPending||updateMut.isPending}>{createMut.isPending||updateMut.isPending?"جاري الحفظ...":"حفظ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
