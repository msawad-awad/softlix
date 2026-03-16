import { useQuery } from "@tanstack/react-query";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { useSEO } from "@/hooks/use-seo";
import type { SiteClient } from "@shared/schema";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

interface ClientsProps {
  lang?: "ar" | "en";
  onLangChange?: (lang: "ar" | "en") => void;
}

const STATS = [
  { numAr: "+15", numEn: "15+", labelAr: "عميل موثوق", labelEn: "Trusted Clients" },
  { numAr: "+50", numEn: "50+", labelAr: "مشروع مُسلَّم", labelEn: "Projects Delivered" },
  { numAr: "100%", numEn: "100%", labelAr: "رضا العملاء", labelEn: "Client Satisfaction" },
  { numAr: "+8", numEn: "8+", labelAr: "سنوات خبرة", labelEn: "Years of Experience" },
];

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  border: "1px solid rgba(15,23,42,0.08)",
  backdropFilter: "blur(16px)",
  boxShadow: "0 8px 30px rgba(15,23,42,0.07)",
  borderRadius: 20,
};

export default function PublicClients({ lang = "ar", onLangChange }: ClientsProps) {
  const isAr = lang === "ar";

  useSEO({
    title: isAr ? "عملاؤنا | سوفتلكس" : "Our Clients | Softlix",
    description: isAr
      ? "نفخر بثقة أكثر من 15 شركة ومنظمة سعودية في مختلف القطاعات. اكتشف قصص نجاحنا مع عملائنا الكرام."
      : "We're proud of the trust of more than 15 Saudi companies and organizations across various sectors. Discover our success stories with our valued clients.",
  });

  const { data: clients = [], isLoading } = useQuery<SiteClient[]>({
    queryKey: ["/api/public/clients", TENANT_ID],
    queryFn: async () => {
      const res = await fetch(`/api/public/clients?tenantId=${TENANT_ID}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div style={{ background: "#F8F9FC", minHeight: "100vh", direction: isAr ? "rtl" : "ltr" }}>
      <PublicNavbar lang={lang} onLangChange={onLangChange} />

      {/* ── Hero ── */}
      <section style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        padding: "100px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 30% 50%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(168,85,247,0.08) 0%, transparent 50%)",
        }}/>
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 100, padding: "6px 16px", marginBottom: 24,
          }}>
            <span style={{ fontSize: 12, color: "#A5B4FC", fontWeight: 600, letterSpacing: 1 }}>
              {isAr ? "عملاؤنا" : "OUR CLIENTS"}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 20 }}>
            {isAr ? (
              <>شراكات بُنيت على <span style={{ color: "#818CF8" }}>الثقة والنتائج</span></>
            ) : (
              <>Partnerships Built on <span style={{ color: "#818CF8" }}>Trust & Results</span></>
            )}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
            {isAr
              ? "نفخر بثقة مجموعة متنوعة من الشركات والمنظمات السعودية التي اختارت سوفتلكس شريكاً تقنياً لبناء منتجاتها الرقمية."
              : "We're proud to partner with a diverse range of Saudi companies and organizations that chose Softlix as their technology partner to build their digital products."}
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ maxWidth: 960, margin: "-32px auto 0", padding: "0 24px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ ...card, padding: "24px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#4F46E5", lineHeight: 1 }}>
                {isAr ? s.numAr : s.numEn}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748B", marginTop: 6, fontWeight: 500 }}>
                {isAr ? s.labelAr : s.labelEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Clients Grid ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>
            {isAr ? "شركاؤنا في النجاح" : "Our Partners in Success"}
          </h2>
          <p style={{ color: "#64748B", fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
            {isAr
              ? "من الجمعيات الخيرية إلى الشركات التقنية والمؤسسات الحكومية — نخدم الجميع بنفس الالتزام والاحترافية."
              : "From charities to tech companies and government institutions — we serve everyone with the same commitment and professionalism."}
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 20 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ height: 120, borderRadius: 16, background: "#E2E8F0", animation: "pulse 1.5s infinite" }}/>
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
            {isAr ? "لا توجد بيانات عملاء حالياً" : "No client data available"}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 20,
          }}>
            {clients.map((c) => (
              <ClientCard key={c.id} client={c} isAr={isAr} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
        margin: "0 24px 60px",
        borderRadius: 28,
        padding: "60px 40px",
        textAlign: "center",
        maxWidth: 1052,
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", marginBottom: 12 }}>
          {isAr ? "هل أنت الشريك القادم؟" : "Are You Our Next Partner?"}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem", marginBottom: 32, maxWidth: 420, margin: "0 auto 32px" }}>
          {isAr
            ? "انضم إلى عملائنا وابدأ رحلتك الرقمية مع فريق يفهم أهدافك ويبني معك."
            : "Join our clients and start your digital journey with a team that understands your goals and builds with you."}
        </p>
        <a
          href="/contact"
          style={{
            display: "inline-block",
            background: "#fff",
            color: "#4F46E5",
            fontWeight: 700,
            padding: "14px 36px",
            borderRadius: 100,
            textDecoration: "none",
            fontSize: "0.95rem",
            transition: "opacity 0.2s",
          }}
          data-testid="btn-cta-contact"
        >
          {isAr ? "تواصل معنا →" : "Contact Us →"}
        </a>
      </section>

      <PublicFooter lang={lang} />
    </div>
  );
}

function ClientCard({ client, isAr }: { client: SiteClient; isAr: boolean }) {
  const hasLogo = Boolean(client.logoUrl);
  const displayName = isAr ? client.name : (client.nameEn || client.name);

  return (
    <div
      style={{
        ...card,
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        minHeight: 130,
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(15,23,42,0.12)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(15,23,42,0.07)";
      }}
      data-testid={`client-logo-${client.id}`}
    >
      <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {hasLogo ? (
          <img
            src={client.logoUrl!}
            alt={displayName}
            style={{ maxHeight: 56, maxWidth: 130, objectFit: "contain", filter: "grayscale(20%)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.filter = "grayscale(0%)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.filter = "grayscale(20%)"; }}
          />
        ) : (
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: "linear-gradient(135deg, #E0E7FF, #C7D2FE)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", fontWeight: 900, color: "#4F46E5",
          }}>
            {(displayName || "?")[0]}
          </div>
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1E293B", lineHeight: 1.3, margin: 0 }}>
          {displayName}
        </p>
        {client.clientType && (
          <p style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 4, margin: "4px 0 0" }}>
            {client.clientType}
          </p>
        )}
      </div>
    </div>
  );
}
