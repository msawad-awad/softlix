import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Save, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import type { Company, InsertCompany } from "@shared/schema";

const companyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["lead", "prospect", "client", "archived"]).default("lead"),
  notes: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export default function CompanyForm() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id && params.id !== "new";

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      country: "",
      industry: "",
      source: "",
      status: "lead",
      notes: "",
    },
  });

  const { data: company, isLoading: isLoadingCompany } = useQuery<Company>({
    queryKey: ["/api/companies", params.id],
    enabled: isEdit,
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country || "",
        industry: company.industry || "",
        source: company.source || "",
        status: company.status as "lead" | "prospect" | "client" | "archived",
        notes: company.notes || "",
      });
    }
  }, [company, form]);

  const createMutation = useMutation({
    mutationFn: async (data: CompanyFormValues) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: t("common.success"),
        description: t("crm.addCompany") + " " + t("common.success").toLowerCase(),
      });
      setLocation("/companies");
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
    mutationFn: async (data: CompanyFormValues) => {
      const response = await apiRequest("PATCH", `/api/companies/${params.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", params.id] });
      toast({
        title: t("common.success"),
        description: t("crm.editCompany") + " " + t("common.success").toLowerCase(),
      });
      setLocation("/companies");
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyFormValues) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingCompany) {
    return <LoadingPage message={t("common.loading")} />;
  }

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? t("crm.editCompany") : t("crm.addCompany")}
      >
        <Link href="/companies">
          <Button variant="ghost" data-testid="button-back">
            <BackArrow className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
            {t("crm.companies")}
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("form.companyName")}
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
                        <Input {...field} data-testid="input-company-name" />
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
                        <Input type="email" {...field} data-testid="input-company-email" />
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
                        <Input type="tel" dir="ltr" {...field} data-testid="input-company-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.website")}</FormLabel>
                      <FormControl>
                        <Input type="url" dir="ltr" {...field} data-testid="input-company-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.industry")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company-industry" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.source")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company-source" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.status")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lead">{t("crm.status.lead")}</SelectItem>
                          <SelectItem value="prospect">{t("crm.status.prospect")}</SelectItem>
                          <SelectItem value="client">{t("crm.status.client")}</SelectItem>
                          <SelectItem value="archived">{t("crm.status.archived")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.address")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.city")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.country")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company-country" />
                      </FormControl>
                      <FormMessage />
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
                        data-testid="input-company-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isPending} data-testid="button-save-company">
                  {isPending ? (
                    <LoadingSpinner size="sm" className={isRTL ? "ml-2" : "mr-2"} />
                  ) : (
                    <Save className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                  )}
                  {t("form.save")}
                </Button>
                <Link href="/companies">
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
