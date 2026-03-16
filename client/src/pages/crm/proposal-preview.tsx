import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Printer, CheckCircle, XCircle, Eye, PenLine, CalendarDays,
  Shield, Star, AlertTriangle,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", pending_approval: "بانتظار الموافقة", approved: "معتمد",
  sent: "مرسل", viewed: "تمت المشاهدة", accepted: "مقبول", rejected: "مرفوض",
  expired: "منتهي الصلاحية",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700", sent: "bg-indigo-100 text-indigo-700",
  viewed: "bg-purple-100 text-purple-700", accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700", expired: "bg-rose-100 text-rose-700",
};

// ─── ProposalDocument ─────────────────────────────────────────────────────────
function ProposalDocument({ proposal, showOptional = true }: { proposal: any; showOptional?: boolean }) {
  const items: any[] = proposal.items || [];
  const requiredItems = items.filter(i => !i.isOptional);
  const optionalItems = items.filter(i => i.isOptional);
  const paymentSchedule: any[] = proposal.paymentSchedule || [];

  const subtotal = parseFloat(proposal.subtotal || "0");
  const discount = parseFloat(proposal.discountValue || "0");
  const tax = parseFloat(proposal.taxAmount || "0");
  const total = parseFloat(proposal.total || "0");
  const currency = proposal.currency || "SAR";

  // Group required items by sectionName
  const sections = requiredItems.reduce((acc: Record<string, any[]>, item) => {
    const section = item.sectionName || "__default__";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const hasSections = Object.keys(sections).some(k => k !== "__default__");

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none max-w-4xl mx-auto" id="proposal-doc">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-800 to-blue-950 text-white p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">عرض سعر</h1>
            <p className="text-blue-300 text-sm">Quotation / Proposal</p>
          </div>
          <div className="text-left">
            <p className="text-blue-300 text-xs mb-1">رقم العرض</p>
            <p className="text-2xl font-bold tracking-wide">{proposal.proposalNumber || "—"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-blue-300 text-xs mb-0.5">تاريخ الإصدار</p>
            <p>{new Date(proposal.issueDate || proposal.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          {proposal.expiryDate && (
            <div>
              <p className="text-blue-300 text-xs mb-0.5">تاريخ الانتهاء</p>
              <p className={new Date(proposal.expiryDate) < new Date() ? "text-red-300" : ""}>{new Date(proposal.expiryDate).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          )}
          <div>
            <p className="text-blue-300 text-xs mb-0.5">الحالة</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[proposal.status] || "bg-white/20 text-white"}`}>
              {STATUS_LABELS[proposal.status] || proposal.status}
            </span>
          </div>
          {proposal.viewCount > 0 && (
            <div>
              <p className="text-blue-300 text-xs mb-0.5">المشاهدات</p>
              <p className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-blue-300" /> {proposal.viewCount}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* Title */}
        <div className="mb-8 pb-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{proposal.title}</h2>
          {proposal.company && <p className="text-gray-500 text-sm">مُقدَّم إلى: {proposal.company.name}</p>}
          {proposal.contact && <p className="text-gray-400 text-sm">الشخص المعني: {proposal.contact.firstName} {proposal.contact.lastName}</p>}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="h-5 w-1 bg-blue-600 rounded-full inline-block"></span>
            بنود العرض
          </h3>

          {hasSections ? (
            // Grouped by sections
            Object.entries(sections).map(([sectionKey, sectionItems]) => (
              <div key={sectionKey} className="mb-4">
                {sectionKey !== "__default__" && (
                  <div className="bg-blue-50 px-4 py-2 border-r-4 border-blue-500 mb-1 rounded-r">
                    <p className="text-sm font-bold text-blue-800">{sectionKey}</p>
                  </div>
                )}
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-right py-2.5 px-4 font-semibold text-gray-600 w-8">#</th>
                        <th className="text-right py-2.5 px-4 font-semibold text-gray-600">البند</th>
                        <th className="text-right py-2.5 px-4 font-semibold text-gray-600 w-20">الكمية</th>
                        <th className="text-right py-2.5 px-4 font-semibold text-gray-600 w-28">سعر الوحدة</th>
                        <th className="text-right py-2.5 px-4 font-semibold text-gray-600 w-28">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sectionItems.map((item: any, i: number) => (
                        <tr key={item.id || i}>
                          <td className="py-3 px-4 text-gray-400 font-mono text-xs">{i + 1}</td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{item.title}</p>
                            {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{parseFloat(item.quantity || "1").toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-600">{parseFloat(item.unitPrice || "0").toLocaleString()} {currency}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{parseFloat(item.lineTotal || "0").toLocaleString()} {currency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            // Flat list
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 w-8">#</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">البند</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 w-20">الكمية</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 w-28">سعر الوحدة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 w-28">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requiredItems.map((item: any, i: number) => (
                    <tr key={item.id || i} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-400 font-mono text-xs">{i + 1}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{parseFloat(item.quantity || "1").toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{parseFloat(item.unitPrice || "0").toLocaleString()} {currency}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{parseFloat(item.lineTotal || "0").toLocaleString()} {currency}</td>
                    </tr>
                  ))}
                  {requiredItems.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-gray-400 text-sm">لا توجد بنود إلزامية</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Optional Items */}
          {showOptional && optionalItems.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-bold text-amber-700">البنود الاختيارية (خيارات إضافية)</p>
              </div>
              <div className="rounded-xl overflow-hidden border border-amber-200 border-dashed">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-amber-100">
                    {optionalItems.map((item: any, i: number) => (
                      <tr key={item.id || i} className="bg-amber-50/30">
                        <td className="py-2.5 px-4 text-amber-400 font-mono text-xs">{i + 1}</td>
                        <td className="py-2.5 px-4">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                        </td>
                        <td className="py-2.5 px-4 text-gray-600">{parseFloat(item.quantity || "1").toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-gray-600">{parseFloat(item.unitPrice || "0").toLocaleString()} {currency}</td>
                        <td className="py-2.5 px-4 font-semibold text-amber-700">{parseFloat(item.lineTotal || "0").toLocaleString()} {currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-amber-600 mt-1.5">* البنود الاختيارية لا تُحتسب في الإجمالي النهائي</p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm py-1 text-gray-600">
              <span>المجموع الفرعي</span>
              <span>{subtotal.toLocaleString()} {currency}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm py-1 text-red-600">
                <span>الخصم</span><span>- {discount.toLocaleString()} {currency}</span>
              </div>
            )}
            <div className="flex justify-between text-sm py-1 text-gray-600">
              <span>ضريبة القيمة المضافة ({proposal.taxPercent || 15}%)</span>
              <span>{tax.toLocaleString()} {currency}</span>
            </div>
            <div className="flex justify-between font-bold text-xl py-3 border-t-2 border-gray-200 text-blue-800">
              <span>الإجمالي النهائي</span>
              <span>{total.toLocaleString()} {currency}</span>
            </div>
          </div>
        </div>

        {/* Payment Schedule */}
        {paymentSchedule.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="h-5 w-1 bg-green-500 rounded-full inline-block"></span>
              جدول الدفعات
            </h4>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-600">الدفعة</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-600 w-20">النسبة</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-600 w-32">المبلغ</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-gray-600 w-36">الاستحقاق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paymentSchedule.filter((m: any) => m.label).map((m: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 font-medium text-gray-900">{m.label}</td>
                      <td className="py-2.5 px-4 text-gray-600">{m.percent}%</td>
                      <td className="py-2.5 px-4 font-semibold text-green-700">
                        {((parseFloat(m.percent) || 0) * total / 100).toLocaleString()} {currency}
                      </td>
                      <td className="py-2.5 px-4 text-gray-500">
                        {m.dueDate ? new Date(m.dueDate).toLocaleDateString("ar-SA") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Terms */}
        {proposal.termsAndNotes && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-2">الشروط والملاحظات</h4>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{proposal.termsAndNotes}</p>
          </div>
        )}

        {/* Signature Block */}
        {proposal.clientSignature && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-800 text-sm">تم التوقيع رقمياً</p>
                <p className="text-sm text-green-700 mt-0.5">وقّع العميل: <strong>{proposal.clientSignature}</strong></p>
                {proposal.signedAt && <p className="text-xs text-green-600 mt-0.5">بتاريخ: {new Date(proposal.signedAt).toLocaleString("ar-SA")}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-5 text-center text-xs text-gray-400">
          <p>تم إنشاء هذا العرض بواسطة Softlix Business OS</p>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Preview (by ID, authenticated) ─────────────────────────────────────
export function ProposalPreviewById() {
  const [, params] = useRoute("/crm/proposals/:id/preview");
  const id = params?.id!;
  const { data: proposal, isLoading } = useQuery<any>({
    queryKey: [`/api/crm/proposals/${id}`],
    queryFn: () => apiRequest("GET", `/api/crm/proposals/${id}`).then(r => r.json()),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
  if (!proposal) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><p className="text-gray-500">العرض غير موجود</p></div>
    </div>
  );

  const isExpired = proposal.expiryDate && new Date(proposal.expiryDate) < new Date() && !["accepted", "rejected"].includes(proposal.status);
  const daysLeft = proposal.expiryDate ? Math.ceil((new Date(proposal.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Admin Controls */}
        <div className="mb-4 flex items-center justify-between print:hidden bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div>
            <h1 className="font-bold text-gray-900 text-sm">{proposal.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{proposal.proposalNumber}</span>
              {proposal.viewCount > 0 && (
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {proposal.viewCount} مشاهدة
                </span>
              )}
              {proposal.clientSignature && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> موقّع: {proposal.clientSignature}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>رجوع</Button>
            <Button size="sm" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> طباعة / PDF
            </Button>
          </div>
        </div>

        {/* Expiry Warning */}
        {isExpired && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 print:hidden">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">انتهت صلاحية هذا العرض. يُنصح بتحديث تاريخ الانتهاء وإعادة الإرسال.</p>
          </div>
        )}
        {!isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 print:hidden">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">تنتهي صلاحية العرض خلال {daysLeft === 0 ? "اليوم" : `${daysLeft} أيام`}. تأكد من متابعة العميل.</p>
          </div>
        )}

        <ProposalDocument proposal={proposal} />
      </div>
    </div>
  );
}

// ─── Public View (by token, no auth) ─────────────────────────────────────────
export function ProposalPublicView() {
  const [, params] = useRoute("/proposal/:token");
  const token = params?.token!;
  const { toast } = useToast();

  const [action, setAction] = useState<"accepted" | "rejected" | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureName, setSignatureName] = useState("");

  const { data: proposal, isLoading, error } = useQuery<any>({
    queryKey: ["/api/public/proposal", token],
    queryFn: () => fetch(`/api/public/proposal/${token}`).then(r => r.ok ? r.json() : Promise.reject("not-found")),
  });

  const respondMutation = useMutation({
    mutationFn: (act: "accepted" | "rejected") =>
      fetch(`/api/public/proposal/${token}/respond`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act }),
      }).then(r => r.json()),
    onSuccess: (_, act) => { setAction(act); },
    onError: () => toast({ title: "خطأ في الإرسال", variant: "destructive" }),
  });

  const signMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/public/proposal/${token}/sign`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signatureName }),
      }).then(r => r.json()),
    onSuccess: () => { setAction("accepted"); setShowSignature(false); },
    onError: (e: any) => toast({ title: "خطأ في التوقيع", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (error || !proposal) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm mx-auto px-4">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">العرض غير متاح</h2>
        <p className="text-gray-500">قد يكون الرابط منتهي الصلاحية أو غير صحيح</p>
      </div>
    </div>
  );

  // Already signed/responded
  if (action === "accepted" || proposal.status === "accepted") return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">شكراً لك!</h2>
        <p className="text-gray-600 mb-4">تم قبول عرض السعر بنجاح.</p>
        {(proposal.clientSignature || signatureName) && (
          <div className="bg-white rounded-xl border border-green-200 p-4 text-right">
            <p className="text-sm text-gray-500">التوقيع الرقمي</p>
            <p className="font-bold text-gray-900 text-lg">{proposal.clientSignature || signatureName}</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleString("ar-SA")}</p>
          </div>
        )}
        <p className="text-gray-500 text-sm mt-4">سيتواصل معك فريقنا قريباً لاتخاذ الخطوات التالية.</p>
      </div>
    </div>
  );

  if (action === "rejected" || proposal.status === "rejected") return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md mx-auto">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تم تسجيل ردك</h2>
        <p className="text-gray-600">شكراً على وقتك. يسعدنا خدمتك مستقبلاً.</p>
      </div>
    </div>
  );

  const isExpired = proposal.expiryDate && new Date(proposal.expiryDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Print Button */}
        <div className="mb-4 flex justify-between items-center print:hidden">
          <p className="text-sm text-gray-500">يمكنك مراجعة العرض أدناه والرد عليه</p>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> طباعة
          </Button>
        </div>

        {isExpired && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 print:hidden">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">انتهت صلاحية هذا العرض. يرجى التواصل مع فريق المبيعات للحصول على عرض محدّث.</p>
          </div>
        )}

        <ProposalDocument proposal={proposal} showOptional={true} />

        {/* Action Buttons */}
        {!isExpired && !["accepted", "rejected"].includes(proposal.status) && (
          <div className="mt-8 print:hidden" dir="rtl">
            {!showSignature ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 text-center mb-2">ردك على العرض</h3>
                <p className="text-sm text-gray-500 text-center mb-6">يُرجى مراجعة العرض واختيار ردك</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    className="bg-green-600 hover:bg-green-700 gap-2 px-8 py-3 text-base"
                    onClick={() => setShowSignature(true)}
                    disabled={respondMutation.isPending}
                    data-testid="btn-accept"
                  >
                    <PenLine className="h-5 w-5" /> قبول العرض والتوقيع
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 gap-2 px-8 py-3 text-base"
                    onClick={() => respondMutation.mutate("rejected")}
                    disabled={respondMutation.isPending}
                    data-testid="btn-reject"
                  >
                    {respondMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                    رفض العرض
                  </Button>
                </div>
              </div>
            ) : (
              // Digital Signature Form
              <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6" data-testid="signature-section">
                <div className="flex items-center gap-3 mb-5">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">التوقيع الرقمي</h3>
                    <p className="text-xs text-gray-500">أدخل اسمك الكامل كتوقيع إلكتروني ملزم قانونياً</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">الاسم الكامل *</Label>
                    <Input
                      value={signatureName}
                      onChange={e => setSignatureName(e.target.value)}
                      placeholder="أدخل اسمك الكامل كما هو في الهوية"
                      className="text-lg h-12 text-center font-medium"
                      data-testid="input-signature"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
                    <p>بإدخال اسمك والضغط على "أوافق وأوقع"، فإنك توافق على شروط عرض السعر رقم {proposal.proposalNumber} وتقبله بصفة ملزمة قانونياً.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowSignature(false)} className="flex-1">رجوع</Button>
                    <Button
                      onClick={() => {
                        if (!signatureName.trim()) { toast({ title: "يرجى إدخال اسمك", variant: "destructive" }); return; }
                        signMutation.mutate();
                      }}
                      disabled={signMutation.isPending || !signatureName.trim()}
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                      data-testid="btn-sign-confirm"
                    >
                      {signMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      أوافق وأوقع
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
