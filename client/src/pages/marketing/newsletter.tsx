import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Mail, Trash2, UserCheck, UserX, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { NewsletterSubscriber } from "@shared/schema";

export default function NewsletterAdmin() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: subscribers = [], isLoading } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/marketing/newsletter"],
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/marketing/newsletter/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/newsletter"] });
      toast({ title: "تم حذف المشترك" });
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/marketing/newsletter/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/newsletter"] });
      toast({ title: "تم تحديث الحالة" });
    },
  });

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const active = subscribers.filter(s => s.status === "active").length;
  const unsubscribed = subscribers.filter(s => s.status === "unsubscribed").length;

  const handleExportCSV = () => {
    const csv = ["الاسم,البريد الإلكتروني,المصدر,الحالة,تاريخ الاشتراك",
      ...subscribers.map(s => `${s.name || ""},${s.email},${s.source || ""},${s.status},${new Date(s.createdAt).toLocaleDateString("ar-SA")}`),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "newsletter-subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Mail className="text-orange-500" size={24} />
            مشتركو النشرة البريدية
          </h1>
          <p className="text-slate-500 text-sm mt-1">إدارة قائمة المشتركين في النشرة البريدية</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download size={16} />
          تصدير CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Users size={18} className="text-[#ff6a00]" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{subscribers.length}</p>
              <p className="text-xs text-slate-500">إجمالي المشتركين</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <UserCheck size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{active}</p>
              <p className="text-xs text-slate-500">مشتركون نشطون</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <UserX size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{unsubscribed}</p>
              <p className="text-xs text-slate-500">ألغوا الاشتراك</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد الإلكتروني..."
          data-testid="input-search-newsletter"
          className="w-full max-w-sm px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Mail size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">
                {subscribers.length === 0 ? "لا يوجد مشتركون بعد" : "لا توجد نتائج للبحث"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-right px-5 py-3.5 text-xs font-700 text-slate-500 uppercase tracking-wide">البريد الإلكتروني</th>
                    <th className="text-right px-5 py-3.5 text-xs font-700 text-slate-500 uppercase tracking-wide">الاسم</th>
                    <th className="text-right px-5 py-3.5 text-xs font-700 text-slate-500 uppercase tracking-wide">المصدر</th>
                    <th className="text-right px-5 py-3.5 text-xs font-700 text-slate-500 uppercase tracking-wide">الحالة</th>
                    <th className="text-right px-5 py-3.5 text-xs font-700 text-slate-500 uppercase tracking-wide">تاريخ الاشتراك</th>
                    <th className="text-right px-5 py-3.5 text-xs font-700 text-slate-500 uppercase tracking-wide">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(sub => (
                    <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800 text-sm">{sub.email}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-sm">{sub.name || "—"}</td>
                      <td className="px-5 py-3.5 text-sm">
                        <Badge variant="outline" className="text-xs">{sub.source || "website"}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={`text-xs ${sub.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {sub.status === "active" ? "نشط" : "ملغى"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-sm">{new Date(sub.createdAt).toLocaleDateString("ar-SA")}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => toggleMut.mutate({ id: sub.id, status: sub.status === "active" ? "unsubscribed" : "active" })}
                            className="h-7 px-2 text-xs"
                            data-testid={`btn-toggle-${sub.id}`}
                          >
                            {sub.status === "active" ? "إلغاء" : "تفعيل"}
                          </Button>
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => { if (confirm("حذف هذا المشترك؟")) deleteMut.mutate(sub.id); }}
                            className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            data-testid={`btn-delete-${sub.id}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
