import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, BarChart3, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { SiteStat } from "@shared/schema";

type StatForm = { value: string; labelAr: string; labelEn: string; displayOrder: number };
const empty: StatForm = { value: "", labelAr: "", labelEn: "", displayOrder: 0 };

export default function WebsiteSiteStats() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StatForm>(empty);

  const { data: stats = [], isLoading } = useQuery<SiteStat[]>({ queryKey: ["/api/cms/site-stats"] });

  const createMut = useMutation({
    mutationFn: (d: StatForm) => apiRequest("POST", "/api/cms/site-stats", d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/site-stats"] });
      setOpen(false); setForm(empty);
      toast({ title: "تم إضافة الإحصاء" });
    },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StatForm> }) => apiRequest("PATCH", `/api/cms/site-stats/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/site-stats"] });
      setOpen(false); setEditId(null);
      toast({ title: "تم التحديث" });
    },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/site-stats/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/site-stats"] });
      toast({ title: "تم الحذف" });
    },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  function openCreate() { setEditId(null); setForm(empty); setOpen(true); }
  function openEdit(s: SiteStat) {
    setEditId(s.id);
    setForm({ value: s.value, labelAr: s.labelAr, labelEn: s.labelEn || "", displayOrder: s.displayOrder || 0 });
    setOpen(true);
  }
  function submit() {
    if (!form.value.trim() || !form.labelAr.trim()) {
      toast({ title: "يرجى تعبئة الرقم والتسمية بالعربية", variant: "destructive" });
      return;
    }
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  }

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">الأرقام والإحصاءات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">الأرقام الظاهرة في قسم الإحصاءات بالصفحة الرئيسية</p>
        </div>
        <Button onClick={openCreate} data-testid="btn-add-stat">
          <Plus className="w-4 h-4 me-2" />
          إضافة رقم
        </Button>
      </div>

      {/* Preview hint */}
      <Card className="border-dashed border-amber-300 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            💡 هذه الأرقام تظهر في قسم الإحصاءات في الصفحة الرئيسية — مثل: "500+ مشروع منجز"، "200+ عميل سعيد".
            إذا كان القسم فارغاً ستظهر أرقام افتراضية.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stats.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">لا توجد إحصاءات بعد. أضف أول رقم!</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={openCreate} data-testid="btn-add-stat-empty">
              <Plus className="w-4 h-4 me-1" /> إضافة رقم
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...stats].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((s) => (
            <Card key={s.id} className="group relative" data-testid={`stat-card-${s.id}`}>
              <CardContent className="pt-5 pb-4 text-center">
                <div className="text-3xl font-black text-orange-500 mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.labelAr}</div>
                {s.labelEn && <div className="text-xs text-gray-400 mt-0.5">{s.labelEn}</div>}
                <div className="flex gap-2 justify-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7"
                    onClick={() => openEdit(s)}
                    data-testid={`btn-edit-stat-${s.id}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7 text-red-500 hover:text-red-600"
                    onClick={() => deleteMut.mutate(s.id)}
                    disabled={deleteMut.isPending}
                    data-testid={`btn-delete-stat-${s.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل الإحصاء" : "إضافة إحصاء جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الرقم / القيمة <span className="text-red-500">*</span></Label>
              <Input
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="500+"
                className="mt-1 font-bold text-lg"
                dir="ltr"
                data-testid="input-stat-value"
              />
              <p className="text-xs text-gray-400 mt-1">مثال: 500+ أو 10 سنوات أو 98%</p>
            </div>
            <div>
              <Label>التسمية بالعربية <span className="text-red-500">*</span></Label>
              <Input
                value={form.labelAr}
                onChange={e => setForm(f => ({ ...f, labelAr: e.target.value }))}
                placeholder="مشروع منجز"
                className="mt-1 text-right"
                dir="rtl"
                data-testid="input-stat-label-ar"
              />
            </div>
            <div>
              <Label>التسمية بالإنجليزية</Label>
              <Input
                value={form.labelEn}
                onChange={e => setForm(f => ({ ...f, labelEn: e.target.value }))}
                placeholder="Completed Projects"
                className="mt-1"
                dir="ltr"
                data-testid="input-stat-label-en"
              />
            </div>
            <div>
              <Label>ترتيب العرض</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="mt-1 w-24"
                dir="ltr"
                data-testid="input-stat-order"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={submit} disabled={isPending} data-testid="btn-save-stat">
              {isPending ? "جاري الحفظ..." : editId ? "حفظ التغييرات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
