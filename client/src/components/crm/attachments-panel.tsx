import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Upload, Trash2, FileText, Image, File, Download, Loader2 } from "lucide-react";

const MIME_ICONS: Record<string, any> = {
  "image/": Image,
  "application/pdf": FileText,
  "application/vnd": FileText,
  "text/": FileText,
};

function getIcon(mimeType?: string) {
  if (!mimeType) return File;
  for (const [prefix, Icon] of Object.entries(MIME_ICONS)) {
    if (mimeType.startsWith(prefix)) return Icon;
  }
  return File;
}

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentsPanelProps {
  entityType: string;
  entityId: string;
  title?: string;
}

export default function AttachmentsPanel({ entityType, entityId, title = "المرفقات" }: AttachmentsPanelProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: attachments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/crm/attachments", entityType, entityId],
    queryFn: () => fetch(`/api/crm/attachments?entityType=${entityType}&entityId=${entityId}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!entityId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/crm/attachments/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/crm/attachments", entityType, entityId] }); toast({ title: "تم الحذف" }); },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("entityType", entityType);
        formData.append("entityId", entityId);
        const res = await fetch("/api/crm/attachments", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "فشل الرفع");
        }
      }
      qc.invalidateQueries({ queryKey: ["/api/crm/attachments", entityType, entityId] });
      toast({ title: `تم رفع ${files.length} ملف(ات) بنجاح` });
    } catch (err: any) {
      toast({ title: "فشل الرفع", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{title} ({attachments.length})</span>
        </div>
        <div>
          <input ref={fileRef} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" className="hidden" onChange={handleUpload} data-testid="input-attachment-file" />
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="button-upload-attachment">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Upload className="h-4 w-4 ml-1" />}
            {uploading ? "جاري الرفع..." : "رفع ملف"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-400 mx-auto" /></div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors" onClick={() => fileRef.current?.click()}>
          <Paperclip className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">اسحب وأفلت الملفات هنا أو انقر للاختيار</p>
          <p className="text-xs text-gray-300 mt-1">PDF، Word، Excel، صور حتى 20 MB</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment: any) => {
            const Icon = getIcon(attachment.mimeType);
            const isImage = attachment.mimeType?.startsWith("image/");
            return (
              <div key={attachment.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 group" data-testid={`attachment-${attachment.id}`}>
                {isImage ? (
                  <img src={attachment.fileUrl} alt={attachment.fileName} className="h-10 w-10 rounded object-cover border" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{attachment.fileName}</p>
                  <p className="text-xs text-gray-400">
                    {formatSize(attachment.fileSize)} · {new Date(attachment.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={attachment.fileUrl} target="_blank" rel="noreferrer" download className="p-1.5 rounded hover:bg-gray-100">
                    <Download className="h-4 w-4 text-gray-500" />
                  </a>
                  <button onClick={() => { if (confirm("حذف المرفق؟")) deleteMutation.mutate(attachment.id); }} className="p-1.5 rounded hover:bg-red-50">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
