import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Phone, Send, Calendar, ChevronDown, CheckCircle, Mail, Bell } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { MarketingSettings } from "@shared/schema";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

interface WidgetsProps {
  lang?: "ar" | "en";
  whatsappUrl?: string;
  onBookingClick?: () => void;
  settings?: MarketingSettings | null;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* FLOATING CONTACT WIDGET                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
export function FloatingContactWidget({ lang = "ar", whatsappUrl, onBookingClick, settings }: WidgetsProps) {
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const { toast } = useToast();

  const waNumber = settings?.whatsappNumber || "966537861534";
  const waMessage = settings?.whatsappMessage || "مرحباً، أود الاستفسار عن خدماتكم";
  const wa = whatsappUrl || `https://wa.me/${waNumber.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;
  const position = settings?.whatsappPosition || "bottom-right";
  const isLeft = position === "bottom-left" || (isAr && position !== "bottom-right");

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSending(true);
    try {
      await fetch(`/api/public/lead-capture${TENANT_ID ? `?tenantId=${TENANT_ID}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formType: "quick-chat", pageSource: window.location.pathname }),
      });
      setSent(true);
      toast({ title: isAr ? "تم الإرسال!" : "Sent!", description: isAr ? "سنتواصل معك قريباً" : "We'll reach out shortly" });
      setTimeout(() => { setSent(false); setShowQuickForm(false); setOpen(false); setForm({ name: "", phone: "" }); }, 3000);
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />}

      <div style={{ position: "fixed", bottom: 24, ...(isLeft ? { left: 24 } : { right: 24 }), zIndex: 9999, display: "flex", flexDirection: "column", alignItems: isLeft ? "flex-start" : "flex-end", gap: 12 }}>

        {open && (
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,.18)", overflow: "hidden", width: 320, fontFamily: "'Cairo', system-ui, sans-serif" }} dir={isAr ? "rtl" : "ltr"}>
            <div style={{ background: "linear-gradient(135deg, #1b2331, #2c3a4f)", padding: "20px 22px", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 16 }}>{isAr ? "تواصل معنا" : "Contact Us"}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 3 }}>{isAr ? "نرد خلال دقائق" : "We reply within minutes"}</p>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,.12)", border: "none", cursor: "pointer", borderRadius: 10, padding: 8, color: "#fff", display: "flex" }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 2px rgba(34,197,94,.3)" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.8)" }}>{isAr ? "متاح الآن" : "Available now"}</span>
              </div>
            </div>

            {!showQuickForm ? (
              <div style={{ padding: 16, display: "grid", gap: 10 }}>
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "#dcfce7", border: "1px solid #bbf7d0", textDecoration: "none", color: "#15803d" }}>
                  <SiWhatsapp size={22} color="#25d366" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{isAr ? "واتساب" : "WhatsApp"}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#16a34a" }}>{isAr ? "تحدث معنا الآن" : "Chat with us now"}</p>
                  </div>
                </a>
                <a href={`tel:+${waNumber.replace(/\D/g, "")}`}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "#fff7ed", border: "1px solid #fed7aa", textDecoration: "none", color: "#e05500" }}>
                  <Phone size={20} color="#ff6a00" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{isAr ? "اتصل بنا" : "Call Us"}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#ff6a00" }}>+{waNumber.replace(/\D/g, "")}</p>
                  </div>
                </a>
                <button onClick={() => setShowQuickForm(true)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e", cursor: "pointer", textAlign: isAr ? "right" : "left" }}>
                  <MessageCircle size={20} color="#f59e0b" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{isAr ? "أرسل رسالة" : "Send a Message"}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#b45309" }}>{isAr ? "سنرد عليك قريباً" : "We'll reply soon"}</p>
                  </div>
                </button>
                {onBookingClick && (
                  <button onClick={() => { onBookingClick(); setOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "#f3e8ff", border: "1px solid #e9d5ff", color: "#6b21a8", cursor: "pointer", textAlign: isAr ? "right" : "left" }}>
                    <Calendar size={20} color="#9333ea" />
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{isAr ? "احجز استشارة" : "Book a Consultation"}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#7e22ce" }}>{isAr ? "مجانية وبدون التزام" : "Free, no commitment"}</p>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleQuickSubmit} style={{ padding: 16 }}>
                <button type="button" onClick={() => setShowQuickForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <ChevronDown size={14} style={{ transform: isAr ? "rotate(90deg)" : "rotate(-90deg)" }} />
                  {isAr ? "رجوع" : "Back"}
                </button>
                {sent ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <CheckCircle size={40} color="#22c55e" style={{ marginInline: "auto" }} />
                    <p style={{ fontWeight: 800, marginTop: 10 }}>{isAr ? "تم الإرسال!" : "Sent!"}</p>
                  </div>
                ) : (
                  <>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder={isAr ? "الاسم الكريم" : "Your name"} required
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontFamily: "inherit", fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
                    <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder={isAr ? "رقم الجوال" : "Phone number"} required type="tel"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontFamily: "inherit", fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
                    <button type="submit" disabled={sending}
                      style={{ width: "100%", padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #e59269, #cb7147)", border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                      <Send size={15} />
                      {sending ? (isAr ? "جاري..." : "Sending...") : (isAr ? "إرسال" : "Send")}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        )}

        <button onClick={() => setOpen(p => !p)} data-testid="btn-floating-chat"
          style={{ width: 60, height: 60, borderRadius: "50%", background: open ? "#1b2331" : "linear-gradient(135deg, #25d366, #128c7e)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(37,211,102,.35)", transition: ".25s ease", position: "relative" }}>
          {!open && <span style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 900 }}>1</span>}
          {open ? <X size={22} color="#fff" /> : <SiWhatsapp size={24} color="#fff" />}
        </button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* EXIT INTENT POPUP                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
export function ExitIntentPopup({ lang = "ar", onBookingClick, settings }: { lang?: "ar" | "en"; onBookingClick?: () => void; settings?: MarketingSettings | null }) {
  const isAr = lang === "ar";
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const triggered = useRef(false);
  const { toast } = useToast();

  const enabled = settings?.exitIntentEnabled ?? true;
  const delay = (settings?.exitIntentDelay ?? 3) * 1000;
  const title = isAr ? (settings?.exitIntentTitleAr || "لا تغادر قبل أن تعرف هذا!") : (settings?.exitIntentTitleEn || "Don't leave before knowing this!");
  const subtitle = isAr ? (settings?.exitIntentSubtitleAr || "احصل على استشارة مجانية لمشروعك خلال 24 ساعة") : (settings?.exitIntentSubtitleEn || "Get a free consultation for your project within 24 hours");
  const btnText = isAr ? (settings?.exitIntentButtonAr || "احصل على استشارتك المجانية") : (settings?.exitIntentButtonEn || "Get Your Free Consultation");
  const btnUrl = settings?.exitIntentButtonUrl || "";

  useEffect(() => {
    if (!enabled) return;
    const dismissed = sessionStorage.getItem("exitPopupDismissed");
    if (dismissed) return;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !triggered.current) {
        triggered.current = true;
        setTimeout(() => setVisible(true), 300);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, delay);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enabled, delay]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("exitPopupDismissed", "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (btnUrl) { window.location.href = btnUrl; return; }
    if (!form.name || !form.phone) return;
    setSending(true);
    try {
      await fetch(`/api/public/lead-capture${TENANT_ID ? `?tenantId=${TENANT_ID}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formType: "exit-intent", pageSource: window.location.pathname }),
      });
      setSent(true);
      toast({ title: isAr ? "تم الإرسال!" : "Sent!" });
      setTimeout(dismiss, 3000);
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    } finally { setSending(false); }
  };

  if (!visible || !enabled) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) dismiss(); }}>
      <div style={{ background: "#fff", borderRadius: 28, maxWidth: 500, width: "100%", overflow: "hidden", fontFamily: "'Cairo', system-ui, sans-serif", animation: "popIn .35s ease" }}
        dir={isAr ? "rtl" : "ltr"}>
        <div style={{ background: "linear-gradient(135deg, #cb7147, #e59269, #f2b090)", padding: "32px 28px", textAlign: "center", position: "relative" }}>
          <button onClick={dismiss} style={{ position: "absolute", top: 14, ...(isAr ? { left: 14 } : { right: 14 }), background: "rgba(255,255,255,.2)", border: "none", cursor: "pointer", borderRadius: 10, padding: 8, color: "#fff", display: "flex" }}>
            <X size={16} />
          </button>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎁</div>
          <h2 style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1.4 }}>{title}</h2>
          <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,.92)", fontSize: 15 }}>{subtitle}</p>
        </div>
        <div style={{ padding: 28 }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <CheckCircle size={48} color="#22c55e" style={{ marginInline: "auto" }} />
              <h3 style={{ margin: "12px 0 6px", fontWeight: 900 }}>{isAr ? "تم الإرسال بنجاح!" : "Sent successfully!"}</h3>
              <p style={{ margin: 0, color: "#64748b" }}>{isAr ? "سنتواصل معك قريباً" : "We'll contact you soon"}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ margin: "0 0 20px", color: "#475569", fontSize: 14, textAlign: "center" }}>
                {isAr ? "اترك بياناتك وسيتواصل معك أحد مستشارينا خلال ساعات" : "Leave your details and one of our consultants will contact you within hours"}
              </p>
              {!btnUrl && (
                <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder={isAr ? "الاسم الكريم *" : "Your name *"} required
                    style={{ padding: "13px 16px", borderRadius: 14, border: "1.5px solid #e2e8f0", fontFamily: "inherit", fontSize: 14, outline: "none" }}
                    onFocus={e => (e.target.style.borderColor = "#e59269")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder={isAr ? "رقم الجوال *" : "Phone number *"} required type="tel"
                    style={{ padding: "13px 16px", borderRadius: 14, border: "1.5px solid #e2e8f0", fontFamily: "inherit", fontSize: 14, outline: "none" }}
                    onFocus={e => (e.target.style.borderColor = "#e59269")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              )}
              <button type="submit" disabled={sending}
                style={{ width: "100%", padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, #e59269, #cb7147)", border: "none", color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {sending ? (isAr ? "جاري..." : "Sending...") : btnText}
              </button>
              {onBookingClick && !btnUrl && (
                <button type="button" onClick={() => { onBookingClick(); dismiss(); }}
                  style={{ width: "100%", marginTop: 10, padding: "12px", borderRadius: 14, background: "none", border: "1.5px solid #e2e8f0", color: "#475569", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  {isAr ? "أو احجز موعداً مباشرة →" : "Or book an appointment directly →"}
                </button>
              )}
              <p style={{ textAlign: "center", margin: "12px 0 0", fontSize: 12, color: "#94a3b8" }}>
                {isAr ? "🔒 بياناتك محمية ولن تُشارك مع أي طرف" : "🔒 Your data is protected and won't be shared"}
              </p>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes popIn { from { opacity:0; transform:scale(.92) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* SOCIAL PROOF TOAST                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
const SOCIAL_PROOF_AR = [
  { icon: "🗓️", text: "أحمد من الرياض حجز استشارة مجانية", time: "منذ 3 دقائق" },
  { icon: "💼", text: "شركة تقنية طلبت عرض سعر لتطبيق جوال", time: "منذ 8 دقائق" },
  { icon: "🌐", text: "متجر إلكتروني جديد أُطلق عبر سوفتلكس", time: "منذ 15 دقيقة" },
  { icon: "🚀", text: "عميل من جدة بدأ مشروع ERP جديد", time: "منذ 22 دقيقة" },
  { icon: "📱", text: "سارة من الدمام طلبت عرض تطبيق iOS", time: "منذ 31 دقيقة" },
  { icon: "⭐", text: "عميل قيّم خدماتنا بـ 5 نجوم", time: "منذ 45 دقيقة" },
  { icon: "🎯", text: "محمد من القصيم حجز استشارة تسويقية", time: "منذ 52 دقيقة" },
];

const SOCIAL_PROOF_EN = [
  { icon: "🗓️", text: "Ahmed from Riyadh booked a free consultation", time: "3 minutes ago" },
  { icon: "💼", text: "A tech company requested a mobile app quote", time: "8 minutes ago" },
  { icon: "🌐", text: "New e-commerce store launched via Softlix", time: "15 minutes ago" },
  { icon: "🚀", text: "Client from Jeddah started a new ERP project", time: "22 minutes ago" },
  { icon: "📱", text: "Sara from Dammam requested iOS app quote", time: "31 minutes ago" },
  { icon: "⭐", text: "Client rated our services 5 stars", time: "45 minutes ago" },
  { icon: "🎯", text: "Mohammed from Qassim booked a marketing consultation", time: "52 minutes ago" },
];

export function SocialProofToast({ lang = "ar", settings }: { lang?: "ar" | "en"; settings?: MarketingSettings | null }) {
  const isAr = lang === "ar";
  const [toast, setToast] = useState<{ icon: string; text: string; time: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const indexRef = useRef(0);

  const enabled = settings?.socialProofEnabled ?? false;
  const intervalSec = (settings?.socialProofInterval ?? 8) * 1000;

  useEffect(() => {
    if (!enabled) return;
    const items = isAr ? SOCIAL_PROOF_AR : SOCIAL_PROOF_EN;
    const show = () => {
      const item = items[indexRef.current % items.length];
      indexRef.current++;
      setToast(item);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };
    const initial = setTimeout(show, 6000);
    const interval = setInterval(show, intervalSec + 6000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [enabled, intervalSec, isAr]);

  if (!enabled || !toast) return null;

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{
      position: "fixed", bottom: 100, ...(isAr ? { left: 24 } : { right: 24 }), zIndex: 9997,
      background: "#fff", borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,.14)", padding: "14px 18px",
      maxWidth: 300, fontFamily: "'Cairo', system-ui, sans-serif", display: "flex", alignItems: "center", gap: 12,
      border: "1px solid rgba(0,0,0,.06)",
      transform: visible ? "translateY(0)" : "translateY(20px)",
      opacity: visible ? 1 : 0,
      transition: "all .4s ease",
      pointerEvents: visible ? "auto" : "none",
    }}>
      <div style={{ fontSize: 26, flexShrink: 0 }}>{toast.icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b", lineHeight: 1.4 }}>{toast.text}</p>
        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94a3b8" }}>{toast.time}</p>
      </div>
      <button onClick={() => setVisible(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 4, flexShrink: 0, marginInlineStart: "auto" }}>
        <X size={14} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* NEWSLETTER SECTION                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
export function NewsletterSection({ lang = "ar", settings }: { lang?: "ar" | "en"; settings?: MarketingSettings | null }) {
  const isAr = lang === "ar";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  if (!settings?.newsletterEnabled) return null;

  const title = isAr ? (settings.newsletterTitleAr || "اشترك في نشرتنا البريدية") : (settings.newsletterTitleEn || "Subscribe to Our Newsletter");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      const res = await fetch("/api/public/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source: "footer" }),
      });
      const data = await res.json();
      setDone(true);
      toast({ title: data.message || (isAr ? "تم الاشتراك بنجاح!" : "Subscribed successfully!") });
      setEmail("");
      setName("");
    } catch {
      toast({ title: isAr ? "خطأ في الاشتراك" : "Subscription error", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", padding: "48px 24px", fontFamily: "'Cairo', system-ui, sans-serif", textAlign: "center" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <Mail size={24} color="#e59269" />
          <h2 style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}>{title}</h2>
        </div>
        <p style={{ margin: "0 0 28px", color: "rgba(255,255,255,.65)", fontSize: "0.95rem" }}>
          {isAr ? "ابق على اطلاع بآخر المقالات والعروض والنصائح التقنية" : "Stay updated with our latest articles, offers, and tech tips"}
        </p>
        {done ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#22c55e", fontWeight: 800, fontSize: 16 }}>
            <CheckCircle size={22} />
            {isAr ? "تم الاشتراك بنجاح! شكراً لك" : "Subscribed successfully! Thank you"}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder={isAr ? "الاسم (اختياري)" : "Name (optional)"}
                style={{ padding: "13px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none" }} />
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder={isAr ? "بريدك الإلكتروني *" : "Your email *"} required type="email"
                style={{ padding: "13px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none" }} />
            </div>
            <button type="submit" disabled={sending}
              style={{ padding: "14px", borderRadius: 12, background: "linear-gradient(135deg, #e59269, #cb7147)", border: "none", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Bell size={16} />
              {sending ? (isAr ? "جاري الاشتراك..." : "Subscribing...") : (isAr ? "اشترك الآن" : "Subscribe Now")}
            </button>
          </form>
        )}
        <p style={{ margin: "14px 0 0", fontSize: 11, color: "rgba(255,255,255,.35)" }}>
          {isAr ? "لن نرسل لك أي بريد مزعج. يمكنك إلغاء الاشتراك في أي وقت." : "We won't send spam. You can unsubscribe anytime."}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ANNOUNCEMENT BAR                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
export function AnnouncementBar({ lang = "ar", onBookingClick }: { lang?: "ar" | "en"; onBookingClick?: () => void }) {
  const isAr = lang === "ar";
  const [visible, setVisible] = useState(true);
  const { data: settings } = useQuery<any>({ queryKey: ["/api/public/site-settings"] });

  // If announcementEnabled is explicitly false, hide
  if (settings && settings.announcementEnabled === false) return null;
  if (!visible) return null;

  const defaultAr = "استشارة مجانية لأول 5 مشاريع هذا الشهر — لا تفوّت الفرصة!";
  const defaultEn = "Free consultation for the first 5 projects this month — Don't miss it!";
  const text = isAr
    ? (settings?.announcementAr || defaultAr)
    : (settings?.announcementEn || defaultEn);

  return (
    <div style={{ background: "linear-gradient(90deg, #cb7147, #e59269)", color: "#fff", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", position: "relative", fontFamily: "'Cairo', system-ui, sans-serif", zIndex: 1000, textAlign: "center" }}
      dir={isAr ? "rtl" : "ltr"}>
      <span style={{ fontSize: 14, fontWeight: 700 }}>
        🎉 {text}
      </span>
      {onBookingClick && (
        <button onClick={onBookingClick}
          style={{ background: "#fff", color: "#cb7147", border: "none", padding: "6px 18px", borderRadius: 999, fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          {isAr ? "احجز الآن" : "Book Now"}
        </button>
      )}
      <button onClick={() => setVisible(false)}
        style={{ position: "absolute", ...(isAr ? { left: 12 } : { right: 12 }), background: "none", border: "none", color: "rgba(255,255,255,.8)", cursor: "pointer", display: "flex", padding: 4 }}>
        <X size={16} />
      </button>
    </div>
  );
}
