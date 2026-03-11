import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  { label: "استشارات تقنية", labelEn: "Technical Consulting", href: "/services/technical-consulting" },
  { label: "تسويق رقمي إلكتروني", labelEn: "Digital Marketing", href: "/services/digital-marketing" },
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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: isAr ? "الرئيسية" : "Home", href: "/" },
    { label: isAr ? "من نحن" : "About", href: "/about" },
    { label: isAr ? "المشاريع" : "Projects", href: "/projects" },
    { label: isAr ? "المدونة" : "Blog", href: "/blog" },
  ];

  const navBase = scrolled
    ? "border-b border-white/10 bg-[#040812]/90"
    : "border-b border-transparent bg-transparent";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${navBase}`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">softlix</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === link.href
                    ? "text-white bg-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.startsWith("/services") ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  data-testid="nav-services-dropdown"
                >
                  {isAr ? "خدماتنا" : "Services"}
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isAr ? "end" : "start"}
                className="w-60 rounded-xl border border-white/10 bg-[#0d1526] shadow-xl shadow-black/50 p-1"
              >
                {SERVICES.map(s => (
                  <DropdownMenuItem key={s.href} asChild>
                    <Link
                      href={s.href}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.07] cursor-pointer transition-colors"
                    >
                      {isAr ? s.label : s.labelEn}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onLangChange?.(isAr ? "en" : "ar")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              data-testid="nav-lang-toggle"
            >
              <Globe className="w-4 h-4" />
              {isAr ? "EN" : "عر"}
            </button>
            <Button
              asChild
              size="sm"
              className="h-9 px-4 rounded-lg text-sm font-semibold text-white border border-blue-400/20 shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
              data-testid="nav-contact-btn"
            >
              <Link href="/contact">{isAr ? "تواصل معنا" : "Contact Us"}</Link>
            </Button>
          </div>

          {/* Mobile menu btn */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="nav-mobile-menu-btn"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#040812]/98 backdrop-blur-lg px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location === link.href ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="py-1">
            <p className="px-4 text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">
              {isAr ? "الخدمات" : "Services"}
            </p>
            {SERVICES.map(s => (
              <Link
                key={s.href}
                href={s.href}
                className="block px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {isAr ? s.label : s.labelEn}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={() => { onLangChange?.(isAr ? "en" : "ar"); setMenuOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Globe className="w-4 h-4" />
              {isAr ? "English" : "العربية"}
            </button>
            <Button
              asChild
              size="sm"
              className="rounded-lg text-white flex-1"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              <Link href="/contact" onClick={() => setMenuOpen(false)}>
                {isAr ? "تواصل معنا" : "Contact Us"}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
