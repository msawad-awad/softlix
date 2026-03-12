/**
 * Script to scrape all blog posts from old softlixagency.com WordPress site
 * and import them into the new system with their original Arabic slugs
 * Run: DATABASE_URL=... tsx scripts/scrape-old-site.ts
 */
import { db } from "../server/db";
import { blogPosts, services, projects, tenants } from "../shared/schema";
import { eq } from "drizzle-orm";

const BASE = "https://softlixagency.com";
const TENANT_SLUG = "softlix";

// All blog post slugs from the sitemap (Arabic slugs at root level)
const BLOG_SLUGS = [
  "6-عوامل-تجعل-الرابط-الخلفي-أكثر-قيمة-من",
  "7-رؤى-تحسين-محرك-البحث-للتسويق-بالمحتو",
  "أخطاء-تحسين-محركات-البحث-الأكثر-شيوعا",
  "أسوأ-أخطاء-في-التسويق-الرقمي-يجب-تجنبه",
  "أفضل-16-طريقة-لزيادة-الوصول-إلى-المحتوى",
  "أفضل-أوقات-النشر-في-مواقع-التواصل-الاج",
  "أفضل-شركة-برمجة-سعودية-2023-الخدمات-والرس",
  "أفضل-شركة-تصميم-مواقع-في-السعودية-كيف-ت",
  "أفضل-شركة-تصميم-موقع-للتجارة-الإلكترو",
  "أفضل-شركة-لتصميم-واستضافة-مواقع-الويب",
  "أفضل-ممارسات-تحسين-محركات-البحث-للمطو",
  "أفلام-وثائقية-للمسوقين-عن-التكنولوجي",
  "أنواع-تطبيقات-الهواتف-الذكية",
  "أهمية-تحسين-محركات-البحث-في-جوجل",
  "إطار-عمل-ريأكت-نيتف",
  "إطار-عمل-فلاتر-flutter",
  "إعلانات-فيسبوك-الخاصة-بك",
  "إنشاء-مسار-التحويل-الخاص-بالعميل",
  "اتجاهات-تكنولوجيا-التسويق",
  "ادارة-المتاجر-ورفع-المنتجات-المزايا-و",
  "استراتيجية-تسويق-قواعد-البيانات",
  "استيعاب-البيانات-في-الأعمال-الرقمية-و",
  "افضل-شركة-تصميم-ووردبريس-في-السعودية-2023",
  "الأسواق-الرقمية-المتخصصة-لخدمات-b2c",
  "الأسواق-المتخصصة-b2c",
  "الإدراج-الديناميكي-للكلمات-الرئيسية",
  "الإعلانات-المتجاوبة-أهم-النصائح-النا",
  "الاستشارات-التسويقية",
  "التحول-الرقمي-للشركات-والمؤسسات",
  "التسويق-السريع-لخدمة-تطور-الشركات",
  "التسويق-الطبيعي-و-المدفوع",
  "التسويق-بالمحتوى-الالكتروني-عبر-وسائ",
  "التسويق-عبر-البريد-الإلكتروني-لتحسين",
  "الذكاء-الاصطناعي-هل-يمكن-أن-يهدد-حقوق-ا",
  "الفرق-بين-تصميم-المواقع-وبرمجتها-ما-ال",
  "المهارات-الصعبة-و-المهارات-الشخصية",
  "الهوية-البصرية-وأهميتها",
  "برمجة-تطبيقات-لشركتك-لماذا-تحتاج-إلى-ت",
  "بناء-الروابط-الخلفية-أهميتها-واستخدا",
  "بناء-هوية-بصرية-قوية-للأعمال-التجارية",
  "تتبع-البيانات-،-ما-هو-وما-هي-أفضل-الأدوا",
  "تحديد-الجمهور-المستهدف-لعملك",
  "تحسين-محركات-البحث-بالاستعانة-بمصادر",
  "تحسين-محركات-البحث-للمطورين",
  "تحويلات-التجارة-الإلكترونية-وكيفية-ز",
  "تسويق-قواعد-البيانات-فوائد-و-تحديات",
  "تصميم-الجرافيك-للحملات-الإعلانية",
  "تصميم-تطبيقات-الهواتف-الذكية-في-جدة-2023",
  "تصميم-كتيب-التسويق-لمشروع-ناجح",
  "تصميم-موشن-جرافيك-كيف-وبما-تستخدم",
  "تصميم-موقع-الكتروني-ووردبريس-في-السعو",
  "تصميم-واجهات-التطبيقات-العناصر-والأه",
  "تطبيقات-السوبرماركت",
  "تطبيقات-توصيل-المطاعم",
  "تفاعل-العملاء-باستخدام-البيانات",
  "تفكيك-الكلمات-الرئيسية",
  "تقنية-فيديو-الموشن-جرافيك",
  "جمهور-فيسبوك-المخصص-وطرق-استهدافهم",
  "خطوات-برمجة-تطبيق-أندرويد-ناجح-من-الصف",
  "زيادة-زيارات-موقع-الويب",
  "صفحات-الأسئلة-الشائعة-وكيفية-تحويل-ال",
  "طرق-كسب-العملاء-المحتملين",
  "طرق-لمحتوى-وسائل-التواصل-الاجتماعي-تز",
  "عائد-النفقات-الإعلانية-وطرق-الإستفاد",
  "عمليات-البيانات-dataops-البرامج-والأدوات-وا",
  "عوامل-تشغيل-البحث-المتقدم-الخاصة-بـ-جو",
  "كيف-تمكنك-العلامات-التجارية-في-إنشاء-ت",
  "كيفية-إجراء-تدقيق-وسائل-التواصل-الاجت",
  "كيفية-إنشاء-محتوى-فيروسي-سريع-الانتشا",
  "كيفية-تشغيل-حملات-الاعلانات-الصورية-ا",
  "كيفية-توسيع-البودكاست-الخاص-بك",
  "كيفية-كتابة-عروض-تسويقية-لا-تفشل",
  "لغة-البرمجة-المناسبة-لمشروعك",
  "لماذا-تحتاج-أعمالي-إلى-موقع-الكتروني؟",
  "ما-هي-شخصية-العلامة-التجارية",
  "ما-هي-عمليات-البيانات-dataops",
  "مسوقين-وسائل-التواصل-الاجتماعي",
  "ممارسات-الادراج-الديناميكي-للكلمات-ا",
  "منشئ-المحتوى-و-المؤثر-ما-الفرق-بينهم",
  "منصة-انستقرام-تدقيق-وسائل-التواصل-الا",
  "منصة-بنترست-تدقيق-وسائل-التواصل-الاجت",
  "منصة-تويتر-تدقيق-وسائل-التواصل-الاجتم",
  "منصة-فيسبوك-تدقيق-وسائل-التواصل-الاجت",
  "منصة-ماجنتو",
  "منصة-ووردبريس-للمواقع-التعريفية",
  "مهارات-وأدوات-منشئ-المحتوى-و-المؤثر",
  "مواصفات-إعلانات-اليوتيوب",
  "موضوعات-تويتر-الشائعة-وطريقة-استخدام",
  "موقع-تصميم-متجر-الكتروني-في-السعودية",
  "نصائح-التسويق-الالكتروني-للعطلات",
  "نصائح-التسويق-الطبيعي-على-لينكدإن",
  "هل-vtubers-مستقبل-إنشاء-محتوى-الفيديو-؟",
  "واجهة-المستخدم-ui",
];

function guessCategory(slug: string, title: string): string {
  const text = slug + " " + title;
  if (/تسويق|إعلان|محتوى|سوشيال|تواصل|فيسبوك|انستقرام|تويتر|يوتيوب|بودكاست|بنترست|لينكدإن/.test(text)) return "تواصل إجتماعي";
  if (/برمجة|تطبيق|موبايل|أندرويد|فلاتر|ريأكت|لغة|تقنية|بيانات|dataops/.test(text)) return "برمجة";
  if (/تصميم|هوية|موشن|جرافيك|واجهة|ui|مظهر/.test(text)) return "تصميم";
  if (/seo|تحسين-محركات|بحث|روابط-خلفية|كلمات-رئيسية/.test(text)) return "برمجة";
  return "غير مصنف";
}

async function fetchPageData(url: string): Promise<{ title: string; excerpt: string; imageUrl: string | null; date: string | null; h1: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    const rawTitle = titleMatch ? titleMatch[1].replace(/\s*[-|–]\s*سوفتلكس.*$/i, "").trim() : "";

    // Extract H1
    const h1Match = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>(.*?)<\/h1>/is) 
      || html.match(/<h1[^>]*>(.*?)<\/h1>/is);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : rawTitle;

    // Extract meta description
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
    const excerpt = descMatch ? descMatch[1].trim() : "";

    // Extract featured image - try multiple selectors
    const imgPatterns = [
      /class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i,
      /class="[^"]*attachment-[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i,
      /<article[^>]*>[\s\S]*?<img[^>]+src="(https:\/\/softlixagency\.com\/wp-content\/uploads\/[^"]+)"/i,
      /og:image"\s+content="([^"]+)"/i,
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    ];
    let imageUrl: string | null = null;
    for (const pat of imgPatterns) {
      const m = html.match(pat);
      if (m && m[1] && m[1].includes("wp-content")) { imageUrl = m[1]; break; }
    }
    if (!imageUrl) {
      const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i)
        || html.match(/content="([^"]+)"\s+property="og:image"/i);
      if (ogMatch) imageUrl = ogMatch[1];
    }

    // Extract date
    const dateMatch = html.match(/<time[^>]*datetime="([^"]+)"/i)
      || html.match(/published_time"\s+content="([^"]+)"/i);
    const date = dateMatch ? dateMatch[1].substring(0, 10) : null;

    return { title: h1 || rawTitle, excerpt, imageUrl, date, h1 };
  } catch (e) {
    console.error(`  ⚠️  Failed to fetch ${url}:`, (e as Error).message);
    return { title: "", excerpt: "", imageUrl: null, date: null, h1: "" };
  }
}

async function main() {
  console.log("🚀 Starting scrape of softlixagency.com...\n");

  // Get tenant ID
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, TENANT_SLUG));
  if (!tenant) { console.error("❌ Tenant not found!"); process.exit(1); }
  const tenantId = tenant.id;
  console.log(`✅ Tenant: ${tenant.name} (${tenantId})\n`);

  // Delete existing blog posts to avoid duplicates
  await db.delete(blogPosts).where(eq(blogPosts.tenantId, tenantId));
  console.log("🗑️  Cleared existing blog posts\n");

  let imported = 0;
  let failed = 0;

  for (const slug of BLOG_SLUGS) {
    const url = `${BASE}/${slug}/`;
    process.stdout.write(`  Scraping: ${slug.substring(0, 45)}... `);

    const { title, excerpt, imageUrl, date, h1 } = await fetchPageData(url);
    const finalTitle = h1 || title || slug.replace(/-/g, " ");
    const category = guessCategory(slug, finalTitle);

    try {
      await db.insert(blogPosts).values({
        tenantId,
        title: finalTitle,
        titleEn: null,
        slug, // ← Arabic slug = exact old URL path
        excerpt: excerpt || `مقال متخصص حول ${finalTitle}`,
        excerptEn: null,
        content: `<p>${excerpt}</p><p>للاطلاع على المحتوى الكامل يرجى زيارة الصفحة.</p>`,
        contentEn: null,
        featuredImageUrl: imageUrl,
        seoTitle: finalTitle,
        seoDescription: excerpt,
        status: "published",
        publishedAt: date ? new Date(date) : new Date("2024-01-01"),
        category,
      } as any);
      imported++;
      console.log(`✅ [${category}]`);
    } catch (err) {
      failed++;
      console.log(`❌ DB Error: ${(err as Error).message?.substring(0, 60)}`);
    }

    // Small delay to be polite to the server
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n✅ Done! Imported: ${imported}, Failed: ${failed}`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
