import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search, MapPin, Phone, Globe, Star, Loader2, Plus, CheckCircle,
  Trash2, Download, AlertCircle, Building2, X, Info,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SAUDI_CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الخبر", "الظهران", "تبوك", "بريدة", "أبها", "نجران", "الطائف",
  "حائل", "الجبيل", "ينبع", "القطيف", "عرعر", "سكاكا",
];

const INDUSTRIES = [
  { value: "tech", label: "تقنية المعلومات" },
  { value: "retail", label: "تجارة التجزئة" },
  { value: "food", label: "المطاعم والغذاء" },
  { value: "healthcare", label: "الرعاية الصحية" },
  { value: "education", label: "التعليم" },
  { value: "real-estate", label: "العقارات" },
  { value: "construction", label: "المقاولات" },
  { value: "finance", label: "المالية" },
  { value: "media", label: "الإعلام والتسويق" },
  { value: "logistics", label: "اللوجستيات" },
  { value: "other", label: "أخرى" },
];

interface SearchResult {
  googlePlaceId: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
  types?: string;
  businessStatus?: string;
}

interface BufferItem {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  city?: string;
  status: string;
  importedCompanyId?: string;
  googlePlaceId?: string;
  rating?: string;
  reviewCount?: number;
}

interface ImportDialogData {
  item: BufferItem;
  industry: string;
  city: string;
  name: string;
  phone: string;
  website: string;
  address: string;
  notes: string;
}

export default function GoogleImport() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [keywords, setKeywords] = useState("");
  const [city, setCity] = useState("all");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [loadingPlaceId, setLoadingPlaceId] = useState<string | null>(null);
  const [importDialog, setImportDialog] = useState<ImportDialogData | null>(null);

  const { data: buffer = [], isLoading: bufferLoading } = useQuery<BufferItem[]>({
    queryKey: ["/api/crm/google-import/buffer"],
    queryFn: () => apiRequest("GET", "/api/crm/google-import/buffer").then((r) => r.json()),
  });

  const addToBufferMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", "/api/crm/google-import/buffer", data).then((r) => r.json()),
    onSuccess: (item: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/google-import/buffer"] });
      setAddedIds((prev) => new Set(Array.from(prev).concat(item.googlePlaceId || "")));
      toast({ title: "تمت الإضافة للقائمة" });
    },
    onError: () => toast({ title: "خطأ في الإضافة", variant: "destructive" }),
  });

  const removeFromBufferMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm/google-import/buffer/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/google-import/buffer"] });
      toast({ title: "تم الحذف من القائمة" });
    },
  });

  const clearBufferMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/crm/google-import/buffer"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/google-import/buffer"] });
      toast({ title: "تم مسح القائمة" });
    },
  });

  const importCompanyMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", "/api/crm/google-import/import-company", data).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/crm/google-import/buffer"] });
      qc.invalidateQueries({ queryKey: ["/api/crm/companies"] });
      setImportDialog(null);
      toast({ title: "تم استيراد الشركة بنجاح في CRM" });
    },
    onError: (e: any) => toast({ title: "خطأ في الاستيراد", description: e.message, variant: "destructive" }),
  });

  const handleSearch = async () => {
    if (!keywords.trim()) {
      toast({ title: "أدخل كلمات البحث", variant: "destructive" });
      return;
    }
    setIsSearching(true);
    setSearchResults([]);
    try {
      const params = new URLSearchParams({ keywords: keywords.trim() });
      if (city && city !== "all") params.set("city", city);
      const res = await apiRequest("GET", `/api/crm/google-import/search?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في البحث");
      setSearchResults(data.results || []);
      if (!data.results?.length) toast({ title: "لا توجد نتائج", description: "جرب كلمات بحث مختلفة" });
    } catch (e: any) {
      toast({ title: "خطأ في البحث", description: e.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToBuffer = async (result: SearchResult) => {
    setLoadingPlaceId(result.googlePlaceId);
    try {
      let phone = "";
      let website = "";
      try {
        const detailRes = await apiRequest("GET", `/api/crm/google-import/place-details/${result.googlePlaceId}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          phone = detail.formatted_phone_number || detail.international_phone_number || "";
          website = detail.website || "";
        }
      } catch {
        // Place details optional - continue without them
      }
      addToBufferMutation.mutate({
        googlePlaceId: result.googlePlaceId,
        name: result.name,
        address: result.address,
        phone,
        website,
        lat: result.lat?.toString(),
        lng: result.lng?.toString(),
        rating: result.rating?.toString(),
        reviewCount: result.reviewCount,
        types: result.types,
        status: "pending",
      });
    } catch {
      toast({ title: "خطأ في الإضافة", variant: "destructive" });
    } finally {
      setLoadingPlaceId(null);
    }
  };

  const detectCityFromAddress = (address: string): string => {
    const found = SAUDI_CITIES.find((c) => address.includes(c));
    return found || "الرياض";
  };

  const openImportDialog = (item: BufferItem) => {
    const detectedCity = item.city || detectCityFromAddress(item.address || "") || "الرياض";
    const notes = [
      item.rating ? `تقييم Google: ${item.rating} نجوم` : "",
      item.reviewCount ? `عدد التقييمات: ${item.reviewCount?.toLocaleString()}` : "",
    ].filter(Boolean).join("\n");

    setImportDialog({
      item,
      industry: "other",
      city: detectedCity,
      name: item.name,
      phone: item.phone || "",
      website: item.website || "",
      address: item.address || "",
      notes,
    });
  };

  const pendingBuffer = (buffer as BufferItem[]).filter((b) => b.status === "pending");
  const importedBuffer = (buffer as BufferItem[]).filter((b) => b.status === "imported");

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">استيراد من Google Maps</h1>
          <p className="text-sm text-gray-500 mt-0.5">ابحث عن الشركات في خرائط جوجل واستوردها مباشرة إلى CRM</p>
        </div>
        {pendingBuffer.length > 0 && (
          <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1">
            {pendingBuffer.length} شركة في الانتظار
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Search Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" /> البحث في Google Maps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="sm:col-span-2">
                <Label className="text-sm text-gray-600 mb-1.5 block">كلمات البحث *</Label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="مثال: صيدليات، مطاعم، عيادات طب أسنان..."
                  data-testid="input-search-keywords"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1.5 block">المدينة</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger data-testid="select-city"><SelectValue placeholder="أي مدينة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">أي مدينة</SelectItem>
                    {SAUDI_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="w-full gap-2 bg-blue-600 hover:bg-blue-700" data-testid="btn-search">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isSearching ? "جاري البحث..." : "بحث"}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 items-start">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">عند الضغط على <strong>إضافة</strong> سيتم جلب رقم الهاتف والموقع الإلكتروني تلقائياً من Google.</p>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">نتائج البحث ({searchResults.length})</p>
                <Button variant="ghost" size="sm" onClick={() => setSearchResults([])} className="h-7 text-xs gap-1 text-gray-500">
                  <X className="h-3 w-3" /> مسح
                </Button>
              </div>
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {searchResults.map((result) => {
                  const isAdded = addedIds.has(result.googlePlaceId) || (buffer as BufferItem[]).some((b) => b.googlePlaceId === result.googlePlaceId);
                  const isLoading = loadingPlaceId === result.googlePlaceId;
                  return (
                    <div key={result.googlePlaceId} className="p-4 hover:bg-gray-50/60 transition-colors flex gap-3" data-testid={`result-${result.googlePlaceId}`}>
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{result.name}</p>
                            {result.address && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{result.address}</span>
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              {result.rating && (
                                <span className="text-xs text-amber-600 flex items-center gap-0.5">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {result.rating} ({result.reviewCount?.toLocaleString() || 0})
                                </span>
                              )}
                              {result.businessStatus === "OPERATIONAL" && (
                                <span className="text-xs text-green-600">● مفتوح</span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isAdded ? "outline" : "default"}
                            disabled={isAdded || isLoading || addToBufferMutation.isPending}
                            onClick={() => !isAdded && handleAddToBuffer(result)}
                            className={`flex-shrink-0 h-8 text-xs gap-1 ${!isAdded ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                            data-testid={`btn-add-${result.googlePlaceId}`}
                          >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : isAdded ? <CheckCircle className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            {isLoading ? "جاري الجلب..." : isAdded ? "مضافة" : "إضافة"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Buffer Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <Download className="h-4 w-4 text-blue-600" />
                قائمة الانتظار ({pendingBuffer.length})
              </p>
              {pendingBuffer.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => clearBufferMutation.mutate()} disabled={clearBufferMutation.isPending} className="h-7 text-xs text-red-500 hover:text-red-700 gap-1">
                  <Trash2 className="h-3 w-3" /> مسح الكل
                </Button>
              )}
            </div>

            {bufferLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
            ) : pendingBuffer.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Building2 className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">لا توجد شركات في الانتظار</p>
                <p className="text-xs text-gray-400 mt-1">ابحث واضف شركات من اليسار</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[450px] overflow-y-auto">
                {pendingBuffer.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-gray-50/60 transition-colors" data-testid={`buffer-item-${item.id}`}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                        {item.address && <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" />{item.address}</p>}
                        {item.phone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3 text-green-500" />{item.phone}</p>}
                        {item.website && <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5 truncate"><Globe className="h-3 w-3 flex-shrink-0" />{item.website}</p>}
                        {item.rating && (
                          <p className="text-xs text-amber-600 flex items-center gap-0.5 mt-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {item.rating}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Button size="sm" variant="default" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 px-2" onClick={() => openImportDialog(item)} data-testid={`btn-import-${item.id}`}>
                          <Download className="h-3 w-3" /> استيراد
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-600 px-2" onClick={() => removeFromBufferMutation.mutate(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {importedBuffer.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 bg-green-50/50">
                <p className="font-semibold text-green-800 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  مستوردة ({importedBuffer.length})
                </p>
              </div>
              <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto">
                {importedBuffer.map((item) => (
                  <div key={item.id} className="p-3 flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">تمت إضافتها للـ CRM</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog open={!!importDialog} onOpenChange={(open) => !open && setImportDialog(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle className="text-right">استيراد إلى CRM</DialogTitle></DialogHeader>
          {importDialog && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold mb-1">بيانات من Google Maps</p>
                {importDialog.item.rating && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {importDialog.item.rating} ({importDialog.item.reviewCount?.toLocaleString() || 0} تقييم)
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm mb-1.5 block">اسم الشركة *</Label>
                <Input
                  value={importDialog.name}
                  onChange={(e) => setImportDialog((d) => d ? { ...d, name: e.target.value } : d)}
                  data-testid="input-import-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm mb-1.5 block">المدينة</Label>
                  <Select
                    value={importDialog.city || "الرياض"}
                    onValueChange={(v) => setImportDialog((d) => d ? { ...d, city: v } : d)}
                  >
                    <SelectTrigger data-testid="select-import-city"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAUDI_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">القطاع</Label>
                  <Select value={importDialog.industry} onValueChange={(v) => setImportDialog((d) => d ? { ...d, industry: v } : d)}>
                    <SelectTrigger data-testid="select-import-industry"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm mb-1.5 block">رقم الهاتف</Label>
                <Input
                  value={importDialog.phone}
                  onChange={(e) => setImportDialog((d) => d ? { ...d, phone: e.target.value } : d)}
                  placeholder="+966 5x xxx xxxx"
                  data-testid="input-import-phone"
                />
              </div>

              <div>
                <Label className="text-sm mb-1.5 block">الموقع الإلكتروني</Label>
                <Input
                  value={importDialog.website}
                  onChange={(e) => setImportDialog((d) => d ? { ...d, website: e.target.value } : d)}
                  placeholder="https://..."
                  data-testid="input-import-website"
                />
              </div>

              <div>
                <Label className="text-sm mb-1.5 block">العنوان</Label>
                <Input
                  value={importDialog.address}
                  onChange={(e) => setImportDialog((d) => d ? { ...d, address: e.target.value } : d)}
                  data-testid="input-import-address"
                />
              </div>

              {importDialog.notes && (
                <div>
                  <Label className="text-sm mb-1.5 block">ملاحظات</Label>
                  <Textarea
                    value={importDialog.notes}
                    onChange={(e) => setImportDialog((d) => d ? { ...d, notes: e.target.value } : d)}
                    rows={2}
                    className="text-xs"
                    data-testid="textarea-import-notes"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setImportDialog(null)}>إلغاء</Button>
            <Button
              disabled={importCompanyMutation.isPending || !importDialog?.name?.trim()}
              onClick={() => importDialog && importCompanyMutation.mutate({
                bufferId: importDialog.item.id,
                name: importDialog.name.trim(),
                address: importDialog.address,
                phone: importDialog.phone,
                website: importDialog.website,
                city: importDialog.city,
                industry: importDialog.industry,
                notes: importDialog.notes,
              })}
              className="gap-2 bg-green-600 hover:bg-green-700"
              data-testid="btn-confirm-import"
            >
              {importCompanyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              استيراد إلى CRM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
