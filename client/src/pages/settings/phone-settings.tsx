import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Phone, MessageCircle, Plus, Trash2, Pencil, Star,
  Globe, Code2, Megaphone, Wrench, Briefcase, HeadphonesIcon,
  ExternalLink, Info,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PhoneSetting {
  id: string;
  category: string;
  phoneNumber: string;
  whatsappNumber?: string;
  displayName?: string;
  isDefault: boolean;
  displayOrder: number;
}

const CATEGORIES = [
  {
    id: "default",
    label: "الرقم الافتراضي",
    desc: "يُستخدم في جميع الصفحات التي ليس لها رقم خاص",
    icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    pages: ["الصفحة الرئيسية", "تواصل معنا"],
  },
  {
    id: "programming",
    label: "البرمجة والتطوير",
    desc: "استفسارات التطبيقات، المواقع، الأنظمة",
    icon: Code2,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    pages: ["صفحة خدمات البرمجة", "نموذج طلب مشروع"],
  },
  {
    id: "marketing",
    label: "التسويق الرقمي",
    desc: "إدارة السوشيال ميديا، إعلانات، SEO",
    icon: Megaphone,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    pages: ["صفحة خدمات التسويق", "نموذج طلب خدمة"],
  },
  {
    id: "services",
    label: "الخدمات العامة",
    desc: "الخدمات الأخرى والاستشارات",
    icon: Wrench,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    pages: ["صفحة الخدمات", "الباقات والأسعار"],
  },
  {
    id: "careers",
    label: "الوظائف والتوظيف",
    desc: "التقديم على الوظائف والبيانات الوظيفية",
    icon: Briefcase,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    pages: ["صفحة الوظائف", "نموذج التقديم"],
  },
  {
    id: "support",
    label: "الدعم الفني",
    desc: "مشكلات تقنية، صيانة، دعم ما بعد البيع",
    icon: HeadphonesIcon,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    pages: ["بوابة الدعم", "تذاكر الدعم الفني"],
  },
];

const emptyForm = {
  category: "",
  phoneNumber: "",
  whatsappNumber: "",
  displayName: "",
  isDefault: false,
  displayOrder: 0,
};

export default function PhoneSettings() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: settings = [], isLoading } = useQuery<PhoneSetting[]>({
    queryKey: ["/api/phone-settings"],
    staleTime: 0,
    refetchOnMount: "always",
  });

  const createMut = useMutation({
    mutationFn: (data: typeof emptyForm) => apiRequest("POST", "/api/phone-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-settings"] });
      setOpen(false);
      setForm(emptyForm);
      toast({ title: "✓ تمت الإضافة بنجاح" });
    },
    onError: () => toast({ title: "خطأ في الإضافة", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof emptyForm> }) =>
      apiRequest("PATCH", `/api/phone-settings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-settings"] });
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
      toast({ title: "✓ تم التحديث بنجاح" });
    },
    onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/phone-settings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-settings"] });
      toast({ title: "✓ تم الحذف" });
    },
    onError: () => toast({ title: "خطأ في الحذف", variant: "destructive" }),
  });

  const openAdd = (categoryId?: string) => {
    setForm({ ...emptyForm, category: categoryId || "" });
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (s: PhoneSetting) => {
    setForm({
      category: s.category,
      phoneNumber: s.phoneNumber,
      whatsappNumber: s.whatsappNumber || "",
      displayName: s.displayName || "",
      isDefault: s.isDefault,
      displayOrder: s.displayOrder,
    });
    setEditId(s.id);
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.category || !form.phoneNumber) {
      toast({ title: "الفئة ورقم الهاتف مطلوبان", variant: "destructive" });
      return;
    }
    if (editId) {
      updateMut.mutate({ id: editId, data: form });
    } else {
      createMut.mutate(form);
    }
  };

  const getSettingsForCategory = (catId: string) =>
    settings.filter(s => s.category === catId);

  const totalSet = CATEGORIES.filter(c => getSettingsForCategory(c.id).length > 0).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">أرقام الهاتف والواتساب</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">تحكّم في أرقام التواصل لكل قسم من أقسام الموقع</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {totalSet} / {CATEGORIES.length} فئات مُضبوطة
          </Badge>
          <Button onClick={() => openAdd()} className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white" data-testid="btn-add-phone">
            <Plus className="w-4 h-4 ms-2" />
            إضافة رقم
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-semibold mb-1">كيف يعمل هذا النظام؟</p>
          <p>كل فئة مرتبطة بصفحات معينة في الموقع. عند تعبئة نموذج تواصل أو الضغط على زر واتساب، يُستخدم الرقم المخصص لتلك الفئة تلقائياً. إذا لم يُضبط رقم لفئة معينة، يُستخدم الرقم الافتراضي.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {CATEGORIES.map(cat => {
            const catSettings = getSettingsForCategory(cat.id);
            const Icon = cat.icon;
            return (
              <Card key={cat.id} className={`border-2 transition-all ${catSettings.length > 0 ? cat.border : "border-gray-200 dark:border-gray-700"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg}`}>
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{cat.label}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{cat.desc}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {catSettings.length > 0 ? (
                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0 text-xs">
                          ✓ مُضبوط
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-400">
                          غير مُضبوط
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAdd(cat.id)}
                        data-testid={`btn-add-phone-${cat.id}`}
                      >
                        <Plus className="w-3.5 h-3.5 ms-1" />
                        إضافة
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cat.pages.map(page => (
                      <span key={page} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        <Globe className="w-3 h-3" />
                        {page}
                      </span>
                    ))}
                  </div>
                </CardHeader>

                {catSettings.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {catSettings.map(s => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-3"
                          data-testid={`phone-row-${s.id}`}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {s.isDefault && (
                              <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            )}
                            {s.displayName && (
                              <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{s.displayName}</span>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400" dir="ltr">
                                <Phone className="w-3.5 h-3.5 text-[#ff6a00]" />
                                {s.phoneNumber}
                              </span>
                              {s.whatsappNumber && (
                                <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400" dir="ltr">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {s.whatsappNumber}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEdit(s)}
                              data-testid={`btn-edit-phone-${s.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => { if (confirm("تأكيد الحذف؟")) deleteMut.mutate(s.id); }}
                              data-testid={`btn-delete-phone-${s.id}`}
                              disabled={deleteMut.isPending}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل رقم الهاتف" : "إضافة رقم جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">الفئة *</Label>
              <Select
                value={form.category}
                onValueChange={v => setForm(f => ({ ...f, category: v }))}
              >
                <SelectTrigger data-testid="select-phone-category">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">اسم العرض (اختياري)</Label>
              <Input
                value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="مثل: استفسارات البرمجة"
                data-testid="input-phone-displayname"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">رقم الهاتف *</Label>
              <Input
                type="tel"
                value={form.phoneNumber}
                onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                placeholder="+966501234567"
                dir="ltr"
                data-testid="input-phone-number"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">رقم WhatsApp (اختياري)</Label>
              <Input
                type="tel"
                value={form.whatsappNumber}
                onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                placeholder="+966501234567"
                dir="ltr"
                data-testid="input-whatsapp-number"
              />
              <p className="text-xs text-gray-400 mt-1">يُستخدم لزر واتساب في الموقع. اتركه فارغاً لاستخدام رقم الهاتف.</p>
            </div>

            <div>
              <Label className="mb-1.5 block">ترتيب العرض</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={e => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                min={0}
                data-testid="input-phone-order"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Switch
                checked={form.isDefault}
                onCheckedChange={v => setForm(f => ({ ...f, isDefault: v }))}
                data-testid="switch-phone-default"
              />
              <div>
                <p className="text-sm font-medium">رقم افتراضي</p>
                <p className="text-xs text-gray-500">يُستخدم عند غياب رقم مخصص لفئة معينة</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleSave}
              className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
              disabled={createMut.isPending || updateMut.isPending}
              data-testid="btn-save-phone"
            >
              {createMut.isPending || updateMut.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
