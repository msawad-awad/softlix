import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Calendar, Phone, Mail, Clock, CheckCircle, XCircle, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Booking } from "@shared/schema";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار", confirmed: "مؤكد", cancelled: "ملغي",
};

export default function WebsiteBookings() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/cms/bookings"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/cms/bookings/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/bookings"] });
      toast({ title: "تم التحديث" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/bookings"] });
      toast({ title: "تم الحذف" });
    },
  });

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">طلبات الاستشارة</h1>
          <p className="text-gray-500 mt-1">إدارة حجوزات الاستشارات القادمة من الموقع</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-orange-500" size={20} />
          <span className="text-lg font-black text-gray-700 dark:text-gray-200">{bookings.length} طلب</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "confirmed", "cancelled"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${filter === s ? "bg-orange-500 text-white border-orange-500" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-300"}`}>
            {s === "all" ? "الكل" : STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-500">لا توجد حجوزات</h3>
          <p className="text-gray-400 text-sm mt-2">ستظهر طلبات الاستشارة هنا عند ورودها من الموقع</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(b => (
            <div key={b.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Left: avatar + basic info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {b.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-black text-gray-900 dark:text-white text-base">{b.name}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[b.status]}`}>
                        {STATUS_LABELS[b.status]}
                      </span>
                      {b.serviceType && (
                        <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                          {b.serviceType}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5"><Phone size={13} />{b.phone}</span>
                      {b.email && <span className="flex items-center gap-1.5"><Mail size={13} />{b.email}</span>}
                      {b.preferredDate && <span className="flex items-center gap-1.5"><Calendar size={13} />{b.preferredDate}</span>}
                      {b.preferredTime && <span className="flex items-center gap-1.5"><Clock size={13} />{b.preferredTime}</span>}
                    </div>
                    {b.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 line-clamp-2">
                        {b.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex sm:flex-col gap-2 flex-wrap sm:flex-nowrap">
                  {b.status !== "confirmed" && (
                    <Button size="sm" variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 gap-1.5 text-xs"
                      onClick={() => updateMutation.mutate({ id: b.id, status: "confirmed" })}>
                      <CheckCircle size={13} /> تأكيد
                    </Button>
                  )}
                  {b.status !== "cancelled" && (
                    <Button size="sm" variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 gap-1.5 text-xs"
                      onClick={() => updateMutation.mutate({ id: b.id, status: "cancelled" })}>
                      <XCircle size={13} /> إلغاء
                    </Button>
                  )}
                  <a href={`tel:${b.phone}`}>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 text-xs w-full">
                      <Phone size={13} /> اتصال
                    </Button>
                  </a>
                  <Button size="sm" variant="ghost"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => { if (confirm("هل تريد حذف هذا الحجز؟")) deleteMutation.mutate(b.id); }}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
