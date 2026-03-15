import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { useSEO } from "@/hooks/use-seo";

interface AboutProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

const VALUES = [
  {
    num: "01",
    titleAr: "وضوح الرؤية",
    titleEn: "Vision Clarity",
    descAr: "نبدأ كل مشروع بفهم الهدف التجاري والنتيجة المطلوبة، ثم نبني الحل على هذا الأساس.",
    descEn: "We start every project by understanding the business goal and desired outcome, then build the solution on that foundation.",
  },
  {
    num: "02",
    titleAr: "جودة التنفيذ",
    titleEn: "Execution Quality",
    descAr: "نهتم بالتفاصيل الدقيقة في الهيكل، الواجهات، الأداء، والتجربة النهائية للمستخدم.",
    descEn: "We care about the fine details in structure, interfaces, performance, and the user's final experience.",
  },
  {
    num: "03",
    titleAr: "شراكة مستمرة",
    titleEn: "Ongoing Partnership",
    descAr: "ننظر إلى العلاقة مع العميل كامتداد لفريقه، وليس كمهمة تنتهي عند الإطلاق.",
    descEn: "We view the client relationship as an extension of their team, not a task that ends at launch.",
  },
];

const TIMELINE = [
  { year: "2016", titleAr: "البداية", titleEn: "The Beginning", descAr: "بدأت Softlix كفكرة طموحة في خدمات تقنية المعلومات والبنية التحتية والربط التقني.", descEn: "Softlix started as an ambitious idea in IT services, infrastructure, and technical integration." },
  { year: "2017 – 2019", titleAr: "التحول الرقمي", titleEn: "Digital Transformation", descAr: "انتقلنا من الخدمات الوسيطة إلى بناء مواقع الويب، إدارة الحملات، وتطوير الحلول التجارية.", descEn: "We moved from intermediary services to building websites, managing campaigns, and developing business solutions." },
  { year: "2020 – 2022", titleAr: "تأسيس الفريق", titleEn: "Team Building", descAr: "تم بناء الفريق البرمجي والتسويقي، وتوسيع نطاق المشاريع والعلاقات مع شركاء تقنيين أكبر.", descEn: "The technical and marketing teams were built, expanding project scope and relationships with larger tech partners." },
  { year: "اليوم", titleEn: "Today", titleAr: "مرحلة النمو", descAr: "نطوّر منصات وتطبيقات وأنظمة أعمال حديثة تستهدف شركات تبحث عن حلول قوية وقابلة للتوسع.", descEn: "We develop modern platforms, apps, and business systems targeting companies seeking powerful, scalable solutions." },
];

const SERVICES = [
  { icon: "A", titleAr: "تطبيقات الجوال", titleEn: "Mobile Apps", descAr: "تطبيقات احترافية للأعمال والتجارة والخدمات، بتجربة استخدام عصرية وسريعة.", descEn: "Professional apps for business, commerce, and services with a modern, fast user experience." },
  { icon: "B", titleAr: "منصات الويب", titleEn: "Web Platforms", descAr: "منصات قوية للشركات والأسواق الرقمية وبوابات العملاء والإدارات الداخلية.", descEn: "Powerful platforms for companies, digital marketplaces, client portals, and internal management." },
  { icon: "C", titleAr: "ERP و CRM", titleEn: "ERP & CRM", descAr: "أنظمة لإدارة العمليات، العملاء، الفواتير، الفرق، وسير الأعمال بشكل متكامل.", descEn: "Systems for managing operations, clients, invoices, teams, and workflows in an integrated manner." },
  { icon: "D", titleAr: "التجارة الإلكترونية", titleEn: "E-Commerce", descAr: "متاجر ومنظومات بيع رقمية تدعم التوسع والربط والتسويق والتحويلات العالية.", descEn: "Digital stores and sales systems supporting expansion, integration, marketing, and high conversions." },
  { icon: "E", titleAr: "التصميم وتجربة المستخدم", titleEn: "Design & UX", descAr: "تصميمات حديثة توازن بين الجمال والوضوح وتحسين رحلة المستخدم داخل المنتج.", descEn: "Modern designs balancing beauty, clarity, and improving the user journey within the product." },
  { icon: "F", titleAr: "التحول الرقمي", titleEn: "Digital Transformation", descAr: "نساعد الشركات على الانتقال من العمليات التقليدية إلى أنظمة رقمية مترابطة وفعّالة.", descEn: "We help companies transition from traditional operations to interconnected and efficient digital systems." },
];

const WHY = [
  { icon: "✓", titleAr: "فهم تجاري وتقني", titleEn: "Business & Technical Understanding", descAr: "نفهم المتطلبات التشغيلية بقدر فهمنا للتصميم والبرمجة.", descEn: "We understand operational requirements as much as we understand design and programming." },
  { icon: "↗", titleAr: "حلول قابلة للتوسع", titleEn: "Scalable Solutions", descAr: "نضع المستقبل في الحسبان من أول نسخة وحتى مراحل النمو التالية.", descEn: "We account for the future from the first version through subsequent growth stages." },
  { icon: "◎", titleAr: "جودة بصرية عالية", titleEn: "High Visual Quality", descAr: "نهتم أن يظهر المنتج النهائي بمستوى الشركات الحديثة والمنتجات العالمية.", descEn: "We ensure the final product appears at the level of modern companies and global products." },
  { icon: "∞", titleAr: "علاقة طويلة المدى", titleEn: "Long-Term Relationship", descAr: "نفضّل العمل مع عملاء يبحثون عن بناء حقيقي لا مجرد تنفيذ مؤقت.", descEn: "We prefer working with clients looking for real building, not just a temporary execution." },
];

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(15,23,42,0.07)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 14px 40px rgba(15,23,42,0.06)",
  borderRadius: 24,
  padding: 18,
};

const miniCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(15,23,42,0.07)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  borderRadius: 18,
  padding: 16,
};

export default function PublicAbout({ lang = "ar", onLangChange }: AboutProps) {
  const isAr = lang === "ar";
  useSEO({
    title: isAr ? "من نحن" : "About Us",
    description: isAr
      ? "Softlix - شركة تقنية متخصصة في بناء التطبيقات والمنصات الرقمية وتقديم حلول الأعمال للسوق السعودي والخليجي."
      : "Softlix - A tech company specializing in building apps, digital platforms and business solutions for the Saudi and Gulf market.",
    lang,
    keywords: isAr
      ? "سوفتلكس، عن الشركة، تقنية، برمجة، جدة، فريق"
      : "Softlix, about us, tech company, Jeddah, team",
  });

  const { data: pageSections } = useQuery<any>({ queryKey: ["/api/public/page-sections/about"] });
  const { data: aboutValuesData } = useQuery<any[]>({ queryKey: ["/api/public/about-values"] });
  const { data: aboutTimelineData } = useQuery<any[]>({ queryKey: ["/api/public/about-timeline"] });

  const activeValues = (aboutValuesData && aboutValuesData.length > 0)
    ? aboutValuesData.sort((a: any, b: any) => a.displayOrder - b.displayOrder).map((v: any, i: number) => ({
        num: String(i + 1).padStart(2, "0"),
        titleAr: v.titleAr,
        titleEn: v.titleEn,
        descAr: v.descriptionAr,
        descEn: v.descriptionEn,
      }))
    : VALUES;

  const activeTimeline = (aboutTimelineData && aboutTimelineData.length > 0)
    ? aboutTimelineData.sort((a: any, b: any) => a.displayOrder - b.displayOrder).map((t: any) => ({
        year: t.year,
        titleAr: t.titleAr,
        titleEn: t.titleEn,
        descAr: t.descriptionAr,
        descEn: t.descriptionEn,
      }))
    : TIMELINE;

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Cairo', system-ui, sans-serif",
        background: `
          radial-gradient(circle at 10% 10%, rgba(229,146,105,.20), transparent 28%),
          radial-gradient(circle at 85% 12%, rgba(130,183,53,.18), transparent 24%),
          linear-gradient(180deg, #ffffff 0%, #f8f9fd 34%, #f4f7fb 100%)
        `,
        color: "#0f172a",
        lineHeight: 1.8,
      }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "64px 0 36px" }}>
        <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.08fr .92fr", gap: 28, alignItems: "center" }} className="about-hero-grid">
            {/* Left: Text */}
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,.72)", border: "1px solid rgba(15,23,42,.08)", boxShadow: "0 10px 30px rgba(15,23,42,.05)", color: "#334155", fontWeight: 700, fontSize: ".92rem", marginBottom: 22 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #e59269, #82b735)", display: "inline-block" }} />
                {isAr ? "شركة تقنية تبني منصات تقود النمو" : "A tech company building growth-leading platforms"}
              </span>

              <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", lineHeight: 1.12, letterSpacing: "-.03em", fontWeight: 900, maxWidth: "11ch" }}>
                {isAr ? "نحوّل الأفكار الجريئة إلى منتجات رقمية تُحدث فرقاً حقيقياً" : "We Transform Bold Ideas into Digital Products That Make a Real Difference"}
              </h1>

              <p style={{ margin: "22px 0 0", fontSize: "1.08rem", color: "#5b6475", maxWidth: "62ch" }}>
                {isAr
                  ? "Softlix شركة تقنية متخصصة في تطوير المنصات الرقمية، تطبيقات الجوال، أنظمة ERP وCRM، وحلول التحول الرقمي التي تساعد الشركات على العمل بذكاء والنمو بثقة داخل السوق السعودي وخارجه."
                  : "Softlix is a specialized tech company in digital platforms, mobile apps, ERP & CRM systems, and digital transformation solutions helping companies work smarter and grow confidently in the Saudi market and beyond."}
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
                <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, background: "linear-gradient(135deg, #e59269, #c36c43)", color: "#fff", boxShadow: "0 14px 30px rgba(229,146,105,.28)", textDecoration: "none" }}>
                  {isAr ? "تحدث مع الفريق" : "Talk to the Team"}
                </Link>
                <a href="#story" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, background: "rgba(255,255,255,.8)", border: "1px solid rgba(15,23,42,.08)", color: "#0f172a", textDecoration: "none" }}>
                  {isAr ? "اعرف قصتنا" : "Know Our Story"}
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 30 }}>
                {[
                  { num: "120+", labelAr: "مشروع رقمي وتجاري", labelEn: "Digital & Business Projects" },
                  { num: "10+", labelAr: "سنوات من الخبرة العملية", labelEn: "Years of Practical Experience" },
                  { num: "60+", labelAr: "عميل وشراكة أعمال", labelEn: "Clients & Business Partnerships" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.78)", border: "1px solid rgba(15,23,42,.06)", borderRadius: 22, padding: 18, boxShadow: "0 12px 40px rgba(15,23,42,.05)" }}>
                    <strong style={{ display: "block", fontSize: "1.9rem", lineHeight: 1, marginBottom: 8 }}>{s.num}</strong>
                    <span style={{ color: "#5b6475", fontSize: ".94rem", fontWeight: 600 }}>{isAr ? s.labelAr : s.labelEn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual Dashboard */}
            <div style={{ position: "relative", minHeight: 560 }} className="about-visual-panel">
              <div style={{ position: "absolute", inset: "24px 0 0 70px", background: "linear-gradient(180deg, rgba(255,255,255,.94), rgba(255,255,255,.78))", border: "1px solid rgba(255,255,255,.7)", borderRadius: 32, boxShadow: "0 18px 60px rgba(15,23,42,.10)", overflow: "hidden" }}>
                {/* Overlay gradient */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(229,146,105,.12), transparent 38%), radial-gradient(circle at 80% 10%, rgba(130,183,53,.16), transparent 18%)", pointerEvents: "none" }} />

                {/* Window bar */}
                <div style={{ display: "flex", gap: 8, padding: "18px 20px 0" }}>
                  {["rgba(15,23,42,.16)", "rgba(15,23,42,.16)", "rgba(15,23,42,.16)"].map((bg, i) => (
                    <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: bg, display: "inline-block" }} />
                  ))}
                </div>

                {/* Dashboard grid */}
                <div style={{ padding: "18px 20px 22px", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 16, height: "calc(100% - 28px)" }}>
                  {/* Column 1 */}
                  <div style={{ display: "grid", gap: 16, gridAutoRows: "minmax(110px, auto)" }}>
                    <div style={card}>
                      <div style={{ fontSize: ".95rem", fontWeight: 800, marginBottom: 12 }}>{isAr ? "منهجية التنفيذ" : "Execution Methodology"}</div>
                      <div style={{ display: "grid", gap: 10 }}>
                        {[92, 78, 86, 70].map((w, i) => (
                          <div key={i} style={{ height: 10, borderRadius: 999, background: "rgba(15,23,42,.06)", overflow: "hidden" }}>
                            <div style={{ width: `${w}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #e59269, #82b735)" }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={card}>
                      <div style={{ fontSize: ".95rem", fontWeight: 800, marginBottom: 12 }}>{isAr ? "التركيز على القيمة" : "Focus on Value"}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                        {[
                          { strong: "UX", spanAr: "تجربة مستخدم عملية", spanEn: "Practical UX" },
                          { strong: "Scale", spanAr: "أنظمة قابلة للنمو", spanEn: "Scalable systems" },
                          { strong: "Speed", spanAr: "تنفيذ أسرع", spanEn: "Faster delivery" },
                          { strong: "ROI", spanAr: "أثر تجاري أوضح", spanEn: "Clearer business impact" },
                        ].map((m, i) => (
                          <div key={i} style={miniCard}>
                            <strong style={{ display: "block", fontSize: "1.4rem", marginBottom: 6 }}>{m.strong}</strong>
                            <span style={{ color: "#5b6475", fontSize: ".88rem", fontWeight: 600 }}>{isAr ? m.spanAr : m.spanEn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div style={{ display: "grid", gap: 16, gridAutoRows: "minmax(110px, auto)" }}>
                    <div style={{ ...card, minHeight: 180, display: "grid", alignContent: "start", gap: 12 }}>
                      <div style={{ fontSize: ".95rem", fontWeight: 800 }}>{isAr ? "الحلول الأساسية" : "Core Solutions"}</div>
                      {[
                        { strong: "ERP", spanAr: "إدارة وتشغيل الأعمال", spanEn: "Business operations" },
                        { strong: "Apps", spanAr: "تطبيقات iOS وAndroid", spanEn: "iOS & Android apps" },
                        { strong: "Commerce", spanAr: "تجارة إلكترونية متقدمة", spanEn: "Advanced e-commerce" },
                      ].map((s, i) => (
                        <div key={i} style={miniCard}>
                          <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: 4 }}>{s.strong}</strong>
                          <span style={{ color: "#5b6475", fontSize: ".88rem", fontWeight: 600 }}>{isAr ? s.spanAr : s.spanEn}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ ...card, display: "grid", gap: 12, alignContent: "start" }}>
                      <div style={{ fontSize: ".95rem", fontWeight: 800 }}>{isAr ? "ما يميز Softlix" : "What sets Softlix apart"}</div>
                      <p style={{ margin: 0, color: "#5b6475", fontSize: ".9rem" }}>{isAr ? "حلول مبنية على فهم تقني وتجاري معاً، وليست مجرد تنفيذ شكلي للتصميم." : "Solutions built on both technical and business understanding, not just formal design execution."}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating boxes */}
              <div style={{ position: "absolute", left: 0, top: 70, width: 220, background: "rgba(255,255,255,0.78)", border: "1px solid rgba(15,23,42,0.07)", backdropFilter: "blur(12px)", boxShadow: "0 14px 40px rgba(15,23,42,0.06)", borderRadius: 22, padding: 18, zIndex: 3 }}>
                <strong style={{ display: "block", fontSize: "1.5rem", marginBottom: 8 }}>{isAr ? "نصمم للنمو" : "We Design for Growth"}</strong>
                <p style={{ margin: 0, fontSize: ".92rem", color: "#5b6475", lineHeight: 1.7 }}>{isAr ? "كل واجهة، كل تدفق، وكل نظام يتم بناؤه لدعم الأداء والوضوح والتوسع." : "Every interface, flow, and system is built to support performance, clarity, and expansion."}</p>
              </div>
              <div style={{ position: "absolute", right: 0, bottom: 44, width: 240, background: "rgba(255,255,255,0.78)", border: "1px solid rgba(15,23,42,0.07)", backdropFilter: "blur(12px)", boxShadow: "0 14px 40px rgba(15,23,42,0.06)", borderRadius: 22, padding: 18, zIndex: 3 }}>
                <strong style={{ display: "block", fontSize: "1.5rem", marginBottom: 8 }}>{isAr ? "من الفكرة إلى الإطلاق" : "From Idea to Launch"}</strong>
                <p style={{ margin: 0, fontSize: ".92rem", color: "#5b6475", lineHeight: 1.7 }}>{isAr ? "نرافق العميل من الاستراتيجية وحتى المنتج النهائي مع تجربة تنفيذ احترافية." : "We accompany the client from strategy to the final product with a professional execution experience."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section id="story" style={{ padding: "44px 0" }}>
        <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ maxWidth: 780, marginBottom: 26 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>{isAr ? "من نحن" : "Who We Are"}</h2>
            <p style={{ margin: 0, color: "#5b6475", fontSize: "1rem" }}>{isAr ? "نبني Softlix بعقلية تجمع بين الحداثة التقنية، وضوح الرؤية التجارية، والقدرة على تحويل الاحتياج إلى منتج فعّال." : "We build Softlix with a mindset combining technical modernity, business vision clarity, and the ability to transform needs into effective products."}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: ".92fr 1.08fr", gap: 28, alignItems: "stretch" }} className="about-split-grid">
            <div style={{ borderRadius: 28, padding: 28, background: "rgba(255,255,255,.78)", border: "1px solid rgba(15,23,42,.06)", boxShadow: "0 18px 60px rgba(15,23,42,.10)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "1.45rem", fontWeight: 900 }}>{isAr ? "شركة تقنية بطموح إقليمي" : "A Tech Company with Regional Ambition"}</h3>
              <p style={{ margin: 0, color: "#5b6475" }}>{isAr ? "نؤمن أن التحول الرقمي الحقيقي لا يبدأ من الكود فقط، بل يبدأ من فهم عميق للأعمال. لهذا نعمل على تطوير أنظمة ومنصات تساعد الشركات على تنظيم عملياتها، تحسين تجربة عملائها، وتسريع نموها بأسلوب احترافي قابل للتوسع." : "We believe real digital transformation doesn't start from code alone, but from a deep understanding of business. That's why we develop systems and platforms that help companies organize their operations, improve client experience, and accelerate growth in a professional, scalable way."}</p>
            </div>

            <div style={{ borderRadius: 28, padding: 28, background: "linear-gradient(180deg, rgba(255,255,255,.94), rgba(255,255,255,.82)), radial-gradient(circle at top left, rgba(229,146,105,.12), transparent 40%)", border: "1px solid rgba(15,23,42,.06)", boxShadow: "0 18px 60px rgba(15,23,42,.10)", display: "grid", gap: 18 }}>
              <h3 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 900 }}>{isAr ? "كيف نفكر داخل Softlix" : "How We Think Inside Softlix"}</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { ar: "نبني حلولاً تعالج مشاكل تشغيلية حقيقية وليست واجهات جميلة فقط.", en: "We build solutions that address real operational problems, not just beautiful interfaces." },
                  { ar: "نوازن بين التصميم الحديث، سهولة الاستخدام، والهدف التجاري.", en: "We balance modern design, ease of use, and business goals." },
                  { ar: "نؤسس المنتجات لتكون قابلة للتطوير والربط والتوسع مستقبلاً.", en: "We build products to be extendable, integrable, and scalable in the future." },
                  { ar: "نعمل بعقلية شراكة طويلة المدى مع العميل، لا بعقلية تسليم سريع وانتهاء.", en: "We operate with a long-term partnership mindset with the client, not a quick delivery-and-done approach." },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "#1f2937", fontWeight: 600 }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: "linear-gradient(135deg, #e59269, #82b735)", marginTop: 10, flexShrink: 0, display: "inline-block" }} />
                    <span>{isAr ? b.ar : b.en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section id="values" style={{ padding: "44px 0" }}>
        <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ maxWidth: 780, marginBottom: 26 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>{isAr ? "القيم التي تحكم عملنا" : "The Values That Govern Our Work"}</h2>
            <p style={{ margin: 0, color: "#5b6475", fontSize: "1rem" }}>{isAr ? "هذه المبادئ هي التي تجعل شكل Softlix أقرب للشركات التقنية العالمية لا لشركات الخدمات التقليدية." : "These principles make Softlix closer in form to global tech companies rather than traditional service companies."}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="about-3col-grid">
            {activeValues.map((v, i) => (
              <article key={i} style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(15,23,42,0.07)", backdropFilter: "blur(12px)", boxShadow: "0 14px 40px rgba(15,23,42,0.06)", borderRadius: 24, padding: 24 }}>
                <div style={{ width: 54, height: 54, display: "inline-grid", placeItems: "center", borderRadius: 18, marginBottom: 16, background: "linear-gradient(135deg, rgba(229,146,105,.16), rgba(130,183,53,.18))", color: "#0f172a", fontSize: "1.25rem", fontWeight: 900 }}>{v.num}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.12rem", fontWeight: 900 }}>{isAr ? v.titleAr : v.titleEn}</h3>
                <p style={{ margin: 0, color: "#5b6475", fontSize: ".96rem" }}>{isAr ? v.descAr : v.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section id="journey" style={{ padding: "44px 0" }}>
        <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ maxWidth: 780, marginBottom: 26 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>{isAr ? "رحلة Softlix" : "Softlix Journey"}</h2>
            <p style={{ margin: 0, color: "#5b6475", fontSize: "1rem" }}>{isAr ? "من فكرة ناشئة إلى شركة تبني حلولاً رقمية متقدمة للشركات والمؤسسات." : "From a startup idea to a company building advanced digital solutions for businesses and institutions."}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }} className="about-4col-grid">
            {activeTimeline.map((t, i) => (
              <article key={i} style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(15,23,42,0.07)", backdropFilter: "blur(12px)", boxShadow: "0 14px 40px rgba(15,23,42,0.06)", borderRadius: 24, padding: 24 }}>
                <span style={{ display: "inline-flex", padding: "8px 14px", borderRadius: 999, marginBottom: 14, background: "rgba(15,23,42,.05)", color: "#1e293b", fontSize: ".88rem", fontWeight: 900 }}>{t.year}</span>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.12rem", fontWeight: 900 }}>{isAr ? t.titleAr : t.titleEn}</h3>
                <p style={{ margin: 0, color: "#5b6475", fontSize: ".96rem" }}>{isAr ? t.descAr : t.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE BUILD ── */}
      <section id="services" style={{ padding: "44px 0" }}>
        <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ maxWidth: 780, marginBottom: 26 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>{isAr ? "ماذا نبني" : "What We Build"}</h2>
            <p style={{ margin: 0, color: "#5b6475", fontSize: "1rem" }}>{isAr ? "نركّز على المنتجات والحلول التي تصنع فرقاً واضحاً في التشغيل، التجربة، والنمو." : "We focus on products and solutions that make a clear difference in operations, experience, and growth."}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="about-3col-grid">
            {SERVICES.map((s, i) => (
              <article key={i} style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(15,23,42,0.07)", backdropFilter: "blur(12px)", boxShadow: "0 14px 40px rgba(15,23,42,0.06)", borderRadius: 24, padding: 24 }}>
                <div style={{ width: 54, height: 54, display: "inline-grid", placeItems: "center", borderRadius: 18, marginBottom: 16, background: "linear-gradient(135deg, rgba(229,146,105,.16), rgba(130,183,53,.18))", color: "#0f172a", fontSize: "1.25rem", fontWeight: 900 }}>{s.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.12rem", fontWeight: 900 }}>{isAr ? s.titleAr : s.titleEn}</h3>
                <p style={{ margin: 0, color: "#5b6475", fontSize: ".96rem" }}>{isAr ? s.descAr : s.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SOFTLIX ── */}
      <section style={{ padding: "44px 0" }}>
        <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ maxWidth: 780, marginBottom: 26 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>{isAr ? "لماذا Softlix" : "Why Softlix"}</h2>
            <p style={{ margin: 0, color: "#5b6475", fontSize: "1rem" }}>{isAr ? "لأننا لا نقدّم مشروعاً جميلاً فقط، بل نبني أصلًا رقميًا يخدم العمل ويستمر بالنمو." : "Because we don't just deliver a beautiful project, we build a digital asset that serves the business and continues to grow."}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }} className="about-4col-grid">
            {WHY.map((w, i) => (
              <article key={i} style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(15,23,42,0.07)", backdropFilter: "blur(12px)", boxShadow: "0 14px 40px rgba(15,23,42,0.06)", borderRadius: 24, padding: 24 }}>
                <div style={{ width: 54, height: 54, display: "inline-grid", placeItems: "center", borderRadius: 18, marginBottom: 16, background: "linear-gradient(135deg, rgba(229,146,105,.16), rgba(130,183,53,.18))", color: "#0f172a", fontSize: "1.25rem", fontWeight: 900 }}>{w.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.12rem", fontWeight: 900 }}>{isAr ? w.titleAr : w.titleEn}</h3>
                <p style={{ margin: 0, color: "#5b6475", fontSize: ".96rem" }}>{isAr ? w.descAr : w.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" style={{ padding: "18px 0 70px" }}>
        <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ borderRadius: 34, padding: 34, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(229,146,105,.98), rgba(195,108,67,.98))", color: "#fff" }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.10)", top: -100, left: -30, pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.10)", bottom: -70, right: 60, pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 22, alignItems: "center" }} className="about-cta-grid">
              <div>
                <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem, 3vw, 3.2rem)", lineHeight: 1.12, fontWeight: 900 }}>
                  {isAr ? "هل لديك فكرة، منصة، أو نظام تريد إطلاقه بشكل احترافي؟" : "Have an idea, platform, or system you want to launch professionally?"}
                </h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,.88)", maxWidth: "56ch" }}>
                  {isAr ? "دعنا نبني معك تجربة رقمية بمستوى حديث، وهوية قوية، وبنية تقنية تساعد مشروعك على النمو بثقة." : "Let us build a modern-level digital experience with a strong identity and technical architecture that helps your project grow with confidence."}
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, background: "#fff", color: "#0f172a", boxShadow: "0 14px 32px rgba(0,0,0,.12)", textDecoration: "none" }}>
                  {isAr ? "ابدأ مشروعك" : "Start Your Project"}
                </Link>
                <a href="#story" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.08)", textDecoration: "none" }}>
                  {isAr ? "استكشف الشركة" : "Explore the Company"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1100px) {
          .about-hero-grid,
          .about-split-grid,
          .about-cta-grid { grid-template-columns: 1fr !important; }
          .about-3col-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .about-4col-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .about-visual-panel { min-height: 480px !important; }
        }
        @media (max-width: 760px) {
          .about-hero-grid,
          .about-split-grid,
          .about-cta-grid,
          .about-3col-grid,
          .about-4col-grid { grid-template-columns: 1fr !important; }
          .about-visual-panel { min-height: auto !important; }
        }
      `}</style>
    </div>
  );
}
