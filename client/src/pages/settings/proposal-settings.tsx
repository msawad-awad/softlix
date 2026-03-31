import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, RotateCcw, Save, CheckCircle } from "lucide-react";

export default function ProposalSettingsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const stampRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading } = useQuery<any>({
    queryKey: ["/api/crm/proposal-settings"],
    queryFn: () => apiRequest("GET", "/api/crm/proposal-settings").then(r => r.json()),
  });

  const [signatoryName, setSignatoryName] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [stampUrl, setStampUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [uploadingStamp, setUploadingStamp] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);

  // Populate state when data loads
  const initialized = useRef(false);
  if (settings && !initialized.current) {
    initialized.current = true;
    setSignatoryName(settings.signatoryName || "فرج سالم بن عبيد");
    setAuthorTitle(settings.authorTitle || "المدير التنفيذي");
    setStampUrl(settings.stampUrl || "/company-stamp.png");
    setSignatureUrl(settings.signatureUrl || "/company-signature.png");
  }

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/crm/proposal-settings", {
      signatoryName, authorTitle, stampUrl, signatureUrl,
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposal-settings"] });
      toast({ title: "تم الحفظ بنجاح", description: "ستظهر التغييرات في جميع العروض الجديدة" });
    },
    onError: () => toast({ title: "خطأ في الحفظ", variant: "destructive" }),
  });

  const uploadFile = async (file: File, type: "stamp" | "signature") => {
    const setUploading = type === "stamp" ? setUploadingStamp : setUploadingSig;
    const setUrl = type === "stamp" ? setStampUrl : setSignatureUrl;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUrl(data.url || data.path || "");
      toast({ title: "تم رفع الصورة", description: "اضغط حفظ لتطبيق التغييرات" });
    } catch {
      toast({ title: "خطأ في الرفع", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const resetToDefault = (type: "stamp" | "signature") => {
    if (type === "stamp") setStampUrl("/company-stamp.png");
    else setSignatureUrl("/company-signature.png");
    toast({ title: "تم الإعادة للافتراضي" });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-[#ff6a00]" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعدادات صفحة التوقيع</h1>
        <p className="text-sm text-gray-500 mt-1">تحكم في الختم والتوقيع واسم المسؤول الظاهرة في العروض</p>
      </div>

      {/* Signatory Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">بيانات المفوّض بالتوقيع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">اسم المسؤول *</Label>
            <Input
              className="mt-1.5"
              value={signatoryName}
              onChange={e => setSignatoryName(e.target.value)}
              placeholder="فرج سالم بن عبيد"
              data-testid="input-signatory-name"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">المسمى الوظيفي</Label>
            <Input
              className="mt-1.5"
              value={authorTitle}
              onChange={e => setAuthorTitle(e.target.value)}
              placeholder="المدير التنفيذي"
              data-testid="input-author-title"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stamp */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ختم الشركة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Preview */}
            <div
              className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0"
            >
              {stampUrl ? (
                <img
                  src={stampUrl}
                  alt="الختم"
                  className="max-w-full max-h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <p className="text-xs text-gray-400">لا يوجد ختم</p>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-sm font-medium">رابط الختم (URL)</Label>
                <Input
                  className="mt-1.5 text-xs"
                  value={stampUrl}
                  onChange={e => setStampUrl(e.target.value)}
                  placeholder="https://... أو /company-stamp.png"
                  data-testid="input-stamp-url"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={uploadingStamp}
                  onClick={() => stampRef.current?.click()}
                  data-testid="button-upload-stamp"
                >
                  {uploadingStamp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  رفع ختم جديد
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-gray-500"
                  onClick={() => resetToDefault("stamp")}
                >
                  <RotateCcw className="h-4 w-4" />
                  إعادة الافتراضي
                </Button>
              </div>
              <input
                ref={stampRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], "stamp")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">توقيع المفوّض</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Preview */}
            <div
              className="w-48 h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0"
            >
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="التوقيع"
                  className="max-w-full max-h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <p className="text-xs text-gray-400">لا يوجد توقيع</p>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-sm font-medium">رابط التوقيع (URL)</Label>
                <Input
                  className="mt-1.5 text-xs"
                  value={signatureUrl}
                  onChange={e => setSignatureUrl(e.target.value)}
                  placeholder="https://... أو /company-signature.png"
                  data-testid="input-signature-url"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={uploadingSig}
                  onClick={() => sigRef.current?.click()}
                  data-testid="button-upload-signature"
                >
                  {uploadingSig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  رفع توقيع جديد
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-gray-500"
                  onClick={() => resetToDefault("signature")}
                >
                  <RotateCcw className="h-4 w-4" />
                  إعادة الافتراضي
                </Button>
              </div>
              <input
                ref={sigRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], "signature")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview of signature page */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">معاينة مربع التوقيع في العرض</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-orange-200 rounded-2xl p-5 max-w-xs"
            style={{ direction: "rtl" }}
          >
            <p className="text-base font-black text-gray-900 mb-1">ختم وتوقيع شركة سوفت لكس</p>
            <p className="text-xs text-gray-400 mb-3">Softlix Information Technology</p>

            {/* Signature image */}
            <div
              className="h-20 border border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3 bg-orange-50/30 overflow-hidden"
            >
              {signatureUrl ? (
                <img src={signatureUrl} alt="توقيع" className="max-h-full max-w-full object-contain" />
              ) : (
                <p className="text-xs text-gray-400">توقيع الشركة</p>
              )}
            </div>

            {/* Stamp + details */}
            <div className="flex items-end gap-3">
              <div className="flex-1 text-sm space-y-1">
                <p><strong>الاسم:</strong> {signatoryName || "فرج سالم بن عبيد"}</p>
                <p><strong>المسمى:</strong> {authorTitle || "المدير التنفيذي"}</p>
              </div>
              {stampUrl && (
                <img
                  src={stampUrl}
                  alt="الختم"
                  className="w-16 h-16 object-contain opacity-80"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          className="gap-2 bg-[#ff6a00] hover:bg-[#ff8c00] text-white px-8"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          data-testid="button-save-proposal-settings"
        >
          {saveMutation.isPending
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : saveMutation.isSuccess
              ? <CheckCircle className="h-5 w-5" />
              : <Save className="h-5 w-5" />}
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}
