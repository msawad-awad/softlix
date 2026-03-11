import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, X, Loader2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  "data-testid"?: string;
}

export function ImageUploader({ value, onChange, label, hint, "data-testid": testId }: ImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value?.startsWith("/uploads") ? "" : value || "");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      const data = await res.json();
      onChange(data.url);
      toast({ title: "تم رفع الصورة بنجاح ✅" });
    } catch (e: any) {
      toast({ title: e.message || "فشل الرفع", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleUrlSave() {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      toast({ title: "تم تعيين رابط الصورة" });
    }
  }

  function clearImage() {
    onChange("");
    setUrlInput("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const isUploaded = value?.includes("/uploads/");
  const defaultTab = isUploaded ? "upload" : "url";

  return (
    <div className="space-y-2" data-testid={testId}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      {/* Preview */}
      {value && (
        <div className="relative inline-block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <img
            src={value}
            alt="preview"
            className="h-24 w-auto max-w-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            data-testid={`${testId}-clear`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="upload" className="text-xs gap-1">
            <Upload className="w-3 h-3" />
            رفع صورة
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs gap-1">
            <Link className="w-3 h-3" />
            رابط URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-2">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            data-testid={`${testId}-drop-zone`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-blue-500">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">جاري الرفع...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">اسحب وأفلت أو <span className="text-blue-500 font-medium">اختر صورة</span></span>
                <span className="text-xs opacity-60">JPG، PNG، WebP، SVG (max 8MB)</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              data-testid={`${testId}-file-input`}
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-2">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              dir="ltr"
              className="text-sm flex-1"
              data-testid={`${testId}-url-input`}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlSave(); } }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleUrlSave}
              data-testid={`${testId}-url-save`}
            >
              تعيين
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
