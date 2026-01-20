import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { AlertCircle, Home, ArrowLeft, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">404</h1>
            <p className="text-muted-foreground mb-6">
              Page not found
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button data-testid="button-go-dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  {t("nav.dashboard")}
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.history.back()} data-testid="button-go-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t("softlix.fullName")}. All rights reserved.
      </footer>
    </div>
  );
}
