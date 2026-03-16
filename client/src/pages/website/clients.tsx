import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Users2, Eye, EyeOff, Badge } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { SiteClient } from "@shared/schema";

type ClientForm = {
  name: string;
  nameEn: string;
  logoUrl: string;
  clientType: string;
  displayOrder: number;
  status: string;
};

const empty: ClientForm = { name: "", nameEn: "", logoUrl: "", clientType: "", displayOrder: 0, status: "active" };

const CLIENT_TYPES = [
  "Mobile Application", "Mobile App", "Company", "Government Organization",
  "Real Estate Company", "Charity", "Law Firm", "Cultural Organization",
  "Association", "Automotive Company", "Fashion & Design", "Technology", "Other",
];

export default function WebsiteClients() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientForm>(empty);

  const { data: clients = [], isLoading } = useQuery<SiteClient[]>({ queryKey: ["/api/cms/clients"] });

  const createMut = useMutation({
    mutationFn: (d: ClientForm) => apiRequest("POST", "/api/cms/clients", d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/clients"] }); setOpen(false); setForm(empty); toast({ title: "تم الإضافة بنجاح" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientForm> }) => apiRequest("PATCH", `/api/cms/clients/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/clients"] }); setOpen(false); setEditId(null); toast({ title: "تم التحديث بنجاح" }); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/clients/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/clients"] }); toast({ title: "تم الحذف" }); },
  });

  const toggleStatus = (c: SiteClient) => {
    updateMut.mutate({ id: c.id, data: { status: c.status === "active" ? "inactive" : "active" } });
  };

  const openEdit = (c: SiteClient) => {
    setForm({
      name: c.name,
      nameEn: c.nameEn || "",
      logoUrl: c.logoUrl || "",
      clientType: c.clientType || "",
      displayOrder: c.displayOrder || 0,
      status: c.status,
    });
    setEditId(c.id);
    setOpen(true);
  };

  const F = (k: keyof ClientForm, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const activeCount = clients.filter(c => c.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">شعارات العملاء</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {clients.length} عميل · {activeCount} ظاهر في الموقع
          </p>
        </div>
        <Button onClick={() => { setForm(empty); setEditId(null); setOpen(true); }} data-testid="btn-add-client">
          <Plus className="w-4 h-4 me-2" /> إضافة عميل
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"/>)}
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"/>
            <p className="text-gray-500 mb-4">لا توجد عملاء بعد</p>
            <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 me-2"/>إضافة عميل</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {clients.map(c => (
            <Card
              key={c.id}
              className={`group transition-all ${c.status !== "active" ? "opacity-50" : ""}`}
              data-testid={`client-card-${c.id}`}
            >
              <CardContent className="p-4 text-center relative">
                <div className="absolute top-2 end-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost" size="icon" className="h-6 w-6"
                    onClick={() => toggleStatus(c)}
                    title={c.status === "active" ? "إخفاء" : "إظهار"}
                    data-testid={`btn-toggle-client-${c.id}`}
                  >
                    {c.status === "active" ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(c)} data-testid={`btn-edit-client-${c.id}`}>
                    <Pencil className="w-3 h-3"/>
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-6 w-6 text-red-500"
                    onClick={() => { if (confirm("هل أنت متأكد من الحذف؟")) deleteMut.mutate(c.id); }}
                    data-testid={`btn-delete-client-${c.id}`}
                  >
                    <Trash2 className="w-3 h-3"/>
                  </Button>
                </div>

                <div className="h-14 flex items-center justify-center mb-3">
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt={c.name} className="max-h-14 max-w-full object-contain" />
                  ) : (
                    <div className="h-14 w-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Users2 className="w-6 h-6 text-gray-400"/>
                    </div>
                  )}
                </div>

                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2">{c.name}</p>
                {c.nameEn && <p className="text-xs text-gray-400 truncate mb-1">{c.nameEn}</p>}
                {c.clientType && (
                  <BadgeUI variant="secondary" className="text-xs px-1 py-0">{c.clientType}</BadgeUI>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الاسم بالعربي *</Label>
                <Input data-testid="input-client-name" value={form.name} onChange={e => F("name", e.target.value)} placeholder="اسم الشركة" className="mt-1"/>
              </div>
              <div>
                <Label>الاسم بالإنجليزي</Label>
                <Input data-testid="input-client-name-en" value={form.nameEn} onChange={e => F("nameEn", e.target.value)} placeholder="Company Name" className="mt-1" dir="ltr"/>
              </div>
            </div>

            <ImageUploader
              value={form.logoUrl}
              onChange={v => F("logoUrl", v)}
              label="شعار العميل (Logo)"
              hint="يُفضل PNG أو SVG بخلفية شفافة"
              data-testid="uploader-client-logo"
            />

            <div>
              <Label>نوع العميل</Label>
              <Select value={form.clientType} onValueChange={v => F("clientType", v)}>
                <SelectTrigger className="mt-1" data-testid="select-client-type">
                  <SelectValue placeholder="اختر النوع..." />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الترتيب</Label>
                <Input type="number" value={form.displayOrder} onChange={e => F("displayOrder", parseInt(e.target.value) || 0)} className="mt-1"/>
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => F("status", v)}>
                  <SelectTrigger className="mt-1" data-testid="select-client-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">ظاهر</SelectItem>
                    <SelectItem value="inactive">مخفي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button
              data-testid="btn-save-client"
              onClick={() => {
                if (!form.name) { toast({ title: "الاسم مطلوب", variant: "destructive" }); return; }
                if (editId) updateMut.mutate({ id: editId, data: form });
                else createMut.mutate(form);
              }}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
