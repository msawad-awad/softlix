import { useTranslation } from "react-i18next";
import { Users, Plus, Mail, Phone, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  department: string;
  status: "active" | "on-leave" | "inactive";
}

export default function HR() {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "محمد علي",
      position: "مدير المبيعات",
      email: "mohammad@example.com",
      phone: "+966501234567",
      department: "المبيعات",
      status: "active",
    },
    {
      id: "2",
      name: "فاطمة أحمد",
      position: "محلل الأنظمة",
      email: "fatima@example.com",
      phone: "+966509876543",
      department: "تكنولوجيا المعلومات",
      status: "active",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "on-leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={t("nav.hr")} description="إدارة الموارد البشرية والموظفين" />
        <Button data-testid="button-add-employee">
          <Plus className="h-4 w-4 mr-2" />
          {t("form.create")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{employees.length}</div>
              <p className="text-sm text-muted-foreground mt-1">إجمالي الموظفين</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {employees.filter((e) => e.status === "active").length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">نشطين</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {new Set(employees.map((e) => e.department)).size}
              </div>
              <p className="text-sm text-muted-foreground mt-1">أقسام</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            الموظفين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Avatar>
                    <AvatarFallback>
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {employee.position}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {employee.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{employee.department}</Badge>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status === "active"
                        ? "نشط"
                        : employee.status === "on-leave"
                          ? "إجازة"
                          : "غير نشط"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">{t("common.noData")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
