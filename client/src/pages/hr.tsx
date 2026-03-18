import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Users, Plus, Mail, Phone, Briefcase, Trash2,
  Search, Building2, Edit2, Calendar, DollarSign, UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import type { Employee } from "@shared/schema";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:      { label: "نشط",       color: "bg-green-100 text-green-700" },
  on_leave:    { label: "إجازة",     color: "bg-yellow-100 text-yellow-700" },
  inactive:    { label: "غير نشط",   color: "bg-gray-100 text-gray-600" },
  terminated:  { label: "منتهي",     color: "bg-red-100 text-red-700" },
};

const DEPARTMENTS = ["البرمجة", "التصميم", "المبيعات", "التسويق", "الموارد البشرية", "المالية", "خدمة العملاء", "الإدارة", "تكنولوجيا المعلومات"];

interface EmployeeForm {
  name: string;
  nameEn: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  hireDate: string;
  salary: string;
  nationalId: string;
  notes: string;
}

export default function HR() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EmployeeForm>({
    defaultValues: { name: "", nameEn: "", email: "", phone: "", position: "", department: "", status: "active", hireDate: "", salary: "", nationalId: "", notes: "" },
  });

  const { data: allEmployees = [], isLoading } = useQuery<Employee[]>({ queryKey: ["/api/hr/employees"] });

  const createMutation = useMutation({
    mutationFn: (data: EmployeeForm) => apiRequest("POST", "/api/hr/employees", {
      ...data,
      hireDate: data.hireDate ? new Date(data.hireDate).toISOString() : null,
      salary: data.salary ? data.salary : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      setShowDialog(false); reset();
      toast({ title: "تمت إضافة الموظف" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeForm> }) =>
      apiRequest("PATCH", `/api/hr/employees/${id}`, {
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      setShowDialog(false); setEditingEmployee(null); reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/hr/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/employees"] });
      toast({ title: "تم حذف الموظف" });
    },
  });

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setValue("name", emp.name);
    setValue("nameEn", emp.nameEn || "");
    setValue("email", emp.email || "");
    setValue("phone", emp.phone || "");
    setValue("position", emp.position || "");
    setValue("department", emp.department || "");
    setValue("status", emp.status || "active");
    setValue("hireDate", emp.hireDate ? new Date(emp.hireDate).toISOString().split("T")[0] : "");
    setValue("salary", emp.salary?.toString() || "");
    setValue("nationalId", emp.nationalId || "");
    setValue("notes", emp.notes || "");
    setShowDialog(true);
  };

  const filtered = allEmployees.filter((e) => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    const matchDept = filterDept === "all" || e.department === filterDept;
    return matchSearch && matchStatus && matchDept;
  });

  const departments = [...new Set(allEmployees.map(e => e.department).filter(Boolean))];

  const stats = {
    total: allEmployees.length,
    active: allEmployees.filter(e => e.status === "active").length,
    onLeave: allEmployees.filter(e => e.status === "on_leave").length,
    depts: new Set(allEmployees.map(e => e.department).filter(Boolean)).size,
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2);

  const onSubmit = (data: EmployeeForm) => {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="الموارد البشرية" description="إدارة الموظفين والفرق" />
        <Button
          onClick={() => { setEditingEmployee(null); reset(); setShowDialog(true); }}
          className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
          data-testid="button-add-employee"
        >
          <Plus className="h-4 w-4 ml-2" />
          موظف جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الموظفين", value: stats.total,   color: "text-gray-700",   bg: "bg-gray-50" },
          { label: "نشطون",           value: stats.active,   color: "text-green-700",  bg: "bg-green-50" },
          { label: "إجازة",           value: stats.onLeave,  color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "الأقسام",         value: stats.depts,    color: "text-[#ff6a00]",  bg: "bg-orange-50" },
        ].map((s) => (
          <Card key={s.label} className={`border-0 ${s.bg}`}>
            <CardContent className="pt-5 pb-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
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
            placeholder="بحث عن موظف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            data-testid="input-search-employees"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36" data-testid="select-filter-status">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
              <SelectItem key={v} value={v}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-40" data-testid="select-filter-dept">
            <SelectValue placeholder="القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأقسام</SelectItem>
            {departments.map(d => (
              <SelectItem key={d!} value={d!}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-[#ff6a00]" />
            الموظفون ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا يوجد موظفون</p>
              <Button
                variant="link" className="text-[#ff6a00] mt-1"
                onClick={() => { setEditingEmployee(null); reset(); setShowDialog(true); }}
              >
                أضف موظفًا جديدًا
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm hover:border-orange-100 transition-all"
                  data-testid={`employee-item-${emp.id}`}
                >
                  <Avatar className="h-11 w-11 flex-shrink-0">
                    {emp.avatarUrl ? (
                      <img src={emp.avatarUrl} alt={emp.name} />
                    ) : (
                      <AvatarFallback className="bg-orange-100 text-[#ff6a00] font-bold text-sm">
                        {getInitials(emp.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{emp.name}</p>
                      {emp.nameEn && <span className="text-xs text-muted-foreground">({emp.nameEn})</span>}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Briefcase className="h-3 w-3" />
                      {emp.position || "—"}
                      {emp.department && <> · <Building2 className="h-3 w-3 mr-0.5" />{emp.department}</>}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {emp.email && (
                        <a href={`mailto:${emp.email}`} className="flex items-center gap-1 hover:text-[#ff6a00]" onClick={(e) => e.stopPropagation()}>
                          <Mail className="h-3 w-3" />{emp.email}
                        </a>
                      )}
                      {emp.phone && (
                        <a href={`tel:${emp.phone}`} className="flex items-center gap-1 hover:text-[#ff6a00]" onClick={(e) => e.stopPropagation()}>
                          <Phone className="h-3 w-3" />{emp.phone}
                        </a>
                      )}
                      {emp.hireDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(emp.hireDate).toLocaleDateString("ar-SA")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_CONFIG[emp.status]?.color}`}>
                      {STATUS_CONFIG[emp.status]?.label}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(emp)}
                        className="text-muted-foreground hover:text-[#ff6a00] transition-colors p-1"
                        data-testid={`button-edit-employee-${emp.id}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(emp.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        data-testid={`button-delete-employee-${emp.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(o) => { setShowDialog(o); if (!o) { setEditingEmployee(null); reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#ff6a00]" />
              {editingEmployee ? "تعديل بيانات الموظف" : "موظف جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الاسم بالعربية *</label>
                <Input
                  {...register("name", { required: true })}
                  placeholder="محمد أحمد"
                  data-testid="input-employee-name"
                  className={errors.name ? "border-red-400" : ""}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الاسم بالإنجليزية</label>
                <Input {...register("nameEn")} placeholder="Mohammad Ahmed" data-testid="input-employee-name-en" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label>
                <Input type="email" {...register("email")} placeholder="employee@company.com" data-testid="input-employee-email" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">رقم الهاتف</label>
                <Input {...register("phone")} placeholder="+966501234567" data-testid="input-employee-phone" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">المسمى الوظيفي</label>
                <Input {...register("position")} placeholder="مطور برمجيات" data-testid="input-employee-position" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">القسم</label>
                <Select defaultValue="" onValueChange={(v) => setValue("department", v)}>
                  <SelectTrigger data-testid="select-employee-dept">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الحالة</label>
                <Select defaultValue="active" onValueChange={(v) => setValue("status", v)}>
                  <SelectTrigger data-testid="select-employee-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                      <SelectItem key={v} value={v}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">تاريخ التوظيف</label>
                <Input type="date" {...register("hireDate")} data-testid="input-employee-hire-date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الراتب (ريال)</label>
                <Input type="number" {...register("salary")} placeholder="8000" data-testid="input-employee-salary" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">رقم الهوية</label>
                <Input {...register("nationalId")} placeholder="1234567890" data-testid="input-employee-national-id" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">ملاحظات</label>
              <Textarea {...register("notes")} placeholder="ملاحظات اختيارية..." rows={2} data-testid="input-employee-notes" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-employee"
              >
                {editingEmployee ? "حفظ التعديلات" : "إضافة الموظف"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setEditingEmployee(null); reset(); }}>
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
