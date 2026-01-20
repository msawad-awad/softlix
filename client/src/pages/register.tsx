import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Mail, Lock, Eye, EyeOff, User, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-provider";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(data);
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-semibold">{t("softlix.name")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Zap className="h-7 w-7" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t("auth.registerTitle")}</CardTitle>
            <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.name")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                          <Input
                            placeholder="John Doe"
                            className={isRTL ? "pr-10" : "pl-10"}
                            {...field}
                            data-testid="input-register-name"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.companyName")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                          <Input
                            placeholder="Acme Inc."
                            className={isRTL ? "pr-10" : "pl-10"}
                            {...field}
                            data-testid="input-register-company"
                          />
                        </div>
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
                        <div className="relative">
                          <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            className={isRTL ? "pr-10" : "pl-10"}
                            {...field}
                            data-testid="input-register-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={isRTL ? "pr-10 pl-10" : "pl-10 pr-10"}
                            {...field}
                            data-testid="input-register-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? "left-3" : "right-3"}`}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="text-xs text-muted-foreground">
                  {t("auth.termsAgree")}{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    {t("auth.termsLink")}
                  </Link>{" "}
                  {t("auth.and")}{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    {t("auth.privacyLink")}
                  </Link>
                </p>

                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
                  {isLoading && <LoadingSpinner size="sm" className={isRTL ? "ml-2" : "mr-2"} />}
                  {t("auth.register")}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {t("auth.hasAccount")}{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    {t("auth.login")}
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t("softlix.fullName")}. All rights reserved.
      </footer>
    </div>
  );
}
