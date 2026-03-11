import { Link } from "wouter";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Target, Eye, Users2, Lightbulb, Award, Globe } from "lucide-react";

const TIMELINE = [
  { year: "2016 - 2017", titleAr: "التأسيس", titleEn: "Founded", descAr: "تأسست سوفتلكس برؤية لتحويل الأفكار إلى واقع رقمي في المملكة العربية السعودية", descEn: "Softlix was founded with a vision to transform ideas into digital reality in Saudi Arabia" },
  { year: "2018 - 2019", titleAr: "التوسع", titleEn: "Expansion", descAr: "توسعنا لنقدم خدمات أشمل وشراكات استراتيجية مع عملاء في مختلف القطاعات", descEn: "We expanded to offer more comprehensive services and strategic partnerships across various sectors" },
  { year: "2020 - 2021", titleAr: "النمو والتطور", titleEn: "Growth & Innovation", descAr: "تطورنا لنواكب التحولات الرقمية وأضفنا خدمات التسويق الرقمي وإدارة الحسابات", descEn: "We evolved to keep up with digital transformations and added digital marketing and account management services" },
  { year: "2022 - 2024", titleAr: "الريادة", titleEn: "Leadership", descAr: "أصبحنا من الشركات الرائدة في المملكة بأكثر من 200 مشروع منجز و150 عميل", descEn: "We became one of the leading companies in the Kingdom with 200+ completed projects and 150+ clients" },
];

const VALUES = [
  { icon: Target, titleAr: "الدقة", titleEn: "Precision", descAr: "نلتزم بأعلى معايير الجودة في كل مشروع ننجزه", descEn: "We commit to the highest quality standards in every project we complete" },
  { icon: Lightbulb, titleAr: "الابتكار", titleEn: "Innovation", descAr: "نبحث دائماً عن حلول إبداعية وتقنيات حديثة", descEn: "We always seek creative solutions and modern technologies" },
  { icon: Users2, titleAr: "الشراكة", titleEn: "Partnership", descAr: "نتعامل مع عملائنا كشركاء نحقق معهم النجاح", descEn: "We treat our clients as partners with whom we achieve success" },
  { icon: Globe, titleAr: "الطموح", titleEn: "Ambition", descAr: "نطمح لنكون شريكاً تقنياً على المستوى العالمي", descEn: "We aspire to be a global technology partner" },
];

interface AboutProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

export default function PublicAbout({ lang = "ar", onLangChange }: AboutProps) {
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* Page Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-600/30 text-sm">{isAr ? "من نحن" : "About Us"}</Badge>
          <h1 className="text-5xl font-black mb-5">{isAr ? "قصة سوفتلكس" : "The Softlix Story"}</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {isAr
              ? "شركة تقنية معلومات سعودية تأسست بشغف وتطورت بتميز لتكون شريكك الرقمي الموثوق"
              : "A Saudi information technology company founded with passion and evolved with distinction to be your trusted digital partner"}
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{isAr ? "رؤيتنا" : "Our Vision"}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mb-8">
                {isAr
                  ? "نسعى دائمًا لنكون على مستوى توقعات عملائنا وأن نقدم مواقع ويب عالية المستوى وتطبيقات للهاتف مصممة بطريقة فريدة وجذابة. نتطلع إلى أن تكون سوفتلكس الشركة الرائدة ليس فقط في المملكة العربية السعودية، بل أن تكوّن شراكات مع شركات عالمية في جميع أنحاء العالم."
                  : "We always strive to meet our clients' expectations and deliver high-level websites and mobile applications designed in a unique and attractive way. We look forward to Softlix being the leading company not only in Saudi Arabia, but to establish partnerships with global companies around the world."}
              </p>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{isAr ? "رسالتنا" : "Our Mission"}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {isAr
                  ? "\"وحدنا يمكننا أن نفعل القليل، معاً يمكننا أن نفعل الكثير\" - نعتقد أن نجاحنا يأتي من نجاح عملائنا، ونموهم يضيف إلى قصة نجاحنا. هذا هو السبب في أننا ملتزمون بتقديم الحلول الأكثر كفاءة والأكثر تقدمًا من الناحية التكنولوجية في أقصر وقت ممكن دون المساس بالجودة."
                  : "\"Alone we can do so little; together we can do so much\" - We believe our success comes from our clients' success, and their growth adds to our success story. That's why we are committed to delivering the most efficient and technologically advanced solutions in the shortest possible time without compromising quality."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "200+", labelAr: "مشروع منجز", labelEn: "Completed Projects", color: "blue" },
                { num: "150+", labelAr: "عميل سعيد", labelEn: "Happy Clients", color: "purple" },
                { num: "8+", labelAr: "سنوات خبرة", labelEn: "Years Experience", color: "green" },
                { num: "24/7", labelAr: "دعم فني", labelEn: "Technical Support", color: "orange" },
              ].map((stat, i) => (
                <div key={i} className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl p-6 text-center`}>
                  <div className={`text-4xl font-black text-${stat.color}-600 dark:text-${stat.color}-400 mb-2`}>{stat.num}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{isAr ? stat.labelAr : stat.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0">{isAr ? "مسيرتنا" : "Our Journey"}</Badge>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">{isAr ? "تاريخنا" : "Our History"}</h2>
          </div>
          <div className="space-y-8 relative">
            <div className="absolute inset-y-0 right-6 w-px bg-blue-100 dark:bg-blue-900/30 hidden md:block" />
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="hidden md:flex w-12 h-12 rounded-full bg-blue-600 text-white items-center justify-center font-bold flex-shrink-0 z-10">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 block">{item.year}</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{isAr ? item.titleAr : item.titleEn}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{isAr ? item.descAr : item.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{isAr ? "قيمنا" : "Our Values"}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => {
              const Icon = val.icon;
              return (
                <div key={i} className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{isAr ? val.titleAr : val.titleEn}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{isAr ? val.descAr : val.descEn}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">{isAr ? "هل أنت مستعد للعمل معنا؟" : "Ready to Work With Us?"}</h2>
          <p className="text-blue-100 mb-8">{isAr ? "تواصل معنا ونبدأ رحلة النجاح معاً" : "Contact us and let's start the journey of success together"}</p>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
            <Link href="/contact">{isAr ? "تواصل معنا" : "Contact Us"} <Arrow className="w-4 h-4 mx-2" /></Link>
          </Button>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
