import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2, Circle, Plus, Trash2, Calendar, Flag, Filter,
  User, AlertCircle, Clock, Search, Tag, Edit2
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
import type { CrmTask } from "@shared/schema";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  low:    { label: "منخفض", color: "bg-green-100 text-green-700 border-green-200", icon: "🟢" },
  medium: { label: "متوسط", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "🟡" },
  high:   { label: "عالي",  color: "bg-orange-100 text-orange-700 border-orange-200", icon: "🟠" },
  urgent: { label: "عاجل", color: "bg-red-100 text-red-700 border-red-200", icon: "🔴" },
};
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: "قيد الانتظار", color: "bg-gray-100 text-gray-600" },
  in_progress:{ label: "جاري",       color: "bg-orange-100 text-orange-700" },
  completed:  { label: "مكتمل",      color: "bg-green-100 text-green-700" },
  cancelled:  { label: "ملغي",       color: "bg-red-100 text-red-700" },
};
const TYPE_LABELS: Record<string, string> = {
  task: "مهمة", call: "مكالمة", whatsapp: "واتساب", email: "بريد", meeting: "اجتماع",
  reminder: "تذكير", internal: "داخلي",
};

type FilterStatus = "all" | "pending" | "in_progress" | "completed" | "cancelled";

interface TaskForm {
  title: string;
  type: string;
  priority: string;
  dueDate: string;
  description: string;
}

export default function Tasks() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<CrmTask | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TaskForm>({
    defaultValues: { title: "", type: "task", priority: "medium", dueDate: "", description: "" }
  });

  const { data: allTasks = [], isLoading } = useQuery<CrmTask[]>({ queryKey: ["/api/crm/tasks"] });

  const tasks = filterStatus !== "all"
    ? allTasks.filter(t => t.status === filterStatus)
    : allTasks;

  const createMutation = useMutation({
    mutationFn: (data: TaskForm) => apiRequest("POST", "/api/crm/tasks", {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tasks"] });
      setShowDialog(false); reset();
      toast({ title: "تمت إضافة المهمة" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskForm & { status: string }> }) =>
      apiRequest("PATCH", `/api/crm/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tasks"] });
      setShowDialog(false); setEditingTask(null); reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/tasks"] });
      toast({ title: "تم حذف المهمة" });
    },
  });

  const toggleComplete = (task: CrmTask) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    updateMutation.mutate({ id: task.id, data: { status: newStatus } });
  };

  const openEdit = (task: CrmTask) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("type", task.type || "task");
    setValue("priority", task.priority || "medium");
    setValue("dueDate", task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
    setValue("description", task.description || "");
    setShowDialog(true);
  };

  const onSubmit = (data: TaskForm) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = tasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === "pending").length,
    inProgress: allTasks.filter(t => t.status === "in_progress").length,
    completed: allTasks.filter(t => t.status === "completed").length,
  };

  const isOverdue = (task: CrmTask) =>
    task.dueDate && task.status !== "completed" && new Date(task.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="المهام" description="إدارة وتتبع المهام والنشاطات" />
        <Button
          onClick={() => { setEditingTask(null); reset(); setShowDialog(true); }}
          className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
          data-testid="button-add-task"
        >
          <Plus className="h-4 w-4 ml-2" />
          مهمة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "الكل", value: stats.total, color: "text-gray-700", bg: "bg-gray-50" },
          { label: "قيد الانتظار", value: stats.pending, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "جاري", value: stats.inProgress, color: "text-[#ff6a00]", bg: "bg-orange-50" },
          { label: "مكتملة", value: stats.completed, color: "text-green-700", bg: "bg-green-50" },
        ].map((s) => (
          <Card key={s.label} className={`border-0 ${s.bg}`}>
            <CardContent className="pt-5 pb-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في المهام..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            data-testid="input-search-tasks"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "in_progress", "completed", "cancelled"] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                filterStatus === s
                  ? "bg-[#ff6a00] text-white border-[#ff6a00]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
              }`}
              data-testid={`filter-${s}`}
            >
              {s === "all" ? "الكل" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-[#ff6a00]" />
            المهام ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا توجد مهام</p>
              <Button
                variant="link"
                className="text-[#ff6a00] mt-1"
                onClick={() => { setEditingTask(null); reset(); setShowDialog(true); }}
              >
                أضف مهمة جديدة
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-sm ${
                    task.status === "completed" ? "opacity-60 bg-gray-50" : "bg-white"
                  } ${isOverdue(task) ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}
                  data-testid={`task-item-${task.id}`}
                >
                  <button
                    onClick={() => toggleComplete(task)}
                    className="flex-shrink-0 mt-0.5"
                    data-testid={`button-toggle-task-${task.id}`}
                  >
                    {task.status === "completed"
                      ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                      : <Circle className="h-5 w-5 text-muted-foreground hover:text-[#ff6a00] transition-colors" />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => openEdit(task)}
                          className="text-muted-foreground hover:text-[#ff6a00] transition-colors"
                          data-testid={`button-edit-task-${task.id}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(task.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                          data-testid={`button-delete-task-${task.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs px-2 py-0.5 h-auto">
                        {TYPE_LABELS[task.type] || task.type}
                      </Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_CONFIG[task.priority]?.color}`}>
                        {PRIORITY_CONFIG[task.priority]?.icon} {PRIORITY_CONFIG[task.priority]?.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[task.status]?.color}`}>
                        {STATUS_CONFIG[task.status]?.label}
                      </span>
                      {task.dueDate && (
                        <span className={`text-xs flex items-center gap-1 ${isOverdue(task) ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString("ar-SA")}
                          {isOverdue(task) && " • متأخرة!"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(o) => { setShowDialog(o); if (!o) { setEditingTask(null); reset(); } }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#ff6a00]" />
              {editingTask ? "تعديل المهمة" : "مهمة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">العنوان *</label>
              <Input
                {...register("title", { required: true })}
                placeholder="عنوان المهمة"
                data-testid="input-task-title"
                className={errors.title ? "border-red-400" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">النوع</label>
                <Select defaultValue="task" onValueChange={(v) => setValue("type", v)}>
                  <SelectTrigger data-testid="select-task-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الأولوية</label>
                <Select defaultValue="medium" onValueChange={(v) => setValue("priority", v)}>
                  <SelectTrigger data-testid="select-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                      <SelectItem key={v} value={v}>{c.icon} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">تاريخ الاستحقاق</label>
              <Input
                type="date"
                {...register("dueDate")}
                data-testid="input-task-due-date"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف</label>
              <Textarea
                {...register("description")}
                placeholder="وصف اختياري..."
                rows={3}
                data-testid="input-task-description"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-[#ff6a00] hover:bg-[#ff8c00] text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-task"
              >
                {editingTask ? "حفظ التعديلات" : "إضافة المهمة"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setEditingTask(null); reset(); }}>
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
