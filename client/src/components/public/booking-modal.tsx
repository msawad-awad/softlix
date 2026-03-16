import { useState } from "react";
import { X, Calendar, CheckCircle, Clock, User, Phone, Mail, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

const SERVICES_AR = [
  "تطوير تطبيق جوال",
  "تطوير موقع إلكتروني",
  "نظام ERP / CRM",
  "تجارة إلكترونية / ماجنتو",
  "تصميم UI/UX",
  "استشارة تقنية",
  "تسويق رقمي",
  "أخرى",
];
const SERVICES_EN = [
  "Mobile App Development",
  "Website Development",
  "ERP / CRM System",
  "E-Commerce / Magento",
  "UI/UX Design",
  "Technical Consulting",
  "Digital Marketing",
  "Other",
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

type Step = 1 | 2 | 3;

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  lang?: "ar" | "en";
}

export function BookingModal({ open, onClose, lang = "ar" }: BookingModalProps) {
  const isAr = lang === "ar";
  const Arrow = isAr ? ChevronRight : ChevronLeft;
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });

  if (!open) return null;

  const set = (key: keyof typeof form) => (val: string) => setForm(p => ({ ...p, [key]: val }));

  const canNext1 = form.serviceType.length > 0;
  const canNext2 = true; // date/time are optional — user can always proceed
  const canSubmit = form.name.length > 0 && form.phone.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    try {
      const res = await fetch(`/api/public/bookings${TENANT_ID ? `?tenantId=${TENANT_ID}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch {
      toast({ title: isAr ? "حدث خطأ" : "Error", description: isAr ? "حاول مرة أخرى" : "Please try again", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep(1); setDone(false); setForm({ name: "", phone: "", email: "", serviceType: "", preferredDate: "", preferredTime: "", notes: "" }); }, 400);
  };

  /* ── Min date: tomorrow ── */
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 14,
    border: "1.5px solid #e2e8f0", fontFamily: "inherit", fontSize: 14,
    outline: "none", boxSizing: "border-box", background: "#fff", color: "#172033",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 7,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>

      <div style={{ background: "#fff", borderRadius: 28, maxWidth: 540, width: "100%", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "'Cairo', system-ui, sans-serif", animation: "bookingIn .35s ease" }}
        dir={isAr ? "rtl" : "ltr"}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1b2331, #2c3a4f)", padding: "24px 28px", color: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ margin: 0, fontWeight: 900, fontSize: 20 }}>
                {isAr ? "احجز استشارة مجانية" : "Book a Free Consultation"}
              </h2>
              <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.75)", fontSize: 13 }}>
                {isAr ? "خبراؤنا يتواصلون معك في الموعد المحدد" : "Our experts will reach you at the scheduled time"}
              </p>
            </div>
            <button onClick={handleClose} style={{ background: "rgba(255,255,255,.12)", border: "none", cursor: "pointer", borderRadius: 10, padding: 8, color: "#fff", display: "flex", flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          {!done && (
            <div style={{ marginTop: 20, display: "flex", gap: 8, alignItems: "center" }}>
              {([1, 2, 3] as Step[]).map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, flex: s < 3 ? "1" : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: step >= s ? "#e59269" : "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0, transition: ".25s" }}>
                    {step > s ? "✓" : s}
                  </div>
                  {s < 3 && <div style={{ flex: 1, height: 2, background: step > s ? "#e59269" : "rgba(255,255,255,.15)", transition: ".25s" }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", marginInline: "auto", marginBottom: 20 }}>
                <CheckCircle size={40} color="#16a34a" />
              </div>
              <h3 style={{ margin: "0 0 10px", fontWeight: 900, fontSize: 22, color: "#172033" }}>
                {isAr ? "تم تأكيد الحجز!" : "Booking Confirmed!"}
              </h3>
              <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 15, lineHeight: 1.7 }}>
                {isAr
                  ? `شكراً ${form.name}! سنتواصل معك على ${form.phone} لتأكيد موعد الاستشارة.`
                  : `Thank you ${form.name}! We'll reach you at ${form.phone} to confirm the appointment.`}
              </p>
              {form.preferredDate && form.preferredTime && (
                <div style={{ background: "#f8fafc", borderRadius: 18, padding: "16px 20px", marginBottom: 24, display: "inline-flex", gap: 14, alignItems: "center" }}>
                  <Calendar size={20} color="#e59269" />
                  <div style={{ textAlign: isAr ? "right" : "left" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{form.preferredDate}</p>
                    <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{form.preferredTime}</p>
                  </div>
                </div>
              )}
              <button onClick={handleClose}
                style={{ padding: "12px 32px", borderRadius: 14, background: "linear-gradient(135deg, #e59269, #cb7147)", border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                {isAr ? "حسناً" : "Done"}
              </button>
            </div>
          ) : step === 1 ? (
            <>
              <h3 style={{ margin: "0 0 4px", fontWeight: 900, fontSize: 17 }}>{isAr ? "ما نوع الخدمة التي تحتاجها؟" : "What service do you need?"}</h3>
              <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>{isAr ? "اختر الخدمة الأقرب لاحتياجك" : "Choose the service closest to your need"}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(isAr ? SERVICES_AR : SERVICES_EN).map((svc, i) => {
                  const selected = form.serviceType === (isAr ? SERVICES_AR[i] : SERVICES_EN[i]);
                  return (
                    <button key={i} onClick={() => set("serviceType")(isAr ? SERVICES_AR[i] : SERVICES_EN[i])}
                      style={{ padding: "13px 14px", borderRadius: 14, border: `2px solid ${selected ? "#e59269" : "#e2e8f0"}`, background: selected ? "rgba(229,146,105,.08)" : "#fff", color: selected ? "#cb7147" : "#475569", fontWeight: selected ? 800 : 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: ".2s", textAlign: "center" }}>
                      {svc}
                    </button>
                  );
                })}
              </div>
            </>
          ) : step === 2 ? (
            <>
              <h3 style={{ margin: "0 0 4px", fontWeight: 900, fontSize: 17 }}>{isAr ? "متى تفضل الاستشارة؟" : "When do you prefer the consultation?"}</h3>
              <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>{isAr ? "اختياري — يمكنك المتابعة بدون تحديد موعد" : "Optional — you can continue without selecting a date"}</p>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  <Calendar size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: 6 }} />
                  {isAr ? "التاريخ" : "Date"}
                </label>
                <input data-testid="input-booking-date" type="date" min={minDate} value={form.preferredDate} onChange={e => set("preferredDate")(e.target.value)}
                  style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>
                  <Clock size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: 6 }} />
                  {isAr ? "الوقت المفضل" : "Preferred Time"}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {TIME_SLOTS.map(t => {
                    const sel = form.preferredTime === t;
                    return (
                      <button key={t} data-testid={`btn-timeslot-${t.replace(/\s/g, "-")}`} onClick={() => set("preferredTime")(t)}
                        style={{ padding: "10px 6px", borderRadius: 12, border: `2px solid ${sel ? "#e59269" : "#e2e8f0"}`, background: sel ? "rgba(229,146,105,.08)" : "#fff", color: sel ? "#cb7147" : "#475569", fontWeight: sel ? 800 : 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: ".2s" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 style={{ margin: "0 0 4px", fontWeight: 900, fontSize: 17 }}>{isAr ? "بياناتك" : "Your Details"}</h3>
              <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>{isAr ? "حتى يتمكن فريقنا من التواصل معك" : "So our team can reach you"}</p>

              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={labelStyle}><User size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: 5 }} />{isAr ? "الاسم الكريم *" : "Full Name *"}</label>
                  <input data-testid="input-booking-name" value={form.name} onChange={e => set("name")(e.target.value)} placeholder={isAr ? "محمد عبدالله" : "John Smith"} required style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#e59269")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
                <div>
                  <label style={labelStyle}><Phone size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: 5 }} />{isAr ? "رقم الجوال *" : "Phone Number *"}</label>
                  <input data-testid="input-booking-phone" value={form.phone} onChange={e => set("phone")(e.target.value)} placeholder="+966 5X XXX XXXX" required type="tel" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#e59269")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
                <div>
                  <label style={labelStyle}><Mail size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: 5 }} />{isAr ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}</label>
                  <input value={form.email} onChange={e => set("email")(e.target.value)} placeholder="email@example.com" type="email" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#e59269")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
                <div>
                  <label style={labelStyle}><FileText size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: 5 }} />{isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}</label>
                  <textarea value={form.notes} onChange={e => set("notes")(e.target.value)}
                    placeholder={isAr ? "اشرح بإيجاز فكرتك أو ما تحتاج مساعدة فيه..." : "Briefly describe your idea or what you need help with..."}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={e => (e.target.style.borderColor = "#e59269")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>

              {/* Summary */}
              {(form.serviceType || form.preferredDate) && (
                <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 13, color: "#475569" }}>{isAr ? "ملخص طلبك:" : "Your booking summary:"}</p>
                  {form.serviceType && <p style={{ margin: "0 0 4px", fontSize: 13, color: "#172033" }}>📋 {form.serviceType}</p>}
                  {form.preferredDate && <p style={{ margin: "0 0 4px", fontSize: 13, color: "#172033" }}>📅 {form.preferredDate} — {form.preferredTime}</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            {step > 1 ? (
              <button onClick={() => setStep(p => (p - 1) as Step)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                <Arrow size={15} />
                {isAr ? "السابق" : "Back"}
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={() => setStep(p => (p + 1) as Step)} disabled={step === 1 ? !canNext1 : !canNext2}
                style={{ padding: "11px 24px", borderRadius: 12, background: (step === 1 ? canNext1 : canNext2) ? "linear-gradient(135deg, #e59269, #cb7147)" : "#e2e8f0", border: "none", color: (step === 1 ? canNext1 : canNext2) ? "#fff" : "#94a3b8", fontWeight: 800, fontSize: 15, cursor: (step === 1 ? canNext1 : canNext2) ? "pointer" : "not-allowed", fontFamily: "inherit", transition: ".2s" }}>
                {isAr ? "التالي" : "Next"} →
              </button>
            ) : (
              <button data-testid="btn-booking-submit" onClick={handleSubmit} disabled={!canSubmit || sending}
                style={{ padding: "11px 28px", borderRadius: 12, background: canSubmit ? "linear-gradient(135deg, #e59269, #cb7147)" : "#e2e8f0", border: "none", color: canSubmit ? "#fff" : "#94a3b8", fontWeight: 800, fontSize: 15, cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "inherit", transition: ".2s" }}>
                {sending ? (isAr ? "جاري الحجز..." : "Booking...") : (isAr ? "تأكيد الحجز" : "Confirm Booking")}
              </button>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes bookingIn { from { opacity:0; transform:scale(.94) translateY(24px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
    </div>
  );
}
