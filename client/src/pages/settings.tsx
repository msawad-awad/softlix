import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings as SettingsIcon, User, Globe, Palette, Bell, Shield, CreditCard, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { useTheme } from "@/lib/theme-provider";
import { useLanguage } from "@/lib/language-provider";
import { useAuth } from "@/lib/auth-context";
import { getSoundAlertsEnabled, setSoundAlertsEnabled, playTestSound, unlockAudio } from "@/hooks/use-notification-sound";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(getSoundAlertsEnabled());

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("settings.title")}
        description={t("softlix.tagline")}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("settings.profile")}
              </CardTitle>
              <CardDescription>
                Manage your profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("form.name")}</Label>
                  <div className="p-3 rounded-md bg-muted text-sm">
                    {user?.name || "—"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("form.email")}</Label>
                  <div className="p-3 rounded-md bg-muted text-sm">
                    {user?.email || "—"}
                  </div>
                </div>
              </div>
              <Button variant="outline" data-testid="button-edit-profile">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("settings.language")}
              </CardTitle>
              <CardDescription>
                Choose your preferred language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={(val) => setLanguage(val as "ar" | "en")}>
                <SelectTrigger className="w-full max-w-xs" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t("settings.theme")}
              </CardTitle>
              <CardDescription>
                Customize the appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={theme} onValueChange={(val) => setTheme(val as "light" | "dark" | "system")}>
                <SelectTrigger className="w-full max-w-xs" data-testid="select-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("settings.light")}</SelectItem>
                  <SelectItem value="dark">{t("settings.dark")}</SelectItem>
                  <SelectItem value="system">{t("settings.system")}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("settings.notifications")}
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your account
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-email-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-push-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    التنبيهات الصوتية
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    تشغيل صوت تنبيه عند وصول زائر جديد أو عميل محتمل
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={(checked) => {
                    setSoundEnabled(checked);
                    setSoundAlertsEnabled(checked);
                    if (checked) {
                      unlockAudio();
                      setTimeout(() => playTestSound(), 100);
                      toast({ title: "✅ تم تفعيل التنبيهات الصوتية", description: "ستسمع صوت تنبيه عند وصول زائر أو عميل محتمل جديد", duration: 3000 });
                    } else {
                      toast({ title: "🔇 تم إيقاف التنبيهات الصوتية", duration: 2000 });
                    }
                  }}
                  data-testid="switch-sound-alerts"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t("settings.billing")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t("subscription.plan")}</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {user?.subscription?.status === "trial" ? t("subscription.trial") : t("subscription.active")}
                  </span>
                </div>
                <p className="text-2xl font-bold">{user?.subscription?.planName || "Trial"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.subscription?.trialEnd 
                    ? `${t("subscription.expiresOn")}: ${new Date(user.subscription.trialEnd).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              <Button className="w-full" data-testid="button-upgrade-plan">
                {t("subscription.upgrade")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("settings.security")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" data-testid="button-change-password">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-two-factor">
                Enable Two-Factor Auth
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive" data-testid="button-delete-account">
                Delete Account
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                {t("settings.integrations")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-semibold">
                    SG
                  </div>
                  <span className="text-sm font-medium">SendGrid</span>
                </div>
                <span className="text-xs text-muted-foreground">Not connected</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-green-500/10 text-green-500 flex items-center justify-center text-xs font-semibold">
                    WA
                  </div>
                  <span className="text-sm font-medium">WhatsApp</span>
                </div>
                <span className="text-xs text-muted-foreground">Not connected</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
