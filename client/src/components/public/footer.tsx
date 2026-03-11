import { Link } from "wouter";
import { SiWhatsapp, SiLinkedin, SiInstagram, SiX } from "react-icons/si";

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
                <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>S</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: "1.18rem", letterSpacing: "-.01em" }}>softlix</span>
            </Link>

            <p style={{ color: "rgba(255,255,255,.42)", fontSize: ".92rem", lineHeight: 1.85, marginBottom: 24, maxWidth: "30ch" }}>
              {isAr
                ? "شريكك التقني المتكامل في برمجة التطبيقات والتسويق الرقمي. نحوّل أفكارك إلى منتجات رقمية ناجحة."
                : "Your complete tech partner in app development and digital marketing. We turn your ideas into successful digital products."}
            </p>

            {/* Socials */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                style={iconStyle}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.22)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.10)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
              >
                <SiX size={14} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={iconStyle}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e1306c"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(225,48,108,.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(225,48,108,.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
              >
                <SiInstagram size={15} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={iconStyle}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#0a66c2"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(10,102,194,.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(10,102,194,.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
              >
                <SiLinkedin size={15} />
              </a>
              <a
                href="https://wa.me/966537861534"
                target="_blank"
                rel="noopener noreferrer"
                style={iconStyle}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#25d366"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,211,102,.3)"; (e.currentTarget as HTMLElement).style.background = "rgba(37,211,102,.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
              >
                <SiWhatsapp size={15} />
              </a>
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
                <span>{isAr ? "مبنى الامتياز في الصفا، طريق الحرمين السعودية" : "Al Imtiyaz Building, Al Safa, Haramain Road, Saudi Arabia"}</span>
              </div>
              <div style={contactRow}>
                <span style={dotIcon} />
                <a href="tel:0537861534" style={{ ...linkStyle, color: "rgba(255,255,255,.48)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e59269"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.48)"; }}
                >
                  0537861534
                </a>
              </div>
              <div style={contactRow}>
                <span style={dotIcon} />
                <a href="mailto:info@softlix.net" style={{ ...linkStyle, color: "rgba(255,255,255,.48)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e59269"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.48)"; }}
                >
                  info@softlix.net
                </a>
              </div>
              <div style={contactRow}>
                <span style={dotIcon} />
                <span>{isAr ? "السبت - الخميس: 9ص - 6م" : "Sat - Thu: 9AM - 6PM"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 48 }}>
        <div style={{ width: "min(1280px, calc(100% - 32px))", marginInline: "auto", minHeight: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "0 0" }}>
          <p style={{ color: "rgba(255,255,255,.28)", fontSize: ".88rem", fontWeight: 600, margin: 0, fontFamily: "'Cairo', system-ui, sans-serif" }}>
            © {new Date().getFullYear()} softlix. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
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
