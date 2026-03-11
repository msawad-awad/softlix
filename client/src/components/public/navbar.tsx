import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SERVICES = [
  { label: "برمجة تطبيقات الجوال", labelEn: "Mobile App Development", href: "/services/mobile-app-development" },
  { label: "تطوير وبرمجة المواقع", labelEn: "Software Services", href: "/services/software-services" },
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
  const [location] = useLocation();
  const isAr = lang === "ar";

  const navLinks = [
    { label: isAr ? "الرئيسية" : "Home", href: "/" },
    { label: isAr ? "من نحن" : "About", href: "/about" },
    { label: isAr ? "المشاريع" : "Projects", href: "/projects" },
    { label: isAr ? "المدونة" : "Blog", href: "/blog" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-blue-600 dark:text-blue-400">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            softlix
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location === link.href ? "text-blue-600" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                {isAr ? "خدماتنا" : "Services"}
                <ChevronDown className="w-3.5 h-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isAr ? "end" : "start"} className="w-56">
                {SERVICES.map(s => (
                  <DropdownMenuItem key={s.href} asChild>
                    <Link href={s.href} className="cursor-pointer">
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
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {isAr ? "EN" : "عر"}
            </button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/contact">{isAr ? "تواصل معنا" : "Contact Us"}</Link>
            </Button>
          </div>

          {/* Mobile menu btn */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block text-sm font-medium py-1.5 transition-colors ${
                  location === link.href ? "text-blue-600" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 mb-2">{isAr ? "خدماتنا" : "Our Services"}</p>
              {SERVICES.map(s => (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm text-gray-600 dark:text-gray-400 py-1 hover:text-blue-600"
                >
                  {isAr ? s.label : s.labelEn}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => { onLangChange?.(isAr ? "en" : "ar"); setMenuOpen(false); }}
                className="flex items-center gap-1.5 text-sm text-gray-600"
              >
                <Globe className="w-4 h-4" />
                {isAr ? "English" : "العربية"}
              </button>
              <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/contact" onClick={() => setMenuOpen(false)}>
                  {isAr ? "تواصل معنا" : "Contact Us"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
