import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Video, Webhook, CheckCircle, XCircle, Loader2, ExternalLink, RefreshCw, Map } from "lucide-react";

const PROVIDER_LABELS: Record<string, string> = {
  smtp: "البريد الإلكتروني SMTP",
  sms: "رسائل SMS",
  google_oauth: "Google (Meet & Calendar)",
  webhook: "Webhook",
};

function ConfigField({ label, name, value, onChange, type = "text", placeholder = "" }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input type={type} name={name} value={value || ""} onChange={onChange} placeholder={placeholder} className="h-9" data-testid={`input-${name}`} />
    </div>
  );
}

function IntegrationCard({ title, description, icon: Icon, iconBg, provider, children }: any) {
  const { data: integration } = useQuery<any>({
    queryKey: ["/api/integrations", provider],
    queryFn: () => fetch(`/api/integrations/${provider}`, { credentials: "include" }).then(r => r.json()),
  });
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${iconBg}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            </div>
          </div>
          <Badge variant={integration?.isEnabled ? "default" : "secondary"} className={`text-xs ${integration?.isEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {integration?.isEnabled ? "مفعّل" : "غير مفعّل"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {children(integration)}
      </CardContent>
    </Card>
  );
}

// SMTP Email Section
function SmtpSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: setting } = useQuery<any>({ queryKey: ["/api/integrations", "smtp"], queryFn: () => fetch("/api/integrations/smtp", { credentials: "include" }).then(r => r.json()) });
  const [form, setForm] = useState<any>({});
  const [enabled, setEnabled] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const config = { ...((setting?.config) || {}), ...form };
  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/integrations/smtp", { isEnabled: enabled || setting?.isEnabled, config }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/integrations", "smtp"] }); setForm({}); toast({ title: "تم الحفظ" }); },
    onError: (e: any) => toast({ title: "خطأ في الحفظ", description: e.message, variant: "destructive" }),
  });

  const testMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/integrations/smtp/test", { email: testEmail }),
    onSuccess: () => toast({ title: "✅ تم الإرسال بنجاح", description: "تحقق من بريدك الإلكتروني" }),
    onError: (e: any) => toast({ title: "فشل الاختبار", description: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: (val: boolean) => apiRequest("PUT", "/api/integrations/smtp", { isEnabled: val, config: setting?.config || {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/integrations", "smtp"] }),
  });

  return (
    <IntegrationCard title="البريد الإلكتروني (SMTP)" description="أرسل إيميلات وعروض أسعار مباشرة من النظام" icon={Mail} iconBg="bg-orange-500" provider="smtp">
      {(integration: any) => (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Switch checked={integration?.isEnabled || false} onCheckedChange={v => toggleMutation.mutate(v)} data-testid="switch-smtp-enabled" />
            <span className="text-sm text-gray-600">تفعيل خدمة البريد</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ConfigField label="SMTP Host" name="host" value={config.host} onChange={handleChange} placeholder="smtp.gmail.com" />
            <ConfigField label="Port" name="port" value={config.port} onChange={handleChange} placeholder="587" />
            <ConfigField label="البريد الإلكتروني (User)" name="user" value={config.user} onChange={handleChange} placeholder="you@gmail.com" />
            <ConfigField label="كلمة المرور / App Password" name="pass" value={config.pass} onChange={handleChange} type="password" placeholder="••••••••" />
            <ConfigField label="اسم المرسل" name="fromName" value={config.fromName} onChange={handleChange} placeholder="Softlix CRM" />
            <ConfigField label="بريد المرسل (From)" name="from" value={config.from} onChange={handleChange} placeholder="noreply@company.com" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="button-save-smtp">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : null}
              حفظ الإعدادات
            </Button>
            {integration?.isEnabled && (
              <div className="flex gap-2 items-center flex-1">
                <Input placeholder="بريد الاختبار" value={testEmail} onChange={e => setTestEmail(e.target.value)} className="h-8 text-sm" data-testid="input-test-email" />
                <Button size="sm" variant="outline" onClick={() => testMutation.mutate()} disabled={testMutation.isPending} data-testid="button-test-smtp">
                  {testMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "اختبار"}
                </Button>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-xs text-[#ff6a00] space-y-1">
            <p className="font-semibold">💡 نصائح الإعداد:</p>
            <p>• Gmail: استخدم App Password من إعدادات الأمان (2FA يجب أن يكون مفعّلاً)</p>
            <p>• Port 587 مع STARTTLS أو Port 465 مع SSL</p>
            <p>• Outlook: smtp.office365.com:587</p>
          </div>
        </div>
      )}
    </IntegrationCard>
  );
}

// SMS Section
function SmsSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: setting } = useQuery<any>({ queryKey: ["/api/integrations", "sms"], queryFn: () => fetch("/api/integrations/sms", { credentials: "include" }).then(r => r.json()) });
  const [form, setForm] = useState<any>({});
  const [smsProvider, setSmsProvider] = useState("twilio");

  const config = { ...((setting?.config) || {}), provider: smsProvider, ...form };
  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/integrations/sms", { isEnabled: true, config }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/integrations", "sms"] }); setForm({}); toast({ title: "تم الحفظ" }); },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: (val: boolean) => apiRequest("PUT", "/api/integrations/sms", { isEnabled: val, config: setting?.config || {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/integrations", "sms"] }),
  });

  return (
    <IntegrationCard title="رسائل SMS" description="أرسل رسائل نصية للعملاء عبر Twilio أو Unifonic أو Msegat" icon={MessageSquare} iconBg="bg-green-500" provider="sms">
      {(integration: any) => (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Switch checked={integration?.isEnabled || false} onCheckedChange={v => toggleMutation.mutate(v)} data-testid="switch-sms-enabled" />
            <span className="text-sm text-gray-600">تفعيل خدمة SMS</span>
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">مزود الخدمة</Label>
            <Select value={smsProvider} onValueChange={v => setSmsProvider(v)}>
              <SelectTrigger className="h-9" data-testid="select-sms-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio (عالمي)</SelectItem>
                <SelectItem value="unifonic">Unifonic (خليجي)</SelectItem>
                <SelectItem value="msegat">Msegat - مسجات (سعودي)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {smsProvider === "twilio" && (
            <div className="grid grid-cols-2 gap-3">
              <ConfigField label="Account SID" name="accountSid" value={config.accountSid} onChange={handleChange} placeholder="ACxxxxx" />
              <ConfigField label="Auth Token" name="authToken" value={config.authToken} onChange={handleChange} type="password" placeholder="••••••••" />
              <div className="col-span-2"><ConfigField label="رقم المرسل (From Number)" name="fromNumber" value={config.fromNumber} onChange={handleChange} placeholder="+1xxxxxxxxxx" /></div>
            </div>
          )}
          {smsProvider === "unifonic" && (
            <div className="grid grid-cols-2 gap-3">
              <ConfigField label="App SID" name="appSid" value={config.appSid} onChange={handleChange} placeholder="Unifonic App SID" />
              <ConfigField label="Sender ID" name="senderId" value={config.senderId} onChange={handleChange} placeholder="Softlix" />
            </div>
          )}
          {smsProvider === "msegat" && (
            <div className="grid grid-cols-2 gap-3">
              <ConfigField label="Username" name="userName" value={config.userName} onChange={handleChange} placeholder="اسم المستخدم" />
              <ConfigField label="API Key" name="apiKey" value={config.apiKey} onChange={handleChange} type="password" placeholder="••••••••" />
              <div className="col-span-2"><ConfigField label="Sender ID" name="senderId" value={config.senderId} onChange={handleChange} placeholder="Softlix" /></div>
            </div>
          )}
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="button-save-sms">
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : null}
            حفظ إعدادات SMS
          </Button>
        </div>
      )}
    </IntegrationCard>
  );
}

// Google OAuth Section
function GoogleSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: setting } = useQuery<any>({ queryKey: ["/api/integrations", "google_oauth"], queryFn: () => fetch("/api/integrations/google_oauth", { credentials: "include" }).then(r => r.json()) });
  const [form, setForm] = useState<any>({});
  const config = { ...((setting?.config) || {}), ...form };
  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/integrations/google_oauth", { isEnabled: setting?.isEnabled || false, config }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/integrations", "google_oauth"] }); setForm({}); toast({ title: "تم الحفظ" }); },
  });

  const connectGoogle = async () => {
    try {
      const res = await fetch("/api/integrations/google/auth-url", { credentials: "include" });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "google-auth", "width=600,height=700");
      } else {
        toast({ title: data.message || "خطأ", variant: "destructive" });
      }
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/integrations/google_oauth", { isEnabled: false, config: { clientId: config.clientId, clientSecret: config.clientSecret } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/integrations", "google_oauth"] }); toast({ title: "تم قطع الاتصال" }); },
  });

  const isConnected = !!(setting?.config as any)?.refreshToken;

  return (
    <IntegrationCard title="Google Workspace" description="ربط Google Meet وGoogle Calendar وGmail" icon={Video} iconBg="bg-red-500" provider="google_oauth">
      {(integration: any) => (
        <div className="space-y-5">
          {isConnected ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">مرتبط بـ Google</p>
                <p className="text-xs text-green-600">يمكنك الآن إنشاء اجتماعات Meet وجدولة لقاءات</p>
              </div>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => disconnectMutation.mutate()}>
                قطع الاتصال
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <XCircle className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-600 flex-1">غير مرتبط بـ Google</p>
            </div>
          )}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-700">إعدادات Google Cloud (مطلوبة قبل الربط)</p>
            <div className="grid grid-cols-1 gap-3">
              <ConfigField label="Client ID" name="clientId" value={config.clientId} onChange={handleChange} placeholder="xxx.apps.googleusercontent.com" />
              <ConfigField label="Client Secret" name="clientSecret" value={config.clientSecret} onChange={handleChange} type="password" placeholder="••••••••" />
            </div>
            <Button size="sm" variant="outline" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              حفظ Client ID & Secret
            </Button>
          </div>
          <Button onClick={connectGoogle} className="w-full gap-2" disabled={!config.clientId || !config.clientSecret} data-testid="button-connect-google">
            <ExternalLink className="h-4 w-4" />
            {isConnected ? "إعادة ربط Google" : "ربط حساب Google"}
          </Button>
          <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-xs text-[#ff6a00] space-y-1">
            <p className="font-semibold">⚙️ كيفية الإعداد:</p>
            <p>1. اذهب إلى <a href="https://console.cloud.google.com" target="_blank" className="underline">Google Cloud Console</a></p>
            <p>2. أنشئ مشروعاً جديداً → APIs & Services → OAuth 2.0</p>
            <p>3. أضف Redirect URI: <code className="bg-orange-100 px-1 rounded">{window.location.origin}/api/integrations/google/callback</code></p>
            <p>4. فعّل: Google Calendar API + Gmail API</p>
          </div>
        </div>
      )}
    </IntegrationCard>
  );
}

// Webhook Section
function WebhookSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: setting } = useQuery<any>({ queryKey: ["/api/integrations", "webhook"], queryFn: () => fetch("/api/integrations/webhook", { credentials: "include" }).then(r => r.json()) });
  const [form, setForm] = useState<any>({});
  const config = { ...((setting?.config) || {}), ...form };
  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/integrations/webhook", { isEnabled: true, config }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/integrations", "webhook"] }); setForm({}); toast({ title: "تم الحفظ" }); },
  });

  const toggleMutation = useMutation({
    mutationFn: (val: boolean) => apiRequest("PUT", "/api/integrations/webhook", { isEnabled: val, config: setting?.config || {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/integrations", "webhook"] }),
  });

  return (
    <IntegrationCard title="Webhook" description="أرسل إشعارات تلقائية لأنظمة خارجية (Zapier، Make، إلخ)" icon={Webhook} iconBg="bg-purple-500" provider="webhook">
      {(integration: any) => (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Switch checked={integration?.isEnabled || false} onCheckedChange={v => toggleMutation.mutate(v)} data-testid="switch-webhook-enabled" />
            <span className="text-sm text-gray-600">تفعيل Webhook</span>
          </div>
          <ConfigField label="Webhook URL" name="url" value={config.url} onChange={handleChange} placeholder="https://hooks.zapier.com/..." />
          <ConfigField label="Secret Key (اختياري)" name="secret" value={config.secret} onChange={handleChange} type="password" placeholder="••••••••" />
          <div>
            <Label className="text-sm mb-2 block">الأحداث المُرسَلة</Label>
            <div className="flex flex-wrap gap-2">
              {["new_lead", "lead_converted", "deal_won", "deal_lost", "proposal_accepted"].map(ev => (
                <label key={ev} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={config.events?.includes(ev) || false}
                    onChange={e => setForm((f: any) => ({ ...f, events: e.target.checked ? [...(config.events || []), ev] : (config.events || []).filter((x: string) => x !== ev) }))} />
                  {ev}
                </label>
              ))}
            </div>
          </div>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="button-save-webhook">
            حفظ إعدادات Webhook
          </Button>
        </div>
      )}
    </IntegrationCard>
  );
}

// Google Maps Section
function GoogleMapsSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: setting } = useQuery<any>({
    queryKey: ["/api/integrations", "google_maps"],
    queryFn: () => fetch("/api/integrations/google_maps", { credentials: "include" }).then(r => r.json()),
  });
  const [form, setForm] = useState<any>({});
  const config = { ...((setting?.config) || {}), ...form };
  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/integrations/google_maps", { isEnabled: true, config }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/integrations", "google_maps"] });
      setForm({});
      toast({ title: "✅ تم حفظ مفتاح Google Maps" });
    },
    onError: (e: any) => toast({ title: "خطأ في الحفظ", description: e.message, variant: "destructive" }),
  });

  const hasKey = !!(setting?.config as any)?.apiKey;

  return (
    <IntegrationCard
      title="Google Maps"
      description="استيراد الشركات من خرائط جوجل مباشرةً إلى CRM"
      icon={Map}
      iconBg="bg-emerald-500"
      provider="google_maps"
    >
      {(_integration: any) => (
        <div className="space-y-5">
          {hasKey ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">المفتاح مُعرَّف ونشط</p>
                <p className="text-xs text-green-600 font-mono">{String((setting?.config as any)?.apiKey || "").slice(0, 12)}••••••••••••</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <XCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-700 flex-1">لم يتم إضافة مفتاح API بعد</p>
            </div>
          )}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-700">مفتاح Google Maps API</p>
            <ConfigField
              label="API Key"
              name="apiKey"
              value={config.apiKey}
              onChange={handleChange}
              type="password"
              placeholder="AIzaSy••••••••••••••••••••••••••••"
            />
          </div>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !config.apiKey}
            data-testid="button-save-google-maps"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : null}
            حفظ المفتاح
          </Button>
          <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-xs text-[#ff6a00] space-y-1">
            <p className="font-semibold">⚙️ كيفية الحصول على المفتاح:</p>
            <p>1. اذهب إلى <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="underline">Google Cloud Console</a></p>
            <p>2. أنشئ مشروعاً ← APIs & Services ← Credentials</p>
            <p>3. أنشئ API Key ثم فعّل: <strong>Places API</strong></p>
            <p>4. الصق المفتاح هنا واحفظه</p>
          </div>
        </div>
      )}
    </IntegrationCard>
  );
}

export default function IntegrationsSettings() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التكاملات والاتصالات</h1>
        <p className="text-sm text-gray-500 mt-1">ربط النظام بخدمات البريد والرسائل النصية وأدوات جوجل وأنظمة خارجية</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmtpSection />
        <SmsSection />
        <GoogleSection />
        <GoogleMapsSection />
        <WebhookSection />
      </div>
    </div>
  );
}
