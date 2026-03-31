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
  Loader2, Printer, CheckCircle, XCircle, Eye, AlertTriangle, Shield,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", pending_approval: "بانتظار الموافقة", approved: "معتمد",
  sent: "مرسل", viewed: "تمت المشاهدة", accepted: "مقبول", rejected: "مرفوض",
  expired: "منتهي الصلاحية",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-orange-100 text-[#ff6a00]", sent: "bg-indigo-100 text-indigo-700",
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

const IP_TEXT = `تحتفظ شركة سوفت لكس بحقوق الملكية الفكرية الكاملة لجميع الأعمال المقدمة حتى استلام الدفعة الكاملة والنهائية. بعد اكتمال السداد تنتقل ملكية المخرجات النهائية بالكامل إلى العميل.

تشمل الملكية الفكرية المحتفظ بها: الكود المصدري، التصاميم، وثائق المشروع، والبنية التقنية المطورة خلال فترة المشروع.`;

const DEFAULT_PAYMENT_INTRO = `يتم تقسيم المدفوعات على مراحل المشروع بما يضمن تقدماً منتظماً للعمل ويوفر ضماناً متبادلاً للطرفين. يبدأ العمل رسمياً بعد استلام الدفعة الأولى.`;

const TEAM_BIOS: Record<string, { title: string; bio: string; exp: number }> = {
  "مدير المشروع": {
    title: "Project Manager",
    exp: 5,
    bio: "يتمتع مدير المشروع بخبرة 5 سنوات في المتوسط في مجال تطوير البرمجيات الرشيقة، وهو حاصل على شهادة محترف إدارة المشاريع (PMP). مسؤول عن تخطيط مشروع الحلول البرمجية المعقدة مع فهم متعمق لتبعيات العميل وتبعيات البرامج.",
  },
  "محلل الأعمال": {
    title: "Business Analyst",
    exp: 6,
    bio: "محلل الأعمال لديه متوسط 6 سنوات من الخبرة في تحليل الأعمال لمنتجات البرمجيات. يتمتع بمهارات تحليلية قوية تؤهله لتقديم استكشاف تكراري ومنهجي لبيانات المنظمة مع التركيز على التحليل الإحصائي.",
  },
  "مصمم UX": {
    title: "UX/UI Designer",
    exp: 9,
    bio: "يتمتع مدير تجربة المستخدم بمتوسط 9 سنوات من الخبرة المهنية في إدارة المنتجات وتصميم تجربة المستخدم. مهمته الرئيسية إجراء بحث المستخدم ومقابلات واستطلاعات ثم إنشاء الإطارات السلكية والنماذج الأولية.",
  },
  "مطور كبير": {
    title: "Senior Developer",
    exp: 6,
    bio: "مطور كبير لديه متوسط 6 سنوات من الخبرة المهنية في تطوير البرمجيات. يمتلك فهماً عميقاً لأهداف التكنولوجيا والأعمال لإنشاء حلول من خلال تطوير وتنفيذ وصيانة برامج الهاتف المحمول وخدمات الويب بأعلى معايير الجودة.",
  },
  "مهندس QA": {
    title: "QA Engineer",
    exp: 3,
    bio: "يتمتع مهندس مراقبة الجودة بمتوسط 3 سنوات من الخبرة المهنية في اختبار منتجات البرمجيات. يطبق حالات الاختبار الشاملة على منتج البرنامج لضمان أعلى مستويات الجودة قبل الإطلاق.",
  },
};

// ─── CSS Styles (from new template) ──────────────────────────────────────────
const PROPOSAL_CSS = `
  .prop-wrap * { margin: 0; padding: 0; box-sizing: border-box; }
  .prop-wrap { font-family: "Segoe UI", Tahoma, Arial, sans-serif; line-height: 1.7; color: #1a1a1a; background: #f3f4f6; direction: rtl; }
  .prop-page { width: 210mm; min-height: 297mm; margin: 16px auto; padding: 18mm 16mm 22mm; background: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.08); position: relative; page-break-after: always; overflow: hidden; }
  .prop-page:last-child { page-break-after: auto; }
  .cover-page { padding: 0; background: radial-gradient(circle at top right, rgba(255,106,0,0.12), transparent 30%), linear-gradient(160deg, #0f172a 0%, #151515 60%, #2a1200 100%); color: #ffffff; display: flex; flex-direction: column; justify-content: space-between; }
  .cover-top-ribbon, .cover-bottom-ribbon { height: 12px; background: linear-gradient(to right, #ff8c00, #ff6a00, #e55c00); }
  .cover-bottom-ribbon { background: linear-gradient(to right, #e55c00, #ff6a00, #ff8c00); }
  .cover-header { padding: 28px 36px 18px; border-bottom: 1px solid rgba(255,255,255,0.12); }
  .cover-brand { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 58px; height: 58px; border-radius: 12px; background: rgba(255,106,0,0.12); border: 1px solid rgba(255,106,0,0.35); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 22px; }
  .cover-brand-text p:first-child { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
  .cover-brand-text p:last-child { font-size: 13px; color: #ffb067; }
  .cover-main { flex: 1; padding: 32px 36px; display: flex; flex-direction: column; justify-content: center; }
  .p-badge { display: inline-block; background: rgba(255,106,0,0.14); border: 1px solid rgba(255,106,0,0.35); color: #ffb067; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 800; margin-bottom: 18px; }
  .cover-title { font-size: 34px; font-weight: 900; line-height: 1.4; margin-bottom: 16px; }
  .cover-divider { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
  .cover-divider .line1 { width: 92px; height: 4px; border-radius: 999px; background: #ff6a00; }
  .cover-divider .line2 { width: 42px; height: 2px; border-radius: 999px; background: rgba(255,255,255,0.25); }
  .cover-subtitle { font-size: 16px; color: rgba(255,255,255,0.75); max-width: 520px; margin-bottom: 24px; }
  .cover-client-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; padding: 18px; max-width: 420px; margin-bottom: 28px; }
  .cover-client-box .c-label { font-size: 12px; color: #ffb067; margin-bottom: 8px; }
  .cover-client-box .c-value { font-size: 24px; font-weight: 900; }
  .cover-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 620px; }
  .cover-stat { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; text-align: center; }
  .cover-stat .c-label { font-size: 11px; color: #ffb067; margin-bottom: 8px; }
  .cover-stat .c-value { font-size: 14px; font-weight: 800; }
  .cover-bottom { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px 36px; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.18); font-size: 12px; }
  .cover-bottom-item { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.72); }
  .p-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 2px solid #ff6a00; padding-bottom: 12px; margin-bottom: 22px; }
  .p-logo { display: flex; align-items: center; gap: 12px; }
  .p-logo-box { width: 44px; height: 44px; background: linear-gradient(135deg, #1a1a1a, #ff6a00); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 13px; }
  .p-logo-text p:first-child { font-weight: 800; font-size: 14px; margin-bottom: 2px; }
  .p-logo-text p:last-child { font-size: 11px; color: #ff6a00; }
  .p-header-info { text-align: left; font-size: 12px; color: #666; }
  .p-header-info p { margin-bottom: 4px; }
  .p-section { margin-bottom: 24px; }
  .p-section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .p-section-title .p-bar { width: 6px; height: 28px; border-radius: 999px; background: linear-gradient(to bottom, #ff6a00, #ff8c00); flex-shrink: 0; }
  .p-section-title h2 { font-size: 22px; font-weight: 900; color: #1a1a1a; line-height: 1.4; }
  .p-section-subtitle { font-size: 15px; font-weight: 800; margin-bottom: 10px; color: #111827; }
  .prop-wrap p { margin-bottom: 10px; font-size: 14px; }
  .p-lead { font-size: 15px; line-height: 1.9; color: #374151; }
  .p-info-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 14px; }
  .p-highlight-box { background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 1px solid #fed7aa; border-radius: 12px; padding: 16px; margin-bottom: 14px; }
  .p-notice-box { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a; border-radius: 12px; padding: 14px 16px; margin-bottom: 14px; }
  .p-danger-box { background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; border-radius: 12px; padding: 14px 16px; margin-bottom: 14px; }
  .p-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .p-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .prop-wrap table { width: 100%; border-collapse: collapse; margin: 14px 0; overflow: hidden; border-radius: 12px; }
  .prop-wrap thead { background: linear-gradient(135deg, #1a1a1a, #ff6a00); color: white; }
  .prop-wrap th { padding: 11px 10px; text-align: right; font-size: 13px; font-weight: 800; border: 1px solid rgba(255,255,255,0.06); }
  .prop-wrap td { padding: 11px 10px; border: 1px solid #e5e7eb; font-size: 13px; vertical-align: top; }
  .prop-wrap tbody tr:nth-child(even) { background: #fafafa; }
  .p-muted { color: #6b7280; font-size: 12px; }
  .p-check-list { list-style: none; padding-right: 0; }
  .p-check-list li { position: relative; padding-right: 24px; margin-bottom: 8px; line-height: 1.8; font-size: 14px; }
  .p-check-list li::before { content: "✓"; position: absolute; right: 0; top: 0; color: #059669; font-weight: 900; }
  .p-dash-list { list-style: none; padding-right: 0; }
  .p-dash-list li { position: relative; padding-right: 18px; margin-bottom: 8px; line-height: 1.8; font-size: 14px; }
  .p-dash-list li::before { content: "—"; position: absolute; right: 0; top: 0; color: #ff6a00; font-weight: 900; }
  .p-module-number { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #1a1a1a, #ff6a00); color: #fff; font-size: 13px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .p-module-card { border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; margin-bottom: 14px; background: #fff; }
  .p-module-card-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: linear-gradient(135deg, #fff7ed, #ffedd5); border-bottom: 1px solid #fed7aa; }
  .p-module-card-header h3 { font-size: 16px; font-weight: 900; margin: 0; }
  .p-module-card-body { padding: 16px; }
  .p-module-card-body p { margin-bottom: 10px; }
  .p-timeline-item { margin-bottom: 18px; }
  .p-timeline-row { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 8px; font-size: 13px; font-weight: 700; }
  .p-timeline-bar { width: 100%; height: 28px; border-radius: 999px; overflow: hidden; background: #e5e7eb; }
  .p-timeline-fill { height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a1a, #ff6a00); color: #fff; font-size: 11px; font-weight: 800; }
  .p-totals-box { width: 100%; max-width: 420px; margin-right: auto; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
  .p-total-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .p-total-row.t-header { background: linear-gradient(135deg, #1a1a1a, #ff6a00); color: #fff; font-weight: 900; border: none; }
  .p-total-row.t-final { background: linear-gradient(135deg, #fff7ed, #ffedd5); color: #ff6a00; font-size: 16px; font-weight: 900; }
  .p-payment-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .p-payment-bar-label { width: 180px; font-size: 12px; color: #4b5563; }
  .p-payment-bar-wrap { flex: 1; background: #ecfdf5; border-radius: 999px; overflow: hidden; height: 24px; }
  .p-payment-bar-fill { height: 100%; background: linear-gradient(135deg, #059669, #10b981); color: #fff; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
  .p-payment-bar-amount { width: 120px; font-size: 12px; font-weight: 800; color: #059669; text-align: left; }
  .p-member-card { border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; margin-bottom: 14px; }
  .p-member-card-head { background: linear-gradient(135deg, #fff7ed, #ffedd5); padding: 14px 16px; display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px solid #fed7aa; }
  .p-member-card-head-left { display: flex; gap: 12px; }
  .p-member-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #1a1a1a, #ff6a00); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; flex-shrink: 0; }
  .p-member-card-head h3 { font-size: 15px; margin-bottom: 4px; font-weight: 900; }
  .p-member-role { font-size: 12px; color: #ff6a00; font-weight: 700; }
  .p-member-exp { font-size: 12px; color: #374151; text-align: left; }
  .p-member-exp strong { color: #ff6a00; }
  .p-member-card-body { padding: 16px; font-size: 13px; line-height: 1.8; color: #4b5563; }
  .p-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 26px; }
  .p-signature-box { border: 2px solid #e5e7eb; border-radius: 16px; padding: 18px; }
  .p-signature-title { font-size: 16px; font-weight: 900; margin-bottom: 6px; }
  .p-signature-subtitle { font-size: 11px; color: #6b7280; margin-bottom: 12px; }
  .p-signature-line { height: 74px; border: 1px dashed #d1d5db; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; margin-bottom: 12px; }
  .p-signature-details p { margin-bottom: 6px; font-size: 13px; }
  .p-footer { position: absolute; left: 16mm; right: 16mm; bottom: 10mm; border-top: 1px solid #e5e7eb; padding-top: 8px; display: flex; justify-content: space-between; gap: 12px; font-size: 11px; color: #9ca3af; }
  .p-closing-card { background: linear-gradient(135deg, #0f172a 0%, #1a1a1a 55%, #2a1200 100%); color: #fff; border-radius: 16px; padding: 22px; text-align: center; margin-top: 24px; border-top: 4px solid #ff6a00; }
  .p-closing-card h3 { font-size: 20px; margin-bottom: 10px; font-weight: 900; }
  .p-closing-card .p-sub { color: #ffb067; margin-bottom: 12px; }
  .p-closing-card hr { border: none; border-top: 1px solid rgba(255,255,255,0.14); margin: 14px 0; }
  .p-item-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: rgba(255,106,0,0.1); border: 1px solid rgba(255,106,0,0.22); color: #ff6a00; font-size: 11px; font-weight: 800; white-space: nowrap; }
  .pre-line { white-space: pre-line; }
  @media print {
    body { background: #fff; }
    .prop-page { margin: 0; box-shadow: none; }
  }
`;

// ─── Helper components ────────────────────────────────────────────────────────
function PHeader({ num, date }: { num: string; date: string }) {
  return (
    <div className="p-header">
      <div className="p-logo">
        <div className="p-logo-box">SX</div>
        <div className="p-logo-text">
          <p>شركة سوفت لكس</p>
          <p>Softlix Agency</p>
        </div>
      </div>
      <div className="p-header-info">
        <p>{num}</p>
        <p>{date}</p>
      </div>
    </div>
  );
}

function PFooter({ label, page, total }: { label: string; page: number; total: number }) {
  return (
    <div className="p-footer">
      <span>{label}</span>
      <span>{page} / {total}</span>
    </div>
  );
}

function PSectionTitle({ title }: { title: string }) {
  return (
    <div className="p-section-title">
      <div className="p-bar" />
      <h2>{title}</h2>
    </div>
  );
}

// ─── ProposalDocument ──────────────────────────────────────────────────────────
export function ProposalDocument({ proposal, showOptional = true }: { proposal: any; showOptional?: boolean }) {
  const items: any[] = proposal.items || [];
  const requiredItems = items.filter((i: any) => !i.isOptional);
  const optionalItems = items.filter((i: any) => i.isOptional);
  const paymentSchedule: any[] = proposal.paymentSchedule || [];
  // teamMembers can be [{role, name, title, experience, bio}] or string[]
  const rawTeamMembers: any[] = proposal.teamMembers || [];
  const teamMembers: { name: string; title: string; exp: number; bio: string; initials: string }[] =
    rawTeamMembers.length > 0
      ? rawTeamMembers.map((m: any) => {
          if (typeof m === "string") {
            const info = TEAM_BIOS[m] || { title: m, exp: 5, bio: m };
            return { name: m, title: info.title, exp: info.exp, bio: info.bio, initials: m.split(" ").map((w: string) => w[0] || "").join("").slice(0, 2) };
          }
          const roleName = m.role || m.name || "عضو الفريق";
          const fallback = TEAM_BIOS[roleName] || { title: roleName, exp: m.experience || 5, bio: m.bio || roleName };
          return {
            name: m.name || roleName,
            title: m.title || fallback.title,
            exp: parseInt(m.experience || fallback.exp) || 5,
            bio: m.bio || fallback.bio,
            initials: (m.name || roleName).split(" ").map((w: string) => w[0] || "").join("").slice(0, 2),
          };
        })
      : Object.entries(TEAM_BIOS).slice(0, 4).map(([name, info]) => ({
          name,
          title: info.title,
          exp: info.exp,
          bio: info.bio,
          initials: name.split(" ").map((w: string) => w[0] || "").join("").slice(0, 2),
        }));

  const subtotal = parseFloat(String(proposal.subtotal || "0"));
  const discount = parseFloat(String(proposal.discountValue || "0"));
  const tax = parseFloat(String(proposal.taxAmount || "0"));
  const total = parseFloat(String(proposal.total || "0"));
  const currency = String(proposal.currency || "SAR");

  const issueDate = new Date(proposal.issueDate || proposal.createdAt);
  const issueDateStr = issueDate.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const issueDateShort = issueDate.toLocaleDateString("ar-SA");
  const proposalNumber = proposal.proposalNumber || "—";
  const clientName = proposal.company?.name
    ? proposal.company.name
    : proposal.contact
      ? `${proposal.contact?.firstName || ""} ${proposal.contact?.lastName || ""}`.trim() || "العميل الكريم"
      : "العميل الكريم";

  const authorName = proposal.authorName || "مهند العشري";
  const authorTitle = proposal.authorTitle || "مدير تطوير الأعمال";
  const approverName = proposal.approverName || "علاء الصبحي";
  const approverTitle = proposal.approverTitle || "م/ البرمجيات";
  const timelineDays = proposal.timelineDays || 65;
  const introText = proposal.introText || DEFAULT_INTRO_TEXT;
  const requirements = proposal.requirements || "";
  const termsAndNotes = proposal.termsAndNotes || DEFAULT_TERMS;

  const validityDays = (() => {
    if (proposal.expiryDate) {
      const expiry = new Date(proposal.expiryDate);
      const diff = Math.round((expiry.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 14;
    }
    return 14;
  })();

  // Group required items by section
  const sections = requiredItems.reduce((acc: Record<string, any[]>, item: any) => {
    const s = item.sectionName || "__default__";
    if (!acc[s]) acc[s] = [];
    acc[s].push(item);
    return acc;
  }, {});
  const hasSections = Object.keys(sections).some(k => k !== "__default__");

  const TOTAL_PAGES = 14;

  const fmt = (n: number) => n.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Scope modules from sections or items
  const scopeModules: { title: string; subtitle: string; items: string[] }[] = hasSections
    ? Object.entries(sections).map(([name, its], i) => ({
        title: name,
        subtitle: its[0]?.description?.slice(0, 60) || "",
        items: its.map((it: any) => `${it.name || it.title}${it.description ? ` — ${it.description}` : ""}`),
      }))
    : requiredItems.length > 0
      ? [{ title: "نطاق العمل الرئيسي", subtitle: "الخدمات والبنود المتفق عليها", items: requiredItems.map((i: any) => i.name || i.title) }]
      : [{ title: "نطاق العمل الرئيسي", subtitle: "الخدمات والبنود المتفق عليها", items: ["تحليل المتطلبات والتصميم", "التطوير والبرمجة", "الاختبار وضمان الجودة", "النشر والتسليم"] }];

  // Timeline phases
  const timelinePhases = paymentSchedule.length > 0
    ? paymentSchedule.map((p: any) => ({
        name: p.label || p.milestone,
        days: Math.round((parseFloat(p.percent) / 100) * timelineDays),
        pct: Math.round(parseFloat(p.percent)),
      }))
    : [
        { name: "التحليل والتصميم", days: Math.round(timelineDays * 0.2), pct: 20 },
        { name: "التطوير", days: Math.round(timelineDays * 0.5), pct: 50 },
        { name: "الاختبار والإطلاق", days: Math.round(timelineDays * 0.3), pct: 30 },
      ];

  return (
    <div className="prop-wrap" id="proposal-doc">
      <style>{PROPOSAL_CSS}</style>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 1: COVER
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page cover-page">
        <div className="cover-top-ribbon" />

        <div className="cover-header">
          <div className="cover-brand">
            <div className="brand-logo">SX</div>
            <div className="cover-brand-text">
              <p>شركة سوفت لكس لتقنية المعلومات</p>
              <p>Softlix Information Technology</p>
            </div>
          </div>
        </div>

        <div className="cover-main">
          <span className="p-badge">عرض تقني ومالي · Technical & Financial Proposal</span>
          <h1 className="cover-title">{proposal.title || "العرض التقني والمالي"}</h1>
          <div className="cover-divider">
            <div className="line1" />
            <div className="line2" />
          </div>
          <p className="cover-subtitle">حل تقني متكامل مُصمَّم خصيصاً لتلبية متطلباتكم وتحقيق أهدافكم الاستراتيجية</p>

          <div className="cover-client-box">
            <div className="c-label">مُقدَّم إلى</div>
            <div className="c-value">{clientName}</div>
          </div>

          <div className="cover-stats">
            <div className="cover-stat">
              <div className="c-label">رقم العرض</div>
              <div className="c-value">{proposalNumber}</div>
            </div>
            <div className="cover-stat">
              <div className="c-label">تاريخ الإصدار</div>
              <div className="c-value">{issueDateStr}</div>
            </div>
            <div className="cover-stat">
              <div className="c-label">صالح لمدة</div>
              <div className="c-value">{validityDays} يوم</div>
            </div>
          </div>
        </div>

        <div className="cover-bottom">
          <div className="cover-bottom-item"><span>⚡</span><span>تسليم في الوقت المحدد</span></div>
          <div className="cover-bottom-item"><span>🏆</span><span>جودة عالية المستوى</span></div>
          <div className="cover-bottom-item"><span>🤝</span><span>شراكة استراتيجية</span></div>
        </div>

        <div className="cover-bottom-ribbon" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 2: CONFIDENTIALITY & DOCUMENT CONTROL
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="بيان السرية" />
          <div className="p-info-box pre-line">{CONFIDENTIALITY_TEXT}</div>
        </div>

        <div className="p-section">
          <PSectionTitle title="مراقبة الوثيقة" />
          <table>
            <tbody>
              {[
                ["اسم الوثيقة", `عرض سعر رقم ${proposalNumber}`],
                ["تاريخ الإنشاء", issueDateStr],
                ["آخر تحديث", issueDateStr],
                ["متلقي الوثيقة", clientName],
                ["الكاتب", authorName],
                ["المسمى الوظيفي", authorTitle],
                ["الموافقون", `${approverName} — ${approverTitle}`],
                ["فترة صلاحية العرض", `${validityDays} يوم من تاريخ الإصدار`],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td><strong>{k}</strong></td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-danger-box">
            تحذير: أي تعديل على هذه الوثيقة أو بنود العرض المالي بدون موافقة كتابية مسبقة من سوفت لكس يُعدّ باطلاً ولا يُعتدّ به.
          </div>
        </div>

        <PFooter label="وثيقة سرية ومملوكة لشركة سوفت لكس" page={2} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 3: EXECUTIVE SUMMARY & INITIAL REQUIREMENTS
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="ملخص تنفيذي" />
          <div className="p-highlight-box">
            <p className="p-lead" style={{ marginBottom: 0 }}>{introText}</p>
          </div>
        </div>

        {requirements && (
          <div className="p-section">
            <PSectionTitle title="متطلبات العميل للمشروع الأولية" />
            <div className="p-info-box pre-line">{requirements}</div>
          </div>
        )}

        <PFooter label="ملخص تنفيذي ومتطلبات أولية" page={3} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 4: SCOPE OF WORK
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="نطاق العمل (Scope of Work)" />
          <div className="p-info-box">
            <p className="p-lead" style={{ marginBottom: 0 }}>
              يشمل العرض المقدم من سوفت لكس جميع الخدمات والبنود التفصيلية الموضحة أدناه، وذلك ضمن المدة الزمنية والميزانية المتفق عليها.
            </p>
          </div>

          {scopeModules.map((mod, i) => (
            <div className="p-module-card" key={i}>
              <div className="p-module-card-header">
                <div className="p-module-number">{i + 1}</div>
                <div>
                  <h3>{mod.title}</h3>
                  {mod.subtitle && <p className="p-muted" style={{ marginBottom: 0 }}>{mod.subtitle}</p>}
                </div>
              </div>
              <div className="p-module-card-body">
                <ul className="p-check-list">
                  {mod.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            </div>
          ))}

          {showOptional && optionalItems.length > 0 && (
            <div className="p-notice-box">
              <strong>البنود الاختيارية ({optionalItems.length} بند):</strong>{" "}
              {optionalItems.map((i: any) => i.name || i.title).join(" — ")}
            </div>
          )}
        </div>

        <PFooter label="نطاق العمل التفصيلي" page={4} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 5: SOLUTION OVERVIEW & OBJECTIVES
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="نظرة عامة على الحل" />
          <div className="p-info-box">
            <p className="p-lead" style={{ marginBottom: 0 }}>
              تقدم سوفت لكس حلاً تقنياً متكاملاً يجمع بين تصميم تجربة مستخدم استثنائية، وبنية تقنية متينة وقابلة للتطوير، مع ضمان الجودة والأداء العالي في كل مرحلة من مراحل التطوير.
            </p>
          </div>
        </div>

        <div className="p-section">
          <PSectionTitle title="الأهداف الرئيسية للمشروع" />
          <div className="p-grid-2">
            {[
              { title: "تحقيق الكفاءة التشغيلية", desc: "تحسين وتسريع العمليات الداخلية من خلال أتمتة المهام وتقليل الجهد اليدوي." },
              { title: "تجربة مستخدم استثنائية", desc: "تصميم واجهات سهلة الاستخدام تضمن تجربة سلسة وممتعة لجميع المستخدمين." },
              { title: "قابلية التطوير والتوسع", desc: "بنية تقنية مرنة تدعم النمو المستقبلي دون الحاجة لإعادة البناء." },
              { title: "الأمان وحماية البيانات", desc: "معايير أمان عالية المستوى لحماية بيانات المستخدمين والمعلومات الحساسة." },
            ].map((obj, i) => (
              <div className="p-highlight-box" key={i} style={{ marginBottom: 0 }}>
                <p className="p-section-subtitle">{obj.title}</p>
                <p style={{ marginBottom: 0 }}>{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-section">
          <PSectionTitle title="الميزات الرئيسية للنظام" />
          <div className="p-grid-2">
            {[
              { title: "لوحة تحكم تفاعلية", items: ["إحصائيات ومؤشرات أداء لحظية", "تقارير قابلة للتخصيص", "تنبيهات وإشعارات ذكية"] },
              { title: "إدارة المحتوى والبيانات", items: ["واجهة إدارة سهلة الاستخدام", "استيراد وتصدير البيانات", "بحث وفلترة متقدمة"] },
              { title: "التكامل والربط", items: ["ربط مع أنظمة خارجية", "واجهة برمجية REST API", "تكامل مع خدمات الدفع"] },
              { title: "الأداء والأمان", items: ["أداء عالي وسرعة استجابة", "تشفير البيانات", "نسخ احتياطي تلقائي"] },
            ].map((cap, i) => (
              <div className="p-info-box" key={i} style={{ marginBottom: 0 }}>
                <p className="p-section-subtitle">{cap.title}</p>
                <ul className="p-dash-list">
                  {cap.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <PFooter label="نظرة عامة على الحل والأهداف" page={5} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 6: ARCHITECTURE & TECHNOLOGY
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="البنية التقنية للنظام" />
          <div className="p-highlight-box">
            <p className="p-lead" style={{ marginBottom: 0 }}>
              يُبنى النظام على معمارية حديثة قائمة على الخدمات المصغّرة (Microservices) مع فصل واضح بين الواجهة الأمامية والخلفية، مما يضمن قابلية التوسع والصيانة السهلة.
            </p>
          </div>
          <div className="p-grid-2">
            {[
              { num: "1", name: "الواجهة الأمامية", sub: "Frontend", tech: "React / Next.js / TypeScript", role: "واجهة المستخدم التفاعلية", value: "تجربة مستخدم سلسة وسريعة" },
              { num: "2", name: "الواجهة الخلفية", sub: "Backend API", tech: "Node.js / Express / REST API", role: "منطق الأعمال والخدمات", value: "أداء عالي وقابلية تطوير" },
              { num: "3", name: "قاعدة البيانات", sub: "Database", tech: "PostgreSQL / Redis", role: "تخزين البيانات وإدارتها", value: "موثوقية وأمان عالي" },
              { num: "4", name: "البنية التحتية", sub: "Infrastructure", tech: "Cloud / Docker / CI/CD", role: "نشر وإدارة النظام", value: "استمرارية الخدمة وتوافريتها" },
            ].map((cat, i) => (
              <div className="p-module-card" key={i} style={{ marginBottom: 0 }}>
                <div className="p-module-card-header">
                  <div className="p-module-number">{cat.num}</div>
                  <div>
                    <h3>{cat.name}</h3>
                    <p className="p-muted" style={{ marginBottom: 0 }}>{cat.sub}</p>
                  </div>
                </div>
                <div className="p-module-card-body">
                  <p><strong>التقنيات:</strong> {cat.tech}</p>
                  <p><strong>الدور:</strong> {cat.role}</p>
                  <p style={{ marginBottom: 0 }}><strong>القيمة:</strong> {cat.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-notice-box" style={{ marginTop: 14 }}>
            تعمل جميع مكونات النظام بتكامل تام مع بعضها لضمان أعلى مستويات الأداء والموثوقية. يتم تحديث البنية التقنية باستمرار لمواكبة أحدث المعايير العالمية.
          </div>
        </div>

        <PFooter label="البنية التقنية والتقنيات المقترحة" page={6} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 7: DELIVERABLES & TIMELINE
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="مخرجات المشروع" />
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>المخرج</th>
                <th>الوصف</th>
                <th>مرحلة التسليم</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["وثيقة المتطلبات", "توثيق كامل لجميع متطلبات المشروع", "المرحلة الأولى"],
                ["نماذج التصميم", "تصاميم الواجهات بصيغة Figma", "المرحلة الأولى"],
                ["الكود المصدري", "الكود الكامل موثقاً على GitHub", "المرحلة الثانية"],
                ["بيئة الاختبار", "نسخة تجريبية للاختبار والمراجعة", "المرحلة الثالثة"],
                ["النسخة الإنتاجية", "النظام مُطلق ومُشغّل على السيرفر", "التسليم النهائي"],
                ["دليل الاستخدام", "وثائق المستخدم والمشرف", "التسليم النهائي"],
              ].map(([name, desc, stage], i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><strong>{name}</strong></td>
                  <td>{desc}</td>
                  <td>{stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-section">
          <PSectionTitle title="الجدول الزمني للمشروع" />
          <div className="p-highlight-box">
            <p style={{ marginBottom: 4 }}><strong>المدة الإجمالية المتوقعة:</strong> {timelineDays} يوم عمل</p>
            <p style={{ marginBottom: 0 }}><strong>فترة التهيئة وبدء المشروع:</strong> 10 أيام عمل بعد توقيع العقد</p>
          </div>
          <div>
            {timelinePhases.map((ph, i) => (
              <div className="p-timeline-item" key={i}>
                <div className="p-timeline-row">
                  <span>{ph.name}</span>
                  <span>{ph.days} يوم</span>
                </div>
                <div className="p-timeline-bar">
                  <div className="p-timeline-fill" style={{ width: `${ph.pct}%` }}>
                    {ph.pct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-info-box" style={{ marginTop: 14 }}>
            الجدول الزمني تقديري ويبدأ رسمياً بعد توقيع العقد واستلام الدفعة الأولى. قد تتأثر المدة في حال تأخر تسليم المواد والمستلزمات من قِبل العميل.
          </div>
        </div>

        <PFooter label="مخرجات المشروع والجدول الزمني" page={7} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 8: METHODOLOGY & SUPPORT
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="منهجية العمل — Agile Methodology" />
          <div className="p-highlight-box">
            <p className="p-lead" style={{ marginBottom: 0 }}>
              نعتمد منهجية Agile في تطوير المشاريع، مما يضمن المرونة في التكيف مع المتطلبات المتغيرة وتسليم نتائج ملموسة في كل مرحلة بشكل منتظم ومستمر.
            </p>
          </div>
          <div className="p-grid-2">
            {[
              { num: "1", title: "التحليل والتخطيط", en: "Analysis & Planning", points: ["جمع وتحليل المتطلبات", "رسم خرائط العمليات", "تحديد الأولويات والجدول الزمني"] },
              { num: "2", title: "التصميم", en: "Design", points: ["تصميم تجربة المستخدم UX", "تصميم الواجهات UI", "مراجعة وموافقة العميل"] },
              { num: "3", title: "التطوير", en: "Development", points: ["تطوير تكراري بدورات Sprint", "مراجعة يومية للتقدم", "اختبار وحدات مستمر"] },
              { num: "4", title: "الاختبار والإطلاق", en: "Testing & Launch", points: ["اختبار شامل للجودة QA", "اختبار قبول المستخدم UAT", "النشر والإطلاق الرسمي"] },
            ].map((step, i) => (
              <div className="p-module-card" key={i} style={{ marginBottom: 0 }}>
                <div className="p-module-card-header">
                  <div className="p-module-number">{step.num}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p className="p-muted" style={{ marginBottom: 0 }}>{step.en}</p>
                  </div>
                </div>
                <div className="p-module-card-body">
                  <ul className="p-dash-list">
                    {step.points.map((pt, j) => <li key={j}>{pt}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-section">
          <PSectionTitle title="الدعم والضمان بعد التسليم" />
          <div className="p-highlight-box">
            <p style={{ marginBottom: 4 }}><strong>مدة ضمان الكود وتشغيله:</strong> 3 أشهر من تاريخ التسليم النهائي</p>
            <p style={{ marginBottom: 0 }}><strong>نوع التغطية:</strong> إصلاح الأخطاء البرمجية وضمان الاستقرار</p>
          </div>
          <ul className="p-check-list">
            {["إصلاح الأخطاء البرمجية خلال مدة الضمان بدون رسوم إضافية", "دعم تقني عبر البريد الإلكتروني والهاتف", "توفير التوثيق الكامل للمشروع", "نقل المعرفة وتدريب فريق العميل"].map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <PFooter label="منهجية التنفيذ والدعم" page={8} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 9: TEAM
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="الفريق المقترح للمشروع" />
          <div className="p-info-box">
            <p className="p-lead" style={{ marginBottom: 0 }}>
              يضم فريقنا المتخصص خبراء في مجالات متعددة، يعملون معاً بتناسق تام لضمان تسليم مشروع عالي الجودة يفوق توقعاتكم.
            </p>
          </div>

          {teamMembers.map((member, i) => (
            <div className="p-member-card" key={i}>
              <div className="p-member-card-head">
                <div className="p-member-card-head-left">
                  <div className="p-member-avatar">{member.initials}</div>
                  <div>
                    <h3>{member.name}</h3>
                    <div className="p-member-role">{member.title}</div>
                  </div>
                </div>
                <div className="p-member-exp">خبرة: <strong>{member.exp} سنوات</strong></div>
              </div>
              <div className="p-member-card-body">{member.bio}</div>
            </div>
          ))}
        </div>

        <PFooter label="الفريق المقترح للمشروع" page={9} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 10: FINANCIAL OFFER
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="العرض المالي" />
          <div className="p-info-box pre-line">
            يسعدنا تقديم العرض المالي التالي الذي يعكس قيمة الخدمات المقدمة ومستوى الجودة المضمونة. جميع الأسعار بالعملة المحددة وغير شاملة لضريبة القيمة المضافة ما لم يُذكر خلاف ذلك.
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الخدمة / البند</th>
                <th>الوصف</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {requiredItems.map((item: any, i: number) => {
                const qty = parseFloat(item.quantity || "1");
                const price = parseFloat(item.unitPrice || item.price || "0");
                const lineTotal = parseFloat(item.total || String(qty * price));
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><strong>{item.name || item.title}</strong></td>
                    <td className="p-muted">{item.description || "—"}</td>
                    <td>{qty}</td>
                    <td>{fmt(price)} {currency}</td>
                    <td><strong>{fmt(lineTotal)} {currency}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="p-totals-box">
            <div className="p-total-row t-header">
              <span>ملخص الأسعار</span>
              <span>{currency}</span>
            </div>
            <div className="p-total-row">
              <span>التكلفة الفرعية</span>
              <span>{fmt(subtotal)} {currency}</span>
            </div>
            {discount > 0 && (
              <div className="p-total-row">
                <span>الخصم</span>
                <span>- {fmt(discount)} {currency}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="p-total-row">
                <span>ضريبة القيمة المضافة</span>
                <span>{fmt(tax)} {currency}</span>
              </div>
            )}
            <div className="p-total-row t-final">
              <span>الإجمالي النهائي</span>
              <span>{fmt(total)} {currency}</span>
            </div>
          </div>
        </div>

        <PFooter label="العرض المالي وتفصيل التكلفة" page={10} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 11: PAYMENT SCHEDULE
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="شروط وجدول الدفعات" />
          <div className="p-info-box pre-line">{DEFAULT_PAYMENT_INTRO}</div>

          {paymentSchedule.length > 0 ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>المرحلة</th>
                    <th>الوصف</th>
                    <th>نسبة الدفعة</th>
                    <th>المبلغ</th>
                    <th>تاريخ الاستحقاق</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentSchedule.map((p: any, i: number) => {
                    const pct = parseFloat(p.percent || "0");
                    const amt = (pct / 100) * total;
                    return (
                      <tr key={i}>
                        <td><strong>{p.label || p.milestone}</strong></td>
                        <td>{p.notes || "—"}</td>
                        <td>{pct}%</td>
                        <td><strong>{fmt(amt)} {currency}</strong></td>
                        <td>{p.dueDate || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: 18 }}>
                {paymentSchedule.map((p: any, i: number) => {
                  const pct = parseFloat(p.percent || "0");
                  const amt = (pct / 100) * total;
                  return (
                    <div className="p-payment-bar-row" key={i}>
                      <div className="p-payment-bar-label">{p.label || p.milestone}</div>
                      <div className="p-payment-bar-wrap">
                        <div className="p-payment-bar-fill" style={{ width: `${pct}%` }}>
                          {pct}%
                        </div>
                      </div>
                      <div className="p-payment-bar-amount">{fmt(amt)} {currency}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-notice-box">
              سيتم الاتفاق على جدول الدفعات التفصيلي خلال مرحلة توقيع العقد. المعتاد لدى سوفت لكس تقسيم المدفوعات على 3 مراحل رئيسية.
            </div>
          )}
        </div>

        <PFooter label="شروط الدفع والمراحل المالية" page={11} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 12: TERMS & CONDITIONS
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="الشروط والأحكام" />
          <div className="p-info-box pre-line">{termsAndNotes}</div>
        </div>

        <div className="p-section">
          <PSectionTitle title="الملكية الفكرية والسرية" />
          <div className="p-highlight-box pre-line">{IP_TEXT}</div>
        </div>

        <PFooter label="الشروط والأحكام والملكية الفكرية" page={12} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 13: SIGNATURE PAGE
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="prop-page">
        <PHeader num={proposalNumber} date={issueDateShort} />

        <div className="p-section">
          <PSectionTitle title="التوقيع والموافقة" />

          <div className="p-info-box">
            <p style={{ marginBottom: 0 }}>
              بالتوقيع على هذا العرض، يُقرّ الطرفان بموافقتهما الكاملة على جميع الشروط والأحكام والعرض المالي المذكور في هذه الوثيقة، ويُعدّ هذا التوقيع عقداً رسمياً ملزماً للطرفين.
            </p>
          </div>

          <div className="p-signatures">
            <div className="p-signature-box" style={{ borderColor: "#fed7aa" }}>
              <div className="p-signature-title">ختم وتوقيع شركة سوفت لكس</div>
              <div className="p-signature-subtitle">Softlix Information Technology</div>
              <div className="p-signature-line" style={{ background: "rgba(255,106,0,0.03)" }}>
                توقيع الشركة
              </div>
              <div className="p-signature-details">
                <p><strong>الاسم:</strong> {authorName}</p>
                <p><strong>المسمى:</strong> {authorTitle}</p>
                <p><strong>التاريخ:</strong> {issueDateStr}</p>
              </div>
            </div>

            <div className="p-signature-box" style={{ borderColor: "#d1fae5" }}>
              <div className="p-signature-title">ختم وتوقيع العميل</div>
              <div className="p-signature-subtitle">{clientName}</div>
              <div className="p-signature-line" style={{ background: "rgba(16,185,137,0.05)" }}>
                {proposal.clientSignature ? (
                  <span style={{ color: "#059669", fontWeight: 900, fontSize: 16 }}>
                    ✓ {proposal.clientSignature}
                  </span>
                ) : "توقيع العميل"}
              </div>
              <div className="p-signature-details">
                <p><strong>الاسم:</strong> {proposal.clientSignature || "___________________"}</p>
                <p><strong>المسمى:</strong> ___________________</p>
                <p><strong>التاريخ:</strong> {proposal.signedAt ? new Date(proposal.signedAt).toLocaleDateString("ar-SA") : "___________________"}</p>
              </div>
            </div>
          </div>

          {proposal.clientSignature && (
            <div className="p-notice-box" style={{ marginTop: 14 }}>
              <Shield style={{ display: "inline", marginLeft: 6, width: 14, height: 14 }} />
              <strong>تم التوقيع رقمياً</strong> — وقّع العميل: <strong>{proposal.clientSignature}</strong>
              {proposal.signedAt && <span> بتاريخ: {new Date(proposal.signedAt).toLocaleString("ar-SA")}</span>}
            </div>
          )}
        </div>

        <div className="p-closing-card">
          <h3>شكراً لاختياركم سوفت لكس</h3>
          <div className="p-sub">Thank you for choosing Softlix Agency</div>
          <hr />
          <p>نتطلع إلى شراكة ناجحة ومستدامة معكم. فريقنا جاهز للبدء فور تأكيد الموافقة.</p>
          <p style={{ marginTop: 14, fontSize: 12 }}>info@softlix.net | www.softlixagency.com</p>
        </div>

        <PFooter label="التوقيع والاعتماد النهائي" page={13} total={TOTAL_PAGES} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE 14: OPTIONAL ITEMS (only if exist)
      ═══════════════════════════════════════════════════════════════════════ */}
      {showOptional && optionalItems.length > 0 && (
        <div className="prop-page">
          <PHeader num={proposalNumber} date={issueDateShort} />

          <div className="p-section">
            <PSectionTitle title="البنود الاختيارية الإضافية" />
            <div className="p-notice-box">
              البنود التالية غير مشمولة في العرض المالي الرئيسي ويمكن إضافتها بحسب الحاجة.
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>البند</th>
                  <th>الوصف</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {optionalItems.map((item: any, i: number) => {
                  const qty = parseFloat(item.quantity || "1");
                  const price = parseFloat(item.unitPrice || item.price || "0");
                  const lineTotal = parseFloat(item.total || String(qty * price));
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        <strong>{item.name || item.title}</strong>
                        <span className="p-item-badge" style={{ marginRight: 8 }}>اختياري</span>
                      </td>
                      <td className="p-muted">{item.description || "—"}</td>
                      <td>{qty}</td>
                      <td>{fmt(price)} {currency}</td>
                      <td><strong>{fmt(lineTotal)} {currency}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <PFooter label="البنود الاختيارية الإضافية" page={14} total={TOTAL_PAGES} />
        </div>
      )}
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
      <Loader2 className="h-8 w-8 animate-spin text-[#ff6a00]" />
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
            <Button size="sm" onClick={() => window.print()} className="gap-2 bg-[#ff6a00] hover:bg-[#ff8c00] text-white">
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
      <Loader2 className="h-8 w-8 animate-spin text-[#ff6a00]" />
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
                variant="outline" size="sm"
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
              <Button variant="outline" className="flex-1" onClick={() => setShowSignature(false)}>إلغاء</Button>
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
