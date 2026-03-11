import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface FooterProps {
  lang?: "ar" | "en";
}

export function PublicFooter({ lang = "ar" }: FooterProps) {
  const isAr = lang === "ar";

  return (
    <footer className="bg-gray-950 text-gray-300" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-white font-black text-xl">softlix</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              {isAr
                ? "شركة سوفتلكس للتقنية والمعلومات - نحول أفكارك إلى واقع رقمي من خلال حلول برمجية وتسويقية متكاملة."
                : "Softlix Information Technology - We transform your ideas into digital reality with integrated software and marketing solutions."}
            </p>
            <div className="flex items-center gap-3">
              <a href="https://wa.me/966537861534" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-500 transition-colors">
                <SiWhatsapp className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {isAr ? "خدماتنا" : "Our Services"}
            </h3>
            <ul className="space-y-2.5">
              {[
                { ar: "برمجة تطبيقات الجوال", en: "Mobile App Development", href: "/services/mobile-app-development" },
                { ar: "تطوير المواقع", en: "Web Development", href: "/services/software-services" },
                { ar: "الاستشارات التقنية", en: "Technical Consulting", href: "/services/technical-consulting" },
                { ar: "التسويق الرقمي", en: "Digital Marketing", href: "/services/digital-marketing" },
                { ar: "إدارة المحتوى", en: "Content Management", href: "/services/content-management" },
              ].map(s => (
                <li key={s.href}>
                  <Link href={s.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    {isAr ? s.ar : s.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {isAr ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-2.5">
              {[
                { ar: "الرئيسية", en: "Home", href: "/" },
                { ar: "من نحن", en: "About Us", href: "/about" },
                { ar: "المشاريع", en: "Projects", href: "/projects" },
                { ar: "المدونة", en: "Blog", href: "/blog" },
                { ar: "تواصل معنا", en: "Contact Us", href: "/contact" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    {isAr ? l.ar : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {isAr ? "تواصل معنا" : "Contact Us"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span>{isAr ? "مبنى الامتياز، حي الصفا، طريق الحرمين، المملكة العربية السعودية" : "Al Imtiyaz Building, Al Safa, Haramain Road, Saudi Arabia"}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="tel:0537861534" className="hover:text-blue-400 transition-colors">0537861534</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@softlix.net" className="hover:text-blue-400 transition-colors">info@softlix.net</a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Clock className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span>{isAr ? "السبت - الخميس: 9ص - 6م" : "Sat - Thu: 9AM - 6PM"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © 2024 softlix. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <p className="text-xs text-gray-500">
            {isAr ? "صُنع بـ ❤️ في المملكة العربية السعودية" : "Made with ❤️ in Saudi Arabia"}
          </p>
        </div>
      </div>
    </footer>
  );
}
