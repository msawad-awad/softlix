import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Service, Project } from "@shared/schema";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const PROJECT_COLORS = [
  "linear-gradient(135deg, #111827, #2563eb)",
  "linear-gradient(135deg, #1f2937, #0ea5e9)",
  "linear-gradient(135deg, #0f172a, #e49268)",
  "linear-gradient(135deg, #0f172a, #7c3aed)",
  "linear-gradient(135deg, #111827, #059669)",
  "linear-gradient(135deg, #1e293b, #dc2626)",
];

const PROCESS_STEPS = [
  { num: "01", titleAr: "فهم المتطلبات", titleEn: "Understanding Requirements", descAr: "تحليل النشاط، الهدف، الجمهور المستهدف، ونطاق المشروع بشكل واضح ومنظم.", descEn: "Analyzing the business, goal, target audience, and project scope clearly." },
  { num: "02", titleAr: "التصميم والهيكلة", titleEn: "Design & Structure", descAr: "وضع Wireframe ثم واجهات احترافية تعكس الهوية وتدعم تجربة المستخدم.", descEn: "Creating wireframes then professional interfaces reflecting the identity." },
  { num: "03", titleAr: "التطوير والربط", titleEn: "Development & Integration", descAr: "برمجة الواجهة والخلفية وربط الخدمات والأنظمة الخارجية حسب الحاجة.", descEn: "Programming frontend and backend and connecting services as needed." },
  { num: "04", titleAr: "الإطلاق والتحسين", titleEn: "Launch & Improvement", descAr: "اختبارات نهائية، نشر المشروع، ومتابعة الأداء بعد الإطلاق.", descEn: "Final tests, project deployment, and performance monitoring after launch." },
];

const TESTIMONIALS = [
  { stars: 5, quoteAr: "تم تنفيذ المشروع بشكل احترافي جداً، وكان هناك فهم واضح للمتطلبات مع جودة عالية في التصميم والتنفيذ.", quoteEn: "The project was executed very professionally with clear understanding and high quality.", nameAr: "محمد العتيبي", nameEn: "Mohammed Al-Otaibi", roleAr: "مدير تنفيذي", roleEn: "Executive Director", initial: "م" },
  { stars: 5, quoteAr: "أكثر ما أعجبنا هو تنظيم العمل وسرعة الاستجابة، إضافة إلى أن الواجهة النهائية كانت أفضل من المتوقع.", quoteEn: "What impressed us most was the work organization and the final interface exceeded expectations.", nameAr: "سارة الشهري", nameEn: "Sara Al-Shahri", roleAr: "صاحبة متجر إلكتروني", roleEn: "E-commerce Store Owner", initial: "س" },
  { stars: 5, quoteAr: "تم بناء النظام بما يتناسب مع احتياجنا الفعلي، مع مرونة في التطوير المستقبلي ودعم فني ممتاز.", quoteEn: "The system was built to suit our actual needs with excellent technical support.", nameAr: "أحمد الزهراني", nameEn: "Ahmed Al-Zahrani", roleAr: "مدير عمليات", roleEn: "Operations Manager", initial: "أ" },
];

// Theme colors per service
const SERVICE_THEMES: Record<string, { eyebrowBg: string; eyebrowColor: string; checkBg: string; ctaBg: string; ctaDark: boolean; shadowColor: string; chipBg: string; chipColor: string; contactIconBg: string; stepColor: string }> = {
  "digital-marketing": {
    eyebrowBg: "#fff1f7",
    eyebrowColor: "#a11d64",
    checkBg: "linear-gradient(135deg,#7c3aed,#ec4899)",
    ctaBg: "linear-gradient(135deg,#0f172a,#7c3aed 58%,#ec4899)",
    ctaDark: true,
    shadowColor: "rgba(124,58,237,0.22)",
    chipBg: "#f5efff",
    chipColor: "#6d28d9",
    contactIconBg: "#f3e8ff",
    stepColor: "rgba(124,58,237,0.12)",
  },
  "technical-consulting": {
    eyebrowBg: "rgba(229,146,105,0.14)",
    eyebrowColor: "#cf7e56",
    checkBg: "linear-gradient(135deg,#e59269,#82b735)",
    ctaBg: "linear-gradient(135deg,rgba(229,146,105,0.14),rgba(130,183,53,0.12))",
    ctaDark: false,
    shadowColor: "rgba(229,146,105,0.26)",
    chipBg: "rgba(229,146,105,0.12)",
    chipColor: "#b86a3e",
    contactIconBg: "rgba(229,146,105,0.16)",
    stepColor: "rgba(229,146,105,0.13)",
  },
  "content-management": {
    eyebrowBg: "rgba(20,184,166,0.12)",
    eyebrowColor: "#0f766e",
    checkBg: "linear-gradient(135deg,#14b8a6,#6366f1)",
    ctaBg: "linear-gradient(135deg,#1f2937,#3a4659 50%,#d07b52)",
    ctaDark: true,
    shadowColor: "rgba(20,184,166,0.22)",
    chipBg: "rgba(20,184,166,0.10)",
    chipColor: "#0f766e",
    contactIconBg: "rgba(20,184,166,0.14)",
    stepColor: "rgba(20,184,166,0.10)",
  },
  "web-development": {
    eyebrowBg: "rgba(14,165,233,0.12)",
    eyebrowColor: "#0369a1",
    checkBg: "linear-gradient(135deg,#0ea5e9,#6366f1)",
    ctaBg: "linear-gradient(135deg,#0f172a,#0ea5e9 58%,#6366f1)",
    ctaDark: true,
    shadowColor: "rgba(14,165,233,0.26)",
    chipBg: "rgba(14,165,233,0.10)",
    chipColor: "#0369a1",
    contactIconBg: "rgba(14,165,233,0.14)",
    stepColor: "rgba(14,165,233,0.10)",
  },
};
const DEFAULT_THEME = {
  eyebrowBg: "#fff1e9",
  eyebrowColor: "#9a4f22",
  checkBg: "linear-gradient(135deg,#2563eb,#38bdf8)",
  ctaBg: "linear-gradient(135deg,#0f172a,#2563eb 60%,#38bdf8)",
  ctaDark: true,
  shadowColor: "rgba(37,99,235,0.22)",
  chipBg: "#eff6ff",
  chipColor: "#1d4ed8",
  contactIconBg: "#dbeafe",
  stepColor: "rgba(37,99,235,0.12)",
};

// Per-service config: metrics, sub-services, benefits, technologies
const SERVICE_CONFIG: Record<string, any> = {
  "content-management": {
    eyebrowAr: "التصميم وإدارة المواقع • Content & Design",
    eyebrowEn: "Content & Design • التصميم وإدارة المواقع",
    heroPointsAr: ["إدارة مستمرة للموقع والمحتوى", "تهيئة SEO لمحركات البحث", "هوية بصرية احترافية", "تحديث الصفحات والمنتجات"],
    heroPointsEn: ["Continuous website & content management", "SEO optimization for search engines", "Professional visual identity", "Pages & products updates"],
    metrics: [
      { strong: "360°", spanAr: "إدارة شاملة للمحتوى", spanEn: "Full content management" },
      { strong: "SEO", spanAr: "تهيئة لمحركات البحث", spanEn: "Search engine optimization" },
      { strong: "Brand", spanAr: "تصميم يعكس هوية البراند", spanEn: "Brand identity design" },
      { strong: "UX", spanAr: "تجربة مستخدم محسّنة", spanEn: "Enhanced user experience" },
    ],
    subServicesAr: [
      { icon: "📝", title: "إدارة المحتوى والصفحات", desc: "نتولى كتابة المحتوى الإبداعي وإدارة صفحات الموقع وتحديثها باستمرار بما يعكس هوية علامتك التجارية.", features: ["كتابة محتوى إبداعي احترافي", "إدارة وتحديث الصفحات", "إضافة المنتجات وتنظيم العرض"] },
      { icon: "🎨", title: "التصميم البصري والهوية", desc: "نصمم العناصر البصرية للموقع بأسلوب جذاب يعكس هوية البراند ويرفع جودة تجربة الزائر من النظرة الأولى.", features: ["تصميم واجهات وصفحات احترافية", "بناء هوية بصرية متسقة", "تصاميم جذابة تعكس قيمة البراند"] },
      { icon: "🔍", title: "SEO والظهور الرقمي", desc: "نحسّن محتوى الموقع والوصف والكلمات المفتاحية بطريقة احترافية ترفع ظهور خدماتك ومنتجاتك في نتائج البحث.", features: ["اختيار الكلمات المفتاحية المناسبة", "تحسين محتوى الصفحات للبحث", "تقارير الأداء والظهور"] },
    ],
    subServicesEn: [
      { icon: "📝", title: "Content & Pages Management", desc: "We handle creative content writing and continuous website page management to reflect your brand identity.", features: ["Professional creative content writing", "Page management & updates", "Product additions & organization"] },
      { icon: "🎨", title: "Visual Design & Identity", desc: "We design visual elements with an attractive style reflecting the brand identity and enhancing the visitor experience.", features: ["Professional interfaces & page design", "Consistent visual identity", "Attractive designs reflecting brand value"] },
      { icon: "🔍", title: "SEO & Digital Visibility", desc: "We optimize website content, descriptions, and keywords professionally to boost your services' search rankings.", features: ["Appropriate keyword selection", "Page content SEO optimization", "Performance & visibility reports"] },
    ],
    benefitsAr: [
      { icon: "🏆", title: "ميزة تنافسية أقوى", desc: "استراتيجية المحتوى والتصميم تمنحك حضوراً مختلفاً داخل السوق وتساعد جمهورك على تمييز علامتك بسرعة." },
      { icon: "🔍", title: "تحسين محركات البحث", desc: "اختيار الكلمات واحتراف كتابة المحتوى يرفع من فرص ظهور خدماتك في نتائج البحث الطبيعية." },
      { icon: "🎭", title: "هوية بصرية أكثر رسوخاً", desc: "التصميم الجذاب والفريد يعكس هوية البراند ويجعلها أكثر ثباتاً في ذهن العميل من النظرة الأولى." },
      { icon: "⚙️", title: "عمليات أكثر كفاءة", desc: "المحتوى المنظم يدعم الأتمتة والتحليل واتخاذ القرار بصورة أكثر ذكاءً داخل المؤسسة." },
      { icon: "📊", title: "إدارة معرفة فعالة", desc: "استراتيجية محتوى جيدة تضمن تكامل المعلومات وتقديم الرؤى بصيغ سهلة وقابلة للتحليل." },
      { icon: "✅", title: "ضمان جودة المعلومات", desc: "توفر أساساً متيناً لدقة المعلومات واتساقها واكتمالها وسهولة الوصول إليها من قبل المستخدم." },
    ],
    benefitsEn: [
      { icon: "🏆", title: "Stronger Competitive Advantage", desc: "Content and design strategy gives you a distinct market presence and helps your audience identify your brand quickly." },
      { icon: "🔍", title: "Search Engine Optimization", desc: "Right keywords and professional content writing boosts your services' chances of appearing in organic search results." },
      { icon: "🎭", title: "More Established Visual Identity", desc: "Attractive and unique design reflects the brand identity and makes it more memorable from the first glance." },
      { icon: "⚙️", title: "More Efficient Operations", desc: "Organized content supports automation, analysis, and smarter decision-making within the organization." },
      { icon: "📊", title: "Effective Knowledge Management", desc: "Good content strategy ensures information integration and presents insights in easy, analyzable formats." },
      { icon: "✅", title: "Information Quality Assurance", desc: "Provides a solid foundation for accuracy, consistency, completeness, and accessibility of information for end users." },
    ],
    technologiesAr: [] as any[],
    technologiesEn: [] as any[],
  },
  "web-development": {
    eyebrowAr: "تطوير تطبيقات الويب • Web Development",
    eyebrowEn: "Web Development • تطوير تطبيقات الويب",
    heroPointsAr: ["أنظمة أعمال وERP", "متاجر إلكترونية احترافية", "تجربة مستخدم وواجهة قوية", "حلول مخصصة وقابلة للتوسع"],
    heroPointsEn: ["Business Systems & ERP", "Professional E-commerce Stores", "Powerful UX & UI Design", "Custom & Scalable Solutions"],
    metrics: [
      { strong: "ERP", spanAr: "أنظمة أعمال", spanEn: "Business Systems" },
      { strong: "UX", spanAr: "واجهات وتجربة", spanEn: "UI & Experience" },
      { strong: "B2B", spanAr: "منصات احترافية", spanEn: "Pro Platforms" },
      { strong: "API", spanAr: "ربط الأنظمة", spanEn: "System Integration" },
    ],
    subServicesAr: [
      { icon: "🎨", title: "تجربة المستخدم والتصميم", desc: "نصمم واجهات حديثة وسهلة الاستخدام تركز على رحلة المستخدم، وضوح المعلومات، وسلاسة التفاعل بما يرفع جودة المنتج الرقمي.", features: ["تصميم UI/UX احترافي", "واجهات متجاوبة مع جميع الأجهزة", "رحلة مستخدم واضحة وسلسة"] },
      { icon: "🏢", title: "برمجة الأنظمة ERP", desc: "نطوّر أنظمة أعمال متكاملة لإدارة الموارد، العمليات، المستخدمين، المبيعات، وسير العمل الداخلي ضمن بنية منظمة.", features: ["إدارة الموارد والعمليات", "إدارة المستخدمين والصلاحيات", "تقارير وإحصائيات شاملة"] },
      { icon: "🛍️", title: "تطوير التجارة الإلكترونية", desc: "نقدّم حلولاً متقدمة لبناء المتاجر والمنصات التجارية مع دعم المنتجات والطلبات والدفع والشحن.", features: ["إدارة المنتجات والطلبات", "بوابات دفع متعددة", "تقارير المبيعات والأداء"] },
    ],
    subServicesEn: [
      { icon: "🎨", title: "UX & UI Design", desc: "We design modern, user-friendly interfaces focused on user journey, information clarity, and smooth interaction.", features: ["Professional UI/UX design", "Responsive across all devices", "Clear and smooth user journey"] },
      { icon: "🏢", title: "ERP Systems Development", desc: "We develop integrated business systems for managing resources, operations, users, sales, and workflows.", features: ["Resource & operations management", "User & permissions management", "Comprehensive reports & analytics"] },
      { icon: "🛍️", title: "E-commerce Development", desc: "We provide advanced solutions for building stores and commercial platforms with full product, order, payment, and shipping support.", features: ["Product & order management", "Multiple payment gateways", "Sales & performance reports"] },
    ],
    benefitsAr: [
      { icon: "🧠", title: "تحليل قبل التنفيذ", desc: "نبدأ بفهم المشروع والأهداف التجارية قبل كتابة أي سطر كود لضمان تنفيذ يخدم الأهداف الفعلية." },
      { icon: "⚡", title: "أداء عالٍ وسرعة", desc: "نستخدم أفضل التقنيات وأساليب التحسين لضمان تجربة سريعة وسلسة للمستخدم النهائي." },
      { icon: "📐", title: "قابلية التوسع", desc: "نصمم المشاريع من اليوم الأول لتكون قادرة على النمو ودعم المزيد من المستخدمين والمزايا مستقبلاً." },
      { icon: "🛡️", title: "أمان واستقرار", desc: "نطبّق معايير الأمان الحديثة في كل مرحلة من مراحل التطوير لحماية البيانات وضمان استمرارية العمل." },
    ],
    benefitsEn: [
      { icon: "🧠", title: "Analysis Before Execution", desc: "We start by understanding the project and business goals before writing any code to ensure aligned delivery." },
      { icon: "⚡", title: "High Performance & Speed", desc: "We use the best technologies and optimization practices to ensure a fast, smooth end-user experience." },
      { icon: "📐", title: "Scalability", desc: "We design projects from day one to be capable of growing and supporting more users and features in the future." },
      { icon: "🛡️", title: "Security & Stability", desc: "We apply modern security standards at every development stage to protect data and ensure business continuity." },
    ],
    technologiesAr: [] as any[],
    technologiesEn: [] as any[],
    techGroupsAr: [
      { group: "الأساسيات", items: [{ badge: "H", label: "HTML5", sub: "هيكلة الواجهات" }, { badge: "C", label: "CSS3", sub: "تصميم وتنسيق" }, { badge: "JS", label: "JavaScript", sub: "تفاعلات ديناميكية" }, { badge: "TS", label: "TypeScript", sub: "تطوير منظم" }, { badge: "API", label: "REST APIs", sub: "ربط الأنظمة" }] },
      { group: "إدارة المحتوى", items: [{ badge: "WP", label: "WordPress", sub: "مواقع ومحتوى" }, { badge: "MG", label: "Magento", sub: "تجارة إلكترونية" }, { badge: "SH", label: "Shopify", sub: "متاجر سريعة" }, { badge: "CS", label: "Custom CMS", sub: "لوحات مخصصة" }] },
      { group: "قواعد البيانات", items: [{ badge: "MY", label: "MySQL", sub: "حلول مستقرة" }, { badge: "PG", label: "PostgreSQL", sub: "أنظمة متقدمة" }, { badge: "MG", label: "MongoDB", sub: "بيانات مرنة" }] },
      { group: "الفريموركات", items: [{ badge: "L", label: "Laravel", sub: "أنظمة قوية" }, { badge: "N", label: "Node.js", sub: "واجهات وخدمات" }, { badge: "R", label: "React", sub: "واجهات متقدمة" }, { badge: "V", label: "Vue", sub: "تطوير مرن" }, { badge: "NW", label: "Next.js", sub: "أداء وSEO" }] },
      { group: "الخوادم والبنية التحتية", items: [{ badge: "NG", label: "Nginx", sub: "ويب سيرفر" }, { badge: "CL", label: "Cloud", sub: "نشر واستقرار" }, { badge: "CD", label: "CI/CD", sub: "تطوير مستمر" }] },
    ],
    techGroupsEn: [
      { group: "Fundamentals", items: [{ badge: "H", label: "HTML5", sub: "Interface structure" }, { badge: "C", label: "CSS3", sub: "Design & layout" }, { badge: "JS", label: "JavaScript", sub: "Dynamic interactions" }, { badge: "TS", label: "TypeScript", sub: "Structured development" }, { badge: "API", label: "REST APIs", sub: "System integration" }] },
      { group: "CMS Platforms", items: [{ badge: "WP", label: "WordPress", sub: "Sites & content" }, { badge: "MG", label: "Magento", sub: "E-commerce" }, { badge: "SH", label: "Shopify", sub: "Quick stores" }, { badge: "CS", label: "Custom CMS", sub: "Custom panels" }] },
      { group: "Databases", items: [{ badge: "MY", label: "MySQL", sub: "Stable solutions" }, { badge: "PG", label: "PostgreSQL", sub: "Advanced systems" }, { badge: "MG", label: "MongoDB", sub: "Flexible data" }] },
      { group: "Frameworks", items: [{ badge: "L", label: "Laravel", sub: "Powerful systems" }, { badge: "N", label: "Node.js", sub: "APIs & services" }, { badge: "R", label: "React", sub: "Advanced UIs" }, { badge: "V", label: "Vue", sub: "Flexible dev" }, { badge: "NW", label: "Next.js", sub: "Performance & SEO" }] },
      { group: "Servers & Infrastructure", items: [{ badge: "NG", label: "Nginx", sub: "Web server" }, { badge: "CL", label: "Cloud", sub: "Deploy & stability" }, { badge: "CD", label: "CI/CD", sub: "Continuous delivery" }] },
    ],
  },
  "technical-consulting": {
    eyebrowAr: "الاستشارات الفنية • Technical Consulting",
    eyebrowEn: "Technical Consulting • الاستشارات الفنية",
    heroPointsAr: ["تحليل شامل للمشروع الحالي", "توصيات تقنية عملية وواضحة", "تقليل المخاطر والتكاليف", "خطة تنفيذ ونمو مستقبلية"],
    heroPointsEn: ["Comprehensive project analysis", "Practical & clear technical recommendations", "Risk & cost reduction", "Future execution & growth plan"],
    metrics: [
      { strong: "360°", spanAr: "رؤية تقنية شاملة", spanEn: "Full technical vision" },
      { strong: "UX", spanAr: "تحسين التجربة الرقمية", spanEn: "Digital experience improvement" },
      { strong: "MVP", spanAr: "تخطيط الإطلاق الأول", spanEn: "First launch planning" },
      { strong: "ROI", spanAr: "رفع العائد على الاستثمار", spanEn: "Investment return improvement" },
    ],
    subServicesAr: [
      { icon: "⚙️", title: "استشارات الأنظمة والتطبيقات", desc: "تحليل التطبيقات الحالية، مراجعة البنية التقنية، تحديد المشاكل الحرجة، وتقديم توصيات قابلة للتنفيذ.", features: ["مراجعة البنية التقنية", "تحديد المشاكل الحرجة", "توصيات لتحسين الأداء والاستقرار"] },
      { icon: "📈", title: "استشارات التحول الرقمي", desc: "مساعدتك في تحويل العمليات التقليدية إلى حلول رقمية أكثر كفاءة مع فهم واضح للاحتياجات التشغيلية والتجارية.", features: ["تقييم العمليات الحالية", "تصميم الحل الرقمي المناسب", "خطة انتقال تدريجية وآمنة"] },
      { icon: "🛒", title: "استشارات التجارة الإلكترونية", desc: "اختيار المنصة الأنسب، تخطيط تجربة المستخدم، هيكلة عمليات المتجر والدفع والشحن.", features: ["اختيار المنصة المناسبة", "هيكلة تجربة المستخدم", "تصور تقني يدعم النمو والمبيعات"] },
    ],
    subServicesEn: [
      { icon: "⚙️", title: "Systems & Applications Consulting", desc: "Analyzing existing apps, reviewing technical architecture, identifying critical issues, and providing actionable recommendations.", features: ["Technical architecture review", "Critical issues identification", "Performance & stability improvement recommendations"] },
      { icon: "📈", title: "Digital Transformation Consulting", desc: "Helping you convert traditional processes into more efficient digital solutions with clear operational and business understanding.", features: ["Current operations evaluation", "Appropriate digital solution design", "Gradual & safe transition plan"] },
      { icon: "🛒", title: "E-commerce Consulting", desc: "Choosing the right platform, planning user experience, structuring store operations, payments, and shipping.", features: ["Right platform selection", "UX structure", "Technical vision supporting growth & sales"] },
    ],
    benefitsAr: [
      { icon: "🧠", title: "فهم تجاري وتقني", desc: "نربط القرار التقني بهدف المشروع التجاري لضمان أن التقنية تخدم الأعمال وليس العكس." },
      { icon: "🧩", title: "حلول مخصصة", desc: "لا نعتمد على حلول عامة. كل استشارة مبنية على احتياجات مشروعك تحديداً." },
      { icon: "🚀", title: "جاهزية للتنفيذ", desc: "كل مخرجات الاستشارة قابلة للتحويل مباشرة إلى تطوير فعلي دون تأخير." },
      { icon: "🔍", title: "تحليل دقيق", desc: "نراجع المشروع من زاوية الأداء والهيكل وتجربة المستخدم للوصول لتشخيص شامل." },
    ],
    benefitsEn: [
      { icon: "🧠", title: "Business & Technical Understanding", desc: "We link technical decisions to business goals to ensure technology serves the business." },
      { icon: "🧩", title: "Custom Solutions", desc: "We don't rely on generic solutions. Every consultation is built on your specific project needs." },
      { icon: "🚀", title: "Ready for Implementation", desc: "All consultation outputs can be directly converted to actual development without delay." },
      { icon: "🔍", title: "Precise Analysis", desc: "We review the project from performance, structure, and UX angles for a comprehensive diagnosis." },
    ],
    technologiesAr: [] as any[],
    technologiesEn: [] as any[],
  },
  "digital-marketing": {
    eyebrowAr: "خدمة تسويق رقمي احترافية",
    eyebrowEn: "Professional Digital Marketing Service",
    heroPointsAr: ["إدارة الحملات الإعلانية", "صناعة المحتوى الإبداعي", "استهداف أدق للفئات المناسبة", "تقارير وتحسين مستمر للأداء"],
    heroPointsEn: ["Advertising Campaign Management", "Creative Content Production", "Sharper Audience Targeting", "Reports & Continuous Performance Improvement"],
    metrics: [
      { strong: "Ads", spanAr: "إدارة حملات ممولة باحتراف", spanEn: "Professionally managed paid campaigns" },
      { strong: "Content", spanAr: "محتوى نصي ومرئي إبداعي", spanEn: "Creative text & visual content" },
      { strong: "SEO/SEM", spanAr: "ظهور أقوى في البحث والمنصات", spanEn: "Stronger search & platform presence" },
      { strong: "Reports", spanAr: "تقارير وتحسينات مستمرة", spanEn: "Ongoing reports & improvements" },
    ],
    subServicesAr: [
      { icon: "📣", title: "إدارة الحملات الإعلانية", desc: "تخطيط وتنفيذ ومتابعة الحملات الإعلانية على المنصات المناسبة بحسب هدف المشروع.", features: ["حملات تعريف وبيع وتحويل", "تحسين الميزانية والأداء", "اختبار الرسائل الإعلانية"] },
      { icon: "✍️", title: "صناعة المحتوى", desc: "صياغة محتوى نصي ومرئي مناسب للهوية، ويخاطب الفئة المستهدفة بطريقة أكثر إقناعاً.", features: ["كتابة محتوى إبداعي", "تصميم محتوى للحملات", "خطة نشر منتظمة"] },
      { icon: "🎯", title: "تحليل الفئات المستهدفة", desc: "دراسة الجمهور والسوق وتحديد من يجب استهدافه ومتى وكيف يتم الوصول إليه بفعالية.", features: ["تحليل سلوك العملاء", "تقسيم الشرائح", "تحسين الاستهداف المستمر"] },
      { icon: "📱", title: "التسويق عبر السوشيال ميديا", desc: "إدارة حضور العلامة التجارية على المنصات الاجتماعية ورفع مستوى التفاعل والثقة.", features: ["إدارة الحسابات", "خطة محتوى شهرية", "رفع التفاعل وبناء المجتمع"] },
      { icon: "📩", title: "التسويق عبر البريد الإلكتروني", desc: "بناء حملات ورسائل دورية للحفاظ على التواصل مع العملاء المحتملين والحاليين.", features: ["رسائل وعروض مخصصة", "سلاسل متابعة وتهيئة", "تحسين معدلات الفتح والتحويل"] },
      { icon: "💸", title: "الدفع بالنقرة PPC", desc: "إعلانات مدفوعة تستهدف كلمات وشرائح مناسبة لرفع الزيارات والطلبات بصورة أدق.", features: ["إعلانات Google وBing", "تحسين تكلفة النقرة", "صفحات هبوط أكثر فاعلية"] },
    ],
    subServicesEn: [
      { icon: "📣", title: "Advertising Campaign Management", desc: "Planning, executing, and monitoring advertising campaigns on the right platforms per project goal.", features: ["Awareness, sales & conversion campaigns", "Budget & performance optimization", "Ad message testing"] },
      { icon: "✍️", title: "Content Production", desc: "Crafting text and visual content that matches the brand identity and speaks to the target audience.", features: ["Creative copywriting", "Campaign content design", "Regular publishing schedule"] },
      { icon: "🎯", title: "Target Audience Analysis", desc: "Studying the audience and market to identify who, when, and how to reach them effectively.", features: ["Customer behavior analysis", "Segment classification", "Continuous targeting improvement"] },
      { icon: "📱", title: "Social Media Marketing", desc: "Managing brand presence on social platforms and raising engagement and trust levels.", features: ["Account management", "Monthly content plan", "Engagement & community building"] },
      { icon: "📩", title: "Email Marketing", desc: "Building periodic campaigns and messages to maintain contact with potential and existing customers.", features: ["Custom messages & offers", "Follow-up & nurture sequences", "Open & conversion rate improvement"] },
      { icon: "💸", title: "Pay Per Click (PPC)", desc: "Paid ads targeting relevant keywords and segments to boost traffic and leads more precisely.", features: ["Google & Bing ads", "Cost-per-click optimization", "More effective landing pages"] },
    ],
    benefitsAr: [
      { icon: "👥", title: "تحليل الجمهور المناسب", desc: "نحدد الشرائح الأكثر قابلية للتفاعل والشراء بناءً على نشاطها واحتياجها وسلوكها." },
      { icon: "🧭", title: "اختيار قنوات الوصول", desc: "لا يتم استخدام كل منصة بنفس الطريقة، بل يتم اختيار القناة الأنسب حسب الهدف والجمهور." },
      { icon: "⏱️", title: "توقيت الظهور المناسب", desc: "الرسالة الصحيحة تحتاج أيضاً إلى الوقت الصحيح لرفع فرص التفاعل والتحويل." },
    ],
    benefitsEn: [
      { icon: "👥", title: "Right Audience Analysis", desc: "We identify the most engagement-ready segments based on their activity, needs, and behavior." },
      { icon: "🧭", title: "Choosing Access Channels", desc: "Not every platform works the same way — we choose the most suitable channel per goal and audience." },
      { icon: "⏱️", title: "Right Time to Appear", desc: "The right message also needs the right time to increase engagement and conversion opportunities." },
    ],
    technologiesAr: [] as any[],
    technologiesEn: [] as any[],
  },
  "mobile-app-development": {
    eyebrowAr: "خدمة احترافية لتطوير تطبيقات الجوال",
    eyebrowEn: "Professional Mobile App Development",
    heroPointsAr: ["تطوير Native و Flutter", "تصميم UI/UX احترافي", "ربط APIs ولوحات تحكم", "اختبار جودة ونشر على المتاجر"],
    heroPointsEn: ["Native & Flutter Development", "Professional UI/UX Design", "APIs & Dashboard Integration", "QA Testing & Store Publishing"],
    metrics: [{ strong: "iOS", spanAr: "تطوير Swift وتطبيقات أصلية", spanEn: "Swift & native iOS apps" }, { strong: "Android", spanAr: "تطوير Kotlin/Java", spanEn: "Kotlin/Java development" }, { strong: "Flutter", spanAr: "تطبيق واحد لعدة منصات", spanEn: "One app for all platforms" }, { strong: "QA", spanAr: "اختبار وجودة قبل الإطلاق", spanEn: "Testing & quality before launch" }],
    subServicesAr: [
      { icon: "🍎", title: "تطوير تطبيقات iOS", desc: "تطبيقات احترافية لأجهزة Apple مع تركيز على الأداء والسلاسة.", features: ["Swift وتطبيقات أصلية", "واجهات سلسة ومتوافقة", "جاهزية للنشر على App Store"] },
      { icon: "🤖", title: "تطوير تطبيقات Android", desc: "تطبيقات أندرويد مصممة للنمو وسهولة الإدارة وربطها بالأنظمة الخلفية.", features: ["Kotlin / Java", "أداء مستقر وسريع", "جاهزية للنشر على Google Play"] },
      { icon: "🧩", title: "تطوير Flutter", desc: "حل مناسب للمشاريع التي تحتاج منصة واحدة تخدم iOS و Android بكفاءة.", features: ["تسريع وقت التطوير", "تقليل كلفة البناء الأولية", "واجهة موحدة بين المنصات"] },
      { icon: "🎨", title: "UI/UX لتطبيقات الجوال", desc: "تصميم تجربة استخدام مدروسة تجعل التطبيق أوضح وأسهل وأكثر إقناعاً.", features: ["Wireframes وتدفق المستخدم", "تصميم شاشات احترافية", "تحسين رحلة الاستخدام"] },
      { icon: "🔌", title: "ربط APIs ولوحات التحكم", desc: "ربط التطبيق مع لوحة إدارة أو نظام داخلي أو بوابات دفع.", features: ["ربط REST APIs", "تزامن البيانات والإشعارات", "تكامل مع أنظمة الأعمال"] },
      { icon: "🧪", title: "الاختبار والجودة", desc: "اختبارات شاملة قبل الإطلاق لضمان استقرار التطبيق.", features: ["اختبار الشاشات والتدفقات", "مراجعة الأداء والاستقرار", "تحسينات قبل الإطلاق"] },
    ],
    subServicesEn: [
      { icon: "🍎", title: "iOS App Development", desc: "Professional Apple device apps focusing on performance and smoothness.", features: ["Swift & native apps", "Smooth compatible interfaces", "Ready for App Store"] },
      { icon: "🤖", title: "Android App Development", desc: "Android apps designed for growth and easy management with backend integration.", features: ["Kotlin / Java", "Stable and fast performance", "Ready for Google Play"] },
      { icon: "🧩", title: "Flutter Development", desc: "Suitable solution for projects needing one platform serving both iOS and Android.", features: ["Faster development time", "Reduced initial build cost", "Unified interface across platforms"] },
      { icon: "🎨", title: "Mobile UI/UX Design", desc: "Thoughtful user experience design making the app clearer and easier to use.", features: ["Wireframes & user flow", "Professional screen design", "Improved usage journey"] },
      { icon: "🔌", title: "APIs & Dashboard Integration", desc: "Connecting the app with admin panel, internal systems, or payment gateways.", features: ["REST APIs integration", "Data sync & notifications", "Integration with business systems"] },
      { icon: "🧪", title: "Testing & Quality", desc: "Comprehensive pre-launch testing to ensure app stability.", features: ["Screen & flow testing", "Performance & stability review", "Pre-launch improvements"] },
    ],
    benefitsAr: [
      { icon: "⚡", title: "بناء سريع ومنظم", desc: "نعتمد على هيكلة واضحة للمشروع لتقليل الهدر وتسريع الوصول إلى نسخة قابلة للاختبار." },
      { icon: "🧠", title: "فهم تجاري قبل البرمجة", desc: "لا نكتفي بالتنفيذ التقني، بل نراجع طبيعة المشروع وهدفه قبل اختيار أسلوب التطوير المناسب." },
      { icon: "📈", title: "جاهزية للنمو", desc: "نراعي من البداية قابلية التطبيق للتوسع وربطه مستقبلاً مع خدمات إضافية أو أنظمة داخلية." },
    ],
    benefitsEn: [
      { icon: "⚡", title: "Fast & Organized Build", desc: "We use a clear project structure to reduce waste and speed up reaching a testable version." },
      { icon: "🧠", title: "Business Understanding Before Coding", desc: "We don't just execute technically; we review the project nature and goal before choosing the right approach." },
      { icon: "📈", title: "Growth Ready", desc: "We consider from the start the app's ability to scale and connect with additional services or internal systems." },
    ],
    technologiesAr: [
      { icon: "", label: "Swift", desc: "لتطوير تطبيقات iOS الأصلية عندما يحتاج المشروع أعلى توافق وأداء." },
      { icon: "A", label: "Kotlin", desc: "لتطوير Android الحديث بأسلوب مرن ومستقر وقابل للتوسع." },
      { icon: "F", label: "Flutter", desc: "عندما يكون المطلوب الوصول السريع لمنصتين مع تجربة موحدة." },
      { icon: "🔥", label: "Firebase", desc: "للإشعارات، التوثيق، التحليلات، وبعض الخدمات المساندة للتطبيقات." },
      { icon: "L", label: "Laravel API", desc: "لبناء لوحات التحكم وواجهات البرمجة الخلفية وربط البيانات." },
      { icon: "N", label: "Node.js", desc: "للمشاريع التي تحتاج خدمات لحظية أو APIs عالية المرونة." },
    ],
    technologiesEn: [
      { icon: "", label: "Swift", desc: "For native iOS app development when the project needs top compatibility and performance." },
      { icon: "A", label: "Kotlin", desc: "For modern Android development in a flexible, stable, and scalable style." },
      { icon: "F", label: "Flutter", desc: "When fast access to both platforms with a unified experience is needed." },
      { icon: "🔥", label: "Firebase", desc: "For notifications, authentication, analytics, and supporting services." },
      { icon: "L", label: "Laravel API", desc: "For building admin panels, backend programming interfaces, and data integration." },
      { icon: "N", label: "Node.js", desc: "For projects needing real-time services or highly flexible APIs." },
    ],
  },
};

// Default config for any service
const DEFAULT_CONFIG = (service: Service, isAr: boolean) => ({
  eyebrowAr: `خدمة ${service.title}`,
  eyebrowEn: `${service.titleEn || service.title} Service`,
  heroPointsAr: ["جودة عالية في التنفيذ", "فريق متخصص ومحترف", "دعم فني مستمر", "التزام بالمواعيد والجودة"],
  heroPointsEn: ["High execution quality", "Specialized professional team", "Continuous technical support", "On-time delivery"],
  metrics: [
    { strong: "5+", spanAr: "سنوات خبرة", spanEn: "Years experience" },
    { strong: "150+", spanAr: "مشروع منجز", spanEn: "Projects completed" },
    { strong: "50+", spanAr: "عميل راضٍ", spanEn: "Happy clients" },
    { strong: "24/7", spanAr: "دعم فني", spanEn: "Technical support" },
  ],
  subServicesAr: [],
  subServicesEn: [],
  benefitsAr: [
    { icon: "⚡", title: "تنفيذ سريع ومنظم", desc: "نعتمد على هيكلة واضحة للمشروع لتقليل الهدر وتسريع التسليم." },
    { icon: "🧠", title: "فهم احتياجاتك أولاً", desc: "نراجع طبيعة مشروعك وهدفه قبل اختيار أسلوب التنفيذ المناسب." },
    { icon: "📈", title: "نتائج قابلة للقياس", desc: "نركز على النتائج الحقيقية والتأثير الفعلي على نشاطك التجاري." },
  ],
  benefitsEn: [
    { icon: "⚡", title: "Fast & Organized Execution", desc: "We use a clear structure to reduce waste and accelerate delivery." },
    { icon: "🧠", title: "Understanding Your Needs First", desc: "We review your project nature and goal before choosing the right approach." },
    { icon: "📈", title: "Measurable Results", desc: "We focus on real results and actual impact on your business." },
  ],
  technologiesAr: [] as any[],
  technologiesEn: [] as any[],
});

interface ServiceDetailProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

interface LeadForm {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

const CATEGORY_MAP: Record<string, string> = {
  "mobile-app-development": "mobile-app",
  "web-development": "web",
  "ecommerce": "ecommerce",
  "erp-systems": "erp",
  "digital-marketing": "marketing",
  "creative-design": "design",
  "content-management": "content",
  "hosting-servers": "hosting",
  "technical-consulting": "consulting",
};

export default function ServiceDetail({ lang = "ar", onLangChange }: ServiceDetailProps) {
  const [, params] = useRoute("/services/:slug");
  const slug = params?.slug || "";
  const isAr = lang === "ar";
  const { toast } = useToast();

  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ["/api/public/services", slug],
  });

  const relatedCategory = CATEGORY_MAP[slug] || slug;
  const { data: allProjects } = useQuery<Project[]>({
    queryKey: ["/api/public/projects", TENANT_ID],
  });

  const relatedProjects = (allProjects || [])
    .filter(p => p.category === relatedCategory || p.category === slug)
    .slice(0, 3);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadForm>();

  const leadMutation = useMutation({
    mutationFn: (data: LeadForm) =>
      apiRequest("POST", "/api/public/leads", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: `الشركة: ${data.company || "-"}\n\nتفاصيل الطلب من صفحة خدمة ${slug}:\n${data.message}`,
        source: `service-${slug}`,
      }),
    onSuccess: () => {
      toast({ title: isAr ? "تم إرسال طلبك ✓" : "Request sent ✓", description: isAr ? "سنتواصل معك قريباً" : "We will contact you soon" });
      reset();
    },
    onError: () => {
      toast({ title: isAr ? "حدث خطأ" : "Error occurred", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
        <PublicNavbar lang={lang} onLangChange={onLangChange} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, border: "4px solid #dbeafe", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginInline: "auto" }} />
            <p style={{ marginTop: 16, color: "#64748b", fontWeight: 700 }}>{isAr ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!service) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
        <PublicNavbar lang={lang} onLangChange={onLangChange} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "0 16px" }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginBottom: 16 }}>{isAr ? "الخدمة غير موجودة" : "Service Not Found"}</h1>
          <a href="/services" style={{ display: "inline-flex", borderRadius: 999, padding: "12px 24px", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
            {isAr ? "عودة للخدمات" : "Back to Services"}
          </a>
        </div>
      </div>
    );
  }

  const title = isAr ? service.title : (service.titleEn || service.title);
  const shortDesc = isAr ? service.shortDescription : (service.shortDescriptionEn || service.shortDescription);
  const fullDesc = isAr ? service.fullDescription : (service.fullDescriptionEn || service.fullDescription);
  const features: string[] = Array.isArray(service.features) ? service.features : [];

  const cfg = SERVICE_CONFIG[slug] || DEFAULT_CONFIG(service, isAr);
  const eyebrow = isAr ? cfg.eyebrowAr : cfg.eyebrowEn;
  const heroPoints = isAr ? cfg.heroPointsAr : cfg.heroPointsEn;
  const metrics = cfg.metrics;
  const subServices = isAr ? cfg.subServicesAr : cfg.subServicesEn;
  const benefits = isAr ? cfg.benefitsAr : cfg.benefitsEn;
  const technologies = isAr ? cfg.technologiesAr : cfg.technologiesEn;

  const isMobile = slug === "mobile-app-development";
  const isMarketing = slug === "digital-marketing";
  const isConsulting = slug === "technical-consulting";
  const isWebDev = slug === "web-development";
  const isContent = slug === "content-management";
  const techGroups = isAr ? cfg.techGroupsAr : cfg.techGroupsEn;
  const theme = SERVICE_THEMES[slug] || DEFAULT_THEME;
  const ctaTextColor = theme.ctaDark ? "#fff" : "#0f172a";
  const ctaSubColor = theme.ctaDark ? "rgba(255,255,255,0.85)" : "#6b7280";

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", background: "#f8fafc", color: "#0f172a", lineHeight: 1.7 }}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* ── Breadcrumb ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#64748b" }}>
          <a href="/" style={{ color: "#64748b", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#2563eb")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>{isAr ? "الرئيسية" : "Home"}</a>
          <span>/</span>
          <a href="/services" style={{ color: "#64748b", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#2563eb")} onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>{isAr ? "الخدمات" : "Services"}</a>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 700 }}>{title}</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{
        padding: "78px 0 42px",
        background: isMarketing
          ? "radial-gradient(circle at 14% 20%, rgba(124,58,237,0.10), transparent 26%), radial-gradient(circle at 90% 0%, rgba(236,72,153,0.12), transparent 32%), linear-gradient(180deg,#ffffff 0%,#fbf8ff 100%)"
          : "radial-gradient(circle at 15% 15%, rgba(228,146,104,0.14), transparent 26%), radial-gradient(circle at 85% 0%, rgba(56,189,248,0.14), transparent 28%), linear-gradient(180deg,#ffffff 0%,#f8fbff 100%)",
        overflow: "hidden",
      }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.02fr 0.98fr", gap: 36, alignItems: "center" }} className="hero-grid-responsive">

            {/* Left: Text */}
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: theme.eyebrowBg, color: theme.eyebrowColor, fontSize: 14, fontWeight: 800, marginBottom: 18 }}>
                {eyebrow}
              </span>
              <h1 style={{ margin: "0 0 18px", fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.15, letterSpacing: -0.5, fontWeight: 800 }}>
                {title}
              </h1>
              <p style={{ margin: 0, fontSize: 18, color: "#64748b", maxWidth: 680 }}>{shortDesc}</p>

              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
                <a href="#contact-section" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 800, background: theme.checkBg, color: "#fff", boxShadow: `0 14px 28px ${theme.shadowColor}`, textDecoration: "none", border: 0 }} data-testid="btn-hero-request">
                  {isAr ? "ابدأ مشروعك معنا" : "Start Your Project"}
                </a>
                <a href="#projects-section" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 700, background: "#fff", color: "#0f172a", border: "1px solid rgba(15,23,42,0.08)", textDecoration: "none" }} data-testid="btn-hero-projects">
                  {isAr ? "شاهد مشاريعنا" : "View Our Projects"}
                </a>
              </div>

              {/* Hero Points */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 28 }} className="grid-2-responsive">
                {heroPoints.map((p: string, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.82)", border: "1px solid #e2e8f0", borderRadius: 18, padding: "14px 16px", boxShadow: "0 20px 50px rgba(15,23,42,0.08)", fontWeight: 700, color: "#334155" }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, color: "#fff", background: theme.checkBg, fontSize: 14 }}>✓</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div style={{ position: "relative", minHeight: 560, display: "grid", placeItems: "center" }} className="hide-mobile">
              {/* Background card */}
              <div style={{ position: "absolute", inset: "54px 20px 40px", borderRadius: 34, background: "linear-gradient(135deg,#fff,#eef6ff)", border: "1px solid rgba(226,232,240,0.9)", boxShadow: "0 30px 70px rgba(15,23,42,0.13)" }} />

              {/* Phone mockups */}
              {isMobile ? (
                <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, transform: "translateY(8px)" }}>
                  {/* Small phone */}
                  <div style={{ width: 185, height: 390, background: "#111827", borderRadius: 34, padding: 10, boxShadow: "0 25px 60px rgba(15,23,42,0.22)", transform: "translateY(34px) rotate(-8deg)", opacity: 0.92, flexShrink: 0 }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: 26, overflow: "hidden", background: "linear-gradient(180deg,#f8fbff,#e0f2fe)", padding: 16, position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 16 }}><span>9:41</span><span>LTE • 100%</span></div>
                      <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", padding: 14, marginBottom: 12 }}>
                        <span style={{ display: "inline-block", background: "#eff6ff", color: "#1d4ed8", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800, marginBottom: 10 }}>Analytics</span>
                        <div style={{ height: 12, width: "68%", background: "#dbeafe", borderRadius: 999, marginBottom: 10 }} />
                        <div style={{ height: 8, width: "100%", background: "#e2e8f0", borderRadius: 999, marginBottom: 7 }} />
                        <div style={{ height: 8, width: "70%", background: "#e2e8f0", borderRadius: 999 }} />
                      </div>
                      <div style={{ height: 110, borderRadius: 18, background: "linear-gradient(135deg,#2563eb,#38bdf8)", marginBottom: 12 }} />
                    </div>
                  </div>

                  {/* Large phone */}
                  <div style={{ width: 220, height: 452, background: "#111827", borderRadius: 34, padding: 10, boxShadow: "0 25px 60px rgba(15,23,42,0.22)", transform: "rotate(7deg)", flexShrink: 0 }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: 26, overflow: "hidden", background: "linear-gradient(180deg,#f8fbff,#e0f2fe)", padding: 16, position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 16 }}><span>9:41</span><span>5G • 100%</span></div>
                      <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", padding: 14, marginBottom: 12 }}>
                        <span style={{ display: "inline-block", background: "#eff6ff", color: "#1d4ed8", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800, marginBottom: 10 }}>Softlix App</span>
                        <div style={{ height: 12, width: "72%", background: "#dbeafe", borderRadius: 999, marginBottom: 10 }} />
                        <div style={{ height: 8, width: "100%", background: "#e2e8f0", borderRadius: 999, marginBottom: 7 }} />
                      </div>
                      <div style={{ height: 110, borderRadius: 18, background: "linear-gradient(135deg,#2563eb,#38bdf8)", marginBottom: 12 }} />
                      <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #e2e8f0", padding: 14 }}>
                        <div style={{ height: 12, width: "62%", background: "#dbeafe", borderRadius: 999, marginBottom: 10 }} />
                        <div style={{ height: 8, width: "100%", background: "#e2e8f0", borderRadius: 999, marginBottom: 7 }} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                          <div style={{ height: 38, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }} />
                          <div style={{ height: 38, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isConsulting ? (
                /* Technical Consulting Visual */
                <div style={{ position: "relative", zIndex: 2, width: "92%", display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Mock Window */}
                  <div style={{ borderRadius: 24, background: "linear-gradient(180deg,#fff,#fff8f3)", border: "1px solid rgba(31,41,55,0.08)", padding: 22, boxShadow: "0 30px 70px rgba(15,23,42,0.14)" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#fda4af", display: "inline-block" }} />
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#fde68a", display: "inline-block" }} />
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 14 }}>
                      <span>{isAr ? "تحليل المشروع" : "Project Analysis"}</span>
                      <span style={{ color: "#82b735" }}>● {isAr ? "نشط" : "Active"}</span>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {[
                        { label: isAr ? "جودة البنية التقنية" : "Architecture Quality", w: 88 },
                        { label: isAr ? "قابلية التوسع" : "Scalability", w: 72 },
                        { label: isAr ? "تجربة المستخدم" : "User Experience", w: 94 },
                        { label: isAr ? "الأمان والاستقرار" : "Security & Stability", w: 61 },
                        { label: isAr ? "أداء النظام" : "System Performance", w: 83 },
                      ].map((row, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4 }}>
                            <span>{row.label}</span><span style={{ color: "#cf7e56" }}>{row.w}%</span>
                          </div>
                          <div style={{ height: 10, borderRadius: 999, background: "#f1f5f9", overflow: "hidden", position: "relative" }}>
                            <div style={{ position: "absolute", inset: 0, width: `${row.w}%`, borderRadius: "inherit", background: "linear-gradient(90deg,#e59269,#82b735)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Stats Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    {[
                      { strong: "360°", spanAr: "رؤية شاملة", spanEn: "Full Vision" },
                      { strong: "UX", spanAr: "تحسين التجربة", spanEn: "UX Improvement" },
                      { strong: "MVP", spanAr: "تخطيط الإطلاق", spanEn: "Launch Planning" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(31,41,55,0.08)", borderRadius: 20, padding: "16px 10px", textAlign: "center", boxShadow: "0 12px 32px rgba(15,23,42,0.07)" }}>
                        <strong style={{ display: "block", fontSize: 24, color: "#cf7e56", lineHeight: 1.1 }}>{s.strong}</strong>
                        <span style={{ color: "#6b7280", fontSize: 12, fontWeight: 700 }}>{isAr ? s.spanAr : s.spanEn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isContent ? (
                /* Content Management Visual - CMS Editor */
                <div style={{ position: "relative", zIndex: 2, width: "92%", display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Editor Window */}
                  <div style={{ borderRadius: 24, background: "linear-gradient(180deg,#fff,#f0fdfa)", border: "1px solid rgba(20,184,166,0.18)", padding: 22, boxShadow: "0 30px 70px rgba(20,184,166,0.14)" }}>
                    {/* Toolbar */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#fda4af", display: "inline-block" }} />
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#fde68a", display: "inline-block" }} />
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
                      <div style={{ marginRight: "auto", marginLeft: 8, display: "flex", gap: 6 }}>
                        {["H1","B","I","🖼","🔗"].map((t,i) => (
                          <span key={i} style={{ padding: "4px 8px", borderRadius: 8, background: i === 0 ? "rgba(20,184,166,0.18)" : "#f1f5f9", fontSize: 11, fontWeight: 800, color: i === 0 ? "#0f766e" : "#64748b" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    {/* Content blocks */}
                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={{ height: 18, borderRadius: 999, background: "rgba(20,184,166,0.25)", width: "68%" }} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.4fr", gap: 10, marginTop: 4 }}>
                        <div style={{ display: "grid", gap: 8 }}>
                          <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", width: "100%" }} />
                          <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", width: "90%" }} />
                          <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", width: "82%" }} />
                          <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", width: "95%" }} />
                        </div>
                        <div style={{ borderRadius: 14, background: "linear-gradient(135deg,rgba(20,184,166,0.2),rgba(99,102,241,0.15))", display: "grid", placeItems: "center", fontSize: 22 }}>🖼</div>
                      </div>
                      {/* SEO field */}
                      <div style={{ marginTop: 6, padding: "10px 14px", borderRadius: 14, background: "#f0fdfa", border: "1px solid rgba(20,184,166,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#0f766e", whiteSpace: "nowrap" }}>SEO</span>
                        <div style={{ height: 8, borderRadius: 999, background: "rgba(20,184,166,0.3)", flex: 1 }} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#16a34a" }}>✓</span>
                      </div>
                    </div>
                  </div>
                  {/* Stats Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    {[
                      { strong: "360°", spanAr: "إدارة شاملة", spanEn: "Full Management" },
                      { strong: "SEO", spanAr: "ظهور في البحث", spanEn: "Search Visibility" },
                      { strong: "Brand", spanAr: "هوية البراند", spanEn: "Brand Identity" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(20,184,166,0.14)", borderRadius: 20, padding: "16px 10px", textAlign: "center", boxShadow: "0 12px 32px rgba(20,184,166,0.08)" }}>
                        <strong style={{ display: "block", fontSize: 20, color: "#0f766e", lineHeight: 1.1 }}>{s.strong}</strong>
                        <span style={{ color: "#6b7280", fontSize: 12, fontWeight: 700 }}>{isAr ? s.spanAr : s.spanEn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isWebDev ? (
                /* Web Development Dashboard Visual */
                <div style={{ position: "relative", zIndex: 2, width: "92%", display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ borderRadius: 24, background: "linear-gradient(180deg,#fff,#f0f9ff)", border: "1px solid rgba(14,165,233,0.14)", padding: 22, boxShadow: "0 30px 70px rgba(14,165,233,0.12)" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#fda4af", display: "inline-block" }} />
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#fde68a", display: "inline-block" }} />
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>
                      {/* Left: Progress bars */}
                      <div style={{ borderRadius: 16, background: "#fff", border: "1px solid rgba(14,165,233,0.10)", padding: 16, display: "grid", gap: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#0369a1", marginBottom: 4 }}>{isAr ? "أداء المشروع" : "Project Performance"}</div>
                        {[90, 72, 84, 63, 77].map((w, i) => (
                          <div key={i} style={{ height: 10, borderRadius: 999, background: "#e0f2fe", overflow: "hidden", position: "relative" }}>
                            <div style={{ position: "absolute", inset: 0, width: `${w}%`, borderRadius: "inherit", background: "linear-gradient(90deg,#0ea5e9,#6366f1)" }} />
                          </div>
                        ))}
                      </div>
                      {/* Right: Metric blocks */}
                      <div style={{ display: "grid", gap: 10 }}>
                        {[
                          { label: isAr ? "مرحلة التطوير" : "Dev Phase", value: isAr ? "MVP" : "MVP" },
                          { label: isAr ? "جودة الكود" : "Code Quality", value: "A+" },
                          { label: isAr ? "الأداء" : "Performance", value: "98%" },
                        ].map((m, i) => (
                          <div key={i} style={{ borderRadius: 14, background: i === 0 ? "#e0f2fe" : i === 1 ? "#eef2ff" : "#f0fdf4", border: "1px solid rgba(14,165,233,0.10)", padding: "12px 14px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 2 }}>{m.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? "#0369a1" : i === 1 ? "#4f46e5" : "#15803d" }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Stats Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    {[
                      { strong: "ERP", spanAr: "أنظمة أعمال", spanEn: "Business Systems" },
                      { strong: "UX", spanAr: "واجهات وتجربة", spanEn: "UI & Experience" },
                      { strong: "B2B", spanAr: "منصات احترافية", spanEn: "Pro Platforms" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(14,165,233,0.12)", borderRadius: 20, padding: "16px 10px", textAlign: "center", boxShadow: "0 12px 32px rgba(14,165,233,0.08)" }}>
                        <strong style={{ display: "block", fontSize: 22, color: "#0369a1", lineHeight: 1.1 }}>{s.strong}</strong>
                        <span style={{ color: "#6b7280", fontSize: 12, fontWeight: 700 }}>{isAr ? s.spanAr : s.spanEn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isMarketing ? (
                /* Marketing Dashboard Visual */
                <div style={{ position: "relative", zIndex: 2, width: "92%", height: 420, borderRadius: 36, background: "linear-gradient(135deg,#ffffff,#faf5ff)", border: "1px solid rgba(226,232,240,0.92)", boxShadow: "0 30px 70px rgba(15,23,42,0.14)", overflow: "hidden" }}>
                  {/* Orbs */}
                  <div style={{ position: "absolute", width: 140, height: 140, top: 40, right: 38, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.35), rgba(236,72,153,0))", filter: "blur(2px)" }} />
                  <div style={{ position: "absolute", width: 160, height: 160, left: 30, bottom: 30, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.26), rgba(124,58,237,0))", filter: "blur(2px)" }} />
                  {/* Dashboard panels */}
                  <div style={{ position: "absolute", inset: 24, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gridTemplateRows: "auto auto 1fr", gap: 12, zIndex: 2 }}>
                    {/* Panel tall - ring */}
                    <div style={{ gridRow: "span 2", background: "rgba(255,255,255,0.88)", border: "1px solid rgba(226,232,240,0.95)", borderRadius: 22, boxShadow: "0 16px 34px rgba(15,23,42,0.06)", padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11, fontWeight: 800, color: "#334155" }}>
                        <span>Performance</span><span style={{ color: "#64748b" }}>هذا الشهر</span>
                      </div>
                      {/* Ring chart */}
                      <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "4px auto 10px", background: "conic-gradient(#ec4899 0 72%, #ede9fe 72% 100%)", display: "grid", placeItems: "center" }}>
                        <div style={{ width: 62, height: 62, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 13, color: "#0f172a" }}>72%</div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "center", marginBottom: 10 }}>{isAr ? "نسبة التفاعل" : "Engagement Rate"}</div>
                      <div style={{ display: "grid", gap: 7, marginTop: 10 }}>
                        {[82, 64, 74].map((w, i) => (
                          <div key={i} style={{ height: 8, borderRadius: 999, background: "#eef2ff", overflow: "hidden", position: "relative" }}>
                            <div style={{ position: "absolute", inset: 0, width: `${w}%`, borderRadius: "inherit", background: "linear-gradient(90deg,#7c3aed,#ec4899)" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Leads panel */}
                    <div style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(226,232,240,0.95)", borderRadius: 22, boxShadow: "0 16px 34px rgba(15,23,42,0.06)", padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 8 }}><span>Leads</span><span style={{ color: "#16a34a" }}>+38%</span></div>
                      <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: "#0f172a", marginBottom: 4 }}>1,284</div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{isAr ? "استفسارات من الحملات" : "Leads from campaigns"}</div>
                    </div>
                    {/* CTR panel */}
                    <div style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(226,232,240,0.95)", borderRadius: 22, boxShadow: "0 16px 34px rgba(15,23,42,0.06)", padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 8 }}><span>CTR</span><span style={{ color: "#64748b" }}>{isAr ? "جيد" : "Good"}</span></div>
                      <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: "#0f172a", marginBottom: 4 }}>6.4%</div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{isAr ? "متوسط التفاعل" : "Avg. engagement"}</div>
                    </div>
                    {/* Channels panel */}
                    <div style={{ gridColumn: "span 2", background: "rgba(255,255,255,0.88)", border: "1px solid rgba(226,232,240,0.95)", borderRadius: 22, boxShadow: "0 16px 34px rgba(15,23,42,0.06)", padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 8 }}><span>Marketing Channels</span><span style={{ color: "#64748b" }}>{isAr ? "قنوات النمو" : "Growth channels"}</span></div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
                        {["Social Ads", "Content", "Email"].map((ch, i) => (
                          <div key={i} style={{ borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 6px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#334155" }}>{ch}</div>
                        ))}
                      </div>
                      {[76, 58].map((w, i) => (
                        <div key={i} style={{ height: 8, borderRadius: 999, background: "#eef2ff", overflow: "hidden", position: "relative", marginBottom: i < 1 ? 6 : 0 }}>
                          <div style={{ position: "absolute", inset: 0, width: `${w}%`, borderRadius: "inherit", background: "linear-gradient(90deg,#7c3aed,#ec4899)" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Generic service visual - dashboard */
                <div style={{ position: "relative", zIndex: 2, background: "linear-gradient(180deg,#0f172a,#111827)", borderRadius: 30, padding: 20, boxShadow: "0 35px 90px rgba(15,23,42,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", width: "90%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <strong style={{ fontSize: 18 }}>{isAr ? "لوحة تحكم" : "Dashboard"}</strong>
                    <div style={{ display: "flex", gap: 7 }}>
                      <span style={{ width: 11, height: 11, borderRadius: "50%", display: "inline-block", background: "#f87171" }} />
                      <span style={{ width: 11, height: 11, borderRadius: "50%", display: "inline-block", background: "#fbbf24" }} />
                      <span style={{ width: 11, height: 11, borderRadius: "50%", display: "inline-block", background: "#34d399" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "end", gap: 10, minHeight: 160, marginBottom: 16 }}>
                    {[45, 62, 38, 78, 55, 92].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: "linear-gradient(180deg,#38bdf8,#2563eb)", borderRadius: "16px 16px 8px 8px", height: `${h}%` }} />
                    ))}
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[isAr ? "العملاء النشطون" : "Active Clients", isAr ? "المشاريع المكتملة" : "Completed Projects"].map((label, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#cbd5e1", fontSize: 13 }}>{label}</span>
                        <strong style={{ color: "#fff" }}>{i === 0 ? "1,284" : "320"}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floating cards */}
              {!isConsulting && !isWebDev && !isContent && (
                <>
                  <div style={{ position: "absolute", background: "#fff", color: "#0f172a", borderRadius: 20, padding: "14px 16px", boxShadow: "0 20px 50px rgba(15,23,42,0.08)", border: "1px solid #e2e8f0", minWidth: 180, zIndex: 3, ...(isAr ? { right: -10 } : { left: -10 }), top: 30 }}>
                    <strong style={{ display: "block", fontSize: 17, marginBottom: 4 }}>{isMarketing ? (isAr ? "استراتيجية قبل التنفيذ" : "Strategy before execution") : (isAr ? "Flutter / Native" : "Flutter / Native")}</strong>
                    <span style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>{isMarketing ? (isAr ? "لا نبدأ الحملة قبل فهم السوق والهدف" : "We don't start before understanding the market") : (isAr ? "حلول مرنة حسب المشروع" : "Flexible solutions per project")}</span>
                  </div>
                  <div style={{ position: "absolute", background: "#fff", color: "#0f172a", borderRadius: 20, padding: "14px 16px", boxShadow: "0 20px 50px rgba(15,23,42,0.08)", border: "1px solid #e2e8f0", minWidth: 180, zIndex: 3, ...(isAr ? { left: 4 } : { right: 4 }), bottom: 20 }}>
                    <strong style={{ display: "block", fontSize: 17, marginBottom: 4 }}>{isMarketing ? (isAr ? "نتائج قابلة للقياس" : "Measurable results") : (isAr ? "واجهة ترفع التفاعل" : "Interface that boosts engagement")}</strong>
                    <span style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>{isMarketing ? (isAr ? "تحسين مستمر مبني على الأرقام" : "Continuous improvement based on numbers") : (isAr ? "تصميم يركز على الوضوح" : "Design focused on clarity")}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics ── */}
      <section style={{ padding: "70px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-flex", background: "#fff1e9", color: "#9a4f22", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                {isAr ? "مؤشرات سريعة" : "Quick Metrics"}
              </span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "خدمة تبني الثقة بسرعة" : "A Service That Builds Trust Quickly"}
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 720, color: "#64748b", fontSize: 17 }}>
              {isAr ? "أرقام تعكس تجربتنا وقدرتنا على التنفيذ الاحترافي لمختلف الأنشطة التجارية." : "Numbers that reflect our experience and ability to professionally execute for various businesses."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }} className="stats-grid-responsive">
            {metrics.map((m: any, i: number) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 22, padding: 24, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", textAlign: "center" }}>
                <strong style={{ display: "block", fontSize: 34, lineHeight: 1.1, marginBottom: 8, color: "#0f172a" }}>{m.strong}</strong>
                <span style={{ color: "#64748b", fontSize: 14, fontWeight: 700 }}>{isAr ? m.spanAr : m.spanEn}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sub-Services (What We Offer) ── */}
      {subServices.length > 0 && (
        <section style={{ padding: "88px 0", background: "linear-gradient(180deg,#fff,#f8fbff)" }} id="services-section">
          <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
            <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
              <div>
                <span style={{ display: "inline-flex", background: "#fff1e9", color: "#9a4f22", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                  {isAr ? "ما الذي نقدمه" : "What We Offer"}
                </span>
                <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                  {isAr ? `خدمات ${service.title} بشكل منظم وواضح` : `${service.titleEn || service.title} Services – Organized & Clear`}
                </h2>
              </div>
              <p style={{ margin: 0, maxWidth: 720, color: "#64748b", fontSize: 17 }}>
                {isAr ? "نقدم مجموعة متكاملة من الخدمات الفرعية لتغطية كل جانب من جوانب احتياجاتك." : "We offer a comprehensive set of sub-services to cover every aspect of your needs."}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="services-grid-responsive">
              {subServices.map((s: any, i: number) => (
                <article key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 26, transition: "0.25s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-5px)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#dbeafe,#e0f2fe)", color: "#2563eb", fontSize: 28, marginBottom: 16 }}>{s.icon}</div>
                  <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{s.title}</h3>
                  <p style={{ margin: "0 0 16px", color: "#64748b" }}>{s.desc}</p>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10, color: "#334155", fontWeight: 700, fontSize: 14 }}>
                    {s.features.map((f: string, fi: number) => (
                      <li key={fi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#16a34a", fontWeight: 900 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Full Description (if no sub-services) ── */}
      {subServices.length === 0 && fullDesc && (
        <section style={{ padding: "88px 0", background: "linear-gradient(180deg,#fff,#f8fbff)" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40, alignItems: "start" }} className="hero-grid-responsive">
              <div>
                <span style={{ display: "inline-flex", background: "#fff1e9", color: "#9a4f22", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 18 }}>
                  {isAr ? "تفاصيل الخدمة" : "Service Details"}
                </span>
                <h2 style={{ margin: "0 0 18px", fontSize: "clamp(28px,3vw,40px)", fontWeight: 800, lineHeight: 1.2 }}>{title}</h2>
                {fullDesc.split("\n").map((para, i) => para.trim() && (
                  <p key={i} style={{ color: "#64748b", marginBottom: 16 }}>{para}</p>
                ))}
              </div>
              <div>
                {features.length > 0 && (
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, padding: 26, boxShadow: "0 20px 50px rgba(15,23,42,0.08)" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 800 }}>{isAr ? "ما يشمله" : "What's Included"}</h3>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
                      {features.map((f: any, i: number) => (
                        <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "#334155", fontWeight: 700 }}>
                          <span style={{ color: "#16a34a", fontWeight: 900 }}>✓</span>
                          {typeof f === "string" ? f : (isAr ? f.ar : f.en)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Benefits (Why Softlix) ── */}
      <section style={{ padding: "88px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                {isAr ? "لماذا Softlix" : "Why Softlix"}
              </span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "ما الذي يميز أسلوبنا في التنفيذ" : "What Sets Our Execution Style Apart"}
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 720, color: "#64748b", fontSize: 17 }}>
              {isAr ? "نوضح القيمة الفعلية التي يحصل عليها العميل من العمل معنا، وليس مجرد سرد الخدمات." : "We show the real value clients get from working with us, not just listing services."}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="features-grid-responsive">
            {benefits.map((b: any, i: number) => (
              <article key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 26, transition: "0.25s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                <div style={{ width: 64, height: 64, borderRadius: 20, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#dbeafe,#e0f2fe)", fontSize: 28, marginBottom: 16 }}>{b.icon}</div>
                <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800 }}>{b.title}</h3>
                <p style={{ margin: 0, color: "#64748b" }}>{b.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technologies ── */}
      {(technologies.length > 0 || (techGroups && techGroups.length > 0)) && (
        <section style={{ padding: "88px 0", background: "linear-gradient(180deg,#fff,#f8fbff)" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <span style={{ display: "inline-flex", background: theme.chipBg, color: theme.chipColor, padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                {isAr ? "التقنيات" : "Technologies"}
              </span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "تقنيات نعتمدها في تنفيذ مشاريعنا" : "Technologies We Use in Our Projects"}
              </h2>
              <p style={{ margin: "0 auto", maxWidth: 640, color: "#64748b", fontSize: 16 }}>
                {isAr ? "نختار التقنية المناسبة وفقاً لطبيعة المشروع وحجم التوسع المتوقع." : "We choose the right technology based on project nature and expected scale."}
              </p>
            </div>

            {techGroups && techGroups.length > 0 ? (
              /* Grouped technologies (web-development) */
              <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #e2e8f0", borderRadius: 28, padding: 28, boxShadow: "0 20px 50px rgba(15,23,42,0.07)" }}>
                {techGroups.map((grp: any, gi: number) => (
                  <div key={gi} style={{ marginBottom: gi < techGroups.length - 1 ? 28 : 0 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 800, color: theme.eyebrowColor, textAlign: "center" }}>{grp.group}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
                      {grp.items.map((t: any, ti: number) => (
                        <div key={ti} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "14px 18px", textAlign: "center", minWidth: 100, boxShadow: "0 8px 24px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.chipBg, color: theme.chipColor, fontWeight: 900, display: "grid", placeItems: "center", fontSize: 13 }}>{t.badge}</div>
                          <strong style={{ fontSize: 14, color: "#0f172a" }}>{t.label}</strong>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>{t.sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Flat technologies */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="features-grid-responsive">
                {technologies.map((t: any, i: number) => (
                  <article key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 26, transition: "0.25s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-5px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", background: theme.chipBg, color: theme.chipColor, fontWeight: 900, marginBottom: 14, fontSize: 20 }}>{t.icon || t.label[0]}</div>
                    <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800 }}>{t.label}</h3>
                    <p style={{ margin: 0, color: "#64748b" }}>{t.desc}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Related Projects ── */}
      <section id="projects-section" style={{ padding: "88px 0", background: relatedProjects.length > 0 ? "linear-gradient(135deg,#fff7f3,#ffffff 55%,#f4fbff)" : "transparent" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-flex", background: "#fff1e9", color: "#9a4f22", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                {isAr ? "مشاريع مرتبطة" : "Related Projects"}
              </span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "نماذج من أعمالنا في هذا المجال" : "Samples from Our Work in This Field"}
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 720, color: "#64748b", fontSize: 17 }}>
              {isAr ? "أعمال حقيقية تعكس مستوى التنفيذ وتنوع الحلول التي نقدمها للعملاء." : "Real work that reflects our execution quality and variety of solutions we provide."}
            </p>
          </div>

          {relatedProjects.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="projects-grid-responsive">
              {relatedProjects.map((project, i) => (
                <a key={project.id} href={`/projects/${project.slug}`} style={{ textDecoration: "none" }} data-testid={`card-project-${project.id}`}>
                  <article style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", overflow: "hidden", transition: "0.25s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-5px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                    <div style={{ height: 240, padding: 22, position: "relative", background: project.thumbnailUrl ? undefined : PROJECT_COLORS[i % PROJECT_COLORS.length], color: "#fff", display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16 }}>
                      {project.thumbnailUrl && <img src={project.thumbnailUrl} alt={project.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                      {!project.thumbnailUrl && <>
                        <span style={{ position: "absolute", top: 18, insetInlineEnd: 18, background: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "8px 12px", fontSize: 13, fontWeight: 800 }}>
                          {project.category || "App"}
                        </span>
                        <div style={{ zIndex: 2 }}>
                          <h3 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>{isAr ? project.title : (project.titleEn || project.title)}</h3>
                          <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", fontSize: 14 }}>{project.clientName || ""}</p>
                        </div>
                        <div style={{ width: 112, height: 182, borderRadius: 24, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", flexShrink: 0 }} />
                      </>}
                    </div>
                    <div style={{ padding: 24 }}>
                      {project.thumbnailUrl && <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{isAr ? project.title : (project.titleEn || project.title)}</h3>}
                      <p style={{ margin: "0 0 16px", color: "#64748b" }}>{isAr ? project.description : (project.descriptionEn || project.description)}</p>
                      {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                          {(project.technologies as string[]).slice(0, 3).map((t, ti) => (
                            <span key={ti} style={{ padding: "8px 12px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontSize: 13, fontWeight: 800 }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
              <p>{isAr ? "سيتم إضافة مشاريع قريباً" : "Projects will be added soon"}</p>
            </div>
          )}

          {relatedProjects.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <a href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 28px", fontSize: 15, fontWeight: 700, background: "#fff", color: "#0f172a", border: "1px solid rgba(15,23,42,0.1)", textDecoration: "none" }}>
                {isAr ? "عرض جميع المشاريع" : "View All Projects"}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Process ── */}
      <section style={{ padding: "88px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                {isAr ? "كيف نعمل" : "How We Work"}
              </span>
              <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isAr ? "رحلة التنفيذ من الفكرة إلى الإطلاق" : "Execution Journey from Idea to Launch"}
              </h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="process-grid-responsive">
            {PROCESS_STEPS.map((step, i) => (
              <article key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 22, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: 44, lineHeight: 1, fontWeight: 900, color: "rgba(37,99,235,0.12)", marginBottom: 10 }}>{step.num}</div>
                <h3 style={{ margin: "0 0 10px", fontSize: 21, fontWeight: 800 }}>{isAr ? step.titleAr : step.titleEn}</h3>
                <p style={{ margin: 0, color: "#64748b" }}>{isAr ? step.descAr : step.descEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "88px 0", background: "linear-gradient(180deg,#fff,#f8fbff)" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
              {isAr ? "آراء العملاء" : "Client Testimonials"}
            </span>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px,3vw,40px)", lineHeight: 1.2, fontWeight: 800 }}>
              {isAr ? "انطباع يعزز الموثوقية" : "Impressions That Build Trust"}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="testimonials-grid-responsive">
            {TESTIMONIALS.map((t, i) => (
              <article key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 28, transition: "0.25s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                <div style={{ color: "#f59e0b", fontSize: 18, letterSpacing: 2, marginBottom: 14 }}>{"★".repeat(t.stars)}</div>
                <p style={{ margin: "0 0 18px", color: "#334155", fontSize: 16 }}>{isAr ? t.quoteAr : t.quoteEn}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <strong style={{ display: "block", fontSize: 15 }}>{isAr ? t.nameAr : t.nameEn}</strong>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{isAr ? t.roleAr : t.roleEn}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Box ── */}
      <section style={{ padding: "0 0 88px" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ background: theme.ctaBg, color: ctaTextColor, borderRadius: 34, padding: 42, display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 24, alignItems: "center", position: "relative", overflow: "hidden", boxShadow: theme.ctaDark ? "0 30px 70px rgba(15,23,42,0.13)" : "0 20px 50px rgba(229,146,105,0.14)", border: theme.ctaDark ? "none" : "1px solid rgba(229,146,105,0.18)" }} className="cta-grid-responsive">
            {theme.ctaDark && <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.08)", left: -70, bottom: -110 }} />}
            {theme.ctaDark && <div style={{ position: "absolute", width: 190, height: 190, borderRadius: "50%", background: "rgba(255,255,255,0.08)", right: -60, top: -70 }} />}
            <div style={{ position: "relative" }}>
              <h2 style={{ margin: "0 0 12px", fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.2, fontWeight: 800 }}>
                {isConsulting
                  ? (isAr ? "هل لديك مشروع يحتاج إلى رؤية تقنية واضحة؟" : "Do you have a project that needs a clear technical vision?")
                  : isWebDev
                  ? (isAr ? "هل لديك فكرة منصة أو نظام ويب تريد تنفيذها احترافياً؟" : "Have a web platform or system idea you want to build professionally?")
                  : isContent
                  ? (isAr ? "هل تريد إدارة موقعك الإلكتروني باحتراف ومحتوى يعكس قيمتك؟" : "Want to manage your website professionally with content that reflects your value?")
                  : (isAr ? "جاهز لتحويل فكرتك إلى واقع رقمي احترافي؟" : "Ready to Turn Your Idea into a Professional Digital Reality?")}
              </h2>
              <p style={{ margin: 0, color: ctaSubColor, fontSize: 17 }}>
                {isConsulting
                  ? (isAr ? "سواء كان لديك نظام قائم يحتاج إلى تطوير، أو فكرة جديدة تريد تقييمها، سنساعدك في اتخاذ القرار الصحيح." : "Whether you have an existing system to develop, or a new idea to evaluate, we'll help you make the right decision.")
                  : isWebDev
                  ? (isAr ? "سواء كنت تحتاج متجر إلكتروني، نظام ERP، لوحة تحكم، أو منصة ويب مخصصة، سنحوّل فكرتك إلى منتج رقمي فعلي بجودة عالية." : "Whether you need an e-commerce store, ERP system, dashboard, or custom web platform, we'll turn your idea into a real digital product.")
                  : isContent
                  ? (isAr ? "دع فريق Softlix يتولى كتابة المحتوى، إدارة الصفحات، تحديث الموقع، وتحسين الظهور الرقمي ليكون موقعك أمام العملاء دائماً." : "Let the Softlix team handle content writing, page management, site updates, and digital visibility so your site is always in front of customers.")
                  : (isAr ? "ابدأ معنا بخطة واضحة وتصميم يعكس قيمة مشروعك." : "Start with a clear plan and design that reflects your project's value.")}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start", gap: 14, flexWrap: "wrap", position: "relative" }}>
              <a href="#contact-section" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 800, background: theme.checkBg, color: "#fff", boxShadow: `0 14px 28px ${theme.shadowColor}`, textDecoration: "none", border: 0 }}>
                {isAr ? (isConsulting ? "احصل على استشارة مجانية" : isWebDev ? "ابدأ مشروعك الآن" : isMarketing ? "اطلب استشارة الآن" : isContent ? "اطلب الخدمة الآن" : "اطلب عرض سعر") : (isConsulting ? "Get Free Consultation" : isWebDev ? "Start Your Project" : isMarketing ? "Request Consultation" : isContent ? "Request Service Now" : "Request a Quote")}
              </a>
              <a href="/services" style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 24px", fontSize: 15, fontWeight: 700, background: theme.ctaDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)", color: theme.ctaDark ? "#fff" : "#374151", border: `1px solid ${theme.ctaDark ? "rgba(255,255,255,0.2)" : "rgba(229,146,105,0.25)"}`, textDecoration: "none" }}>
                {isAr ? "استكشف الخدمات" : "Explore Services"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Form ── */}
      <section id="contact-section" style={{ padding: "88px 0" }}>
        <div style={{ width: "min(1200px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 24 }} className="contact-grid-responsive">
            {/* Info */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 28 }}>
              <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 18 }}>
                {isAr ? "تواصل معنا" : "Contact Us"}
              </span>
              <h3 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 800 }}>{isAr ? "دعنا نناقش مشروعك" : "Let's Discuss Your Project"}</h3>
              <p style={{ margin: "0 0 24px", color: "#64748b" }}>
                {isAr ? `اطلب خدمة ${service.title} وسيتواصل معك فريقنا المتخصص في أقرب وقت.` : `Request ${service.titleEn || service.title} and our team will contact you soon.`}
              </p>
              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { icon: "📞", titleAr: "رقم الهاتف", titleEn: "Phone", value: "0537861534", href: "tel:0537861534" },
                  { icon: "✉️", titleAr: "البريد الإلكتروني", titleEn: "Email", value: "info@softlix.net", href: "mailto:info@softlix.net" },
                  { icon: "📍", titleAr: "الموقع", titleEn: "Location", value: isAr ? "جدة، المملكة العربية السعودية" : "Jeddah, Saudi Arabia", href: undefined },
                  { icon: "⏰", titleAr: "أوقات العمل", titleEn: "Working Hours", value: isAr ? "السبت - الخميس | 9:00 ص - 6:00 م" : "Sat - Thu | 9:00 AM - 6:00 PM", href: undefined },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "start", padding: 16, borderRadius: 18, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: theme.contactIconBg, fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <strong style={{ display: "block", marginBottom: 4, fontSize: 15 }}>{isAr ? item.titleAr : item.titleEn}</strong>
                      {item.href ? <a href={item.href} style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>{item.value}</a> : <span style={{ color: "#64748b", fontSize: 14 }}>{item.value}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, boxShadow: "0 20px 50px rgba(15,23,42,0.08)", padding: 28 }}>
              <span style={{ display: "inline-flex", background: "#e0f2fe", color: "#0c4a6e", padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 18 }}>
                {isAr ? "نموذج الطلب" : "Request Form"}
              </span>
              <form onSubmit={handleSubmit(data => leadMutation.mutate(data))} style={{ display: "grid", gap: 16 }} data-testid="form-service-request">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="grid-2-responsive">
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "الاسم الكامل *" : "Full Name *"}</label>
                    <input {...register("name", { required: true })} type="text" placeholder={isAr ? "اكتب اسمك" : "Your name"} style={{ border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="input-name" />
                    {errors.name && <span style={{ color: "#ef4444", fontSize: 13 }}>{isAr ? "الاسم مطلوب" : "Name is required"}</span>}
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "اسم الشركة" : "Company"}</label>
                    <input {...register("company")} type="text" placeholder={isAr ? "اسم الشركة" : "Company name"} style={{ border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="input-company" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="grid-2-responsive">
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "البريد الإلكتروني *" : "Email *"}</label>
                    <input {...register("email", { required: true })} type="email" placeholder="name@example.com" style={{ border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="input-email" />
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "رقم الهاتف" : "Phone"}</label>
                    <input {...register("phone")} type="tel" placeholder="05xxxxxxxx" style={{ border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none" }} data-testid="input-phone" />
                  </div>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>{isAr ? "تفاصيل طلبك *" : "Request Details *"}</label>
                  <textarea {...register("message")} placeholder={isAr ? `صِف ما تحتاجه من خدمة ${service.title}...` : `Describe what you need from ${service.titleEn || service.title}...`} style={{ border: "1px solid #dbe3ee", background: "#fff", borderRadius: 16, padding: "15px 16px", fontFamily: "inherit", fontSize: 15, color: "#0f172a", outline: "none", minHeight: 150, resize: "vertical" }} data-testid="textarea-message" />
                </div>
                <div style={{ background: "#eff6ff", borderRadius: 16, padding: "14px 16px", fontSize: 14, color: "#1d4ed8", fontWeight: 700 }}>
                  ✅ {isAr ? "سيتم التواصل معك خلال 24 ساعة عمل — معلوماتك محفوظة وخاصة" : "We will contact you within 24 business hours — your info is safe and private"}
                </div>
                <div>
                  <button type="submit" disabled={leadMutation.isPending} style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer", background: theme.checkBg, color: "#fff", boxShadow: `0 14px 28px ${theme.shadowColor}`, border: 0, opacity: leadMutation.isPending ? 0.7 : 1 }} data-testid="btn-submit-request">
                    {leadMutation.isPending ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "إرسال الطلب" : "Send Request")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
