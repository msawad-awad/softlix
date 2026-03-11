import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, BookOpen, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { BlogPost } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const BRAND = "#e59269";
const BRAND_DARK = "#cb7147";
const ACCENT = "#82b735";
const NAVY = "#222933";
const MUTED = "#667085";
const TEXT = "#0f172a";
const SURFACE = "rgba(255,255,255,.86)";
const LINE = "rgba(15,23,42,.08)";
const SHADOW = "0 20px 60px rgba(15,23,42,.10)";

const CATEGORIES = ["الكل", "برمجة", "تصميم", "غير مصنف", "تواصل إجتماعي"];

const GRADIENT_BG: React.CSSProperties = {
  background: `radial-gradient(circle at 10% 8%, rgba(229,146,105,.12), transparent 22%),
    radial-gradient(circle at 88% 10%, rgba(130,183,53,.10), transparent 18%),
    linear-gradient(180deg, #fff 0%, #f8fafc 28%, #f2f6fb 100%)`,
};

const DEFAULT_POSTS = [
  {
    id: "b1", title: "خطوات برمجة تطبيق أندرويد ناجح من الصفر",
    titleEn: "Steps to Build a Successful Android App from Scratch",
    slug: "android-app-from-scratch",
    excerpt: "دليل عملي يوضح كيف تبدأ فكرة تطبيق أندرويد، من تحليل الفكرة وحتى بناء تجربة مستخدم ناجحة وتطوير المنتج بشكل احترافي.",
    excerptEn: "A practical guide showing how to start an Android app idea, from analyzing the concept to building a successful user experience.",
    content: "", contentEn: "", featuredImageUrl: null as string | null,
    publishedAt: new Date("2025-05-26"), category: "برمجة", readTime: 5,
  },
  {
    id: "b2", title: "برمجة تطبيقات لشركتك: لماذا تحتاج إلى تطبيق موبايل خاص الآن؟",
    titleEn: "App Development for Your Company: Why You Need a Mobile App Now",
    slug: "why-mobile-app-for-business",
    excerpt: "مقال يشرح القيمة الفعلية لتطبيقات الجوال للشركات، وكيف يمكن أن ترفع من الولاء، المبيعات، وسهولة الوصول إلى العملاء.",
    excerptEn: "Article explaining the real value of mobile apps for businesses and how they can increase loyalty, sales, and customer access.",
    content: "", contentEn: "", featuredImageUrl: null as string | null,
    publishedAt: new Date("2025-05-20"), category: "برمجة", readTime: 4,
  },
  {
    id: "b3", title: "أفضل شركة تصميم مواقع في السعودية: كيف تختار الشريك المناسب؟",
    titleEn: "Best Website Design Company in Saudi Arabia: How to Choose the Right Partner?",
    slug: "best-web-design-company-saudi",
    excerpt: "نص يوضح المعايير الحقيقية لاختيار شركة تصميم مواقع، من الخبرة إلى الدعم الفني، مروراً بجودة التصميم والنتائج التجارية.",
    excerptEn: "Text explaining the real criteria for choosing a web design company, from experience to technical support and business results.",
    content: "", contentEn: "", featuredImageUrl: null as string | null,
    publishedAt: new Date("2025-05-20"), category: "غير مصنف", readTime: 5,
  },
  {
    id: "b4", title: "الفرق بين تصميم المواقع وبرمجتها: ما الذي تحتاجه لعملك؟",
    titleEn: "The Difference Between Web Design and Development: What Does Your Business Need?",
    slug: "design-vs-development",
    excerpt: "شرح مبسط للفارق بين جانب التصميم وجانب البرمجة، ومتى تحتاج كل واحد منهما عند تطوير موقع أو منصة إلكترونية.",
    excerptEn: "A simple explanation of the difference between design and development, and when you need each when building a website.",
    content: "", contentEn: "", featuredImageUrl: null as string | null,
    publishedAt: new Date("2025-05-19"), category: "برمجة", readTime: 6,
  },
  {
    id: "b5", title: "الهوية البصرية وأهميتها",
    titleEn: "Visual Identity and Its Importance",
    slug: "visual-identity-importance",
    excerpt: "مقال يوضح كيف تساهم الهوية البصرية في بناء انطباع احترافي للعلامة التجارية ورفع قدرتها على التميز والتذكر.",
    excerptEn: "Article showing how visual identity contributes to building a professional brand impression and increases memorability.",
    content: "", contentEn: "", featuredImageUrl: null as string | null,
    publishedAt: new Date("2023-07-08"), category: "تصميم", readTime: 4,
  },
  {
    id: "b6", title: "تصميم موشن جرافيك | كيف وبما تستخدم",
    titleEn: "Motion Graphic Design | How and When to Use It",
    slug: "motion-graphic-design",
    excerpt: "تعرف على مفهوم الموشن جرافيك، استخداماته التسويقية، وكيف يمكن أن يساعد الشركات في تقديم رسائلها بشكل جذاب وواضح.",
    excerptEn: "Learn about motion graphic concept, marketing uses, and how it can help companies present their messages attractively.",
    content: "", contentEn: "", featuredImageUrl: null as string | null,
    publishedAt: new Date("2023-07-08"), category: "تصميم", readTime: 3,
  },
];

const CATEGORY_META = [
  { num: "01", title: "برمجة", desc: "مقالات عن برمجة التطبيقات، المواقع، الأنظمة، والتقنيات المستخدمة في المشاريع الرقمية." },
  { num: "02", title: "تصميم", desc: "محتوى يركز على الهوية البصرية، واجهات المستخدم، الموشن جرافيك، وتجربة المستخدم." },
  { num: "03", title: "تواصل إجتماعي", desc: "موضوعات مرتبطة بالمحتوى، التسويق الرقمي، وبناء الحضور الفعّال على المنصات الاجتماعية." },
  { num: "04", title: "مقالات عامة", desc: "مقالات متنوعة موجهة لأصحاب الأعمال والمهتمين بالتحول الرقمي وبناء المشاريع الحديثة." },
];

/* ──────────────────────────────────────────────────────── */
/* Post Card Component                                      */
/* ──────────────────────────────────────────────────────── */
function PostCard({ post, lang }: { post: any; lang: "ar" | "en" }) {
  const isAr = lang === "ar";
  const title = isAr ? post.title : (post.titleEn || post.title);
  const excerpt = isAr ? post.excerpt : (post.excerptEn || post.excerpt);
  const date = post.publishedAt ? new Date(post.publishedAt) : null;

  const dayNum = date ? String(date.getDate()).padStart(2, "0") : "";
  const monthName = date ? date.toLocaleDateString("ar-SA", { month: "long" }).replace(/\s*\d{4}/, "") : "";

  const COVER_GRADIENT = `linear-gradient(135deg, rgba(229,146,105,.18), rgba(130,183,53,.22))`;

  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }} data-testid={`card-post-${post.id}`}>
      <article style={{
        borderRadius: 28, overflow: "hidden", background: SURFACE,
        border: `1px solid ${LINE}`, boxShadow: "0 14px 40px rgba(15,23,42,.06)",
        backdropFilter: "blur(12px)", transition: "transform .25s ease, box-shadow .25s ease",
        cursor: "pointer",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 28px 70px rgba(15,23,42,.12)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(15,23,42,.06)"; }}
      >
        {/* Cover */}
        <div style={{ position: "relative", aspectRatio: "1.15 / .78", overflow: "hidden", background: COVER_GRADIENT }}>
          {post.featuredImageUrl ? (
            <img src={post.featuredImageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, rgba(229,146,105,.22), rgba(130,183,53,.18))` }}>
              <BookOpen size={40} color="rgba(229,146,105,.5)" />
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,.03), rgba(15,23,42,.42))" }} />
          {/* Date badge */}
          {date && (
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2, background: "rgba(255,255,255,.9)", borderRadius: 18, minWidth: 64, padding: "10px 12px", textAlign: "center", boxShadow: "0 12px 30px rgba(15,23,42,.10)" }}>
              <strong style={{ display: "block", lineHeight: 1, fontSize: "1.2rem", fontWeight: 900, color: NAVY }}>{dayNum}</strong>
              <span style={{ display: "block", marginTop: 4, fontSize: ".78rem", fontWeight: 800, color: "#5f6b7d" }}>{monthName}</span>
            </div>
          )}
        </div>
        {/* Body */}
        <div style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {post.category && (
              <span style={{ display: "inline-flex", alignItems: "center", minHeight: 32, padding: "0 12px", borderRadius: 999, background: "rgba(229,146,105,.12)", color: "#9b5e41", fontWeight: 800, fontSize: ".82rem" }}>
                {post.category}
              </span>
            )}
            <span style={{ color: MUTED, fontSize: ".84rem", fontWeight: 700 }}>{isAr ? "بواسطة Softlix" : "By Softlix"}</span>
          </div>
          <h3 style={{ margin: "0 0 10px", fontSize: "1.22rem", lineHeight: 1.45, fontWeight: 900, color: TEXT }}>{title}</h3>
          <p style={{ margin: 0, color: MUTED, fontSize: ".95rem", lineHeight: 1.85, minHeight: 88 }}>{excerpt}</p>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 46, padding: "0 18px", borderRadius: 14, color: "#fff", fontWeight: 900, background: `linear-gradient(135deg,${BRAND},${BRAND_DARK})`, boxShadow: `0 14px 30px rgba(229,146,105,.24)`, fontSize: ".92rem" }}>
              {isAr ? "قراءة المقال" : "Read Article"}
            </span>
            <span style={{ color: "#64748b", fontWeight: 900, fontSize: "1rem" }}>↗</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────── */
/* Blog List Page                                           */
/* ──────────────────────────────────────────────────────── */
interface BlogProps { lang?: "ar" | "en"; onLangChange?: (lang: "ar" | "en") => void; }

function BlogList({ lang = "ar", onLangChange }: BlogProps) {
  const isAr = lang === "ar";
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useSEO({
    title: isAr ? "المدونة | Softlix" : "Blog | Softlix",
    description: isAr
      ? "مقالات ومحتوى تقني وتسويقي يساعدك على النمو والتطور في عالم الأعمال الرقمية"
      : "Technical and marketing articles that help you grow in the digital business world",
  });

  const { data: rawPosts } = useQuery<BlogPost[]>({ queryKey: ["/api/public/blog", TENANT_ID] });
  const allPosts: any[] = (rawPosts && rawPosts.length > 0) ? rawPosts : DEFAULT_POSTS;

  const filtered = allPosts.filter(p => {
    const matchCat = activeCategory === "الكل" || p.category === activeCategory;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const recentPosts = [...allPosts].slice(0, 5);

  const CONTAINER: React.CSSProperties = { width: "min(1280px, calc(100% - 32px))", marginInline: "auto" };

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', system-ui, sans-serif", color: TEXT, lineHeight: 1.8, minHeight: "100vh", ...GRADIENT_BG }}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* ── HERO ── */}
      <section style={{ padding: "54px 0 28px", overflow: "hidden" }}>
        <div style={{ ...CONTAINER, display: "grid", gridTemplateColumns: "1.08fr .92fr", gap: 28, alignItems: "center" }}>

          {/* Left col */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,.78)", border: `1px solid ${LINE}`, boxShadow: "0 10px 28px rgba(15,23,42,.05)", color: "#334155", fontSize: ".92rem", fontWeight: 800, marginBottom: 20 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: `linear-gradient(135deg,${BRAND},${ACCENT})`, flexShrink: 0 }} />
              Blog / Insights / Articles
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(2.3rem, 5vw, 4.7rem)", lineHeight: 1.05, fontWeight: 900, letterSpacing: "-.03em", maxWidth: "11ch", color: TEXT }}>
              مدونة Softlix للمحتوى التقني والتجاري الحديث
            </h1>
            <p style={{ margin: "20px 0 0", fontSize: "1.05rem", color: MUTED, maxWidth: "63ch" }}>
              استكشف مقالاتنا حول برمجة التطبيقات، تصميم المواقع، الهوية البصرية، التحول الرقمي، والتقنيات التي تساعد الشركات على النمو في السوق السعودي والخليجي.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
              <a href="#articles" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, border: "1px solid transparent", fontWeight: 800, color: "#fff", background: `linear-gradient(135deg,${BRAND},${BRAND_DARK})`, boxShadow: `0 14px 30px rgba(229,146,105,.26)` }}>ابدأ القراءة</a>
              <a href="#categories" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 22px", borderRadius: 999, border: `1px solid ${LINE}`, fontWeight: 800, background: "rgba(255,255,255,.82)", color: TEXT }}>استعرض التصنيفات</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 28 }}>
              {[{ v: `${allPosts.length}+`, l: "مقالة متخصصة" }, { v: "4", l: "تصنيفات رئيسية" }, { v: "2025", l: "أحدث المقالات" }].map(s => (
                <div key={s.l} style={{ background: "rgba(255,255,255,.8)", border: `1px solid rgba(15,23,42,.06)`, borderRadius: 22, padding: 18, boxShadow: "0 12px 40px rgba(15,23,42,.05)" }}>
                  <strong style={{ display: "block", fontSize: "1.8rem", lineHeight: 1, marginBottom: 8, color: TEXT }}>{s.v}</strong>
                  <span style={{ color: MUTED, fontSize: ".92rem", fontWeight: 700 }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right col – decorative showcase */}
          <div style={{ position: "relative", minHeight: 590 }}>
            <div style={{ position: "absolute", inset: "24px 0 0 42px", borderRadius: 34, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.78))", border: "1px solid rgba(255,255,255,.8)", boxShadow: SHADOW }}>
              {/* Window dots */}
              <div style={{ display: "flex", gap: 8, padding: "18px 20px 0" }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(15,23,42,.18)" }} />)}
              </div>
              {/* Showcase grid */}
              <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Col 1 */}
                <div style={{ borderRadius: 24, padding: 18, display: "grid", gap: 14, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: "0 14px 40px rgba(15,23,42,.06)" }}>
                  <div style={{ borderRadius: 20, minHeight: 140, overflow: "hidden", color: "#fff", padding: 18, background: `linear-gradient(135deg, rgba(34,41,51,.95), rgba(60,72,88,.92))`, position: "relative" }}>
                    <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", left: -30, bottom: -90, background: "rgba(255,255,255,.08)" }} />
                    <strong style={{ display: "block", fontSize: "1.1rem", lineHeight: 1.25, maxWidth: "11ch" }}>Content designed to inform and convert</strong>
                    <span style={{ display: "inline-flex", marginTop: 10, color: "rgba(255,255,255,.78)", fontSize: ".84rem", fontWeight: 700 }}>Programming • Design • Strategy</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[["Tech", "برمجة وتقنية"], ["UI/UX", "تصميم وتجربة"], ["SEO", "محتوى قابل للاكتشاف"], ["Growth", "قيمة للأعمال"]].map(([a, b]) => (
                      <div key={a} style={{ borderRadius: 16, padding: 12, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: "0 8px 24px rgba(15,23,42,.05)" }}>
                        <strong style={{ display: "block", fontSize: "1rem", marginBottom: 4, color: TEXT }}>{a}</strong>
                        <span style={{ color: MUTED, fontSize: ".82rem", fontWeight: 700 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Col 2 */}
                <div style={{ borderRadius: 24, padding: 18, display: "grid", gap: 12, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: "0 14px 40px rgba(15,23,42,.06)", alignContent: "start" }}>
                  <strong style={{ fontSize: "1rem", color: TEXT }}>توزيع المحتوى</strong>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[90, 82, 76, 68].map((w, i) => (
                      <div key={i} style={{ height: 10, borderRadius: 999, background: "rgba(15,23,42,.06)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${w}%`, borderRadius: 999, background: `linear-gradient(90deg,${BRAND},${ACCENT})` }} />
                      </div>
                    ))}
                  </div>
                  {[["مقالات حديثة", "محتوى جديد موجه لأصحاب الأعمال والعملاء المحتملين"], ["قيمة حقيقية", "شرح تقني وتجاري بلغة واضحة واحترافية"]].map(([t, d]) => (
                    <div key={t} style={{ borderRadius: 16, padding: 12, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: "0 8px 24px rgba(15,23,42,.05)" }}>
                      <strong style={{ display: "block", fontSize: "1rem", marginBottom: 4, color: TEXT }}>{t}</strong>
                      <span style={{ color: MUTED, fontSize: ".82rem", fontWeight: 700 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating notes */}
            <div style={{ position: "absolute", left: 0, top: 86, width: 215, zIndex: 3, borderRadius: 22, padding: 18, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: SHADOW, backdropFilter: "blur(12px)" }}>
              <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: 8, color: TEXT }}>محتوى احترافي</strong>
              <p style={{ margin: 0, color: MUTED, fontSize: ".9rem", lineHeight: 1.75 }}>واجهة مدونة حديثة تعكس جودة البراند وتدعم القراءة والتصفح.</p>
            </div>
            <div style={{ position: "absolute", right: 0, bottom: 52, width: 236, zIndex: 3, borderRadius: 22, padding: 18, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: SHADOW, backdropFilter: "blur(12px)" }}>
              <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: 8, color: TEXT }}>جاهزة للتوسع</strong>
              <p style={{ margin: 0, color: MUTED, fontSize: ".9rem", lineHeight: 1.75 }}>فلترة بالتصنيف، بحث مباشر، وصفحات مقال داخلية — كل شيء جاهز.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARTICLES ── */}
      <section style={{ padding: "42px 0" }} id="articles">
        <div style={CONTAINER}>
          {/* Section head */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.9rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900, color: TEXT }}>أحدث المقالات</h2>
              <p style={{ margin: 0, color: MUTED, fontSize: "1rem" }}>نسخة حديثة لعرض المدونة مع بطاقات أوضح، صور بارزة، وعرض أفضل للعناوين والمقتطفات.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 42, padding: "0 16px", borderRadius: 999, border: activeCategory === cat ? "1px solid transparent" : `1px solid ${LINE}`, fontWeight: 800, fontSize: ".9rem", cursor: "pointer", transition: ".25s ease", fontFamily: "'Cairo', sans-serif", background: activeCategory === cat ? `linear-gradient(135deg,${BRAND},${BRAND_DARK})` : "rgba(255,255,255,.82)", color: activeCategory === cat ? "#fff" : "#324054", boxShadow: "0 10px 24px rgba(15,23,42,.04)" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content layout: posts + sidebar */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 24, alignItems: "start" }}>

            {/* Posts grid */}
            <div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: MUTED }}>
                  <BookOpen size={48} style={{ margin: "0 auto 16px", opacity: .3 }} />
                  <p style={{ margin: 0, fontWeight: 700 }}>لا توجد مقالات في هذا التصنيف</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
                  {filtered.map(post => <PostCard key={post.id} post={post} lang={lang} />)}
                </div>
              )}
              {/* Pagination */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
                {["1", "2", "3", "→"].map((pg, i) => (
                  <button key={pg} style={{ width: 46, height: 46, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 14, background: i === 0 ? `linear-gradient(135deg,${BRAND},${BRAND_DARK})` : "rgba(255,255,255,.86)", border: i === 0 ? "1px solid transparent" : `1px solid ${LINE}`, fontWeight: 800, color: i === 0 ? "#fff" : "#334155", boxShadow: "0 10px 24px rgba(15,23,42,.04)", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: ".96rem" }}>
                    {pg}
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside style={{ display: "grid", gap: 18, position: "sticky", top: 110 }}>
              {/* Search */}
              <div style={{ borderRadius: 24, padding: 22, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: "0 14px 40px rgba(15,23,42,.06)", backdropFilter: "blur(12px)" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "1.08rem", fontWeight: 900, color: TEXT }}>البحث</h3>
                <div style={{ display: "grid", gap: 10 }}>
                  <input
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") setSearch(searchInput); }}
                    placeholder="ابحث في المقالات..."
                    style={{ width: "100%", minHeight: 52, borderRadius: 16, border: `1px solid ${LINE}`, padding: "0 16px", fontFamily: "'Cairo', sans-serif", fontSize: ".96rem", outline: "none", background: "#fff", color: TEXT, boxSizing: "border-box" }}
                  />
                  <button onClick={() => setSearch(searchInput)} style={{ minHeight: 50, borderRadius: 999, border: "1px solid transparent", fontWeight: 800, color: "#fff", background: `linear-gradient(135deg,${BRAND},${BRAND_DARK})`, cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: "1rem" }}>بحث</button>
                </div>
              </div>

              {/* Recent posts */}
              <div style={{ borderRadius: 24, padding: 22, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: "0 14px 40px rgba(15,23,42,.06)", backdropFilter: "blur(12px)" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "1.08rem", fontWeight: 900, color: TEXT }}>أحدث المقالات</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 0 }}>
                  {recentPosts.map((p, idx) => (
                    <li key={p.id}>
                      <Link href={`/blog/${p.slug}`} style={{ display: "block", color: "#334155", fontWeight: 700, padding: "8px 0", borderBottom: idx < recentPosts.length - 1 ? `1px solid rgba(15,23,42,.06)` : "none", fontSize: ".92rem", textDecoration: "none" }}>
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div style={{ borderRadius: 24, padding: 22, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: "0 14px 40px rgba(15,23,42,.06)", backdropFilter: "blur(12px)" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "1.08rem", fontWeight: 900, color: TEXT }}>التصنيفات</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 0 }}>
                  {CATEGORIES.filter(c => c !== "الكل").map((cat, idx, arr) => (
                    <li key={cat}>
                      <button onClick={() => { setActiveCategory(cat); document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" }); }}
                        style={{ display: "block", width: "100%", textAlign: "right", background: "none", border: "none", color: "#334155", fontWeight: 700, padding: "8px 0", borderBottom: idx < arr.length - 1 ? `1px solid rgba(15,23,42,.06)` : "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: ".92rem" }}>
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES GRID ── */}
      <section style={{ padding: "42px 0" }} id="categories">
        <div style={CONTAINER}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.9rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900, color: TEXT }}>تصنيفات المحتوى</h2>
            <p style={{ margin: 0, color: MUTED, fontSize: "1rem" }}>تنظيم المحتوى بهذه الطريقة يساعد الزائر على الوصول السريع إلى الموضوعات التي تهمه داخل المدونة.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {CATEGORY_META.map(cat => (
              <div key={cat.num} style={{ borderRadius: 24, padding: 24, background: SURFACE, border: `1px solid ${LINE}`, boxShadow: "0 14px 40px rgba(15,23,42,.06)", backdropFilter: "blur(12px)" }}>
                <div style={{ width: 54, height: 54, display: "inline-grid", placeItems: "center", borderRadius: 18, marginBottom: 16, background: `linear-gradient(135deg, rgba(229,146,105,.18), rgba(130,183,53,.18))`, fontSize: "1.2rem", fontWeight: 900, color: TEXT }}>
                  {cat.num}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.08rem", fontWeight: 900, color: TEXT }}>{cat.title}</h3>
                <p style={{ margin: 0, color: MUTED, fontSize: ".93rem" }}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding: "42px 0" }} id="newsletter">
        <div style={CONTAINER}>
          <div style={{ borderRadius: 32, padding: 32, color: "#fff", background: `linear-gradient(135deg,${NAVY},#323c4b)`, position: "relative", overflow: "hidden", boxShadow: "0 22px 60px rgba(34,41,51,.22)" }}>
            <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", top: -110, left: -40, background: "rgba(255,255,255,.06)" }} />
            <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", bottom: -80, right: 30, background: "rgba(255,255,255,.06)" }} />
            <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 20, alignItems: "center" }}>
              <div>
                <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem, 3vw, 3rem)", lineHeight: 1.15, fontWeight: 900 }}>اشترك في النشرة البريدية</h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,.82)" }}>
                  احصل على أحدث المقالات والنصائح التقنية والتجارية من Softlix مباشرة إلى بريدك، مع محتوى يساعدك على تطوير مشروعك الرقمي باحترافية.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <input type="email" placeholder="أدخل بريدك الإلكتروني" style={{ minWidth: 220, flex: 1, minHeight: 54, border: "none", borderRadius: 16, padding: "0 16px", fontFamily: "'Cairo', sans-serif", fontSize: ".95rem", outline: "none" }} />
                <button style={{ minHeight: 54, padding: "0 22px", borderRadius: 999, border: "none", fontWeight: 800, color: "#fff", background: `linear-gradient(135deg,${BRAND},${BRAND_DARK})`, cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: "1rem", boxShadow: `0 14px 30px rgba(229,146,105,.26)` }}>
                  اشترك الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* Blog Detail Page                                         */
/* ──────────────────────────────────────────────────────── */
function BlogDetail({ slug, lang = "ar", onLangChange }: { slug: string } & BlogProps) {
  const isAr = lang === "ar";
  const Arrow = isAr ? ChevronRight : ChevronLeft;

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/public/blog", slug, TENANT_ID],
    queryFn: async () => {
      const url = TENANT_ID ? `/api/public/blog/${slug}?tenantId=${TENANT_ID}` : `/api/public/blog/${slug}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const fallback = DEFAULT_POSTS.find(p => p.slug === slug);
  const displayPost = post || fallback;

  useSEO({
    title: isAr ? (displayPost?.title || "مقال") : ((displayPost as any)?.titleEn || displayPost?.title || "Article"),
    description: isAr ? (displayPost?.excerpt || "") : ((displayPost as any)?.excerptEn || displayPost?.excerpt || ""),
  });

  if (isLoading) return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ ...GRADIENT_BG, minHeight: "100vh", fontFamily: "'Cairo', sans-serif" }}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: `4px solid ${BRAND}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
      </div>
      <PublicFooter lang={lang} />
    </div>
  );

  if (!displayPost) return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ ...GRADIENT_BG, minHeight: "100vh", fontFamily: "'Cairo', sans-serif" }}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
        <BookOpen size={64} color="#d1d5db" />
        <h2 style={{ color: "#374151", fontWeight: 900, margin: 0 }}>{isAr ? "المقال غير موجود" : "Article Not Found"}</h2>
        <Link href="/blog"><button style={{ padding: "10px 24px", borderRadius: 999, border: `1px solid ${LINE}`, background: "#fff", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>{isAr ? "العودة للمدونة" : "Back to Blog"}</button></Link>
      </div>
      <PublicFooter lang={lang} />
    </div>
  );

  const title = isAr ? displayPost.title : ((displayPost as any).titleEn || displayPost.title);
  const content = isAr ? ((displayPost as any).content || displayPost.excerpt) : ((displayPost as any).contentEn || (displayPost as any).content || (displayPost as any).excerptEn || displayPost.excerpt);
  const excerpt = isAr ? displayPost.excerpt : ((displayPost as any).excerptEn || displayPost.excerpt);

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ ...GRADIENT_BG, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", color: TEXT }}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      <section style={{ paddingTop: 88 }}>
        <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1e3a5f 60%, ${NAVY} 100%)`, color: "#fff", padding: "56px 0 80px" }}>
          <div style={{ width: "min(820px, calc(100% - 32px))", marginInline: "auto" }}>
            <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", fontSize: 14, textDecoration: "none", marginBottom: 28, fontWeight: 500 }}>
              <Arrow size={16} />
              {isAr ? "العودة للمدونة" : "Back to Blog"}
            </Link>
            {(displayPost as any).category && (
              <div style={{ marginBottom: 18 }}>
                <span style={{ background: "rgba(229,146,105,.22)", color: "#fdba74", borderRadius: 999, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>{(displayPost as any).category}</span>
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
        <div style={{ marginTop: -2, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: "100%", height: 60, display: "block" }}>
            <path d="M0,60 L1440,60 L1440,0 Q720,60 0,0 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {displayPost.featuredImageUrl && (
        <div style={{ width: "min(820px, calc(100% - 32px))", marginInline: "auto", marginBottom: 40 }}>
          <img src={displayPost.featuredImageUrl} alt={title} style={{ width: "100%", borderRadius: 20, objectFit: "cover", maxHeight: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }} />
        </div>
      )}

      <article style={{ width: "min(820px, calc(100% - 32px))", marginInline: "auto", paddingBottom: 80 }}>
        {content ? (
          <div className="prose prose-lg max-w-none" style={{ color: "#1e293b", lineHeight: 1.9, fontSize: "1.07rem" }} dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p style={{ color: "#64748b", fontSize: "1.07rem", lineHeight: 1.9 }}>{excerpt}</p>
        )}
        <div style={{ marginTop: 64, padding: 40, borderRadius: 24, background: `linear-gradient(135deg, rgba(229,146,105,.08), rgba(130,183,53,.08))`, border: `1px solid rgba(229,146,105,.2)`, textAlign: "center" }}>
          <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: TEXT, margin: "0 0 12px" }}>{isAr ? "هل لديك مشروع تريد تنفيذه؟" : "Have a Project You Want to Launch?"}</h3>
          <p style={{ color: "#475569", margin: "0 0 24px" }}>{isAr ? "تواصل معنا وسنحوّل فكرتك إلى منتج رقمي ناجح" : "Contact us and we'll turn your idea into a successful digital product"}</p>
          <Link href="/contact">
            <button style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 52, padding: "0 28px", borderRadius: 999, border: "none", fontWeight: 800, fontSize: "1rem", color: "#fff", background: `linear-gradient(135deg,${BRAND},${BRAND_DARK})`, boxShadow: `0 14px 30px rgba(229,146,105,.26)`, cursor: "pointer", fontFamily: "'Cairo', sans-serif" }}>
              {isAr ? "تواصل معنا الآن" : "Contact Us Now"}
            </button>
          </Link>
        </div>
      </article>

      <PublicFooter lang={lang} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* Export                                                    */
/* ──────────────────────────────────────────────────────── */
export default function PublicBlog({ lang = "ar", onLangChange }: BlogProps) {
  const [match, params] = useRoute("/blog/:slug");
  if (match && params?.slug) return <BlogDetail slug={params.slug} lang={lang} onLangChange={onLangChange} />;
  return <BlogList lang={lang} onLangChange={onLangChange} />;
}
