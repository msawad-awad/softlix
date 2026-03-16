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
  category: text("category"),
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
  readTime: integer("read_time").default(5),
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
  nameEn: text("name_en"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  clientType: text("client_type"),
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
  // WhatsApp Widget
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  whatsappNumber: text("whatsapp_number"),
  whatsappMessage: text("whatsapp_message"),
  whatsappPosition: text("whatsapp_position").default("bottom-right"),
  // Exit Intent Popup
  exitIntentEnabled: boolean("exit_intent_enabled").default(false),
  exitIntentTitleAr: text("exit_intent_title_ar"),
  exitIntentTitleEn: text("exit_intent_title_en"),
  exitIntentSubtitleAr: text("exit_intent_subtitle_ar"),
  exitIntentSubtitleEn: text("exit_intent_subtitle_en"),
  exitIntentButtonAr: text("exit_intent_button_ar"),
  exitIntentButtonEn: text("exit_intent_button_en"),
  exitIntentButtonUrl: text("exit_intent_button_url"),
  exitIntentDelay: integer("exit_intent_delay").default(3),
  // Social Proof Toast
  socialProofEnabled: boolean("social_proof_enabled").default(false),
  socialProofInterval: integer("social_proof_interval").default(8),
  // Newsletter
  newsletterEnabled: boolean("newsletter_enabled").default(false),
  newsletterTitleAr: text("newsletter_title_ar"),
  newsletterTitleEn: text("newsletter_title_en"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketingSettingsSchema = createInsertSchema(marketingSettings).omit({ id: true, updatedAt: true });
export type InsertMarketingSettings = z.infer<typeof insertMarketingSettingsSchema>;
export type MarketingSettings = typeof marketingSettings.$inferSelect;

// ============================================================================
// MARKETING - NEWSLETTER SUBSCRIBERS
// ============================================================================
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  email: text("email").notNull(),
  name: text("name"),
  source: text("source").default("website"),
  status: text("status").default("active").notNull(), // active, unsubscribed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, createdAt: true });
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// ============================================================================
// MARKETING - PRICING PLANS
// ============================================================================
export const pricingPlans = pgTable("pricing_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descAr: text("desc_ar"),
  descEn: text("desc_en"),
  price: text("price").notNull(),
  currency: text("currency").default("SAR"),
  period: text("period").default("month"), // month, year, one-time
  featuresAr: text("features_ar").array(),
  featuresEn: text("features_en").array(),
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
  ctaTextAr: text("cta_text_ar"),
  ctaTextEn: text("cta_text_en"),
  ctaUrl: text("cta_url"),
  badgeAr: text("badge_ar"),
  badgeEn: text("badge_en"),
  color: text("color").default("blue"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPricingPlanSchema = createInsertSchema(pricingPlans).omit({ id: true, createdAt: true });
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;
export type PricingPlan = typeof pricingPlans.$inferSelect;

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
// CRM - LEAD SOURCES
// ============================================================================
export const crmLeadSources = pgTable("crm_lead_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  color: text("color").default("#6366f1"),
  isDefault: boolean("is_default").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrmLeadSourceSchema = createInsertSchema(crmLeadSources).omit({ id: true, createdAt: true });
export type InsertCrmLeadSource = z.infer<typeof insertCrmLeadSourceSchema>;
export type CrmLeadSource = typeof crmLeadSources.$inferSelect;

// ============================================================================
// CRM - LEADS
// ============================================================================
export const crmLeads = pgTable("crm_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  leadNumber: text("lead_number"),
  fullName: text("full_name").notNull(),
  mobile: text("mobile"),
  email: text("email"),
  companyName: text("company_name"),
  jobTitle: text("job_title"),
  country: text("country"),
  city: text("city"),
  serviceInterested: text("service_interested"),
  estimatedBudget: text("estimated_budget"),
  sourceId: varchar("source_id").references(() => crmLeadSources.id),
  sourceName: text("source_name"),
  campaignName: text("campaign_name"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  status: text("status").default("new").notNull(), // new, attempting_contact, contacted, qualified, unqualified, proposal_sent, negotiation, converted, lost
  priority: text("priority").default("medium").notNull(), // low, medium, high, urgent
  tags: jsonb("tags").default([]),
  notes: text("notes"),
  lastContactAt: timestamp("last_contact_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  formLeadId: varchar("form_lead_id").references(() => formLeads.id),
  convertedAt: timestamp("converted_at"),
  convertedToContactId: varchar("converted_to_contact_id"),
  convertedToCompanyId: varchar("converted_to_company_id"),
  convertedToDealId: varchar("converted_to_deal_id"),
  pageSource: text("page_source"),
  ipAddress: text("ip_address"),
  message: text("message"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCrmLeadSchema = createInsertSchema(crmLeads).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCrmLead = z.infer<typeof insertCrmLeadSchema>;
export type CrmLead = typeof crmLeads.$inferSelect;

// ============================================================================
// CRM - DEAL PIPELINES
// ============================================================================
export const crmDealPipelines = pgTable("crm_deal_pipelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  isDefault: boolean("is_default").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrmDealPipelineSchema = createInsertSchema(crmDealPipelines).omit({ id: true, createdAt: true });
export type InsertCrmDealPipeline = z.infer<typeof insertCrmDealPipelineSchema>;
export type CrmDealPipeline = typeof crmDealPipelines.$inferSelect;

// ============================================================================
// CRM - DEAL STAGES
// ============================================================================
export const crmDealStages = pgTable("crm_deal_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  pipelineId: varchar("pipeline_id").references(() => crmDealPipelines.id).notNull(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  color: text("color").default("#6366f1"),
  probability: integer("probability").default(50), // 0-100
  displayOrder: integer("display_order").default(0),
  isWon: boolean("is_won").default(false),
  isLost: boolean("is_lost").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrmDealStageSchema = createInsertSchema(crmDealStages).omit({ id: true, createdAt: true });
export type InsertCrmDealStage = z.infer<typeof insertCrmDealStageSchema>;
export type CrmDealStage = typeof crmDealStages.$inferSelect;

// ============================================================================
// CRM - DEALS
// ============================================================================
export const crmDeals = pgTable("crm_deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  dealNumber: text("deal_number"),
  title: text("title").notNull(),
  companyId: varchar("company_id").references(() => companies.id),
  contactId: varchar("contact_id").references(() => contacts.id),
  leadId: varchar("lead_id").references(() => crmLeads.id),
  pipelineId: varchar("pipeline_id").references(() => crmDealPipelines.id).notNull(),
  stageId: varchar("stage_id").references(() => crmDealStages.id).notNull(),
  serviceType: text("service_type"),
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  currency: text("currency").default("SAR"),
  probability: integer("probability").default(50),
  expectedCloseDate: timestamp("expected_close_date"),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  sourceId: varchar("source_id").references(() => crmLeadSources.id),
  description: text("description"),
  lostReason: text("lost_reason"),
  wonAt: timestamp("won_at"),
  lostAt: timestamp("lost_at"),
  status: text("status").default("open").notNull(), // open, won, lost, archived
  tags: jsonb("tags").default([]),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCrmDealSchema = createInsertSchema(crmDeals).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCrmDeal = z.infer<typeof insertCrmDealSchema>;
export type CrmDeal = typeof crmDeals.$inferSelect;

// ============================================================================
// CRM - ACTIVITIES (Polymorphic Timeline)
// ============================================================================
export const crmActivities = pgTable("crm_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  entityType: text("entity_type").notNull(), // lead, contact, company, deal
  entityId: varchar("entity_id").notNull(),
  type: text("type").notNull(), // note, call_log, meeting_log, email_log, whatsapp_log, status_change, assignment_change, stage_change, proposal_action, manual
  subject: text("subject"),
  details: text("details"),
  outcome: text("outcome"),
  durationMinutes: integer("duration_minutes"),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrmActivitySchema = createInsertSchema(crmActivities).omit({ id: true, createdAt: true });
export type InsertCrmActivity = z.infer<typeof insertCrmActivitySchema>;
export type CrmActivity = typeof crmActivities.$inferSelect;

// ============================================================================
// CRM - TASKS
// ============================================================================
export const crmTasks = pgTable("crm_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  type: text("type").default("task").notNull(), // call, whatsapp, email, meeting, proposal_prep, contract_followup, internal, reminder, task
  entityType: text("entity_type"), // lead, contact, company, deal
  entityId: varchar("entity_id"),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium").notNull(), // low, medium, high, urgent
  status: text("status").default("pending").notNull(), // pending, in_progress, completed, cancelled
  description: text("description"),
  completedAt: timestamp("completed_at"),
  reminderBefore: integer("reminder_before"), // minutes
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCrmTaskSchema = createInsertSchema(crmTasks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCrmTask = z.infer<typeof insertCrmTaskSchema>;
export type CrmTask = typeof crmTasks.$inferSelect;

// ============================================================================
// CRM - PROPOSALS
// ============================================================================
export const crmProposals = pgTable("crm_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  proposalNumber: text("proposal_number"),
  title: text("title").notNull(),
  companyId: varchar("company_id").references(() => companies.id),
  contactId: varchar("contact_id").references(() => contacts.id),
  dealId: varchar("deal_id").references(() => crmDeals.id),
  leadId: varchar("lead_id").references(() => crmLeads.id),
  issueDate: timestamp("issue_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  currency: text("currency").default("SAR"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  discountType: text("discount_type").default("fixed"), // fixed, percent
  discountValue: decimal("discount_value", { precision: 12, scale: 2 }).default("0"),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default("15"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  status: text("status").default("draft").notNull(), // draft, pending_approval, approved, sent, viewed, revised, accepted, rejected, expired
  termsAndNotes: text("terms_and_notes"),
  internalNotes: text("internal_notes"),
  preparedById: varchar("prepared_by_id").references(() => users.id),
  approvedById: varchar("approved_by_id").references(() => users.id),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  acceptedAt: timestamp("accepted_at"),
  rejectedAt: timestamp("rejected_at"),
  viewCount: integer("view_count").default(0),
  paymentSchedule: jsonb("payment_schedule").default([]),
  clientSignature: text("client_signature"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCrmProposalSchema = createInsertSchema(crmProposals).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCrmProposal = z.infer<typeof insertCrmProposalSchema>;
export type CrmProposal = typeof crmProposals.$inferSelect;

// ============================================================================
// CRM - PROPOSAL ITEMS
// ============================================================================
export const crmProposalItems = pgTable("crm_proposal_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").references(() => crmProposals.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).default("0"),
  lineTotal: decimal("line_total", { precision: 12, scale: 2 }).default("0"),
  displayOrder: integer("display_order").default(0),
  sectionName: text("section_name"),
  isOptional: boolean("is_optional").default(false),
});

// ============================================================================
// INTEGRATION SETTINGS - تكاملات النظام
// ============================================================================
export const integrationSettings = pgTable("integration_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  provider: text("provider").notNull(), // smtp, gmail_oauth, twilio, unifonic, msTeams, google_calendar, webhook
  isEnabled: boolean("is_enabled").default(false),
  config: jsonb("config").default({}), // stored as JSON: { host, port, user, pass, from, apiKey, ... }
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIntegrationSettingsSchema = createInsertSchema(integrationSettings).omit({ id: true, updatedAt: true });
export type IntegrationSettings = typeof integrationSettings.$inferSelect;

// ============================================================================
// CRM ATTACHMENTS - مرفقات CRM
// ============================================================================
export const crmAttachments = pgTable("crm_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  entityType: text("entity_type").notNull(), // lead, deal, proposal, contact, company
  entityId: varchar("entity_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrmAttachmentSchema = createInsertSchema(crmAttachments).omit({ id: true, createdAt: true });
export type CrmAttachment = typeof crmAttachments.$inferSelect;

// ============================================================================
// CRM PROPOSAL PUBLIC TOKENS - روابط مشاركة عروض الأسعار
// ============================================================================
export const crmProposalTokens = pgTable("crm_proposal_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").references(() => crmProposals.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrmProposalItemSchema = createInsertSchema(crmProposalItems).omit({ id: true });
export type InsertCrmProposalItem = z.infer<typeof insertCrmProposalItemSchema>;
export type CrmProposalItem = typeof crmProposalItems.$inferSelect;

// ============================================================================
// PROPOSAL TEMPLATES - قوالب عروض الأسعار
// ============================================================================
export const proposalTemplates = pgTable("proposal_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  category: text("category").default("general"), // mobile-app, web-platform, erp, marketing, general
  defaultTerms: text("default_terms"),
  defaultValidity: integer("default_validity").default(14), // days
  defaultTaxPercent: decimal("default_tax_percent", { precision: 5, scale: 2 }).default("15"),
  items: jsonb("items").default([]), // array of { title, description, quantity, unitPrice }
  isDefault: boolean("is_default").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProposalTemplateSchema = createInsertSchema(proposalTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProposalTemplate = z.infer<typeof insertProposalTemplateSchema>;
export type ProposalTemplate = typeof proposalTemplates.$inferSelect;

// ============================================================================
// GOOGLE IMPORT BUFFER - استيراد العملاء من Google
// ============================================================================
export const googleImportBuffer = pgTable("google_import_buffer", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  googlePlaceId: text("google_place_id").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviewCount: integer("review_count"),
  types: text("types"),
  googleUrl: text("google_url"),
  businessStatus: text("business_status"),
  status: text("status").default("pending").notNull(), // pending, imported, skipped
  importedCompanyId: varchar("imported_company_id").references(() => companies.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGoogleImportBufferSchema = createInsertSchema(googleImportBuffer).omit({ id: true, createdAt: true });
export type InsertGoogleImportBuffer = z.infer<typeof insertGoogleImportBufferSchema>;
export type GoogleImportBuffer = typeof googleImportBuffer.$inferSelect;

// ============================================================================
// Bookings (Consultation Scheduling)
// ============================================================================
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  serviceType: text("service_type"),
  preferredDate: text("preferred_date"),
  preferredTime: text("preferred_time"),
  notes: text("notes"),
  status: text("status").default("pending").notNull(), // pending, confirmed, cancelled
  source: text("source").default("website"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// ============================================================================
// SERVICE LIBRARY - مكتبة الخدمات الجاهزة
// ============================================================================
export const serviceLibrary = pgTable("service_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).default("0"),
  unit: text("unit").default("item"), // item, hr, day, month, page
  category: text("category").default("general"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceLibrarySchema = createInsertSchema(serviceLibrary).omit({ id: true, createdAt: true });
export type InsertServiceLibraryItem = z.infer<typeof insertServiceLibrarySchema>;
export type ServiceLibraryItem = typeof serviceLibrary.$inferSelect;

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
