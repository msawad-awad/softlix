import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, FileText, Trash2, Edit, Eye, Send, Share2, Loader2,
  ChevronRight, ChevronLeft, CheckCircle, Building2, Package,
  CreditCard, ClipboardCheck, Copy, X, BookOpen, Copy as CopyIcon,
  AlertTriangle, Bell, Star, Library, Search, SlidersHorizontal,
  CalendarClock, Layers, Info, Users, FileCode,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", pending_approval: "بانتظار الموافقة", approved: "معتمد",
  sent: "مرسل", viewed: "تمت المشاهدة", revised: "معدّل",
  accepted: "مقبول", rejected: "مرفوض", expired: "منتهي الصلاحية",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-teal-100 text-teal-700", sent: "bg-indigo-100 text-indigo-700",
  viewed: "bg-purple-100 text-purple-700", revised: "bg-orange-100 text-orange-700",
  accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700",
  expired: "bg-rose-100 text-rose-700",
};
const CATEGORY_LABELS: Record<string, string> = {
  "mobile-app": "تطبيق جوال", "web-platform": "موقع ويب",
  erp: "نظام ERP", marketing: "تسويق", general: "عام",
};
const UNIT_LABELS: Record<string, string> = {
  item: "وحدة", hr: "ساعة", day: "يوم", month: "شهر", page: "صفحة",
};
const APPROVAL_DISCOUNT_THRESHOLD = 20; // % discount that triggers approval workflow

const WIZARD_STEPS = [
  { id: 1, label: "بيانات العميل", icon: Building2 },
  { id: 2, label: "القالب والبنود", icon: Package },
  { id: 3, label: "الأسعار والشروط", icon: CreditCard },
  { id: 4, label: "تفاصيل الوثيقة", icon: FileCode },
  { id: 5, label: "المراجعة والإرسال", icon: ClipboardCheck },
];

// ─── Default tech options ──────────────────────────────────────────────────────
const TECH_OPTIONS = [
  { name: "React Native", category: "تطبيق جوال" },
  { name: "Flutter", category: "تطبيق جوال" },
  { name: "iOS (Swift)", category: "تطبيق جوال" },
  { name: "Android (Kotlin)", category: "تطبيق جوال" },
  { name: "React.js", category: "واجهة الويب" },
  { name: "Next.js", category: "واجهة الويب" },
  { name: "Vue.js", category: "واجهة الويب" },
  { name: "React.js / Next.js", category: "واجهة الويب" },
  { name: "Node.js", category: "الخادم" },
  { name: "Python / Django", category: "الخادم" },
  { name: "Laravel (PHP)", category: "الخادم" },
  { name: "PostgreSQL", category: "قاعدة البيانات" },
  { name: "MySQL", category: "قاعدة البيانات" },
  { name: "MongoDB", category: "قاعدة البيانات" },
  { name: "Elasticsearch", category: "قاعدة البيانات" },
  { name: "Firebase", category: "الخدمات السحابية" },
  { name: "AWS", category: "الخدمات السحابية" },
  { name: "AWS S3", category: "الخدمات السحابية" },
  { name: "AWS S3 / Cloudflare", category: "الخدمات السحابية" },
  { name: "Google Cloud", category: "الخدمات السحابية" },
  { name: "Google Maps API", category: "الخدمات السحابية" },
  { name: "Cloudflare", category: "الخدمات السحابية" },
  { name: "Stripe", category: "الدفع الإلكتروني" },
  { name: "Stripe / PayTabs", category: "الدفع الإلكتروني" },
  { name: "PayTabs", category: "الدفع الإلكتروني" },
  { name: "Twilio / SMS", category: "التواصل" },
  { name: "Push Notifications", category: "التواصل" },
  { name: "Socket.io", category: "التواصل" },
  { name: "WebSocket / Socket.io", category: "التواصل" },
];

// ─── Types for rich fields ─────────────────────────────────────────────────────
interface TeamMember { role: string; name: string; title: string; experience: string; bio: string; }
interface TargetGroup { group: string; role: string; language: string; system: string; }
interface Deliverable { name: string; description: string; }

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProposalItem {
  id?: string; title: string; description: string;
  quantity: string; unitPrice: string; lineTotal: string;
  sectionName?: string; isOptional?: boolean;
}
interface PaymentMilestone { label: string; percent: string; dueDate?: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyItem = (): ProposalItem => ({ title: "", description: "", quantity: "1", unitPrice: "0", lineTotal: "0", isOptional: false });

function calcItem(item: ProposalItem): ProposalItem {
  const total = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
  return { ...item, lineTotal: total.toFixed(2) };
}

function calcTotals(items: ProposalItem[], discountType: string, discountValue: string, taxPercent: string) {
  const requiredItems = items.filter(i => !i.isOptional);
  const subtotal = requiredItems.reduce((s, i) => s + parseFloat(i.lineTotal || "0"), 0);
  const optionalTotal = items.filter(i => i.isOptional).reduce((s, i) => s + parseFloat(i.lineTotal || "0"), 0);
  const discV = parseFloat(discountValue) || 0;
  const discount = discountType === "percent" ? (subtotal * discV) / 100 : discV;
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxP = parseFloat(taxPercent) || 0;
  const taxAmount = (afterDiscount * taxP) / 100;
  const total = afterDiscount + taxAmount;
  const discountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;
  return { subtotal, discount, discountPercent, taxAmount, total, optionalTotal };
}

function applyTemplateVariables(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
  }
  return result;
}

const LS_KEY = "proposal_wizard_draft";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CrmProposals() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();

  // Wizard open/step
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Wizard form
  const [form, setForm] = useState({
    title: "", companyId: "", contactId: "", dealId: "",
    currency: "SAR", discountType: "fixed", discountValue: "0",
    taxPercent: "15", termsAndNotes: "", status: "draft",
    expiryDate: "", internalNotes: "",
  });
  const [items, setItems] = useState<ProposalItem[]>([emptyItem()]);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentMilestone[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templatePreview, setTemplatePreview] = useState<any>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Rich document fields (Step 4) ──────────────────────────────────────────
  const [richForm, setRichForm] = useState({
    requirements: "", introText: "", authorName: "", authorTitle: "",
    approverName: "", approverTitle: "", timelineDays: "65",
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState<TargetGroup[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  // Email / Share dialogs
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailProposal, setEmailProposal] = useState<any>(null);
  const [emailForm, setEmailForm] = useState({ to: "", subject: "", message: "" });
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: proposals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/crm/proposals"],
    queryFn: () => apiRequest("GET", "/api/crm/proposals").then(r => r.json()),
  });
  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"],
    queryFn: () => apiRequest("GET", "/api/companies").then(r => r.json()),
  });
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
    queryFn: () => apiRequest("GET", "/api/contacts").then(r => r.json()),
  });
  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/proposal-templates"],
    queryFn: () => apiRequest("GET", "/api/crm/proposal-templates").then(r => r.json()),
  });
  const { data: serviceLibraryItems = [] } = useQuery<any[]>({
    queryKey: ["/api/crm/service-library"],
    queryFn: () => apiRequest("GET", "/api/crm/service-library").then(r => r.json()),
  });

  // ─── Auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showWizard) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (!editingId) {
        localStorage.setItem(LS_KEY, JSON.stringify({ form, items, paymentSchedule, wizardStep, savedAt: new Date().toISOString() }));
      }
    }, 2000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [form, items, paymentSchedule, showWizard, editingId]);

  // ─── Calculations ──────────────────────────────────────────────────────────
  const { subtotal, discount, discountPercent, taxAmount, total, optionalTotal } = calcTotals(items, form.discountType, form.discountValue, form.taxPercent);
  const needsApproval = form.discountType === "percent"
    ? parseFloat(form.discountValue) > APPROVAL_DISCOUNT_THRESHOLD
    : discountPercent > APPROVAL_DISCOUNT_THRESHOLD;

  // ─── Expiry alerts ─────────────────────────────────────────────────────────
  const expiringProposals = (proposals as any[]).filter(p => {
    if (!p.expiryDate || ["accepted", "rejected", "expired"].includes(p.status)) return false;
    const days = (new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
  });

  // ─── Wizard helpers ────────────────────────────────────────────────────────
  const resetWizard = () => {
    setForm({ title: "", companyId: "", contactId: "", dealId: "", currency: "SAR", discountType: "fixed", discountValue: "0", taxPercent: "15", termsAndNotes: "", status: "draft", expiryDate: "", internalNotes: "" });
    setItems([emptyItem()]); setPaymentSchedule([]); setSelectedTemplate(""); setWizardStep(1); setEditingId(null);
    setRichForm({ requirements: "", introText: "", authorName: "", authorTitle: "", approverName: "", approverTitle: "", timelineDays: "65" });
    setTeamMembers([]); setSelectedTechnologies([]); setTargetAudience([]); setDeliverables([]);
  };

  const openWizard = (proposal?: any) => {
    if (proposal) {
      setEditingId(proposal.id);
      setForm({ title: proposal.title || "", companyId: proposal.companyId || "", contactId: proposal.contactId || "", dealId: proposal.dealId || "", currency: proposal.currency || "SAR", discountType: proposal.discountType || "fixed", discountValue: proposal.discountValue || "0", taxPercent: proposal.taxPercent || "15", termsAndNotes: proposal.termsAndNotes || "", status: proposal.status || "draft", expiryDate: proposal.expiryDate ? proposal.expiryDate.split("T")[0] : "", internalNotes: proposal.internalNotes || "" });
      setItems((proposal.items || []).map((i: any) => calcItem(i)));
      setPaymentSchedule(proposal.paymentSchedule || []);
      setRichForm({
        requirements: proposal.requirements || "",
        introText: proposal.introText || "",
        authorName: proposal.authorName || "",
        authorTitle: proposal.authorTitle || "",
        approverName: proposal.approverName || "",
        approverTitle: proposal.approverTitle || "",
        timelineDays: String(proposal.timelineDays || "65"),
      });
      setTeamMembers(proposal.teamMembers || []);
      setSelectedTechnologies((proposal.selectedTechnologies || []).map((t: any) => t.name || t));
      setTargetAudience(proposal.targetAudience || []);
      setDeliverables(proposal.deliverables || []);
    } else {
      // Restore auto-saved draft
      const draft = localStorage.getItem(LS_KEY);
      if (draft) {
        try {
          const saved = JSON.parse(draft);
          const savedAge = (Date.now() - new Date(saved.savedAt).getTime()) / 1000 / 60;
          if (savedAge < 60) {
            setForm(saved.form); setItems(saved.items); setPaymentSchedule(saved.paymentSchedule || []);
            setWizardStep(saved.wizardStep || 1);
            toast({ title: "تم استعادة المسودة المحفوظة تلقائياً" });
            setShowWizard(true); return;
          }
        } catch { }
      }
      resetWizard();
    }
    setShowWizard(true);
  };

  const applyTemplate = (tpl: any, force = false) => {
    if (!force) { setTemplatePreview(tpl); return; }
    setTemplatePreview(null);
    setSelectedTemplate(tpl.id);

    const company = (companies as any[]).find(c => c.id === form.companyId);
    const vars: Record<string, string> = {
      company_name: company?.name || "اسم العميل",
      date: new Date().toLocaleDateString("ar-SA"),
      validity_days: String(tpl.defaultValidity || 14),
    };

    const tplItems = (tpl.items || []).map((i: any) => calcItem({ ...emptyItem(), ...i }));
    setItems(tplItems.length ? tplItems : [emptyItem()]);
    if (tpl.defaultTerms) setForm(f => ({ ...f, termsAndNotes: applyTemplateVariables(tpl.defaultTerms, vars) }));
    if (tpl.defaultTaxPercent) setForm(f => ({ ...f, taxPercent: tpl.defaultTaxPercent }));
    if (tpl.defaultValidity) {
      const d = new Date(); d.setDate(d.getDate() + tpl.defaultValidity);
      setForm(f => ({ ...f, expiryDate: d.toISOString().split("T")[0] }));
    }
    if (!form.title && tpl.name) {
      setForm(f => ({ ...f, title: applyTemplateVariables(`عرض سعر - ${tpl.name}${company ? ` - ${company.name}` : ""}`, vars) }));
    }
    // ── Populate rich fields from template ──────────────────────────────────
    if (tpl.targetAudience?.length) setTargetAudience(tpl.targetAudience);
    if (tpl.deliverables?.length) setDeliverables(tpl.deliverables);
    if (tpl.technologies?.length) setSelectedTechnologies((tpl.technologies || []).map((t: any) => t.name || t));
    // ── New rich doc fields from template ──────────────────────────────────
    if (tpl.defaultIntroText || tpl.defaultRequirements || tpl.defaultTimelineDays) {
      setRichForm(f => ({
        ...f,
        ...(tpl.defaultIntroText ? { introText: applyTemplateVariables(tpl.defaultIntroText, vars) } : {}),
        ...(tpl.defaultRequirements ? { requirements: applyTemplateVariables(tpl.defaultRequirements, vars) } : {}),
        ...(tpl.defaultTimelineDays ? { timelineDays: String(tpl.defaultTimelineDays) } : {}),
      }));
    }
    if (tpl.defaultTeamMembers?.length) setTeamMembers(tpl.defaultTeamMembers);
    if (tpl.defaultPaymentSchedule?.length) {
      setPaymentSchedule(tpl.defaultPaymentSchedule.map((m: any) => ({
        label: m.milestone || m.label || "",
        percent: String(m.percent || "0"),
        dueDate: m.dueDate || "",
      })));
    } else {
      setPaymentSchedule([]);
    }
    const richCount = [tpl.defaultIntroText, tpl.defaultRequirements, tpl.defaultPaymentSchedule?.length, tpl.defaultTeamMembers?.length].filter(Boolean).length;
    toast({ title: `✅ تم تطبيق قالب: ${tpl.name}`, description: `${(tpl.items||[]).length} بند · ${(tpl.targetAudience||[]).length} مجموعة مستهدفة · ${(tpl.deliverables||[]).length} مخرج${richCount ? ` · ${richCount} حقل إضافي` : ""}` });
  };

  const addFromLibrary = (libItem: any) => {
    const newItem = calcItem({ ...emptyItem(), title: libItem.title, description: libItem.description || "", unitPrice: String(parseFloat(libItem.unitPrice || "0")) });
    setItems(prev => [...prev, newItem]);
    toast({ title: `تمت إضافة: ${libItem.title}` });
  };

  const updateItem = (idx: number, field: keyof ProposalItem, val: any) => {
    setItems(prev => { const next = [...prev]; next[idx] = calcItem({ ...next[idx], [field]: val }); return next; });
  };
  const addItem = (sectionName?: string) => setItems(prev => [...prev, { ...emptyItem(), sectionName: sectionName || "" }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const addPaymentMilestone = () => setPaymentSchedule(prev => [...prev, { label: "", percent: "", dueDate: "" }]);
  const updateMilestone = (idx: number, field: keyof PaymentMilestone, val: string) => {
    setPaymentSchedule(prev => { const n = [...prev]; n[idx] = { ...n[idx], [field]: val }; return n; });
  };
  const removeMilestone = (idx: number) => setPaymentSchedule(prev => prev.filter((_, i) => i !== idx));

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) return (await apiRequest("PATCH", `/api/crm/proposals/${editingId}`, data)).json();
      return (await apiRequest("POST", "/api/crm/proposals", data)).json();
    },
    onSuccess: (proposal: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] });
      localStorage.removeItem(LS_KEY);
      const newId = editingId || proposal.id;
      if (needsApproval) toast({ title: "⚠️ تم إرسال العرض للموافقة بسبب نسبة الخصم المرتفعة", description: "يحتاج العرض اعتماد المدير قبل الإرسال للعميل" });
      else toast({ title: editingId ? "تم تحديث العرض" : "تم إنشاء العرض بنجاح" });
      setShowWizard(false); resetWizard();
      if (newId) setLocation(`/crm/proposals/${newId}/preview`);
    },
    onError: () => toast({ title: "حدث خطأ أثناء الحفظ", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm/proposals/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] }); toast({ title: "تم الحذف" }); },
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/crm/proposals/${id}/clone`, {}).then(r => r.json()),
    onSuccess: (cloned: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] });
      toast({ title: "تم إنشاء نسخة من العرض" });
      setLocation(`/crm/proposals/${cloned.id}/preview`);
    },
    onError: () => toast({ title: "خطأ في النسخ", variant: "destructive" }),
  });

  const shareMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/crm/proposals/${id}/share-token`, {}).then(r => r.json()),
    onSuccess: (data: any) => { setShareLink(data.link); setShowShareDialog(true); navigator.clipboard?.writeText(data.link).catch(() => {}); toast({ title: "تم إنشاء رابط المشاركة" }); },
    onError: () => toast({ title: "خطأ في إنشاء الرابط", variant: "destructive" }),
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("POST", `/api/crm/proposals/${id}/send-email`, data).then(r => r.json()),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["/api/crm/proposals"] });
      setShowEmailDialog(false); toast({ title: "تم إرسال العرض" });
      if (data.link) { setShareLink(data.link); setShowShareDialog(true); }
    },
    onError: (e: any) => toast({ title: "خطأ في الإرسال", description: e.message, variant: "destructive" }),
  });

  const handleSave = () => {
    const finalStatus = needsApproval && form.status === "draft" ? "pending_approval" : form.status;
    const techObjects = selectedTechnologies.map(name => {
      const found = TECH_OPTIONS.find(t => t.name === name);
      return found || { name, category: "عام" };
    });
    const payload = {
      ...form, status: finalStatus, items,
      paymentSchedule: paymentSchedule.filter(m => m.label),
      subtotal: subtotal.toFixed(2), discountValue: discount.toFixed(2),
      taxAmount: taxAmount.toFixed(2), total: total.toFixed(2),
      expiryDate: form.expiryDate || null,
      // Rich document fields
      ...richForm,
      timelineDays: parseInt(richForm.timelineDays) || 65,
      teamMembers, selectedTechnologies: techObjects, targetAudience, deliverables,
    };
    saveMutation.mutate(payload);
  };

  const nextStep = () => {
    if (wizardStep === 1 && !form.title.trim()) { toast({ title: "يرجى إدخال عنوان العرض", variant: "destructive" }); return; }
    if (wizardStep < WIZARD_STEPS.length) setWizardStep(s => s + 1);
    else handleSave();
  };
  const prevStep = () => { if (wizardStep > 1) setWizardStep(s => s - 1); };

  const selectedCompany = (companies as any[]).find(c => c.id === form.companyId);
  const filteredLibrary = (serviceLibraryItems as any[]).filter(item =>
    !librarySearch || item.title.includes(librarySearch) || (item.description || "").includes(librarySearch)
  );

  // ─── Sections helper ───────────────────────────────────────────────────────
  const allSections = Array.from(new Set(items.map(i => i.sectionName || "").filter(Boolean)));

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5" dir="rtl">
      {/* Expiry Alert Banner */}
      {expiringProposals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3" data-testid="expiry-alert">
          <Bell className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {expiringProposals.length === 1 ? "عرض سعر" : `${expiringProposals.length} عروض أسعار`} تنتهي صلاحيتها خلال 7 أيام
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {expiringProposals.map(p => {
                const days = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return <span key={p.id} className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{p.title} ({days === 0 ? "اليوم" : `${days} أيام`})</span>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">عروض الأسعار</h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة وإنشاء عروض الأسعار الاحترافية</p>
        </div>
        <Button onClick={() => openWizard()} className="gap-2 bg-[#ff6a00] hover:bg-[#ff8c00] text-white" data-testid="btn-new-proposal">
          <Plus className="h-4 w-4" /> عرض سعر جديد
        </Button>
      </div>

      {/* Stats */}
      {(proposals as any[]).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "الكل", count: (proposals as any[]).length, color: "blue" },
            { label: "مسودة", count: (proposals as any[]).filter(p => p.status === "draft").length, color: "gray" },
            { label: "بانتظار موافقة", count: (proposals as any[]).filter(p => p.status === "pending_approval").length, color: "amber" },
            { label: "مرسلة / مشاهدة", count: (proposals as any[]).filter(p => ["sent", "viewed"].includes(p.status)).length, color: "indigo" },
            { label: "مقبولة", count: (proposals as any[]).filter(p => p.status === "accepted").length, color: "green" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#ff6a00]" /></div>
        ) : (proposals as any[]).length === 0 ? (
          <div className="text-center py-20 px-4">
            <FileText className="h-14 w-14 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد عروض أسعار</h3>
            <p className="text-gray-500 mb-6">أنشئ أول عرض سعر احترافي لعملائك</p>
            <Button onClick={() => openWizard()} className="gap-2 bg-[#ff6a00] hover:bg-[#ff8c00] text-white">
              <Plus className="h-4 w-4" /> إنشاء أول عرض
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(proposals as any[]).map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors" data-testid={`proposal-row-${p.id}`}>
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-[#ff6a00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{p.proposalNumber}</span>
                    {p.viewCount > 0 && (
                      <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" data-testid={`view-count-${p.id}`}>
                        <Eye className="h-2.5 w-2.5" /> {p.viewCount}
                      </span>
                    )}
                    {p.clientSignature && (
                      <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">✍️ موقّع</span>
                    )}
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end gap-1">
                  <span className="font-bold text-gray-900 text-sm">{parseFloat(p.total || "0").toLocaleString()} {p.currency || "SAR"}</span>
                  {p.expiryDate && <span className={`text-xs ${new Date(p.expiryDate) < new Date() ? "text-red-400" : "text-gray-400"}`}>ينتهي: {new Date(p.expiryDate).toLocaleDateString("ar-SA")}</span>}
                </div>
                <Badge className={`hidden sm:flex text-xs ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[p.status] || p.status}
                </Badge>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="معاينة">
                    <Link href={`/crm/proposals/${p.id}/preview`}><Eye className="h-3.5 w-3.5 text-gray-400" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="إرسال بريد" onClick={() => { setEmailProposal(p); setEmailForm({ to: "", subject: `عرض سعر: ${p.title}`, message: "" }); setShowEmailDialog(true); }}>
                    <Send className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="رابط مشاركة" onClick={() => shareMutation.mutate(p.id)}>
                    <Share2 className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="نسخ العرض" onClick={() => { if (confirm("إنشاء نسخة من هذا العرض؟")) cloneMutation.mutate(p.id); }} data-testid={`btn-clone-${p.id}`}>
                    <CopyIcon className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="تعديل" onClick={() => openWizard(p)}>
                    <Edit className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="حذف" onClick={() => { if (confirm("هل تريد حذف هذا العرض؟")) deleteMutation.mutate(p.id); }}>
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════ WIZARD DIALOG ═══════════════════ */}
      <Dialog open={showWizard} onOpenChange={open => { if (!open) { setShowWizard(false); } }}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0" dir="rtl">
          {/* Header / Steps */}
          <div className="bg-gradient-to-l from-[#1a1a1a] to-[#2a1500] text-white p-5 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{editingId ? "تعديل عرض السعر" : "إنشاء عرض سعر جديد"}</h2>
                {!editingId && <p className="text-xs text-orange-200 mt-0.5">يحفظ تلقائياً كل 2 ثانية</p>}
              </div>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8" onClick={() => setShowWizard(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center">
              {WIZARD_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = step.id === wizardStep;
                const isDone = step.id < wizardStep;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <button onClick={() => isDone && setWizardStep(step.id)} className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive ? "opacity-100" : isDone ? "opacity-80 cursor-pointer" : "opacity-40"}`}>
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-white text-[#ff6a00] shadow-lg" : isDone ? "bg-[#ff6a00]/80 text-white" : "bg-white/20 text-white"}`}>
                        {isDone ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className="text-xs font-medium hidden sm:block">{step.label}</span>
                    </button>
                    {idx < WIZARD_STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${isDone ? "bg-[#ff6a00]/60" : "bg-white/20"}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Approval Warning */}
          {needsApproval && wizardStep >= 3 && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                الخصم ({form.discountType === "percent" ? `${form.discountValue}%` : `${parseFloat(form.discountValue).toLocaleString()} ${form.currency}`}) يتجاوز الحد المسموح ({APPROVAL_DISCOUNT_THRESHOLD}%). سيتم إرسال العرض للموافقة الداخلية أولاً.
              </p>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* ── STEP 1: Client Info ──────────────────────────────── */}
            {wizardStep === 1 && (
              <>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">عنوان العرض *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="مثال: عرض سعر تطوير تطبيق جوال - شركة الأمل" data-testid="input-proposal-title" className="text-base" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الشركة / العميل</Label>
                    <Select value={form.companyId} onValueChange={v => setForm(f => ({ ...f, companyId: v, contactId: "" }))}>
                      <SelectTrigger data-testid="select-company"><SelectValue placeholder="اختر شركة..." /></SelectTrigger>
                      <SelectContent>{(companies as any[]).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">جهة الاتصال</Label>
                    <Select value={form.contactId} onValueChange={v => setForm(f => ({ ...f, contactId: v }))}>
                      <SelectTrigger><SelectValue placeholder="اختر جهة اتصال..." /></SelectTrigger>
                      <SelectContent>
                        {(contacts as any[]).filter(c => !form.companyId || c.companyId === form.companyId).map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">العملة</Label>
                    <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                        <SelectItem value="KWD">دينار كويتي (KWD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">تاريخ انتهاء الصلاحية</Label>
                    <Input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">ملاحظات داخلية (لا تظهر للعميل)</Label>
                  <Textarea value={form.internalNotes} onChange={e => setForm(f => ({ ...f, internalNotes: e.target.value }))} placeholder="ملاحظات للفريق الداخلي..." rows={2} />
                </div>
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 flex items-start gap-2">
                  <Info className="h-4 w-4 text-[#ff6a00] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">يمكن استخدام متغيرات ديناميكية في القوالب مثل <code className="bg-orange-100 px-1 rounded">{"{{company_name}}"}</code>، <code className="bg-orange-100 px-1 rounded">{"{{date}}"}</code>، <code className="bg-orange-100 px-1 rounded">{"{{validity_days}}"}</code> — تُملأ تلقائياً عند تطبيق القالب.</p>
                </div>
              </>
            )}

            {/* ── STEP 2: Template & Items ──────────────────────────── */}
            {wizardStep === 2 && (
              <>
                {/* Templates */}
                {(templates as any[]).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">اختر قالباً جاهزاً (اختياري)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(templates as any[]).map(t => {
                        const isSelected = selectedTemplate === t.id;
                        const icons: Record<string, string> = { "mobile-app": "📱", "web-platform": "🌐", erp: "⚙️", marketing: "📣", general: "📄" };
                        return (
                        <button
                          key={t.id}
                          onClick={() => applyTemplate(t)}
                          className={`p-3 rounded-xl border-2 text-right transition-all ${isSelected ? "border-orange-500 bg-orange-50" : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30"}`}
                          data-testid={`template-card-${t.id}`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-semibold text-sm text-gray-900 leading-tight">{t.name}</p>
                            <span className="text-lg flex-shrink-0">{icons[t.category] || "📄"}</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{t.nameEn || CATEGORY_LABELS[t.category] || t.category}</p>
                          <div className="space-y-0.5">
                            <p className="text-xs text-orange-600 font-medium">{(t.items || []).length} بند تسعيري</p>
                            {(t.targetAudience||[]).length > 0 && <p className="text-xs text-[#ff6a00]">{(t.targetAudience||[]).length} مجموعة مستهدفة</p>}
                            {(t.deliverables||[]).length > 0 && <p className="text-xs text-green-600">{(t.deliverables||[]).length} مخرج</p>}
                          </div>
                          {isSelected && <div className="flex items-center gap-1 mt-2"><CheckCircle className="h-3.5 w-3.5 text-orange-500" /><span className="text-xs text-orange-600 font-medium">مُفعَّل</span></div>}
                        </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <Label className="text-sm font-medium text-gray-700">بنود العرض</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowLibrary(true)} className="gap-1 h-7 text-xs" data-testid="btn-library">
                        <Library className="h-3 w-3" /> مكتبة الخدمات
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addItem()} className="gap-1 h-7 text-xs">
                        <Plus className="h-3 w-3" /> إضافة بند
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 w-7">#</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">البند والوصف</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 w-20">الكمية</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 w-28">سعر الوحدة</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 w-28">الإجمالي</th>
                          <th className="w-16 py-2 px-2 text-center text-xs text-gray-600">خيارات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.map((item, idx) => (
                          <tr key={idx} className={`hover:bg-gray-50/50 ${item.isOptional ? "bg-amber-50/30" : ""}`}>
                            <td className="py-1.5 px-3 text-gray-400 text-xs">{idx + 1}</td>
                            <td className="py-1.5 px-3">
                              <Input value={item.title} onChange={e => updateItem(idx, "title", e.target.value)} placeholder="اسم الخدمة" className="h-7 mb-1 text-xs" data-testid={`input-item-title-${idx}`} />
                              <Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="وصف (اختياري)" className="h-6 text-xs text-gray-500" />
                              <Input value={item.sectionName || ""} onChange={e => updateItem(idx, "sectionName", e.target.value)} placeholder="القسم (مثال: مرحلة التصميم)" className="h-6 text-xs text-gray-400 mt-0.5 border-dashed" />
                            </td>
                            <td className="py-1.5 px-3"><Input value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} className="h-7 text-xs w-full" type="number" min="0" /></td>
                            <td className="py-1.5 px-3"><Input value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", e.target.value)} className="h-7 text-xs w-full" type="number" min="0" /></td>
                            <td className="py-1.5 px-3">
                              <span className={`font-semibold text-xs ${item.isOptional ? "text-amber-600" : "text-gray-900"}`}>
                                {parseFloat(item.lineTotal || "0").toLocaleString()}
                                {item.isOptional && <span className="text-xs text-amber-500 block">اختياري</span>}
                              </span>
                            </td>
                            <td className="py-1.5 px-2">
                              <div className="flex items-center gap-1 justify-center">
                                <button
                                  onClick={() => updateItem(idx, "isOptional", !item.isOptional)}
                                  className={`text-xs px-1.5 py-0.5 rounded transition-colors ${item.isOptional ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-600"}`}
                                  title="بند اختياري"
                                >opt</button>
                                {items.length > 1 && <button onClick={() => removeItem(idx)} className="text-red-300 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {items.some(i => i.isOptional) && (
                    <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      البنود الاختيارية لا تُحتسب في الإجمالي — تُعرض للعميل كخيارات إضافية
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ── STEP 3: Pricing & Terms ───────────────────────────── */}
            {wizardStep === 3 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">نوع الخصم</Label>
                    <Select value={form.discountType} onValueChange={v => setForm(f => ({ ...f, discountType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                        <SelectItem value="percent">نسبة مئوية %</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      قيمة الخصم {form.discountType === "percent" ? "(%)" : `(${form.currency})`}
                    </Label>
                    <Input type="number" min="0" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">نسبة الضريبة (%)</Label>
                    <Input type="number" min="0" max="100" value={form.taxPercent} onChange={e => setForm(f => ({ ...f, taxPercent: e.target.value }))} />
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">ملخص الأسعار</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">المجموع الفرعي (إلزامي)</span><span className="font-medium">{subtotal.toLocaleString()} {form.currency}</span></div>
                    {optionalTotal > 0 && <div className="flex justify-between text-sm text-amber-600"><span>البنود الاختيارية (غير محتسبة)</span><span>{optionalTotal.toLocaleString()} {form.currency}</span></div>}
                    {discount > 0 && <div className="flex justify-between text-sm text-red-600"><span>الخصم {form.discountType === "percent" ? `(${form.discountValue}%)` : ""}</span><span>- {discount.toLocaleString()} {form.currency}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-gray-600">ضريبة القيمة المضافة ({form.taxPercent}%)</span><span>{taxAmount.toLocaleString()} {form.currency}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t-2 border-orange-200 pt-2 text-[#ff6a00]">
                      <span>الإجمالي النهائي</span><span>{total.toLocaleString()} {form.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Schedule */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <CalendarClock className="h-4 w-4 text-[#ff6a00]" /> جدول الدفعات
                    </Label>
                    <Button variant="outline" size="sm" onClick={addPaymentMilestone} className="gap-1 h-7 text-xs">
                      <Plus className="h-3 w-3" /> إضافة دفعة
                    </Button>
                  </div>
                  {paymentSchedule.length === 0 ? (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 text-center">لا يوجد جدول دفعات — يمكنك إضافة دفعات (مقدم، عند التسليم، إلخ)</p>
                  ) : (
                    <div className="space-y-2">
                      {paymentSchedule.map((m, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-gray-50 rounded-xl p-2">
                          <Input value={m.label} onChange={e => updateMilestone(idx, "label", e.target.value)} placeholder="اسم الدفعة (مثال: دفعة مقدم)" className="h-7 text-xs flex-1" />
                          <Input value={m.percent} onChange={e => updateMilestone(idx, "percent", e.target.value)} placeholder="%" className="h-7 text-xs w-16" type="number" min="0" max="100" />
                          <Input value={m.dueDate || ""} onChange={e => updateMilestone(idx, "dueDate", e.target.value)} type="date" className="h-7 text-xs w-36" />
                          <span className="text-xs font-semibold text-gray-700 w-24 text-center">
                            {((parseFloat(m.percent) || 0) * total / 100).toLocaleString()} {form.currency}
                          </span>
                          <button onClick={() => removeMilestone(idx)} className="text-red-300 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                      {paymentSchedule.reduce((s, m) => s + (parseFloat(m.percent) || 0), 0) !== 100 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          مجموع النسب: {paymentSchedule.reduce((s, m) => s + (parseFloat(m.percent) || 0), 0)}% (يجب أن يكون 100%)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الشروط والملاحظات (تظهر في العرض)</Label>
                  <Textarea value={form.termsAndNotes} onChange={e => setForm(f => ({ ...f, termsAndNotes: e.target.value }))} placeholder={"• صلاحية العرض 14 يوماً\n• شروط الدفع\n• ملاحظات أخرى..."} rows={5} className="font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الحالة</Label>
                  <Select value={needsApproval ? "pending_approval" : form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* ── STEP 4: Document Details ──────────────────────────── */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                {/* Requirements */}
                <div>
                  <Label className="text-sm font-semibold text-gray-800 mb-1.5 block">متطلبات العميل التفصيلية</Label>
                  <p className="text-xs text-gray-500 mb-2">يظهر هذا النص في صفحة "متطلبات العميل" داخل الوثيقة</p>
                  <Textarea
                    value={richForm.requirements}
                    onChange={e => setRichForm(f => ({ ...f, requirements: e.target.value }))}
                    placeholder={"يرغب العميل في تطوير تطبيق جوال يعمل على iOS و Android يتيح للمستخدمين...\n\nالمتطلبات الرئيسية:\n• ..."}
                    rows={5}
                    className="text-sm leading-relaxed"
                  />
                </div>

                {/* Intro Text */}
                <div>
                  <Label className="text-sm font-semibold text-gray-800 mb-1.5 block">نص المقدمة (اختياري)</Label>
                  <p className="text-xs text-gray-500 mb-2">يظهر في صفحة "نحن متحمسون للعمل معاً" — اتركه فارغاً لاستخدام النص الافتراضي</p>
                  <Textarea
                    value={richForm.introText}
                    onChange={e => setRichForm(f => ({ ...f, introText: e.target.value }))}
                    placeholder="اتركه فارغاً لاستخدام النص الافتراضي..."
                    rows={4}
                    className="text-sm"
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label className="text-sm font-semibold text-gray-800">المجموعة المستهدفة من المستخدمين</Label>
                      <p className="text-xs text-gray-500">جدول يظهر أنواع المستخدمين وصلاحياتهم ومنصاتهم</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => setTargetAudience(p => [...p, { group: "", role: "", language: "عربي", system: "" }])}>
                      <Plus className="h-3 w-3" /> إضافة مجموعة
                    </Button>
                  </div>
                  {targetAudience.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                      اضغط "إضافة مجموعة" لتحديد الفئات المستهدفة (مثال: المدير، المستخدم العادي، العميل النهائي)
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {targetAudience.map((row, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 items-center bg-gray-50 rounded-xl p-2">
                          <Input className="text-xs h-8" placeholder="المجموعة (مثال: المدير)" value={row.group} onChange={e => { const n = [...targetAudience]; n[i] = { ...n[i], group: e.target.value }; setTargetAudience(n); }} />
                          <Input className="text-xs h-8" placeholder="الدور / الصلاحيات" value={row.role} onChange={e => { const n = [...targetAudience]; n[i] = { ...n[i], role: e.target.value }; setTargetAudience(n); }} />
                          <Input className="text-xs h-8" placeholder="اللغة (عربي/English)" value={row.language} onChange={e => { const n = [...targetAudience]; n[i] = { ...n[i], language: e.target.value }; setTargetAudience(n); }} />
                          <div className="flex gap-1">
                            <Input className="text-xs h-8 flex-1" placeholder="النظام (iOS/Android/Web)" value={row.system} onChange={e => { const n = [...targetAudience]; n[i] = { ...n[i], system: e.target.value }; setTargetAudience(n); }} />
                            <button onClick={() => setTargetAudience(p => p.filter((_, j) => j !== i))} className="text-red-300 hover:text-red-500 px-1"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Deliverables */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label className="text-sm font-semibold text-gray-800">مخرجات المشروع</Label>
                      <p className="text-xs text-gray-500">ما سيتسلمه العميل عند الانتهاء</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => setDeliverables(p => [...p, { name: "", description: "" }])}>
                      <Plus className="h-3 w-3" /> إضافة مخرج
                    </Button>
                  </div>
                  {deliverables.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                      اضغط "إضافة مخرج" (مثال: تطبيق iOS، تطبيق Android، لوحة تحكم ويب، كود المصدر)
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {deliverables.map((d, i) => (
                        <div key={i} className="flex gap-2 items-center bg-gray-50 rounded-xl p-2">
                          <Input className="text-xs h-8 w-44 flex-shrink-0" placeholder="اسم المخرج" value={d.name} onChange={e => { const n = [...deliverables]; n[i] = { ...n[i], name: e.target.value }; setDeliverables(n); }} />
                          <Input className="text-xs h-8 flex-1" placeholder="وصف المخرج..." value={d.description} onChange={e => { const n = [...deliverables]; n[i] = { ...n[i], description: e.target.value }; setDeliverables(n); }} />
                          <button onClick={() => setDeliverables(p => p.filter((_, j) => j !== i))} className="text-red-300 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Technologies */}
                <div>
                  <Label className="text-sm font-semibold text-gray-800 mb-1.5 block">التقنيات المستخدمة</Label>
                  <p className="text-xs text-gray-500 mb-3">اختر التقنيات التي ستُستخدم في المشروع</p>
                  <div className="space-y-3">
                    {Object.entries(
                      TECH_OPTIONS.reduce((acc: Record<string, typeof TECH_OPTIONS>, t) => {
                        if (!acc[t.category]) acc[t.category] = [];
                        acc[t.category].push(t);
                        return acc;
                      }, {})
                    ).map(([cat, techs]) => (
                      <div key={cat}>
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">{cat}</p>
                        <div className="flex flex-wrap gap-2">
                          {techs.map(t => {
                            const isSelected = selectedTechnologies.includes(t.name);
                            return (
                              <button
                                key={t.name}
                                onClick={() => setSelectedTechnologies(prev => isSelected ? prev.filter(x => x !== t.name) : [...prev, t.name])}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isSelected ? "bg-[#ff6a00] text-white border-[#ff6a00]" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"}`}
                              >
                                {t.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedTechnologies.length > 0 && (
                    <p className="text-xs text-[#ff6a00] mt-2">تم اختيار: {selectedTechnologies.join("، ")}</p>
                  )}
                </div>

                {/* Timeline */}
                <div>
                  <Label className="text-sm font-semibold text-gray-800 mb-1.5 block">مدة المشروع التقديرية (بالأيام)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1" max="365"
                      className="w-32 text-center text-lg font-bold"
                      value={richForm.timelineDays}
                      onChange={e => setRichForm(f => ({ ...f, timelineDays: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      {[30, 45, 60, 90, 120, 180].map(d => (
                        <button
                          key={d}
                          onClick={() => setRichForm(f => ({ ...f, timelineDays: String(d) }))}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${richForm.timelineDays === String(d) ? "bg-[#ff6a00] text-white border-[#ff6a00]" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"}`}
                        >
                          {d} يوم
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Team members */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label className="text-sm font-semibold text-gray-800">أعضاء الفريق</Label>
                      <p className="text-xs text-gray-500">يظهر في صفحة "فريقنا" بالوثيقة</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => setTeamMembers(p => [...p, { role: "", name: "", title: "", experience: "", bio: "" }])}>
                      <Plus className="h-3 w-3" /> إضافة عضو
                    </Button>
                  </div>
                  {teamMembers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                      اتركه فارغاً لاستخدام الأعضاء الافتراضيين من قالب الوثيقة، أو أضف أعضاء مخصصين
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teamMembers.map((m, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input className="text-xs h-8" placeholder="الدور (مثال: مدير المشروع)" value={m.role} onChange={e => { const n = [...teamMembers]; n[i] = { ...n[i], role: e.target.value }; setTeamMembers(n); }} />
                            <Input className="text-xs h-8" placeholder="الاسم" value={m.name} onChange={e => { const n = [...teamMembers]; n[i] = { ...n[i], name: e.target.value }; setTeamMembers(n); }} />
                            <Input className="text-xs h-8" placeholder="المسمى الوظيفي (English)" value={m.title} onChange={e => { const n = [...teamMembers]; n[i] = { ...n[i], title: e.target.value }; setTeamMembers(n); }} />
                            <div className="flex gap-1">
                              <Input className="text-xs h-8 flex-1" placeholder="سنوات الخبرة" type="number" value={m.experience} onChange={e => { const n = [...teamMembers]; n[i] = { ...n[i], experience: e.target.value }; setTeamMembers(n); }} />
                              <button onClick={() => setTeamMembers(p => p.filter((_, j) => j !== i))} className="text-red-300 hover:text-red-500 px-1"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                          <Textarea className="text-xs" placeholder="النبذة المهنية..." rows={2} value={m.bio} onChange={e => { const n = [...teamMembers]; n[i] = { ...n[i], bio: e.target.value }; setTeamMembers(n); }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Author / Approver */}
                <div>
                  <Label className="text-sm font-semibold text-gray-800 mb-3 block">بيانات مراقبة الوثيقة</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">اسم كاتب الوثيقة</Label>
                      <Input className="text-sm h-9" placeholder="مثال: مهند العشري" value={richForm.authorName} onChange={e => setRichForm(f => ({ ...f, authorName: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">مسمى الكاتب</Label>
                      <Input className="text-sm h-9" placeholder="مثال: مدير تطوير الأعمال" value={richForm.authorTitle} onChange={e => setRichForm(f => ({ ...f, authorTitle: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">اسم الموافق</Label>
                      <Input className="text-sm h-9" placeholder="مثال: علاء الصبحي" value={richForm.approverName} onChange={e => setRichForm(f => ({ ...f, approverName: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">مسمى الموافق</Label>
                      <Input className="text-sm h-9" placeholder="مثال: م/ البرمجيات" value={richForm.approverTitle} onChange={e => setRichForm(f => ({ ...f, approverTitle: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5: Review ─────────────────────────────────────── */}
            {wizardStep === 5 && (
              <>
                <div className={`rounded-xl p-4 border flex items-start gap-3 ${needsApproval ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100"}`}>
                  {needsApproval ? <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" /> : <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className={`font-semibold ${needsApproval ? "text-amber-800" : "text-green-800"}`}>
                      {needsApproval ? "العرض يحتاج موافقة داخلية" : "العرض جاهز للحفظ"}
                    </p>
                    <p className={`text-sm mt-0.5 ${needsApproval ? "text-amber-700" : "text-green-700"}`}>
                      {needsApproval ? "سيتم حفظ العرض بحالة 'بانتظار الموافقة' بسبب نسبة الخصم المرتفعة" : "راجع الملخص أدناه ثم اضغط حفظ وعرض"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "عنوان العرض", value: form.title || "—" },
                    { label: "العميل", value: selectedCompany?.name || "غير محدد" },
                    { label: "عدد البنود", value: `${items.filter(i => i.title && !i.isOptional).length} إلزامي · ${items.filter(i => i.isOptional && i.title).length} اختياري` },
                    { label: "إجمالي العرض", value: `${total.toLocaleString()} ${form.currency}`, highlight: true },
                    { label: "الخصم", value: discount > 0 ? `- ${discount.toLocaleString()} ${form.currency}` : "لا يوجد" },
                    { label: "الدفعات", value: paymentSchedule.length > 0 ? `${paymentSchedule.length} دفعات` : "غير محدد" },
                  ].map(card => (
                    <div key={card.label} className={`rounded-xl border p-3 ${card.highlight ? "bg-orange-50 border-orange-100" : "bg-white border-gray-100"}`}>
                      <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
                      <p className={`font-semibold text-sm ${card.highlight ? "text-[#ff6a00]" : "text-gray-900"}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Items summary */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-700">البنود المُدرجة</p>
                  </div>
                  {items.filter(i => i.title).map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center px-4 py-2.5 border-b border-gray-50 last:border-0 ${item.isOptional ? "bg-amber-50/40" : ""}`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title} {item.isOptional && <span className="text-xs text-amber-500 mr-1">(اختياري)</span>}</p>
                        {item.sectionName && <p className="text-xs text-[#ff6a00]">{item.sectionName}</p>}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{parseFloat(item.lineTotal || "0").toLocaleString()} {form.currency}</p>
                    </div>
                  ))}
                  <div className="px-4 py-3 bg-orange-50 flex justify-between items-center">
                    <span className="font-bold text-gray-900">الإجمالي (شامل الضريبة)</span>
                    <span className="font-bold text-[#ff6a00] text-lg">{total.toLocaleString()} {form.currency}</span>
                  </div>
                </div>

                {/* Payment schedule summary */}
                {paymentSchedule.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-700">جدول الدفعات</p>
                    </div>
                    {paymentSchedule.filter(m => m.label).map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-50 last:border-0">
                        <p className="text-sm text-gray-900">{m.label} {m.dueDate && <span className="text-xs text-gray-400 mr-1">{new Date(m.dueDate).toLocaleDateString("ar-SA")}</span>}</p>
                        <p className="text-sm font-semibold text-gray-900">{m.percent}% = {((parseFloat(m.percent) || 0) * total / 100).toLocaleString()} {form.currency}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
            <Button variant="outline" onClick={prevStep} disabled={wizardStep === 1} className="gap-2">
              <ChevronRight className="h-4 w-4" /> السابق
            </Button>
            <span className="text-sm text-gray-500">خطوة {wizardStep} من {WIZARD_STEPS.length}</span>
            <Button onClick={nextStep} disabled={saveMutation.isPending} className="gap-2 bg-[#ff6a00] hover:bg-[#ff8c00] text-white" data-testid="btn-wizard-next">
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {wizardStep === WIZARD_STEPS.length ? (editingId ? "حفظ التعديلات" : "حفظ وعرض") : "التالي"}
              {wizardStep < WIZARD_STEPS.length && <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ TEMPLATE PREVIEW ═══════════════════ */}
      <Dialog open={!!templatePreview} onOpenChange={open => !open && setTemplatePreview(null)}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-right text-base">{templatePreview?.name}</DialogTitle>
            {templatePreview?.nameEn && <p className="text-xs text-gray-400 text-right">{templatePreview.nameEn}</p>}
            <DialogDescription className="sr-only">معاينة تفاصيل القالب</DialogDescription>
          </DialogHeader>
          {templatePreview && (
            <div className="flex-1 overflow-y-auto space-y-4 pb-2">
              {/* ── Stats Bar ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-orange-500 font-medium">البنود</p>
                  <p className="font-bold text-orange-700">{(templatePreview.items || []).length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-blue-500 font-medium">المستخدمون</p>
                  <p className="font-bold text-blue-700">{(templatePreview.targetAudience || []).length}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-green-500 font-medium">المخرجات</p>
                  <p className="font-bold text-green-700">{(templatePreview.deliverables || []).length}</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-purple-500 font-medium">المدة</p>
                  <p className="font-bold text-purple-700">{templatePreview.defaultTimelineDays ? `${templatePreview.defaultTimelineDays} يوم` : `${templatePreview.defaultValidity} يوم`}</p>
                </div>
              </div>

              {/* ── Intro Text ── */}
              {templatePreview.defaultIntroText && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">الملخص التنفيذي:</p>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed line-clamp-4">{templatePreview.defaultIntroText}</p>
                </div>
              )}

              {/* ── Requirements ── */}
              {templatePreview.defaultRequirements && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">متطلبات العميل:</p>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed whitespace-pre-wrap line-clamp-6">{templatePreview.defaultRequirements}</p>
                </div>
              )}

              {/* ── Target Audience ── */}
              {(templatePreview.targetAudience || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">الجمهور المستهدف ({(templatePreview.targetAudience || []).length} فئة):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(templatePreview.targetAudience || []).map((a: any, i: number) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5">{a.group}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Team Members ── */}
              {(templatePreview.defaultTeamMembers || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">فريق العمل ({(templatePreview.defaultTeamMembers || []).length} أعضاء):</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(templatePreview.defaultTeamMembers || []).map((m: any, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <p className="text-xs font-medium text-gray-800">{m.role}</p>
                        <p className="text-[10px] text-gray-400">{m.experience}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Payment Schedule ── */}
              {(templatePreview.defaultPaymentSchedule || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">جدول الدفعات ({(templatePreview.defaultPaymentSchedule || []).length} مراحل):</p>
                  <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 overflow-hidden">
                    {(templatePreview.defaultPaymentSchedule || []).map((m: any, i: number) => (
                      <div key={i} className="flex justify-between items-center px-3 py-1.5">
                        <p className="text-xs text-gray-700">{m.milestone}</p>
                        <span className="text-xs font-bold text-[#ff6a00] bg-orange-50 rounded-full px-2 py-0.5">{m.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Items ── */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1.5">بنود العرض:</p>
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 overflow-hidden max-h-48 overflow-y-auto">
                  {(templatePreview.items || []).map((item: any, idx: number) => (
                    <div key={idx} className={`flex justify-between px-3 py-2 ${item.isOptional ? 'opacity-60' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{item.title}{item.isOptional && <span className="text-[10px] text-gray-400 mr-1">(اختياري)</span>}</p>
                        {item.sectionName && <p className="text-[10px] text-gray-400">{item.sectionName}</p>}
                      </div>
                      <p className="text-xs font-semibold text-gray-900 mr-2 shrink-0">{parseFloat(item.unitPrice || "0").toLocaleString()} ريال</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                  <p className="text-xs text-gray-500">الإجمالي قبل الضريبة:</p>
                  <p className="text-sm font-bold text-gray-800">{(templatePreview.items || []).filter((i: any) => !i.isOptional).reduce((s: number, i: any) => s + parseFloat(i.unitPrice || "0") * parseFloat(i.quantity || "1"), 0).toLocaleString()} ريال</p>
                </div>
              </div>

              {/* ── Terms ── */}
              {templatePreview.defaultTerms && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">الشروط والأحكام:</p>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap leading-relaxed">{templatePreview.defaultTerms}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 border-t pt-3 shrink-0">
            <Button variant="outline" onClick={() => setTemplatePreview(null)}>إلغاء</Button>
            <Button onClick={() => applyTemplate(templatePreview, true)} className="bg-[#ff6a00] hover:bg-[#ff8c00] text-white gap-2">
              <CheckCircle className="h-4 w-4" /> تطبيق هذا القالب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ SERVICE LIBRARY MODAL ═══════════════════ */}
      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="text-right flex items-center gap-2"><Library className="h-5 w-5 text-[#ff6a00]" /> مكتبة الخدمات الجاهزة</DialogTitle><DialogDescription className="sr-only">اختر خدمات جاهزة لإضافتها للعرض</DialogDescription></DialogHeader>
          <div className="flex-shrink-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={librarySearch} onChange={e => setLibrarySearch(e.target.value)} placeholder="ابحث في الخدمات..." className="pr-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredLibrary.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => { addFromLibrary(item); }}
                  className="p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 text-right transition-all flex items-center gap-3 group"
                  data-testid={`library-item-${item.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.title}</p>
                    {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-sm font-bold text-[#ff6a00]">{parseFloat(item.unitPrice || "0").toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{UNIT_LABELS[item.unit] || item.unit}</p>
                  </div>
                  <Plus className="h-4 w-4 text-[#ff6a00] opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </button>
              ))}
              {filteredLibrary.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8 col-span-2">لا توجد خدمات مطابقة</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLibrary(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ EMAIL DIALOG ═══════════════════ */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle className="text-right">إرسال العرض بالبريد الإلكتروني</DialogTitle><DialogDescription className="sr-only">أدخل بيانات البريد الإلكتروني لإرسال العرض</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label className="mb-1.5 block text-sm">البريد الإلكتروني للمستلم</Label><Input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))} placeholder="example@company.com" type="email" /></div>
            <div><Label className="mb-1.5 block text-sm">الموضوع</Label><Input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} /></div>
            <div><Label className="mb-1.5 block text-sm">رسالة مرافقة</Label><Textarea value={emailForm.message} onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>إلغاء</Button>
            <Button onClick={() => emailProposal && sendEmailMutation.mutate({ id: emailProposal.id, data: emailForm })} disabled={sendEmailMutation.isPending} className="gap-2 bg-[#ff6a00] hover:bg-[#ff8c00] text-white">
              {sendEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              إرسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ SHARE LINK ═══════════════════ */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader><DialogTitle className="text-right">رابط العرض للعميل</DialogTitle><DialogDescription className="sr-only">شارك هذا الرابط مع العميل لمشاهدة العرض</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">شارك هذا الرابط مع العميل ليتمكن من مشاهدة العرض والتوقيع عليه رقمياً:</p>
            <div className="flex gap-2">
              <Input value={shareLink || ""} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={() => { navigator.clipboard?.writeText(shareLink || ""); toast({ title: "تم النسخ" }); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild className="w-full gap-2 bg-[#ff6a00] hover:bg-[#ff8c00] text-white">
              <a href={shareLink || "#"} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /> معاينة كالعميل</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
