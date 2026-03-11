import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Phone, CheckCircle2, Star, Zap, Shield, Users2, TrendingUp, Globe, Smartphone, Code2, Server, Megaphone, PenTool, ChevronDown } from "lucide-react";
import type { Service, Project } from "@shared/schema";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const STATS = [
  { value: "200+", labelAr: "مشروع منجز", labelEn: "Completed Projects" },
  { value: "150+", labelAr: "عميل سعيد", labelEn: "Happy Clients" },
  { value: "8+", labelAr: "سنوات خبرة", labelEn: "Years Experience" },
  { value: "24/7", labelAr: "دعم فني", labelEn: "Support" },
];

const DEFAULT_SERVICES = [
  { icon: Smartphone, titleAr: "برمجة تطبيقات الجوال", titleEn: "Mobile App Development", descAr: "نحول أفكارك إلى تطبيقات احترافية لـ iOS و Android", descEn: "We turn your ideas into professional iOS & Android apps", slug: "mobile-app-development" },
  { icon: Code2, titleAr: "تطوير وبرمجة المواقع", titleEn: "Web Development", descAr: "نبني مواقع احترافية تنمو مع أعمالك", descEn: "We build professional websites that grow with your business", slug: "software-services" },
  { icon: Server, titleAr: "الاستضافة والسيرفرات", titleEn: "Hosting & Servers", descAr: "استضافة آمنة وموثوقة مع دعم على مدار الساعة", descEn: "Secure and reliable hosting with 24/7 support", slug: "technical-consulting" },
  { icon: Megaphone, titleAr: "التسويق الرقمي", titleEn: "Digital Marketing", descAr: "حلول تسويقية متكاملة لتعزيز حضورك الرقمي", descEn: "Comprehensive marketing solutions to boost your digital presence", slug: "digital-marketing" },
  { icon: PenTool, titleAr: "إدارة المحتوى والتصاميم", titleEn: "Content & Design", descAr: "تصاميم إبداعية ومحتوى احترافي يجذب العملاء", descEn: "Creative designs and professional content that attract clients", slug: "content-management" },
  { icon: Globe, titleAr: "الاستشارات التقنية", titleEn: "Technical Consulting", descAr: "نرافقك في رحلتك التقنية بخبرة واحترافية", descEn: "We guide your technical journey with expertise and professionalism", slug: "technical-consulting" },
];

const WHY_US = [
  { icon: Zap, titleAr: "سرعة في التنفيذ", titleEn: "Fast Delivery", descAr: "ننجز مشاريعك في أقصر وقت دون المساس بالجودة", descEn: "We complete your projects in the shortest time without compromising quality" },
  { icon: Shield, titleAr: "جودة مضمونة", titleEn: "Guaranteed Quality", descAr: "نضمن جودة عملنا مع دعم مستمر بعد الإطلاق", descEn: "We guarantee the quality of our work with continuous post-launch support" },
  { icon: Users2, titleAr: "فريق متخصص", titleEn: "Specialized Team", descAr: "فريق من المتخصصين ذوي الخبرة العالية", descEn: "A team of highly experienced specialists" },
  { icon: TrendingUp, titleAr: "نتائج قابلة للقياس", titleEn: "Measurable Results", descAr: "نركز على النتائج الحقيقية التي تنمو أعمالك", descEn: "We focus on real results that grow your business" },
];

interface HomeProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

export default function PublicHome({ lang = "ar", onLangChange }: HomeProps) {
  const isAr = lang === "ar";

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/public/services", TENANT_ID],
    
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/public/projects", TENANT_ID],
    
  });

  const displayServices = services && services.length > 0 ? [] : DEFAULT_SERVICES;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0)", backgroundSize: "50px 50px" }} />
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600/30 text-sm px-4 py-1.5">
            {isAr ? "🚀 شركة تقنية رائدة في المملكة" : "🚀 Leading Tech Company in Saudi Arabia"}
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            {isAr ? (
              <>امتلك السوق<br /><span className="text-blue-400">وأعلن عن مشروعك</span></>
            ) : (
              <>Own the Market<br /><span className="text-blue-400">& Launch Your Project</span></>
            )}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {isAr
              ? "نحن سوفتلكس - شركة متخصصة في برمجة التطبيقات والمواقع والتسويق الرقمي. نحول أفكارك إلى مشاريع رقمية ناجحة."
              : "We are Softlix - specialized in app development, web development, and digital marketing. We turn your ideas into successful digital projects."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8 h-12" data-testid="btn-hero-contact">
              <Link href="/contact">
                {isAr ? "ابدأ مشروعك الآن" : "Start Your Project Now"}
                <Arrow className="w-4 h-4 mx-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 text-base px-8 h-12" data-testid="btn-hero-projects">
              <Link href="/projects">{isAr ? "اكتشف أعمالنا" : "View Our Work"}</Link>
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-white/40" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-blue-100 text-sm">{isAr ? stat.labelAr : stat.labelEn}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900" data-testid="section-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0">
              {isAr ? "ما نقدمه" : "What We Offer"}
            </Badge>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              {isAr ? "خدماتنا" : "Our Services"}
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {isAr
                ? "نقدم حلولاً تقنية شاملة تلبي احتياجات أعمالك في العالم الرقمي"
                : "We provide comprehensive tech solutions that meet your business needs in the digital world"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <Link key={i} href={`/services/${service.slug}`} data-testid={`card-service-${i}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group h-full">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {isAr ? service.titleAr : service.titleEn}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                      {isAr ? service.descAr : service.descEn}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      {isAr ? "اعرف أكثر" : "Learn more"}
                      <Arrow className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
            {services && services.map((service) => (
              <Link key={service.id} href={`/services/${service.slug}`} data-testid={`card-service-${service.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group h-full">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {isAr ? service.title : (service.titleEn || service.title)}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {isAr ? service.shortDescription : (service.shortDescriptionEn || service.shortDescription)}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium">
                    {isAr ? "اعرف أكثر" : "Learn more"}
                    <Arrow className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-950" data-testid="section-projects">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge className="mb-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-0">
                {isAr ? "أعمالنا" : "Portfolio"}
              </Badge>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                {isAr ? "مشاريعنا المميزة" : "Featured Projects"}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`} data-testid={`card-project-${project.id}`}>
                  <div className="group rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
                    {project.thumbnailUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    {!project.thumbnailUrl && (
                      <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-black text-4xl opacity-40">S</span>
                      </div>
                    )}
                    <div className="p-5">
                      {project.category && <Badge className="mb-2 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0">{project.category}</Badge>}
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {isAr ? project.title : (project.titleEn || project.title)}
                      </h3>
                      {project.clientName && <p className="text-xs text-gray-500 mt-1">{project.clientName}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button asChild variant="outline" size="lg" data-testid="btn-view-all-projects">
                <Link href="/projects">
                  {isAr ? "عرض جميع المشاريع" : "View All Projects"}
                  <Arrow className="w-4 h-4 mx-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Why Us */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-0">
                {isAr ? "لماذا سوفتلكس" : "Why Softlix"}
              </Badge>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">
                {isAr ? "لماذا تختارنا؟" : "Why Choose Us?"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                {isAr
                  ? "نجاحنا يأتي من نجاح عملائنا. نحن نؤمن أن التقنية يجب أن تخدم أهداف أعمالك وليس العكس."
                  : "Our success comes from our clients' success. We believe technology should serve your business goals, not the other way around."}
              </p>
              <div className="space-y-4">
                {WHY_US.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{isAr ? item.titleAr : item.titleEn}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{isAr ? item.descAr : item.descEn}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-10 text-white">
                <Star className="w-10 h-10 mb-4 text-yellow-300" />
                <blockquote className="text-xl font-medium mb-6 leading-relaxed">
                  {isAr
                    ? "\"وحدنا يمكننا أن نفعل القليل، معاً يمكننا أن نفعل الكثير\""
                    : "\"Alone we can do so little; together we can do so much\""}
                </blockquote>
                <p className="text-blue-200 text-sm">{isAr ? "رسالتنا الدائمة" : "Our Permanent Mission"}</p>
                <div className="mt-8 pt-8 border-t border-white/20 grid grid-cols-3 gap-4">
                  {STATS.slice(0, 3).map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-3xl font-black text-white">{stat.value}</div>
                      <div className="text-blue-200 text-xs mt-1">{isAr ? stat.labelAr : stat.labelEn}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-4">
            {isAr ? "هل أنت مستعد لتطوير مشروعك؟" : "Ready to Grow Your Business?"}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {isAr ? "تواصل معنا اليوم ونحن نتكفل بالباقي" : "Contact us today and we'll take care of the rest"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-base px-8 h-12" data-testid="btn-cta-contact">
              <Link href="/contact">
                <Phone className="w-4 h-4 mx-2" />
                {isAr ? "تواصل معنا الآن" : "Contact Us Now"}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8 h-12" data-testid="btn-cta-services">
              <Link href="/services">{isAr ? "استكشف خدماتنا" : "Explore Services"}</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
