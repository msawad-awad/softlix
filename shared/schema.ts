import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// TENANTS (Organizations/Companies)
// ============================================================================
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  country: text("country"),
  city: text("city"),
  timezone: text("timezone").default("Asia/Riyadh"),
  localeDefault: text("locale_default").default("ar"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true });
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

// ============================================================================
// USERS
// ============================================================================
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("user").notNull(), // admin, manager, sales, support, accountant, hr, developer, user
  status: text("status").default("active").notNull(), // active, inactive
  locale: text("locale").default("ar").notNull(), // ar, en
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  planName: text("plan_name").default("trial").notNull(),
  status: text("status").default("trial").notNull(), // trial, active, expired, cancelled, suspended
  trialStart: timestamp("trial_start").defaultNow().notNull(),
  trialEnd: timestamp("trial_end").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  billingPeriod: text("billing_period").default("monthly"), // monthly, quarterly, semi_annual, yearly
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  currency: text("currency").default("SAR"),
  modulesEnabled: jsonb("modules_enabled").default(["crm", "quotes", "tasks"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// ============================================================================
// SETTINGS
// ============================================================================
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  key: text("key").notNull(),
  valueJson: jsonb("value_json"),
  group: text("group").default("general"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// ============================================================================
// CRM - COMPANIES
// ============================================================================
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  industry: text("industry"),
  source: text("source"), // referral, google, website, cold_call, etc.
  status: text("status").default("lead").notNull(), // lead, prospect, client, archived
  ownerId: varchar("owner_id").references(() => users.id),
  notes: text("notes"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// ============================================================================
// CRM - CONTACTS
// ============================================================================
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  companyId: varchar("company_id").references(() => companies.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  position: text("position"),
  isPrimary: boolean("is_primary").default(false),
  notes: text("notes"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// ============================================================================
// ACTIVITY LOG
// ============================================================================
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  entityType: text("entity_type").notNull(), // company, contact, quote, task, etc.
  entityId: varchar("entity_id"),
  action: text("action").notNull(), // created, updated, deleted, viewed, etc.
  dataJson: jsonb("data_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // info, success, warning, error
  title: text("title").notNull(),
  body: text("body"),
  metaJson: jsonb("meta_json"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// ============================================================================
// SESSIONS (for authentication)
// ============================================================================
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// ============================================================================
// WEBSITE CMS - SERVICES
// ============================================================================
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  slug: text("slug").notNull(),
  shortDescription: text("short_description"),
  shortDescriptionEn: text("short_description_en"),
  fullDescription: text("full_description"),
  fullDescriptionEn: text("full_description_en"),
  imageUrl: text("image_url"),
  iconName: text("icon_name"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  features: jsonb("features").default([]),
  status: text("status").default("published").notNull(), // published, draft
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// ============================================================================
// WEBSITE CMS - PROJECTS
// ============================================================================
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  slug: text("slug").notNull(),
  description: text("description"),
  descriptionEn: text("description_en"),
  thumbnailUrl: text("thumbnail_url"),
  images: jsonb("images").default([]),
  clientName: text("client_name"),
  projectUrl: text("project_url"),
  category: text("category"), // mobile-app, web, marketing, etc.
  technologies: jsonb("technologies").default([]),
  status: text("status").default("published").notNull(), // published, draft
  displayOrder: integer("display_order").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ============================================================================
// WEBSITE CMS - BLOG CATEGORIES
// ============================================================================
export const blogCategories = pgTable("blog_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({ id: true, createdAt: true });
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;

// ============================================================================
// WEBSITE CMS - BLOG POSTS
// ============================================================================
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  categoryId: varchar("category_id").references(() => blogCategories.id),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  slug: text("slug").notNull(),
  excerpt: text("excerpt"),
  excerptEn: text("excerpt_en"),
  content: text("content"),
  contentEn: text("content_en"),
  featuredImageUrl: text("featured_image_url"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  status: text("status").default("draft").notNull(), // published, draft
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// ============================================================================
// WEBSITE CMS - SITE CLIENTS (Logo Section)
// ============================================================================
export const siteClients = pgTable("site_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  displayOrder: integer("display_order").default(0),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSiteClientSchema = createInsertSchema(siteClients).omit({ id: true, createdAt: true });
export type InsertSiteClient = z.infer<typeof insertSiteClientSchema>;
export type SiteClient = typeof siteClients.$inferSelect;

// ============================================================================
// WEBSITE CMS - REDIRECTS
// ============================================================================
export const redirects = pgTable("redirects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  fromUrl: text("from_url").notNull(),
  toUrl: text("to_url").notNull(),
  statusCode: integer("status_code").default(301).notNull(), // 301, 302
  isActive: boolean("is_active").default(true).notNull(),
  hitCount: integer("hit_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRedirectSchema = createInsertSchema(redirects).omit({ id: true, createdAt: true });
export type InsertRedirect = z.infer<typeof insertRedirectSchema>;
export type Redirect = typeof redirects.$inferSelect;

// ============================================================================
// MARKETING - SETTINGS (GTM, Pixel, Analytics)
// ============================================================================
export const marketingSettings = pgTable("marketing_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull().unique(),
  gtmId: text("gtm_id"),
  metaPixelId: text("meta_pixel_id"),
  googleAnalyticsId: text("google_analytics_id"),
  tiktokPixelId: text("tiktok_pixel_id"),
  snapchatPixelId: text("snapchat_pixel_id"),
  linkedinInsightId: text("linkedin_insight_id"),
  customHeadScript: text("custom_head_script"),
  customBodyScript: text("custom_body_script"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketingSettingsSchema = createInsertSchema(marketingSettings).omit({ id: true, updatedAt: true });
export type InsertMarketingSettings = z.infer<typeof insertMarketingSettingsSchema>;
export type MarketingSettings = typeof marketingSettings.$inferSelect;

// ============================================================================
// WEBSITE - FORM LEADS
// ============================================================================
export const formLeads = pgTable("form_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  formType: text("form_type").default("contact").notNull(), // contact, consultation, quote
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  budget: text("budget"),
  message: text("message"),
  pageSource: text("page_source"),
  ipAddress: text("ip_address"),
  status: text("status").default("new").notNull(), // new, contacted, converted, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFormLeadSchema = createInsertSchema(formLeads).omit({ id: true, createdAt: true });
export type InsertFormLead = z.infer<typeof insertFormLeadSchema>;
export type FormLead = typeof formLeads.$inferSelect;

// ============================================================================
// WEBSITE CMS - SITE SETTINGS (Branding + Contact + Social)
// ============================================================================
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull().unique(),
  siteNameAr: text("site_name_ar").default("softlix"),
  siteNameEn: text("site_name_en").default("softlix"),
  siteDescAr: text("site_desc_ar"),
  siteDescEn: text("site_desc_en"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  colorPrimary: text("color_primary").default("#e59269"),
  colorSecondary: text("color_secondary").default("#82b735"),
  colorAccent: text("color_accent").default("#0f172a"),
  colorBg: text("color_bg").default("#f8fafc"),
  colorText: text("color_text").default("#0f172a"),
  fontFamily: text("font_family").default("Cairo"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  contactAddressAr: text("contact_address_ar"),
  contactAddressEn: text("contact_address_en"),
  contactHoursAr: text("contact_hours_ar"),
  contactHoursEn: text("contact_hours_en"),
  socialX: text("social_x"),
  socialInstagram: text("social_instagram"),
  socialLinkedIn: text("social_linked_in"),
  socialWhatsapp: text("social_whatsapp"),
  socialFacebook: text("social_facebook"),
  socialYoutube: text("social_youtube"),
  footerDescAr: text("footer_desc_ar"),
  footerDescEn: text("footer_desc_en"),
  copyrightAr: text("copyright_ar"),
  copyrightEn: text("copyright_en"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

// ============================================================================
// WEBSITE CMS - PAGE SECTIONS (Per-page editable content)
// ============================================================================
export const pageSections = pgTable("page_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  page: text("page").notNull(),
  sectionKey: text("section_key").notNull(),
  contentAr: jsonb("content_ar").default({}),
  contentEn: jsonb("content_en").default({}),
  isVisible: boolean("is_visible").default(true),
  displayOrder: integer("display_order").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPageSectionSchema = createInsertSchema(pageSections).omit({ id: true, updatedAt: true });
export type InsertPageSection = z.infer<typeof insertPageSectionSchema>;
export type PageSection = typeof pageSections.$inferSelect;

// ============================================================================
// WEBSITE CMS - TESTIMONIALS
// ============================================================================
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en"),
  roleAr: text("role_ar"),
  roleEn: text("role_en"),
  textAr: text("text_ar").notNull(),
  textEn: text("text_en"),
  avatarUrl: text("avatar_url"),
  stars: integer("stars").default(5),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// ============================================================================
// WEBSITE CMS - PROCESS STEPS
// ============================================================================
export const processSteps = pgTable("process_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  stepNumber: integer("step_number").notNull(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  descAr: text("desc_ar"),
  descEn: text("desc_en"),
  icon: text("icon"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
});

export const insertProcessStepSchema = createInsertSchema(processSteps).omit({ id: true });
export type InsertProcessStep = z.infer<typeof insertProcessStepSchema>;
export type ProcessStep = typeof processSteps.$inferSelect;

// ============================================================================
// WEBSITE CMS - WHY US ITEMS
// ============================================================================
export const whyUsItems = pgTable("why_us_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  icon: text("icon").default("✓"),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  descAr: text("desc_ar"),
  descEn: text("desc_en"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
});

export const insertWhyUsItemSchema = createInsertSchema(whyUsItems).omit({ id: true });
export type InsertWhyUsItem = z.infer<typeof insertWhyUsItemSchema>;
export type WhyUsItem = typeof whyUsItems.$inferSelect;

// ============================================================================
// WEBSITE CMS - ABOUT VALUES
// ============================================================================
export const aboutValues = pgTable("about_values", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  icon: text("icon").default("⭐"),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  descAr: text("desc_ar"),
  descEn: text("desc_en"),
  displayOrder: integer("display_order").default(0),
});

export const insertAboutValueSchema = createInsertSchema(aboutValues).omit({ id: true });
export type InsertAboutValue = z.infer<typeof insertAboutValueSchema>;
export type AboutValue = typeof aboutValues.$inferSelect;

// ============================================================================
// WEBSITE CMS - ABOUT TIMELINE
// ============================================================================
export const aboutTimeline = pgTable("about_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  year: text("year").notNull(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  descAr: text("desc_ar"),
  descEn: text("desc_en"),
  displayOrder: integer("display_order").default(0),
});

export const insertAboutTimelineSchema = createInsertSchema(aboutTimeline).omit({ id: true });
export type InsertAboutTimeline = z.infer<typeof insertAboutTimelineSchema>;
export type AboutTimeline = typeof aboutTimeline.$inferSelect;

// ============================================================================
// WEBSITE CMS - STATS (Homepage stats numbers)
// ============================================================================
export const siteStats = pgTable("site_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  value: text("value").notNull(),
  labelAr: text("label_ar").notNull(),
  labelEn: text("label_en"),
  displayOrder: integer("display_order").default(0),
});

export const insertSiteStatSchema = createInsertSchema(siteStats).omit({ id: true });
export type InsertSiteStat = z.infer<typeof insertSiteStatSchema>;
export type SiteStat = typeof siteStats.$inferSelect;

// ============================================================================
// API Response Types
// ============================================================================
export type UserWithoutPassword = Omit<User, "passwordHash">;

export interface AuthenticatedUser extends UserWithoutPassword {
  tenant: Tenant;
  subscription: Subscription | null;
}

export interface DashboardStats {
  totalCompanies: number;
  totalContacts: number;
  newLeadsThisMonth: number;
  activeClients: number;
  recentActivities: ActivityLog[];
}
