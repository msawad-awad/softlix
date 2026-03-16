import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Printer, CheckCircle, XCircle, Eye, AlertTriangle,
  Shield,
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

const CONFIDENTIALITY_TEXT = `يتضمن هذا الاقتراح والأدوات الداعمة معلومات سرية عن الأعمال التجارية لشركة سوفت لكس. يجوز طبع هذا الملف أو نسخه لاستخدامه في تقييم المشروع المقترح، ولكن لا ينبغي تقاسمها مع طرف آخر.

يوافق متلقي هذه الوثيقة على اعتبار المعلومات الواردة في هذا المستند سرية ومملوكة لشركة سوفت لكس. لا يجوز للمستلم استخدام المعلومات السرية بخلاف أعماله مع سوفت لكس ويجب الكشف عنها فقط لمسؤوليه أو مديريه أو موظفيه الذين لديهم حاجة محددة إلى معرفتها. لن يقوم المستلم بالإفصاح عن أي من المعلومات السرية الواردة من سوفت لكس أو نشرها أو الكشف عنها بأي طريقة أخرى إلى أي طرف آخر على الإطلاق باستثناء الحصول على إذن كتابي مسبق محدد من سوفت لكس.

جميع المستندات المقدمة من سوفت لكس محمية بحقوق الطبع والنشر و/أو محمية من أي تغييرات أو تعديلات أو أي نوع آخر من الاستخدام خارج النطاق المحدد بين سوفت لكس والمستلم. تحتفظ سوفت لكس بجميع حقوق الملكية وحقوق الملكية الفكرية للمعلومات الواردة هنا، بما في ذلك جميع الوثائق الداعمة. بقبول هذا المستند، يوافق المستلم على الالتزام بالبيان المذكور أعلاه.`;

const DEFAULT_INTRO_TEXT = `تقدم سوفت لكس بفخر خدماتها المهنية في تطوير تطبيقات الهاتف المحمول وأنظمة الويب المتكاملة. نسعى إلى تطوير حلول رقمية متكاملة تُؤتمِت جميع الخدمات والعمليات الحالية في الأعمال وتبني سير عمل سلس بين جميع الأطراف المشاركة.

الخدمات المقترحة قابلة للتطوير ومصممة لتلبية أهدافك الاستراتيجية. ستقدم لك سوفت لكس خدماتها المهنية وخبرتها الواسعة في مجالات العمليات التجارية وخدمات التطبيق الإلكتروني، إذ تمتلك شركتنا رأس المال البشري من الخبراء ذوي المهارات العالية في البرمجة وتصميم تجربة المستخدم والاستشارات التجارية.

نتطلع إلى شراكة ناجحة معكم لتحقيق الأهداف الاستراتيجية وتقديم حل تقني يلبي تطلعاتكم ويفوق توقعاتكم.`;

const DEFAULT_TERMS = `1. جميع الأسعار المعروضة بموجب هذا الاقتراح غير شاملة ضريبة القيمة المضافة.

2. تكون المدفوعات صافية ومستحقة في غضون 5 أيام عمل من تسليم فاتورة سوفت لكس.

3. الاقتباس الوارد في الاقتراح صالح للمدة المحددة ابتداءً من تاريخ هذه الوثيقة. بعد فترة انتهاء الصلاحية وقبل قبول العرض يتم التوقيع عليها وتُعدّ عقداً رسمياً لبدء العمل.

4. تحدد وثيقة الاقتراح هذه العرض الأولي لشركة سوفت لكس لشركتكم الموقرة، والتي بموجبها ستبدأ كلتا الشركتين تبادل المعلومات التفصيلية وإجراء المناقشات للوصول إلى اقتراح واتفاق نهائي.

5. يلزم تعبئة 10 أيام عمل لبدء المشروع بعد إصدار أوامر الشراء أو توقيع العقد.

6. في حال تمت الموافقة على الوثيقة يتم تحويلها إلى عقد رسمي.

7. لا تمتد صلاحية هذا الاقتراح ما لم يتفق الطرفان على خلاف ذلك كتابةً.

8. تحتفظ سوفت لكس بالحق في تغيير أي جزء من عرض الأسعار إذا كان يحتوي على أخطاء أو سهو قبل التوقيع من قبل العميل.`;

const TEAM_BIOS: Record<string, { title: string; bio: string }> = {
  "مدير المشروع": {
    title: "Project Manager",
    bio: "يتمتع مدير المشروع بخبرة 5 سنوات في المتوسط في مجال تطوير البرمجيات الرشيقة، وهو حاصل على شهادة محترف إدارة المشاريع (PMP). مسؤول عن تخطيط مشروع الحلول البرمجية المعقدة مع فهم متعمق لتبعيات العميل وتبعيات البرامج، ويدير أنشطة المشروع عبر جميع مراحله بما في ذلك البدء والتخطيط والتصميم والتطوير ومراقبة الجودة والإطلاق والصيانة.",
  },
  "محلل الأعمال": {
    title: "Business Analyst",
    bio: "محلل الأعمال لديه متوسط 6 سنوات من الخبرة في تحليل الأعمال لمنتجات البرمجيات. يتمتع بمهارات تحليلية قوية تؤهله لتقديم استكشاف تكراري ومنهجي لبيانات المنظمة مع التركيز على التحليل الإحصائي. يُستخدم تحليل الأعمال من قبل الشركات الملتزمة باتخاذ القرارات القائمة على البيانات.",
  },
  "مصمم UX": {
    title: "UX/UI Designer",
    bio: "يتمتع مدير تجربة المستخدم بمتوسط 9 سنوات من الخبرة المهنية في إدارة المنتجات وتصميم تجربة المستخدم. تتمثل مهمته الرئيسية في إجراء بحث المستخدم ومقابلات واستطلاعات، ثم استخدام المعلومات المجمعة لإنشاء خرائط المواقع والإطارات السلكية والنماذج الأولية.",
  },
  "مطور كبير": {
    title: "Senior Developer",
    bio: "مطور كبير لديه متوسط 6 سنوات من الخبرة المهنية في تطوير البرمجيات. يمتلك فهماً عميقاً لأهداف التكنولوجيا والأعمال لإنشاء حلول من خلال تطوير وتنفيذ وصيانة برامج الهاتف المحمول وخدمات الويب بأعلى معايير الجودة.",
  },
  "مهندس QA": {
    title: "QA Engineer",
    bio: "يتمتع مهندس مراقبة الجودة بمتوسط 3 سنوات من الخبرة المهنية في اختبار منتجات البرمجيات. يطبق حالات الاختبار الشاملة على منتج البرنامج لضمان أعلى مستويات الجودة قبل الإطلاق.",
  },
};

// ─── Page wrapper ─────────────────────────────────────────────────────────────
function DocPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white relative ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto 20px",
        padding: "20mm 18mm",
        boxSizing: "border-box",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        breakAfter: "page",
        pageBreakAfter: "always",
      }}
    >
      {children}
    </div>
  );
}

// ─── Header bar reused across pages ──────────────────────────────────────────
function PageHeader({ proposalNumber, date }: { proposalNumber: string; date: string }) {
  return (
    <div
      className="flex items-center justify-between mb-8 pb-4 border-b-2"
      style={{ borderColor: "#1e3a8a" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs"
          style={{ background: "linear-gradient(135deg,#1e3a8a,#3b82f6)" }}
        >
          SX
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">شركة سوفت لكس لتقنية المعلومات</p>
          <p className="text-xs text-gray-400">Softlix Information Technology</p>
        </div>
      </div>
      <div className="text-left text-xs text-gray-400">
        <p>{proposalNumber}</p>
        <p>{date}</p>
      </div>
    </div>
  );
}

function PageFooter({ page, total }: { page: number; total: number }) {
  return (
    <div
      className="absolute bottom-6 left-0 right-0 px-18 flex items-center justify-between text-xs text-gray-400"
      style={{ padding: "0 18mm" }}
    >
      <p>شكراً لاختياركم سوفت لكس</p>
      <p>{page} / {total}</p>
    </div>
  );
}

function SectionTitle({ ar, en }: { ar: string; en?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(to bottom,#1e3a8a,#3b82f6)" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#1e3a8a" }}>{ar}</h2>
          {en && <p className="text-xs text-gray-400">{en}</p>}
        </div>
      </div>
      <div className="h-px mt-3" style={{ background: "linear-gradient(to left,transparent,#93c5fd,transparent)" }} />
    </div>
  );
}

// ─── ProposalDocument ─────────────────────────────────────────────────────────
export function ProposalDocument({ proposal, showOptional = true }: { proposal: any; showOptional?: boolean }) {
  const items: any[] = proposal.items || [];
  const requiredItems = items.filter((i: any) => !i.isOptional);
  const optionalItems = items.filter((i: any) => i.isOptional);
  const paymentSchedule: any[] = proposal.paymentSchedule || [];
  const teamMembers: any[] = proposal.teamMembers || [];
  const selectedTechnologies: any[] = proposal.selectedTechnologies || [];
  const targetAudience: any[] = proposal.targetAudience || [];
  const deliverables: any[] = proposal.deliverables || [];

  const subtotal = parseFloat(proposal.subtotal || "0");
  const discount = parseFloat(proposal.discountValue || "0");
  const tax = parseFloat(proposal.taxAmount || "0");
  const total = parseFloat(proposal.total || "0");
  const currency = proposal.currency || "SAR";

  const issueDate = new Date(proposal.issueDate || proposal.createdAt);
  const issueDateStr = issueDate.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const issueDateShort = issueDate.toLocaleDateString("ar-SA");
  const proposalNumber = proposal.proposalNumber || "—";
  const clientName = proposal.company?.name || proposal.contact
    ? `${proposal.contact?.firstName || ""} ${proposal.contact?.lastName || ""}`.trim()
    : "العميل الكريم";

  const authorName = proposal.authorName || "مهند العشري";
  const authorTitle = proposal.authorTitle || "مدير تطوير الأعمال";
  const approverName = proposal.approverName || "علاء الصبحي";
  const approverTitle = proposal.approverTitle || "م/ البرمجيات";
  const timelineDays = proposal.timelineDays || 65;
  const introText = proposal.introText || DEFAULT_INTRO_TEXT;
  const requirements = proposal.requirements || "";
  const termsAndNotes = proposal.termsAndNotes || DEFAULT_TERMS;
  const validityDays = proposal.validityDays || 10;

  // Group required items by section
  const sections = requiredItems.reduce((acc: Record<string, any[]>, item: any) => {
    const s = item.sectionName || "__default__";
    if (!acc[s]) acc[s] = [];
    acc[s].push(item);
    return acc;
  }, {});
  const hasSections = Object.keys(sections).some(k => k !== "__default__");

  const TOTAL_PAGES = 12;
  const H = ({ p }: { p: number }) => <PageHeader proposalNumber={proposalNumber} date={issueDateShort} />;
  const F = ({ p }: { p: number }) => <PageFooter page={p} total={TOTAL_PAGES} />;

  // ── Tech grouped by category ────────────────────────────────────────────────
  const techByCategory = selectedTechnologies.reduce((acc: Record<string, any[]>, t: any) => {
    const cat = t.category || "عام";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'Segoe UI', 'Arial', sans-serif" }}
      id="proposal-doc"
    >
      {/* ── PAGE 1: COVER ────────────────────────────────────────────────── */}
      <div
        className="relative text-white flex flex-col"
        style={{
          width: "210mm",
          minHeight: "297mm",
          margin: "0 auto 20px",
          background: "linear-gradient(160deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%)",
          boxSizing: "border-box",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          pageBreakAfter: "always",
        }}
      >
        {/* Top ribbon */}
        <div className="h-2" style={{ background: "linear-gradient(to right,#60a5fa,#3b82f6,#1d4ed8)" }} />

        {/* Logo area */}
        <div className="px-16 pt-12 pb-8 border-b" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-2xl font-black text-white">SX</span>
            </div>
            <div>
              <p className="text-xl font-bold">سوفت لكس</p>
              <p className="text-blue-300 text-sm">Softlix Information Technology</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-16 py-12 text-center">
          {/* Proposal label */}
          <div
            className="px-6 py-2 rounded-full text-sm font-semibold mb-8 border"
            style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)" }}
          >
            {issueDateStr} &nbsp;|&nbsp; {proposalNumber}
          </div>

          <h1 className="text-4xl font-black mb-4 leading-tight" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
            العرض التقني والمالي
          </h1>
          <div className="w-24 h-1 rounded-full bg-blue-400 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold text-blue-200 mb-4 leading-relaxed">{proposal.title}</h2>

          {(proposal.company || proposal.contact) && (
            <div className="mt-4 px-8 py-3 rounded-xl text-sm" style={{ background: "rgba(255,255,255,0.08)" }}>
              <p className="text-blue-300 text-xs mb-1">مُقدَّم إلى</p>
              <p className="font-bold">{clientName}</p>
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div
          className="px-16 py-8 border-t grid grid-cols-3 gap-4 text-sm"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          <div>
            <p className="text-blue-400 text-xs mb-1">رقم العرض</p>
            <p className="font-bold">{proposalNumber}</p>
          </div>
          <div>
            <p className="text-blue-400 text-xs mb-1">تاريخ الإصدار</p>
            <p className="font-bold">{issueDateStr}</p>
          </div>
          <div>
            <p className="text-blue-400 text-xs mb-1">صالح لمدة</p>
            <p className="font-bold">{validityDays} يوم</p>
          </div>
        </div>

        {/* Bottom ribbon */}
        <div className="h-2" style={{ background: "linear-gradient(to right,#1d4ed8,#3b82f6,#60a5fa)" }} />
      </div>

      {/* ── PAGE 2: CONFIDENTIALITY ─────────────────────────────────────── */}
      <DocPage>
        <H p={1} />
        <SectionTitle ar="بيان السرية" en="Confidentiality Statement" />
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1px solid #bfdbfe" }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#1e3a8a,#3b82f6)" }}
            >
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">معلومات سرية وخاصة</h3>
              <p className="text-sm text-gray-600">Confidential & Proprietary Information</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{CONFIDENTIALITY_TEXT}</p>
        </div>

        {/* Copyright note */}
        <div className="rounded-xl p-4 mt-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} شركة سوفت لكس لتقنية المعلومات — جميع الحقوق محفوظة
          </p>
        </div>
        <F p={2} />
      </DocPage>

      {/* ── PAGE 3: DOCUMENT CONTROL ────────────────────────────────────── */}
      <DocPage>
        <H p={2} />
        <SectionTitle ar="مراقبة الوثيقة" en="Document Control" />

        <div className="grid grid-cols-2 gap-5 mb-6">
          {/* الوثيقة */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="px-4 py-2" style={{ background: "linear-gradient(135deg,#1e3a8a,#3b82f6)" }}>
              <p className="text-white text-sm font-bold">الوثيقة</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["اسم الوثيقة", "عرض السعر الخاص لدى شركة سوفت لكس"],
                  ["تاريخ الإنشاء", issueDateStr],
                  ["رقم العرض", proposalNumber],
                  ["متلقي الوثيقة", clientName],
                  ["صلاحية العرض", `${validityDays} يوم`],
                ].map(([k, v]) => (
                  <tr key={k} className="border-t border-gray-100">
                    <td className="px-4 py-2.5 text-gray-500 text-xs w-32">{k}</td>
                    <td className="px-4 py-2.5 text-gray-900 font-medium text-xs">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* الكتّاب والموافقون */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="px-4 py-2" style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}>
                <p className="text-white text-sm font-bold">الكاتب</p>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["الاسم", authorName],
                    ["المسمى الوظيفي", authorTitle],
                    ["آخر تحديث", issueDateStr],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 text-gray-500 text-xs w-28">{k}</td>
                      <td className="px-4 py-2.5 text-gray-900 font-medium text-xs">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="px-4 py-2" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>
                <p className="text-white text-sm font-bold">الموافقون</p>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["الاسم", approverName],
                    ["المسمى الوظيفي", approverTitle],
                    ["آخر تحديث", issueDateStr],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 text-gray-500 text-xs w-28">{k}</td>
                      <td className="px-4 py-2.5 text-gray-900 font-medium text-xs">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Validity notice */}
        <div
          className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <p className="font-bold text-amber-800 mb-1">تنبيه هام:</p>
          <p>
            الاقتباس الوارد في الاقتراح صالح لمدة <strong>{validityDays}</strong> أيام تبدأ من تاريخ هذه الوثيقة.
            بعد فترة انتهاء الصلاحية، وقبل قبول العرض يتم التوقيع عليه ويُعدّ عقداً رسمياً لبدء العمل.
            وقد تخضع الأسعار للتغيير بناءً على إشعار مسبق للعميل. تحتفظ سوفت لكس بالحق في تغيير أي جزء
            من عرض الأسعار إذا كان يحتوي على أخطاء أو سهو قبل التوقيع من قبل العميل.
          </p>
        </div>
        <F p={3} />
      </DocPage>

      {/* ── PAGE 4: INTRODUCTION ───────────────────────────────────────── */}
      <DocPage>
        <H p={3} />
        <SectionTitle ar="نحن متحمسون للعمل معاً!" en="We're Excited to Work Together!" />
        <div
          className="rounded-xl p-6 mb-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0", lineHeight: "2" }}
        >
          {introText}
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: "⚡", title: "سرعة التنفيذ", desc: "نلتزم بالجداول الزمنية المتفق عليها" },
            { icon: "🎯", title: "جودة عالية", desc: "معايير برمجة وتصميم بأعلى المستويات" },
            { icon: "🤝", title: "شراكة حقيقية", desc: "نعمل كجزء من فريقكم لا مجرد مورد" },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-xl p-4 text-center"
              style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1px solid #bfdbfe" }}
            >
              <div className="text-3xl mb-2">{v.icon}</div>
              <p className="font-bold text-gray-900 text-sm mb-1">{v.title}</p>
              <p className="text-xs text-gray-600">{v.desc}</p>
            </div>
          ))}
        </div>
        <F p={4} />
      </DocPage>

      {/* ── PAGE 5: CLIENT REQUIREMENTS ────────────────────────────────── */}
      <DocPage>
        <H p={4} />
        <SectionTitle ar="متطلبات العميل للمشروع" en="Project Requirements" />
        {requirements ? (
          <div
            className="rounded-xl p-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", lineHeight: "2", minHeight: "120px" }}
          >
            {requirements}
          </div>
        ) : (
          <div className="rounded-xl p-6 text-center text-gray-400 border border-dashed border-gray-200">
            <p>لم يتم إضافة متطلبات العميل التفصيلية</p>
          </div>
        )}

        {/* Target audience table */}
        {targetAudience.length > 0 && (
          <div className="mt-8">
            <SectionTitle ar="المجموعة المستهدفة من المستخدمين" en="Target User Groups" />
            <p className="text-sm text-gray-600 mb-4">
              يستهدف حل سوفت لكس المقترح للمستخدمين بأدوار مختلفة، لاستخدام التطبيق وفقاً لاحتياجاتهم ومسؤولياتهم.
            </p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "linear-gradient(135deg,#1e3a8a,#3b82f6)" }}>
                    <th className="text-right py-3 px-4 text-white font-semibold">المجموعة المستهدفة</th>
                    <th className="text-right py-3 px-4 text-white font-semibold">الدور والصلاحيات</th>
                    <th className="text-right py-3 px-4 text-white font-semibold">لغة البرمجة</th>
                    <th className="text-right py-3 px-4 text-white font-semibold">النظام / المنصة</th>
                  </tr>
                </thead>
                <tbody>
                  {targetAudience.map((row: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-3 px-4 font-semibold text-gray-900">{row.group || "—"}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs leading-relaxed">{row.role || "—"}</td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{row.language || "—"}</td>
                      <td className="py-3 px-4 text-gray-700">{row.system || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <F p={5} />
      </DocPage>

      {/* ── PAGE 6: DELIVERABLES ────────────────────────────────────────── */}
      {(deliverables.length > 0 || selectedTechnologies.length > 0) && (
        <DocPage>
          <H p={5} />

          {deliverables.length > 0 && (
            <>
              <SectionTitle ar="مخرجات المشروع" en="Project Deliverables" />
              <div className="rounded-xl overflow-hidden mb-8" style={{ border: "1px solid #e2e8f0" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}>
                      <th className="text-right py-3 px-4 text-white font-semibold">المخرج</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">الوصف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliverables.map((d: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-green-50/30"}>
                        <td className="py-3 px-4 font-semibold text-gray-900 w-48">{d.name || "—"}</td>
                        <td className="py-3 px-4 text-gray-600 text-xs leading-relaxed">{d.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {selectedTechnologies.length > 0 && (
            <>
              <SectionTitle ar="التقنيات المستخدمة" en="Technologies Stack" />
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(techByCategory).map(([cat, techs]) => (
                  <div key={cat} className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
                    <div className="px-4 py-2" style={{ background: "linear-gradient(135deg,#1e3a8a,#3b82f6)" }}>
                      <p className="text-white text-xs font-bold">{cat}</p>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {(techs as any[]).map((t: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">{t.name}</span>
                            {t.description && <span className="text-xs text-gray-500 mr-2">— {t.description}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <F p={6} />
        </DocPage>
      )}

      {/* ── PAGE 7: TIMELINE ────────────────────────────────────────────── */}
      <DocPage>
        <H p={6} />
        <SectionTitle ar="الجدول الزمني للمشروع" en="Project Timeline" />

        <div
          className="rounded-xl p-6 mb-6 text-sm text-gray-700 leading-relaxed"
          style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
        >
          <p>
            الجدول الزمني للمشروع: من المقدر أن يستغرق تسليم المشروع كاملاً{" "}
            <strong className="text-blue-800">{timelineDays} يوم عمل</strong>.
            سيتم تحديد المدة الدقيقة عند إنشاء خطة المشروع التفصيلية.
            بالإضافة إلى ذلك، فترة تعبئة <strong className="text-blue-800">10 أيام عمل</strong>{" "}
            بعد إصدار أوامر الشراء أو توقيع العقد.
          </p>
        </div>

        {/* Visual timeline */}
        <div className="space-y-3">
          {[
            { phase: "التخطيط وتحليل المتطلبات", days: Math.ceil(timelineDays * 0.1), color: "#7c3aed" },
            { phase: "تصميم تجربة المستخدم (UX/UI)", days: Math.ceil(timelineDays * 0.2), color: "#0891b2" },
            { phase: "التطوير الأساسي (Backend & APIs)", days: Math.ceil(timelineDays * 0.3), color: "#1e3a8a" },
            { phase: "تطوير الواجهة الأمامية (Frontend)", days: Math.ceil(timelineDays * 0.25), color: "#3b82f6" },
            { phase: "مراقبة الجودة والاختبار (QA)", days: Math.ceil(timelineDays * 0.1), color: "#059669" },
            { phase: "الإطلاق والنشر", days: Math.ceil(timelineDays * 0.05), color: "#f59e0b" },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-36 text-xs text-right text-gray-600 flex-shrink-0">{p.phase}</div>
              <div
                className="h-7 rounded-lg flex items-center pr-3 text-white text-xs font-bold transition-all"
                style={{ width: `${(p.days / timelineDays) * 60}%`, minWidth: "80px", background: p.color }}
              >
                {p.days} يوم
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-6 rounded-xl p-4 flex items-center gap-3 text-sm"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <span className="text-2xl">⏱️</span>
          <p className="text-gray-700">
            إجمالي مدة المشروع: <strong className="text-amber-800">{timelineDays} يوم عمل</strong> +{" "}
            10 أيام تعبئة = إجمالي <strong className="text-amber-800">{timelineDays + 10} يوم</strong>
          </p>
        </div>
        <F p={7} />
      </DocPage>

      {/* ── PAGE 8: FINANCIAL OFFER ─────────────────────────────────────── */}
      <DocPage>
        <H p={7} />
        <SectionTitle ar="العرض المالي" en="Financial Proposal" />
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          يعرض هذا التفصيل تكلفة أداء العمل المحدد وفقاً لطلبكم وعرضنا. حيث نقدم بموجب هذا التفصيل
          التكلفة الكاملة لكل مرحلة من مراحل المشروع.
        </p>

        {/* Items table */}
        {hasSections ? (
          Object.entries(sections).map(([sectionKey, sectionItems]) => (
            <div key={sectionKey} className="mb-5">
              {sectionKey !== "__default__" && (
                <div
                  className="px-4 py-2 rounded-t-xl flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg,#1e3a8a,#3b82f6)" }}
                >
                  <p className="text-sm font-bold text-white">{sectionKey}</p>
                </div>
              )}
              <div className={`rounded-xl overflow-hidden ${sectionKey !== "__default__" ? "rounded-t-none" : ""}`} style={{ border: "1px solid #e2e8f0" }}>
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
                    {(sectionItems as any[]).map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/60">
                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">{i + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{parseFloat(item.quantity || "1").toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-600">{parseFloat(item.unitPrice || "0").toLocaleString("ar-SA")} {currency}</td>
                        <td className="py-3 px-4 font-semibold text-gray-900">{parseFloat(item.lineTotal || "0").toLocaleString("ar-SA")} {currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl overflow-hidden mb-5" style={{ border: "1px solid #e2e8f0" }}>
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
                  <tr key={i} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{parseFloat(item.quantity || "1").toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{parseFloat(item.unitPrice || "0").toLocaleString("ar-SA")} {currency}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{parseFloat(item.lineTotal || "0").toLocaleString("ar-SA")} {currency}</td>
                  </tr>
                ))}
                {requiredItems.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400 text-sm">لا توجد بنود في هذا العرض</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Optional items */}
        {showOptional && optionalItems.length > 0 && (
          <div className="mb-5">
            <p className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
              البنود الاختيارية (خيارات إضافية غير محتسبة في الإجمالي)
            </p>
            <div className="rounded-xl overflow-hidden border border-amber-200 border-dashed">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-amber-100">
                  {optionalItems.map((item: any, i: number) => (
                    <tr key={i} className="bg-amber-50/30">
                      <td className="py-2.5 px-4 text-amber-400 font-mono text-xs w-8">{i + 1}</td>
                      <td className="py-2.5 px-4">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600 w-20">{parseFloat(item.quantity || "1").toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-gray-600 w-28">{parseFloat(item.unitPrice || "0").toLocaleString("ar-SA")} {currency}</td>
                      <td className="py-2.5 px-4 font-semibold text-amber-700 w-28">{parseFloat(item.lineTotal || "0").toLocaleString("ar-SA")} {currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals box */}
        <div className="flex justify-end mt-4">
          <div className="w-80 rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
            <div className="px-4 py-2" style={{ background: "linear-gradient(135deg,#1e3a8a,#3b82f6)" }}>
              <p className="text-white font-bold text-sm">ملخص الأسعار</p>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="flex justify-between px-4 py-2.5 text-sm text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toLocaleString("ar-SA")} {currency}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between px-4 py-2.5 text-sm text-red-600">
                  <span>الخصم</span>
                  <span>- {discount.toLocaleString("ar-SA")} {currency}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-2.5 text-sm text-gray-600">
                <span>ضريبة القيمة المضافة ({proposal.taxPercent || 15}%)</span>
                <span>{tax.toLocaleString("ar-SA")} {currency}</span>
              </div>
              <div
                className="flex justify-between px-4 py-4 font-bold text-lg"
                style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}
              >
                <span style={{ color: "#1e3a8a" }}>الإجمالي النهائي</span>
                <span style={{ color: "#1e3a8a" }}>{total.toLocaleString("ar-SA")} {currency}</span>
              </div>
            </div>
          </div>
        </div>
        <F p={8} />
      </DocPage>

      {/* ── PAGE 9: PAYMENT SCHEDULE ────────────────────────────────────── */}
      <DocPage>
        <H p={8} />
        <SectionTitle ar="شروط الدفع" en="Payment Terms" />
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          يعرض هذا التفصيل تكلفة أداء العمل المحدد وفقاً لطلبكم وعرضنا. حيث نقدم بموجب هذا التفصيل لكل نظام يتم تطبيقه على حسب الأولوية بما يتوافق مع أساس النظام العام.
        </p>

        {paymentSchedule.filter((m: any) => m.label).length > 0 ? (
          <>
            <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid #e2e8f0" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}>
                    <th className="text-right py-3 px-4 text-white font-semibold">المرحلة</th>
                    <th className="text-right py-3 px-4 text-white font-semibold w-24">نسبة الدفع</th>
                    <th className="text-right py-3 px-4 text-white font-semibold w-36">المبلغ</th>
                    <th className="text-right py-3 px-4 text-white font-semibold w-36">تاريخ الاستحقاق</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentSchedule.filter((m: any) => m.label).map((m: any, idx: number) => {
                    const amount = ((parseFloat(m.percent) || 0) * total / 100);
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-green-50/30"}>
                        <td className="py-3 px-4 font-medium text-gray-900">{m.label}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className="px-3 py-1 rounded-full text-white text-xs font-bold"
                            style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}
                          >
                            {m.percent}%
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-green-700">
                          {amount.toLocaleString("ar-SA")} {currency}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {m.dueDate ? new Date(m.dueDate).toLocaleDateString("ar-SA") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visual bars */}
            <div className="space-y-2">
              {paymentSchedule.filter((m: any) => m.label).map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 w-40 flex-shrink-0 text-right">{m.label}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center pr-3 text-white text-xs font-bold"
                      style={{
                        width: `${Math.min(parseFloat(m.percent) || 0, 100)}%`,
                        background: "linear-gradient(135deg,#059669,#10b981)",
                        transition: "width 0.5s ease",
                      }}
                    >
                      {m.percent}%
                    </div>
                  </div>
                  <div className="text-xs font-bold text-green-700 w-28 flex-shrink-0">
                    {((parseFloat(m.percent) || 0) * total / 100).toLocaleString("ar-SA")} {currency}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl p-6 text-center text-gray-400 border border-dashed border-gray-200">
            <p>لم يتم تحديد جدول دفعات</p>
          </div>
        )}
        <F p={9} />
      </DocPage>

      {/* ── PAGE 10: TEAM ────────────────────────────────────────────────── */}
      <DocPage>
        <H p={9} />
        <SectionTitle ar="فريقنا" en="Our Team" />
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          يضم فريق سوفت لكس نخبة من الخبراء والمتخصصين في مجالات تطوير البرمجيات وتصميم تجربة المستخدم وإدارة المشاريع.
        </p>

        <div className="space-y-4">
          {(teamMembers.length > 0 ? teamMembers : [
            { role: "مدير المشروع", name: authorName, title: "Project Manager", experience: 5 },
            { role: "مصمم UX", name: "فريق التصميم", title: "UX/UI Designer", experience: 9 },
            { role: "مطور كبير", name: "فريق التطوير", title: "Senior Developer", experience: 6 },
            { role: "مهندس QA", name: "فريق الجودة", title: "QA Engineer", experience: 3 },
          ]).map((member: any, i: number) => {
            const defaultBio = TEAM_BIOS[member.role];
            const bio = member.bio || defaultBio?.bio || "";
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#1e3a8a,#3b82f6)" }}
                    >
                      {String.fromCharCode(0x623 + i)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{member.name || member.role}</p>
                      <p className="text-xs text-blue-600">{member.title || defaultBio?.title || member.role}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">خبرة</p>
                    <p className="font-bold text-blue-800 text-sm">{member.experience || "—"} سنوات</p>
                  </div>
                </div>
                {bio && (
                  <div className="px-5 py-3 text-xs text-gray-600 leading-relaxed">{bio}</div>
                )}
              </div>
            );
          })}
        </div>
        <F p={10} />
      </DocPage>

      {/* ── PAGE 11: TERMS & CONDITIONS ─────────────────────────────────── */}
      <DocPage>
        <H p={10} />
        <SectionTitle ar="الشروط والأحكام" en="Terms & Conditions" />
        <div
          className="rounded-xl p-6 text-sm text-gray-700 whitespace-pre-line leading-relaxed"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0", lineHeight: "2.2" }}
        >
          {termsAndNotes}
        </div>
        <F p={11} />
      </DocPage>

      {/* ── PAGE 12: SIGNATURE ───────────────────────────────────────────── */}
      <DocPage>
        <H p={11} />
        <SectionTitle ar="التوقيع والموافقة" en="Approval & Signature" />

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Company signature */}
          <div className="rounded-xl p-5" style={{ border: "2px solid #bfdbfe" }}>
            <p className="font-bold text-gray-900 mb-1 text-sm">ختم وتوقيع سوفت لكس</p>
            <p className="text-xs text-gray-500 mb-4">Softlix Information Technology</p>
            <div className="h-20 rounded-lg border border-dashed border-blue-200 mb-3 flex items-center justify-center bg-blue-50/30">
              <p className="text-xs text-blue-300">توقيع الشركة</p>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p><span className="font-semibold">الاسم:</span> {approverName}</p>
              <p><span className="font-semibold">المسمى:</span> {approverTitle}</p>
              <p><span className="font-semibold">التاريخ:</span> {issueDateStr}</p>
            </div>
          </div>

          {/* Client signature */}
          <div className="rounded-xl p-5" style={{ border: "2px solid #d1fae5" }}>
            <p className="font-bold text-gray-900 mb-1 text-sm">ختم وتوقيع العميل</p>
            <p className="text-xs text-gray-500 mb-4">{clientName}</p>
            {proposal.clientSignature ? (
              <div className="h-20 rounded-lg border border-solid border-green-300 mb-3 flex items-center justify-center bg-green-50">
                <div className="text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-green-700">{proposal.clientSignature}</p>
                </div>
              </div>
            ) : (
              <div className="h-20 rounded-lg border border-dashed border-green-200 mb-3 flex items-center justify-center bg-green-50/30">
                <p className="text-xs text-green-300">توقيع العميل</p>
              </div>
            )}
            <div className="space-y-1.5 text-xs text-gray-600">
              <p><span className="font-semibold">الاسم:</span> {proposal.clientSignature || "___________"}</p>
              <p><span className="font-semibold">المسمى:</span> ___________</p>
              <p><span className="font-semibold">التاريخ:</span> {proposal.signedAt ? new Date(proposal.signedAt).toLocaleDateString("ar-SA") : "___________"}</p>
            </div>
          </div>
        </div>

        {/* Closing message */}
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "white" }}
        >
          <p className="text-xl font-bold mb-2">شكراً لاختياركم سوفت لكس</p>
          <p className="text-blue-300 text-sm">Thank you for choosing Softlix</p>
          <div className="mt-4 text-xs text-blue-400">
            <p>info@softlix.net | www.softlixagency.com</p>
          </div>
        </div>

        {proposal.clientSignature && (
          <div className="mt-4 rounded-xl p-4 flex items-start gap-3" style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}>
            <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-800 text-sm">تم التوقيع رقمياً</p>
              <p className="text-sm text-green-700 mt-0.5">وقّع العميل: <strong>{proposal.clientSignature}</strong></p>
              {proposal.signedAt && <p className="text-xs text-green-600 mt-0.5">بتاريخ: {new Date(proposal.signedAt).toLocaleString("ar-SA")}</p>}
            </div>
          </div>
        )}
        <F p={12} />
      </DocPage>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
  if (!proposal) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center"><p className="text-gray-500">العرض غير موجود</p></div>
    </div>
  );

  const isExpired = proposal.expiryDate && new Date(proposal.expiryDate) < new Date() && !["accepted", "rejected"].includes(proposal.status);
  const daysLeft = proposal.expiryDate ? Math.ceil((new Date(proposal.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div
      className="min-h-screen py-8 px-4 print:p-0 print:bg-white"
      style={{ background: "#f1f5f9" }}
      dir="rtl"
    >
      {/* Admin Controls */}
      <div className="max-w-4xl mx-auto mb-4 print:hidden">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900 text-sm">{proposal.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{proposal.proposalNumber}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[proposal.status] || "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[proposal.status] || proposal.status}
              </span>
              {proposal.viewCount > 0 && (
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {proposal.viewCount} مشاهدة
                </span>
              )}
              {proposal.clientSignature && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> موقّع
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

        {isExpired && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">انتهت صلاحية هذا العرض. يُنصح بتحديث تاريخ الانتهاء وإعادة الإرسال.</p>
          </div>
        )}
        {!isExpired && daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">تنتهي صلاحية العرض خلال {daysLeft === 0 ? "اليوم" : `${daysLeft} أيام`}.</p>
          </div>
        )}
      </div>

      <ProposalDocument proposal={proposal} />

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (error || !proposal) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-sm mx-auto px-4">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">العرض غير متاح</h2>
        <p className="text-gray-500">قد يكون الرابط منتهي الصلاحية أو غير صحيح</p>
      </div>
    </div>
  );

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
    <div className="min-h-screen" style={{ background: "#f1f5f9" }} dir="rtl">
      {/* CTA bar */}
      {!isExpired && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm print:hidden">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-sm">{proposal.title}</p>
              <p className="text-xs text-gray-500">{proposal.proposalNumber}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => respondMutation.mutate("rejected")}
                disabled={respondMutation.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                رفض
              </Button>
              <Button
                size="sm"
                onClick={() => setShowSignature(true)}
                disabled={respondMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                قبول والتوقيع
              </Button>
            </div>
          </div>
        </div>
      )}

      {isExpired && (
        <div className="max-w-4xl mx-auto px-4 pt-4 print:hidden">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">انتهت صلاحية هذا العرض. يرجى التواصل مع الشركة للحصول على عرض محدّث.</p>
          </div>
        </div>
      )}

      <div className="py-8 px-4">
        <ProposalDocument proposal={proposal} showOptional={true} />
      </div>

      {/* Signature dialog */}
      {showSignature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" dir="rtl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">التوقيع الرقمي</h3>
            <p className="text-sm text-gray-500 mb-4">أدخل اسمك الكامل كتوقيع رقمي على هذا العرض</p>
            <Label className="text-sm font-medium text-gray-700">الاسم الكامل *</Label>
            <Input
              className="mt-1.5 mb-4"
              placeholder="اسمك الكامل..."
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              data-testid="input-signature"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSignature(false)}>
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => signMutation.mutate()}
                disabled={!signatureName.trim() || signMutation.isPending}
              >
                {signMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد التوقيع"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
