import { db } from "../server/db";
import { projects, tenants } from "../shared/schema";
import { eq, lte } from "drizzle-orm";

const TENANT_SLUG = "softlix";

const newProjects = [
  {
    slug: "mapy-app",
    title: "تطبيق Mapy",
    titleEn: "Mapy App",
    clientName: "Mapy",
    category: "mobile-app",
    description: "تطبيق تواصل اجتماعي فريد حيث تلتقي المغامرة بالاتصال! يمكنك الدردشة، الالتقاء، وتكوين صداقات جديدة مع زملائك المستكشفين. يحتوي على هدايا غامضة متناثرة عبر الخريطة في انتظار اكتشافها.",
    descriptionEn: "A unique social media app where adventure meets connection! Chat, meet, and make new friends with fellow explorers. Contains hidden gifts scattered across the map waiting to be discovered.",
    technologies: ["Flutter", "Firebase", "Google Maps", "Node.js"],
    thumbnailUrl: "/clients/mapy.png",
    order: 1,
  },
  {
    slug: "wareef-realestate",
    title: "منصة وريف للتطوير والاستثمار العقاري",
    titleEn: "Wareef Real Estate Platform",
    clientName: "وريف للتطوير والاستثمار العقاري",
    category: "web-platform",
    description: "منصة عقارية مبتكرة تهدف إلى عرض العقارات بشكل شامل وسهل الوصول، مع توفير إمكانية التواصل بين المشترين والبائعين بسهولة. تشمل واجهة مستخدم متطورة لاستعراض مجموعة متنوعة من العقارات.",
    descriptionEn: "An innovative real estate platform for comprehensive property listing with easy buyer-seller communication. Features an advanced user interface for browsing diverse properties.",
    technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
    thumbnailUrl: "/clients/wareef.png",
    order: 2,
  },
  {
    slug: "saudi-diving-erp",
    title: "نظام العضويات الإلكتروني للاتحاد السعودي للغوص",
    titleEn: "Saudi Diving Federation Membership System",
    clientName: "الاتحاد السعودي للغوص",
    category: "erp-system",
    description: "نظام ERP متكامل لإدارة عضويات الاتحاد إلكترونياً. يتيح للأعضاء التسجيل وتجديد العضوية عبر الإنترنت، الدفع الآمن عبر البوابات الإلكترونية، وتحديث بيانات العضوية والحصول على إشعارات الفعاليات.",
    descriptionEn: "An integrated ERP system for managing federation memberships electronically. Enables online registration and renewal, secure payment through electronic gateways, and event notifications.",
    technologies: ["React", "Node.js", "PostgreSQL", "Payment Gateway"],
    thumbnailUrl: "/clients/saudi-diving.png",
    order: 3,
  },
  {
    slug: "tamkeen-ecommerce",
    title: "متجر شركة تمكين الدولية",
    titleEn: "Tamkeen International E-Commerce",
    clientName: "شركة تمكين الدولية",
    category: "ecommerce",
    description: "تطوير متجر إلكتروني متكامل مع تحسين الواجهات وتجربة المستخدم. يشمل تصميم واجهات مبتكرة سهلة الاستخدام تسهل التصفح والشراء، مع تحسين سرعة التحميل والاستجابة وتعزيز الأمان.",
    descriptionEn: "Development of an integrated e-commerce store with enhanced interfaces and user experience. Features innovative easy-to-use interfaces, improved loading speed, and enhanced security.",
    technologies: ["Next.js", "Node.js", "MongoDB", "Stripe"],
    thumbnailUrl: "/clients/tamkeen.png",
    order: 4,
  },
  {
    slug: "reyada-marketplace",
    title: "منصة متاجر ريادة الأولى",
    titleEn: "Reyada Al Oula Marketplace Platform",
    clientName: "شركة ريادة الأولى المحدودة",
    category: "web-platform",
    description: "منصة متاجر متعددة بنظام الاشتراكات مع تطبيقات للهواتف الذكية بتصميم عصري وفريد. تشمل صناعة المحتوى الرقمي ومتابعة أداء المنصات وقياس النتائج بدقة.",
    descriptionEn: "Multi-store platform with subscription system and mobile applications with modern unique design. Includes digital content creation and precise performance tracking.",
    technologies: ["React Native", "Laravel", "MySQL", "AWS"],
    thumbnailUrl: null,
    order: 5,
  },
  {
    slug: "ikhwanukum-donations",
    title: "منصة التبرعات لجمعية إخوانكم",
    titleEn: "Ikhwanukum Charity Donations Platform",
    clientName: "جمعية إخوانكم",
    category: "web-platform",
    description: "منصة رقمية متكاملة لجمع التبرعات وعرض المبادرات والفعاليات. تتيح للمستخدمين التبرع بسهولة وأمان، مع عرض جميع المبادرات بشكل مباشر وجذاب وآليات تسهيل المشاركة في الفعاليات.",
    descriptionEn: "An integrated digital platform for donations and charity initiatives. Enables easy and secure donations with attractive display of all initiatives and event participation.",
    technologies: ["Vue.js", "Node.js", "PostgreSQL", "Payment Gateway"],
    thumbnailUrl: "/clients/ikhwanukum.png",
    order: 6,
  },
  {
    slug: "alabdali-law-platform",
    title: "منصة مجموعة المحامي خالد العبدلي",
    titleEn: "Khalid Al Abdali Law Group Platform",
    clientName: "مجموعة المحامي خالد العبدلي",
    category: "web-platform",
    description: "موقع تعريفي احترافي ومنصة خدمات قانونية رقمية تتيح طلب الخدمات القانونية عبر الإنترنت بكل سهولة، مع إمكانية الدفع الإلكتروني الآمن.",
    descriptionEn: "Professional website and digital legal services platform for easy online service requests with secure electronic payment.",
    technologies: ["React", "Node.js", "PostgreSQL"],
    thumbnailUrl: "/clients/alabdali.png",
    order: 7,
  },
  {
    slug: "saudi-arts-platform",
    title: "منصة الجمعية العربية السعودية للفنون",
    titleEn: "Saudi Arabian Society for Arts Platform",
    clientName: "الجمعية العربية السعودية للفنون",
    category: "web-platform",
    description: "منصة إلكترونية متكاملة تمكّن أعضاء الجمعية من طلب العضوية بكل سهولة، مع استعراض مجموعة واسعة من الخدمات والأنشطة الفنية والمشاركة في الفعاليات وورش العمل.",
    descriptionEn: "An integrated platform for membership requests, browsing arts services and activities, and participating in events and workshops.",
    technologies: ["React", "Laravel", "MySQL"],
    thumbnailUrl: "/clients/saudi-arts.png",
    order: 8,
  },
  {
    slug: "sayha-booking-system",
    title: "نظام حجوزات بيت الشباب السعودي",
    titleEn: "Saudi Youth Hostel Booking System",
    clientName: "الجمعية العربية السعودية لبيت الشباب",
    category: "web-platform",
    description: "نظام حجوزات متكامل عبر الويب لتسهيل عمليات الحجز وضمان الوصول لأكبر شريحة من المستخدمين، مع إدارة الفروع ومتابعة الطلبات.",
    descriptionEn: "Comprehensive web booking system for streamlined reservations accessible to the widest user base, with branch management and order tracking.",
    technologies: ["React", "Node.js", "PostgreSQL"],
    thumbnailUrl: "/clients/youth-hostel.png",
    order: 9,
  },
  {
    slug: "reserva-restaurant-app",
    title: "تطبيق ريسيرفا للمطاعم",
    titleEn: "Reserva Restaurant Booking App",
    clientName: "تطبيق ريسيرفا",
    category: "mobile-app",
    description: "تطبيق حجز وطلب الطعام داخل المطاعم بكل سهولة ويسر. يمكنك حجز مكانك في مطعمك المفضل وطلب طعامك مسبقاً لتجربة تناول طعام مريحة وسلسة.",
    descriptionEn: "App for easy restaurant booking and food ordering. Reserve your table at your favorite restaurant and pre-order food for a comfortable dining experience.",
    technologies: ["Flutter", "Node.js", "Firebase", "Google Maps"],
    thumbnailUrl: "/clients/reserva.png",
    order: 10,
  },
  {
    slug: "ghazeer-water-delivery",
    title: "تطبيق غزير لتوصيل المياه",
    titleEn: "Ghazeer Water Delivery App",
    clientName: "تطبيق غزير",
    category: "mobile-app",
    description: "منصة رقمية متخصصة في خدمة توصيل كراتين وثلاجات الماء إلى المساجد، المنازل، المستشفيات، ودور الأيتام. يغطي المملكة العربية السعودية ودول الخليج بتطبيق سهل الاستخدام.",
    descriptionEn: "Digital platform for delivering water gallons and coolers to mosques, homes, hospitals, and orphanages across Saudi Arabia and Gulf countries.",
    technologies: ["Flutter", "Node.js", "Google Maps", "Firebase"],
    thumbnailUrl: "/clients/ghazeer.png",
    order: 11,
  },
  {
    slug: "tabarak-water-app",
    title: "تطبيق تبارك لمياه الشرب",
    titleEn: "Tabarak Water Delivery App",
    clientName: "تطبيق تبارك",
    category: "mobile-app",
    description: "نظام بيع مياه الشرب المعبأة لمصنع متش عبر تطبيق موبايل يدعم Android وiOS، مع تطبيق خدمة التوصيل. يتيح للعملاء طلب مياه الشرب بكل سهولة مع تجربة طلب وتسليم سريعة.",
    descriptionEn: "Bottled water sales system for Mutch factory via mobile app supporting Android and iOS, with a delivery service app for fast and convenient water ordering.",
    technologies: ["Flutter", "Node.js", "PostgreSQL", "Firebase"],
    thumbnailUrl: "/clients/tabarak.png",
    order: 12,
  },
  {
    slug: "nabaa-cars-erp",
    title: "نظام مبيعات شركة نبع الخليج للسيارات",
    titleEn: "Nabaa Al Khaleej Cars ERP & Sales",
    clientName: "شركة نبع الخليج للسيارات",
    category: "erp-system",
    description: "برنامج مبيعات ومشتريات متكامل يدعم تعريف الموظفين وصلاحياتهم وتعريف المركبات والمشتريات. يتيح للإدارة العليا متابعة الموظفين والمبيعات وطلبات أوامر الشراء وحجم الأعمال المعلقة.",
    descriptionEn: "Integrated sales and purchasing system supporting employee definitions, permissions, vehicles, and procurement. Enables management to track employees, sales, purchase orders, and pending business.",
    technologies: ["React", "Node.js", "PostgreSQL", "CRM"],
    thumbnailUrl: null,
    order: 13,
  },
  {
    slug: "kasaek-charity",
    title: "منصة جمعية كسائك إحسان",
    titleEn: "Kasaek Ehsan Charity Platform",
    clientName: "جمعية كسائك إحسان",
    category: "web-platform",
    description: "منصة رقمية لجمعية كسائك إحسان الخيرية لجمع التبرعات وإدارة الفعاليات وخدمة المستفيدين، مع تصميم يعكس هوية الجمعية ويعزز التفاعل.",
    descriptionEn: "Digital platform for Kasaek Ehsan charity for donations, event management, and beneficiary services with branding that reflects the association's identity.",
    technologies: ["React", "Laravel", "MySQL"],
    thumbnailUrl: "/clients/kasaek.png",
    order: 14,
  },
];

async function seedProjects() {
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, TENANT_SLUG));
  if (!tenant) { console.error("Tenant not found"); process.exit(1); }

  console.log(`Seeding ${newProjects.length} projects for tenant: ${tenant.name}`);

  // Update existing projects to have higher displayOrder (push to back)
  const existingProjects = await db.select().from(projects).where(eq(projects.tenantId, tenant.id));
  console.log(`Found ${existingProjects.length} existing projects, pushing them to back...`);
  
  for (let i = 0; i < existingProjects.length; i++) {
    await db.update(projects)
      .set({ displayOrder: 100 + i })
      .where(eq(projects.id, existingProjects[i].id));
  }

  // Add new projects with low displayOrder (appears first)
  for (const p of newProjects) {
    // Check if slug already exists
    const existing = existingProjects.find(e => e.slug === p.slug);
    if (existing) {
      console.log(`  ⚠️  Skipped (already exists): ${p.title}`);
      continue;
    }

    await db.insert(projects).values({
      tenantId: tenant.id,
      slug: p.slug,
      title: p.title,
      titleEn: p.titleEn,
      clientName: p.clientName,
      category: p.category,
      description: p.description,
      descriptionEn: p.descriptionEn,
      technologies: p.technologies,
      thumbnailUrl: p.thumbnailUrl || null,
      images: [],
      status: "published",
      displayOrder: p.order,
    });
    console.log(`  ✓ ${p.title}`);
  }

  console.log("\n✅ Projects seeded successfully!");
  process.exit(0);
}

seedProjects().catch(err => { console.error(err); process.exit(1); });
