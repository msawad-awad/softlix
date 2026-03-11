import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Phone, CheckCircle2, Star, Zap, Shield,
  Users2, TrendingUp, Globe, Smartphone, Code2, Server, Megaphone,
  PenTool, ChevronDown, Sparkles, Timer, Award, MessageSquare,
} from "lucide-react";
import type { Service, Project } from "@shared/schema";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const STATS = [
  { value: "200+", labelAr: "مشروع منجز", labelEn: "Projects Done" },
  { value: "150+", labelAr: "عميل سعيد", labelEn: "Happy Clients" },
  { value: "8+", labelAr: "سنوات خبرة", labelEn: "Years Experience" },
  { value: "24/7", labelAr: "دعم فني", labelEn: "Support" },
];

const DEFAULT_SERVICES = [
  { icon: Smartphone, titleAr: "برمجة تطبيقات الجوال", titleEn: "Mobile App Development", descAr: "نحول أفكارك إلى تطبيقات احترافية لـ iOS و Android بجودة عالية", descEn: "We turn your ideas into professional iOS & Android apps", slug: "mobile-app-development", color: "from-blue-500 to-cyan-400" },
  { icon: Code2, titleAr: "تطوير وبرمجة المواقع", titleEn: "Web Development", descAr: "نبني مواقع ومنصات رقمية احترافية تنمو مع أعمالك", descEn: "We build professional websites that grow with your business", slug: "web-development", color: "from-violet-500 to-purple-400" },
  { icon: Server, titleAr: "الاستضافة والسيرفرات", titleEn: "Hosting & Servers", descAr: "استضافة آمنة وموثوقة مع دعم فني على مدار الساعة", descEn: "Secure and reliable hosting with 24/7 support", slug: "hosting-servers", color: "from-emerald-500 to-teal-400" },
  { icon: Megaphone, titleAr: "التسويق الرقمي", titleEn: "Digital Marketing", descAr: "حلول تسويقية متكاملة تأخذك لعالم التميز والمنافسة", descEn: "Comprehensive marketing solutions to boost your digital presence", slug: "digital-marketing", color: "from-orange-500 to-amber-400" },
  { icon: PenTool, titleAr: "التصميم الإبداعي", titleEn: "Creative Design", descAr: "نحول أفكارك إلى تصاميم إبداعية تعبر عن هويتك", descEn: "Creative designs that express your unique brand identity", slug: "creative-design", color: "from-pink-500 to-rose-400" },
  { icon: Globe, titleAr: "الاستشارات التقنية", titleEn: "Technical Consulting", descAr: "نرافقك في رحلتك التقنية بخبرة واحترافية عالية", descEn: "Expert technical guidance for your digital journey", slug: "technical-consulting", color: "from-indigo-500 to-blue-400" },
];

const WHY_US = [
  { icon: Timer, titleAr: "تسليم سريع", titleEn: "Fast Delivery", descAr: "ننجز مشاريعك في وقت قياسي دون المساس بالجودة", descEn: "We deliver your projects in record time without compromising quality" },
  { icon: Shield, titleAr: "جودة مضمونة", titleEn: "Guaranteed Quality", descAr: "نضمن جودة كل تفصيل مع دعم مستمر بعد الإطلاق", descEn: "We guarantee every detail with continuous post-launch support" },
  { icon: Users2, titleAr: "فريق متخصص", titleEn: "Specialized Team", descAr: "فريق من الخبراء المتخصصين في أحدث التقنيات", descEn: "A team of experts specialized in the latest technologies" },
  { icon: Award, titleAr: "نتائج حقيقية", titleEn: "Real Results", descAr: "نركز على نتائج ملموسة تُنمّي أعمالك فعلياً", descEn: "We focus on tangible results that actually grow your business" },
];

const TESTIMONIALS = [
  { nameAr: "أحمد الشمري", nameEn: "Ahmad Al-Shamri", roleAr: "مؤسس تطبيق مساكني", roleEn: "Founder, Maskaniun App", quote: "سوفتلكس حولت فكرتنا إلى واقع بجودة احترافية ومزامنة مستمرة", quoteEn: "Softlix turned our idea into reality with professional quality and continuous sync" },
  { nameAr: "سارة العتيبي", nameEn: "Sara Al-Otaibi", roleAr: "مديرة تسويق، تيسير", roleEn: "Marketing Manager, Taysir", quote: "فريق رائع واحترافي، أنجزوا مشروعنا قبل الموعد المحدد بأسبوع", quoteEn: "Amazing and professional team, they delivered our project a week ahead of schedule" },
  { nameAr: "محمد القحطاني", nameEn: "Mohammed Al-Qahtani", roleAr: "CEO، شركة ترانسفير", roleEn: "CEO, Transfer App", quote: "أنصح كل من يريد تطبيقاً ناجحاً بالتعامل مع سوفتلكس بدون تردد", quoteEn: "I recommend anyone wanting a successful app to work with Softlix without hesitation" },
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

  const displayServices = services && services.length > 0 ? services : null;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#040812] text-white" dir={isAr ? "rtl" : "ltr"}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        {/* Radial glow center */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
        {/* Side glows */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", transform: "translate(30%, 30%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">
              {isAr ? "شركة تقنية رائدة في المملكة العربية السعودية" : "Leading Tech Company in Saudi Arabia"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black mb-6 leading-[1.05] tracking-tight">
            {isAr ? (
              <>
                <span className="text-white">نُحوِّل</span>{" "}
                <span style={{ background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>أفكارك</span>
                <br />
                <span className="text-white">إلى</span>{" "}
                <span style={{ background: "linear-gradient(135deg, #34d399 0%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>واقع رقمي</span>
              </>
            ) : (
              <>
                <span className="text-white">We Turn</span>{" "}
                <span style={{ background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ideas</span>
                <br />
                <span className="text-white">Into</span>{" "}
                <span style={{ background: "linear-gradient(135deg, #34d399 0%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Digital Reality</span>
              </>
            )}
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {isAr
              ? "سوفتلكس — شريكك التقني المتكامل في برمجة التطبيقات والمواقع والتسويق الرقمي. نبني منتجات تتفوق على التوقعات."
              : "Softlix — your complete tech partner for app development, web solutions, and digital marketing. We build products that exceed expectations."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-base font-semibold rounded-xl text-white shadow-lg shadow-blue-500/25 border border-blue-400/20" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }} data-testid="btn-hero-contact">
              <Link href="/contact">
                <Phone className="w-4 h-4 mx-2" />
                {isAr ? "ابدأ مشروعك الآن" : "Start Your Project"}
              </Link>
            </Button>
            <Button asChild size="lg" className="h-14 px-8 text-base font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm transition-all" data-testid="btn-hero-projects">
              <Link href="/projects">
                {isAr ? "اكتشف أعمالنا" : "View Our Work"}
                <Arrow className="w-4 h-4 mx-2" />
              </Link>
            </Button>
          </div>

          {/* Floating stats badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {STATS.map((stat, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <span className="text-2xl font-black text-white">{stat.value}</span>
                <span className="text-slate-400 text-sm">{isAr ? stat.labelAr : stat.labelEn}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 text-white/30" />
        </div>
      </section>

      {/* ── Services ───────────────────────────────────── */}
      <section className="py-28 relative" data-testid="section-services" style={{ background: "linear-gradient(180deg, #040812 0%, #080f1f 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">
              {isAr ? "— ما نقدمه —" : "— What We Offer —"}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              {isAr ? "خدماتنا" : "Our Services"}
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              {isAr
                ? "حلول تقنية شاملة مصممة لتنمية أعمالك في العالم الرقمي"
                : "Comprehensive tech solutions designed to grow your business"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(displayServices ?? DEFAULT_SERVICES).map((service: any, i: number) => {
              const Icon = service.icon ?? Zap;
              const color = service.color ?? "from-blue-500 to-cyan-400";
              return (
                <Link key={service.id ?? i} href={`/services/${service.slug}`} data-testid={`card-service-${service.id ?? i}`}>
                  <div className="group relative rounded-2xl p-6 h-full border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer overflow-hidden">
                    {/* Glow on hover */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} style={{ background: `radial-gradient(circle at 30% 20%, ${color.includes("blue") ? "rgba(59,130,246,0.08)" : color.includes("violet") ? "rgba(139,92,246,0.08)" : color.includes("emerald") ? "rgba(16,185,129,0.08)" : "rgba(249,115,22,0.08)"} 0%, transparent 70%)` }} />
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {isAr ? (service.titleAr ?? service.title) : (service.titleEn ?? service.title)}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {isAr ? (service.descAr ?? service.shortDescription) : (service.descEn ?? service.shortDescriptionEn ?? service.shortDescription)}
                    </p>
                    <div className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                      {isAr ? "اعرف أكثر" : "Learn more"}
                      <Arrow className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-white/10 text-white hover:bg-white/5 rounded-xl h-12 px-8" data-testid="btn-all-services">
              <Link href="/services">
                {isAr ? "جميع خدماتنا" : "All Our Services"}
                <Arrow className="w-4 h-4 mx-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Projects ───────────────────────────────────── */}
      {projects && projects.length > 0 && (
        <section className="py-28 relative overflow-hidden" data-testid="section-projects" style={{ background: "#080f1f" }}>
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-purple-400 mb-4">
                {isAr ? "— أعمالنا —" : "— Portfolio —"}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                {isAr ? "مشاريعنا المميزة" : "Featured Projects"}
              </h2>
              <p className="text-slate-400 text-lg">
                {isAr ? "نخبة من المشاريع التي أثبتنا فيها قدراتنا" : "Handpicked projects that showcase our capabilities"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.slice(0, 6).map((project, i) => (
                <Link key={project.id} href={`/projects/${project.slug}`} data-testid={`card-project-${project.id}`}>
                  <div className="group rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.06] transition-all duration-300 h-full">
                    <div className="aspect-video relative overflow-hidden">
                      {project.thumbnailUrl ? (
                        <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, hsl(${(i * 60) % 360}, 70%, 20%), hsl(${(i * 60 + 40) % 360}, 80%, 30%))` }}>
                          <span className="text-white/20 font-black text-6xl">
                            {(isAr ? project.title : (project.titleEn || project.title)).charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5">
                      {project.category && (
                        <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">{project.category}</span>
                      )}
                      <h3 className="font-bold text-white text-base">
                        {isAr ? project.title : (project.titleEn || project.title)}
                      </h3>
                      {project.clientName && (
                        <p className="text-xs text-slate-500 mt-1.5">{project.clientName}</p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(project.technologies as string[]).slice(0, 3).map((t, ti) => (
                            <span key={ti} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-400">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg" className="border-white/10 text-white hover:bg-white/5 rounded-xl h-12 px-8" data-testid="btn-view-all-projects">
                <Link href="/projects">
                  {isAr ? "عرض جميع المشاريع" : "View All Projects"}
                  <Arrow className="w-4 h-4 mx-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Why Us ─────────────────────────────────────── */}
      <section className="py-28" style={{ background: "linear-gradient(180deg, #040812 0%, #080f1f 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">
                {isAr ? "— لماذا سوفتلكس —" : "— Why Softlix —"}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                {isAr ? "لماذا تختارنا؟" : "Why Choose Us?"}
              </h2>
              <p className="text-slate-400 mb-10 text-lg leading-relaxed">
                {isAr
                  ? "نجاحنا يأتي من نجاح عملائنا. نؤمن أن التقنية يجب أن تخدم أهداف أعمالك."
                  : "Our success comes from our clients' success. Technology should serve your business goals."}
              </p>
              <div className="space-y-5">
                {WHY_US.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 bg-white/[0.04] group-hover:border-blue-500/40 group-hover:bg-blue-500/10 transition-all duration-300">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{isAr ? item.titleAr : item.titleEn}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{isAr ? item.descAr : item.descEn}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-3xl opacity-30" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }} />
              <div className="relative rounded-3xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.15) 100%)", backdropFilter: "blur(12px)" }}>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{isAr ? "تقييم عملائنا" : "Client Rating"}</p>
                      <p className="text-slate-400 text-xs">{isAr ? "بناءً على 150+ مراجعة" : "Based on 150+ reviews"}</p>
                    </div>
                    <div className="ms-auto text-3xl font-black text-white">4.9<span className="text-slate-500 text-lg">/5</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {STATS.map((stat, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
                        <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                        <div className="text-slate-400 text-xs">{isAr ? stat.labelAr : stat.labelEn}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-6">
                    <blockquote className="text-slate-300 text-sm leading-relaxed italic mb-3">
                      {isAr
                        ? "\"سوفتلكس ليست مجرد شركة برمجة، هي شريك استراتيجي حقيقي\""
                        : "\"Softlix isn't just a dev shop, they are a true strategic partner\""}
                    </blockquote>
                    <p className="text-slate-500 text-xs">{isAr ? "— محمد القحطاني، CEO ترانسفير" : "— Mohammed Al-Qahtani, CEO Transfer"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────── */}
      <section className="py-28" style={{ background: "#080f1f" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-yellow-400 mb-4">
              {isAr ? "— آراء عملائنا —" : "— Testimonials —"}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              {isAr ? "ماذا يقول عملاؤنا" : "What Our Clients Say"}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">
                  &ldquo;{isAr ? t.quote : t.quoteEn}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{(isAr ? t.nameAr : t.nameEn).charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{isAr ? t.nameAr : t.nameEn}</p>
                    <p className="text-slate-500 text-xs">{isAr ? t.roleAr : t.roleEn}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: "#040812" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37,99,235,0.18) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm text-blue-300">{isAr ? "تحدث معنا اليوم" : "Talk to us today"}</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight">
            {isAr ? "هل أنت مستعد\nلبناء مشروعك؟" : "Ready to Build\nSomething Great?"}
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            {isAr
              ? "تواصل معنا اليوم ودعنا نناقش كيف نحول فكرتك إلى منتج رقمي ناجح"
              : "Contact us today and let's discuss how to turn your idea into a successful digital product"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-base font-semibold rounded-xl text-white shadow-lg shadow-blue-500/25 border border-blue-400/20" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }} data-testid="btn-cta-contact">
              <Link href="/contact">
                <Phone className="w-4 h-4 mx-2" />
                {isAr ? "تواصل معنا الآن" : "Contact Us Now"}
              </Link>
            </Button>
            <Button asChild size="lg" className="h-14 px-8 text-base font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm transition-all" data-testid="btn-cta-services">
              <Link href="/services">{isAr ? "استكشف خدماتنا" : "Explore Services"}</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
