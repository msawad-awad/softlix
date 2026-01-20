import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Save, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { LoadingPage, LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-provider";
import type { Contact, Company } from "@shared/schema";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyId: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id && params.id !== "new";

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position: "",
      companyId: "",
      isPrimary: false,
      notes: "",
    },
  });

  const { data: contact, isLoading: isLoadingContact } = useQuery<Contact>({
    queryKey: ["/api/contacts", params.id],
    enabled: isEdit,
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        name: contact.name,
        email: contact.email || "",
        phone: contact.phone || "",
        position: contact.position || "",
        companyId: contact.companyId || "",
        isPrimary: contact.isPrimary || false,
        notes: contact.notes || "",
      });
    }
  }, [contact, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: t("common.success"),
        description: t("crm.addContact") + " " + t("common.success").toLowerCase(),
      });
      setLocation("/contacts");
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const response = await apiRequest("PATCH", `/api/contacts/${params.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", params.id] });
      toast({
        title: t("common.success"),
        description: t("crm.editContact") + " " + t("common.success").toLowerCase(),
      });
      setLocation("/contacts");
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingContact) {
    return <LoadingPage message={t("common.loading")} />;
  }

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? t("crm.editContact") : t("crm.addContact")}
      >
        <Link href="/contacts">
          <Button variant="ghost" data-testid="button-back">
            <BackArrow className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            {t("crm.contacts")}
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("crm.contacts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.name")} *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-contact-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.email")}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.phone")}</FormLabel>
                      <FormControl>
                        <Input type="tel" dir="ltr" {...field} data-testid="input-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.position")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-contact-position" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.company")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-contact-company">
                            <SelectValue placeholder={t("form.company")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies?.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPrimary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-contact-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Primary Contact</FormLabel>
                        <FormDescription>
                          Mark as the primary contact for this company
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.notes")}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px] resize-none"
                        {...field}
                        data-testid="input-contact-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isPending} data-testid="button-save-contact">
                  {isPending ? (
                    <LoadingSpinner size="sm" className={isRTL ? "ml-2" : "mr-2"} />
                  ) : (
                    <Save className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                  )}
                  {t("form.save")}
                </Button>
                <Link href="/contacts">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    {t("form.cancel")}
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
