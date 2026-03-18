import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { LoadingPage } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-provider";
import type { Company } from "@shared/schema";

const statusColors: Record<string, string> = {
  lead: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  prospect: "bg-orange-500/10 text-[#ff6a00] dark:text-[#ff6a00]",
  client: "bg-green-500/10 text-green-600 dark:text-green-400",
  archived: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export default function Companies() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: t("common.success"),
        description: t("crm.deleteCompany") + " " + t("common.success").toLowerCase(),
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const filteredCompanies = companies?.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.phone?.includes(searchQuery)
  );

  if (isLoading) {
    return <LoadingPage message={t("common.loading")} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("crm.companies")}
        description={`${companies?.length || 0} ${t("crm.companies").toLowerCase()}`}
      >
        <Link href="/companies/new">
          <Button data-testid="button-add-company">
            <Plus className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            {t("crm.addCompany")}
          </Button>
        </Link>
      </PageHeader>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
          <Input
            placeholder={t("crm.searchCompanies")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? "pr-9" : "pl-9"}
            data-testid="input-search-companies"
          />
        </div>
      </div>

      {filteredCompanies && filteredCompanies.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover-elevate transition-smooth" data-testid={`card-company-${company.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{company.name}</h3>
                      {company.industry && (
                        <p className="text-xs text-muted-foreground truncate">
                          {company.industry}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-company-menu-${company.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? "start" : "end"}>
                      <Link href={`/companies/${company.id}`}>
                        <DropdownMenuItem data-testid={`button-view-company-${company.id}`}>
                          <ExternalLink className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t("common.view")}
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/companies/${company.id}/edit`}>
                        <DropdownMenuItem data-testid={`button-edit-company-${company.id}`}>
                          <Pencil className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t("form.edit")}
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(company.id)}
                        data-testid={`button-delete-company-${company.id}`}
                      >
                        <Trash2 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("form.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  {company.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span dir="ltr">{company.phone}</span>
                    </div>
                  )}
                  {(company.city || company.country) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {[company.city, company.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                <Badge className={statusColors[company.status] || statusColors.lead}>
                  {t(`crm.status.${company.status}`)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title={t("crm.noCompanies")}
          description={searchQuery ? t("common.tryAgain") : undefined}
        >
          {!searchQuery && (
            <Link href="/companies/new">
              <Button data-testid="button-add-company-empty">
                <Plus className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                {t("crm.addCompany")}
              </Button>
            </Link>
          )}
        </EmptyState>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("crm.deleteCompany")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.confirm")}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {t("form.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
