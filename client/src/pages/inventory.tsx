import { useTranslation } from "react-i18next";
import { Package, Plus, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { useState } from "react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  price: number;
  category: string;
}

export default function Inventory() {
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "جهاز الكمبيوتر المحمول",
      sku: "SKU-001",
      quantity: 15,
      minQuantity: 5,
      price: 4500,
      category: "إلكترونيات",
    },
    {
      id: "2",
      name: "ورق الطباعة A4",
      sku: "SKU-002",
      quantity: 2,
      minQuantity: 10,
      price: 25,
      category: "مستلزمات المكتب",
    },
  ]);

  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity < minQuantity) {
      return { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900", text: "منخفض" };
    }
    return { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900", text: "كافي" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={t("nav.inventory")} description="إدارة المخزون والمستودعات" />
        <Button data-testid="button-add-item">
          <Plus className="h-4 w-4 mr-2" />
          {t("form.create")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{items.length}</div>
              <p className="text-sm text-muted-foreground mt-1">إجمالي الأصناف</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">الكمية الإجمالية</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {items.filter((item) => item.quantity < item.minQuantity).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">أصناف منخفضة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            الأصناف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-medium">الاسم</th>
                  <th className="text-right py-3 px-4 font-medium">الرمز</th>
                  <th className="text-right py-3 px-4 font-medium">الكمية</th>
                  <th className="text-right py-3 px-4 font-medium">الحد الأدنى</th>
                  <th className="text-right py-3 px-4 font-medium">السعر</th>
                  <th className="text-right py-3 px-4 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => {
                    const status = getStockStatus(item.quantity, item.minQuantity);
                    return (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{item.sku}</td>
                        <td className="py-3 px-4 font-medium">{item.quantity}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {item.minQuantity}
                        </td>
                        <td className="py-3 px-4">
                          {item.price.toLocaleString("ar-SA")} ريال
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {item.quantity < item.minQuantity && (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <Badge
                              className={`${status.bg} ${status.color}`}
                              variant="outline"
                            >
                              {status.text}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      {t("common.noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
