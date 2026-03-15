import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { PublicNavbar } from "@/components/public/navbar";
import { useSEO } from "@/hooks/use-seo";
import { PublicFooter } from "@/components/public/footer";
import type { Service, Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const STATS = [
  { value: "150+", labelAr: "مشروع تم تنفيذه", labelEn: "Projects Done" },
  { value: "10+", labelAr: "سنوات خبرة", labelEn: "Years Experience" },
  { value: "50+", labelAr: "عميل مميز", labelEn: "Happy Clients" },
  { value: "24/7", labelAr: "دعم واستشارات", labelEn: "Support" },
];

const SERVICES_STATIC = [
  { icon: "💻", titleAr: "تطوير المواقع والمنصات", titleEn: "Web & Platform Development", descAr: "مواقع شركات، منصات خدمات، بوابات عملاء، وصفحات هبوط احترافية سريعة ومتجاوبة.", descEn: "Company websites, service platforms, customer portals, and professional responsive landing pages.", features: ["تصميم UI/UX حديث", "أداء وسرعة ممتازة", "تجربة متوافقة مع الجوال"], featuresEn: ["Modern UI/UX Design", "Excellent Performance & Speed", "Mobile-compatible Experience"], slug: "web-development" },
  { icon: "📱", titleAr: "تطبيقات الجوال", titleEn: "Mobile Applications", descAr: "تطبيقات Android و iOS بواجهات سلسة وتجربة استخدام واضحة تخدم العميل والإدارة.", descEn: "Android and iOS apps with smooth interfaces and clear user experience for clients and management.", features: ["ربط API ولوحات تحكم", "إشعارات وتنبيهات", "قابلية التوسع مستقبلاً"], featuresEn: ["API integration & dashboards", "Notifications & alerts", "Future scalability"], slug: "mobile-app-development" },
  { icon: "🧩", titleAr: "أنظمة CRM و ERP", titleEn: "CRM & ERP Systems", descAr: "أنظمة لإدارة العملاء، الطلبات، الفرق، العمليات، والتقارير بما يتناسب مع طبيعة عملك.", descEn: "Systems for managing clients, orders, teams, operations, and reports tailored to your business.", features: ["صلاحيات متعددة", "تقارير ولوحات قياس", "أتمتة للعمليات"], featuresEn: ["Multiple permissions", "Reports & dashboards", "Process automation"], slug: "erp-systems" },
  { icon: "🛒", titleAr: "المتاجر الإلكترونية", titleEn: "E-Commerce Stores", descAr: "متاجر حديثة تركز على سرعة التصفح، إبراز المنتجات، وتحسين رحلة الشراء.", descEn: "Modern stores focused on browsing speed, product showcasing, and improving the purchase journey.", features: ["ربط الدفع والشحن", "لوحة إدارة مرنة", "دعم الكوبونات والعروض"], featuresEn: ["Payment & shipping integration", "Flexible admin panel", "Coupons & promotions support"], slug: "ecommerce" },
  { icon: "🎨", titleAr: "الهوية والتصميم", titleEn: "Identity & Design", descAr: "تصميم واجهات وهوية رقمية تعكس قوة نشاطك وتمنحك حضوراً احترافياً في السوق.", descEn: "UI/UX and digital identity design that reflects your business strength and gives you a professional market presence.", features: ["تصميم صفحات رئيسية", "بروفايل ومواد بصرية", "دليل نمط بصري"], featuresEn: ["Landing page design", "Profile & visual materials", "Visual style guide"], slug: "creative-design" },
  { icon: "🚀", titleAr: "الاستضافة والدعم الفني", titleEn: "Hosting & Technical Support", descAr: "إدارة نشر المشاريع، المتابعة الفنية، والتحسين المستمر لضمان الاستقرار والأمان.", descEn: "Project deployment management, technical follow-up, and continuous improvement for stability and security.", features: ["إعداد السيرفرات", "نسخ احتياطي ومراقبة", "دعم ما بعد الإطلاق"], featuresEn: ["Server setup", "Backup & monitoring", "Post-launch support"], slug: "hosting-servers" },
];

const FEATURES = [
  { num: "01", titleAr: "تصميم احترافي يرفع الثقة", titleEn: "Professional Design Builds Trust", descAr: "واجهة بصرية حديثة، هرمية واضحة للمحتوى، ورسائل تسويقية أكثر إقناعاً.", descEn: "Modern visual interface, clear content hierarchy, and more persuasive marketing messages." },
  { num: "02", titleAr: "تنظيم أفضل لعرض الخدمات", titleEn: "Better Service Presentation", descAr: "تقسيم واضح للخدمات والمشاريع والميزات لتسهيل الفهم واتخاذ قرار التواصل.", descEn: "Clear categorization of services, projects, and features for easier understanding and decision-making." },
  { num: "03", titleAr: "جاهز للتطوير البرمجي", titleEn: "Ready for Development", descAr: "هيكل واضح وسهل للتجزئة إلى Components وربطه بالنظام أو الـ CMS بسهولة.", descEn: "Clear structure, easy to break into components and connect to the system or CMS." },
];

const PROCESS = [
  { num: "01", titleAr: "فهم المتطلبات", titleEn: "Understanding Requirements", descAr: "تحليل النشاط، الهدف، الجمهور المستهدف، ونطاق المشروع بشكل واضح.", descEn: "Analyzing the business, goal, target audience, and project scope clearly." },
  { num: "02", titleAr: "التصميم والهيكلة", titleEn: "Design & Structure", descAr: "وضع Wireframe ثم واجهات احترافية تعكس الهوية وتدعم تجربة المستخدم.", descEn: "Creating wireframes then professional interfaces reflecting the identity and supporting UX." },
  { num: "03", titleAr: "التطوير والربط", titleEn: "Development & Integration", descAr: "برمجة الواجهة والخلفية وربط الخدمات والأنظمة الخارجية حسب الحاجة.", descEn: "Programming frontend and backend and connecting services and external systems as needed." },
  { num: "04", titleAr: "الإطلاق والتحسين", titleEn: "Launch & Improvement", descAr: "اختبارات نهائية، نشر المشروع، ومتابعة الأداء بعد الإطلاق.", descEn: "Final tests, project deployment, and performance monitoring after launch." },
];

const TESTIMONIALS = [
  { stars: 5, quoteAr: "تم تنفيذ المشروع بشكل احترافي جداً، وكان هناك فهم واضح للمتطلبات مع جودة عالية في التصميم والتنفيذ.", quoteEn: "The project was executed very professionally with a clear understanding of requirements and high quality in design and execution.", nameAr: "محمد العتيبي", nameEn: "Mohammed Al-Otaibi", roleAr: "مدير تنفيذي", roleEn: "Executive Director", initial: "م" },
  { stars: 5, quoteAr: "أكثر ما أعجبنا هو تنظيم العمل وسرعة الاستجابة، إضافة إلى أن الواجهة النهائية كانت أفضل من المتوقع.", quoteEn: "What impressed us most was the work organization and quick response, plus the final interface was better than expected.", nameAr: "سارة الشهري", nameEn: "Sara Al-Shahri", roleAr: "صاحبة متجر إلكتروني", roleEn: "E-commerce Store Owner", initial: "س" },
  { stars: 5, quoteAr: "تم بناء النظام بما يتناسب مع احتياجنا الفعلي، مع مرونة في التطوير المستقبلي ودعم فني ممتاز.", quoteEn: "The system was built to suit our actual needs, with flexibility for future development and excellent technical support.", nameAr: "أحمد الزهراني", nameEn: "Ahmed Al-Zahrani", roleAr: "مدير عمليات", roleEn: "Operations Manager", initial: "أ" },
];

const PROJECT_COLORS = [
  "linear-gradient(135deg, #0f172a, #1d4ed8)",
  "linear-gradient(135deg, #111827, #0ea5e9)",
  "linear-gradient(135deg, #1e293b, #06b6d4)",
  "linear-gradient(135deg, #0f172a, #7c3aed)",
  "linear-gradient(135deg, #111827, #0284c7)",
  "linear-gradient(135deg, #1e293b, #0891b2)",
];

interface HomeProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

interface LeadForm {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
}

export default function PublicHome({ lang = "ar", onLangChange }: HomeProps) {
  const isAr = lang === "ar";
  const { toast } = useToast();

  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/public/services", TENANT_ID] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/public/projects", TENANT_ID] });
  const { data: clients } = useQuery<any[]>({ queryKey: ["/api/public/clients", TENANT_ID] });
  const { data: siteStatsData } = useQuery<any[]>({ queryKey: ["/api/public/site-stats"] });
  const { data: processStepsData } = useQuery<any[]>({ queryKey: ["/api/public/process-steps"] });
  const { data: testimonialsData } = useQuery<any[]>({ queryKey: ["/api/public/testimonials"] });
  const { data: whyUsData } = useQuery<any[]>({ queryKey: ["/api/public/why-us"] });
  const { data: pageSections } = useQuery<any>({ queryKey: ["/api/public/page-sections/home"] });
  const { data: siteSettings } = useQuery<any>({ queryKey: ["/api/public/site-settings"] });

  useSEO({
    title: isAr
      ? (siteSettings?.siteDescAr ? "شريكك التقني المتكامل" : "شريكك التقني المتكامل")
      : "Your Complete Tech Partner",
    description: isAr
      ? (siteSettings?.siteDescAr || "Softlix - شريكك التقني المتكامل في برمجة التطبيقات والتسويق الرقمي. نحوّل أفكارك إلى منتجات رقمية ناجحة.")
      : (siteSettings?.siteDescEn || "Softlix - Your complete tech partner in app development and digital marketing. We turn your ideas into successful digital products."),
    siteName: isAr ? (siteSettings?.siteNameAr || "Softlix") : (siteSettings?.siteNameEn || "Softlix"),
    lang,
    keywords: isAr
      ? "تطبيقات، مواقع، CRM، ERP، تسويق رقمي، برمجة، جدة، سوفتلكس"
      : "apps, websites, CRM, ERP, digital marketing, software, Jeddah, Softlix",
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadForm>();

  const heroTitle = isAr
    ? (pageSections?.hero?.contentAr?.h1 || "نطوّر مواقع وتطبيقات وأنظمة CRM تساعدك على النمو بسرعة وثقة")
    : (pageSections?.hero?.contentEn?.h1 || "We Build Websites, Apps & CRM Systems to Help You Grow Fast");
  const heroSubtitle = isAr
    ? (pageSections?.hero?.contentAr?.subtitle || "نصمم ونبني حلولاً رقمية حديثة تشمل المواقع الاحترافية، المتاجر الإلكترونية، تطبيقات الجوال، وأنظمة إدارة العملاء والعمليات.")
    : (pageSections?.hero?.contentEn?.subtitle || "We design and build modern digital solutions including professional websites, e-commerce stores, mobile apps, and customer management systems.");
  const heroBadge = isAr
    ? (pageSections?.hero?.contentAr?.badge || "حلول رقمية متكاملة للشركات ورواد الأعمال")
    : (pageSections?.hero?.contentEn?.badge || "Integrated Digital Solutions for Businesses & Entrepreneurs");

  const activeStats = (siteStatsData && siteStatsData.length > 0)
    ? siteStatsData.map((s: any) => ({ value: s.value, labelAr: s.labelAr, labelEn: s.labelEn }))
    : STATS;

  const activeProcess = (processStepsData && processStepsData.length > 0)
    ? processStepsData.sort((a: any, b: any) => a.displayOrder - b.displayOrder).map((s: any, i: number) => ({
        num: String(s.stepNumber ?? i + 1).padStart(2, "0"),
        titleAr: s.titleAr,
        titleEn: s.titleEn,
        descAr: s.descriptionAr,
        descEn: s.descriptionEn,
      }))
    : PROCESS;

  const activeTestimonials = (testimonialsData && testimonialsData.length > 0)
    ? testimonialsData.sort((a: any, b: any) => a.displayOrder - b.displayOrder).map((t: any) => ({
        stars: t.rating ?? 5,
        quoteAr: t.quoteAr,
        quoteEn: t.quoteEn,
        nameAr: t.nameAr,
        nameEn: t.nameEn,
        roleAr: t.roleAr,
        roleEn: t.roleEn,
        initial: (t.nameAr || t.nameEn || "؟").charAt(0),
      }))
    : TESTIMONIALS;

  const activeFeatures = (whyUsData && whyUsData.length > 0)
    ? whyUsData.sort((a: any, b: any) => a.displayOrder - b.displayOrder).map((f: any, i: number) => ({
        num: String(i + 1).padStart(2, "0"),
        titleAr: f.titleAr,
        titleEn: f.titleEn,
        descAr: f.descAr,
        descEn: f.descEn,
      }))
    : FEATURES;

  const leadMutation = useMutation({
    mutationFn: (data: LeadForm) =>
      apiRequest("POST", "/api/public/leads", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: `الشركة: ${data.company || "-"}\nالخدمة: ${data.service || "-"}\nالميزانية: ${data.budget || "-"}\n\n${data.message}`,
        source: "contact-form",
      }),
    onSuccess: () => {
      toast({ title: isAr ? "تم إرسال طلبك بنجاح ✓" : "Request sent successfully ✓", description: isAr ? "سنتواصل معك في أقرب وقت" : "We will contact you soon" });
      reset();
    },
    onError: () => {
      toast({ title: isAr ? "حدث خطأ" : "Error occurred", variant: "destructive" });
    },
  });

  const displayProjects = projects?.slice(0, 3) ?? [];

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: "#f8fafc", color: "#0f172a", lineHeight: 1.7, margin: 0 }}
    >
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* ── Hero ───────────────────────────────────────── */}
      <section style={{
        position: "relative", overflow: "hidden", paddingTop: 72, paddingBottom: 40,
        background: "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.14), transparent 32%), radial-gradient(circle at 80% 0%, rgba(37,99,235,0.12), transparent 26%), linear-gradient(180deg,#fff 0%,#f8fbff 100%)"
      }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 36, alignItems: "center" }} className="hero-grid-responsive">

            {/* Left: Text */}
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 18 }}>
                {heroBadge}
              </span>
              <h1 style={{ margin: "0 0 18px", fontSize: "clamp(26px, 3.5vw, 42px)", lineHeight: 1.15, letterSpacing: -0.5, color: "#0f172a", fontWeight: 800 }}>
                {heroTitle}
              </h1>
              <p style={{ margin: 0, fontSize: 18, color: "#64748b", maxWidth: 680 }}>
                {heroSubtitle}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
                <a href="#contact" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "#fff", boxShadow: "0 12px 30px rgba(37,99,235,0.25)", textDecoration: "none", border: 0 }} data-testid="btn-hero-contact">
                  {isAr ? "ابدأ مشروعك الآن" : "Start Your Project Now"}
                </a>
                <a href="#projects" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", background: "#fff", color: "#0f172a", border: "1px solid rgba(15,23,42,0.1)", textDecoration: "none" }} data-testid="btn-hero-projects">
                  {isAr ? "استعرض أعمالنا" : "View Our Work"}
                </a>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 34 }} className="stats-grid-responsive">
                {activeStats.map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(226,232,240,0.9)", borderRadius: 18, padding: 18, boxShadow: "0 20px 50px rgba(15,23,42,0.08)" }}>
                    <strong style={{ display: "block", fontSize: 28, color: "#0f172a", lineHeight: 1.1, marginBottom: 6 }}>{s.value}</strong>
                    <span style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>{isAr ? s.labelAr : s.labelEn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard mockup */}
            <div style={{ position: "relative" }} className="home-hero-right">
              <div style={{ background: "linear-gradient(180deg,#0f172a 0%,#111827 100%)", borderRadius: 30, padding: 20, boxShadow: "0 35px 90px rgba(15,23,42,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 16 }}>
                  <div>
                    <strong style={{ fontSize: 18, display: "block", marginBottom: 4 }}>{isAr ? "لوحة تحكم المشاريع" : "Projects Dashboard"}</strong>
                    <span style={{ color: "#94a3b8", fontSize: 14 }}>{isAr ? "متابعة الأداء، الطلبات، والعملاء في مكان واحد" : "Track performance, orders, and clients in one place"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", display: "inline-block", background: "#f87171" }} />
                    <span style={{ width: 11, height: 11, borderRadius: "50%", display: "inline-block", background: "#fbbf24" }} />
                    <span style={{ width: 11, height: 11, borderRadius: "50%", display: "inline-block", background: "#34d399" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
                  {/* Chart panel */}
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 22, padding: 18 }}>
                    <h4 style={{ margin: "0 0 14px", fontSize: 16, color: "#e2e8f0" }}>{isAr ? "نمو الطلبات" : "Orders Growth"}</h4>
                    <div style={{ display: "flex", alignItems: "end", gap: 10, minHeight: 180 }}>
                      {[38, 52, 44, 70, 84, 92].map((h, i) => (
                        <div key={i} style={{ flex: 1, background: "linear-gradient(180deg,#38bdf8,#2563eb)", borderRadius: "16px 16px 8px 8px", opacity: 0.95, height: `${h}%` }} />
                      ))}
                    </div>
                  </div>

                  {/* Mini cards panel */}
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 22, padding: 18 }}>
                    <h4 style={{ margin: "0 0 14px", fontSize: 16, color: "#e2e8f0" }}>{isAr ? "ملخص سريع" : "Quick Summary"}</h4>
                    <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                      {[
                        { labelAr: "العملاء النشطون", labelEn: "Active Clients", value: "1,284", badge: "+18%" },
                        { labelAr: "الطلبات المكتملة", labelEn: "Completed Orders", value: "320", badge: isAr ? "هذا الشهر" : "This month" },
                        { labelAr: "معدل التحويل", labelEn: "Conversion Rate", value: "27%", badge: isAr ? "ممتاز" : "Excellent" },
                      ].map((item, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <div>
                            <span style={{ color: "#cbd5e1", fontSize: 13 }}>{isAr ? item.labelAr : item.labelEn}</span>
                            <strong style={{ display: "block", color: "#fff", fontSize: 18 }}>{item.value}</strong>
                          </div>
                          <span style={{ color: "#94a3b8", fontSize: 12 }}>{item.badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="hero-badge" style={{ position: "absolute", background: "#fff", color: "#0f172a", borderRadius: 20, padding: "14px 16px", boxShadow: "0 20px 50px rgba(15,23,42,0.08)", border: "1px solid #e2e8f0", minWidth: 180, ...(isAr ? { right: -12 } : { left: -12 }), top: 28 }}>
                <strong style={{ display: "block", fontSize: 18, lineHeight: 1.2 }}>{isAr ? "واجهات حديثة" : "Modern Interfaces"}</strong>
                <span style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>{isAr ? "تصميم يرفع الثقة ويزيد التحويل" : "Design that builds trust & increases conversion"}</span>
              </div>
              <div className="hero-badge" style={{ position: "absolute", background: "#fff", color: "#0f172a", borderRadius: 20, padding: "14px 16px", boxShadow: "0 20px 50px rgba(15,23,42,0.08)", border: "1px solid #e2e8f0", minWidth: 180, ...(isAr ? { left: -16 } : { right: -16 }), bottom: 28 }}>
                <strong style={{ display: "block", fontSize: 18, lineHeight: 1.2 }}>{isAr ? "أنظمة قابلة للتوسع" : "Scalable Systems"}</strong>
                <span style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>{isAr ? "جاهزة للنمو والربط والتطوير المستقبلي" : "Ready for growth, integration & future development"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────── */}
      <section id="services" style={{ padding: "88px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                {isAr ? "خدماتنا" : "Our Services"}
              </span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "حلول تقنية مصممة لتناسب احتياج نشاطك" : "Tech Solutions Designed for Your Business"}
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 720, color: "#64748b", fontSize: 17 }}>
              {isAr
                ? "لا نقدم مجرد تصميم جميل، بل نبني تجربة رقمية متكاملة تساعدك على إدارة أعمالك وزيادة فرص البيع والنمو."
                : "We don't just offer beautiful design, we build a complete digital experience that helps you manage your business and increase growth."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="services-grid-responsive" data-testid="section-services">
            {(services && services.length > 0 ? services : SERVICES_STATIC).map((service: any, i: number) => (
              <a key={service.id ?? i} href={`/services/${service.slug}`} style={{ textDecoration: "none" }} data-testid={`card-service-${service.id ?? i}`}>
                <article style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 22, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 26, transition: "0.3s ease", cursor: "pointer", height: "100%" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-6px)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, display: "grid", placeItems: "center", fontSize: 26, background: "linear-gradient(135deg,#dbeafe,#e0f2fe)", color: "#2563eb", marginBottom: 18 }}>
                    {service.icon ?? "⚡"}
                  </div>
                  <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                    {isAr ? (service.titleAr ?? service.title) : (service.titleEn ?? service.title)}
                  </h3>
                  <p style={{ margin: "0 0 18px", color: "#64748b" }}>
                    {isAr ? (service.descAr ?? service.shortDescription ?? service.fullDescription) : (service.descEn ?? service.shortDescriptionEn ?? service.shortDescription)}
                  </p>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10, color: "#334155", fontWeight: 700, fontSize: 14 }}>
                    {((isAr ? (service.features ?? service.featuresAr) : (service.featuresEn ?? service.features)) ?? []).slice(0, 3).map((f: string, fi: number) => (
                      <li key={fi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#16a34a", fontWeight: 900 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </article>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects ─────────────────────────────────── */}
      <section id="projects" style={{ padding: "88px 0", background: "linear-gradient(180deg,#fff 0%,#f8fbff 100%)" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                {isAr ? "أحدث الأعمال" : "Latest Work"}
              </span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "نماذج من المشاريع التي تعكس مستوى التنفيذ" : "Projects That Reflect Our Execution Quality"}
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 720, color: "#64748b", fontSize: 17 }}>
              {isAr ? "نماذج حقيقية من مشاريعنا المنجزة مع عملاء متميزين في المملكة العربية السعودية." : "Real samples from our completed projects with distinguished clients in Saudi Arabia."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="projects-grid-responsive" data-testid="section-projects">
            {(displayProjects.length > 0 ? displayProjects : [
              { id: "1", title: "منصة لوجستية", titleEn: "Logistics Platform", description: "حل رقمي لإدارة عمليات التوصيل والطلبات والمحافظ والتقارير التشغيلية.", descriptionEn: "Digital solution for managing delivery operations, orders, wallets, and operational reports.", category: "Logistics", technologies: ["Dashboard", "Mobile App"] },
              { id: "2", title: "منصة موردين", titleEn: "Suppliers Platform", description: "منصة أعمال لعرض الموردين والمنتجات وإدارة طلبات الشراء والعروض.", descriptionEn: "Business platform for showcasing suppliers and products and managing purchase orders.", category: "B2B", technologies: ["RFQ", "Procurement"] },
              { id: "3", title: "متجر احترافي", titleEn: "Professional Store", description: "متجر إلكتروني بهوية راقية مع إبراز المنتجات والعروض وتحسين الموثوقية.", descriptionEn: "E-commerce store with a premium identity showcasing products and promotions.", category: "E-commerce", technologies: ["Luxury UI", "Branding"] },
            ] as any[]).map((project: any, i: number) => (
              <a key={project.id} href={`/projects/${project.slug ?? project.id}`} style={{ textDecoration: "none" }} data-testid={`card-project-${project.id}`}>
                <article style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 22, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", overflow: "hidden", transition: "0.3s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-6px)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                  {/* Cover */}
                  <div style={{ height: 220, padding: 22, position: "relative", background: project.thumbnailUrl ? undefined : PROJECT_COLORS[i % PROJECT_COLORS.length], color: "#fff", display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16 }}>
                    {project.thumbnailUrl && <img src={project.thumbnailUrl} alt={project.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                    {!project.thumbnailUrl && <>
                      {project.category && <span style={{ position: "absolute", top: 18, insetInlineEnd: 18, background: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, padding: "8px 12px", fontSize: 13, fontWeight: 700, zIndex: 2 }}>
                        {project.category}
                      </span>}
                      <div style={{ zIndex: 2 }}>
                        <h3 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>{isAr ? project.title : (project.titleEn ?? project.title)}</h3>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{isAr ? project.description : (project.descriptionEn ?? project.description)}</p>
                      </div>
                      <div style={{ width: 96, height: 160, borderRadius: 22, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", flexShrink: 0 }} />
                    </>}
                  </div>
                  {/* Content */}
                  <div style={{ padding: 24 }}>
                    {project.thumbnailUrl && <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{isAr ? project.title : (project.titleEn ?? project.title)}</h3>}
                    {project.clientName && <p style={{ margin: "0 0 16px", color: "#64748b" }}>{project.clientName}</p>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {(project.technologies ?? []).slice(0, 3).map((t: string, ti: number) => (
                        <span key={ti} style={{ padding: "8px 12px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontSize: 13, fontWeight: 800 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </article>
              </a>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 28px", fontSize: 15, fontWeight: 700, background: "#fff", color: "#0f172a", border: "1px solid rgba(15,23,42,0.1)", textDecoration: "none" }}>
              {isAr ? "عرض جميع المشاريع" : "View All Projects"}
            </a>
          </div>
        </div>
      </section>

      {/* ── Why Us ───────────────────────────────────── */}
      <section id="why-us" style={{ padding: "88px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                {isAr ? "لماذا Softlix" : "Why Softlix"}
              </span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "نركز على الجودة، الوضوح، ونتائج قابلة للقياس" : "We Focus on Quality, Clarity & Measurable Results"}
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 720, color: "#64748b", fontSize: 17 }}>
              {isAr ? "نبني الثقة بسرعة من خلال تقديم القيمة الفعلية التي يحصل عليها العميل عند العمل معنا." : "We build trust quickly by delivering real value that clients get when working with us."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="features-grid-responsive">
            {activeFeatures.map((f, i) => (
              <article key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 22, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 28, transition: "0.3s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-6px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center", fontWeight: 900, marginBottom: 16, fontSize: 18 }}>{f.num}</div>
                <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800 }}>{isAr ? f.titleAr : f.titleEn}</h3>
                <p style={{ margin: 0, color: "#64748b" }}>{isAr ? f.descAr : f.descEn}</p>
              </article>
            ))}
          </div>

          {/* Client logos */}
          {clients && clients.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginTop: 28 }} className="logo-cloud-responsive">
              {clients.slice(0, 6).map((c: any, i: number) => (
                <div key={i} style={{ minHeight: 84, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, display: "grid", placeItems: "center", fontWeight: 800, color: "#334155", boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: "0 12px", textAlign: "center", fontSize: 13 }}>
                  {c.name ?? c.nameAr ?? c}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Process ──────────────────────────────────── */}
      <section id="process" style={{ padding: "88px 0", background: "linear-gradient(180deg,#fff 0%,#f8fbff 100%)" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                {isAr ? "آلية العمل" : "How We Work"}
              </span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "رحلة واضحة من الفكرة حتى الإطلاق" : "A Clear Journey from Idea to Launch"}
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 720, color: "#64748b", fontSize: 17 }}>
              {isAr ? "نوضح كيف يتم تنفيذ المشاريع خطوة بخطوة بشكل احترافي ومنظم." : "We show how projects are executed step by step in a professional and organized manner."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="process-grid-responsive">
            {activeProcess.map((step, i) => (
              <article key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 22, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1, color: "rgba(37,99,235,0.12)", marginBottom: 10 }}>{step.num}</div>
                <h3 style={{ margin: "0 0 10px", fontSize: 21, fontWeight: 800 }}>{isAr ? step.titleAr : step.titleEn}</h3>
                <p style={{ margin: 0, color: "#64748b" }}>{isAr ? step.descAr : step.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section style={{ padding: "88px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              {isAr ? "آراء العملاء" : "Client Testimonials"}
            </span>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
              {isAr ? "انطباع يعزز الموثوقية" : "Impressions That Build Trust"}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="testimonials-grid-responsive">
            {activeTestimonials.map((t, i) => (
              <article key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 22, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 28, transition: "0.3s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-6px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                <div style={{ color: "#f59e0b", fontSize: 18, letterSpacing: 2, marginBottom: 14 }}>{"★".repeat(t.stars)}</div>
                <p style={{ margin: "0 0 18px", color: "#334155", fontSize: 16 }}>{isAr ? t.quoteAr : t.quoteEn}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <strong style={{ display: "block", fontSize: 15 }}>{isAr ? t.nameAr : t.nameEn}</strong>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{isAr ? t.roleAr : t.roleEn}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section style={{ padding: "0 0 88px" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1d4ed8 60%,#0ea5e9)", color: "#fff", borderRadius: 34, padding: 42, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, alignItems: "center", overflow: "hidden", position: "relative" }} className="cta-grid-responsive">
            <div>
              <h2 style={{ margin: "0 0 12px", fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "جاهز لتحويل فكرتك إلى موقع أو تطبيق أو نظام احترافي؟" : "Ready to Turn Your Idea into a Professional Website, App, or System?"}
              </h2>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: 17 }}>
                {isAr ? "ابدأ معنا بخطة واضحة وتصميم يعكس قيمة مشروعك." : "Start with a clear plan and design that reflects your project's value."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="#contact" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "#fff", boxShadow: "0 12px 30px rgba(37,99,235,0.25)", textDecoration: "none", border: 0 }} data-testid="btn-cta-contact">
                {isAr ? "اطلب عرض سعر" : "Request a Quote"}
              </a>
              <a href="/services" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 700, background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", textDecoration: "none" }} data-testid="btn-cta-services">
                {isAr ? "استكشف الخدمات" : "Explore Services"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────── */}
      <section id="contact" style={{ padding: "88px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 24 }} className="contact-grid-responsive">
            {/* Info */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 22, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 28 }}>
              <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 18 }}>
                {isAr ? "تواصل معنا" : "Contact Us"}
              </span>
              <h3 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 800 }}>{isAr ? "دعنا نناقش مشروعك" : "Let's Discuss Your Project"}</h3>
              <p style={{ margin: "0 0 24px", color: "#64748b" }}>{isAr ? "تواصل معنا وسنرد عليك في أقرب وقت ممكن لنناقش متطلبات مشروعك." : "Contact us and we will respond as soon as possible to discuss your project requirements."}</p>
              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { icon: "📞", titleAr: "رقم الهاتف", titleEn: "Phone", value: "0537861534", href: "tel:0537861534" },
                  { icon: "✉️", titleAr: "البريد الإلكتروني", titleEn: "Email", value: "info@softlix.net", href: "mailto:info@softlix.net" },
                  { icon: "📍", titleAr: "الموقع", titleEn: "Location", value: isAr ? "جدة، المملكة العربية السعودية" : "Jeddah, Saudi Arabia", href: undefined },
                  { icon: "⏰", titleAr: "أوقات العمل", titleEn: "Working Hours", value: isAr ? "السبت - الخميس | 9:00 ص - 6:00 م" : "Sat - Thu | 9:00 AM - 6:00 PM", href: undefined },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "start", padding: 16, borderRadius: 18, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "#dbeafe", color: "#2563eb", fontWeight: 900, flexShrink: 0, fontSize: 20 }}>{item.icon}</div>
                    <div>
                      <strong style={{ display: "block", marginBottom: 4, fontSize: 15, color: "#0f172a" }}>{isAr ? item.titleAr : item.titleEn}</strong>
                      {item.href ? <a href={item.href} style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>{item.value}</a> : <span style={{ color: "#64748b", fontSize: 14 }}>{item.value}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 22, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 28 }}>
              <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 18 }}>
                {isAr ? "نموذج الطلب" : "Request Form"}
              </span>
              <form onSubmit={handleSubmit((data) => leadMutation.mutate(data))} style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="grid-2-responsive">
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "الاسم الكامل" : "Full Name"}</label>
                    <input {...register("name", { required: true })} type="text" placeholder={isAr ? "اكتب اسمك" : "Enter your name"} style={{ width: "100%", border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="input-name" />
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "اسم الشركة" : "Company Name"}</label>
                    <input {...register("company")} type="text" placeholder={isAr ? "اسم الشركة أو النشاط" : "Company or business name"} style={{ width: "100%", border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="input-company" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="grid-2-responsive">
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "البريد الإلكتروني" : "Email"}</label>
                    <input {...register("email", { required: true })} type="email" placeholder="name@example.com" style={{ width: "100%", border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="input-email" />
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "رقم الهاتف" : "Phone"}</label>
                    <input {...register("phone")} type="tel" placeholder="05xxxxxxxx" style={{ width: "100%", border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="input-phone" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="grid-2-responsive">
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "نوع الخدمة" : "Service Type"}</label>
                    <select {...register("service")} style={{ width: "100%", border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="select-service">
                      <option value="">{isAr ? "اختر الخدمة" : "Choose Service"}</option>
                      <option value="web">{isAr ? "تطوير موقع" : "Website Development"}</option>
                      <option value="app">{isAr ? "تطبيق جوال" : "Mobile App"}</option>
                      <option value="ecommerce">{isAr ? "متجر إلكتروني" : "E-Commerce Store"}</option>
                      <option value="crm">{isAr ? "نظام CRM / ERP" : "CRM / ERP System"}</option>
                      <option value="design">{isAr ? "تصميم واجهات" : "UI/UX Design"}</option>
                    </select>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "الميزانية التقديرية" : "Estimated Budget"}</label>
                    <select {...register("budget")} style={{ width: "100%", border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="select-budget">
                      <option value="">{isAr ? "اختر الميزانية" : "Choose Budget"}</option>
                      <option value="<10k">{isAr ? "أقل من 10,000 ريال" : "Less than 10,000 SAR"}</option>
                      <option value="10-25k">{isAr ? "10,000 - 25,000 ريال" : "10,000 - 25,000 SAR"}</option>
                      <option value="25-50k">{isAr ? "25,000 - 50,000 ريال" : "25,000 - 50,000 SAR"}</option>
                      <option value=">50k">{isAr ? "أكثر من 50,000 ريال" : "More than 50,000 SAR"}</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "تفاصيل المشروع" : "Project Details"}</label>
                  <textarea {...register("message")} placeholder={isAr ? "اكتب فكرة المشروع أو المتطلبات الأساسية هنا..." : "Write your project idea or main requirements here..."} style={{ width: "100%", border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none", minHeight: 140, resize: "vertical" }} data-testid="textarea-message" />
                </div>
                <div>
                  <button type="submit" disabled={leadMutation.isPending} style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "#fff", boxShadow: "0 12px 30px rgba(37,99,235,0.25)", border: 0, opacity: leadMutation.isPending ? 0.7 : 1 }} data-testid="btn-submit-lead">
                    {leadMutation.isPending ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "إرسال الطلب" : "Send Request")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />

      <style>{`
        /* ── Home page responsive grid breakpoints ── */

        /* Tablet: collapse hero + CTA to 1 col, 2-col grids */
        @media (max-width: 1100px) {
          .hero-grid-responsive { grid-template-columns: 1fr !important; }
          .cta-grid-responsive  { grid-template-columns: 1fr !important; }
          .services-grid-responsive  { grid-template-columns: repeat(2, 1fr) !important; }
          .projects-grid-responsive  { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid-responsive  { grid-template-columns: repeat(2, 1fr) !important; }
          .testimonials-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
          .process-grid-responsive   { grid-template-columns: repeat(2, 1fr) !important; }
          .logo-cloud-responsive     { grid-template-columns: repeat(3, 1fr) !important; }
          .stats-grid-responsive     { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* Mobile: everything becomes 1 col; hide decorative dashboard */
        @media (max-width: 700px) {
          .hero-grid-responsive,
          .cta-grid-responsive,
          .services-grid-responsive,
          .projects-grid-responsive,
          .features-grid-responsive,
          .testimonials-grid-responsive { grid-template-columns: 1fr !important; }
          .process-grid-responsive   { grid-template-columns: repeat(2, 1fr) !important; }
          .logo-cloud-responsive     { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid-responsive     { grid-template-columns: repeat(2, 1fr) !important; }
          .grid-2-responsive         { grid-template-columns: 1fr !important; }

          /* Hide decorative right dashboard & floating badges on small screens */
          .home-hero-right { display: none !important; }
          .hero-badge      { display: none !important; }

          /* Tighten section padding */
          section { padding-top: 52px !important; padding-bottom: 52px !important; }
        }
      `}</style>
    </div>
  );
}
