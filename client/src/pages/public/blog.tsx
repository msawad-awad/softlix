import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, BookOpen, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { BlogPost } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const DEFAULT_POSTS = [
  {
    id: "b1",
    title: "خطوات برمجة تطبيق أندرويد ناجح من الصفر",
    titleEn: "Steps to Build a Successful Android App from Scratch",
    slug: "android-app-from-scratch",
    excerpt: "يرغب العديد من أصحاب الأعمال اليوم في برمجة تطبيق أندرويد يعكس أفكارهم ويساعد في نمو مشاريعهم",
    excerptEn: "Many business owners today want to build an Android app that reflects their ideas and helps grow their projects",
    content: `<p>برمجة تطبيق أندرويد ناجح ليست مجرد كتابة أكواد — إنها رحلة متكاملة من التخطيط الاستراتيجي إلى الإطلاق والمتابعة.</p>
<h2>1. تحديد الهدف والجمهور المستهدف</h2>
<p>قبل كتابة أي كود، يجب أن تعرف بوضوح ما هي المشكلة التي يحلها تطبيقك، ومن هو جمهورك المستهدف. هذه الخطوة تحدد كل قرار تقني وتصميمي لاحق.</p>
<h2>2. تصميم تجربة المستخدم (UX)</h2>
<p>ابدأ بـ Wireframes ثم Prototypes عالية الجودة. التصميم الجيد يوفر عليك الكثير من إعادة البرمجة لاحقاً.</p>
<h2>3. اختيار التقنية المناسبة</h2>
<p>هل تختار Native Android (Kotlin/Java) أم Cross-platform (Flutter/React Native)؟ كل خيار له مزاياه وعيوبه حسب طبيعة مشروعك.</p>
<h2>4. التطوير بمراحل</h2>
<p>قسّم التطوير إلى Sprint أسبوعية أو نصف شهرية. ابدأ بالـ MVP (الحد الأدنى من المنتج) واختبره مع مستخدمين حقيقيين.</p>
<h2>5. الاختبار والنشر</h2>
<p>اختبر تطبيقك على أجهزة متعددة وإصدارات مختلفة من Android. ثم انشره على Google Play مع وصف جذاب وكلمات مفتاحية مناسبة.</p>`,
    contentEn: `<p>Building a successful Android app is not just about writing code — it is a complete journey from strategic planning to launch and follow-up.</p>
<h2>1. Define Your Goal and Target Audience</h2>
<p>Before writing any code, you must clearly know what problem your app solves and who your target audience is. This step determines every subsequent technical and design decision.</p>
<h2>2. UX Design</h2>
<p>Start with wireframes then high-quality prototypes. Good design saves you a lot of re-programming later.</p>
<h2>3. Choose the Right Technology</h2>
<p>Do you choose Native Android (Kotlin/Java) or Cross-platform (Flutter/React Native)? Each has advantages and disadvantages depending on your project.</p>
<h2>4. Phased Development</h2>
<p>Divide development into weekly or bi-weekly Sprints. Start with the MVP and test it with real users.</p>
<h2>5. Testing and Publishing</h2>
<p>Test your app on multiple devices and different versions of Android. Then publish it on Google Play with an attractive description and appropriate keywords.</p>`,
    featuredImageUrl: null,
    publishedAt: new Date("2025-05-26"),
    category: "برمجة",
    readTime: 5,
  },
];

interface BlogProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

function BlogDetail({ slug, lang = "ar", onLangChange }: { slug: string } & BlogProps) {
  const isAr = lang === "ar";
  const Arrow = isAr ? ChevronRight : ChevronLeft;

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/public/blog", slug, TENANT_ID],
    queryFn: async () => {
      const url = TENANT_ID
        ? `/api/public/blog/${slug}?tenantId=${TENANT_ID}`
        : `/api/public/blog/${slug}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const fallback = DEFAULT_POSTS.find(p => p.slug === slug);
  const displayPost = post || fallback;

  useSEO({
    title: isAr
      ? (displayPost?.title || "مقال")
      : (displayPost?.titleEn || displayPost?.title || "Article"),
    description: isAr
      ? (displayPost?.excerpt || "")
      : ((displayPost as any)?.excerptEn || displayPost?.excerpt || ""),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
        <PublicNavbar lang={lang} onLangChange={onLangChange} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <PublicFooter lang={lang} />
      </div>
    );
  }

  if (!displayPost) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
        <PublicNavbar lang={lang} onLangChange={onLangChange} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <BookOpen className="w-16 h-16 text-gray-300" />
          <h2 className="text-2xl font-black text-gray-700 dark:text-gray-200">{isAr ? "المقال غير موجود" : "Article Not Found"}</h2>
          <Button asChild variant="outline"><Link href="/blog">{isAr ? "العودة للمدونة" : "Back to Blog"}</Link></Button>
        </div>
        <PublicFooter lang={lang} />
      </div>
    );
  }

  const title = isAr ? displayPost.title : ((displayPost as any).titleEn || displayPost.title);
  const content = isAr ? ((displayPost as any).content || displayPost.excerpt) : ((displayPost as any).contentEn || (displayPost as any).content || (displayPost as any).excerptEn || displayPost.excerpt);
  const excerpt = isAr ? displayPost.excerpt : ((displayPost as any).excerptEn || displayPost.excerpt);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* Hero */}
      <section style={{ paddingTop: 88, paddingBottom: 0 }}>
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)", color: "#fff", padding: "56px 0 80px" }}>
          <div style={{ width: "min(820px, calc(100% - 32px))", marginInline: "auto" }}>
            <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", fontSize: 14, textDecoration: "none", marginBottom: 28, fontWeight: 500 }}>
              <Arrow size={16} />
              {isAr ? "العودة للمدونة" : "Back to Blog"}
            </Link>
            {(displayPost as any).category && (
              <div style={{ marginBottom: 18 }}>
                <span style={{ background: "rgba(96,165,250,0.18)", color: "#93c5fd", borderRadius: 999, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>
                  {(displayPost as any).category}
                </span>
              </div>
            )}
            <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 20px" }}>{title}</h1>
            {excerpt && <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.1rem", lineHeight: 1.7, margin: "0 0 28px", maxWidth: "65ch" }}>{excerpt}</p>}
            <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
              {displayPost.publishedAt && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={14} />
                  {new Date(displayPost.publishedAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              {(displayPost as any).readTime && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} />
                  {isAr ? `${(displayPost as any).readTime} دقائق قراءة` : `${(displayPost as any).readTime} min read`}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Wave separator */}
        <div style={{ marginTop: -2, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: "100%", height: 60, display: "block" }}>
            <path d="M0,60 L1440,60 L1440,0 Q720,60 0,0 Z" fill="#ffffff" className="dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* Featured Image */}
      {displayPost.featuredImageUrl && (
        <div style={{ width: "min(820px, calc(100% - 32px))", marginInline: "auto", marginBottom: 40 }}>
          <img
            src={displayPost.featuredImageUrl}
            alt={title}
            style={{ width: "100%", borderRadius: 20, objectFit: "cover", maxHeight: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
          />
        </div>
      )}

      {/* Content */}
      <article style={{ width: "min(820px, calc(100% - 32px))", marginInline: "auto", paddingBottom: 80 }}>
        {content ? (
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            style={{
              color: "#1e293b",
              lineHeight: 1.9,
              fontSize: "1.07rem",
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p style={{ color: "#64748b", fontSize: "1.07rem", lineHeight: 1.9 }}>{excerpt}</p>
        )}

        {/* CTA */}
        <div style={{ marginTop: 64, padding: 40, borderRadius: 24, background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", border: "1px solid #bae6fd", textAlign: "center" }} className="dark:bg-blue-950/20 dark:border-blue-800">
          <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: "0 0 12px" }} className="dark:text-white">
            {isAr ? "هل لديك مشروع تريد تنفيذه؟" : "Have a Project You Want to Launch?"}
          </h3>
          <p style={{ color: "#475569", margin: "0 0 24px" }} className="dark:text-slate-300">
            {isAr ? "تواصل معنا وسنحوّل فكرتك إلى منتج رقمي ناجح" : "Contact us and we'll turn your idea into a successful digital product"}
          </p>
          <Button asChild size="lg" style={{ background: "linear-gradient(135deg, #e59269, #cb7147)", border: 0, color: "#fff", fontWeight: 700, borderRadius: 999 }}>
            <Link href="/contact">{isAr ? "تواصل معنا الآن" : "Contact Us Now"}</Link>
          </Button>
        </div>
      </article>

      <PublicFooter lang={lang} />
    </div>
  );
}

export default function PublicBlog({ lang = "ar", onLangChange }: BlogProps) {
  const [match, params] = useRoute("/blog/:slug");
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  useSEO({
    title: isAr ? "المدونة" : "Blog",
    description: isAr
      ? "مقالات ومحتوى تقني وتسويقي يساعدك على النمو والتطور في عالم الأعمال الرقمية"
      : "Technical and marketing articles that help you grow in the digital business world",
  });

  const { data: posts } = useQuery<BlogPost[]>({
    queryKey: ["/api/public/blog", TENANT_ID],
    enabled: !match,
  });

  const displayPosts = posts && posts.length > 0 ? posts : DEFAULT_POSTS as any[];

  if (match && params?.slug) {
    return <BlogDetail slug={params.slug} lang={lang} onLangChange={onLangChange} />;
  }

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
                  <div className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
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

      {/* CTA */}
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
