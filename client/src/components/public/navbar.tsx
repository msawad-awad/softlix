import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SERVICES = [
  { label: "برمجة تطبيقات الجوال", labelEn: "Mobile App Development", href: "/services/mobile-app-development" },
  { label: "تطوير وبرمجة المواقع", labelEn: "Web Development", href: "/services/web-development" },
  { label: "التجارة الإلكترونية", labelEn: "E-Commerce & Magento", href: "/services/ecommerce" },
  { label: "أنظمة CRM و ERP", labelEn: "CRM & ERP Systems", href: "/services/erp-systems" },
  { label: "استشارات تقنية", labelEn: "Technical Consulting", href: "/services/technical-consulting" },
  { label: "تسويق رقمي", labelEn: "Digital Marketing", href: "/services/digital-marketing" },
  { label: "إدارة محتوى والتصاميم", labelEn: "Content & Design", href: "/services/content-management" },
];

interface NavbarProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

export function PublicNavbar({ lang = "ar", onLangChange }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const isAr = lang === "ar";

  const { data: settings } = useQuery<any>({ queryKey: ["/api/public/site-settings"] });
  const siteName = isAr ? (settings?.siteNameAr || "Softlix") : (settings?.siteNameEn || "Softlix");
  const phone = settings?.contactPhone || "0537861534";
  const email = settings?.contactEmail || "info@softlix.net";
  const workingHoursAr = settings?.contactHoursAr || "السبت - الخميس | 9:00 ص - 6:00 م";
  const workingHoursEn = settings?.contactHoursEn || "Sat - Thu | 9:00 AM - 6:00 PM";
  const addressAr = settings?.contactAddressAr || "";
  const addressEn = settings?.contactAddressEn || "";
  const cityAr = addressAr || "جدة، المملكة العربية السعودية";
  const cityEn = addressEn || "Jeddah, Saudi Arabia";

  const navLinks = [
    { label: isAr ? "الرئيسية" : "Home", href: "/" },
    { label: isAr ? "من نحن" : "About", href: "/about" },
    { label: isAr ? "المشاريع" : "Projects", href: "/projects" },
    { label: isAr ? "عملاؤنا" : "Clients", href: "/clients" },
    { label: isAr ? "المدونة" : "Blog", href: "/blog" },
    { label: isAr ? "تواصل معنا" : "Contact", href: "/contact" },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* ── Topbar ── */}
      <div className="pub-topbar" style={{ background: "#0f172a", color: "#cbd5e1", fontSize: 14, padding: "10px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <span>📍 {isAr ? cityAr : cityEn}</span>
            <span className="topbar-hours">⏰ {isAr ? workingHoursAr : workingHoursEn}</span>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <a href={`tel:${phone}`} style={{ color: "#cbd5e1", textDecoration: "none" }}>📞 {phone}</a>
            <a href={`mailto:${email}`} className="topbar-email" style={{ color: "#cbd5e1", textDecoration: "none" }}>✉️ {email}</a>
            <button
              onClick={() => onLangChange?.(isAr ? "en" : "ar")}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "#cbd5e1", cursor: "pointer", padding: "2px 10px", fontSize: 13, fontFamily: "inherit" }}
              data-testid="nav-lang-toggle"
            >
              {isAr ? "EN" : "عر"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Navbar ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 1000, backdropFilter: "blur(18px)", background: "rgba(248,250,252,0.92)", borderBottom: "1px solid rgba(226,232,240,0.85)" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto", minHeight: 84, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 24, color: "#0f172a", textDecoration: "none" }} data-testid="nav-logo">
            <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg,#2563eb,#38bdf8)", boxShadow: "0 12px 25px rgba(56,189,248,0.3)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ position: "absolute", width: 22, height: 6, top: 10, right: 8, background: "rgba(255,255,255,0.85)", borderRadius: 99, transform: "rotate(-35deg)" }} />
              <div style={{ position: "absolute", width: 18, height: 6, bottom: 10, left: 8, background: "rgba(255,255,255,0.85)", borderRadius: 99, transform: "rotate(-35deg)" }} />
            </div>
            <span>{siteName}</span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 26, fontWeight: 700, color: "#334155" }} className="hide-mobile">
            {navLinks.filter(l => l.href !== "/contact").map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: location === link.href ? "#2563eb" : "#334155", textDecoration: "none", fontSize: 15, transition: "color 0.2s" }}
                onMouseEnter={(e: any) => e.currentTarget.style.color = "#2563eb"}
                onMouseLeave={(e: any) => e.currentTarget.style.color = location === link.href ? "#2563eb" : "#334155"}
              >
                {link.label}
              </Link>
            ))}

            {/* Services dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 15, color: location.startsWith("/services") ? "#2563eb" : "#334155", padding: 0 }}
                  data-testid="nav-services-dropdown"
                >
                  {isAr ? "الخدمات" : "Services"}
                  <ChevronDown style={{ width: 14, height: 14 }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isAr ? "end" : "start"} style={{ width: 240, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 20px 50px rgba(15,23,42,0.12)", background: "#fff", padding: 8 }}>
                {SERVICES.map(s => (
                  <DropdownMenuItem key={s.href} asChild>
                    <Link
                      href={s.href}
                      style={{ display: "block", padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#334155", textDecoration: "none", cursor: "pointer" }}
                    >
                      {isAr ? s.label : s.labelEn}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="hide-mobile">
            <a
              href="/projects"
              style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "12px 20px", fontSize: 14, fontWeight: 700, background: "#fff", color: "#0f172a", border: "1px solid rgba(15,23,42,0.1)", textDecoration: "none" }}
              data-testid="nav-projects-btn"
            >
              {isAr ? "شاهد الأعمال" : "View Work"}
            </a>
            <a
              href="#contact"
              style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "12px 20px", fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "#fff", boxShadow: "0 8px 20px rgba(37,99,235,0.25)", textDecoration: "none", border: 0 }}
              data-testid="nav-contact-btn"
            >
              {isAr ? "اطلب عرض سعر" : "Request a Quote"}
            </a>
          </div>

          {/* Mobile menu btn */}
          <button
            style={{ display: "none", background: "#fff", border: "1px solid #e2e8f0", width: 46, height: 46, borderRadius: 14, cursor: "pointer", fontSize: 20, alignItems: "center", justifyContent: "center" }}
            className="show-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="nav-mobile-menu-btn"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ borderTop: "1px solid #e2e8f0", background: "#fff", padding: "12px 0" }}>
            <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto", display: "grid", gap: 4 }}>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ display: "block", padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 700, color: location === link.href ? "#2563eb" : "#334155", textDecoration: "none", background: location === link.href ? "#eff6ff" : "transparent" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ paddingTop: 8, borderTop: "1px solid #e2e8f0", marginTop: 4 }}>
                <p style={{ margin: "0 0 4px", padding: "0 14px", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {isAr ? "الخدمات" : "Services"}
                </p>
                {SERVICES.map(s => (
                  <Link
                    key={s.href}
                    href={s.href}
                    style={{ display: "block", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {isAr ? s.label : s.labelEn}
                  </Link>
                ))}
              </div>
              <div style={{ padding: "12px 14px 4px", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => { onLangChange?.(isAr ? "en" : "ar"); setMenuOpen(false); }} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {isAr ? "English" : "العربية"}
                </button>
                <a href="#contact" style={{ display: "inline-flex", flex: 1, justifyContent: "center", borderRadius: 999, padding: "10px 20px", fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "#fff", textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
                  {isAr ? "اطلب عرض سعر" : "Request a Quote"}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 860px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: inline-flex !important; }
        }
        @media (max-width: 768px) {
          .pub-topbar    { display: none !important; }
        }
        @media (max-width: 520px) {
          .topbar-hours { display: none !important; }
          .topbar-email { display: none !important; }
        }
      `}</style>
    </div>
  );
}
