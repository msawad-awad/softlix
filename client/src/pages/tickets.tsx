import { useTranslation } from "react-i18next";
import { AlertCircle, Plus, MessageSquare, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { useState } from "react";

interface Ticket {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in-progress" | "closed";
  createdAt: string;
  messages: number;
}

export default function Tickets() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "1",
      title: "مشكلة في تسجيل الدخول",
      priority: "high",
      status: "open",
      createdAt: "2026-02-28",
      messages: 3,
    },
    {
      id: "2",
      title: "طلب ميزة جديدة",
      priority: "low",
      status: "in-progress",
      createdAt: "2026-02-25",
      messages: 1,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={t("nav.tickets")} description="إدارة التذاكر والدعم" />
        <Button data-testid="button-add-ticket">
          <Plus className="h-4 w-4 mr-2" />
          {t("form.create")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{tickets.length}</div>
              <p className="text-sm text-muted-foreground mt-1">إجمالي التذاكر</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {tickets.filter((t) => t.status === "open").length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">مفتوحة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {tickets.filter((t) => t.status === "closed").length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">مغلقة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("nav.tickets")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{ticket.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{ticket.messages}</span>
                  </div>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority === "high"
                      ? "عالي"
                      : ticket.priority === "medium"
                        ? "متوسط"
                        : "منخفض"}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status === "open"
                      ? "مفتوحة"
                      : ticket.status === "in-progress"
                        ? "قيد المعالجة"
                        : "مغلقة"}
                  </Badge>
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
