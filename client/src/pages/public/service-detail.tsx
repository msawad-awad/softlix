import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Smartphone, Globe, Server, TrendingUp,
  Palette, FileText, ShoppingCart, LayoutDashboard, Lightbulb, ExternalLink,
  Phone, Mail, Send, Star, Code2, Loader2
} from "lucide-react";
import type { Service, Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const ICON_MAP: Record<string, any> = {
  Smartphone, Globe, Server, TrendingUp, Palette, FileText,
  ShoppingCart, LayoutDashboard, Lightbulb, Code2, Star
};

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

const requestSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(9, "رقم الجوال مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  message: z.string().min(10, "يرجى وصف طلبك (10 أحرف على الأقل)"),
});

type RequestForm = z.infer<typeof requestSchema>;

interface ServiceDetailProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

export default function ServiceDetail({ lang = "ar", onLangChange }: ServiceDetailProps) {
  const [, params] = useRoute("/services/:slug");
  const slug = params?.slug || "";
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const { toast } = useToast();

  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ["/api/public/services", slug],
  });

  const relatedCategory = CATEGORY_MAP[slug] || slug;
  const { data: allProjects } = useQuery<Project[]>({
    queryKey: ["/api/public/projects"],
  });

  const relatedProjects = (allProjects || []).filter(
    (p) => p.category === relatedCategory || p.category === slug
  ).slice(0, 3);

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { name: "", phone: "", email: "", message: "" },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: RequestForm) => {
      return apiRequest("POST", "/api/public/leads", {
        ...data,
        formType: "service-request",
        pageSource: `/services/${slug}`,
        serviceSlug: slug,
      });
    },
    onSuccess: () => {
      toast({
        title: isAr ? "تم الإرسال بنجاح!" : "Sent Successfully!",
        description: isAr
          ? "سيتواصل معك فريقنا في أقرب وقت"
          : "Our team will contact you as soon as possible",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: isAr ? "حدث خطأ" : "Error",
        description: isAr ? "يرجى المحاولة مجدداً" : "Please try again",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
        <PublicNavbar lang={lang} onLangChange={onLangChange} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <PublicFooter lang={lang} />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
        <PublicNavbar lang={lang} onLangChange={onLangChange} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            {isAr ? "الخدمة غير موجودة" : "Service Not Found"}
          </h1>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/services">{isAr ? "عودة للخدمات" : "Back to Services"}</Link>
          </Button>
        </div>
        <PublicFooter lang={lang} />
      </div>
    );
  }

  const title = isAr ? service.title : (service.titleEn || service.title);
  const shortDesc = isAr ? service.shortDescription : (service.shortDescriptionEn || service.shortDescription);
  const fullDesc = isAr ? service.fullDescription : (service.fullDescriptionEn || service.fullDescription);
  const features: string[] = Array.isArray(service.features) ? service.features : [];
  const IconComp = ICON_MAP[service.iconName || "Globe"] || Globe;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* Breadcrumb */}
      <div className="pt-20 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-blue-600 transition-colors">{isAr ? "الخدمات" : "Services"}</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.03]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-5 bg-blue-500/20 text-blue-300 border-blue-500/30 text-sm">
                {isAr ? "خدمة متخصصة" : "Specialized Service"}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black mb-5 leading-tight">{title}</h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">{shortDesc}</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" })}
                  data-testid="button-request-service-hero"
                >
                  {isAr ? "اطلب الخدمة الآن" : "Request Service Now"}
                  <Arrow className="w-4 h-4 mx-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <a href="tel:+966500000000">
                    <Phone className="w-4 h-4 mx-2" />
                    {isAr ? "اتصل بنا" : "Call Us"}
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <IconComp className="w-24 h-24 text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Description */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-5">
                {isAr ? "تفاصيل الخدمة" : "Service Details"}
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {fullDesc?.split("\n").map((para, i) => para.trim() && (
                  <p key={i} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{para}</p>
                ))}
              </div>

              {features.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {isAr ? "ما يشمله" : "What's Included"}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {features.map((feat: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {typeof feat === "string" ? feat : (isAr ? feat.ar : feat.en)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Quick Contact Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-3">
                  {isAr ? "تحتاج مساعدة؟" : "Need Help?"}
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  {isAr ? "فريقنا متاح لمساعدتك في الاختيار والتخطيط" : "Our team is available to help you choose and plan"}
                </p>
                <div className="space-y-2">
                  <a href="tel:+966500000000" className="flex items-center gap-2 text-sm hover:text-blue-200 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span dir="ltr">+966 50 000 0000</span>
                  </a>
                  <a href="mailto:info@softlix.net" className="flex items-center gap-2 text-sm hover:text-blue-200 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>info@softlix.net</span>
                  </a>
                </div>
              </div>

              {/* Why Us */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {isAr ? "لماذا سوفتلكس؟" : "Why Softlix?"}
                </h3>
                <ul className="space-y-3">
                  {[
                    { ar: "خبرة أكثر من 5 سنوات", en: "5+ years of experience" },
                    { ar: "فريق متخصص ومحترف", en: "Specialized professional team" },
                    { ar: "دعم فني مستمر", en: "Continuous technical support" },
                    { ar: "أسعار تنافسية", en: "Competitive pricing" },
                    { ar: "التزام بالمواعيد", en: "On-time delivery" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {isAr ? item.ar : item.en}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                {isAr ? "نماذج من أعمالنا" : "Work Samples"}
              </Badge>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                {isAr ? "مشاريع نفذناها في هذا المجال" : "Projects We Delivered in This Field"}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                  data-testid={`card-project-${project.id}`}
                >
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <IconComp className="w-16 h-16 text-white/40" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {isAr ? project.title : (project.titleEn || project.title)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {isAr ? project.description : (project.descriptionEn || project.description)}
                    </p>
                    {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(project.technologies as string[]).slice(0, 3).map((tech: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                      data-testid={`link-project-detail-${project.id}`}
                    >
                      {isAr ? "عرض التفاصيل" : "View Details"}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Link href="/projects">
                  {isAr ? "عرض كل مشاريعنا" : "View All Our Projects"}
                  <Arrow className="w-4 h-4 mx-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Request Form */}
      <section id="request-form" className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
              {isAr ? "اطلب الخدمة" : "Request Service"}
            </Badge>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
              {isAr ? `اطلب خدمة: ${title}` : `Request Service: ${title}`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isAr
                ? "أرسل لنا تفاصيل مشروعك وسيتواصل معك أحد متخصصينا خلال 24 ساعة"
                : "Send us your project details and one of our specialists will contact you within 24 hours"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))}
                className="space-y-5"
                data-testid="form-service-request"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isAr ? "الاسم الكامل *" : "Full Name *"}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isAr ? "أحمد محمد" : "John Doe"}
                            data-testid="input-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isAr ? "رقم الجوال *" : "Phone Number *"}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isAr ? "05xxxxxxxx" : "+966 5x xxx xxxx"}
                            data-testid="input-phone"
                            dir="ltr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isAr ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@domain.com"
                          data-testid="input-email"
                          dir="ltr"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isAr ? "تفاصيل طلبك *" : "Request Details *"}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={isAr
                            ? `صِف ما تحتاجه من خدمة ${title}...`
                            : `Describe what you need from ${title} service...`}
                          className="min-h-[120px]"
                          data-testid="textarea-message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                  {isAr
                    ? "✅ سيتم التواصل معك خلال 24 ساعة عمل — معلوماتك محفوظة وخاصة"
                    : "✅ We will contact you within 24 business hours — your information is safe and private"}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-request"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-2" />
                  ) : (
                    <Send className="w-4 h-4 mx-2" />
                  )}
                  {isAr ? "إرسال الطلب" : "Send Request"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {isAr ? "خدماتنا الأخرى" : "Our Other Services"}
          </h3>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/services">
              {isAr ? "عرض جميع الخدمات" : "View All Services"}
              <Arrow className="w-4 h-4 mx-2" />
            </Link>
          </Button>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
