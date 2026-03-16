import { db } from "../server/db";
import { siteClients, tenants } from "../shared/schema";
import { eq } from "drizzle-orm";

const TENANT_SLUG = "softlix";

const clients = [
  { name: "Mapy", nameEn: "Mapy", logo: "/clients/mapy.png", type: "Mobile Application", order: 1 },
  { name: "الاتحاد السعودي للغوص", nameEn: "Saudi Water Sports & Diving Federation", logo: "/clients/saudi-diving.png", type: "Government Organization", order: 2 },
  { name: "شركة تمكين الدولية", nameEn: "Tamkeen International Company", logo: "/clients/tamkeen.png", type: "Company", order: 3 },
  { name: "وريف للتطوير والاستثمار العقاري", nameEn: "Wareef Real Estate Development", logo: "/clients/wareef.png", type: "Real Estate Company", order: 4 },
  { name: "جمعية كسائك إحسان", nameEn: "Kasaek Ehsan Charity", logo: "/clients/kasaek.png", type: "Charity", order: 5 },
  { name: "مجموعة المحامي خالد العبدلي", nameEn: "Khalid Al Abdali Law Group", logo: "/clients/alabdali.png", type: "Law Firm", order: 6 },
  { name: "شركة ريادة الأولى المحدودة", nameEn: "Reyada Al Oula Company", logo: "", type: "Company", order: 7 },
  { name: "جمعية إخوانكم", nameEn: "Ikhwanukum Charity", logo: "/clients/ikhwanukum.png", type: "Charity", order: 8 },
  { name: "الجمعية العربية السعودية للفنون", nameEn: "Saudi Arabian Society for Arts", logo: "/clients/saudi-arts.png", type: "Cultural Organization", order: 9 },
  { name: "الجمعية العربية السعودية لبيت الشباب", nameEn: "Saudi Youth Hostel Association", logo: "/clients/youth-hostel.png", type: "Association", order: 10 },
  { name: "تطبيق ريسيرفا", nameEn: "Reserva App", logo: "/clients/reserva.png", type: "Mobile App", order: 11 },
  { name: "تطبيق غزير", nameEn: "Ghazeer App", logo: "/clients/ghazeer.png", type: "Mobile App", order: 12 },
  { name: "تطبيق تبارك", nameEn: "Tabarak App", logo: "/clients/tabarak.png", type: "Mobile App", order: 13 },
  { name: "شركة نبع الخليج للسيارات", nameEn: "Nabaa Al Khaleej Cars", logo: "", type: "Automotive Company", order: 14 },
  { name: "أتيليه", nameEn: "Atelier", logo: "/clients/atelier.png", type: "Fashion & Design", order: 15 },
];

async function seedClients() {
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, TENANT_SLUG));
  if (!tenant) {
    console.error(`Tenant "${TENANT_SLUG}" not found`);
    process.exit(1);
  }

  console.log(`Seeding clients for tenant: ${tenant.name} (${tenant.id})`);

  const existing = await db.select().from(siteClients).where(eq(siteClients.tenantId, tenant.id));
  if (existing.length > 0) {
    console.log(`Found ${existing.length} existing clients, deleting...`);
    await db.delete(siteClients).where(eq(siteClients.tenantId, tenant.id));
  }

  for (const c of clients) {
    await db.insert(siteClients).values({
      tenantId: tenant.id,
      name: c.name,
      nameEn: c.nameEn,
      logoUrl: c.logo || null,
      websiteUrl: null,
      clientType: c.type,
      displayOrder: c.order,
      status: "active",
    });
    console.log(`  ✓ ${c.name}`);
  }

  console.log(`\n✅ Seeded ${clients.length} clients successfully!`);
  process.exit(0);
}

seedClients().catch(err => { console.error(err); process.exit(1); });
