import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Inbox, Phone, Mail, Calendar, MessageSquare, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { FormLead } from "@shared/schema";

const STATUS_CONFIG = {
  new: { label: "جديد", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300", icon: Clock },
  contacted: { label: "تم التواصل", color: "bg-orange-100 dark:bg-orange-900/30 text-[#ff6a00] dark:text-[#ff6a00]", icon: CheckCircle2 },
  converted: { label: "تحوّل لعميل", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", icon: CheckCircle2 },
  closed: { label: "مغلق", color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400", icon: XCircle },
};

export default function WebsiteLeads() {
  const { toast } = useToast();
  const { data: leads = [], isLoading } = useQuery<FormLead[]>({ queryKey: ["/api/cms/leads"] });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiRequest("PATCH", `/api/cms/leads/${id}`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/leads"] }); toast({ title: "تم تحديث الحالة" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cms/leads/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/leads"] }); toast({ title: "تم الحذف" }); },
  });

  const stats = {
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    converted: leads.filter(l => l.status === "converted").length,
    total: leads.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">العملاء المحتملون</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">طلبات التواصل الواردة من الموقع</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات", value: stats.total, color: "blue" },
          { label: "جديد", value: stats.new, color: "orange" },
          { label: "تم التواصل", value: stats.contacted, color: "blue" },
          { label: "تحوّل لعميل", value: stats.converted, color: "green" },
        ].map((s, i) => (
          <Card key={i} data-testid={`lead-stat-${i}`}>
            <CardContent className="pt-5 pb-5 text-center">
              <div className={`text-3xl font-black text-${s.color}-600 dark:text-${s.color}-400 mb-1`}>{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads List */}
      {isLoading ? (
        <div className="grid gap-4">{[1,2,3].map(i=><div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"/>)}</div>
      ) : leads.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"/><p className="text-gray-500">لا توجد طلبات تواصل بعد</p></CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {leads.map(lead => {
            const statusConf = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new;
            return (
              <Card key={lead.id} data-testid={`lead-card-${lead.id}`}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 font-bold text-[#ff6a00] dark:text-[#ff6a00]">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white">{lead.name}</span>
                        <Badge className={`text-xs border-0 ${statusConf.color}`}>{statusConf.label}</Badge>
                        {lead.budget && <Badge className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">{lead.budget}</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/>{lead.phone}</span>}
                        {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/>{lead.email}</span>}
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{new Date(lead.createdAt).toLocaleDateString("ar-SA")}</span>
                        {lead.pageSource && <span className="text-[#ff6a00]">{lead.pageSource}</span>}
                      </div>
                      {lead.message && <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 flex items-start gap-2"><MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400"/><span className="line-clamp-2">{lead.message}</span></p>}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Select value={lead.status} onValueChange={v=>updateMut.mutate({id:lead.id,status:v})}>
                        <SelectTrigger className="h-8 text-xs w-36" data-testid={`select-lead-status-${lead.id}`}><SelectValue/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">جديد</SelectItem>
                          <SelectItem value="contacted">تم التواصل</SelectItem>
                          <SelectItem value="converted">تحوّل لعميل</SelectItem>
                          <SelectItem value="closed">مغلق</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-700" onClick={()=>{if(confirm("حذف هذا الطلب؟"))deleteMut.mutate(lead.id)}} data-testid={`btn-delete-lead-${lead.id}`}>حذف</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
