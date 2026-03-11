import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, Download, CheckCircle, XCircle } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", pending_approval: "بانتظار الموافقة", approved: "معتمد",
  sent: "مرسل", viewed: "تمت المشاهدة", accepted: "مقبول", rejected: "مرفوض",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", sent: "bg-blue-100 text-blue-700",
  viewed: "bg-purple-100 text-purple-700", accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function ProposalDocument({ proposal }: { proposal: any }) {
  const items = proposal.items || [];
  const subtotal = parseFloat(proposal.subtotal || "0");
  const discount = parseFloat(proposal.discountValue || "0");
  const tax = parseFloat(proposal.taxAmount || "0");
  const total = parseFloat(proposal.total || "0");
  const currency = proposal.currency || "SAR";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none max-w-3xl mx-auto" id="proposal-doc">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-700 to-blue-900 text-white p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">عرض سعر</h1>
            <p className="text-blue-200 text-sm">Quotation / Proposal</p>
          </div>
          <div className="text-left">
            <p className="text-blue-200 text-xs mb-1">رقم العرض</p>
            <p className="text-xl font-bold tracking-wide">{proposal.proposalNumber || "—"}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-300 text-xs mb-0.5">تاريخ الإصدار</p>
            <p>{new Date(proposal.issueDate || proposal.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          {proposal.expiryDate && (
            <div>
              <p className="text-blue-300 text-xs mb-0.5">تاريخ الانتهاء</p>
              <p>{new Date(proposal.expiryDate).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          )}
          <div>
            <p className="text-blue-300 text-xs mb-0.5">الحالة</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[proposal.status] || "bg-white/20 text-white"}`}>
              {STATUS_LABELS[proposal.status] || proposal.status}
            </span>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Title */}
        <div className="mb-8 pb-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{proposal.title}</h2>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-700 mb-3">بنود العرض</h3>
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">#</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">البند</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 w-20">الكمية</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 w-28">سعر الوحدة</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 w-28">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item: any, i: number) => (
                  <tr key={item.id || i} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-400 font-mono">{i + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{parseFloat(item.quantity || "1").toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{parseFloat(item.unitPrice || "0").toLocaleString()} {currency}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{parseFloat(item.lineTotal || "0").toLocaleString()} {currency}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400">لا توجد بنود</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm py-1 text-gray-600">
              <span>المجموع الفرعي</span>
              <span>{subtotal.toLocaleString()} {currency}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm py-1 text-red-600">
                <span>الخصم</span>
                <span>- {discount.toLocaleString()} {currency}</span>
              </div>
            )}
            <div className="flex justify-between text-sm py-1 text-gray-600">
              <span>ضريبة القيمة المضافة ({proposal.taxPercent || 15}%)</span>
              <span>{tax.toLocaleString()} {currency}</span>
            </div>
            <div className="flex justify-between font-bold text-lg py-3 border-t-2 border-gray-200 text-blue-700">
              <span>الإجمالي النهائي</span>
              <span>{total.toLocaleString()} {currency}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {proposal.termsAndNotes && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-2">الشروط والملاحظات</h4>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{proposal.termsAndNotes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          <p>تم إنشاء هذا العرض بواسطة Softlix Business OS</p>
        </div>
      </div>
    </div>
  );
}

// Full preview page (by proposal ID, authenticated)
export function ProposalPreviewById() {
  const [, params] = useRoute("/crm/proposals/:id/preview");
  const id = params?.id!;
  const { data: proposal, isLoading } = useQuery<any>({ queryKey: [`/api/crm/proposals/${id}`] });

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4" dir="rtl">
      {/* Print Controls - hidden when printing */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-bold text-gray-900">{proposal.title}</h1>
          <p className="text-sm text-gray-500">{proposal.proposalNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>رجوع</Button>
          <Button size="sm" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            طباعة / PDF
          </Button>
        </div>
      </div>
      <ProposalDocument proposal={proposal} />
    </div>
  );
}

// Public proposal view (by token, no auth)
export function ProposalPublicView() {
  const [, params] = useRoute("/proposal/:token");
  const token = params?.token!;
  const [response, setResponse] = useState<"accepted" | "rejected" | null>(null);

  const { data: proposal, isLoading, error } = useQuery<any>({
    queryKey: ["/api/public/proposal", token],
    queryFn: () => fetch(`/api/public/proposal/${token}`).then(r => r.ok ? r.json() : Promise.reject("not-found")),
  });

  const handleResponse = async (action: "accepted" | "rejected") => {
    setResponse(action);
  };

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4" dir="rtl">
      {response ? (
        <div className="max-w-md mx-auto mt-20 text-center">
          {response === "accepted" ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">شكراً لك!</h2>
              <p className="text-gray-600">تم قبول العرض بنجاح. سنتواصل معك قريباً.</p>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تم تسجيل ردك</h2>
              <p className="text-gray-600">تم رفض العرض. يسعدنا خدمتك مستقبلاً.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
            <div />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                <Printer className="h-4 w-4" />
                طباعة
              </Button>
            </div>
          </div>
          <ProposalDocument proposal={proposal} />
          {/* Client response buttons */}
          {proposal.status !== "accepted" && proposal.status !== "rejected" && (
            <div className="max-w-3xl mx-auto mt-6 flex gap-4 justify-center print:hidden">
              <Button className="bg-green-600 hover:bg-green-700 gap-2 px-8" onClick={() => handleResponse("accepted")}>
                <CheckCircle className="h-5 w-5" />
                قبول العرض
              </Button>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-2 px-8" onClick={() => handleResponse("rejected")}>
                <XCircle className="h-5 w-5" />
                رفض العرض
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
