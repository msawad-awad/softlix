import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiWhatsapp, SiLinkedin, SiInstagram, SiX } from "react-icons/si";
import { Bell, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MarketingSettings } from "@shared/schema";

interface FooterProps {
  lang?: "ar" | "en";
}

const iconStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(255,255,255,.05)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,.5)",
  cursor: "pointer",
  flexShrink: 0,
  transition: ".2s ease",
  textDecoration: "none",
};

const linkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,.48)",
  fontSize: ".93rem",
  fontWeight: 600,
  lineHeight: 1.6,
  textDecoration: "none",
  display: "block",
  transition: "color .2s",
};

const contactRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  color: "rgba(255,255,255,.48)",
  fontSize: ".9rem",
  fontWeight: 600,
  lineHeight: 1.7,
};

const dotIcon: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#e59269",
  marginTop: 8,
  flexShrink: 0,
  display: "inline-block",
};

export function PublicFooter({ lang = "ar" }: FooterProps) {
  const isAr = lang === "ar";
  const { toast } = useToast();
  const [nlEmail, setNlEmail] = useState("");
  const [nlSending, setNlSending] = useState(false);
  const [nlDone, setNlDone] = useState(false);

  const { data: settings } = useQuery<any>({ queryKey: ["/api/public/site-settings"] });
  const { data: mktSettings } = useQuery<MarketingSettings>({ queryKey: ["/api/public/marketing-settings"] });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail) return;
    setNlSending(true);
    try {
      const res = await fetch("/api/public/newsletter/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail, source: "footer" }),
      });
      const data = await res.json();
      setNlDone(true);
      toast({ title: data.message || (isAr ? "تم الاشتراك بنجاح!" : "Subscribed!") });
    } catch { toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" }); }
    finally { setNlSending(false); }
  };

  const siteName = settings?.siteNameAr || "softlix";
  const siteNameEn = settings?.siteNameEn || "softlix";
  const footerDescAr = settings?.footerDescAr || "شريكك التقني المتكامل في برمجة التطبيقات والتسويق الرقمي. نحوّل أفكارك إلى منتجات رقمية ناجحة.";
  const footerDescEn = settings?.footerDescEn || "Your complete tech partner in app development and digital marketing. We turn your ideas into successful digital products.";
  const phone = settings?.contactPhone || "0537861534";
  const email = settings?.contactEmail || "info@softlix.net";
  const addressAr = settings?.contactAddressAr || "مبنى الامتياز في الصفا، طريق الحرمين السعودية";
  const addressEn = settings?.contactAddressEn || "Al Imtiyaz Building, Al Safa, Haramain Road, Saudi Arabia";
  const workingHoursAr = settings?.contactHoursAr || "السبت - الخميس: 9ص - 6م";
  const workingHoursEn = settings?.contactHoursEn || "Sat - Thu: 9AM - 6PM";
  const twitterUrl = settings?.socialX || "https://x.com";
  const instagramUrl = settings?.socialInstagram || "https://instagram.com";
  const linkedinUrl = settings?.socialLinkedIn || "https://linkedin.com";
  const whatsappUrl = settings?.socialWhatsapp || "https://wa.me/966537861534";

  return (
    <footer
      dir={isAr ? "rtl" : "ltr"}
      style={{
        background: "linear-gradient(180deg, #111827 0%, #0d1520 100%)",
        borderTop: "1px solid rgba(255,255,255,.06)",
        fontFamily: "'Cairo', system-ui, sans-serif",
      }}
    >
      <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto", padding: "56px 0 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: 40 }} className="footer-grid">

          {/* ── Brand ── */}
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 18, textDecoration: "none" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #e59269, #82b735)", boxShadow: "0 10px 28px rgba(229,146,105,.28)", flexShrink: 0, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{(isAr ? siteName : siteNameEn).charAt(0).toUpperCase()}</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: "1.18rem", letterSpacing: "-.01em" }}>{isAr ? siteName : siteNameEn}</span>
            </Link>

            <p style={{ color: "rgba(255,255,255,.42)", fontSize: ".92rem", lineHeight: 1.85, marginBottom: 24, maxWidth: "30ch" }}>
              {isAr ? footerDescAr : footerDescEn}
            </p>

            {/* Socials */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={iconStyle}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.22)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.10)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
                >
                  <SiX size={14} />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={iconStyle}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e1306c"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(225,48,108,.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(225,48,108,.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
                >
                  <SiInstagram size={15} />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={iconStyle}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#0a66c2"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(10,102,194,.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(10,102,194,.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
                >
                  <SiLinkedin size={15} />
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={iconStyle}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#25d366"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,211,102,.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(37,211,102,.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
                >
                  <SiWhatsapp size={15} />
                </a>
              )}
            </div>
          </div>

          {/* ── Services ── */}
          <div>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", marginBottom: 18, margin: "0 0 18px" }}>
              {isAr ? "خدماتنا" : "Our Services"}
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
              {[
                { ar: "برمجة تطبيقات الجوال", en: "Mobile App Development", href: "/services/mobile-app-development" },
                { ar: "تطوير ومنصات المواقع", en: "Web Development", href: "/services/web-development" },
                { ar: "التجارة الإلكترونية", en: "E-Commerce", href: "/services/ecommerce" },
                { ar: "التسويق الرقمي", en: "Digital Marketing", href: "/services/digital-marketing" },
                { ar: "إدارة المحتوى والتصاميم", en: "Content & Design", href: "/services/content-management" },
              ].map(s => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    style={linkStyle}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e59269"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.48)"; }}
                  >
                    {isAr ? s.ar : s.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", margin: "0 0 18px" }}>
              {isAr ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
              {[
                { ar: "الرئيسية", en: "Home", href: "/" },
                { ar: "من نحن", en: "About Us", href: "/about" },
                { ar: "المشاريع", en: "Projects", href: "/projects" },
                { ar: "الخدمات", en: "Services", href: "/services" },
                { ar: "تواصل معنا", en: "Contact Us", href: "/contact" },
              ].map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={linkStyle}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e59269"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.48)"; }}
                  >
                    {isAr ? l.ar : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", margin: "0 0 18px" }}>
              {isAr ? "تواصل معنا" : "Contact Us"}
            </h3>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={contactRow}>
                <span style={dotIcon} />
                <span>{isAr ? addressAr : addressEn}</span>
              </div>
              <div style={contactRow}>
                <span style={dotIcon} />
                <a href={`tel:${phone}`} style={{ ...linkStyle, color: "rgba(255,255,255,.48)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e59269"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.48)"; }}
                >
                  {phone}
                </a>
              </div>
              <div style={contactRow}>
                <span style={dotIcon} />
                <a href={`mailto:${email}`} style={{ ...linkStyle, color: "rgba(255,255,255,.48)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e59269"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.48)"; }}
                >
                  {email}
                </a>
              </div>
              <div style={contactRow}>
                <span style={dotIcon} />
                <span>{isAr ? workingHoursAr : workingHoursEn}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      {mktSettings?.newsletterEnabled && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", marginTop: 40, paddingTop: 40 }}>
          <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(229,146,105,.12), rgba(203,113,71,.08))", borderRadius: 20, padding: "32px 28px", border: "1px solid rgba(229,146,105,.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, fontFamily: "'Cairo', system-ui, sans-serif" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <Bell size={20} color="#e59269" />
                  <h3 style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: "1.1rem" }}>
                    {isAr ? (mktSettings.newsletterTitleAr || "اشترك في النشرة البريدية") : (mktSettings.newsletterTitleEn || "Subscribe to Our Newsletter")}
                  </h3>
                </div>
                <p style={{ margin: 0, color: "rgba(255,255,255,.5)", fontSize: ".88rem" }}>
                  {isAr ? "ابق على اطلاع بآخر الأخبار والعروض" : "Stay updated with our latest news and offers"}
                </p>
              </div>
              {nlDone ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#22c55e", fontWeight: 800 }}>
                  <CheckCircle size={20} />
                  {isAr ? "تم الاشتراك!" : "Subscribed!"}
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input value={nlEmail} onChange={e => setNlEmail(e.target.value)} type="email" required
                    placeholder={isAr ? "بريدك الإلكتروني..." : "Your email..."}
                    style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.08)", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none", minWidth: 220 }} />
                  <button type="submit" disabled={nlSending}
                    style={{ padding: "11px 22px", borderRadius: 10, background: "linear-gradient(135deg, #e59269, #cb7147)", border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    {nlSending ? "..." : (isAr ? "اشترك" : "Subscribe")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 48 }}>
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto", minHeight: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "0 0" }}>
          <p style={{ color: "rgba(255,255,255,.28)", fontSize: ".88rem", fontWeight: 600, margin: 0, fontFamily: "'Cairo', system-ui, sans-serif" }}>
            © {new Date().getFullYear()} {isAr ? siteName : siteNameEn}. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <p style={{ color: "rgba(255,255,255,.28)", fontSize: ".88rem", fontWeight: 600, margin: 0, fontFamily: "'Cairo', system-ui, sans-serif" }}>
            {isAr ? "صُنع بـ ❤️ في المملكة العربية السعودية" : "Made with ❤️ in Saudi Arabia"}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 580px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
