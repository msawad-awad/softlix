import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, User, BookOpen } from "lucide-react";
import type { BlogPost } from "@shared/schema";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const DEFAULT_POSTS = [
  { id: "b1", title: "خطوات برمجة تطبيق أندرويد ناجح من الصفر", titleEn: "Steps to Build a Successful Android App from Scratch", slug: "android-app-from-scratch", excerpt: "يرغب العديد من أصحاب الأعمال اليوم في برمجة تطبيق أندرويد يعكس أفكارهم ويساعد في نمو مشاريعهم", excerptEn: "Many business owners today want to build an Android app that reflects their ideas and helps grow their projects", featuredImageUrl: null, publishedAt: new Date("2025-05-26"), category: "برمجة" },
];

interface BlogProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

export default function PublicBlog({ lang = "ar", onLangChange }: BlogProps) {
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const { data: posts } = useQuery<BlogPost[]>({
    queryKey: ["/api/public/blog", TENANT_ID],
    enabled: !!TENANT_ID,
  });

  const displayPosts = posts && posts.length > 0 ? posts : DEFAULT_POSTS as any[];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-600/30">{isAr ? "تعلم وتطور" : "Learn & Grow"}</Badge>
          <h1 className="text-5xl font-black mb-5">{isAr ? "المدونة" : "Blog"}</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {isAr ? "مقالات ومحتوى تقني وتسويقي يساعدك على النمو والتطور في عالم الأعمال الرقمية" : "Technical and marketing articles that help you grow in the digital business world"}
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {displayPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{isAr ? "لا توجد مقالات بعد" : "No articles yet"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPosts.map((post: any) => (
                <Link key={post.id} href={`/blog/${post.slug}`} data-testid={`card-post-${post.id}`}>
                  <div className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-700 overflow-hidden flex items-center justify-center">
                      {post.featuredImageUrl ? (
                        <img src={post.featuredImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-white/40" />
                      )}
                    </div>
                    <div className="p-5">
                      {(post.category || post.categoryId) && (
                        <Badge className="mb-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0 text-xs">
                          {post.category || (isAr ? "مقالات" : "Articles")}
                        </Badge>
                      )}
                      <h3 className="font-black text-gray-900 dark:text-white mb-2 leading-snug line-clamp-2">
                        {isAr ? post.title : (post.titleEn || post.title)}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                        {isAr ? post.excerpt : (post.excerptEn || post.excerpt)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(isAr ? "ar-SA" : "en-US") : ""}
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                          {isAr ? "قراءة المقال" : "Read Article"}
                          <Arrow className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">{isAr ? "هل لديك مشروع تريد تنفيذه؟" : "Have a Project You Want to Launch?"}</h2>
          <p className="text-blue-100 mb-8">{isAr ? "تواصل معنا وسنساعدك في تحويل فكرتك إلى واقع" : "Contact us and we'll help you turn your idea into reality"}</p>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
            <Link href="/contact">{isAr ? "تواصل معنا" : "Contact Us"}</Link>
          </Button>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
