import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, Sparkles } from "lucide-react";
import { SiWhatsapp, SiLinkedin, SiInstagram, SiX } from "react-icons/si";

interface FooterProps {
  lang?: "ar" | "en";
}

export function PublicFooter({ lang = "ar" }: FooterProps) {
  const isAr = lang === "ar";

  return (
    <footer className="border-t border-white/[0.06]" style={{ background: "#030710" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-black text-xl tracking-tight">softlix</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 mb-6">
              {isAr
                ? "شريكك التقني المتكامل في برمجة التطبيقات والمواقع والتسويق الرقمي. نحول أفكارك إلى منتجات رقمية ناجحة."
                : "Your complete tech partner for app development, web solutions, and digital marketing. We build products that exceed expectations."}
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="https://wa.me/966537861534"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10 transition-all"
              >
                <SiWhatsapp className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all"
              >
                <SiLinkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10 transition-all"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all"
              >
                <SiX className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-[0.15em]">
              {isAr ? "خدماتنا" : "Our Services"}
            </h3>
            <ul className="space-y-3">
              {[
                { ar: "برمجة تطبيقات الجوال", en: "Mobile App Development", href: "/services/mobile-app-development" },
                { ar: "تطوير وبرمجة المواقع", en: "Web Development", href: "/services/web-development" },
                { ar: "التجارة الإلكترونية", en: "E-Commerce & Magento", href: "/services/ecommerce" },
                { ar: "التسويق الرقمي", en: "Digital Marketing", href: "/services/digital-marketing" },
                { ar: "إدارة المحتوى والتصاميم", en: "Content & Design", href: "/services/content-management" },
              ].map(s => (
                <li key={s.href}>
                  <Link href={s.href} className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
                    {isAr ? s.ar : s.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-[0.15em]">
              {isAr ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-3">
              {[
                { ar: "الرئيسية", en: "Home", href: "/" },
                { ar: "من نحن", en: "About Us", href: "/about" },
                { ar: "المشاريع", en: "Projects", href: "/projects" },
                { ar: "المدونة", en: "Blog", href: "/blog" },
                { ar: "تواصل معنا", en: "Contact Us", href: "/contact" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
                    {isAr ? l.ar : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-[0.15em]">
              {isAr ? "تواصل معنا" : "Contact Us"}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-500">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <span className="leading-relaxed">
                  {isAr ? "مبنى الامتياز، حي الصفا، طريق الحرمين، المملكة العربية السعودية" : "Al Imtiyaz Building, Al Safa, Haramain Road, Saudi Arabia"}
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <a href="tel:0537861534" className="text-slate-500 hover:text-blue-400 transition-colors">0537861534</a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <a href="mailto:info@softlix.net" className="text-slate-500 hover:text-blue-400 transition-colors">info@softlix.net</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-500">
                <Clock className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>{isAr ? "السبت - الخميس: 9ص - 6م" : "Sat - Thu: 9AM - 6PM"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} softlix. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <p className="text-xs text-slate-600">
            {isAr ? "صُنع بـ ❤️ في المملكة العربية السعودية" : "Made with ❤️ in Saudi Arabia"}
          </p>
        </div>
      </div>
    </footer>
  );
}
