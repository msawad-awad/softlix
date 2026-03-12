import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Phone, Send, Calendar, ChevronDown, CheckCircle } from "lucide-react";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

interface WidgetsProps {
  lang?: "ar" | "en";
  whatsappUrl?: string;
  onBookingClick?: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* FLOATING CONTACT WIDGET                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
export function FloatingContactWidget({ lang = "ar", whatsappUrl, onBookingClick }: WidgetsProps) {
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const { toast } = useToast();
  const wa = whatsappUrl || "https://wa.me/966537861534";

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
      {/* Overlay */}
      {open && <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />}

      <div style={{ position: "fixed", bottom: 24, ...(isAr ? { left: 24 } : { right: 24 }), zIndex: 9999, display: "flex", flexDirection: "column", alignItems: isAr ? "flex-start" : "flex-end", gap: 12 }}>

        {/* Expanded Panel */}
        {open && (
          <div style={{
            background: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,.18)",
            overflow: "hidden", width: 320, fontFamily: "'Cairo', system-ui, sans-serif"
          }} dir={isAr ? "rtl" : "ltr"}>

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #1b2331, #2c3a4f)", padding: "20px 22px", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 16 }}>
                    {isAr ? "تواصل معنا" : "Contact Us"}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 3 }}>
                    {isAr ? "نرد خلال دقائق" : "We reply within minutes"}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,.12)", border: "none", cursor: "pointer", borderRadius: 10, padding: 8, color: "#fff", display: "flex" }}>
                  <X size={16} />
                </button>
              </div>
              {/* Online indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 2px rgba(34,197,94,.3)" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.8)" }}>
                  {isAr ? "متاح الآن" : "Available now"}
                </span>
              </div>
            </div>

            {/* Quick actions */}
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

                <a href="tel:+966537861534"
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "#eff6ff", border: "1px solid #bfdbfe", textDecoration: "none", color: "#1d4ed8" }}>
                  <Phone size={20} color="#3b82f6" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{isAr ? "اتصل بنا" : "Call Us"}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#2563eb" }}>+966 53 786 1534</p>
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

        {/* Main FAB button */}
        <button
          onClick={() => setOpen(p => !p)}
          data-testid="btn-floating-chat"
          style={{
            width: 60, height: 60, borderRadius: "50%",
            background: open ? "#1b2331" : "linear-gradient(135deg, #25d366, #128c7e)",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(37,211,102,.35)", transition: ".25s ease",
            position: "relative"
          }}>
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
export function ExitIntentPopup({ lang = "ar", onBookingClick }: { lang?: "ar" | "en"; onBookingClick?: () => void }) {
  const isAr = lang === "ar";
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const triggered = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
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
    }, 8000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("exitPopupDismissed", "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSending(true);
    try {
      await fetch(`/api/public/lead-capture${TENANT_ID ? `?tenantId=${TENANT_ID}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formType: "exit-intent", pageSource: window.location.pathname }),
      });
      setSent(true);
      toast({ title: isAr ? "تم الإرسال!" : "Sent!", description: isAr ? "سنتواصل معك قريباً" : "We'll reach out shortly" });
      setTimeout(dismiss, 3000);
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) dismiss(); }}>
      <div style={{ background: "#fff", borderRadius: 28, maxWidth: 500, width: "100%", overflow: "hidden", fontFamily: "'Cairo', system-ui, sans-serif", animation: "popIn .35s ease" }}
        dir={isAr ? "rtl" : "ltr"}>

        {/* Top accent */}
        <div style={{ background: "linear-gradient(135deg, #cb7147, #e59269, #f2b090)", padding: "32px 28px", textAlign: "center", position: "relative" }}>
          <button onClick={dismiss} style={{ position: "absolute", top: 14, ...(isAr ? { left: 14 } : { right: 14 }), background: "rgba(255,255,255,.2)", border: "none", cursor: "pointer", borderRadius: 10, padding: 8, color: "#fff", display: "flex" }}>
            <X size={16} />
          </button>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎁</div>
          <h2 style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1.4 }}>
            {isAr ? "لا تغادر قبل أن تعرف هذا!" : "Don't leave before knowing this!"}
          </h2>
          <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,.92)", fontSize: 15 }}>
            {isAr ? "احصل على استشارة مجانية لمشروعك خلال 24 ساعة" : "Get a free consultation for your project within 24 hours"}
          </p>
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
              <div style={{ display: "grid", gap: 12 }}>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder={isAr ? "الاسم الكريم *" : "Your name *"} required
                  style={{ padding: "13px 16px", borderRadius: 14, border: "1.5px solid #e2e8f0", fontFamily: "inherit", fontSize: 14, outline: "none", transition: ".2s" }}
                  onFocus={e => (e.target.style.borderColor = "#e59269")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder={isAr ? "رقم الجوال *" : "Phone number *"} required type="tel"
                  style={{ padding: "13px 16px", borderRadius: 14, border: "1.5px solid #e2e8f0", fontFamily: "inherit", fontSize: 14, outline: "none", transition: ".2s" }}
                  onFocus={e => (e.target.style.borderColor = "#e59269")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder={isAr ? "البريد الإلكتروني (اختياري)" : "Email (optional)"} type="email"
                  style={{ padding: "13px 16px", borderRadius: 14, border: "1.5px solid #e2e8f0", fontFamily: "inherit", fontSize: 14, outline: "none", transition: ".2s" }}
                  onFocus={e => (e.target.style.borderColor = "#e59269")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>
              <button type="submit" disabled={sending}
                style={{ width: "100%", marginTop: 16, padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, #e59269, #cb7147)", border: "none", color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {sending ? (isAr ? "جاري..." : "Sending...") : (isAr ? "احصل على استشارتك المجانية" : "Get Your Free Consultation")}
              </button>
              {onBookingClick && (
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
/* ANNOUNCEMENT BAR                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
export function AnnouncementBar({ lang = "ar", onBookingClick }: { lang?: "ar" | "en"; onBookingClick?: () => void }) {
  const isAr = lang === "ar";
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={{ background: "linear-gradient(90deg, #cb7147, #e59269)", color: "#fff", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", position: "relative", fontFamily: "'Cairo', system-ui, sans-serif", zIndex: 1000, textAlign: "center" }}
      dir={isAr ? "rtl" : "ltr"}>
      <span style={{ fontSize: 14, fontWeight: 700 }}>
        🎉 {isAr ? "استشارة مجانية لأول 5 مشاريع هذا الشهر — لا تفوّت الفرصة!" : "Free consultation for the first 5 projects this month — Don't miss it!"}
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
