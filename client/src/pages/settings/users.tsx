import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserPlus, MoreHorizontal, Pencil, Trash2, KeyRound, ShieldCheck } from "lucide-react";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  permissions: string[];
  locale: string;
  createdAt: string;
  avatarUrl?: string | null;
}

const ROLES = [
  { value: "admin", label: "مدير عام", color: "bg-red-100 text-red-700" },
  { value: "manager", label: "مدير", color: "bg-orange-100 text-orange-700" },
  { value: "sales", label: "مبيعات", color: "bg-blue-100 text-blue-700" },
  { value: "support", label: "دعم فني", color: "bg-green-100 text-green-700" },
  { value: "accountant", label: "محاسب", color: "bg-purple-100 text-purple-700" },
  { value: "user", label: "مستخدم", color: "bg-gray-100 text-gray-700" },
];

const ALL_PERMISSIONS = [
  { key: "dashboard", label: "لوحة التحكم" },
  { key: "crm", label: "CRM" },
  { key: "proposals", label: "عروض الأسعار" },
  { key: "website", label: "الموقع الإلكتروني" },
  { key: "marketing", label: "التسويق" },
  { key: "settings", label: "الإعدادات" },
  { key: "team", label: "إدارة الفريق" },
  { key: "google_import", label: "استيراد جوجل" },
];

const DEFAULT_PERMISSIONS_BY_ROLE: Record<string, string[]> = {
  admin: ALL_PERMISSIONS.map(p => p.key),
  manager: ALL_PERMISSIONS.map(p => p.key),
  sales: ["dashboard", "crm", "proposals", "google_import"],
  support: ["dashboard", "crm"],
  accountant: ["dashboard", "proposals"],
  user: ["dashboard"],
};

function getRoleLabel(role: string) {
  return ROLES.find(r => r.value === role)?.label ?? role;
}

function getRoleColor(role: string) {
  return ROLES.find(r => r.value === role)?.color ?? "bg-gray-100 text-gray-700";
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

interface UserFormState {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  permissions: string[];
}

const emptyForm: UserFormState = {
  name: "",
  email: "",
  phone: "",
  role: "sales",
  password: "",
  permissions: DEFAULT_PERMISSIONS_BY_ROLE.sales,
};

export default function TeamUsersPage() {
  const { user: me } = useAuth();
  const { toast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<TeamUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<TeamUser | null>(null);
  const [resetUser, setResetUser] = useState<TeamUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const { data: users = [], isLoading } = useQuery<TeamUser[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormState) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setAddOpen(false);
      setForm(emptyForm);
      toast({ title: "تم إضافة المستخدم بنجاح" });
    },
    onError: async (err: any) => {
      const body = await err.response?.json?.();
      toast({ title: "خطأ", description: body?.error ?? "فشل الحفظ", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest("PATCH", `/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditUser(null);
      toast({ title: "تم تحديث بيانات المستخدم" });
    },
    onError: async (err: any) => {
      const body = await err.response?.json?.();
      toast({ title: "خطأ", description: body?.error ?? "فشل التحديث", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/users/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDeleteUser(null);
      toast({ title: "تم حذف المستخدم" });
    },
    onError: async (err: any) => {
      const body = await err.response?.json?.();
      toast({ title: "خطأ", description: body?.error ?? "فشل الحذف", variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      apiRequest("PATCH", `/api/users/${id}`, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setResetUser(null);
      setNewPassword("");
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
    },
  });

  const openEdit = (u: TeamUser) => {
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      role: u.role,
      password: "",
      permissions: u.permissions ?? DEFAULT_PERMISSIONS_BY_ROLE[u.role] ?? ["dashboard"],
    });
    setEditUser(u);
  };

  const handleRoleChange = (role: string) => {
    setForm(f => ({
      ...f,
      role,
      permissions: DEFAULT_PERMISSIONS_BY_ROLE[role] ?? ["dashboard"],
    }));
  };

  const togglePermission = (key: string) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key],
    }));
  };

  const isAdmin = me?.role === "admin" || me?.role === "manager";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة الفريق</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة أعضاء الفريق وصلاحياتهم
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => { setForm(emptyForm); setAddOpen(true); }}
            data-testid="button-add-user"
          >
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة مستخدم
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          جارٍ التحميل...
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الصلاحيات</TableHead>
                <TableHead>الحالة</TableHead>
                {isAdmin && <TableHead className="w-10"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                        {u.id === me?.id && (
                          <Badge variant="outline" className="text-[10px] mt-0.5">أنت</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(u.permissions ?? []).slice(0, 4).map(p => (
                        <Badge key={p} variant="secondary" className="text-[10px]">
                          {ALL_PERMISSIONS.find(x => x.key === p)?.label ?? p}
                        </Badge>
                      ))}
                      {(u.permissions ?? []).length > 4 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{(u.permissions ?? []).length - 4}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "default" : "secondary"} className="text-[10px]">
                      {u.status === "active" ? "نشط" : "موقوف"}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`menu-user-${u.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(u)}>
                            <Pencil className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setResetUser(u); setNewPassword(""); }}>
                            <KeyRound className="h-4 w-4 ml-2" />
                            تغيير كلمة المرور
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMutation.mutate({
                            id: u.id,
                            data: { status: u.status === "active" ? "inactive" : "active" },
                          })}>
                            <ShieldCheck className="h-4 w-4 ml-2" />
                            {u.status === "active" ? "إيقاف الحساب" : "تفعيل الحساب"}
                          </DropdownMenuItem>
                          {u.id !== me?.id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteUser(u)}
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-10 text-muted-foreground">
                    لا يوجد أعضاء في الفريق بعد
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={addOpen || !!editUser} onOpenChange={(o) => { if (!o) { setAddOpen(false); setEditUser(null); } }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="u-name">الاسم *</Label>
                <Input
                  id="u-name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="أحمد محمد"
                  data-testid="input-user-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-phone">رقم الهاتف</Label>
                <Input
                  id="u-phone"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+966..."
                  data-testid="input-user-phone"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-email">البريد الإلكتروني *</Label>
              <Input
                id="u-email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="ahmed@company.com"
                data-testid="input-user-email"
              />
            </div>
            {!editUser && (
              <div className="space-y-1.5">
                <Label htmlFor="u-password">كلمة المرور *</Label>
                <Input
                  id="u-password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="كلمة مرور قوية..."
                  data-testid="input-user-password"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>الدور</Label>
              <Select value={form.role} onValueChange={handleRoleChange}>
                <SelectTrigger data-testid="select-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الصلاحيات</Label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border bg-muted/30">
                {ALL_PERMISSIONS.map(p => (
                  <div key={p.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`perm-${p.key}`}
                      checked={form.permissions.includes(p.key)}
                      onCheckedChange={() => togglePermission(p.key)}
                      data-testid={`checkbox-perm-${p.key}`}
                    />
                    <label htmlFor={`perm-${p.key}`} className="text-sm cursor-pointer">
                      {p.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditUser(null); }}>
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (!form.name || !form.email || (!editUser && !form.password)) {
                  toast({ title: "يرجى تعبئة الحقول المطلوبة", variant: "destructive" });
                  return;
                }
                if (editUser) {
                  updateMutation.mutate({ id: editUser.id, data: { name: form.name, email: form.email, phone: form.phone || undefined, role: form.role, permissions: form.permissions } });
                } else {
                  createMutation.mutate(form);
                }
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-user"
            >
              {createMutation.isPending || updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUser} onOpenChange={(o) => { if (!o) { setResetUser(null); setNewPassword(""); } }}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            تغيير كلمة مرور: <strong>{resetUser?.name}</strong>
          </p>
          <div className="space-y-1.5 py-2">
            <Label>كلمة المرور الجديدة</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="كلمة مرور قوية..."
              data-testid="input-new-password"
            />
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setResetUser(null); setNewPassword(""); }}>
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (!newPassword || newPassword.length < 6) {
                  toast({ title: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
                  return;
                }
                resetPasswordMutation.mutate({ id: resetUser!.id, password: newPassword });
              }}
              disabled={resetPasswordMutation.isPending}
              data-testid="button-confirm-reset-password"
            >
              تغيير كلمة المرور
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteUser} onOpenChange={(o) => { if (!o) setDeleteUser(null); }}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف <strong>{deleteUser?.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-end">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-user"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
