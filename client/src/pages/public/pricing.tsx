import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CheckCircle, Star, Zap, ArrowLeft, ArrowRight } from "lucide-react";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { useSEO } from "@/hooks/use-seo";
import type { PricingPlan } from "@shared/schema";

interface Props { lang?: "ar" | "en"; onLangChange?: (l: "ar" | "en") => void; }

const COLOR_MAP: Record<string, { bg: string; accent: string; badge: string }> = {
  blue:   { bg: "#fff7ed", accent: "#ff6a00", badge: "#fff3e0" },
  orange: { bg: "#fff7ed", accent: "#ea580c", badge: "#ffedd5" },
  green:  { bg: "#f0fdf4", accent: "#16a34a", badge: "#dcfce7" },
  purple: { bg: "#faf5ff", accent: "#7c3aed", badge: "#ede9fe" },
  dark:   { bg: "#0f172a", accent: "#e59269", badge: "#1e293b" },
};

export default function PublicPricing({ lang = "ar", onLangChange }: Props) {
  const isAr = lang === "ar";
  useSEO({
    title: isAr ? "الأسعار والباقات — Softlix" : "Pricing & Packages — Softlix",
    description: isAr ? "اكتشف باقات وأسعار سوفتلكس لخدمات تطوير المواقع والتطبيقات وأنظمة ERP والتسويق الرقمي" : "Discover Softlix pricing packages for web development, apps, ERP systems and digital marketing",
    lang,
  });

  const { data: plans = [], isLoading } = useQuery<PricingPlan[]>({ queryKey: ["/api/public/pricing"] });
  const { data: settings } = useQuery<any>({ queryKey: ["/api/public/site-settings"] });

  const BRAND = "#e59269";
  const ACCENT = "#82b735";

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', system-ui, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)", padding: "100px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.85)", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            <Zap size={14} color={BRAND} />
            {isAr ? "باقات تناسب كل الأحجام" : "Plans for Every Size"}
          </div>
          <h1 style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", lineHeight: 1.2 }}>
            {isAr ? "اختر الباقة المناسبة لمشروعك" : "Choose the Right Plan for Your Project"}
          </h1>
          <p style={{ margin: "16px 0 0", color: "rgba(255,255,255,.65)", fontSize: "1rem", maxWidth: "60ch", marginInline: "auto" }}>
            {isAr ? "نقدم باقات متنوعة تناسب الشركات الصغيرة والمتوسطة والكبيرة مع دعم فني كامل" : "We offer diverse packages for small, medium, and large businesses with full technical support"}
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section style={{ padding: "64px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 480, borderRadius: 24, background: "#e2e8f0", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#64748b" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💼</div>
            <h2 style={{ fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>
              {isAr ? "الباقات قادمة قريباً" : "Plans Coming Soon"}
            </h2>
            <p style={{ margin: "0 0 24px" }}>
              {isAr ? "تواصل معنا للحصول على عرض سعر مخصص لمشروعك" : "Contact us for a customized quote for your project"}
            </p>
            <Link href="/contact">
              <a style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg, #e59269, #cb7147)", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
                {isAr ? "تواصل معنا" : "Contact Us"}
                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </a>
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 28, alignItems: "start" }}>
            {plans.map(plan => {
              const colors = COLOR_MAP[plan.color || "blue"] || COLOR_MAP.blue;
              const isDark = plan.color === "dark";
              const features = isAr ? (plan.featuresAr || []) : (plan.featuresEn || []);

              return (
                <div key={plan.id} style={{
                  background: isDark ? colors.bg : "#fff",
                  borderRadius: 24,
                  border: plan.isPopular ? `2px solid ${colors.accent}` : "1.5px solid #e8edf3",
                  padding: "32px 28px",
                  position: "relative",
                  boxShadow: plan.isPopular ? `0 16px 48px ${colors.accent}25` : "0 4px 20px rgba(0,0,0,.06)",
                  transition: "transform .2s, box-shadow .2s",
                }}>
                  {plan.isPopular && (
                    <div style={{ position: "absolute", top: -14, ...(isAr ? { right: 28 } : { left: 28 }), background: `linear-gradient(135deg, ${colors.accent}, ${BRAND})`, color: "#fff", borderRadius: 999, padding: "5px 18px", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
                      <Star size={12} fill="#fff" />
                      {isAr ? "الأكثر طلباً" : "Most Popular"}
                    </div>
                  )}

                  {plan.badgeAr && (
                    <span style={{ display: "inline-block", background: colors.badge, color: colors.accent, borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 800, marginBottom: 16 }}>
                      {isAr ? plan.badgeAr : plan.badgeEn}
                    </span>
                  )}

                  <h3 style={{ margin: 0, color: isDark ? "#fff" : "#0f172a", fontWeight: 900, fontSize: "1.2rem" }}>
                    {isAr ? plan.nameAr : plan.nameEn}
                  </h3>
                  {(isAr ? plan.descAr : plan.descEn) && (
                    <p style={{ margin: "8px 0 0", color: isDark ? "rgba(255,255,255,.6)" : "#64748b", fontSize: ".9rem", lineHeight: 1.6 }}>
                      {isAr ? plan.descAr : plan.descEn}
                    </p>
                  )}

                  <div style={{ margin: "24px 0", display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, color: isDark ? "#fff" : colors.accent, lineHeight: 1 }}>
                      {plan.price}
                    </span>
                    <span style={{ color: isDark ? "rgba(255,255,255,.5)" : "#94a3b8", fontSize: ".9rem", fontWeight: 600 }}>
                      {plan.currency || "SAR"} / {plan.period === "month" ? (isAr ? "شهر" : "month") : plan.period === "year" ? (isAr ? "سنة" : "year") : (isAr ? "مرة واحدة" : "one-time")}
                    </span>
                  </div>

                  {features.length > 0 && (
                    <ul style={{ margin: "0 0 28px", padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                      {features.map((f, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: ".9rem", color: isDark ? "rgba(255,255,255,.8)" : "#374151" }}>
                          <CheckCircle size={16} color={colors.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  {(plan.ctaUrl || true) && (
                    <a href={plan.ctaUrl || "/contact"}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", borderRadius: 14, background: plan.isPopular ? `linear-gradient(135deg, ${colors.accent}, ${BRAND})` : isDark ? `linear-gradient(135deg, ${BRAND}, #cb7147)` : colors.bg, border: plan.isPopular || isDark ? "none" : `1.5px solid ${colors.accent}`, color: plan.isPopular || isDark ? "#fff" : colors.accent, fontWeight: 900, fontSize: 15, cursor: "pointer", textDecoration: "none", fontFamily: "'Cairo', system-ui, sans-serif", transition: ".2s", boxSizing: "border-box" }}>
                      {isAr ? (plan.ctaTextAr || "ابدأ الآن") : (plan.ctaTextEn || "Get Started")}
                      {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{ padding: "48px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", background: "#fff", borderRadius: 24, border: "1.5px solid #e2e8f0", padding: "40px 32px", boxShadow: "0 8px 32px rgba(0,0,0,.06)" }}>
          <h2 style={{ margin: "0 0 12px", fontWeight: 900, fontSize: "1.4rem", color: "#0f172a" }}>
            {isAr ? "هل تحتاج باقة مخصصة؟" : "Need a Custom Package?"}
          </h2>
          <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: ".95rem" }}>
            {isAr ? "تواصل معنا وسنبني لك عرضاً مخصصاً يناسب احتياجاتك وميزانيتك تماماً" : "Contact us and we'll build a custom offer that perfectly fits your needs and budget"}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact">
              <a style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, background: "linear-gradient(135deg, #e59269, #cb7147)", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
                {isAr ? "تواصل معنا" : "Contact Us"}
              </a>
            </Link>
            <Link href="/services">
              <a style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#374151", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                {isAr ? "تصفح الخدمات" : "Browse Services"}
              </a>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }`}</style>
    </div>
  );
}
