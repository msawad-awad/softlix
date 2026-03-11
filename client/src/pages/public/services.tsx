import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Smartphone, Code2, Server, Megaphone, PenTool, Globe, CheckCircle2 } from "lucide-react";
import type { Service } from "@shared/schema";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const DEFAULT_SERVICES = [
  { icon: Smartphone, slug: "mobile-app-development", titleAr: "برمجة تطبيقات الجوال", titleEn: "Mobile App Development", descAr: "نحن متخصصون في برمجة تطبيقات الجوال (iOS و Android) ونحول أفكارك إلى واقع", descEn: "We specialize in mobile app development (iOS & Android) and turn your ideas into reality", featuresAr: ["تطبيقات iOS & Android", "تصميم UI/UX احترافي", "تكامل مع APIs", "دعم مستمر بعد الإطلاق"], featuresEn: ["iOS & Android apps", "Professional UI/UX design", "API integration", "Continuous post-launch support"] },
  { icon: Code2, slug: "software-services", titleAr: "تطوير وبرمجة المواقع", titleEn: "Web Development", descAr: "نقوم بإنشاء الهوية الرقمية على الإنترنت لعملك مما يسمح لها بالازدهار في عالم المواقع الإلكترونية", descEn: "We create your digital identity on the internet allowing your business to thrive in the world of websites", featuresAr: ["مواقع متجاوبة", "أنظمة CMS", "متاجر إلكترونية", "لوحات تحكم مخصصة"], featuresEn: ["Responsive websites", "CMS systems", "E-commerce stores", "Custom dashboards"] },
  { icon: Server, slug: "technical-consulting", titleAr: "الاستضافة والسيرفرات", titleEn: "Hosting & Servers", descAr: "نوفر الاستضافة الآمنة لمواقع الويب وتطبيقات الأجهزة المحمولة مع دعم على مدار الساعة", descEn: "We provide secure hosting for websites and mobile applications with 24/7 support", featuresAr: ["استضافة سحابية", "سيرفرات مخصصة", "دعم 24/7", "نسخ احتياطي تلقائي"], featuresEn: ["Cloud hosting", "Dedicated servers", "24/7 support", "Automatic backups"] },
  { icon: Megaphone, slug: "digital-marketing", titleAr: "التسويق الرقمي الإلكتروني", titleEn: "Digital Marketing", descAr: "حلول تسويقية رقمية متكاملة لتعزيز حضورك الإلكتروني وزيادة مبيعاتك", descEn: "Integrated digital marketing solutions to enhance your online presence and increase your sales", featuresAr: ["إدارة سوشيال ميديا", "إعلانات جوجل وفيسبوك", "SEO وتحسين محركات البحث", "استراتيجيات تسويقية"], featuresEn: ["Social media management", "Google & Facebook ads", "SEO optimization", "Marketing strategies"] },
  { icon: PenTool, slug: "content-management", titleAr: "إدارة محتوى المواقع والتصاميم", titleEn: "Content & Design Management", descAr: "نقدم خدمات إدارة المحتوى والتصميم الجرافيكي لإبراز هويتك البصرية بشكل احترافي", descEn: "We provide content management and graphic design services to showcase your visual identity professionally", featuresAr: ["تصميم جرافيكي", "إنتاج محتوى", "هوية بصرية", "تصوير احترافي"], featuresEn: ["Graphic design", "Content production", "Visual identity", "Professional photography"] },
  { icon: Globe, slug: "ecommerce", titleAr: "حلول التجارة الإلكترونية", titleEn: "E-Commerce Solutions", descAr: "نبني منصات تجارة إلكترونية متكاملة تمنحك تجربة تسوق سلسة لعملائك", descEn: "We build integrated e-commerce platforms that give your customers a seamless shopping experience", featuresAr: ["متاجر Magento", "WooCommerce", "تكامل مع بوابات الدفع", "إدارة المخزون"], featuresEn: ["Magento stores", "WooCommerce", "Payment gateway integration", "Inventory management"] },
];

interface ServicesProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

export default function PublicServices({ lang = "ar", onLangChange }: ServicesProps) {
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const { data: servicesData } = useQuery<Service[]>({
    queryKey: ["/api/public/services", TENANT_ID],
    
  });

  const useDefault = !servicesData || servicesData.length === 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-600/30">{isAr ? "ما نقدمه" : "What We Offer"}</Badge>
          <h1 className="text-5xl font-black mb-5">{isAr ? "خدماتنا" : "Our Services"}</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {isAr ? "حلول تقنية وتسويقية متكاملة تلبي كل احتياجات أعمالك في العالم الرقمي" : "Comprehensive technical and marketing solutions to meet all your business needs in the digital world"}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10">
            {useDefault ? DEFAULT_SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={i} id={service.slug} className="grid md:grid-cols-2 gap-8 items-center p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl" data-testid={`service-section-${i}`}>
                  <div className={i % 2 === 1 ? "md:order-2" : ""}>
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                      {isAr ? service.titleAr : service.titleEn}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                      {isAr ? service.descAr : service.descEn}
                    </p>
                    <ul className="space-y-2 mb-8">
                      {(isAr ? service.featuresAr : service.featuresEn).map((feat, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white" data-testid={`button-service-detail-${i}`}>
                        <Link href={`/services/${service.slug}`}>
                          {isAr ? "تفاصيل الخدمة" : "Service Details"}
                          <Arrow className="w-4 h-4 mx-2" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" data-testid={`button-service-request-${i}`}>
                        <Link href={`/services/${service.slug}#request-form`}>
                          {isAr ? "اطلب الخدمة" : "Request Service"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className={i % 2 === 1 ? "md:order-1" : ""}>
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Icon className="w-24 h-24 text-white/40" />
                    </div>
                  </div>
                </div>
              );
            }) : servicesData.map((service) => (
              <div key={service.id} className="grid md:grid-cols-2 gap-8 items-center p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl" data-testid={`service-section-${service.id}`}>
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                    <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                    {isAr ? service.title : (service.titleEn || service.title)}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {isAr ? service.fullDescription : (service.fullDescriptionEn || service.fullDescription)}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white" data-testid={`button-service-detail-${service.id}`}>
                      <Link href={`/services/${service.slug}`}>
                        {isAr ? "تفاصيل الخدمة" : "Service Details"}<Arrow className="w-4 h-4 mx-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" data-testid={`button-service-request-db-${service.id}`}>
                      <Link href={`/services/${service.slug}#request-form`}>
                        {isAr ? "اطلب الخدمة" : "Request Service"}
                      </Link>
                    </Button>
                  </div>
                </div>
                <div>
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt={service.title} className="w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Globe className="w-24 h-24 text-white/40" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">{isAr ? "جاهز لبدء مشروعك؟" : "Ready to Start Your Project?"}</h2>
          <p className="text-blue-100 mb-8">{isAr ? "تواصل معنا اليوم ونحن نبدأ بتحويل فكرتك إلى واقع" : "Contact us today and we'll start turning your idea into reality"}</p>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
            <Link href="/contact">{isAr ? "تواصل معنا" : "Contact Us"}</Link>
          </Button>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
