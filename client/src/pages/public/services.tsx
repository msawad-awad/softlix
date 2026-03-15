import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import type { Service } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const SERVICE_ICONS: Record<string, string> = {
  "mobile-app-development": "📱",
  "web-development": "🌐",
  "erp-systems": "🏢",
  "ecommerce": "🛒",
  "hosting-servers": "🖥️",
  "technical-consulting": "💡",
  "creative-design": "🎨",
  "digital-marketing": "📊",
  "content-management": "📝",
};

const SERVICE_LETTERS: Record<string, string> = {
  "mobile-app-development": "A",
  "web-development": "B",
  "erp-systems": "C",
  "ecommerce": "D",
  "hosting-servers": "E",
  "technical-consulting": "F",
  "creative-design": "G",
  "digital-marketing": "H",
  "content-management": "I",
};

const DEFAULT_SERVICES = [
  {
    id: "s1", slug: "mobile-app-development",
    title: "برمجة تطبيقات الجوال", titleEn: "Mobile App Development",
    shortDescription: "نحول أفكارك إلى تطبيقات جوال احترافية لـ iOS و Android",
    shortDescriptionEn: "We turn your ideas into professional iOS & Android mobile apps",
    features: ["تطبيقات iOS & Android أصلية", "Flutter متعدد المنصات", "تصميم UI/UX احترافي", "دعم مستمر بعد الإطلاق"],
    featuresEn: ["Native iOS & Android apps", "Cross-platform Flutter", "Professional UI/UX design", "Continuous post-launch support"],
  },
  {
    id: "s2", slug: "web-development",
    title: "تطوير وبرمجة المواقع", titleEn: "Web Development",
    shortDescription: "نبني هويتك الرقمية على الإنترنت بأحدث التقنيات",
    shortDescriptionEn: "We build your digital identity online with the latest technologies",
    features: ["مواقع متجاوبة سريعة", "أنظمة إدارة محتوى", "بوابات عملاء مخصصة", "منهجية Agile"],
    featuresEn: ["Fast responsive websites", "CMS systems", "Custom client portals", "Agile methodology"],
  },
  {
    id: "s3", slug: "erp-systems",
    title: "برمجة أنظمة ERP", titleEn: "ERP Systems",
    shortDescription: "أنظمة ERP مخصصة لتوحيد وإدارة جميع موارد مؤسستك",
    shortDescriptionEn: "Custom ERP systems to unify and manage all your enterprise resources",
    features: ["إدارة الموارد البشرية", "إدارة المبيعات والفواتير", "تقارير وتحليلات فورية", "تكامل مع الأنظمة القائمة"],
    featuresEn: ["HR management", "Sales & invoicing", "Real-time reports & analytics", "Integration with existing systems"],
  },
  {
    id: "s4", slug: "ecommerce",
    title: "التجارة الإلكترونية وماجنتو", titleEn: "E-Commerce & Magento",
    shortDescription: "متاجر إلكترونية احترافية تدعم التوسع والنمو",
    shortDescriptionEn: "Professional online stores supporting expansion and growth",
    features: ["متاجر Magento العربية", "WooCommerce وشوبيفاي", "بوابات الدفع المتكاملة", "تسليم في أقل من أسبوع"],
    featuresEn: ["Arabic Magento stores", "WooCommerce & Shopify", "Integrated payment gateways", "Delivery in less than a week"],
  },
  {
    id: "s5", slug: "hosting-servers",
    title: "الاستضافة والسيرفرات", titleEn: "Hosting & Servers",
    shortDescription: "استضافة آمنة وموثوقة مع دعم فني على مدار الساعة",
    shortDescriptionEn: "Secure and reliable hosting with 24/7 technical support",
    features: ["استضافة سحابية مرنة", "سيرفرات مخصصة", "دعم فني 24/7", "نسخ احتياطي تلقائي"],
    featuresEn: ["Flexible cloud hosting", "Dedicated servers", "24/7 technical support", "Automatic backups"],
  },
  {
    id: "s6", slug: "technical-consulting",
    title: "الاستشارات الفنية", titleEn: "Technical Consulting",
    shortDescription: "استشارات فنية متخصصة لتطوير مشاريعك البرمجية والتسويقية",
    shortDescriptionEn: "Specialized technical consulting for your software and marketing projects",
    features: ["تحليل الوضع الحالي", "خطة تطوير مستقبلية", "مراجعة الكود والهندسة", "استشارات تسويق رقمي"],
    featuresEn: ["Current state analysis", "Future development plan", "Code & architecture review", "Digital marketing consulting"],
  },
  {
    id: "s7", slug: "creative-design",
    title: "التصميم الإبداعي", titleEn: "Creative Design",
    shortDescription: "نحول أفكارك إلى تصاميم إبداعية تعبر عن هويتك",
    shortDescriptionEn: "We transform your ideas into creative designs that express your identity",
    features: ["هوية بصرية متكاملة", "تصميم UI/UX احترافي", "مواد تسويقية", "شعارات واجهات"],
    featuresEn: ["Integrated visual identity", "Professional UI/UX design", "Marketing materials", "Logos & interfaces"],
  },
  {
    id: "s8", slug: "digital-marketing",
    title: "خدمات التسويق الرقمي", titleEn: "Digital Marketing",
    shortDescription: "حلول تسويقية رقمية تأخذك إلى عالم التميز والمنافسة",
    shortDescriptionEn: "Digital marketing solutions that take you to excellence and competition",
    features: ["إدارة السوشيال ميديا", "إعلانات جوجل وميتا", "SEO وتحسين البحث", "تحليل وقياس الأداء"],
    featuresEn: ["Social media management", "Google & Meta ads", "SEO optimization", "Performance analysis"],
  },
  {
    id: "s9", slug: "content-management",
    title: "إدارة المحتوى والتصاميم", titleEn: "Content & Design Management",
    shortDescription: "فريق متكامل لإدارة محتوى موقعك وتصميمه باستمرار",
    shortDescriptionEn: "A complete team to manage and design your website content continuously",
    features: ["استراتيجية إدارة المحتوى", "نشر مستمر للمحتوى", "تحسين لمحركات البحث", "تحليل وقياس النتائج"],
    featuresEn: ["Content management strategy", "Continuous content publishing", "SEO optimization", "Results analysis & measurement"],
  },
];

const WHY = [
  { icon: "✓", titleAr: "خبرة تقنية وتجارية", titleEn: "Technical & Business Expertise", descAr: "نفهم مشاريعك من منظور تجاري وتقني معاً.", descEn: "We understand your projects from both business and technical perspectives." },
  { icon: "↗", titleAr: "تسليم سريع واحترافي", titleEn: "Fast & Professional Delivery", descAr: "نلتزم بالمواعيد ونسلّم بجودة عالية في كل مرة.", descEn: "We commit to deadlines and deliver high quality every time." },
  { icon: "◎", titleAr: "دعم ما بعد الإطلاق", titleEn: "Post-Launch Support", descAr: "لا ننتهي عند الإطلاق، بل نبقى شريكك التقني.", descEn: "We don't stop at launch — we stay as your tech partner." },
  { icon: "∞", titleAr: "حلول قابلة للتوسع", titleEn: "Scalable Solutions", descAr: "نبني مع الاستقبال والنمو المستقبلي في الحسبان.", descEn: "We build with future growth and expansion in mind." },
];

interface ServicesProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(15,23,42,0.07)",
  boxShadow: "0 14px 40px rgba(15,23,42,0.06)",
  backdropFilter: "blur(12px)",
};

export default function PublicServices({ lang = "ar", onLangChange }: ServicesProps) {
  const isAr = lang === "ar";
  useSEO({
    title: isAr ? "خدماتنا" : "Our Services",
    description: isAr
      ? "Softlix تقدم خدمات برمجة التطبيقات، تصميم المواقع، التسويق الرقمي، وتطوير المنصات الرقمية للأعمال."
      : "Softlix provides app development, web design, digital marketing, and digital platform development services for businesses.",
    lang,
    keywords: isAr
      ? "خدمات سوفتلكس، برمجة تطبيقات، تصميم مواقع، تسويق رقمي، CRM، ERP"
      : "Softlix services, app development, web design, digital marketing, CRM, ERP",
  });

  const { data: apiServices } = useQuery<Service[]>({
    queryKey: ["/api/public/services", TENANT_ID],
  });

  const services: any[] = (apiServices && apiServices.length > 0)
    ? apiServices.map(s => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        titleEn: s.titleEn || s.title,
        shortDescription: s.shortDescription || "",
        shortDescriptionEn: s.shortDescriptionEn || s.shortDescription || "",
        features: [],
        featuresEn: [],
      }))
    : DEFAULT_SERVICES;

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Cairo', system-ui, sans-serif",
        background: `
          radial-gradient(circle at 10% 8%, rgba(229,146,105,.14), transparent 22%),
          radial-gradient(circle at 88% 10%, rgba(130,183,53,.12), transparent 18%),
          linear-gradient(180deg, #fff 0%, #f8fafc 28%, #f2f6fb 100%)
        `,
        color: "#0f172a",
        lineHeight: 1.8,
      }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "54px 0 28px" }}>
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 28, alignItems: "center" }} className="svc-hero-grid">

            {/* Left: Text */}
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,.76)", border: "1px solid rgba(15,23,42,.08)", boxShadow: "0 10px 28px rgba(15,23,42,.05)", color: "#334155", fontSize: ".92rem", fontWeight: 800, marginBottom: 22 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #e59269, #82b735)", display: "inline-block" }} />
                {isAr ? "ما نقدمه لك" : "What We Offer You"}
              </span>

              <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", lineHeight: 1.1, fontWeight: 900, letterSpacing: "-.03em", maxWidth: "12ch" }}>
                {isAr ? "خدمات تقنية متكاملة تبني أعمالك الرقمية" : "Integrated Technical Services That Build Your Digital Business"}
              </h1>

              <p style={{ margin: "20px 0 0", fontSize: "1.05rem", color: "#5f6b7d", maxWidth: "60ch" }}>
                {isAr
                  ? "من تطبيقات الجوال إلى أنظمة ERP وحلول التجارة الإلكترونية — نغطي كل ما تحتاجه لبناء حضور رقمي قوي وقابل للنمو."
                  : "From mobile apps to ERP systems and e-commerce solutions — we cover everything you need to build a strong, scalable digital presence."}
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
                <a href="#services-grid" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, background: "linear-gradient(135deg, #e59269, #cb7147)", color: "#fff", boxShadow: "0 14px 30px rgba(229,146,105,.28)", textDecoration: "none" }}>
                  {isAr ? "استعرض الخدمات" : "Browse Services"}
                </a>
                <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, background: "rgba(255,255,255,.8)", border: "1px solid rgba(15,23,42,.08)", color: "#0f172a", textDecoration: "none" }}>
                  {isAr ? "تواصل معنا" : "Contact Us"}
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 28 }}>
                {[
                  { num: "9+", arLabel: "خدمة تقنية متخصصة", enLabel: "Specialized Tech Services" },
                  { num: "10+", arLabel: "سنوات من الخبرة", enLabel: "Years of Experience" },
                  { num: "120+", arLabel: "مشروع منجز بنجاح", enLabel: "Successfully Completed Projects" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.78)", border: "1px solid rgba(15,23,42,.06)", borderRadius: 22, padding: 18, boxShadow: "0 12px 40px rgba(15,23,42,.05)" }}>
                    <strong style={{ display: "block", fontSize: "1.85rem", lineHeight: 1, marginBottom: 8 }}>{s.num}</strong>
                    <span style={{ fontSize: ".92rem", color: "#5f6b7d", fontWeight: 700 }}>{isAr ? s.arLabel : s.enLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div style={{ position: "relative", minHeight: 580 }} className="svc-visual">
              <div style={{ position: "absolute", inset: "24px 0 0 56px", borderRadius: 34, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,.94), rgba(255,255,255,.78))", border: "1px solid rgba(255,255,255,.8)", boxShadow: "0 18px 60px rgba(15,23,42,.10)" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 14%, rgba(130,183,53,.16), transparent 16%), linear-gradient(135deg, rgba(229,146,105,.14), transparent 38%)", pointerEvents: "none" }} />

                <div style={{ display: "flex", gap: 8, padding: "18px 20px 0" }}>
                  {[1, 2, 3].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(15,23,42,.18)", display: "inline-block" }} />)}
                </div>

                <div style={{ padding: "18px", height: "calc(100% - 22px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* Left mock col */}
                  <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
                    <div style={{ ...glassCard, borderRadius: 22, padding: 18 }}>
                      <div style={{ fontSize: ".9rem", fontWeight: 800, marginBottom: 12 }}>{isAr ? "الخدمات الأكثر طلباً" : "Most Requested Services"}</div>
                      <div style={{ display: "grid", gap: 10 }}>
                        {[
                          { label: isAr ? "تطبيقات الجوال" : "Mobile Apps", pct: 94 },
                          { label: isAr ? "تطوير المواقع" : "Web Development", pct: 88 },
                          { label: isAr ? "التسويق الرقمي" : "Digital Marketing", pct: 82 },
                          { label: isAr ? "أنظمة ERP" : "ERP Systems", pct: 76 },
                        ].map((row, i) => (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", fontWeight: 700, color: "#5f6b7d", marginBottom: 4 }}>
                              <span>{row.label}</span>
                              <span>{row.pct}%</span>
                            </div>
                            <div style={{ height: 8, borderRadius: 999, background: "rgba(15,23,42,.06)", overflow: "hidden" }}>
                              <div style={{ width: `${row.pct}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #e59269, #82b735)" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                      {[
                        { icon: "📱", titleAr: "تطبيقات", titleEn: "Apps" },
                        { icon: "🌐", titleAr: "ويب", titleEn: "Web" },
                        { icon: "🏢", titleAr: "ERP", titleEn: "ERP" },
                        { icon: "📊", titleAr: "تسويق", titleEn: "Marketing" },
                      ].map((m, i) => (
                        <div key={i} style={{ ...glassCard, borderRadius: 18, padding: 14, textAlign: "center" }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
                          <span style={{ fontSize: ".82rem", fontWeight: 800, color: "#334155" }}>{isAr ? m.titleAr : m.titleEn}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right mock col */}
                  <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
                    <div style={{ ...glassCard, borderRadius: 22, padding: 18, display: "grid", gap: 12 }}>
                      <div style={{ fontSize: ".9rem", fontWeight: 800 }}>{isAr ? "ما يميز خدماتنا" : "What Sets Our Services Apart"}</div>
                      {[
                        { ar: "حلول مخصصة لكل عميل", en: "Custom solutions for each client" },
                        { ar: "تقنيات حديثة وموثوقة", en: "Modern and reliable technologies" },
                        { ar: "دعم ومتابعة مستمرة", en: "Continuous support and follow-up" },
                      ].map((b, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, color: "#334155", fontSize: ".88rem", fontWeight: 700 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, #e59269, #82b735)", marginTop: 6, flexShrink: 0, display: "inline-block" }} />
                          <span>{isAr ? b.ar : b.en}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ ...glassCard, borderRadius: 22, padding: 18 }}>
                      <div style={{ fontSize: ".9rem", fontWeight: 800, marginBottom: 10 }}>{isAr ? "معدل رضا العملاء" : "Client Satisfaction Rate"}</div>
                      <div style={{ fontSize: "2.8rem", fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #e59269, #82b735)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>98%</div>
                      <p style={{ margin: "8px 0 0", color: "#5f6b7d", fontSize: ".84rem", fontWeight: 600 }}>{isAr ? "من عملائنا يوصون بنا لشركائهم" : "of our clients recommend us to their partners"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notes */}
              <div className="svc-floater" style={{ position: "absolute", left: 0, top: 80, width: 210, ...glassCard, borderRadius: 22, padding: 18, zIndex: 3 }}>
                <strong style={{ display: "block", fontSize: "1.15rem", marginBottom: 6 }}>{isAr ? "تسليم سريع" : "Fast Delivery"}</strong>
                <p style={{ margin: 0, color: "#5f6b7d", fontSize: ".88rem", lineHeight: 1.7 }}>{isAr ? "من التصور إلى الإطلاق في أقصر وقت ممكن." : "From concept to launch in the shortest time possible."}</p>
              </div>
              <div className="svc-floater" style={{ position: "absolute", right: 0, bottom: 50, width: 228, ...glassCard, borderRadius: 22, padding: 18, zIndex: 3 }}>
                <strong style={{ display: "block", fontSize: "1.15rem", marginBottom: 6 }}>{isAr ? "شريك تقني حقيقي" : "Real Tech Partner"}</strong>
                <p style={{ margin: 0, color: "#5f6b7d", fontSize: ".88rem", lineHeight: 1.7 }}>{isAr ? "نعمل معك كامتداد لفريقك وليس كمورد خارجي." : "We work with you as an extension of your team, not an outside vendor."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section style={{ padding: "42px 0" }} id="services-grid">
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ maxWidth: 780, marginBottom: 28 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.9rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>
              {isAr ? "خدماتنا كاملة" : "Our Full Services"}
            </h2>
            <p style={{ margin: 0, color: "#5f6b7d", fontSize: "1rem" }}>
              {isAr ? "كل خدمة مصممة لتلبية احتياج تجاري حقيقي بمستوى تقني عالي." : "Every service is designed to meet a real business need at a high technical level."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="svc-cards-grid">
            {services.map((svc: any, i: number) => {
              const title = isAr ? svc.title : (svc.titleEn || svc.title);
              const desc = isAr ? svc.shortDescription : (svc.shortDescriptionEn || svc.shortDescription);
              const feats: string[] = isAr ? (svc.features || []) : (svc.featuresEn || svc.features || []);
              const icon = SERVICE_ICONS[svc.slug] || "⚡";
              const letter = SERVICE_LETTERS[svc.slug] || String.fromCharCode(65 + i);

              return (
                <article
                  key={svc.id}
                  data-testid={`service-card-${svc.id || i}`}
                  style={{ ...glassCard, borderRadius: 28, padding: 28, display: "flex", flexDirection: "column", gap: 0, transition: "transform .25s ease, box-shadow .25s ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 28px 70px rgba(15,23,42,.12)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(15,23,42,0.06)"; }}
                >
                  {/* Icon */}
                  <div style={{ width: 58, height: 58, display: "inline-grid", placeItems: "center", borderRadius: 20, marginBottom: 18, background: "linear-gradient(135deg, rgba(229,146,105,.18), rgba(130,183,53,.18))", fontSize: "1.6rem", flexShrink: 0 }}>
                    {icon}
                  </div>

                  {/* Title + Desc */}
                  <h3 style={{ margin: "0 0 10px", fontSize: "1.2rem", fontWeight: 900, lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ margin: "0 0 18px", color: "#5f6b7d", fontSize: ".94rem", lineHeight: 1.8 }}>{desc}</p>

                  {/* Features */}
                  {feats.length > 0 && (
                    <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0, display: "grid", gap: 8 }}>
                      {feats.map((feat: string, fi: number) => (
                        <li key={fi} style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: ".88rem", fontWeight: 700 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, #e59269, #82b735)", flexShrink: 0, display: "inline-block" }} />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Actions */}
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <Link
                      href={`/services/${svc.slug}`}
                      data-testid={`button-service-detail-${svc.id || i}`}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "0 18px", borderRadius: 14, background: "linear-gradient(135deg, #e59269, #cb7147)", color: "#fff", fontWeight: 900, fontSize: ".9rem", boxShadow: "0 10px 24px rgba(229,146,105,.22)", textDecoration: "none", transition: ".2s ease" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                    >
                      {isAr ? "تفاصيل الخدمة" : "Service Details"}
                    </Link>
                    <span style={{ color: "#64748b", fontWeight: 900, fontSize: ".95rem" }}>↗</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ padding: "42px 0" }}>
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ maxWidth: 780, marginBottom: 28 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.9rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>
              {isAr ? "لماذا تختار Softlix؟" : "Why Choose Softlix?"}
            </h2>
            <p style={{ margin: 0, color: "#5f6b7d", fontSize: "1rem" }}>
              {isAr ? "لأننا لا نقدّم خدمات فحسب، بل نبني شراكات حقيقية تُحقق نتائج ملموسة." : "Because we don't just provide services — we build real partnerships that achieve tangible results."}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }} className="svc-4col-grid">
            {WHY.map((w, i) => (
              <article key={i} style={{ ...glassCard, borderRadius: 24, padding: 24 }}>
                <div style={{ width: 54, height: 54, display: "inline-grid", placeItems: "center", borderRadius: 18, marginBottom: 16, background: "linear-gradient(135deg, rgba(229,146,105,.18), rgba(130,183,53,.18))", color: "#0f172a", fontSize: "1.25rem", fontWeight: 900 }}>{w.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.08rem", fontWeight: 900 }}>{isAr ? w.titleAr : w.titleEn}</h3>
                <p style={{ margin: 0, color: "#5f6b7d", fontSize: ".93rem" }}>{isAr ? w.descAr : w.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "18px 0 68px" }}>
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ borderRadius: 34, overflow: "hidden", background: "linear-gradient(135deg, rgba(229,146,105,.98), rgba(195,108,67,.98))", color: "#fff", position: "relative", padding: 34 }}>
            <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.10)", top: -100, insetInlineStart: -30, pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.10)", bottom: -70, insetInlineEnd: 60, pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 22, alignItems: "center" }} className="svc-cta-grid">
              <div>
                <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.85rem, 3vw, 3rem)", lineHeight: 1.14, fontWeight: 900 }}>
                  {isAr ? "جاهز لبدء مشروعك؟ تحدث مع فريقنا الآن" : "Ready to Start Your Project? Talk to Our Team Now"}
                </h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,.88)", maxWidth: "56ch" }}>
                  {isAr ? "دعنا نفهم احتياجك ونبني معك الحل التقني المناسب بأعلى مستوى من الجودة والاحترافية." : "Let us understand your needs and build the right technical solution with you at the highest quality and professionalism."}
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, background: "#fff", color: "#0f172a", boxShadow: "0 14px 32px rgba(0,0,0,.12)", textDecoration: "none" }}>
                  {isAr ? "تواصل معنا" : "Contact Us"}
                </Link>
                <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.08)", textDecoration: "none" }}>
                  {isAr ? "استعرض أعمالنا" : "View Our Work"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />

      <style>{`
        @media (max-width: 1100px) {
          .svc-hero-grid  { grid-template-columns: 1fr !important; }
          .svc-cta-grid   { grid-template-columns: 1fr !important; }
          .svc-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .svc-4col-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .svc-visual     { min-height: 460px !important; }
          .svc-floater    { display: none !important; }
        }
        @media (max-width: 700px) {
          .svc-hero-grid, .svc-cta-grid  { grid-template-columns: 1fr !important; }
          .svc-cards-grid, .svc-4col-grid { grid-template-columns: 1fr !important; }
          .svc-visual  { display: none !important; }
          .svc-floater { display: none !important; }
        }
      `}</style>
    </div>
  );
}
