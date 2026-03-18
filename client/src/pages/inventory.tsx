import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Package, Plus, TrendingDown, AlertTriangle, Search,
  Trash2, Edit2, Tag, MapPin, Truck, BarChart3, DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { InventoryItem } from "@shared/schema";

const CATEGORIES = ["إلكترونيات", "أدوات مكتبية", "مستلزمات المكتب", "قطع غيار", "مواد خام", "منتجات نهائية", "مستهلكات", "أخرى"];
const UNITS = ["قطعة", "كيلوغرام", "لتر", "متر", "صندوق", "دوزن", "رول", "حبة"];

interface ItemForm {
  name: string;
  nameEn: string;
  sku: string;
  barcode: string;
  category: string;
  unit: string;
  quantity: string;
  minQuantity: string;
  maxQuantity: string;
  costPrice: string;
  sellPrice: string;
  supplier: string;
  location: string;
  description: string;
}

export default function Inventory() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showLowOnly, setShowLowOnly] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ItemForm>({
    defaultValues: { name: "", nameEn: "", sku: "", barcode: "", category: "", unit: "قطعة", quantity: "0", minQuantity: "0", maxQuantity: "", costPrice: "", sellPrice: "", supplier: "", location: "", description: "" },
  });

  const { data: allItems = [], isLoading } = useQuery<InventoryItem[]>({ queryKey: ["/api/inventory"] });

  const createMutation = useMutation({
    mutationFn: (data: ItemForm) => apiRequest("POST", "/api/inventory", {
      ...data,
      quantity: parseInt(data.quantity) || 0,
      minQuantity: parseInt(data.minQuantity) || 0,
      maxQuantity: data.maxQuantity ? parseInt(data.maxQuantity) : null,
      costPrice: data.costPrice || null,
      sellPrice: data.sellPrice || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowDialog(false); reset();
      toast({ title: "تمت إضافة الصنف" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ItemForm> }) =>
      apiRequest("PATCH", `/api/inventory/${id}`, {
        ...data,
        quantity: data.quantity !== undefined ? parseInt(data.quantity) || 0 : undefined,
        minQuantity: data.minQuantity !== undefined ? parseInt(data.minQuantity) || 0 : undefined,
        maxQuantity: data.maxQuantity ? parseInt(data.maxQuantity) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowDialog(false); setEditingItem(null); reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "تم حذف الصنف" });
    },
  });

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setValue("name", item.name);
    setValue("nameEn", item.nameEn || "");
    setValue("sku", item.sku || "");
    setValue("barcode", item.barcode || "");
    setValue("category", item.category || "");
    setValue("unit", item.unit || "قطعة");
    setValue("quantity", item.quantity.toString());
    setValue("minQuantity", item.minQuantity?.toString() || "0");
    setValue("maxQuantity", item.maxQuantity?.toString() || "");
    setValue("costPrice", item.costPrice?.toString() || "");
    setValue("sellPrice", item.sellPrice?.toString() || "");
    setValue("supplier", item.supplier || "");
    setValue("location", item.location || "");
    setValue("description", item.description || "");
    setShowDialog(true);
  };

  const adjustQuantity = (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    updateMutation.mutate({ id: item.id, data: { quantity: newQty.toString() } });
  };

  const isLow = (item: InventoryItem) => item.minQuantity !== null && item.quantity <= (item.minQuantity || 0);

  const filtered = allItems.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || item.category === filterCategory;
    const matchLow = !showLowOnly || isLow(item);
    return matchSearch && matchCategory && matchLow;
  });

  const stats = {
    total: allItems.length,
    totalQty: allItems.reduce((s, i) => s + i.quantity, 0),
    lowStock: allItems.filter(isLow).length,
    totalValue: allItems.reduce((s, i) => s + (i.quantity * parseFloat(i.costPrice || "0")), 0),
  };

  const categories = [...new Set(allItems.map(i => i.category).filter(Boolean))];

  const onSubmit = (data: ItemForm) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="المخزون" description="إدارة المخزون والأصناف والمستودعات" />
        <Button
          onClick={() => { setEditingItem(null); reset(); setShowDialog(true); }}
          className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
          data-testid="button-add-item"
        >
          <Plus className="h-4 w-4 ml-2" />
          صنف جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "الأصناف",       value: stats.total,    color: "text-gray-700",   bg: "bg-gray-50",   suffix: "" },
          { label: "الكمية الكلية", value: stats.totalQty, color: "text-[#ff6a00]",  bg: "bg-orange-50", suffix: " وحدة" },
          { label: "منخفض المخزون", value: stats.lowStock, color: "text-red-600",    bg: "bg-red-50",    suffix: "" },
          { label: "قيمة المخزون",  value: Math.round(stats.totalValue).toLocaleString("ar-SA"), color: "text-green-700", bg: "bg-green-50", suffix: " ر.س" },
        ].map((s) => (
          <Card key={s.label} className={`border-0 ${s.bg}`}>
            <CardContent className="pt-5 pb-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}{s.suffix}</div>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن صنف أو رمز SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            data-testid="input-search-inventory"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40" data-testid="select-filter-category">
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {categories.map(c => <SelectItem key={c!} value={c!}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => setShowLowOnly(!showLowOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${showLowOnly ? "bg-red-100 border-red-300 text-red-700" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"}`}
          data-testid="filter-low-stock"
        >
          <AlertTriangle className="h-4 w-4" />
          منخفض المخزون
          {stats.lowStock > 0 && (
            <span className="bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{stats.lowStock}</span>
          )}
        </button>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-[#ff6a00]" />
            الأصناف ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا توجد أصناف</p>
              <Button variant="link" className="text-[#ff6a00] mt-1"
                onClick={() => { setEditingItem(null); reset(); setShowDialog(true); }}>
                أضف صنفًا جديدًا
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-right py-3 px-4 font-medium text-gray-600">الصنف</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">الرمز</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">الكمية</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">السعر</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">الحالة</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const low = isLow(item);
                    return (
                      <tr
                        key={item.id}
                        className={`border-b hover:bg-gray-50 transition-colors ${low ? "bg-red-50/40" : ""}`}
                        data-testid={`inventory-item-${item.id}`}
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{item.sku || "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => adjustQuantity(item, -1)}
                              className="w-6 h-6 rounded border border-gray-200 hover:border-orange-400 hover:bg-orange-50 flex items-center justify-center text-gray-600 hover:text-[#ff6a00] transition-all text-xs font-bold"
                              data-testid={`button-decrease-${item.id}`}
                            >−</button>
                            <span className={`w-12 text-center font-semibold ${low ? "text-red-600" : ""}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => adjustQuantity(item, 1)}
                              className="w-6 h-6 rounded border border-gray-200 hover:border-orange-400 hover:bg-orange-50 flex items-center justify-center text-gray-600 hover:text-[#ff6a00] transition-all text-xs font-bold"
                              data-testid={`button-increase-${item.id}`}
                            >+</button>
                          </div>
                          <p className="text-xs text-center text-muted-foreground mt-0.5">{item.unit}</p>
                        </td>
                        <td className="py-3 px-4">
                          {item.sellPrice ? (
                            <div>
                              <p className="font-medium">{parseFloat(item.sellPrice).toLocaleString("ar-SA")} ر.س</p>
                              {item.costPrice && <p className="text-xs text-muted-foreground">التكلفة: {parseFloat(item.costPrice).toLocaleString("ar-SA")}</p>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {low ? (
                            <span className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                              <AlertTriangle className="h-3 w-3" />
                              منخفض ({item.minQuantity} حد أدنى)
                            </span>
                          ) : (
                            <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">كافي</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="text-muted-foreground hover:text-[#ff6a00] transition-colors"
                              data-testid={`button-edit-item-${item.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate(item.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors"
                              data-testid={`button-delete-item-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(o) => { setShowDialog(o); if (!o) { setEditingItem(null); reset(); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#ff6a00]" />
              {editingItem ? "تعديل الصنف" : "صنف جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الاسم بالعربية *</label>
                <Input {...register("name", { required: true })} placeholder="اسم الصنف" data-testid="input-item-name" className={errors.name ? "border-red-400" : ""} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الاسم بالإنجليزية</label>
                <Input {...register("nameEn")} placeholder="Item name" data-testid="input-item-name-en" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">رمز SKU</label>
                <Input {...register("sku")} placeholder="SKU-001" data-testid="input-item-sku" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الباركود</label>
                <Input {...register("barcode")} placeholder="1234567890" data-testid="input-item-barcode" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الوحدة</label>
                <Select defaultValue="قطعة" onValueChange={(v) => setValue("unit", v)}>
                  <SelectTrigger data-testid="select-item-unit"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الفئة</label>
              <Select defaultValue="" onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger data-testid="select-item-category"><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الكمية الحالية</label>
                <Input type="number" min="0" {...register("quantity")} data-testid="input-item-quantity" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الحد الأدنى</label>
                <Input type="number" min="0" {...register("minQuantity")} data-testid="input-item-min-qty" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الحد الأقصى</label>
                <Input type="number" min="0" {...register("maxQuantity")} placeholder="اختياري" data-testid="input-item-max-qty" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">سعر التكلفة (ر.س)</label>
                <Input type="number" step="0.01" min="0" {...register("costPrice")} placeholder="0.00" data-testid="input-item-cost-price" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">سعر البيع (ر.س)</label>
                <Input type="number" step="0.01" min="0" {...register("sellPrice")} placeholder="0.00" data-testid="input-item-sell-price" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">المورد</label>
                <Input {...register("supplier")} placeholder="اسم المورد" data-testid="input-item-supplier" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الموقع</label>
                <Input {...register("location")} placeholder="رف A3، مخزن 1..." data-testid="input-item-location" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف</label>
              <Textarea {...register("description")} placeholder="وصف اختياري..." rows={2} data-testid="input-item-description" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-item">
                {editingItem ? "حفظ التعديلات" : "إضافة الصنف"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setEditingItem(null); reset(); }}>إلغاء</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
