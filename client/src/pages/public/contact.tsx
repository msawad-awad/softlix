import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Clock, CheckCircle2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SiWhatsapp } from "react-icons/si";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

interface ContactProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

export default function PublicContact({ lang = "ar", onLangChange }: ContactProps) {
  const isAr = lang === "ar";
  useSEO({
    title: isAr ? "تواصل معنا" : "Contact Us",
    description: isAr
      ? "تواصل مع فريق Softlix لمناقشة مشروعك. نحن في جدة، المملكة العربية السعودية - متاحون السبت إلى الخميس."
      : "Contact the Softlix team to discuss your project. We're in Jeddah, Saudi Arabia - available Saturday to Thursday.",
  });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", budget: "", message: "" });

  const { data: settings } = useQuery<any>({ queryKey: ["/api/public/site-settings"] });

  const phone = settings?.contactPhone || "0537861534";
  const email = settings?.contactEmail || "info@softlix.net";
  const addressAr = settings?.contactAddressAr || "مبنى الامتياز، حي الصفا، طريق الحرمين، المملكة العربية السعودية";
  const addressEn = settings?.contactAddressEn || "Al Imtiyaz Building, Al Safa, Haramain Road, Saudi Arabia";
  const workingHoursAr = settings?.contactHoursAr || "السبت - الخميس: 9ص - 6م (UTC+3)";
  const workingHoursEn = settings?.contactHoursEn || "Sat - Thu: 9AM - 6PM (UTC+3)";
  const whatsappUrl = settings?.socialWhatsapp || "https://wa.me/966537861534";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast({ title: isAr ? "حدث خطأ" : "Error", description: isAr ? "الاسم ورقم الهاتف مطلوبان" : "Name and phone are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/lead-capture${TENANT_ID ? `?tenantId=${TENANT_ID}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formType: "contact", pageSource: "/contact", tenantId: TENANT_ID }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast({ title: isAr ? "تم الإرسال بنجاح!" : "Sent Successfully!", description: isAr ? "سنتواصل معك قريباً" : "We'll contact you soon" });
      } else {
        throw new Error("Failed");
      }
    } catch {
      toast({ title: isAr ? "حدث خطأ" : "Error", description: isAr ? "حاول مرة أخرى" : "Please try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-600/30">{isAr ? "نحن هنا" : "We're Here"}</Badge>
          <h1 className="text-5xl font-black mb-5">{isAr ? "تواصل معنا" : "Contact Us"}</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {isAr ? "يسعد سوفتلكس دائماً مساعدة عملائنا. سواء كنت عميلاً أو لا، سنبذل قصارى جهدنا لمساعدتك" : "Softlix is always happy to help our clients. Whether you're a client or not, we'll do our best to help you"}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{isAr ? "معلومات التواصل" : "Contact Information"}</h2>
                <div className="space-y-5">
                  {[
                    { icon: Phone, labelAr: "الهاتف", labelEn: "Phone", value: phone, href: `tel:${phone}` },
                    { icon: Mail, labelAr: "البريد الإلكتروني", labelEn: "Email", value: email, href: `mailto:${email}` },
                    { icon: MapPin, labelAr: "العنوان", labelEn: "Address", value: isAr ? addressAr : addressEn, href: null },
                    { icon: Clock, labelAr: "ساعات العمل", labelEn: "Working Hours", value: isAr ? workingHoursAr : workingHoursEn, href: null },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{isAr ? item.labelAr : item.labelEn}</p>
                          {item.href ? (
                            <a href={item.href} className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors">{item.value}</a>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <SiWhatsapp className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-800 dark:text-green-300">{isAr ? "واتساب" : "WhatsApp"}</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400 mb-3">{isAr ? "تواصل معنا مباشرة عبر واتساب" : "Contact us directly via WhatsApp"}</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <SiWhatsapp className="w-4 h-4" />
                  {isAr ? "ابدأ محادثة" : "Start Chat"}
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-12 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{isAr ? "تم إرسال رسالتك بنجاح!" : "Your message was sent successfully!"}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{isAr ? "سنتواصل معك في أقرب وقت ممكن خلال ساعات العمل" : "We'll contact you as soon as possible during working hours"}</p>
                  <Button className="mt-6" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", budget: "", message: "" }); }}>
                    {isAr ? "إرسال رسالة جديدة" : "Send New Message"}
                  </Button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{isAr ? "أرسل لنا رسالة" : "Send Us a Message"}</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          {isAr ? "الاسم *" : "Name *"}
                        </Label>
                        <Input id="name" data-testid="input-name" placeholder={isAr ? "اسمك الكريم" : "Your name"} value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-11" required />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          {isAr ? "رقم الهاتف *" : "Phone *"}
                        </Label>
                        <Input id="phone" data-testid="input-phone" type="tel" placeholder={isAr ? "05xxxxxxxx" : "05xxxxxxxx"} value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-11" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        {isAr ? "البريد الإلكتروني" : "Email"}
                      </Label>
                      <Input id="email" data-testid="input-email" type="email" placeholder={isAr ? "بريدك الإلكتروني" : "Your email"} value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-11" />
                    </div>
                    <div>
                      <Label htmlFor="budget" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        {isAr ? "الميزانية" : "Budget"}
                      </Label>
                      <Select value={form.budget} onValueChange={v => setForm(f => ({ ...f, budget: v }))}>
                        <SelectTrigger id="budget" data-testid="select-budget" className="h-11">
                          <SelectValue placeholder={isAr ? "اختر الميزانية" : "Select budget"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1000">+1,000 {isAr ? "ريال" : "SAR"}</SelectItem>
                          <SelectItem value="+4000">+4,000 {isAr ? "ريال" : "SAR"}</SelectItem>
                          <SelectItem value="+10000">+10,000 {isAr ? "ريال" : "SAR"}</SelectItem>
                          <SelectItem value="+25000">+25,000 {isAr ? "ريال" : "SAR"}</SelectItem>
                          <SelectItem value="+50000">+50,000 {isAr ? "ريال" : "SAR"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        {isAr ? "صف فكرتك أو مشروعك" : "Describe Your Idea or Project"}
                      </Label>
                      <Textarea id="message" data-testid="input-message" placeholder={isAr ? "اشرح لنا مشروعك بالتفصيل..." : "Tell us about your project in detail..."} value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} className="resize-none" />
                    </div>
                    <Button type="submit" data-testid="btn-submit-contact" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base" disabled={submitting}>
                      {submitting ? (isAr ? "جاري الإرسال..." : "Sending...") : (
                        <><Send className="w-4 h-4 mx-2" /> {isAr ? "إرسال الرسالة" : "Send Message"}</>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}
