import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const DEFAULT_PROJECTS = [
  {
    id: "p1", slug: "maskaniun", category: "mobile-app",
    title: "تطبيق مسكني", titleEn: "Maskaniun App",
    clientName: "مساكني",
    description: "منصة وتطبيق لإدارة الأملاك، تأجير الوحدات، وتنظيم العلاقة بين الملاك والمستأجرين عبر تجربة رقمية واضحة.",
    descriptionEn: "A platform and app for property management, unit leasing, and organizing the landlord-tenant relationship via a clear digital experience.",
    thumbnailUrl: "https://softlixagency.com/wp-content/uploads/2023/03/خلفية-مساكني.png",
    badge: "منصة عقارية", badgeEn: "Property Platform",
    tags: ["Property", "Mobile App", "Management"],
  },
  {
    id: "p2", slug: "taysir-app", category: "mobile-app",
    title: "تطبيق تيسير", titleEn: "Taysir App",
    clientName: "تيسير",
    description: "تجربة شراء رقمية من متاجر متعددة وسوبرماركت متنوعة، مع رحلة استخدام سهلة وسريعة للمستخدم النهائي.",
    descriptionEn: "A digital shopping experience from multiple stores and supermarkets, with an easy and fast user journey for the end user.",
    thumbnailUrl: "https://softlixagency.com/wp-content/uploads/2023/03/خلفية-بيهانس-تيسير.png",
    badge: "تسوق وخدمات", badgeEn: "Shopping & Services",
    tags: ["Marketplace", "Retail", "Delivery"],
  },
  {
    id: "p3", slug: "jamala-app", category: "mobile-app",
    title: "تطبيق جمالة", titleEn: "Jamala App",
    clientName: "جماله",
    description: "منصة تجارة جملة تربط الموردين بالتجار وتوفر تجربة طلب سريعة واحترافية لشراء المنتجات الاستهلاكية بكميات كبيرة.",
    descriptionEn: "A wholesale trading platform connecting suppliers with merchants, providing a fast and professional ordering experience for bulk consumer products.",
    thumbnailUrl: "https://softlixagency.com/wp-content/uploads/2023/03/خلفية-تطبيق-جماله.png",
    badge: "تجارة جملة", badgeEn: "Wholesale",
    tags: ["Wholesale", "B2B", "Commerce"],
  },
  {
    id: "p4", slug: "saeid-app", category: "mobile-app",
    title: "تطبيق ساعد", titleEn: "Saeid App",
    clientName: "ساعد",
    description: "منصة رقمية لخدمات المساعدة على الطريق توفر حلولاً سريعة للسائقين مثل السحب والصيانة الطارئة.",
    descriptionEn: "A digital platform for roadside assistance services providing fast solutions for drivers such as towing and emergency maintenance.",
    thumbnailUrl: null,
    badge: "خدمات الطريق", badgeEn: "Roadside Services",
    tags: ["Automotive", "Service", "Mobile"],
  },
  {
    id: "p5", slug: "transfer-app", category: "logistics",
    title: "تطبيق ترانسفير", titleEn: "Transfer App",
    clientName: "ترانسفير",
    description: "يمكّن المستخدمين من إرسال منتجاتهم بأسرع طريقة من خلال البحث عن مسافرين متجهين لنفس الوجهة.",
    descriptionEn: "Enables users to send their products in the fastest way by finding travelers heading to the same destination.",
    thumbnailUrl: null,
    badge: "شحن وتوصيل", badgeEn: "Shipping & Delivery",
    tags: ["Logistics", "P2P", "Mobile"],
  },
  {
    id: "p6", slug: "estalimni-app", category: "logistics",
    title: "تطبيق استلمني", titleEn: "Estalimni App",
    clientName: "استلمني",
    description: "ربط أصحاب الشحنات بمزودي خدمة التوصيل بشكل آمن وسريع مع لوحة تحكم متكاملة وتتبع الطلبات.",
    descriptionEn: "Connects shipment owners with delivery providers safely and quickly with an integrated control panel and order tracking.",
    thumbnailUrl: null,
    badge: "لوجستيات", badgeEn: "Logistics",
    tags: ["Delivery", "Tracking", "Mobile"],
  },
];

const CATEGORIES = [
  { value: "all", labelAr: "الكل", labelEn: "All" },
  { value: "mobile-app", labelAr: "تطبيقات الجوال", labelEn: "Mobile Apps" },
  { value: "web", labelAr: "منصات الويب", labelEn: "Web Platforms" },
  { value: "erp-system", labelAr: "أنظمة ERP", labelEn: "ERP Systems" },
  { value: "ecommerce", labelAr: "التجارة الإلكترونية", labelEn: "E-Commerce" },
  { value: "logistics", labelAr: "اللوجستيات", labelEn: "Logistics" },
];

const INDUSTRIES = [
  { icon: "🏠", titleAr: "العقارات", titleEn: "Real Estate", descAr: "منصات عقارية لربط الملاك بالمستأجرين وإدارة الوحدات.", descEn: "Property platforms connecting landlords with tenants and managing units." },
  { icon: "🛒", titleAr: "التجارة الإلكترونية", titleEn: "E-Commerce", descAr: "متاجر ومنصات بيع تدعم الجملة والتجزئة والتوصيل.", descEn: "Stores and selling platforms supporting wholesale, retail, and delivery." },
  { icon: "🚗", titleAr: "المواصلات والخدمات", titleEn: "Transport & Services", descAr: "تطبيقات النقل والمساعدة الطارئة وتتبع الطلبات.", descEn: "Transportation, emergency assistance, and order tracking applications." },
  { icon: "📦", titleAr: "اللوجستيات والشحن", titleEn: "Logistics & Shipping", descAr: "حلول تتبع الشحنات وربط المرسلين بمزودي التوصيل.", descEn: "Shipment tracking solutions connecting senders with delivery providers." },
];

const PROCESS = [
  { num: "01", titleAr: "الفهم والاستراتيجية", titleEn: "Discovery & Strategy", descAr: "ندرس الفرصة التجارية، الجمهور المستهدف، والمنافسين قبل كتابة أي كود.", descEn: "We study the business opportunity, target audience, and competitors before writing any code." },
  { num: "02", titleAr: "التصميم وتجربة المستخدم", titleEn: "Design & UX", descAr: "نبني نماذج أولية واجهات عالية الجودة تعكس منتجات التقنية العالمية.", descEn: "We build high-quality interface prototypes reflecting global tech products." },
  { num: "03", titleAr: "التطوير والبناء", titleEn: "Development & Build", descAr: "بناء المنتج بأفضل المعايير التقنية مع هيكل قابل للتوسع.", descEn: "Building the product to the highest technical standards with a scalable architecture." },
  { num: "04", titleAr: "الإطلاق والمتابعة", titleEn: "Launch & Follow-up", descAr: "إطلاق المنتج وتقييمه الميداني مع دعم مستمر وتحديثات.", descEn: "Launching the product and field evaluation with ongoing support and updates." },
];

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
  "linear-gradient(135deg, #312e81 0%, #4c1d95 100%)",
  "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
  "linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)",
  "linear-gradient(135deg, #0c4a6e 0%, #075985 100%)",
  "linear-gradient(135deg, #3b0764 0%, #5b21b6 100%)",
];

interface ProjectsProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
  slug?: string;
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.76)",
  border: "1px solid rgba(15,23,42,0.07)",
  boxShadow: "0 14px 40px rgba(15,23,42,0.06)",
  backdropFilter: "blur(12px)",
};

function ProjectDetail({ slug, lang = "ar", onLangChange }: { slug: string } & ProjectsProps) {
  const isAr = lang === "ar";
  const Arrow = isAr ? ChevronRight : ChevronLeft;

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/public/projects", slug, TENANT_ID],
    queryFn: async () => {
      const url = TENANT_ID
        ? `/api/public/projects/${slug}?tenantId=${TENANT_ID}`
        : `/api/public/projects/${slug}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const fallback = DEFAULT_PROJECTS.find(p => p.slug === slug) as any;
  const proj = (project as any) || fallback;

  useSEO({
    title: isAr ? (proj?.title || "مشروع") : (proj?.titleEn || proj?.title || "Project"),
    description: isAr ? (proj?.description || "") : (proj?.descriptionEn || proj?.description || ""),
    image: proj?.thumbnailUrl || undefined,
    type: "article",
    lang,
    keywords: isAr
      ? `${proj?.title || ""}, سوفتلكس، أعمالنا، مشاريع`
      : `${proj?.titleEn || proj?.title || ""}, Softlix, portfolio, projects`,
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", fontFamily: "'Cairo', system-ui, sans-serif", background: "#f5f7fb" }} dir={isAr ? "rtl" : "ltr"}>
        <PublicNavbar lang={lang} onLangChange={onLangChange} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "4px solid #e59269", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        </div>
        <PublicFooter lang={lang} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!proj) {
    return (
      <div style={{ minHeight: "100vh", fontFamily: "'Cairo', system-ui, sans-serif", background: "#f5f7fb" }} dir={isAr ? "rtl" : "ltr"}>
        <PublicNavbar lang={lang} onLangChange={onLangChange} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20 }}>
          <div style={{ fontSize: 64 }}>📂</div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a" }}>{isAr ? "المشروع غير موجود" : "Project Not Found"}</h2>
          <Button asChild variant="outline"><Link href="/projects">{isAr ? "العودة للمشاريع" : "Back to Projects"}</Link></Button>
        </div>
        <PublicFooter lang={lang} />
      </div>
    );
  }

  const title = isAr ? proj.title : (proj.titleEn || proj.title);
  const desc = isAr ? proj.description : (proj.descriptionEn || proj.description);
  const badge = isAr ? (proj.badge || proj.category) : (proj.badgeEn || proj.badge || proj.category);
  const tags: string[] = proj.tags || proj.technologies || [];
  const client = proj.clientName || proj.client || "";
  const images: string[] = (proj.images || []).filter(Boolean);

  /* Derive feature cards from tech stack + generic project highlights */
  const TECH_ICONS: Record<string, string> = {
    flutter: "📱", "react native": "📱", ios: "🍎", android: "🤖",
    "node.js": "⚙️", nodejs: "⚙️", express: "⚙️",
    postgresql: "🗄️", mongodb: "🗄️", mysql: "🗄️", firebase: "🔥",
    "google maps": "🗺️", stripe: "💳", paytabs: "💳", socket: "🔌",
    "ui/ux": "🎨", design: "🎨", branding: "🎨",
    dashboard: "📊", erp: "🏢", crm: "🤝",
  };
  const featureCards = tags.length > 0
    ? tags.slice(0, 6).map((t: string) => {
        const key = t.toLowerCase();
        const icon = Object.entries(TECH_ICONS).find(([k]) => key.includes(k))?.[1] || "⚡";
        return { icon, titleAr: t, titleEn: t, descAr: `تقنية ${t} مستخدمة في تطوير وبناء المنتج.`, descEn: `${t} technology used in the product's development and build.` };
      })
    : [
        { icon: "📱", titleAr: "تجربة مستخدم سلسة", titleEn: "Smooth User Experience", descAr: "واجهات بسيطة وسريعة تجعل التفاعل مع المنتج تجربة ممتعة.", descEn: "Simple, fast interfaces that make every interaction a pleasant experience." },
        { icon: "⚙️", titleAr: "بنية تقنية متينة", titleEn: "Solid Technical Architecture", descAr: "هيكل برمجي قابل للتوسع ومبني على أفضل الممارسات الحديثة.", descEn: "Scalable architecture built on modern best practices." },
        { icon: "🚀", titleAr: "أداء عالي وسرعة", titleEn: "High Performance & Speed", descAr: "تحسينات أداء شاملة تضمن تجربة سريعة على جميع الأجهزة.", descEn: "Comprehensive performance optimizations ensuring a fast experience on all devices." },
      ];

  return (
    <div
      style={{ minHeight: "100vh", fontFamily: "'Cairo', system-ui, sans-serif", background: "#f5f7fb", color: "#172033", lineHeight: 1.9 }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", overflow: "hidden", color: "#fff", padding: "110px 0 80px",
        background: "radial-gradient(circle at 15% 20%, rgba(255,255,255,.14), transparent 22%), radial-gradient(circle at 82% 25%, rgba(255,255,255,.10), transparent 18%), linear-gradient(135deg, #cb7147 0%, #e59269 45%, #f2b090 100%)"
      }}>
        {/* fade-to-bg at bottom */}
        <div style={{ position: "absolute", inset: "auto 0 0 0", height: 100, background: "linear-gradient(to top, #f5f7fb, transparent)", pointerEvents: "none" }} />

        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto", position: "relative", zIndex: 2 }}>
          {/* Breadcrumb */}
          <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.75)", fontSize: 14, textDecoration: "none", marginBottom: 32, fontWeight: 600 }}>
            <Arrow size={16} />
            {isAr ? "العودة إلى المشاريع" : "Back to Projects"}
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }} className="pd-hero-grid">
            {/* Title - full width */}
            <div>
              {badge && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", borderRadius: 999, padding: "8px 18px", fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
                  {badge}
                </span>
              )}
              <h1 style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)", lineHeight: 1.2, fontWeight: 900, margin: "0 0 18px", width: "100%", maxWidth: "100%" }}>{title}</h1>
              {client && (
                <p style={{ color: "rgba(255,255,255,.75)", fontSize: 15, fontWeight: 700, margin: "0 0 14px" }}>
                  {isAr ? "العميل:" : "Client:"} <span style={{ color: "#fff" }}>{client}</span>
                </p>
              )}
              <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,.92)", margin: "0 0 28px", maxWidth: "65ch" }}>{desc}</p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link href="/contact"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 26px", borderRadius: 14, fontWeight: 800, background: "#fff", color: "#cb7147", boxShadow: "0 10px 30px rgba(0,0,0,.12)", textDecoration: "none" }}
                  data-testid="btn-pd-contact">
                  {isAr ? "اطلب مشروعاً مشابهاً" : "Request a Similar Project"}
                </Link>
                {proj.projectUrl && (
                  <a href={proj.projectUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 14, fontWeight: 800, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", textDecoration: "none", backdropFilter: "blur(8px)" }}>
                    <ExternalLink size={15} />
                    {isAr ? "زيارة المشروع" : "Visit Project"}
                  </a>
                )}
              </div>

              {/* Stat chips */}
              {(client || tags.length > 0) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 32 }} className="pd-stats-grid">
                  {[
                    { labelAr: "العميل", labelEn: "Client", value: client || "—" },
                    { labelAr: "التصنيف", labelEn: "Category", value: badge || "—" },
                    { labelAr: "التقنيات", labelEn: "Tech Stack", value: `${tags.length}+` },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)", backdropFilter: "blur(10px)", borderRadius: 18, padding: "16px 18px" }}>
                      <strong style={{ display: "block", fontSize: "1.1rem", fontWeight: 900, marginBottom: 4 }}>{s.value}</strong>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,.82)" }}>{isAr ? s.labelAr : s.labelEn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: phone mockup */}
            <div style={{ position: "relative" }} className="pd-visual">
              <div style={{ maxWidth: 380, marginInline: "auto" }}>
                <div style={{ background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 32, padding: 16, boxShadow: "0 30px 80px rgba(0,0,0,.18)", backdropFilter: "blur(10px)" }}>
                  {proj.thumbnailUrl ? (
                    <img
                      src={proj.thumbnailUrl}
                      alt={title}
                      style={{ borderRadius: 22, width: "100%", aspectRatio: "10/16", objectFit: "cover", display: "block" }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div style={{ borderRadius: 22, width: "100%", aspectRatio: "10/16", background: "rgba(255,255,255,.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                      <div style={{ fontSize: 56 }}>📱</div>
                      <span style={{ color: "rgba(255,255,255,.75)", fontWeight: 700, fontSize: 15 }}>{title}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating cards */}
              {client && (
                <div className="pd-float" style={{ position: "absolute", background: "#fff", color: "#172033", borderRadius: 18, boxShadow: "0 18px 45px rgba(19,33,68,.10)", padding: "14px 18px", minWidth: 170, ...(isAr ? { right: -24 } : { left: -24 }), top: "14%" }}>
                  <small style={{ color: "#6b7280", display: "block", marginBottom: 5, fontWeight: 700, fontSize: 12 }}>{isAr ? "اسم العميل" : "Client Name"}</small>
                  <strong style={{ fontSize: 16, fontWeight: 800 }}>{client}</strong>
                </div>
              )}
              {tags.length > 0 && (
                <div className="pd-float" style={{ position: "absolute", background: "#fff", color: "#172033", borderRadius: 18, boxShadow: "0 18px 45px rgba(19,33,68,.10)", padding: "14px 18px", minWidth: 170, ...(isAr ? { left: -20 } : { right: -20 }), bottom: "14%" }}>
                  <small style={{ color: "#6b7280", display: "block", marginBottom: 5, fontWeight: 700, fontSize: 12 }}>{isAr ? "التقنية" : "Tech Stack"}</small>
                  <strong style={{ fontSize: 15, fontWeight: 800 }}>{tags.slice(0, 2).join(" · ")}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ── */}
      <section style={{ padding: "88px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "stretch" }} className="pd-overview-grid">
            {/* Left: description */}
            <div style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 24, padding: 34, boxShadow: "0 18px 45px rgba(19,33,68,.07)" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "1.6rem", lineHeight: 1.4, fontWeight: 900, color: "#172033" }}>
                {isAr ? "عن هذا المشروع" : "About This Project"}
              </h3>
              {proj.content ? (
                <div style={{ color: "#6b7280", fontSize: "1rem", lineHeight: 1.9 }}
                  dangerouslySetInnerHTML={{ __html: isAr ? proj.content : (proj.contentEn || proj.content) }} />
              ) : (
                <p style={{ margin: 0, color: "#6b7280", fontSize: "1.05rem" }}>{desc}</p>
              )}
              {tags.length > 0 && (
                <ul style={{ margin: "22px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 14 }}>
                  {tags.map((t: string, i: number) => (
                    <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontWeight: 700, color: "#172033" }}>
                      <span style={{ width: 10, height: 10, marginTop: 9, borderRadius: "50%", background: "#e59269", flexShrink: 0, display: "inline-block" }} />
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: project meta */}
            <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
              {[
                { icon: "💼", labelAr: "العميل", labelEn: "Client", value: client },
                { icon: "🏷️", labelAr: "التصنيف", labelEn: "Category", value: badge },
                { icon: "🛠️", labelAr: "التقنيات المستخدمة", labelEn: "Technologies Used", value: tags.join(" · ") },
                { icon: "📅", labelAr: "تاريخ الإطلاق", labelEn: "Launch Date", value: proj.createdAt ? new Date(proj.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "long" }) : "" },
              ].filter(item => item.value).map((item, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 20, padding: "22px 26px", boxShadow: "0 18px 45px rgba(19,33,68,.07)", display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, rgba(229,146,105,.15), rgba(203,113,71,.08))", display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700, marginBottom: 4 }}>{isAr ? item.labelAr : item.labelEn}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "#172033" }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES (Tech Stack) ── */}
      {featureCards.length > 0 && (
        <section style={{ padding: "0 0 88px" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
            <div style={{ maxWidth: 700, marginInline: "auto", textAlign: "center", marginBottom: 40 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(229,146,105,.10)", color: "#cb7147", border: "1px solid rgba(229,146,105,.2)", padding: "10px 18px", borderRadius: 999, fontWeight: 700, fontSize: 14 }}>
                {isAr ? "التقنيات والمميزات" : "Features & Technologies"}
              </span>
              <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.5rem)", lineHeight: 1.3, margin: "16px 0 12px", fontWeight: 900 }}>
                {isAr ? "ما يميز هذا المنتج تقنياً" : "What Makes This Product Stand Out"}
              </h2>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "1.05rem" }}>
                {isAr ? "كل تقنية وأداة في هذا المشروع تم اختيارها لتحقيق أفضل تجربة ممكنة للمستخدم النهائي." : "Every technology and tool in this project was chosen to deliver the best possible experience to the end user."}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="pd-features-grid">
              {featureCards.map((f, i) => (
                <div key={i}
                  style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 22, padding: 28, boxShadow: "0 18px 45px rgba(19,33,68,.07)", transition: ".25s ease", cursor: "default" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "")}>
                  <div style={{ width: 58, height: 58, borderRadius: 18, background: "linear-gradient(135deg, rgba(229,146,105,.18), rgba(203,113,71,.10))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                    {f.icon}
                  </div>
                  <h3 style={{ margin: "0 0 10px", fontSize: "1.15rem", fontWeight: 900 }}>{isAr ? f.titleAr : f.titleEn}</h3>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: ".95rem" }}>{isAr ? f.descAr : f.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SHOWCASE (images) ── */}
      {images.length > 0 && (
        <section style={{ padding: "88px 0", background: "#eef3fa" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
            <div style={{ maxWidth: 700, marginInline: "auto", textAlign: "center", marginBottom: 40 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(229,146,105,.10)", color: "#cb7147", border: "1px solid rgba(229,146,105,.2)", padding: "10px 18px", borderRadius: 999, fontWeight: 700, fontSize: 14 }}>
                {isAr ? "شاشات المشروع" : "Project Screenshots"}
              </span>
              <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.5rem)", lineHeight: 1.3, margin: "16px 0 12px", fontWeight: 900 }}>
                {isAr ? "عرض بصري منظم لواجهات التطبيق" : "Visual Overview of the App Interfaces"}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 24, alignItems: "start" }} className="pd-showcase-grid">
              <div style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 26, padding: 16, boxShadow: "0 18px 45px rgba(19,33,68,.07)" }}>
                <img src={images[0]} alt={`${title} screenshot 1`} style={{ borderRadius: 18, width: "100%", aspectRatio: "16/11", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pd-mini-grid">
                {images.slice(1, 5).map((img, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 20, padding: 12, boxShadow: "0 18px 45px rgba(19,33,68,.07)" }}>
                    <img src={img} alt={`${title} screenshot ${i + 2}`} style={{ borderRadius: 14, width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ padding: "88px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ background: "linear-gradient(135deg, #1b2331 0%, #2c3a4f 100%)", color: "#fff", borderRadius: 32, padding: "60px 40px", textAlign: "center", boxShadow: "0 30px 80px rgba(16,24,40,.18)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", background: "rgba(255,255,255,.04)", insetInlineEnd: -100, top: -120, pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.04)", insetInlineStart: -60, bottom: -100, pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: "clamp(1.7rem, 3.5vw, 2.8rem)", lineHeight: 1.3, fontWeight: 900 }}>
                {isAr ? "هل تريد مشروعاً بنفس هذا المستوى؟" : "Want a Project at This Level?"}
              </h2>
              <p style={{ margin: "0 auto 32px", maxWidth: 680, color: "rgba(255,255,255,.82)", fontSize: "1.05rem" }}>
                {isAr
                  ? "نحول فكرتك إلى منتج رقمي احترافي يعكس قيمة مشروعك ويحقق نتائج فعلية قابلة للقياس."
                  : "We turn your idea into a professional digital product that reflects your project's value and achieves measurable results."}
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/contact"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 52, padding: "0 32px", borderRadius: 14, fontWeight: 800, background: "#e59269", color: "#fff", boxShadow: "0 14px 30px rgba(229,146,105,.28)", textDecoration: "none" }}
                  data-testid="btn-pd-cta">
                  {isAr ? "اطلب تنفيذ مشروعك" : "Request Your Project"}
                </Link>
                <Link href="/projects"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 52, padding: "0 32px", borderRadius: 14, fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.08)", textDecoration: "none" }}>
                  {isAr ? "تصفح المشاريع الأخرى" : "Browse Other Projects"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1100px) {
          .pd-hero-grid     { grid-template-columns: 1fr !important; }
          .pd-overview-grid { grid-template-columns: 1fr !important; }
          .pd-showcase-grid { grid-template-columns: 1fr !important; }
          .pd-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .pd-visual        { display: none !important; }
          .pd-float         { display: none !important; }
          .pd-stats-grid    { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .pd-features-grid { grid-template-columns: 1fr !important; }
          .pd-mini-grid     { grid-template-columns: 1fr 1fr !important; }
          .pd-stats-grid    { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function PublicProjects({ lang = "ar", onLangChange, slug: slugProp }: ProjectsProps) {
  const isAr = lang === "ar";
  const [matchNew, paramsNew] = useRoute("/projects/:slug");
  const [matchOld, paramsOld] = useRoute("/porjects/:slug");
  const match = matchNew || matchOld;
  const routeSlug = paramsNew?.slug || paramsOld?.slug;
  const effectiveSlug = slugProp || routeSlug;
  const [activeCategory, setActiveCategory] = useState("all");

  useSEO({
    title: isAr ? "المشاريع" : "Projects",
    description: isAr
      ? "اكتشف مجموعة مشاريع Softlix في تطبيقات الجوال والمنصات الرقمية وحلول الأعمال"
      : "Discover Softlix's portfolio of mobile apps, digital platforms and business solutions",
    lang,
    keywords: isAr
      ? "مشاريع، أعمال، سوفتلكس، تطبيقات، مواقع، برمجة"
      : "projects, portfolio, Softlix, apps, websites, programming",
  });

  const { data: apiProjects } = useQuery<Project[]>({
    queryKey: ["/api/public/projects"],
    queryFn: async () => {
      const url = TENANT_ID ? `/api/public/projects?tenantId=${TENANT_ID}` : "/api/public/projects";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !effectiveSlug,
  });

  const displayProjects = apiProjects && apiProjects.length > 0
    ? (apiProjects as any[])
    : DEFAULT_PROJECTS;
  const filtered = activeCategory === "all"
    ? displayProjects
    : displayProjects.filter((p: any) => {
        if (activeCategory === "web") return p.category === "web" || p.category === "web-platform";
        return p.category === activeCategory;
      });

  if (effectiveSlug) {
    return <ProjectDetail slug={effectiveSlug} lang={lang} onLangChange={onLangChange} />;
  }

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
          <div style={{ display: "grid", gridTemplateColumns: "1.02fr .98fr", gap: 28, alignItems: "center" }} className="proj-hero-grid">

            {/* Left: Text */}
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,.76)", border: "1px solid rgba(15,23,42,.08)", boxShadow: "0 10px 28px rgba(15,23,42,.05)", color: "#334155", fontSize: ".92rem", fontWeight: 800, marginBottom: 22 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg, #e59269, #82b735)", display: "inline-block" }} />
                Portfolio / Case Studies
              </span>

              <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", lineHeight: 1.1, fontWeight: 900, letterSpacing: "-.03em", maxWidth: "10ch" }}>
                {isAr ? "مشاريع رقمية صُممت لتخدم السوق الحقيقي لا العرض فقط" : "Digital Projects Designed to Serve the Real Market, Not Just Display"}
              </h1>

              <p style={{ margin: "20px 0 0", fontSize: "1.05rem", color: "#5f6b7d", maxWidth: "62ch" }}>
                {isAr
                  ? "اكتشف مجموعة من مشاريع Softlix في تطبيقات الجوال، التجارة الإلكترونية، المنصات الخدمية، وحلول الأعمال. نحن لا نعرض أعمالاً جميلة فحسب، بل نعرض منتجات مبنية لحل مشاكل فعلية وتحقيق نمو ملموس."
                  : "Discover Softlix's portfolio of mobile apps, e-commerce, service platforms, and business solutions. We don't just showcase beautiful work — we show products built to solve real problems and achieve tangible growth."}
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
                <a href="#projects" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, background: "linear-gradient(135deg, #e59269, #cb7147)", color: "#fff", boxShadow: "0 14px 30px rgba(229,146,105,.28)", textDecoration: "none" }}>
                  {isAr ? "استكشف المشاريع" : "Explore Projects"}
                </a>
                <a href="#industries" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, background: "rgba(255,255,255,.8)", border: "1px solid rgba(15,23,42,.08)", color: "#0f172a", textDecoration: "none" }}>
                  {isAr ? "القطاعات التي نخدمها" : "Industries We Serve"}
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 28 }}>
                {[
                  { num: "50+", arLabel: "منتج ومنصة وتطبيق", enLabel: "Products, Platforms & Apps" },
                  { num: "8+", arLabel: "قطاعات أعمال مختلفة", enLabel: "Different Business Sectors" },
                  { num: "100%", arLabel: "تركيز على القيمة والتجربة", enLabel: "Focus on Value & Experience" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.78)", border: "1px solid rgba(15,23,42,.06)", borderRadius: 22, padding: 18, boxShadow: "0 12px 40px rgba(15,23,42,.05)" }}>
                    <strong style={{ display: "block", fontSize: "1.85rem", lineHeight: 1, marginBottom: 8 }}>{s.num}</strong>
                    <span style={{ fontSize: ".92rem", color: "#5f6b7d", fontWeight: 700 }}>{isAr ? s.arLabel : s.enLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Showcase board */}
            <div style={{ position: "relative", minHeight: 610 }} className="proj-visual">
              <div style={{ position: "absolute", inset: "24px 0 0 56px", borderRadius: 34, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,.94), rgba(255,255,255,.78))", border: "1px solid rgba(255,255,255,.8)", boxShadow: "0 18px 60px rgba(15,23,42,.10)" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 14%, rgba(130,183,53,.16), transparent 16%), linear-gradient(135deg, rgba(229,146,105,.14), transparent 38%)", pointerEvents: "none" }} />

                <div style={{ display: "flex", gap: 8, padding: "18px 20px 0" }}>
                  {[1, 2, 3].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(15,23,42,.18)", display: "inline-block" }} />)}
                </div>

                <div style={{ padding: "18px", height: "calc(100% - 22px)", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 16 }}>
                  {/* Mock left */}
                  <div style={{ ...glassCard, borderRadius: 24, padding: 18, display: "grid", gap: 14, alignContent: "start" }}>
                    <div style={{ borderRadius: 20, overflow: "hidden", minHeight: 182, background: "linear-gradient(135deg, rgba(34,41,51,.94), rgba(60,72,88,.92))", position: "relative", padding: 18, color: "#fff" }}>
                      <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", left: -30, bottom: -90, background: "rgba(255,255,255,.08)" }} />
                      <strong style={{ display: "block", fontSize: "1.35rem", lineHeight: 1.25, maxWidth: "10ch", position: "relative", zIndex: 1 }}>Projects designed for performance</strong>
                      <span style={{ display: "inline-flex", marginTop: 10, color: "rgba(255,255,255,.78)", fontSize: ".88rem", fontWeight: 700, position: "relative", zIndex: 1 }}>Apps • Platforms • Commerce • Systems</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                      {[
                        { strong: "Mobile", span: "iOS / Android Apps" },
                        { strong: "Web", span: "Platforms & Portals" },
                        { strong: "ERP", span: "Business Operations" },
                        { strong: "UX", span: "Modern Interfaces" },
                      ].map((m, i) => (
                        <div key={i} style={{ ...glassCard, borderRadius: 18, padding: 14 }}>
                          <strong style={{ display: "block", fontSize: "1.2rem", marginBottom: 4 }}>{m.strong}</strong>
                          <span style={{ color: "#5f6b7d", fontSize: ".84rem", fontWeight: 700 }}>{m.span}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock right */}
                  <div style={{ ...glassCard, borderRadius: 24, padding: 18, display: "grid", gap: 14, alignContent: "start" }}>
                    <strong style={{ fontSize: "1rem" }}>{isAr ? "جودة التنفيذ عبر المشاريع" : "Execution Quality Across Projects"}</strong>
                    <div style={{ display: "grid", gap: 10 }}>
                      {[92, 84, 88, 78].map((w, i) => (
                        <div key={i} style={{ height: 10, borderRadius: 999, background: "rgba(15,23,42,.06)", overflow: "hidden" }}>
                          <div style={{ width: `${w}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #e59269, #82b735)" }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ ...glassCard, borderRadius: 18, padding: 14 }}>
                      <strong style={{ display: "block", fontSize: "1.05rem", marginBottom: 4 }}>{isAr ? "واجهة حديثة" : "Modern Interface"}</strong>
                      <span style={{ color: "#5f6b7d", fontSize: ".84rem", fontWeight: 700 }}>{isAr ? "تصميم أقرب لمنتجات التقنية العالمية" : "Design closer to global tech products"}</span>
                    </div>
                    <div style={{ ...glassCard, borderRadius: 18, padding: 14 }}>
                      <strong style={{ display: "block", fontSize: "1.05rem", marginBottom: 4 }}>{isAr ? "حل تجاري" : "Business Solution"}</strong>
                      <span style={{ color: "#5f6b7d", fontSize: ".84rem", fontWeight: 700 }}>{isAr ? "كل مشروع مبني حول استخدام فعلي وحاجة حقيقية" : "Every project built around real usage and actual need"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notes */}
              <div className="proj-floater" style={{ position: "absolute", left: 0, top: 80, width: 216, ...glassCard, borderRadius: 22, padding: 18, zIndex: 3 }}>
                <strong style={{ display: "block", fontSize: "1.28rem", marginBottom: 8 }}>{isAr ? "تصميم + وظيفة" : "Design + Function"}</strong>
                <p style={{ margin: 0, color: "#5f6b7d", fontSize: ".9rem", lineHeight: 1.75 }}>{isAr ? "نعرض المشاريع باعتبارها حلولاً مكتملة لا مجرد لقطات واجهات." : "We present projects as complete solutions, not just interface screenshots."}</p>
              </div>
              <div className="proj-floater" style={{ position: "absolute", right: 0, bottom: 54, width: 232, ...glassCard, borderRadius: 22, padding: 18, zIndex: 3 }}>
                <strong style={{ display: "block", fontSize: "1.28rem", marginBottom: 8 }}>{isAr ? "تنوع قطاعات" : "Sector Diversity"}</strong>
                <p style={{ margin: 0, color: "#5f6b7d", fontSize: ".9rem", lineHeight: 1.75 }}>{isAr ? "من الخدمات واللوجستيات وحتى الإعلانات والتسوق والمنصات المتخصصة." : "From services and logistics to advertising, shopping, and specialized platforms."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS GRID ── */}
      <section style={{ padding: "42px 0" }} id="projects">
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 760 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.9rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>{isAr ? "أبرز المشاريع" : "Featured Projects"}</h2>
              <p style={{ margin: 0, color: "#5f6b7d", fontSize: "1rem" }}>{isAr ? "مشاريع مبنية لحل مشاكل فعلية، مع تجربة مستخدم بمستوى الشركات التقنية الكبيرة." : "Projects built to solve real problems, with a user experience matching large tech companies."}</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  data-testid={`filter-${cat.value}`}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    minHeight: 42, padding: "0 16px", borderRadius: 999,
                    background: activeCategory === cat.value
                      ? "linear-gradient(135deg, #e59269, #cb7147)"
                      : "rgba(255,255,255,.82)",
                    border: activeCategory === cat.value ? "1px solid transparent" : "1px solid rgba(15,23,42,.08)",
                    color: activeCategory === cat.value ? "#fff" : "#324054",
                    fontWeight: 800, fontSize: ".9rem", cursor: "pointer",
                    boxShadow: "0 10px 24px rgba(15,23,42,.04)",
                    fontFamily: "inherit",
                    transition: ".2s ease",
                  }}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#5f6b7d" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <p style={{ fontWeight: 700 }}>{isAr ? "لا توجد مشاريع في هذه الفئة" : "No projects in this category"}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="proj-cards-grid">
              {filtered.map((project: any, i: number) => {
                const title = isAr ? project.title : (project.titleEn || project.title);
                const desc = isAr ? project.description : (project.descriptionEn || project.description);
                const badge = isAr ? (project.badge || project.category) : (project.badgeEn || project.badge || project.category);
                const tags: string[] = project.tags || project.technologies || [];

                return (
                  <article
                    key={project.id}
                    data-testid={`card-project-${project.id}`}
                    style={{
                      ...glassCard,
                      borderRadius: 28,
                      overflow: "hidden",
                      transition: "transform .25s ease, box-shadow .25s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 28px 70px rgba(15,23,42,.12)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(15,23,42,0.06)"; }}
                  >
                    {/* Cover */}
                    <div style={{ position: "relative", aspectRatio: "1.2 / .92", overflow: "hidden", background: project.thumbnailUrl ? "#e8edf5" : COVER_GRADIENTS[i % COVER_GRADIENTS.length] }}>
                      {project.thumbnailUrl ? (
                        <img
                          src={project.thumbnailUrl}
                          alt={title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .35s ease", display: "block" }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 72, fontWeight: 900, color: "rgba(255,255,255,.15)", fontFamily: "monospace" }}>S</span>
                        </div>
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,.02), rgba(15,23,42,.46))" }} />
                      <span style={{ position: "absolute", top: 16, insetInlineEnd: 16, display: "inline-flex", alignItems: "center", gap: 8, minHeight: 34, padding: "0 12px", borderRadius: 999, background: "rgba(255,255,255,.88)", color: "#222933", fontSize: ".82rem", fontWeight: 900, boxShadow: "0 10px 30px rgba(15,23,42,.08)" }}>
                        {badge}
                      </span>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "22px 22px 20px" }}>
                      <h3 style={{ margin: "0 0 8px", fontSize: "1.22rem", fontWeight: 900, lineHeight: 1.35, height: 52, overflow: "hidden", display: "block", textOverflow: "ellipsis", whiteSpace: "normal" }} className="line-clamp-2">{title}</h3>
                      <p style={{ margin: 0, color: "#5f6b7d", fontSize: ".95rem", lineHeight: 1.85, minHeight: 86 }}>{desc}</p>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                        {tags.slice(0, 3).map((tag: string, ti: number) => (
                          <span key={ti} style={{ display: "inline-flex", alignItems: "center", minHeight: 32, padding: "0 12px", borderRadius: 999, background: "rgba(15,23,42,.05)", color: "#38465c", fontSize: ".8rem", fontWeight: 800 }}>{tag}</span>
                        ))}
                      </div>

                      <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <Link
                          href={`/projects/${project.slug}`}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 46, padding: "0 18px", borderRadius: 14, background: "linear-gradient(135deg, #e59269, #cb7147)", color: "#fff", fontWeight: 900, boxShadow: "0 14px 30px rgba(229,146,105,.24)", textDecoration: "none", transition: ".25s ease" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                        >
                          {isAr ? "قراءة المزيد" : "Read More"}
                        </Link>
                        <span style={{ color: "#64748b", fontWeight: 900, fontSize: "1rem" }}>↗</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section style={{ padding: "42px 0" }} id="industries">
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ maxWidth: 760, marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.9rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>{isAr ? "القطاعات التي نخدمها" : "Industries We Serve"}</h2>
            <p style={{ margin: 0, color: "#5f6b7d", fontSize: "1rem" }}>{isAr ? "خبرتنا ممتدة عبر قطاعات متعددة تجمع بين التقنية والأعمال والخدمات اليومية." : "Our expertise spans multiple sectors combining technology, business, and daily services."}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }} className="proj-4col-grid">
            {INDUSTRIES.map((ind, i) => (
              <article key={i} style={{ ...glassCard, borderRadius: 24, padding: 24 }}>
                <div style={{ width: 54, height: 54, display: "inline-grid", placeItems: "center", borderRadius: 18, marginBottom: 16, background: "linear-gradient(135deg, rgba(229,146,105,.18), rgba(130,183,53,.18))", fontSize: "1.6rem" }}>{ind.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.08rem", fontWeight: 900 }}>{isAr ? ind.titleAr : ind.titleEn}</h3>
                <p style={{ margin: 0, color: "#5f6b7d", fontSize: ".93rem" }}>{isAr ? ind.descAr : ind.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section style={{ padding: "42px 0" }} id="process">
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ maxWidth: 760, marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.9rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>{isAr ? "منهجية التنفيذ" : "Execution Methodology"}</h2>
            <p style={{ margin: 0, color: "#5f6b7d", fontSize: "1rem" }}>{isAr ? "نتبع منهجية واضحة في كل مشروع تضمن جودة التسليم والنتائج الملموسة." : "We follow a clear methodology in every project ensuring delivery quality and tangible results."}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }} className="proj-4col-grid">
            {PROCESS.map((proc, i) => (
              <article key={i} style={{ ...glassCard, borderRadius: 24, padding: 24 }}>
                <div style={{ width: 54, height: 54, display: "inline-grid", placeItems: "center", borderRadius: 18, marginBottom: 16, background: "linear-gradient(135deg, rgba(229,146,105,.18), rgba(130,183,53,.18))", color: "#0f172a", fontSize: "1.2rem", fontWeight: 900 }}>{proc.num}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.08rem", fontWeight: 900 }}>{isAr ? proc.titleAr : proc.titleEn}</h3>
                <p style={{ margin: 0, color: "#5f6b7d", fontSize: ".93rem" }}>{isAr ? proc.descAr : proc.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "18px 0 68px" }} id="cta">
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ borderRadius: 34, overflow: "hidden", background: "linear-gradient(135deg, #222933, #323c4b)", color: "#fff", position: "relative", padding: 34 }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.06)", insetInlineEnd: -40, top: -110, pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.06)", insetInlineStart: 40, bottom: -80, pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 22, alignItems: "center" }} className="proj-cta-grid">
              <div>
                <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.85rem, 3vw, 3rem)", lineHeight: 1.14, fontWeight: 900 }}>
                  {isAr ? "هل لديك مشروع جاهز للإطلاق أو فكرة تريد تحويلها إلى منتج؟" : "Do you have a project ready to launch or an idea you want to turn into a product?"}
                </h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,.82)", maxWidth: "58ch" }}>
                  {isAr ? "دعنا نبني معك منصة أو تطبيق أو نظام بمستوى عالمي، مع تجربة تنفيذ احترافية ونتائج قابلة للقياس." : "Let's build a platform, app, or system with you at a global level, with a professional execution experience and measurable results."}
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, background: "#fff", color: "#0f172a", boxShadow: "0 14px 32px rgba(0,0,0,.12)", textDecoration: "none" }}>
                  {isAr ? "ابدأ مشروعك" : "Start Your Project"}
                </Link>
                <Link href="/services" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, fontWeight: 800, color: "#fff", border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.08)", textDecoration: "none" }}>
                  {isAr ? "استعرض خدماتنا" : "Browse Our Services"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />

      <style>{`
        @media (max-width: 1180px) {
          .proj-hero-grid  { grid-template-columns: 1fr !important; }
          .proj-cta-grid   { grid-template-columns: 1fr !important; }
          .proj-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .proj-4col-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .proj-visual     { min-height: 460px !important; }
          .proj-floater    { display: none !important; }
        }
        @media (max-width: 760px) {
          .proj-hero-grid, .proj-cta-grid   { grid-template-columns: 1fr !important; }
          .proj-cards-grid, .proj-4col-grid { grid-template-columns: 1fr !important; }
          .proj-visual  { display: none !important; }
          .proj-floater { display: none !important; }
        }
      `}</style>
    </div>
  );
}
