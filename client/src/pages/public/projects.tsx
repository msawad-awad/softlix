import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ExternalLink, Layers } from "lucide-react";
import type { Project } from "@shared/schema";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const DEFAULT_PROJECTS = [
  { id: "p1", title: "تطبيق مسكني", titleEn: "Maskaniun App", slug: "maskaniun", description: "منصة لإدارة الأملاك وتأجير الوحدات", descriptionEn: "A platform for property management and unit rental", category: "mobile-app", thumbnailUrl: null, clientName: null },
  { id: "p2", title: "تطبيق تيسير", titleEn: "Taysir App", slug: "taysir-app", description: "تطبيق متكامل للخدمات اليومية", descriptionEn: "An integrated app for daily services", category: "mobile-app", thumbnailUrl: null, clientName: null },
  { id: "p3", title: "تطبيق جمالا", titleEn: "Jamala App", slug: "jamala-app", description: "منصة خدمات التجميل والعناية", descriptionEn: "Beauty and care services platform", category: "mobile-app", thumbnailUrl: null, clientName: null },
  { id: "p4", title: "تطبيق سعيد", titleEn: "Saeid App", slug: "saeid", description: "تطبيق خدمات متنوعة", descriptionEn: "Diverse services application", category: "mobile-app", thumbnailUrl: null, clientName: null },
  { id: "p5", title: "تطبيق التحويل", titleEn: "Transfer Application", slug: "transfer-application", description: "حل لتحويل الأموال والمدفوعات", descriptionEn: "Money transfer and payments solution", category: "fintech", thumbnailUrl: null, clientName: null },
  { id: "p6", title: "تطبيق استلمني", titleEn: "Estalamni App", slug: "estalamni", description: "حلول لخدمات التوصيل والشحن", descriptionEn: "Delivery and shipping services solutions", category: "logistics", thumbnailUrl: null, clientName: null },
];

const CATEGORIES = [
  { value: "all", labelAr: "الكل", labelEn: "All" },
  { value: "mobile-app", labelAr: "تطبيقات", labelEn: "Apps" },
  { value: "web", labelAr: "مواقع ويب", labelEn: "Websites" },
  { value: "marketing", labelAr: "تسويق", labelEn: "Marketing" },
  { value: "fintech", labelAr: "تكنولوجيا مالية", labelEn: "Fintech" },
  { value: "logistics", labelAr: "لوجستيات", labelEn: "Logistics" },
];

interface ProjectsProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

export default function PublicProjects({ lang = "ar", onLangChange }: ProjectsProps) {
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/public/projects", TENANT_ID],
    
  });

  const displayProjects = projects && projects.length > 0 ? projects : DEFAULT_PROJECTS as any[];
  const filtered = activeCategory === "all" ? displayProjects : displayProjects.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-600/30">{isAr ? "أعمالنا" : "Portfolio"}</Badge>
          <h1 className="text-5xl font-black mb-5">{isAr ? "مشاريعنا" : "Our Projects"}</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {isAr
              ? "اكتشف مجموعة متنوعة من مشاريعنا في مجالات مختلفة - تطبيقات موبايل، مواقع ويب، منصات تجارة إلكترونية وأكثر"
              : "Discover our diverse portfolio of projects in various fields - mobile apps, websites, e-commerce platforms and more"}
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 border-b border-gray-100 dark:border-gray-800 sticky top-16 bg-white/95 dark:bg-gray-950/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                data-testid={`filter-${cat.value}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{isAr ? "لا توجد مشاريع في هذه الفئة" : "No projects in this category"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project: any) => (
                <Link key={project.id} href={`/projects/${project.slug}`} data-testid={`card-project-${project.id}`}>
                  <div className="group rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center relative">
                      {project.thumbnailUrl ? (
                        <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-white text-5xl font-black opacity-30">S</div>
                      )}
                      <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                        {project.category && (
                          <Badge className="bg-black/40 text-white border-0 text-xs">{project.category}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-black text-lg text-gray-900 dark:text-white mb-2">
                        {isAr ? project.title : (project.titleEn || project.title)}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                        {isAr ? project.description : (project.descriptionEn || project.description)}
                      </p>
                      {project.clientName && (
                        <p className="text-xs text-gray-400 mb-3">{isAr ? "العميل:" : "Client:"} {project.clientName}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {isAr ? "عرض التفاصيل" : "View Details"}
                        <Arrow className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">{isAr ? "هل لديك مشروع جديد؟" : "Have a New Project?"}</h2>
          <p className="text-blue-100 mb-8">{isAr ? "تواصل معنا وسنحوله إلى قصة نجاح جديدة" : "Contact us and we'll turn it into a new success story"}</p>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
            <Link href="/contact">{isAr ? "ابدأ مشروعك" : "Start Your Project"}</Link>
          </Button>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
