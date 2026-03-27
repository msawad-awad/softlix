import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const phoneSettingSchema = z.object({
  category: z.string().min(1, "الفئة مطلوبة"),
  phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
  whatsappNumber: z.string().optional(),
  displayName: z.string().optional(),
  isDefault: z.boolean().optional(),
  displayOrder: z.number().optional(),
});

type PhoneSettingInput = z.infer<typeof phoneSettingSchema>;

interface PhoneSetting extends PhoneSettingInput {
  id: string;
}

export default function PhoneSettings() {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PhoneSettingInput>({
    category: "",
    phoneNumber: "",
    whatsappNumber: "",
    displayName: "",
    isDefault: false,
    displayOrder: 0,
  });

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["/api/phone-settings"],
    queryFn: () => apiRequest("GET", "/api/phone-settings"),
  });

  const createMutation = useMutation({
    mutationFn: async (data: PhoneSettingInput) => {
      return apiRequest("POST", "/api/phone-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-settings"] });
      setFormData({ category: "", phoneNumber: "", whatsappNumber: "", displayName: "", isDefault: false, displayOrder: 0 });
      setIsAdding(false);
      toast({ title: "✓ تم الإضافة بنجاح" });
    },
    onError: () => toast({ title: "خطأ في الإضافة", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; data: Partial<PhoneSettingInput> }) => {
      return apiRequest("PATCH", `/api/phone-settings/${data.id}`, data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-settings"] });
      setEditingId(null);
      setFormData({ category: "", phoneNumber: "", whatsappNumber: "", displayName: "", isDefault: false, displayOrder: 0 });
      toast({ title: "✓ تم التحديث بنجاح" });
    },
    onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/phone-settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-settings"] });
      toast({ title: "✓ تم الحذف بنجاح" });
    },
    onError: () => toast({ title: "خطأ في الحذف", variant: "destructive" }),
  });

  const handleSubmit = () => {
    try {
      const validated = phoneSettingSchema.parse(formData);
      if (editingId) {
        updateMutation.mutate({ id: editingId, data: validated });
      } else {
        createMutation.mutate(validated);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: error.errors[0].message, variant: "destructive" });
      }
    }
  };

  const handleEdit = (setting: PhoneSetting) => {
    setEditingId(setting.id);
    setFormData(setting);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ category: "", phoneNumber: "", whatsappNumber: "", displayName: "", isDefault: false, displayOrder: 0 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة أرقام الهاتف</h1>
        <p className="text-gray-500 mt-2">تحكم في أرقام الهاتف والـ WhatsApp لكل فئة من فئات التواصل</p>
      </div>

      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)} className="bg-[#ff6a00]">
          <Plus className="w-4 h-4 ml-2" />
          إضافة رقم جديد
        </Button>
      )}

      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "تعديل الرقم" : "إضافة رقم جديد"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الفئة</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-right"
              >
                <option value="">اختر الفئة</option>
                <option value="default">افتراضي</option>
                <option value="programming">البرمجة</option>
                <option value="marketing">التسويق</option>
                <option value="services">الخدمات</option>
                <option value="careers">الوظائف</option>
                <option value="support">الدعم الفني</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+966501234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">رقم WhatsApp (اختياري)</label>
              <Input
                type="tel"
                value={formData.whatsappNumber || ""}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="+966501234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">اسم العرض (اختياري)</label>
              <Input
                value={formData.displayName || ""}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="مثل: استفسارات البرمجة"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isDefault || false}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <span className="text-sm">رقم افتراضي</span>
            </label>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                className="bg-[#ff6a00]"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "حفظ التعديلات" : "إضافة"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center text-gray-500">جاري التحميل...</div>
      ) : settings.length === 0 ? (
        <div className="text-center text-gray-500 py-8">لم تقم بإضافة أي أرقام هاتف بعد</div>
      ) : (
        <div className="space-y-3">
          {settings.map((setting: PhoneSetting) => (
            <Card key={setting.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{setting.displayName || setting.category}</h3>
                      {setting.isDefault && <span className="text-xs bg-[#ff6a00] text-white px-2 py-1 rounded">افتراضي</span>}
                    </div>
                    <p className="text-gray-600 text-sm">☎️ {setting.phoneNumber}</p>
                    {setting.whatsappNumber && (
                      <p className="text-gray-600 text-sm">💬 {setting.whatsappNumber}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(setting)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(setting.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}