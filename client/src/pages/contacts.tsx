import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { Contact } from "@shared/schema";

export default function Contacts() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: t("common.success"),
        description: t("crm.deleteContact") + " " + t("common.success").toLowerCase(),
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

  const filteredContacts = contacts?.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone?.includes(searchQuery)
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return <LoadingPage message={t("common.loading")} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("crm.contacts")}
        description={`${contacts?.length || 0} ${t("crm.contacts").toLowerCase()}`}
      >
        <Link href="/contacts/new">
          <Button data-testid="button-add-contact">
            <Plus className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            {t("crm.addContact")}
          </Button>
        </Link>
      </PageHeader>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
          <Input
            placeholder={t("crm.searchContacts")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? "pr-9" : "pl-9"}
            data-testid="input-search-contacts"
          />
        </div>
      </div>

      {filteredContacts && filteredContacts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover-elevate transition-smooth" data-testid={`card-contact-${contact.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{contact.name}</h3>
                        {contact.isPrimary && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                      </div>
                      {contact.position && (
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.position}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-contact-menu-${contact.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? "start" : "end"}>
                      <Link href={`/contacts/${contact.id}`}>
                        <DropdownMenuItem data-testid={`button-view-contact-${contact.id}`}>
                          <ExternalLink className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t("common.view")}
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/contacts/${contact.id}/edit`}>
                        <DropdownMenuItem data-testid={`button-edit-contact-${contact.id}`}>
                          <Pencil className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {t("form.edit")}
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(contact.id)}
                        data-testid={`button-delete-contact-${contact.id}`}
                      >
                        <Trash2 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("form.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span dir="ltr">{contact.phone}</span>
                    </div>
                  )}
                  {contact.companyId && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">Company linked</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={t("crm.noContacts")}
          description={searchQuery ? t("common.tryAgain") : undefined}
        >
          {!searchQuery && (
            <Link href="/contacts/new">
              <Button data-testid="button-add-contact-empty">
                <Plus className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                {t("crm.addContact")}
              </Button>
            </Link>
          )}
        </EmptyState>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("crm.deleteContact")}</AlertDialogTitle>
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
