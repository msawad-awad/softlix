import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ChevronDown } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const isAr = lang === "ar";

  const { data: settings } = useQuery<any>({ queryKey: ["/api/public/site-settings"] });
  const siteName = isAr ? (settings?.siteNameAr || "Softlix") : (settings?.siteNameEn || "Softlix");
  const logoUrl = settings?.logoUrl || "/logo_softlix.png";
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* ── Topbar ── */}
      <div className="pub-topbar" style={{ background: "linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)", color: "#e0e0e0", fontSize: 13, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width: "min(1280px, calc(100% - 40px))", marginInline: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <span style={{ fontSize: 12.5 }}>📍 {isAr ? cityAr : cityEn}</span>
            <span className="topbar-hours" style={{ fontSize: 12.5 }}>⏰ {isAr ? workingHoursAr : workingHoursEn}</span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <a href={`tel:${phone}`} style={{ color: "#e0e0e0", textDecoration: "none", fontSize: 12.5, transition: "color 0.3s" }} onMouseEnter={(e: any) => e.target.style.color = "#ff8c00"} onMouseLeave={(e: any) => e.target.style.color = "#e0e0e0"}>📞 {phone}</a>
            <a href={`mailto:${email}`} className="topbar-email" style={{ color: "#e0e0e0", textDecoration: "none", fontSize: 12.5, transition: "color 0.3s" }} onMouseEnter={(e: any) => e.target.style.color = "#ff8c00"} onMouseLeave={(e: any) => e.target.style.color = "#e0e0e0"}>✉️ {email}</a>
            <button
              onClick={() => onLangChange?.(isAr ? "en" : "ar")}
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#e0e0e0", cursor: "pointer", padding: "4px 12px", fontSize: 12, fontFamily: "inherit", fontWeight: 600, transition: "all 0.3s" }}
              onMouseEnter={(e: any) => { e.currentTarget.background = "rgba(255,136,0,0.15)"; e.currentTarget.borderColor = "rgba(255,136,0,0.3)"; e.currentTarget.color = "#ff8c00"; }}
              onMouseLeave={(e: any) => { e.currentTarget.background = "rgba(255,255,255,0.08)"; e.currentTarget.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.color = "#e0e0e0"; }}
              data-testid="nav-lang-toggle"
            >
              {isAr ? "EN" : "عر"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Premium Header ── */}
      <header style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 1000, 
        background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.04)",
        boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}>
        <div style={{ width: "min(1280px, calc(100% - 40px))", marginInline: "auto", minHeight: 88, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>

          {/* Logo */}
          <Link href="/" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 16, 
            textDecoration: "none", 
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            flexShrink: 0,
            paddingRight: isAr ? 8 : 0,
            paddingLeft: !isAr ? 8 : 0
          }} 
          onMouseEnter={(e: any) => e.currentTarget.style.transform = "scale(1.12)"} 
          onMouseLeave={(e: any) => e.currentTarget.style.transform = "scale(1)"} 
          data-testid="nav-logo">
            {logoUrl ? (
              <img
                key={logoUrl}
                src={logoUrl}
                alt={siteName}
                style={{ 
                  height: 110, 
                  maxWidth: 280, 
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 6px 24px rgba(255,136,0,0.18))",
                  transition: "filter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  WebkitFilter: "drop-shadow(0 6px 24px rgba(255,136,0,0.18))"
                }}
                onMouseEnter={(e: any) => { 
                  e.style.filter = "drop-shadow(0 10px 32px rgba(255,136,0,0.28))";
                  e.style.WebkitFilter = "drop-shadow(0 10px 32px rgba(255,136,0,0.28))";
                }}
                onMouseLeave={(e: any) => { 
                  e.style.filter = "drop-shadow(0 6px 24px rgba(255,136,0,0.18))";
                  e.style.WebkitFilter = "drop-shadow(0 6px 24px rgba(255,136,0,0.18))";
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#ff6a00,#ff8c00)", boxShadow: "0 12px 32px rgba(255,136,0,0.25)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ position: "absolute", width: 26, height: 7, top: 12, right: 10, background: "rgba(255,255,255,0.9)", borderRadius: 99, transform: "rotate(-35deg)" }} />
                  <div style={{ position: "absolute", width: 22, height: 7, bottom: 12, left: 10, background: "rgba(255,255,255,0.9)", borderRadius: 99, transform: "rotate(-35deg)" }} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#111", background: "linear-gradient(135deg,#ff6a00,#ff8c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{siteName}</span>
              </>
            )}
          </Link>

          {/* Desktop Nav - Center */}
          <nav style={{ display: "flex", alignItems: "center", gap: 24, fontWeight: 600, color: "#333", flex: 1, justifyContent: "center", flexWrap: "nowrap" }} className="hide-mobile">
            {navLinks.filter(l => l.href !== "/contact").map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{ 
                  color: location === link.href ? "#ff6a00" : "#333",
                  textDecoration: "none", 
                  fontSize: 15,
                  position: "relative",
                  transition: "color 0.3s",
                  paddingBottom: 6,
                  borderBottom: location === link.href ? "2px solid #ff6a00" : "2px solid transparent"
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.color = "#ff8c00";
                  e.currentTarget.style.borderBottomColor = "#ff8c00";
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.color = location === link.href ? "#ff6a00" : "#333";
                  e.currentTarget.style.borderBottomColor = location === link.href ? "#ff6a00" : "transparent";
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Services dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8, 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer", 
                    fontFamily: "inherit", 
                    fontWeight: 600, 
                    fontSize: 15, 
                    color: location.startsWith("/services") ? "#ff6a00" : "#333",
                    padding: "6px 0",
                    transition: "color 0.3s"
                  }}
                  onMouseEnter={(e: any) => e.currentTarget.style.color = "#ff8c00"}
                  onMouseLeave={(e: any) => e.currentTarget.style.color = location.startsWith("/services") ? "#ff6a00" : "#333"}
                  data-testid="nav-services-dropdown"
                >
                  {isAr ? "الخدمات" : "Services"}
                  <ChevronDown style={{ width: 16, height: 16 }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isAr ? "end" : "start"} sideOffset={8} avoidCollisions={false} style={{ width: 280, zIndex: 9999, borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 16px 40px rgba(0,0,0,0.15)", background: "#fff", padding: 10 }}>
                {SERVICES.map(s => (
                  <DropdownMenuItem key={s.href} asChild>
                    <Link
                      href={s.href}
                      style={{ display: "block", padding: "12px 14px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "#333", textDecoration: "none", cursor: "pointer", transition: "all 0.2s", whiteSpace: "normal" }}
                      onMouseEnter={(e: any) => {
                        e.currentTarget.style.background = "rgba(255,136,0,0.08)";
                        e.currentTarget.style.color = "#ff6a00";
                      }}
                      onMouseLeave={(e: any) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#333";
                      }}
                    >
                      {isAr ? s.label : s.labelEn}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Actions - Right Side */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }} className="hide-mobile">
            <a
              href="/projects"
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                borderRadius: 999, 
                padding: "11px 24px", 
                fontSize: 14, 
                fontWeight: 700, 
                background: "rgba(255,255,255,0.5)", 
                color: "#333", 
                border: "1.5px solid rgba(255,136,0,0.2)",
                textDecoration: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.background = "rgba(255,136,0,0.1)";
                e.currentTarget.borderColor = "rgba(255,136,0,0.4)";
                e.currentTarget.style.color = "#ff6a00";
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.5)";
                e.currentTarget.borderColor = "rgba(255,136,0,0.2)";
                e.currentTarget.style.color = "#333";
              }}
              data-testid="nav-projects-btn"
            >
              {isAr ? "شاهد الأعمال" : "View Work"}
            </a>
            <a
              href="#contact"
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                borderRadius: 999, 
                padding: "11px 28px", 
                fontSize: 14, 
                fontWeight: 700, 
                background: "linear-gradient(135deg,#ff6a00,#ff8c00)", 
                color: "#fff", 
                boxShadow: "0 12px 32px rgba(255,136,0,0.3)",
                textDecoration: "none", 
                border: 0,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                cursor: "pointer"
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(255,136,0,0.4)";
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(255,136,0,0.3)";
              }}
              data-testid="nav-contact-btn"
            >
              {isAr ? "اطلب عرض سعر" : "Request a Quote"}
            </a>
          </div>

          {/* Mobile menu btn */}
          <button
            style={{ display: "none", background: "#fff", border: "1.5px solid rgba(255,136,0,0.2)", width: 48, height: 48, borderRadius: 12, cursor: "pointer", fontSize: 20, alignItems: "center", justifyContent: "center", color: "#333", transition: "all 0.3s" }}
            className="show-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(255,136,0,0.1)"; e.currentTarget.style.borderColor = "rgba(255,136,0,0.4)"; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(255,136,0,0.2)"; }}
            data-testid="nav-mobile-menu-btn"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ borderTop: "1px solid rgba(255,136,0,0.15)", background: "rgba(255,255,255,0.95)", padding: "16px 0", backdropFilter: "blur(8px)" }}>
            <div style={{ width: "min(1280px, calc(100% - 40px))", marginInline: "auto", display: "grid", gap: 6 }}>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ display: "block", padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 700, color: location === link.href ? "#ff6a00" : "#333", textDecoration: "none", background: location === link.href ? "rgba(255,136,0,0.08)" : "transparent", transition: "all 0.2s" }}
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={(e: any) => {
                    if (location !== link.href) {
                      e.currentTarget.style.background = "rgba(255,136,0,0.06)";
                      e.currentTarget.style.color = "#ff8c00";
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (location !== link.href) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#333";
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,136,0,0.1)", marginTop: 8 }}>
                <p style={{ margin: "0 0 8px", padding: "0 16px", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {isAr ? "الخدمات" : "Services"}
                </p>
                {SERVICES.map(s => (
                  <Link
                    key={s.href}
                    href={s.href}
                    style={{ display: "block", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#555", textDecoration: "none", transition: "all 0.2s" }}
                    onClick={() => setMenuOpen(false)}
                    onMouseEnter={(e: any) => {
                      e.currentTarget.style.background = "rgba(255,136,0,0.06)";
                      e.currentTarget.style.color = "#ff6a00";
                    }}
                    onMouseLeave={(e: any) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#555";
                    }}
                  >
                    {isAr ? s.label : s.labelEn}
                  </Link>
                ))}
              </div>
              <div style={{ padding: "14px 16px 8px", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button 
                  onClick={() => { onLangChange?.(isAr ? "en" : "ar"); setMenuOpen(false); }} 
                  style={{ padding: "10px 18px", borderRadius: 999, border: "1.5px solid rgba(255,136,0,0.2)", background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#333", transition: "all 0.3s" }}
                  onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(255,136,0,0.1)"; e.currentTarget.style.borderColor = "rgba(255,136,0,0.4)"; e.currentTarget.style.color = "#ff6a00"; }}
                  onMouseLeave={(e: any) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(255,136,0,0.2)"; e.currentTarget.style.color = "#333"; }}
                >
                  {isAr ? "English" : "العربية"}
                </button>
                <a href="#contact" style={{ display: "inline-flex", flex: 1, justifyContent: "center", borderRadius: 999, padding: "10px 20px", fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#ff6a00,#ff8c00)", color: "#fff", textDecoration: "none", boxShadow: "0 8px 20px rgba(255,136,0,0.25)" }} onClick={() => setMenuOpen(false)}>
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
