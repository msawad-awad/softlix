import {
  tenants, users, subscriptions, companies, contacts, activityLog, sessions, notifications,
  services, projects, blogCategories, blogPosts, siteClients, redirects,
  marketingSettings, formLeads, bookings,
  newsletterSubscribers, pricingPlans,
  siteSettings, pageSections, testimonials, processSteps, whyUsItems,
  aboutValues, aboutTimeline, siteStats,
  crmLeadSources, crmLeads, crmDealPipelines, crmDealStages, crmDeals,
  crmActivities, crmTasks, crmProposals, crmProposalItems,
  integrationSettings, crmAttachments, crmProposalTokens,
  proposalTemplates, googleImportBuffer, serviceLibrary, visitorLogs, analyticsEvents,
  tickets, ticketMessages, employees, inventoryItems, phoneSettings,
  type ProposalTemplate, type InsertProposalTemplate,
  type GoogleImportBuffer, type InsertGoogleImportBuffer,
  type ServiceLibraryItem, type InsertServiceLibraryItem,
  type VisitorLog, type InsertVisitorLog,
  type AnalyticsEvent, type InsertAnalyticsEvent,
  type NewsletterSubscriber, type InsertNewsletterSubscriber,
  type PricingPlan, type InsertPricingPlan,
  type Booking, type InsertBooking,
  type IntegrationSettings, type CrmAttachment,
  type Tenant, type InsertTenant,
  type User, type InsertUser,
  type Subscription, type InsertSubscription,
  type Company, type InsertCompany,
  type Contact, type InsertContact,
  type ActivityLog, type InsertActivityLog,
  type Session, type InsertSession,
  type Service, type InsertService,
  type Project, type InsertProject,
  type BlogCategory, type InsertBlogCategory,
  type BlogPost, type InsertBlogPost,
  type SiteClient, type InsertSiteClient,
  type Redirect, type InsertRedirect,
  type MarketingSettings, type InsertMarketingSettings,
  type FormLead, type InsertFormLead,
  type SiteSettings, type InsertSiteSettings,
  type PageSection, type InsertPageSection,
  type Testimonial, type InsertTestimonial,
  type ProcessStep, type InsertProcessStep,
  type WhyUsItem, type InsertWhyUsItem,
  type AboutValue, type InsertAboutValue,
  type AboutTimeline, type InsertAboutTimeline,
  type SiteStat, type InsertSiteStat,
  type CrmLeadSource, type InsertCrmLeadSource,
  type CrmLead, type InsertCrmLead,
  type CrmDealPipeline, type InsertCrmDealPipeline,
  type CrmDealStage, type InsertCrmDealStage,
  type CrmDeal, type InsertCrmDeal,
  type CrmActivity, type InsertCrmActivity,
  type CrmTask, type InsertCrmTask,
  type CrmProposal, type InsertCrmProposal,
  type CrmProposalItem, type InsertCrmProposalItem,
  type Ticket, type InsertTicket,
  type TicketMessage, type InsertTicketMessage,
  type Employee, type InsertEmployee,
  type InventoryItem, type InsertInventoryItem,
  type PhoneSetting, type InsertPhoneSetting,
  type AuthenticatedUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, count, sql, like, or, ilike } from "drizzle-orm";

export interface IStorage {
  // Tenants
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string, tenantId?: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTeamUsers(tenantId: string): Promise<User[]>;
  updateUser(id: string, tenantId: string, update: Partial<Pick<User, "name"|"email"|"phone"|"role"|"status"|"permissions">>): Promise<User | undefined>;
  deleteUser(id: string, tenantId: string): Promise<void>;
  updateUserPassword(id: string, tenantId: string, passwordHash: string): Promise<void>;
  
  // Sessions
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  deleteSession(id: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  
  // Subscriptions
  getSubscriptionByTenantId(tenantId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  
  // Companies
  getCompanies(tenantId: string, userId?: string): Promise<Company[]>;
  getCompany(id: string, tenantId: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, tenantId: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string, tenantId: string): Promise<void>;
  
  // Contacts
  getContacts(tenantId: string, userId?: string): Promise<Contact[]>;
  getContact(id: string, tenantId: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, tenantId: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string, tenantId: string): Promise<void>;
  
  // Activity Log
  getActivityLogs(tenantId: string, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Dashboard Stats
  getDashboardStats(tenantId: string): Promise<{
    totalCompanies: number;
    totalContacts: number;
    newLeadsThisMonth: number;
    activeClients: number;
    recentActivities: ActivityLog[];
  }>;
  
  // Auth Helper
  getAuthenticatedUser(userId: string): Promise<AuthenticatedUser | null>;

  // Services (CMS)
  getServices(tenantId: string): Promise<Service[]>;
  getServiceBySlug(slug: string, tenantId: string): Promise<Service | undefined>;
  getService(id: string, tenantId: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, tenantId: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string, tenantId: string): Promise<void>;

  // Projects (CMS)
  getProjects(tenantId: string): Promise<Project[]>;
  getProjectBySlug(slug: string, tenantId: string): Promise<Project | undefined>;
  getProject(id: string, tenantId: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, tenantId: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string, tenantId: string): Promise<void>;

  // Blog Categories (CMS)
  getBlogCategories(tenantId: string): Promise<BlogCategory[]>;
  createBlogCategory(cat: InsertBlogCategory): Promise<BlogCategory>;
  deleteBlogCategory(id: string, tenantId: string): Promise<void>;

  // Blog Posts (CMS)
  getBlogPosts(tenantId: string): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string, tenantId: string): Promise<BlogPost | undefined>;
  getBlogPost(id: string, tenantId: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, tenantId: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string, tenantId: string): Promise<void>;

  // Site Clients (CMS)
  getSiteClients(tenantId: string): Promise<SiteClient[]>;
  createSiteClient(client: InsertSiteClient): Promise<SiteClient>;
  updateSiteClient(id: string, tenantId: string, client: Partial<InsertSiteClient>): Promise<SiteClient | undefined>;
  deleteSiteClient(id: string, tenantId: string): Promise<void>;

  // Redirects
  getRedirects(tenantId: string): Promise<Redirect[]>;
  getRedirectByFromUrl(fromUrl: string, tenantId: string): Promise<Redirect | undefined>;
  createRedirect(redirect: InsertRedirect): Promise<Redirect>;
  updateRedirect(id: string, tenantId: string, redirect: Partial<InsertRedirect>): Promise<Redirect | undefined>;
  deleteRedirect(id: string, tenantId: string): Promise<void>;
  incrementRedirectHit(id: string): Promise<void>;

  // Marketing Settings
  getMarketingSettings(tenantId: string): Promise<MarketingSettings | undefined>;
  upsertMarketingSettings(tenantId: string, settings: Partial<InsertMarketingSettings>): Promise<MarketingSettings>;

  // Newsletter Subscribers
  getNewsletterSubscribers(tenantId: string): Promise<NewsletterSubscriber[]>;
  addNewsletterSubscriber(sub: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  updateNewsletterSubscriber(id: string, tenantId: string, data: Partial<InsertNewsletterSubscriber>): Promise<NewsletterSubscriber | undefined>;
  deleteNewsletterSubscriber(id: string, tenantId: string): Promise<void>;
  getNewsletterSubscriberByEmail(email: string, tenantId: string): Promise<NewsletterSubscriber | undefined>;

  // Pricing Plans
  getPricingPlans(tenantId: string): Promise<PricingPlan[]>;
  createPricingPlan(plan: InsertPricingPlan): Promise<PricingPlan>;
  updatePricingPlan(id: string, tenantId: string, plan: Partial<InsertPricingPlan>): Promise<PricingPlan | undefined>;
  deletePricingPlan(id: string, tenantId: string): Promise<void>;

  // Form Leads
  getFormLeads(tenantId: string): Promise<FormLead[]>;
  createFormLead(lead: InsertFormLead): Promise<FormLead>;
  updateFormLead(id: string, tenantId: string, lead: Partial<InsertFormLead>): Promise<FormLead | undefined>;
  deleteFormLead(id: string, tenantId: string): Promise<void>;

  // Site Settings (Branding)
  getSiteSettings(tenantId: string): Promise<SiteSettings | undefined>;
  upsertSiteSettings(tenantId: string, data: Partial<InsertSiteSettings>): Promise<SiteSettings>;

  // Page Sections
  getPageSections(tenantId: string, page: string): Promise<PageSection[]>;
  getPageSection(tenantId: string, page: string, sectionKey: string): Promise<PageSection | undefined>;
  upsertPageSection(tenantId: string, page: string, sectionKey: string, data: { contentAr?: any; contentEn?: any; isVisible?: boolean }): Promise<PageSection>;

  // Testimonials
  getTestimonials(tenantId: string): Promise<Testimonial[]>;
  createTestimonial(t: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: string, tenantId: string, t: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string, tenantId: string): Promise<void>;

  // Process Steps
  getProcessSteps(tenantId: string): Promise<ProcessStep[]>;
  createProcessStep(step: InsertProcessStep): Promise<ProcessStep>;
  updateProcessStep(id: string, tenantId: string, step: Partial<InsertProcessStep>): Promise<ProcessStep | undefined>;
  deleteProcessStep(id: string, tenantId: string): Promise<void>;

  // Why Us Items
  getWhyUsItems(tenantId: string): Promise<WhyUsItem[]>;
  createWhyUsItem(item: InsertWhyUsItem): Promise<WhyUsItem>;
  updateWhyUsItem(id: string, tenantId: string, item: Partial<InsertWhyUsItem>): Promise<WhyUsItem | undefined>;
  deleteWhyUsItem(id: string, tenantId: string): Promise<void>;

  // About Values
  getAboutValues(tenantId: string): Promise<AboutValue[]>;
  createAboutValue(v: InsertAboutValue): Promise<AboutValue>;
  updateAboutValue(id: string, tenantId: string, v: Partial<InsertAboutValue>): Promise<AboutValue | undefined>;
  deleteAboutValue(id: string, tenantId: string): Promise<void>;

  // About Timeline
  getAboutTimeline(tenantId: string): Promise<AboutTimeline[]>;
  createAboutTimelineItem(item: InsertAboutTimeline): Promise<AboutTimeline>;
  updateAboutTimelineItem(id: string, tenantId: string, item: Partial<InsertAboutTimeline>): Promise<AboutTimeline | undefined>;
  deleteAboutTimelineItem(id: string, tenantId: string): Promise<void>;

  // Site Stats
  getSiteStats(tenantId: string): Promise<SiteStat[]>;
  createSiteStat(stat: InsertSiteStat): Promise<SiteStat>;
  updateSiteStat(id: string, tenantId: string, stat: Partial<InsertSiteStat>): Promise<SiteStat | undefined>;
  deleteSiteStat(id: string, tenantId: string): Promise<void>;

  // CRM - Lead Sources
  getCrmLeadSources(tenantId: string): Promise<CrmLeadSource[]>;
  createCrmLeadSource(source: InsertCrmLeadSource): Promise<CrmLeadSource>;
  updateCrmLeadSource(id: string, tenantId: string, source: Partial<InsertCrmLeadSource>): Promise<CrmLeadSource | undefined>;
  deleteCrmLeadSource(id: string, tenantId: string): Promise<void>;

  // CRM - Leads
  getCrmLeads(tenantId: string, filters?: { status?: string; sourceId?: string; assignedToId?: string; search?: string }): Promise<CrmLead[]>;
  getCrmLead(id: string, tenantId: string): Promise<CrmLead | undefined>;
  createCrmLead(lead: InsertCrmLead): Promise<CrmLead>;
  updateCrmLead(id: string, tenantId: string, lead: Partial<InsertCrmLead>): Promise<CrmLead | undefined>;
  deleteCrmLead(id: string, tenantId: string): Promise<void>;
  getCrmLeadsStats(tenantId: string): Promise<{ total: number; new: number; qualified: number; converted: number; lost: number; byStatus: Record<string, number>; bySource: Record<string, number> }>;

  // CRM - Deal Pipelines
  getCrmDealPipelines(tenantId: string): Promise<CrmDealPipeline[]>;
  getCrmDealPipeline(id: string, tenantId: string): Promise<CrmDealPipeline | undefined>;
  createCrmDealPipeline(pipeline: InsertCrmDealPipeline): Promise<CrmDealPipeline>;
  updateCrmDealPipeline(id: string, tenantId: string, pipeline: Partial<InsertCrmDealPipeline>): Promise<CrmDealPipeline | undefined>;
  deleteCrmDealPipeline(id: string, tenantId: string): Promise<void>;

  // CRM - Deal Stages
  getCrmDealStages(tenantId: string, pipelineId?: string): Promise<CrmDealStage[]>;
  createCrmDealStage(stage: InsertCrmDealStage): Promise<CrmDealStage>;
  updateCrmDealStage(id: string, tenantId: string, stage: Partial<InsertCrmDealStage>): Promise<CrmDealStage | undefined>;
  deleteCrmDealStage(id: string, tenantId: string): Promise<void>;

  // CRM - Deals
  getCrmDeals(tenantId: string, filters?: { status?: string; pipelineId?: string; stageId?: string; assignedToId?: string }): Promise<CrmDeal[]>;
  getCrmDeal(id: string, tenantId: string): Promise<CrmDeal | undefined>;
  createCrmDeal(deal: InsertCrmDeal): Promise<CrmDeal>;
  updateCrmDeal(id: string, tenantId: string, deal: Partial<InsertCrmDeal>): Promise<CrmDeal | undefined>;
  deleteCrmDeal(id: string, tenantId: string): Promise<void>;

  // CRM - Activities
  getCrmActivities(tenantId: string, entityType?: string, entityId?: string): Promise<CrmActivity[]>;
  createCrmActivity(activity: InsertCrmActivity): Promise<CrmActivity>;
  deleteCrmActivity(id: string, tenantId: string): Promise<void>;

  // CRM - Tasks
  getCrmTasks(tenantId: string, filters?: { status?: string; assignedToId?: string; entityType?: string; entityId?: string }): Promise<CrmTask[]>;
  getCrmTask(id: string, tenantId: string): Promise<CrmTask | undefined>;
  createCrmTask(task: InsertCrmTask): Promise<CrmTask>;
  updateCrmTask(id: string, tenantId: string, task: Partial<InsertCrmTask>): Promise<CrmTask | undefined>;
  deleteCrmTask(id: string, tenantId: string): Promise<void>;

  // CRM - Proposals
  getCrmProposals(tenantId: string, filters?: { status?: string; dealId?: string; userId?: string }): Promise<CrmProposal[]>;
  getCrmProposal(id: string, tenantId: string): Promise<CrmProposal | undefined>;
  createCrmProposal(proposal: InsertCrmProposal): Promise<CrmProposal>;
  updateCrmProposal(id: string, tenantId: string, proposal: Partial<InsertCrmProposal>): Promise<CrmProposal | undefined>;
  deleteCrmProposal(id: string, tenantId: string): Promise<void>;

  // CRM - Proposal Items
  getCrmProposalItems(proposalId: string): Promise<CrmProposalItem[]>;
  createCrmProposalItem(item: InsertCrmProposalItem): Promise<CrmProposalItem>;
  updateCrmProposalItem(id: string, item: Partial<InsertCrmProposalItem>): Promise<CrmProposalItem | undefined>;
  deleteCrmProposalItem(id: string): Promise<void>;
  replaceProposalItems(proposalId: string, tenantId: string, items: Omit<InsertCrmProposalItem, 'proposalId' | 'tenantId'>[]): Promise<CrmProposalItem[]>;

  // Proposal Templates
  getProposalTemplates(tenantId: string): Promise<ProposalTemplate[]>;
  getProposalTemplate(id: string, tenantId: string): Promise<ProposalTemplate | undefined>;
  createProposalTemplate(data: InsertProposalTemplate): Promise<ProposalTemplate>;
  updateProposalTemplate(id: string, tenantId: string, data: Partial<InsertProposalTemplate>): Promise<ProposalTemplate | undefined>;
  deleteProposalTemplate(id: string, tenantId: string): Promise<void>;
  seedDefaultProposalTemplates(tenantId: string): Promise<void>;

  // Google Import Buffer
  getGoogleImportBuffer(tenantId: string): Promise<GoogleImportBuffer[]>;
  createGoogleImportBufferItem(data: InsertGoogleImportBuffer): Promise<GoogleImportBuffer>;
  updateGoogleImportBufferItem(id: string, tenantId: string, data: Partial<InsertGoogleImportBuffer>): Promise<GoogleImportBuffer | undefined>;
  deleteGoogleImportBufferItem(id: string, tenantId: string): Promise<void>;
  clearGoogleImportBuffer(tenantId: string): Promise<void>;

  // Service Library
  getServiceLibrary(tenantId: string): Promise<ServiceLibraryItem[]>;
  createServiceLibraryItem(data: InsertServiceLibraryItem): Promise<ServiceLibraryItem>;
  updateServiceLibraryItem(id: string, tenantId: string, data: Partial<InsertServiceLibraryItem>): Promise<ServiceLibraryItem | undefined>;
  deleteServiceLibraryItem(id: string, tenantId: string): Promise<void>;
  seedDefaultServiceLibrary(tenantId: string): Promise<void>;

  // Proposal extras
  cloneProposal(id: string, tenantId: string): Promise<CrmProposal>;
  signProposal(proposalId: string, tenantId: string, signature: string): Promise<CrmProposal | undefined>;
  incrementProposalViewCount(id: string, tenantId: string): Promise<void>;

  // CRM - Dashboard Stats
  getCrmDashboardStats(tenantId: string): Promise<{
    totalLeads: number; newLeadsToday: number; openDeals: number; openDealsValue: number;
    wonDealsThisMonth: number; lostDealsThisMonth: number; proposalsSent: number;
    overdueTasks: number; myTasksToday: number;
    leadsByStatus: Record<string, number>; leadsBySource: Record<string, number>;
    dealsByStage: Record<string, number>; recentLeads: CrmLead[];
  }>;

  // Phone Settings
  getPhoneSettings(tenantId: string): Promise<PhoneSetting[]>;
  getPhoneSettingByCategory(tenantId: string, category: string): Promise<PhoneSetting | undefined>;
  getDefaultPhoneSetting(tenantId: string): Promise<PhoneSetting | undefined>;
  createPhoneSetting(tenantId: string, data: InsertPhoneSetting): Promise<PhoneSetting>;
  updatePhoneSetting(id: string, tenantId: string, data: Partial<InsertPhoneSetting>): Promise<PhoneSetting | undefined>;
  deletePhoneSetting(id: string, tenantId: string): Promise<void>;

  // Visitor Time Series Analytics
  getVisitorTimeSeries(tenantId: string, opts?: { from?: Date; to?: Date }): Promise<{
    dailyVisits: Array<{ date: string; count: number; mobile: number; desktop: number }>;
    topPages: Array<{ pageUrl: string; count: number; percentage: number }>;
    kpi: { today: number; week: number; month: number; total: number };
  }>;

  // Notifications Polling
  getNotificationsPoll(tenantId: string, since: Date): Promise<{
    newVisitors: number;
    newLeads: number;
    newCrmLeads: number;
    recentVisitors: Array<{ country: string | null; city: string | null; pageUrl: string | null; deviceType: string | null }>;
    recentLeads: Array<{ name: string | null; email: string | null; phone: string | null }>;
    timestamp: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Tenants
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return db.select().from(tenants).limit(100);
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant || undefined;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string, tenantId?: string): Promise<User | undefined> {
    if (tenantId) {
      const [user] = await db.select().from(users).where(
        and(eq(users.email, email), eq(users.tenantId, tenantId))
      );
      return user || undefined;
    }
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTeamUsers(tenantId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.tenantId, tenantId)).orderBy(users.createdAt);
  }

  async updateUser(id: string, tenantId: string, update: Partial<Pick<User, "name"|"email"|"phone"|"role"|"status"|"permissions">>): Promise<User | undefined> {
    const [user] = await db.update(users).set(update).where(and(eq(users.id, id), eq(users.tenantId, tenantId))).returning();
    return user || undefined;
  }

  async deleteUser(id: string, tenantId: string): Promise<void> {
    // Delete/null FK references before deleting user to avoid constraint violations
    await db.delete(sessions).where(eq(sessions.userId, id));
    await db.delete(notifications).where(eq(notifications.userId, id));
    await db.update(companies).set({ ownerId: null }).where(eq(companies.ownerId, id));
    await db.update(crmLeads).set({ assignedToId: null }).where(eq(crmLeads.assignedToId, id));
    await db.update(crmLeads).set({ createdById: null }).where(eq(crmLeads.createdById, id));
    await db.update(crmDeals).set({ assignedToId: null }).where(eq(crmDeals.assignedToId, id));
    await db.update(crmDeals).set({ createdById: null }).where(eq(crmDeals.createdById, id));
    await db.update(crmProposals).set({ preparedById: null }).where(eq(crmProposals.preparedById, id));
    await db.update(crmProposals).set({ approvedById: null }).where(eq(crmProposals.approvedById, id));
    await db.update(crmProposals).set({ createdById: null }).where(eq(crmProposals.createdById, id));
    await db.update(crmTasks).set({ assignedToId: null }).where(eq(crmTasks.assignedToId, id));
    await db.update(crmTasks).set({ createdById: null }).where(eq(crmTasks.createdById, id));
    await db.update(googleImportBuffer).set({ createdBy: null }).where(eq(googleImportBuffer.createdBy, id));
    await db.delete(users).where(and(eq(users.id, id), eq(users.tenantId, tenantId)));
  }

  async updateUserPassword(id: string, tenantId: string, passwordHash: string): Promise<void> {
    await db.update(users).set({ passwordHash }).where(and(eq(users.id, id), eq(users.tenantId, tenantId)));
  }

  // Sessions
  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(sql`${sessions.expiresAt} < NOW()`);
  }

  // Subscriptions
  async getSubscriptionByTenantId(tenantId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenantId));
    return subscription || undefined;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }

  // Companies
  async getCompanies(tenantId: string, userId?: string): Promise<Company[]> {
    if (userId) {
      return db.select().from(companies).where(and(eq(companies.tenantId, tenantId), eq(companies.ownerId, userId))).orderBy(desc(companies.createdAt));
    }
    return db.select().from(companies).where(eq(companies.tenantId, tenantId)).orderBy(desc(companies.createdAt));
  }

  async getCompany(id: string, tenantId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(
      and(eq(companies.id, id), eq(companies.tenantId, tenantId))
    );
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: string, tenantId: string, update: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db.update(companies)
      .set({ ...update, updatedAt: new Date() })
      .where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)))
      .returning();
    return company || undefined;
  }

  async deleteCompany(id: string, tenantId: string): Promise<void> {
    // Delete child records first to avoid FK constraint violations
    await db.delete(crmActivities).where(eq(crmActivities.entityId, id));
    // Null out FK references before deleting to avoid constraint violations
    await db.update(contacts).set({ companyId: null }).where(eq(contacts.companyId, id));
    await db.update(crmDeals).set({ companyId: null }).where(eq(crmDeals.companyId, id));
    await db.update(crmProposals).set({ companyId: null }).where(eq(crmProposals.companyId, id));
    await db.update(googleImportBuffer).set({ importedCompanyId: null }).where(eq(googleImportBuffer.importedCompanyId, id));
    await db.delete(companies).where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)));
  }

  // Contacts
  async getContacts(tenantId: string, _userId?: string): Promise<Contact[]> {
    return db.select().from(contacts).where(eq(contacts.tenantId, tenantId)).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: string, tenantId: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(
      and(eq(contacts.id, id), eq(contacts.tenantId, tenantId))
    );
    return contact || undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: string, tenantId: string, update: Partial<InsertContact>): Promise<Contact | undefined> {
    const [contact] = await db.update(contacts)
      .set({ ...update, updatedAt: new Date() })
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)))
      .returning();
    return contact || undefined;
  }

  async deleteContact(id: string, tenantId: string): Promise<void> {
    // Delete child records first to avoid FK constraint violations
    await db.delete(crmActivities).where(eq(crmActivities.entityId, id));
    // Null out FK references before deleting to avoid constraint violations
    await db.update(crmDeals).set({ contactId: null }).where(eq(crmDeals.contactId, id));
    await db.update(crmProposals).set({ contactId: null }).where(eq(crmProposals.contactId, id));
    await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)));
  }

  // Activity Log
  async getActivityLogs(tenantId: string, limit: number = 10): Promise<ActivityLog[]> {
    return db.select().from(activityLog)
      .where(eq(activityLog.tenantId, tenantId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLog).values(insertLog).returning();
    return log;
  }

  // Dashboard Stats
  async getDashboardStats(tenantId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalCompaniesResult] = await db.select({ count: count() }).from(companies).where(eq(companies.tenantId, tenantId));
    const [totalContactsResult] = await db.select({ count: count() }).from(contacts).where(eq(contacts.tenantId, tenantId));
    const [newLeadsResult] = await db.select({ count: count() }).from(companies).where(
      and(
        eq(companies.tenantId, tenantId),
        eq(companies.status, "lead"),
        gte(companies.createdAt, startOfMonth)
      )
    );
    const [activeClientsResult] = await db.select({ count: count() }).from(companies).where(
      and(eq(companies.tenantId, tenantId), eq(companies.status, "client"))
    );
    
    const recentActivities = await this.getActivityLogs(tenantId, 5);
    const totalVisitors = await db.select({ count: count() }).from(visitorLogs).where(eq(visitorLogs.tenantId, tenantId));
    const visitorsLast30Days = await db.select({ count: count() }).from(visitorLogs).where(
      and(eq(visitorLogs.tenantId, tenantId), gte(visitorLogs.timestamp, last30Days))
    );

    return {
      totalCompanies: totalCompaniesResult?.count || 0,
      totalContacts: totalContactsResult?.count || 0,
      newLeadsThisMonth: newLeadsResult?.count || 0,
      activeClients: activeClientsResult?.count || 0,
      recentActivities,
      totalVisitors: totalVisitors[0]?.count || 0,
      visitorsLast30Days: visitorsLast30Days[0]?.count || 0,
    };
  }

  // ── Visitor Analytics ──────────────────────────────────────────────────
  async recordVisitor(log: InsertVisitorLog): Promise<VisitorLog> {
    const [record] = await db.insert(visitorLogs).values(log).returning();
    return record;
  }

  async getVisitorsAnalytics(tenantId: string, limit: number = 30): Promise<{
    topCountries: Array<{ country: string; count: number }>;
    topCities: Array<{ city: string; country: string; count: number }>;
    topPages: Array<{ pageUrl: string; count: number }>;
    recent: VisitorLog[];
  }> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const topCountries = await db.select({
      country: visitorLogs.country,
      count: count().as("count"),
    })
      .from(visitorLogs)
      .where(and(eq(visitorLogs.tenantId, tenantId), gte(visitorLogs.timestamp, last30Days)))
      .groupBy(visitorLogs.country)
      .orderBy(desc(count()))
      .limit(10);

    const topCities = await db.select({
      city: visitorLogs.city,
      country: visitorLogs.country,
      count: count().as("count"),
    })
      .from(visitorLogs)
      .where(and(eq(visitorLogs.tenantId, tenantId), gte(visitorLogs.timestamp, last30Days)))
      .groupBy(visitorLogs.city, visitorLogs.country)
      .orderBy(desc(count()))
      .limit(10);

    const topPages = await db.select({
      pageUrl: visitorLogs.pageUrl,
      count: count().as("count"),
    })
      .from(visitorLogs)
      .where(and(eq(visitorLogs.tenantId, tenantId), gte(visitorLogs.timestamp, last30Days)))
      .groupBy(visitorLogs.pageUrl)
      .orderBy(desc(count()))
      .limit(10);

    const recent = await db.select()
      .from(visitorLogs)
      .where(eq(visitorLogs.tenantId, tenantId))
      .orderBy(desc(visitorLogs.timestamp))
      .limit(limit);

    return { topCountries, topCities, topPages, recent };
  }

  async getVisitorDetails(tenantId: string, opts?: {
    country?: string;
    deviceType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: VisitorLog[]; total: number; byDevice: Array<{ deviceType: string | null; count: number }>; byBrowser: Array<{ browser: string | null; count: number }>; byOS: Array<{ osName: string | null; count: number }> }> {
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;
    const conditions: any[] = [eq(visitorLogs.tenantId, tenantId)];
    if (opts?.country) conditions.push(eq(visitorLogs.country, opts.country));
    if (opts?.deviceType) conditions.push(eq(visitorLogs.deviceType, opts.deviceType));
    if (opts?.dateFrom) conditions.push(gte(visitorLogs.timestamp, opts.dateFrom));
    if (opts?.dateTo) conditions.push(lte(visitorLogs.timestamp, opts.dateTo));
    const where = and(...conditions);

    const [totalResult] = await db.select({ count: count() }).from(visitorLogs).where(where);
    const logs = await db.select().from(visitorLogs).where(where).orderBy(desc(visitorLogs.timestamp)).limit(limit).offset(offset);

    const byDevice = await db.select({ deviceType: visitorLogs.deviceType, count: count().as("count") })
      .from(visitorLogs).where(eq(visitorLogs.tenantId, tenantId)).groupBy(visitorLogs.deviceType).orderBy(desc(count()));
    const byBrowser = await db.select({ browser: visitorLogs.browser, count: count().as("count") })
      .from(visitorLogs).where(eq(visitorLogs.tenantId, tenantId)).groupBy(visitorLogs.browser).orderBy(desc(count()));
    const byOS = await db.select({ osName: visitorLogs.osName, count: count().as("count") })
      .from(visitorLogs).where(eq(visitorLogs.tenantId, tenantId)).groupBy(visitorLogs.osName).orderBy(desc(count()));

    return { logs, total: totalResult?.count || 0, byDevice, byBrowser, byOS };
  }

  // ── Visitor Time Series Analytics ─────────────────────────────────────────
  async getVisitorTimeSeries(tenantId: string, opts?: {
    from?: Date;
    to?: Date;
  }): Promise<{
    dailyVisits: Array<{ date: string; count: number; mobile: number; desktop: number }>;
    topPages: Array<{ pageUrl: string; count: number; percentage: number }>;
    kpi: { today: number; week: number; month: number; total: number };
  }> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dateFrom = opts?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = opts?.to || now;

    const dailyRaw = await db.execute(sql`
      SELECT
        DATE_TRUNC('day', timestamp)::date AS day,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE device_type = 'mobile')::int AS mobile,
        COUNT(*) FILTER (WHERE device_type = 'desktop')::int AS desktop
      FROM visitor_logs
      WHERE tenant_id = ${tenantId}
        AND timestamp >= ${dateFrom}
        AND timestamp <= ${dateTo}
      GROUP BY day
      ORDER BY day ASC
    `);

    const dailyVisits = (dailyRaw.rows || []).map((r: any) => ({
      date: new Date(r.day).toISOString().slice(0, 10),
      count: Number(r.total) || 0,
      mobile: Number(r.mobile) || 0,
      desktop: Number(r.desktop) || 0,
    }));

    const topPagesRaw = await db.select({
      pageUrl: visitorLogs.pageUrl,
      count: count().as("count"),
    })
      .from(visitorLogs)
      .where(and(
        eq(visitorLogs.tenantId, tenantId),
        gte(visitorLogs.timestamp, dateFrom),
        lte(visitorLogs.timestamp, dateTo),
      ))
      .groupBy(visitorLogs.pageUrl)
      .orderBy(desc(count()))
      .limit(15);

    const [todayResult] = await db.select({ count: count() }).from(visitorLogs).where(
      and(eq(visitorLogs.tenantId, tenantId), gte(visitorLogs.timestamp, startOfToday))
    );
    const [weekResult] = await db.select({ count: count() }).from(visitorLogs).where(
      and(eq(visitorLogs.tenantId, tenantId), gte(visitorLogs.timestamp, last7Days))
    );
    const [monthResult] = await db.select({ count: count() }).from(visitorLogs).where(
      and(eq(visitorLogs.tenantId, tenantId), gte(visitorLogs.timestamp, last30Days))
    );
    const [totalResult] = await db.select({ count: count() }).from(visitorLogs).where(
      eq(visitorLogs.tenantId, tenantId)
    );

    const totalInRange = dailyVisits.reduce((sum, d) => sum + d.count, 0) || 1;

    return {
      dailyVisits,
      topPages: topPagesRaw.map(p => ({
        pageUrl: p.pageUrl || "/",
        count: Number(p.count),
        percentage: Math.round((Number(p.count) / totalInRange) * 100),
      })),
      kpi: {
        today: todayResult?.count || 0,
        week: weekResult?.count || 0,
        month: monthResult?.count || 0,
        total: totalResult?.count || 0,
      },
    };
  }

  // ── Notifications Polling ──────────────────────────────────────────────────
  async getNotificationsPoll(tenantId: string, since: Date): Promise<{
    newVisitors: number;
    newLeads: number;
    newCrmLeads: number;
    recentVisitors: Array<{ country: string | null; city: string | null; pageUrl: string | null; deviceType: string | null }>;
    recentLeads: Array<{ name: string | null; email: string | null; phone: string | null }>;
    timestamp: string;
  }> {
    const [visitorsResult] = await db.select({ count: count() }).from(visitorLogs).where(
      and(eq(visitorLogs.tenantId, tenantId), gte(visitorLogs.timestamp, since))
    );
    const [leadsResult] = await db.select({ count: count() }).from(formLeads).where(
      and(eq(formLeads.tenantId, tenantId), gte(formLeads.createdAt, since))
    );
    const [crmLeadsResult] = await db.select({ count: count() }).from(crmLeads).where(
      and(eq(crmLeads.tenantId, tenantId), gte(crmLeads.createdAt, since))
    );

    const recentVisitors = await db.select({
      country: visitorLogs.country,
      city: visitorLogs.city,
      pageUrl: visitorLogs.pageUrl,
      deviceType: visitorLogs.deviceType,
    }).from(visitorLogs).where(
      and(eq(visitorLogs.tenantId, tenantId), gte(visitorLogs.timestamp, since))
    ).orderBy(desc(visitorLogs.timestamp)).limit(3);

    const recentLeads = await db.select({
      name: formLeads.name,
      email: formLeads.email,
      phone: formLeads.phone,
    }).from(formLeads).where(
      and(eq(formLeads.tenantId, tenantId), gte(formLeads.createdAt, since))
    ).orderBy(desc(formLeads.createdAt)).limit(3);

    return {
      newVisitors: visitorsResult?.count || 0,
      newLeads: leadsResult?.count || 0,
      newCrmLeads: crmLeadsResult?.count || 0,
      recentVisitors,
      recentLeads,
      timestamp: new Date().toISOString(),
    };
  }

  // ── Contact Interaction Analytics (GA4) ──────────────────────────────────
  async recordContactEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [record] = await db.insert(analyticsEvents).values(event).returning();
    return record;
  }

  async getContactInteractionStats(tenantId: string): Promise<{
    total: number;
    byButton: Array<{ buttonType: string; count: number }>;
    last7Days: number;
  }> {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalResult] = await db.select({ count: count() }).from(analyticsEvents).where(eq(analyticsEvents.tenantId, tenantId));
    const [last7Result] = await db.select({ count: count() }).from(analyticsEvents).where(
      and(eq(analyticsEvents.tenantId, tenantId), gte(analyticsEvents.timestamp, last7Days))
    );

    const byButton = await db.select({
      buttonType: analyticsEvents.buttonType,
      count: count().as("count"),
    })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.tenantId, tenantId), gte(analyticsEvents.timestamp, last7Days)))
      .groupBy(analyticsEvents.buttonType)
      .orderBy(desc(count()));

    return {
      total: totalResult?.count || 0,
      byButton,
      last7Days: last7Result?.count || 0,
    };
  }

  // Auth Helper
  async getAuthenticatedUser(userId: string): Promise<AuthenticatedUser | null> {
    const user = await this.getUser(userId);
    if (!user) return null;

    const tenant = await this.getTenant(user.tenantId);
    if (!tenant) return null;

    const subscription = await this.getSubscriptionByTenantId(user.tenantId);

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      tenant,
      subscription: subscription || null,
    };
  }

  // ============================================================
  // SERVICES (CMS)
  // ============================================================
  async getServices(tenantId: string): Promise<Service[]> {
    return db.select().from(services)
      .where(eq(services.tenantId, tenantId))
      .orderBy(asc(services.displayOrder), asc(services.createdAt));
  }

  async getServiceBySlug(slug: string, tenantId: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(
      and(eq(services.slug, slug), eq(services.tenantId, tenantId))
    );
    return service || undefined;
  }

  async getService(id: string, tenantId: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(
      and(eq(services.id, id), eq(services.tenantId, tenantId))
    );
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: string, tenantId: string, update: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db.update(services)
      .set({ ...update, updatedAt: new Date() })
      .where(and(eq(services.id, id), eq(services.tenantId, tenantId)))
      .returning();
    return service || undefined;
  }

  async deleteService(id: string, tenantId: string): Promise<void> {
    await db.delete(services).where(and(eq(services.id, id), eq(services.tenantId, tenantId)));
  }

  // ============================================================
  // PROJECTS (CMS)
  // ============================================================
  async getProjects(tenantId: string): Promise<Project[]> {
    return db.select().from(projects)
      .where(eq(projects.tenantId, tenantId))
      .orderBy(asc(projects.displayOrder), desc(projects.createdAt));
  }

  async getProjectBySlug(slug: string, tenantId: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(
      and(eq(projects.slug, slug), eq(projects.tenantId, tenantId))
    );
    return project || undefined;
  }

  async getProject(id: string, tenantId: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(
      and(eq(projects.id, id), eq(projects.tenantId, tenantId))
    );
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, tenantId: string, update: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db.update(projects)
      .set({ ...update, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.tenantId, tenantId)))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string, tenantId: string): Promise<void> {
    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.tenantId, tenantId)));
  }

  // ============================================================
  // BLOG CATEGORIES (CMS)
  // ============================================================
  async getBlogCategories(tenantId: string): Promise<BlogCategory[]> {
    return db.select().from(blogCategories)
      .where(eq(blogCategories.tenantId, tenantId))
      .orderBy(asc(blogCategories.name));
  }

  async createBlogCategory(insertCat: InsertBlogCategory): Promise<BlogCategory> {
    const [cat] = await db.insert(blogCategories).values(insertCat).returning();
    return cat;
  }

  async deleteBlogCategory(id: string, tenantId: string): Promise<void> {
    // Null out FK references before deleting to avoid constraint violations
    await db.update(blogPosts).set({ categoryId: null }).where(eq(blogPosts.categoryId, id));
    await db.delete(blogCategories).where(
      and(eq(blogCategories.id, id), eq(blogCategories.tenantId, tenantId))
    );
  }

  // ============================================================
  // BLOG POSTS (CMS)
  // ============================================================
  async getBlogPosts(tenantId: string): Promise<BlogPost[]> {
    return db.select().from(blogPosts)
      .where(eq(blogPosts.tenantId, tenantId))
      .orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostBySlug(slug: string, tenantId: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(
      and(eq(blogPosts.slug, slug), eq(blogPosts.tenantId, tenantId))
    );
    return post || undefined;
  }

  async getBlogPost(id: string, tenantId: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(
      and(eq(blogPosts.id, id), eq(blogPosts.tenantId, tenantId))
    );
    return post || undefined;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  async updateBlogPost(id: string, tenantId: string, update: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [post] = await db.update(blogPosts)
      .set({ ...update, updatedAt: new Date() })
      .where(and(eq(blogPosts.id, id), eq(blogPosts.tenantId, tenantId)))
      .returning();
    return post || undefined;
  }

  async deleteBlogPost(id: string, tenantId: string): Promise<void> {
    await db.delete(blogPosts).where(and(eq(blogPosts.id, id), eq(blogPosts.tenantId, tenantId)));
  }

  // ============================================================
  // SITE CLIENTS (CMS)
  // ============================================================
  async getSiteClients(tenantId: string): Promise<SiteClient[]> {
    return db.select().from(siteClients)
      .where(eq(siteClients.tenantId, tenantId))
      .orderBy(asc(siteClients.displayOrder));
  }

  async createSiteClient(insertClient: InsertSiteClient): Promise<SiteClient> {
    const [client] = await db.insert(siteClients).values(insertClient).returning();
    return client;
  }

  async updateSiteClient(id: string, tenantId: string, update: Partial<InsertSiteClient>): Promise<SiteClient | undefined> {
    const [client] = await db.update(siteClients)
      .set(update)
      .where(and(eq(siteClients.id, id), eq(siteClients.tenantId, tenantId)))
      .returning();
    return client || undefined;
  }

  async deleteSiteClient(id: string, tenantId: string): Promise<void> {
    await db.delete(siteClients).where(and(eq(siteClients.id, id), eq(siteClients.tenantId, tenantId)));
  }

  // ============================================================
  // REDIRECTS
  // ============================================================
  async getRedirects(tenantId: string): Promise<Redirect[]> {
    return db.select().from(redirects)
      .where(eq(redirects.tenantId, tenantId))
      .orderBy(desc(redirects.createdAt));
  }

  async getRedirectByFromUrl(fromUrl: string, tenantId: string): Promise<Redirect | undefined> {
    const [redirect] = await db.select().from(redirects).where(
      and(eq(redirects.fromUrl, fromUrl), eq(redirects.tenantId, tenantId), eq(redirects.isActive, true))
    );
    return redirect || undefined;
  }

  async createRedirect(insertRedirect: InsertRedirect): Promise<Redirect> {
    const [redirect] = await db.insert(redirects).values(insertRedirect).returning();
    return redirect;
  }

  async updateRedirect(id: string, tenantId: string, update: Partial<InsertRedirect>): Promise<Redirect | undefined> {
    const [redirect] = await db.update(redirects)
      .set(update)
      .where(and(eq(redirects.id, id), eq(redirects.tenantId, tenantId)))
      .returning();
    return redirect || undefined;
  }

  async deleteRedirect(id: string, tenantId: string): Promise<void> {
    await db.delete(redirects).where(and(eq(redirects.id, id), eq(redirects.tenantId, tenantId)));
  }

  async incrementRedirectHit(id: string): Promise<void> {
    await db.update(redirects)
      .set({ hitCount: sql`${redirects.hitCount} + 1` })
      .where(eq(redirects.id, id));
  }

  // ============================================================
  // MARKETING SETTINGS
  // ============================================================
  async getMarketingSettings(tenantId: string): Promise<MarketingSettings | undefined> {
    const [setting] = await db.select().from(marketingSettings).where(eq(marketingSettings.tenantId, tenantId));
    return setting || undefined;
  }

  async upsertMarketingSettings(tenantId: string, settingsData: Partial<InsertMarketingSettings>): Promise<MarketingSettings> {
    const existing = await this.getMarketingSettings(tenantId);
    if (existing) {
      const [updated] = await db.update(marketingSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(marketingSettings.tenantId, tenantId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(marketingSettings)
        .values({ tenantId, ...settingsData } as InsertMarketingSettings)
        .returning();
      return created;
    }
  }

  // ============================================================
  // NEWSLETTER SUBSCRIBERS
  // ============================================================
  async getNewsletterSubscribers(tenantId: string): Promise<NewsletterSubscriber[]> {
    return db.select().from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.tenantId, tenantId))
      .orderBy(desc(newsletterSubscribers.createdAt));
  }

  async addNewsletterSubscriber(sub: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [record] = await db.insert(newsletterSubscribers).values(sub).returning();
    return record;
  }

  async updateNewsletterSubscriber(id: string, tenantId: string, data: Partial<InsertNewsletterSubscriber>): Promise<NewsletterSubscriber | undefined> {
    const [record] = await db.update(newsletterSubscribers)
      .set(data)
      .where(and(eq(newsletterSubscribers.id, id), eq(newsletterSubscribers.tenantId, tenantId)))
      .returning();
    return record || undefined;
  }

  async deleteNewsletterSubscriber(id: string, tenantId: string): Promise<void> {
    await db.delete(newsletterSubscribers).where(and(eq(newsletterSubscribers.id, id), eq(newsletterSubscribers.tenantId, tenantId)));
  }

  async getNewsletterSubscriberByEmail(email: string, tenantId: string): Promise<NewsletterSubscriber | undefined> {
    const [record] = await db.select().from(newsletterSubscribers)
      .where(and(eq(newsletterSubscribers.email, email), eq(newsletterSubscribers.tenantId, tenantId)));
    return record || undefined;
  }

  // ============================================================
  // PRICING PLANS
  // ============================================================
  async getPricingPlans(tenantId: string): Promise<PricingPlan[]> {
    return db.select().from(pricingPlans)
      .where(eq(pricingPlans.tenantId, tenantId))
      .orderBy(asc(pricingPlans.displayOrder));
  }

  async createPricingPlan(plan: InsertPricingPlan): Promise<PricingPlan> {
    const [record] = await db.insert(pricingPlans).values(plan).returning();
    return record;
  }

  async updatePricingPlan(id: string, tenantId: string, plan: Partial<InsertPricingPlan>): Promise<PricingPlan | undefined> {
    const [record] = await db.update(pricingPlans)
      .set(plan)
      .where(and(eq(pricingPlans.id, id), eq(pricingPlans.tenantId, tenantId)))
      .returning();
    return record || undefined;
  }

  async deletePricingPlan(id: string, tenantId: string): Promise<void> {
    await db.delete(pricingPlans).where(and(eq(pricingPlans.id, id), eq(pricingPlans.tenantId, tenantId)));
  }

  // ============================================================
  // FORM LEADS
  // ============================================================
  async getFormLeads(tenantId: string): Promise<FormLead[]> {
    return db.select().from(formLeads)
      .where(eq(formLeads.tenantId, tenantId))
      .orderBy(desc(formLeads.createdAt));
  }

  async createFormLead(insertLead: InsertFormLead): Promise<FormLead> {
    const [lead] = await db.insert(formLeads).values(insertLead).returning();
    return lead;
  }

  async updateFormLead(id: string, tenantId: string, update: Partial<InsertFormLead>): Promise<FormLead | undefined> {
    const [lead] = await db.update(formLeads)
      .set(update)
      .where(and(eq(formLeads.id, id), eq(formLeads.tenantId, tenantId)))
      .returning();
    return lead || undefined;
  }

  async deleteFormLead(id: string, tenantId: string): Promise<void> {
    await db.delete(formLeads).where(and(eq(formLeads.id, id), eq(formLeads.tenantId, tenantId)));
  }

  // ============================================================
  // SITE SETTINGS (Branding)
  // ============================================================
  async getSiteSettings(tenantId: string): Promise<SiteSettings | undefined> {
    const [s] = await db.select().from(siteSettings).where(eq(siteSettings.tenantId, tenantId));
    return s || undefined;
  }

  async upsertSiteSettings(tenantId: string, data: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSiteSettings(tenantId);
    if (existing) {
      const [updated] = await db.update(siteSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(siteSettings.tenantId, tenantId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(siteSettings)
      .values({ tenantId, ...data } as InsertSiteSettings)
      .returning();
    return created;
  }

  // ============================================================
  // PAGE SECTIONS
  // ============================================================
  async getPageSections(tenantId: string, page: string): Promise<PageSection[]> {
    return db.select().from(pageSections)
      .where(and(eq(pageSections.tenantId, tenantId), eq(pageSections.page, page)))
      .orderBy(asc(pageSections.displayOrder));
  }

  async getPageSection(tenantId: string, page: string, sectionKey: string): Promise<PageSection | undefined> {
    const [s] = await db.select().from(pageSections)
      .where(and(eq(pageSections.tenantId, tenantId), eq(pageSections.page, page), eq(pageSections.sectionKey, sectionKey)));
    return s || undefined;
  }

  async upsertPageSection(tenantId: string, page: string, sectionKey: string, data: { contentAr?: any; contentEn?: any; isVisible?: boolean }): Promise<PageSection> {
    const existing = await this.getPageSection(tenantId, page, sectionKey);
    if (existing) {
      const [updated] = await db.update(pageSections)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(pageSections.tenantId, tenantId), eq(pageSections.page, page), eq(pageSections.sectionKey, sectionKey)))
        .returning();
      return updated;
    }
    const [created] = await db.insert(pageSections)
      .values({ tenantId, page, sectionKey, ...data } as InsertPageSection)
      .returning();
    return created;
  }

  // ============================================================
  // TESTIMONIALS
  // ============================================================
  async getTestimonials(tenantId: string): Promise<Testimonial[]> {
    return db.select().from(testimonials)
      .where(eq(testimonials.tenantId, tenantId))
      .orderBy(asc(testimonials.displayOrder));
  }

  async createTestimonial(t: InsertTestimonial): Promise<Testimonial> {
    const [row] = await db.insert(testimonials).values(t).returning();
    return row;
  }

  async updateTestimonial(id: string, tenantId: string, t: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [row] = await db.update(testimonials)
      .set(t)
      .where(and(eq(testimonials.id, id), eq(testimonials.tenantId, tenantId)))
      .returning();
    return row || undefined;
  }

  async deleteTestimonial(id: string, tenantId: string): Promise<void> {
    await db.delete(testimonials).where(and(eq(testimonials.id, id), eq(testimonials.tenantId, tenantId)));
  }

  // ============================================================
  // PROCESS STEPS
  // ============================================================
  async getProcessSteps(tenantId: string): Promise<ProcessStep[]> {
    return db.select().from(processSteps)
      .where(eq(processSteps.tenantId, tenantId))
      .orderBy(asc(processSteps.displayOrder));
  }

  async createProcessStep(step: InsertProcessStep): Promise<ProcessStep> {
    const [row] = await db.insert(processSteps).values(step).returning();
    return row;
  }

  async updateProcessStep(id: string, tenantId: string, step: Partial<InsertProcessStep>): Promise<ProcessStep | undefined> {
    const [row] = await db.update(processSteps)
      .set(step)
      .where(and(eq(processSteps.id, id), eq(processSteps.tenantId, tenantId)))
      .returning();
    return row || undefined;
  }

  async deleteProcessStep(id: string, tenantId: string): Promise<void> {
    await db.delete(processSteps).where(and(eq(processSteps.id, id), eq(processSteps.tenantId, tenantId)));
  }

  // ============================================================
  // WHY US ITEMS
  // ============================================================
  async getWhyUsItems(tenantId: string): Promise<WhyUsItem[]> {
    return db.select().from(whyUsItems)
      .where(eq(whyUsItems.tenantId, tenantId))
      .orderBy(asc(whyUsItems.displayOrder));
  }

  async createWhyUsItem(item: InsertWhyUsItem): Promise<WhyUsItem> {
    const [row] = await db.insert(whyUsItems).values(item).returning();
    return row;
  }

  async updateWhyUsItem(id: string, tenantId: string, item: Partial<InsertWhyUsItem>): Promise<WhyUsItem | undefined> {
    const [row] = await db.update(whyUsItems)
      .set(item)
      .where(and(eq(whyUsItems.id, id), eq(whyUsItems.tenantId, tenantId)))
      .returning();
    return row || undefined;
  }

  async deleteWhyUsItem(id: string, tenantId: string): Promise<void> {
    await db.delete(whyUsItems).where(and(eq(whyUsItems.id, id), eq(whyUsItems.tenantId, tenantId)));
  }

  // ============================================================
  // ABOUT VALUES
  // ============================================================
  async getAboutValues(tenantId: string): Promise<AboutValue[]> {
    return db.select().from(aboutValues)
      .where(eq(aboutValues.tenantId, tenantId))
      .orderBy(asc(aboutValues.displayOrder));
  }

  async createAboutValue(v: InsertAboutValue): Promise<AboutValue> {
    const [row] = await db.insert(aboutValues).values(v).returning();
    return row;
  }

  async updateAboutValue(id: string, tenantId: string, v: Partial<InsertAboutValue>): Promise<AboutValue | undefined> {
    const [row] = await db.update(aboutValues)
      .set(v)
      .where(and(eq(aboutValues.id, id), eq(aboutValues.tenantId, tenantId)))
      .returning();
    return row || undefined;
  }

  async deleteAboutValue(id: string, tenantId: string): Promise<void> {
    await db.delete(aboutValues).where(and(eq(aboutValues.id, id), eq(aboutValues.tenantId, tenantId)));
  }

  // ============================================================
  // ABOUT TIMELINE
  // ============================================================
  async getAboutTimeline(tenantId: string): Promise<AboutTimeline[]> {
    return db.select().from(aboutTimeline)
      .where(eq(aboutTimeline.tenantId, tenantId))
      .orderBy(asc(aboutTimeline.displayOrder));
  }

  async createAboutTimelineItem(item: InsertAboutTimeline): Promise<AboutTimeline> {
    const [row] = await db.insert(aboutTimeline).values(item).returning();
    return row;
  }

  async updateAboutTimelineItem(id: string, tenantId: string, item: Partial<InsertAboutTimeline>): Promise<AboutTimeline | undefined> {
    const [row] = await db.update(aboutTimeline)
      .set(item)
      .where(and(eq(aboutTimeline.id, id), eq(aboutTimeline.tenantId, tenantId)))
      .returning();
    return row || undefined;
  }

  async deleteAboutTimelineItem(id: string, tenantId: string): Promise<void> {
    await db.delete(aboutTimeline).where(and(eq(aboutTimeline.id, id), eq(aboutTimeline.tenantId, tenantId)));
  }

  // ============================================================
  // SITE STATS
  // ============================================================
  async getSiteStats(tenantId: string): Promise<SiteStat[]> {
    return db.select().from(siteStats)
      .where(eq(siteStats.tenantId, tenantId))
      .orderBy(asc(siteStats.displayOrder));
  }

  async createSiteStat(stat: InsertSiteStat): Promise<SiteStat> {
    const [row] = await db.insert(siteStats).values(stat).returning();
    return row;
  }

  async updateSiteStat(id: string, tenantId: string, stat: Partial<InsertSiteStat>): Promise<SiteStat | undefined> {
    const [row] = await db.update(siteStats)
      .set(stat)
      .where(and(eq(siteStats.id, id), eq(siteStats.tenantId, tenantId)))
      .returning();
    return row || undefined;
  }

  async deleteSiteStat(id: string, tenantId: string): Promise<void> {
    await db.delete(siteStats).where(and(eq(siteStats.id, id), eq(siteStats.tenantId, tenantId)));
  }

  // ── CRM Lead Sources ──────────────────────────────────────────────────────
  async getCrmLeadSources(tenantId: string): Promise<CrmLeadSource[]> {
    return db.select().from(crmLeadSources).where(eq(crmLeadSources.tenantId, tenantId)).orderBy(asc(crmLeadSources.displayOrder));
  }
  async createCrmLeadSource(source: InsertCrmLeadSource): Promise<CrmLeadSource> {
    const [row] = await db.insert(crmLeadSources).values(source).returning();
    return row;
  }
  async updateCrmLeadSource(id: string, tenantId: string, source: Partial<InsertCrmLeadSource>): Promise<CrmLeadSource | undefined> {
    const [row] = await db.update(crmLeadSources).set(source).where(and(eq(crmLeadSources.id, id), eq(crmLeadSources.tenantId, tenantId))).returning();
    return row;
  }
  async deleteCrmLeadSource(id: string, tenantId: string): Promise<void> {
    await db.delete(crmLeadSources).where(and(eq(crmLeadSources.id, id), eq(crmLeadSources.tenantId, tenantId)));
  }

  // ── CRM Leads ─────────────────────────────────────────────────────────────
  async getCrmLeads(tenantId: string, filters?: { status?: string; sourceId?: string; assignedToId?: string; search?: string }): Promise<CrmLead[]> {
    const conditions: any[] = [eq(crmLeads.tenantId, tenantId)];
    if (filters?.status) conditions.push(eq(crmLeads.status, filters.status));
    if (filters?.sourceId) conditions.push(eq(crmLeads.sourceId, filters.sourceId));
    if (filters?.assignedToId) conditions.push(eq(crmLeads.assignedToId, filters.assignedToId));
    const rows = await db.select().from(crmLeads).where(and(...conditions)).orderBy(desc(crmLeads.createdAt));
    if (!filters?.search) return rows;
    const s = filters.search.toLowerCase();
    return rows.filter(r => r.fullName?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s) || r.mobile?.includes(s) || r.companyName?.toLowerCase().includes(s));
  }
  async getCrmLead(id: string, tenantId: string): Promise<CrmLead | undefined> {
    const [row] = await db.select().from(crmLeads).where(and(eq(crmLeads.id, id), eq(crmLeads.tenantId, tenantId)));
    return row;
  }
  async createCrmLead(lead: InsertCrmLead): Promise<CrmLead> {
    const tenantLeads = await db.select({ id: crmLeads.id }).from(crmLeads).where(eq(crmLeads.tenantId, lead.tenantId));
    const num = `LEAD-${String(tenantLeads.length + 1).padStart(4, '0')}`;
    const [row] = await db.insert(crmLeads).values({ ...lead, leadNumber: num }).returning();
    return row;
  }
  async updateCrmLead(id: string, tenantId: string, lead: Partial<InsertCrmLead>): Promise<CrmLead | undefined> {
    const [row] = await db.update(crmLeads).set({ ...lead, updatedAt: new Date() }).where(and(eq(crmLeads.id, id), eq(crmLeads.tenantId, tenantId))).returning();
    return row;
  }
  async deleteCrmLead(id: string, tenantId: string): Promise<void> {
    // Null out FK references before deleting to avoid constraint violations
    await db.update(crmDeals).set({ leadId: null }).where(eq(crmDeals.leadId, id));
    await db.update(crmProposals).set({ leadId: null }).where(eq(crmProposals.leadId, id));
    await db.delete(crmLeads).where(and(eq(crmLeads.id, id), eq(crmLeads.tenantId, tenantId)));
  }
  async getCrmLeadsStats(tenantId: string) {
    const all = await db.select().from(crmLeads).where(eq(crmLeads.tenantId, tenantId));
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    for (const l of all) {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1;
      const src = l.sourceName || 'unknown';
      bySource[src] = (bySource[src] || 0) + 1;
    }
    return {
      total: all.length,
      new: all.filter(l => l.status === 'new').length,
      qualified: all.filter(l => l.status === 'qualified').length,
      converted: all.filter(l => l.status === 'converted').length,
      lost: all.filter(l => l.status === 'lost').length,
      byStatus,
      bySource,
    };
  }

  // ── CRM Deal Pipelines ────────────────────────────────────────────────────
  async getCrmDealPipelines(tenantId: string): Promise<CrmDealPipeline[]> {
    return db.select().from(crmDealPipelines).where(eq(crmDealPipelines.tenantId, tenantId)).orderBy(asc(crmDealPipelines.displayOrder));
  }
  async getCrmDealPipeline(id: string, tenantId: string): Promise<CrmDealPipeline | undefined> {
    const [row] = await db.select().from(crmDealPipelines).where(and(eq(crmDealPipelines.id, id), eq(crmDealPipelines.tenantId, tenantId)));
    return row;
  }
  async createCrmDealPipeline(pipeline: InsertCrmDealPipeline): Promise<CrmDealPipeline> {
    const [row] = await db.insert(crmDealPipelines).values(pipeline).returning();
    return row;
  }
  async updateCrmDealPipeline(id: string, tenantId: string, pipeline: Partial<InsertCrmDealPipeline>): Promise<CrmDealPipeline | undefined> {
    const [row] = await db.update(crmDealPipelines).set(pipeline).where(and(eq(crmDealPipelines.id, id), eq(crmDealPipelines.tenantId, tenantId))).returning();
    return row;
  }
  async deleteCrmDealPipeline(id: string, tenantId: string): Promise<void> {
    await db.delete(crmDealPipelines).where(and(eq(crmDealPipelines.id, id), eq(crmDealPipelines.tenantId, tenantId)));
  }

  // ── CRM Deal Stages ───────────────────────────────────────────────────────
  async getCrmDealStages(tenantId: string, pipelineId?: string): Promise<CrmDealStage[]> {
    if (pipelineId) {
      return db.select().from(crmDealStages).where(and(eq(crmDealStages.tenantId, tenantId), eq(crmDealStages.pipelineId, pipelineId))).orderBy(asc(crmDealStages.displayOrder));
    }
    return db.select().from(crmDealStages).where(eq(crmDealStages.tenantId, tenantId)).orderBy(asc(crmDealStages.displayOrder));
  }
  async createCrmDealStage(stage: InsertCrmDealStage): Promise<CrmDealStage> {
    const [row] = await db.insert(crmDealStages).values(stage).returning();
    return row;
  }
  async updateCrmDealStage(id: string, tenantId: string, stage: Partial<InsertCrmDealStage>): Promise<CrmDealStage | undefined> {
    const [row] = await db.update(crmDealStages).set(stage).where(and(eq(crmDealStages.id, id), eq(crmDealStages.tenantId, tenantId))).returning();
    return row;
  }
  async deleteCrmDealStage(id: string, tenantId: string): Promise<void> {
    await db.delete(crmDealStages).where(and(eq(crmDealStages.id, id), eq(crmDealStages.tenantId, tenantId)));
  }

  // ── CRM Deals ─────────────────────────────────────────────────────────────
  async getCrmDeals(tenantId: string, filters?: { status?: string; pipelineId?: string; stageId?: string; assignedToId?: string }): Promise<CrmDeal[]> {
    let conditions = [eq(crmDeals.tenantId, tenantId)];
    if (filters?.status) conditions.push(eq(crmDeals.status, filters.status));
    if (filters?.pipelineId) conditions.push(eq(crmDeals.pipelineId, filters.pipelineId));
    if (filters?.stageId) conditions.push(eq(crmDeals.stageId, filters.stageId));
    if (filters?.assignedToId) conditions.push(eq(crmDeals.assignedToId, filters.assignedToId));
    return db.select().from(crmDeals).where(and(...conditions)).orderBy(desc(crmDeals.createdAt));
  }
  async getCrmDeal(id: string, tenantId: string): Promise<CrmDeal | undefined> {
    const [row] = await db.select().from(crmDeals).where(and(eq(crmDeals.id, id), eq(crmDeals.tenantId, tenantId)));
    return row;
  }
  async createCrmDeal(deal: InsertCrmDeal): Promise<CrmDeal> {
    const tenantDeals = await db.select({ id: crmDeals.id }).from(crmDeals).where(eq(crmDeals.tenantId, deal.tenantId));
    const num = `DEAL-${String(tenantDeals.length + 1).padStart(4, '0')}`;
    const [row] = await db.insert(crmDeals).values({ ...deal, dealNumber: num }).returning();
    return row;
  }
  async updateCrmDeal(id: string, tenantId: string, deal: Partial<InsertCrmDeal>): Promise<CrmDeal | undefined> {
    const [row] = await db.update(crmDeals).set({ ...deal, updatedAt: new Date() }).where(and(eq(crmDeals.id, id), eq(crmDeals.tenantId, tenantId))).returning();
    return row;
  }
  async deleteCrmDeal(id: string, tenantId: string): Promise<void> {
    // Null out FK references before deleting to avoid constraint violations
    await db.update(crmProposals).set({ dealId: null }).where(eq(crmProposals.dealId, id));
    await db.delete(crmDeals).where(and(eq(crmDeals.id, id), eq(crmDeals.tenantId, tenantId)));
  }

  // ── CRM Activities ────────────────────────────────────────────────────────
  async getCrmActivities(tenantId: string, entityType?: string, entityId?: string): Promise<CrmActivity[]> {
    let conditions = [eq(crmActivities.tenantId, tenantId)];
    if (entityType) conditions.push(eq(crmActivities.entityType, entityType));
    if (entityId) conditions.push(eq(crmActivities.entityId, entityId));
    return db.select().from(crmActivities).where(and(...conditions)).orderBy(desc(crmActivities.createdAt));
  }
  async createCrmActivity(activity: InsertCrmActivity): Promise<CrmActivity> {
    const [row] = await db.insert(crmActivities).values(activity).returning();
    return row;
  }
  async deleteCrmActivity(id: string, tenantId: string): Promise<void> {
    await db.delete(crmActivities).where(and(eq(crmActivities.id, id), eq(crmActivities.tenantId, tenantId)));
  }

  // ── CRM Tasks ─────────────────────────────────────────────────────────────
  async getCrmTasks(tenantId: string, filters?: { status?: string; assignedToId?: string; entityType?: string; entityId?: string }): Promise<CrmTask[]> {
    let conditions = [eq(crmTasks.tenantId, tenantId)];
    if (filters?.status) conditions.push(eq(crmTasks.status, filters.status));
    if (filters?.assignedToId) conditions.push(eq(crmTasks.assignedToId, filters.assignedToId));
    if (filters?.entityType) conditions.push(eq(crmTasks.entityType, filters.entityType));
    if (filters?.entityId) conditions.push(eq(crmTasks.entityId, filters.entityId));
    return db.select().from(crmTasks).where(and(...conditions)).orderBy(desc(crmTasks.createdAt));
  }
  async getCrmTask(id: string, tenantId: string): Promise<CrmTask | undefined> {
    const [row] = await db.select().from(crmTasks).where(and(eq(crmTasks.id, id), eq(crmTasks.tenantId, tenantId)));
    return row;
  }
  async createCrmTask(task: InsertCrmTask): Promise<CrmTask> {
    const [row] = await db.insert(crmTasks).values(task).returning();
    return row;
  }
  async updateCrmTask(id: string, tenantId: string, task: Partial<InsertCrmTask>): Promise<CrmTask | undefined> {
    const [row] = await db.update(crmTasks).set({ ...task, updatedAt: new Date() }).where(and(eq(crmTasks.id, id), eq(crmTasks.tenantId, tenantId))).returning();
    return row;
  }
  async deleteCrmTask(id: string, tenantId: string): Promise<void> {
    await db.delete(crmTasks).where(and(eq(crmTasks.id, id), eq(crmTasks.tenantId, tenantId)));
  }

  // ── CRM Proposals ─────────────────────────────────────────────────────────
  async getCrmProposals(tenantId: string, filters?: { status?: string; dealId?: string; userId?: string }): Promise<CrmProposal[]> {
    let conditions = [eq(crmProposals.tenantId, tenantId)];
    if (filters?.status) conditions.push(eq(crmProposals.status, filters.status));
    if (filters?.dealId) conditions.push(eq(crmProposals.dealId, filters.dealId));
    if (filters?.userId) conditions.push(eq(crmProposals.createdById, filters.userId));
    return db.select().from(crmProposals).where(and(...conditions)).orderBy(desc(crmProposals.createdAt));
  }
  async getCrmProposal(id: string, tenantId: string): Promise<CrmProposal | undefined> {
    const [row] = await db.select().from(crmProposals).where(and(eq(crmProposals.id, id), eq(crmProposals.tenantId, tenantId)));
    return row;
  }
  async createCrmProposal(proposal: InsertCrmProposal): Promise<CrmProposal> {
    const all = await db.select({ id: crmProposals.id }).from(crmProposals).where(eq(crmProposals.tenantId, proposal.tenantId));
    const num = `PROP-${String(all.length + 1).padStart(4, '0')}`;
    const [row] = await db.insert(crmProposals).values({ ...proposal, proposalNumber: num }).returning();
    return row;
  }
  async updateCrmProposal(id: string, tenantId: string, proposal: Partial<InsertCrmProposal>): Promise<CrmProposal | undefined> {
    const [row] = await db.update(crmProposals).set({ ...proposal, updatedAt: new Date() }).where(and(eq(crmProposals.id, id), eq(crmProposals.tenantId, tenantId))).returning();
    return row;
  }
  async deleteCrmProposal(id: string, tenantId: string): Promise<void> {
    // Delete child records first to avoid FK constraint violations
    await db.delete(crmActivities).where(eq(crmActivities.entityId, id));
    await db.delete(crmProposalItems).where(eq(crmProposalItems.proposalId, id));
    await db.delete(crmProposalTokens).where(eq(crmProposalTokens.proposalId, id));
    await db.delete(crmProposals).where(and(eq(crmProposals.id, id), eq(crmProposals.tenantId, tenantId)));
  }

  // ── CRM Proposal Items ────────────────────────────────────────────────────
  async getCrmProposalItems(proposalId: string): Promise<CrmProposalItem[]> {
    return db.select().from(crmProposalItems).where(eq(crmProposalItems.proposalId, proposalId)).orderBy(asc(crmProposalItems.displayOrder));
  }
  async createCrmProposalItem(item: InsertCrmProposalItem): Promise<CrmProposalItem> {
    const [row] = await db.insert(crmProposalItems).values(item).returning();
    return row;
  }
  async updateCrmProposalItem(id: string, item: Partial<InsertCrmProposalItem>): Promise<CrmProposalItem | undefined> {
    const [row] = await db.update(crmProposalItems).set(item).where(eq(crmProposalItems.id, id)).returning();
    return row;
  }
  async deleteCrmProposalItem(id: string): Promise<void> {
    await db.delete(crmProposalItems).where(eq(crmProposalItems.id, id));
  }
  async replaceProposalItems(proposalId: string, tenantId: string, items: Omit<InsertCrmProposalItem, 'proposalId' | 'tenantId'>[]): Promise<CrmProposalItem[]> {
    await db.delete(crmProposalItems).where(eq(crmProposalItems.proposalId, proposalId));
    if (!items.length) return [];
    const rows = await db.insert(crmProposalItems).values(items.map((it, i) => ({ ...it, proposalId, tenantId, displayOrder: i }))).returning();
    return rows;
  }

  // ── CRM Dashboard Stats ───────────────────────────────────────────────────
  async getCrmDashboardStats(tenantId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const allLeads = await db.select().from(crmLeads).where(eq(crmLeads.tenantId, tenantId));
    const allDeals = await db.select().from(crmDeals).where(eq(crmDeals.tenantId, tenantId));
    const allTasks = await db.select().from(crmTasks).where(eq(crmTasks.tenantId, tenantId));
    const allProposals = await db.select().from(crmProposals).where(eq(crmProposals.tenantId, tenantId));
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    for (const l of allLeads) {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1;
      const src = l.sourceName || 'مباشر';
      bySource[src] = (bySource[src] || 0) + 1;
    }
    const dealsByStage: Record<string, number> = {};
    for (const d of allDeals) {
      dealsByStage[d.stageId] = (dealsByStage[d.stageId] || 0) + 1;
    }
    const openDeals = allDeals.filter(d => d.status === 'open');
    const openDealsValue = openDeals.reduce((sum, d) => sum + parseFloat(d.estimatedValue || '0'), 0);
    return {
      totalLeads: allLeads.length,
      newLeadsToday: allLeads.filter(l => new Date(l.createdAt) >= startOfDay).length,
      openDeals: openDeals.length,
      openDealsValue,
      wonDealsThisMonth: allDeals.filter(d => d.status === 'won' && d.wonAt && new Date(d.wonAt) >= startOfMonth).length,
      lostDealsThisMonth: allDeals.filter(d => d.status === 'lost' && d.lostAt && new Date(d.lostAt) >= startOfMonth).length,
      proposalsSent: allProposals.filter(p => p.status === 'sent').length,
      overdueTasks: allTasks.filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate) < now).length,
      myTasksToday: allTasks.filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate) >= startOfDay && new Date(t.dueDate) < new Date(startOfDay.getTime() + 86400000)).length,
      leadsByStatus: byStatus,
      leadsBySource: bySource,
      dealsByStage,
      recentLeads: allLeads.slice(0, 5),
    };
  }

  // ============================================================
  // INTEGRATION SETTINGS
  // ============================================================
  async getIntegration(tenantId: string, provider: string): Promise<IntegrationSettings | null> {
    const [row] = await db.select().from(integrationSettings)
      .where(and(eq(integrationSettings.tenantId, tenantId), eq(integrationSettings.provider, provider)));
    return row || null;
  }

  async getAllIntegrations(tenantId: string): Promise<IntegrationSettings[]> {
    return db.select().from(integrationSettings).where(eq(integrationSettings.tenantId, tenantId));
  }

  async upsertIntegration(tenantId: string, provider: string, data: { isEnabled: boolean; config: any }): Promise<IntegrationSettings> {
    const existing = await this.getIntegration(tenantId, provider);
    if (existing) {
      const [updated] = await db.update(integrationSettings)
        .set({ isEnabled: data.isEnabled, config: data.config, updatedAt: new Date() })
        .where(and(eq(integrationSettings.tenantId, tenantId), eq(integrationSettings.provider, provider)))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(integrationSettings)
        .values({ tenantId, provider, isEnabled: data.isEnabled, config: data.config })
        .returning();
      return created;
    }
  }

  // ============================================================
  // CRM ATTACHMENTS
  // ============================================================
  async getAttachments(tenantId: string, entityType: string, entityId: string): Promise<CrmAttachment[]> {
    return db.select().from(crmAttachments)
      .where(and(
        eq(crmAttachments.tenantId, tenantId),
        eq(crmAttachments.entityType, entityType),
        eq(crmAttachments.entityId, entityId)
      ))
      .orderBy(crmAttachments.createdAt);
  }

  async createAttachment(data: any): Promise<CrmAttachment> {
    const [row] = await db.insert(crmAttachments).values(data).returning();
    return row;
  }

  async deleteAttachment(tenantId: string, id: string): Promise<void> {
    await db.delete(crmAttachments)
      .where(and(eq(crmAttachments.tenantId, tenantId), eq(crmAttachments.id, id)));
  }

  // ============================================================
  // PROPOSAL PUBLIC TOKENS
  // ============================================================
  async createProposalToken(proposalId: string, tenantId: string): Promise<string> {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await db.insert(crmProposalTokens).values({ proposalId, tenantId, token, expiresAt });
    return token;
  }

  async getProposalByToken(token: string): Promise<any | null> {
    const [row] = await db.select().from(crmProposalTokens).where(eq(crmProposalTokens.token, token));
    if (!row) return null;
    if (row.expiresAt && new Date(row.expiresAt) < new Date()) return null;
    await db.update(crmProposalTokens)
      .set({ viewCount: (row.viewCount || 0) + 1 })
      .where(eq(crmProposalTokens.token, token));
    const [proposal] = await db.select().from(crmProposals).where(eq(crmProposals.id, row.proposalId));
    if (!proposal) return null;
    const items = await db.select().from(crmProposalItems).where(eq(crmProposalItems.proposalId, proposal.id));
    return { ...proposal, items };
  }

  // ── Proposal Templates ────────────────────────────────────────────────────
  async getProposalTemplates(tenantId: string): Promise<ProposalTemplate[]> {
    return db.select().from(proposalTemplates).where(eq(proposalTemplates.tenantId, tenantId)).orderBy(asc(proposalTemplates.displayOrder));
  }
  async getProposalTemplate(id: string, tenantId: string): Promise<ProposalTemplate | undefined> {
    const [row] = await db.select().from(proposalTemplates).where(and(eq(proposalTemplates.id, id), eq(proposalTemplates.tenantId, tenantId)));
    return row;
  }
  async createProposalTemplate(data: InsertProposalTemplate): Promise<ProposalTemplate> {
    const [row] = await db.insert(proposalTemplates).values(data).returning();
    return row;
  }
  async updateProposalTemplate(id: string, tenantId: string, data: Partial<InsertProposalTemplate>): Promise<ProposalTemplate | undefined> {
    const [row] = await db.update(proposalTemplates).set({ ...data, updatedAt: new Date() }).where(and(eq(proposalTemplates.id, id), eq(proposalTemplates.tenantId, tenantId))).returning();
    return row;
  }
  async deleteProposalTemplate(id: string, tenantId: string): Promise<void> {
    await db.delete(proposalTemplates).where(and(eq(proposalTemplates.id, id), eq(proposalTemplates.tenantId, tenantId)));
  }
  async seedDefaultProposalTemplates(tenantId: string): Promise<void> {
    const existing = await this.getProposalTemplates(tenantId);
    // Only reseed if no templates exist, or if existing ones are old format (no targetAudience)
    const hasNewFormat = existing.some((t: any) => t.targetAudience && Array.isArray(t.targetAudience) && t.targetAudience.length > 0);
    const existingNames = new Set(existing.map((t: any) => t.name));
    if (existing.length > 0 && hasNewFormat) {
      // Additive mode: only add templates that don't exist yet by name
      const newDefaults = await this._buildDefaultTemplates(tenantId);
      for (const t of newDefaults) {
        if (!existingNames.has(t.name)) await this.createProposalTemplate(t as any);
      }
      return;
    }
    // Delete old default templates to replace with new comprehensive ones
    if (existing.length > 0) {
      for (const t of existing.filter((t: any) => t.isDefault)) {
        await this.deleteProposalTemplate(t.id, tenantId);
      }
    }

    const defaults = await this._buildDefaultTemplates(tenantId);
    for (const t of defaults) await this.createProposalTemplate(t as any);
  }

  private async _buildDefaultTemplates(tenantId: string): Promise<any[]> {
    const TERMS_WEB = `• صلاحية العرض 14 يوماً من تاريخ الإصدار
• الدفع: 40% مقدم عند توقيع العقد، 40% عند اعتماد التصميم، 20% عند التسليم النهائي
• مدة التنفيذ المقدرة: 45-60 يوم عمل من تاريخ توقيع العقد وسداد الدفعة الأولى
• يشمل العرض صيانة مجانية لمدة 3 أشهر بعد الإطلاق
• أي متطلبات خارج نطاق هذا العرض تستلزم تعديلاً في السعر
• سوفت لكس تحتفظ بحقوق الملكية الفكرية للكود المصدري حتى سداد كامل المبلغ`;

    const TERMS_APP = `• صلاحية العرض 14 يوماً من تاريخ الإصدار
• الدفع: 30% مقدم عند توقيع العقد، 40% منتصف المشروع (بعد اعتماد التصميم والـ Backend)، 30% عند التسليم النهائي
• مدة التنفيذ المقدرة: 90-120 يوم عمل من تاريخ توقيع العقد وسداد الدفعة الأولى
• يشمل العرض صيانة مجانية لمدة 6 أشهر بعد الإطلاق
• نشر التطبيق على App Store و Google Play مشمول في العرض (الرسوم السنوية للحسابات الرسمية على حساب العميل)
• أي تغييرات جوهرية في المتطلبات بعد بدء التطوير تستلزم تعديلاً في السعر والجدول الزمني`;

    const TERMS_DELIVERY = `• صلاحية العرض 21 يوماً من تاريخ الإصدار
• الدفع: 25% مقدم، 35% بعد تسليم التصميم والـ Backend، 25% بعد تسليم التطبيقات، 15% بعد شهر التشغيل
• مدة التنفيذ المقدرة: 120-150 يوم عمل
• يشمل العرض 3 تطبيقات (عميل + سائق + تاجر) ولوحة تحكم ويب
• صيانة مجانية 6 أشهر بعد الإطلاق
• حسابات App Store و Google Play وGoogle Maps API على حساب العميل`;

    const TERMS_ERP = `• صلاحية العرض 30 يوماً من تاريخ الإصدار
• الدفع: 20% عند توقيع العقد وبدء المشروع، 15% عند تسليم وثيقة SRS، 20% عند اعتماد التصميم المعماري، 15% عند تسليم النسخة الأولية، 10% عند النسخة التجريبية Beta، 10% عند التسليم النهائي، 10% عند تدريب الموظفين وتوثيق النظام
• مدة التنفيذ المقدرة: 180 يوم عمل من تاريخ توقيع العقد وسداد الدفعة الأولى (+ 10 أيام تعبئة بعد التوقيع)
• يشمل العرض ضمان كامل على الكود لمدة 12 شهر من تاريخ التسليم
• يشمل العرض نظام النسخ الاحتياطي التلقائي وإدارة الخادم وتعزيز الأمان
• أي متطلبات خارج نطاق هذا العرض تستلزم تحليلاً وتقدير كلفة وزمن إضافي
• جميع الأسعار المعروضة شاملة ضريبة القيمة المضافة 15%
• يتم نقل كامل الملكية الفكرية (أكواد، تصاميم، قواعد بيانات) للعميل عند اكتمال السداد
• تكون المدفوعات مستحقة في غضون 5 أيام عمل من تسليم فاتورة سوفت لكس`;

    return [
      // ─── 1. موقع ويب تعريفي ──────────────────────────────────────────────
      {
        tenantId, name: "موقع ويب تعريفي", nameEn: "Informational Website", category: "web-platform",
        defaultValidity: 14, defaultTaxPercent: "15", isDefault: true, displayOrder: 0,
        defaultTerms: TERMS_WEB,
        targetAudience: [
          { group: "الزائر العام", role: "تصفح المحتوى والخدمات والتواصل مع الشركة", language: "عربي / English", system: "Web (متصفح) / جوال" },
          { group: "مدير الموقع", role: "إدارة المحتوى وتحديث الصفحات والمدونة", language: "عربي", system: "Web (لوحة تحكم)" },
        ],
        deliverables: [
          { name: "موقع ويب متجاوب", description: "موقع كامل يعمل على جميع الأجهزة (موبايل / تابلت / ديسكتوب) مع تصميم احترافي" },
          { name: "لوحة تحكم CMS", description: "واجهة إدارة سهلة لتعديل المحتوى والصور والصفحات بدون برمجة" },
          { name: "نموذج التواصل", description: "نموذج تواصل مرتبط بالبريد الإلكتروني مع حماية من السبام" },
          { name: "تحسين SEO أساسي", description: "إعداد Meta Tags وSitemap وSchema Markup لمحركات البحث" },
          { name: "دليل الاستخدام", description: "وثيقة تدريبية للمشرف على إدارة الموقع" },
          { name: "دعم 3 أشهر", description: "صيانة تقنية ودعم فني بعد الإطلاق لمدة 3 أشهر" },
        ],
        technologies: [
          { name: "React.js / Next.js", category: "واجهة الويب", description: "واجهة أمامية سريعة ومتجاوبة" },
          { name: "Node.js", category: "الخادم", description: "خادم API قوي وقابل للتوسع" },
          { name: "PostgreSQL", category: "قاعدة البيانات", description: "قاعدة بيانات علائقية موثوقة" },
          { name: "AWS S3 / Cloudflare", category: "الخدمات السحابية", description: "تخزين الملفات والصور واستضافة سريعة" },
        ],
        items: [
          { title: "تحليل المتطلبات والتخطيط", description: "دراسة الاحتياجات وإعداد وثيقة المواصفات الفنية وخريطة الموقع", quantity: "1", unitPrice: "2000", sectionName: "مرحلة التخطيط" },
          { title: "تصميم UI/UX الاحترافي", description: "تصميم كامل لجميع الصفحات على Figma مع Prototype تفاعلي", quantity: "1", unitPrice: "4000", sectionName: "مرحلة التصميم" },
          { title: "تطوير الواجهة الأمامية", description: "React.js / Next.js مع تصميم متجاوب كامل وتحسين الأداء", quantity: "1", unitPrice: "6000", sectionName: "مرحلة التطوير" },
          { title: "تطوير الخادم والـ API", description: "Node.js + PostgreSQL لإدارة المحتوى والنماذج والبيانات", quantity: "1", unitPrice: "5000", sectionName: "مرحلة التطوير" },
          { title: "نظام إدارة المحتوى (CMS)", description: "لوحة تحكم سهلة لتعديل كل محتوى الموقع بدون برمجة", quantity: "1", unitPrice: "3000", sectionName: "مرحلة التطوير" },
          { title: "إعداد الاستضافة والنطاق", description: "نشر الموقع على سيرفر سحابي مع SSL وإعدادات الأداء", quantity: "1", unitPrice: "1000", sectionName: "مرحلة الإطلاق" },
          { title: "اختبار الجودة الشامل", description: "اختبار على مختلف المتصفحات والأجهزة وإصلاح أي أخطاء", quantity: "1", unitPrice: "1500", sectionName: "مرحلة الإطلاق" },
          { title: "تدريب ودعم ما بعد الإطلاق", description: "جلسة تدريب للمشرف + دعم فني مجاني لمدة 3 أشهر", quantity: "1", unitPrice: "2000", sectionName: "مرحلة الإطلاق" },
          { title: "تحسين محركات البحث SEO", description: "إعداد SEO احترافي كامل لتحسين ظهور الموقع في Google", quantity: "1", unitPrice: "1500", sectionName: "مرحلة الإطلاق", isOptional: true },
        ],
      },
      // ─── 2. متجر إلكتروني ────────────────────────────────────────────────
      {
        tenantId, name: "متجر إلكتروني", nameEn: "E-Commerce Platform", category: "web-platform",
        defaultValidity: 14, defaultTaxPercent: "15", isDefault: true, displayOrder: 1,
        defaultTerms: TERMS_APP,
        targetAudience: [
          { group: "العميل المشتري", role: "تصفح المنتجات والشراء وإدارة الطلبات والدفع", language: "عربي / English", system: "iOS / Android / Web" },
          { group: "البائع / التاجر", role: "إدارة المنتجات والمخزون والطلبات والفواتير", language: "عربي", system: "Web (لوحة تحكم)" },
          { group: "مدير النظام", role: "الإشراف الكامل على المنصة والمستخدمين والتقارير المالية", language: "عربي", system: "Web (لوحة الإدارة)" },
        ],
        deliverables: [
          { name: "تطبيق جوال iOS + Android", description: "تطبيق متجر كامل للمشتري مع تصفح المنتجات والدفع ومتابعة الطلبات" },
          { name: "موقع ويب للمتجر", description: "واجهة ويب احترافية للتسوق عبر المتصفح مع تصميم متجاوب" },
          { name: "لوحة تحكم البائع", description: "واجهة إدارة للبائع لإضافة المنتجات وإدارة الطلبات والمخزون" },
          { name: "لوحة تحكم الإدارة", description: "مركز تحكم كامل للإدارة العليا مع التقارير والإحصاءات المالية" },
          { name: "تكامل بوابة الدفع", description: "ربط آمن مع بوابة دفع (Stripe / PayTabs / مدى)" },
          { name: "نظام الشحن والتوصيل", description: "تتبع الشحنات وربط مزودي التوصيل" },
        ],
        technologies: [
          { name: "Flutter", category: "تطبيق جوال", description: "تطبيق iOS وAndroid من كود واحد" },
          { name: "Next.js", category: "واجهة الويب", description: "موقع ويب سريع مع SEO ممتاز" },
          { name: "Node.js", category: "الخادم", description: "API قوي وآمن" },
          { name: "PostgreSQL", category: "قاعدة البيانات", description: "قاعدة بيانات موثوقة للمنتجات والطلبات" },
          { name: "Stripe / PayTabs", category: "الدفع الإلكتروني", description: "بوابة دفع آمنة ومعتمدة" },
          { name: "Firebase", category: "الخدمات السحابية", description: "إشعارات فورية وتخزين الملفات" },
        ],
        items: [
          { title: "تحليل المتطلبات والتخطيط", description: "دراسة متطلبات المتجر وإعداد مواصفات المنتجات والفئات والدفع", quantity: "1", unitPrice: "3000", sectionName: "مرحلة التخطيط" },
          { title: "تصميم UI/UX (موقع + تطبيق)", description: "تصميم احترافي كامل لجميع شاشات التطبيق والموقع على Figma", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التصميم" },
          { title: "تطوير تطبيق الجوال (Flutter)", description: "تطبيق iOS وAndroid للعميل مع تصفح المنتجات والشراء ومتابعة الطلبات", quantity: "1", unitPrice: "18000", sectionName: "مرحلة التطوير" },
          { title: "تطوير موقع الويب (Next.js)", description: "موقع ويب متجاوب للتسوق عبر المتصفح مع كامل الوظائف", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التطوير" },
          { title: "تطوير الخادم والـ API", description: "Node.js + PostgreSQL: APIs كاملة للمنتجات والطلبات والمستخدمين", quantity: "1", unitPrice: "12000", sectionName: "مرحلة التطوير" },
          { title: "نظام إدارة المنتجات والمخزون", description: "لوحة البائع: إضافة/تعديل المنتجات، الفئات، الأسعار، المخزون", quantity: "1", unitPrice: "5000", sectionName: "مرحلة التطوير" },
          { title: "تكامل بوابة الدفع الإلكتروني", description: "ربط آمن مع Stripe/PayTabs مع دعم مدى وApple Pay وGoogle Pay", quantity: "1", unitPrice: "4000", sectionName: "مرحلة التطوير" },
          { title: "نظام الشحن والتوصيل", description: "تتبع الشحنات وإدارة مزودي التوصيل وحسابات الشحن", quantity: "1", unitPrice: "4000", sectionName: "مرحلة التطوير" },
          { title: "اختبار الجودة الشامل", description: "اختبار كامل لجميع وظائف التطبيق والموقع على أجهزة متعددة", quantity: "1", unitPrice: "4000", sectionName: "مرحلة الإطلاق" },
          { title: "نشر التطبيق على المتاجر", description: "نشر على App Store و Google Play مع إعداد حسابات المطور", quantity: "1", unitPrice: "2000", sectionName: "مرحلة الإطلاق" },
          { title: "إعداد الاستضافة والنشر", description: "نشر الموقع والخادم على بنية تحتية سحابية موثوقة", quantity: "1", unitPrice: "2000", sectionName: "مرحلة الإطلاق" },
          { title: "تدريب ودعم 6 أشهر", description: "تدريب الفريق على إدارة المتجر + دعم فني لمدة 6 أشهر", quantity: "1", unitPrice: "5000", sectionName: "مرحلة الإطلاق" },
          { title: "نظام الولاء والنقاط", description: "برنامج نقاط مكافآت للعملاء المتكررين مع كوبونات الخصم", quantity: "1", unitPrice: "6000", sectionName: "إضافات اختيارية", isOptional: true },
        ],
      },
      // ─── 3. تطبيق توصيل ─────────────────────────────────────────────────
      {
        tenantId, name: "تطبيق توصيل", nameEn: "Delivery App (3 Apps)", category: "mobile-app",
        defaultValidity: 21, defaultTaxPercent: "15", isDefault: true, displayOrder: 2,
        defaultTerms: TERMS_DELIVERY,
        targetAudience: [
          { group: "العميل المستخدم", role: "طلب الطعام/المنتجات ومتابعة التوصيل في الوقت الفعلي", language: "عربي / English", system: "iOS / Android" },
          { group: "السائق / المندوب", role: "استلام الطلبات والتنقل بالخريطة وتأكيد التسليم", language: "عربي", system: "iOS / Android" },
          { group: "المطعم / التاجر", role: "إدارة الطلبات الواردة وتحديث القائمة والأسعار", language: "عربي", system: "iOS / Android / Web" },
          { group: "مدير النظام", role: "الإشراف الكامل على المنصة والسائقين والمطاعم والتقارير المالية", language: "عربي", system: "Web (لوحة الإدارة)" },
        ],
        deliverables: [
          { name: "تطبيق العميل (iOS + Android)", description: "تطبيق طلب الطعام/المنتجات مع تتبع لحظي وعدة طرق دفع" },
          { name: "تطبيق السائق (iOS + Android)", description: "تطبيق السائق مع خريطة تفاعلية وإدارة الطلبات وحساب الأرباح" },
          { name: "تطبيق التاجر / المطعم", description: "تطبيق إدارة الطلبات الواردة وتحديث القائمة والحالة" },
          { name: "لوحة تحكم الإدارة (Web)", description: "مركز تحكم كامل: المطاعم والسائقين والطلبات والتقارير المالية" },
          { name: "API موثّق", description: "وثيقة API كاملة لأي تكامل مستقبلي مع أطراف ثالثة" },
        ],
        technologies: [
          { name: "Flutter", category: "تطبيق جوال", description: "3 تطبيقات iOS وAndroid من كود موحّد" },
          { name: "Node.js", category: "الخادم", description: "Backend قوي لمعالجة الطلبات الكثيرة" },
          { name: "PostgreSQL", category: "قاعدة البيانات", description: "قاعدة بيانات موثوقة للطلبات والمستخدمين" },
          { name: "Firebase", category: "الخدمات السحابية", description: "إشعارات فورية وتحديثات لحظية" },
          { name: "Google Maps API", category: "الخدمات السحابية", description: "تتبع لحظي وتحديد المواقع والمسارات" },
          { name: "Stripe / PayTabs", category: "الدفع الإلكتروني", description: "دفع آمن متعدد الطرق" },
          { name: "Socket.io", category: "التواصل", description: "اتصال لحظي بين العميل والسائق والمطعم" },
        ],
        items: [
          { title: "تحليل المتطلبات والتصميم المعماري", description: "دراسة شاملة للنظام وإعداد المواصفات الفنية للتطبيقات الثلاثة ولوحة الإدارة", quantity: "1", unitPrice: "5000", sectionName: "مرحلة التخطيط" },
          { title: "تصميم UI/UX للتطبيقات الثلاثة", description: "تصميم احترافي منفصل لكل تطبيق (عميل / سائق / تاجر) + لوحة الإدارة على Figma", quantity: "1", unitPrice: "12000", sectionName: "مرحلة التصميم" },
          { title: "تطوير تطبيق العميل (Flutter)", description: "تطبيق iOS وAndroid: تصفح القوائم، الطلب، الدفع، التتبع اللحظي، التقييم", quantity: "1", unitPrice: "20000", sectionName: "مرحلة التطوير" },
          { title: "تطوير تطبيق السائق (Flutter)", description: "تطبيق iOS وAndroid: استلام الطلبات، ملاحة GPS، تأكيد التسليم، كشف الأرباح", quantity: "1", unitPrice: "15000", sectionName: "مرحلة التطوير" },
          { title: "تطوير تطبيق التاجر / المطعم", description: "تطبيق / ويب: إدارة الطلبات الواردة، تحديث القائمة والأسعار والتوافر", quantity: "1", unitPrice: "15000", sectionName: "مرحلة التطوير" },
          { title: "لوحة تحكم الإدارة (Web)", description: "لوحة ويب كاملة: إدارة المطاعم والسائقين والطلبات والمناطق والتقارير المالية", quantity: "1", unitPrice: "12000", sectionName: "مرحلة التطوير" },
          { title: "تطوير الخادم والـ API", description: "Node.js + PostgreSQL: APIs كاملة لجميع التطبيقات مع منطق الأعمال", quantity: "1", unitPrice: "18000", sectionName: "مرحلة التطوير" },
          { title: "نظام التتبع اللحظي", description: "تتبع موقع السائق في الوقت الفعلي مع Socket.io وGoogle Maps", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التطوير" },
          { title: "بوابة الدفع الإلكتروني", description: "تكامل مع Stripe/PayTabs: بطاقات، مدى، Apple Pay، Google Pay، المحفظة", quantity: "1", unitPrice: "5000", sectionName: "مرحلة التطوير" },
          { title: "نظام الإشعارات والتنبيهات", description: "إشعارات Push لكل حالة طلب على كل التطبيقات", quantity: "1", unitPrice: "4000", sectionName: "مرحلة التطوير" },
          { title: "اختبار الجودة الشامل", description: "اختبار وظيفي وأداء وأمان لجميع التطبيقات الثلاثة", quantity: "1", unitPrice: "6000", sectionName: "مرحلة الإطلاق" },
          { title: "نشر التطبيقات والاستضافة", description: "نشر على App Store وGoogle Play وإعداد الخوادم الإنتاجية", quantity: "1", unitPrice: "4000", sectionName: "مرحلة الإطلاق" },
          { title: "تدريب وصيانة 6 أشهر", description: "تدريب الفريق والسائقين + دعم فني لمدة 6 أشهر بعد الإطلاق", quantity: "1", unitPrice: "8000", sectionName: "مرحلة الإطلاق" },
          { title: "نظام التقييم والمراجعات", description: "نظام تقييم المطاعم والسائقين من العملاء", quantity: "1", unitPrice: "4000", sectionName: "إضافات اختيارية", isOptional: true },
          { title: "نظام العروض والكوبونات", description: "إنشاء وإدارة عروض ترويجية وكوبونات خصم", quantity: "1", unitPrice: "5000", sectionName: "إضافات اختيارية", isOptional: true },
        ],
      },
      // ─── 4. تطبيق تعارف / اجتماعي ───────────────────────────────────────
      {
        tenantId, name: "تطبيق تعارف / اجتماعي", nameEn: "Social / Dating App", category: "mobile-app",
        defaultValidity: 14, defaultTaxPercent: "15", isDefault: true, displayOrder: 3,
        defaultTerms: TERMS_APP,
        targetAudience: [
          { group: "المستخدم العام", role: "إنشاء ملف شخصي، التعارف، المحادثة، الاشتراك في المميزات", language: "عربي / English", system: "iOS / Android" },
          { group: "مشرف النظام", role: "إدارة المستخدمين والبلاغات والمحتوى ومراقبة الأمان", language: "عربي", system: "Web (لوحة الاعتدال)" },
        ],
        deliverables: [
          { name: "تطبيق iOS + Android", description: "تطبيق كامل للتعارف مع ملفات شخصية وخوارزمية مطابقة ومحادثات" },
          { name: "لوحة تحكم الاعتدال", description: "واجهة ويب لمراقبة المستخدمين والمحتوى والبلاغات" },
          { name: "نظام الاشتراكات المدفوعة", description: "نظام Premium مع ميزات إضافية وبوابة دفع" },
          { name: "Backend API موثّق", description: "API كاملة للتكامل والتطوير المستقبلي" },
        ],
        technologies: [
          { name: "Flutter", category: "تطبيق جوال", description: "تطبيق iOS وAndroid موحّد" },
          { name: "Node.js", category: "الخادم", description: "Backend قوي وآمن" },
          { name: "PostgreSQL", category: "قاعدة البيانات", description: "قاعدة بيانات المستخدمين والمحادثات" },
          { name: "Firebase", category: "الخدمات السحابية", description: "إشعارات فورية وتحليلات" },
          { name: "Socket.io", category: "التواصل", description: "محادثات فورية في الوقت الحقيقي" },
          { name: "Stripe", category: "الدفع الإلكتروني", description: "نظام الاشتراكات المدفوعة" },
          { name: "AWS S3", category: "الخدمات السحابية", description: "تخزين الصور ومقاطع الفيديو" },
        ],
        items: [
          { title: "تحليل المتطلبات والتخطيط", description: "دراسة شاملة وإعداد وثيقة المواصفات الفنية لجميع ميزات التطبيق", quantity: "1", unitPrice: "4000", sectionName: "مرحلة التخطيط" },
          { title: "تصميم UI/UX وتجربة المستخدم", description: "تصميم كامل لجميع شاشات التطبيق مع Prototype تفاعلي على Figma", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التصميم" },
          { title: "نظام التسجيل والملف الشخصي", description: "تسجيل بالهاتف/الإيميل، ملف شخصي كامل مع الصور والاهتمامات", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التطوير" },
          { title: "خوارزمية المطابقة الذكية (Matching)", description: "خوارزمية تطابق المستخدمين بناءً على الاهتمامات والموقع والتفضيلات", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التطوير" },
          { title: "نظام المحادثات الفورية", description: "محادثات نصية وصور وإيموجي في الوقت الفعلي مع Socket.io", quantity: "1", unitPrice: "12000", sectionName: "مرحلة التطوير" },
          { title: "نظام الاشتراكات والمدفوعات", description: "خطط Premium مع ميزات إضافية وبوابة دفع Stripe", quantity: "1", unitPrice: "7000", sectionName: "مرحلة التطوير" },
          { title: "نظام الإشعارات الفورية", description: "إشعارات Push لكل تفاعل (إعجاب، رسالة، مطابقة جديدة)", quantity: "1", unitPrice: "3000", sectionName: "مرحلة التطوير" },
          { title: "نظام الإبلاغ والاعتدال", description: "نظام بلاغات المستخدمين + لوحة اعتدال للمشرف", quantity: "1", unitPrice: "5000", sectionName: "مرحلة التطوير" },
          { title: "لوحة تحكم الإدارة", description: "لوحة ويب كاملة لإدارة المستخدمين والمحتوى والتقارير", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التطوير" },
          { title: "اختبار الأمان والجودة", description: "اختبار شامل للأمان وسرية البيانات والأداء", quantity: "1", unitPrice: "5000", sectionName: "مرحلة الإطلاق" },
          { title: "نشر التطبيق والاستضافة", description: "نشر على App Store وGoogle Play وإعداد الخوادم", quantity: "1", unitPrice: "4000", sectionName: "مرحلة الإطلاق" },
          { title: "دعم وصيانة 6 أشهر", description: "دعم فني وتحديثات لمدة 6 أشهر بعد الإطلاق", quantity: "1", unitPrice: "6000", sectionName: "مرحلة الإطلاق" },
        ],
      },
      // ─── 5. تطبيق خدمات صيانة ───────────────────────────────────────────
      {
        tenantId, name: "تطبيق خدمات صيانة", nameEn: "Maintenance Services App", category: "mobile-app",
        defaultValidity: 14, defaultTaxPercent: "15", isDefault: true, displayOrder: 4,
        defaultTerms: TERMS_APP,
        targetAudience: [
          { group: "العميل (صاحب المنزل)", role: "طلب خدمات الصيانة ومتابعة الطلب والدفع وتقييم الفني", language: "عربي", system: "iOS / Android / Web" },
          { group: "الفني / مزود الخدمة", role: "استلام الطلبات والتنقل وتنفيذ الخدمة وتحديث الحالة", language: "عربي", system: "iOS / Android" },
          { group: "مدير النظام", role: "إدارة الفنيين والطلبات والتقارير ومراقبة الجودة", language: "عربي", system: "Web (لوحة الإدارة)" },
        ],
        deliverables: [
          { name: "تطبيق العميل (iOS + Android)", description: "تطبيق لطلب خدمات الصيانة والحجز والدفع ومتابعة الطلب" },
          { name: "تطبيق الفني (iOS + Android)", description: "تطبيق الفني لاستلام الطلبات وإدارة جدوله وتحديث حالة الطلب" },
          { name: "موقع ويب للخدمات", description: "موقع ويب للعملاء مع نظام الحجز الإلكتروني" },
          { name: "لوحة تحكم الإدارة", description: "مركز إدارة كامل: الفنيون والطلبات والمناطق والتقارير المالية" },
        ],
        technologies: [
          { name: "Flutter", category: "تطبيق جوال", description: "تطبيقان iOS وAndroid (عميل + فني)" },
          { name: "Node.js", category: "الخادم", description: "API مركزي لجميع التطبيقات" },
          { name: "PostgreSQL", category: "قاعدة البيانات", description: "قاعدة بيانات الطلبات والفنيين" },
          { name: "Firebase", category: "الخدمات السحابية", description: "إشعارات فورية لكل تحديث" },
          { name: "Google Maps API", category: "الخدمات السحابية", description: "تحديد مواقع الفنيين والعملاء" },
          { name: "Stripe / PayTabs", category: "الدفع الإلكتروني", description: "دفع إلكتروني آمن" },
        ],
        items: [
          { title: "تحليل المتطلبات والتخطيط", description: "تحليل أنواع الخدمات وتصميم منطق الحجز والجدولة", quantity: "1", unitPrice: "4000", sectionName: "مرحلة التخطيط" },
          { title: "تصميم UI/UX للتطبيقين", description: "تصميم تطبيق العميل وتطبيق الفني وموقع الويب على Figma", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التصميم" },
          { title: "تطوير تطبيق العميل (Flutter)", description: "تصفح الخدمات، الحجز، الدفع، التتبع اللحظي للفني، التقييم", quantity: "1", unitPrice: "15000", sectionName: "مرحلة التطوير" },
          { title: "تطوير تطبيق الفني (Flutter)", description: "قبول الطلبات، التنقل بالخريطة، تحديث الحالة، كشف الأرباح", quantity: "1", unitPrice: "12000", sectionName: "مرحلة التطوير" },
          { title: "تطوير موقع الويب", description: "موقع تعريفي مع نظام الحجز الإلكتروني وعرض الخدمات", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التطوير" },
          { title: "لوحة تحكم الإدارة (Web)", description: "إدارة الفنيين والمناطق والخدمات والطلبات والتقارير المالية", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التطوير" },
          { title: "تطوير الخادم والـ API", description: "Node.js + PostgreSQL: APIs لجميع التطبيقات مع منطق الأعمال", quantity: "1", unitPrice: "12000", sectionName: "مرحلة التطوير" },
          { title: "نظام الحجز والجدولة", description: "نظام ذكي لجدولة الطلبات وتعيين الفنيين وإدارة التوافر", quantity: "1", unitPrice: "6000", sectionName: "مرحلة التطوير" },
          { title: "تكامل الدفع الإلكتروني", description: "ربط بوابة دفع آمنة مع دعم البطاقات والمدى والمحفظة", quantity: "1", unitPrice: "4000", sectionName: "مرحلة التطوير" },
          { title: "نظام التقييم والتقارير", description: "تقييم الفنيين وتقارير الأداء والإيرادات", quantity: "1", unitPrice: "3000", sectionName: "مرحلة التطوير" },
          { title: "اختبار الجودة الشامل", description: "اختبار وظيفي وأداء لجميع التطبيقات على أجهزة متعددة", quantity: "1", unitPrice: "4000", sectionName: "مرحلة الإطلاق" },
          { title: "نشر وإطلاق", description: "نشر على متاجر التطبيقات وإعداد الخوادم الإنتاجية", quantity: "1", unitPrice: "3000", sectionName: "مرحلة الإطلاق" },
          { title: "تدريب ودعم 6 أشهر", description: "تدريب فريق الإدارة + دعم فني لمدة 6 أشهر", quantity: "1", unitPrice: "6000", sectionName: "مرحلة الإطلاق" },
        ],
      },
      // ─── 6. موقع عقاري ──────────────────────────────────────────────────
      {
        tenantId, name: "موقع عقاري", nameEn: "Real Estate Website", category: "web-platform",
        defaultValidity: 14, defaultTaxPercent: "15", isDefault: true, displayOrder: 5,
        defaultTerms: TERMS_WEB,
        targetAudience: [
          { group: "المشتري / المستأجر", role: "البحث عن العقارات وتصفح القوائم والتواصل مع الوسيط", language: "عربي / English", system: "Web / جوال" },
          { group: "البائع / المؤجر", role: "نشر العقارات وإدارة الطلبات والإعلانات", language: "عربي", system: "Web" },
          { group: "الوسيط العقاري", role: "إدارة حافظة العقارات والعملاء وطلبات الحجز", language: "عربي", system: "Web (لوحة الوسيط)" },
          { group: "مدير النظام", role: "الإشراف الكامل على المنصة والمستخدمين وعوائد الإعلانات", language: "عربي", system: "Web (لوحة الإدارة)" },
        ],
        deliverables: [
          { name: "موقع ويب عقاري متجاوب", description: "موقع كامل لعرض العقارات والبحث والتواصل مع الوسطاء" },
          { name: "لوحة تحكم الوسيط", description: "واجهة لإدارة حافظة العقارات والعملاء وطلبات الحجز" },
          { name: "لوحة تحكم الإدارة", description: "مركز تحكم شامل لإدارة المنصة والمستخدمين والتقارير" },
          { name: "نظام البحث المتقدم", description: "بحث بالفلاتر المتعددة (السعر، الموقع، النوع، المساحة)" },
          { name: "تكامل الخرائط", description: "عرض العقارات على الخريطة التفاعلية مع Google Maps" },
        ],
        technologies: [
          { name: "Next.js", category: "واجهة الويب", description: "موقع سريع مع SEO ممتاز لمحركات البحث" },
          { name: "Node.js", category: "الخادم", description: "API قوي وآمن" },
          { name: "PostgreSQL", category: "قاعدة البيانات", description: "قاعدة بيانات العقارات والمستخدمين" },
          { name: "Google Maps API", category: "الخدمات السحابية", description: "خرائط تفاعلية لعرض العقارات" },
          { name: "AWS S3", category: "الخدمات السحابية", description: "تخزين صور العقارات والمستندات" },
          { name: "Elasticsearch", category: "قاعدة البيانات", description: "بحث متقدم سريع في قوائم العقارات" },
        ],
        items: [
          { title: "تحليل المتطلبات والتخطيط", description: "تحليل نماذج العقارات وأنواع المستخدمين وإعداد وثيقة المواصفات", quantity: "1", unitPrice: "4000", sectionName: "مرحلة التخطيط" },
          { title: "تصميم UI/UX الاحترافي", description: "تصميم كامل للموقع ولوحات التحكم على Figma مع Prototype", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التصميم" },
          { title: "تطوير صفحات العقارات والقوائم", description: "صفحات العقارات مع معرض صور كامل وكامل التفاصيل", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التطوير" },
          { title: "نظام البحث والفلاتر المتقدمة", description: "فلاتر متعددة: السعر والموقع والنوع والمساحة وعدد الغرف", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التطوير" },
          { title: "تكامل الخرائط التفاعلية", description: "عرض العقارات على Google Maps مع تجميع النتائج وتحديد الموقع", quantity: "1", unitPrice: "5000", sectionName: "مرحلة التطوير" },
          { title: "نظام التواصل والطلبات", description: "نموذج تواصل مع الوسيط ونظام حجز معاينة وإشعارات بريدية", quantity: "1", unitPrice: "5000", sectionName: "مرحلة التطوير" },
          { title: "لوحة تحكم الوسيط", description: "إدارة حافظة العقارات وطلبات العملاء وإحصاءات الأداء", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التطوير" },
          { title: "لوحة تحكم الإدارة", description: "إدارة الوسطاء والمستخدمين والإعلانات والتقارير المالية", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التطوير" },
          { title: "تطوير الخادم والـ API", description: "Node.js + PostgreSQL: APIs كاملة مع منطق الأعمال العقاري", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التطوير" },
          { title: "تحسين SEO العقاري", description: "SEO متخصص للعقارات: Schema Markup وSitemap وتحسين الأداء", quantity: "1", unitPrice: "3000", sectionName: "مرحلة الإطلاق" },
          { title: "اختبار الجودة الشامل", description: "اختبار على المتصفحات والأجهزة المختلفة وإصلاح الأخطاء", quantity: "1", unitPrice: "3000", sectionName: "مرحلة الإطلاق" },
          { title: "الإطلاق والاستضافة", description: "نشر على سيرفر سحابي مع SSL وإعدادات الأداء والأمان", quantity: "1", unitPrice: "3000", sectionName: "مرحلة الإطلاق" },
          { title: "تدريب ودعم 3 أشهر", description: "تدريب فريق الوسطاء على الإدارة + دعم فني لمدة 3 أشهر", quantity: "1", unitPrice: "5000", sectionName: "مرحلة الإطلاق" },
        ],
      },
      // ─── 7. تطبيق عقاري ─────────────────────────────────────────────────
      {
        tenantId, name: "تطبيق عقاري", nameEn: "Real Estate Mobile App", category: "mobile-app",
        defaultValidity: 14, defaultTaxPercent: "15", isDefault: true, displayOrder: 6,
        defaultTerms: TERMS_APP,
        targetAudience: [
          { group: "المشتري / المستأجر", role: "البحث عن العقارات بالخريطة والتواصل مع الوسيط وحجز المعاينة", language: "عربي / English", system: "iOS / Android" },
          { group: "الوسيط العقاري", role: "إدارة حافظة العقارات والعملاء والمواعيد وتتبع الصفقات", language: "عربي", system: "iOS / Android / Web" },
          { group: "مدير النظام", role: "الإشراف الكامل على المنصة والوسطاء والتقارير", language: "عربي", system: "Web (لوحة الإدارة)" },
        ],
        deliverables: [
          { name: "تطبيق iOS + Android", description: "تطبيق عقاري كامل للعملاء والوسطاء مع خرائط تفاعلية" },
          { name: "لوحة تحكم ويب", description: "لوحة إدارة للوسطاء وللإدارة العليا" },
          { name: "Backend API موثّق", description: "API كاملة للتكامل مع أي نظام مستقبلي" },
        ],
        technologies: [
          { name: "Flutter", category: "تطبيق جوال", description: "تطبيق iOS وAndroid موحّد" },
          { name: "Node.js", category: "الخادم", description: "API قوي وآمن" },
          { name: "PostgreSQL", category: "قاعدة البيانات", description: "قاعدة بيانات العقارات والمستخدمين" },
          { name: "Google Maps API", category: "الخدمات السحابية", description: "خرائط تفاعلية وبحث بالموقع" },
          { name: "Firebase", category: "الخدمات السحابية", description: "إشعارات فورية وتحليلات" },
          { name: "AWS S3", category: "الخدمات السحابية", description: "تخزين صور العقارات والمستندات" },
        ],
        items: [
          { title: "تحليل المتطلبات والتخطيط", description: "تحليل شامل لنماذج العقارات وأنواع المستخدمين وإعداد المواصفات الفنية", quantity: "1", unitPrice: "4000", sectionName: "مرحلة التخطيط" },
          { title: "تصميم UI/UX الاحترافي", description: "تصميم كامل لتطبيق العميل وتطبيق الوسيط ولوحة الإدارة على Figma", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التصميم" },
          { title: "تطوير تطبيق العميل (Flutter)", description: "تصفح العقارات بالخريطة، البحث المتقدم، الصور، حجز المعاينة، التواصل", quantity: "1", unitPrice: "20000", sectionName: "مرحلة التطوير" },
          { title: "تطوير تطبيق الوسيط العقاري", description: "إدارة حافظة العقارات، العملاء المحتملين، المواعيد، الصفقات وكشف الأرباح", quantity: "1", unitPrice: "15000", sectionName: "مرحلة التطوير" },
          { title: "لوحة تحكم الإدارة (Web)", description: "إدارة الوسطاء والعقارات والمستخدمين والتقارير والإحصاءات", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التطوير" },
          { title: "تطوير الخادم والـ API", description: "Node.js + PostgreSQL: APIs كاملة مع منطق البحث والحجز", quantity: "1", unitPrice: "12000", sectionName: "مرحلة التطوير" },
          { title: "نظام البحث بالخرائط", description: "بحث جغرافي متقدم على Google Maps مع فلاتر السعر والنوع والمساحة", quantity: "1", unitPrice: "7000", sectionName: "مرحلة التطوير" },
          { title: "نظام الإشعارات والتنبيهات", description: "تنبيهات عقارات جديدة وحالة الطلبات والمواعيد", quantity: "1", unitPrice: "3000", sectionName: "مرحلة التطوير" },
          { title: "CRM عقاري بسيط", description: "إدارة العملاء المحتملين والمتابعات والصفقات للوسطاء", quantity: "1", unitPrice: "6000", sectionName: "مرحلة التطوير" },
          { title: "اختبار الجودة الشامل", description: "اختبار وظيفي وأداء على أجهزة iOS وAndroid متعددة", quantity: "1", unitPrice: "4000", sectionName: "مرحلة الإطلاق" },
          { title: "نشر وإطلاق التطبيق", description: "نشر على App Store وGoogle Play وإعداد الخوادم الإنتاجية", quantity: "1", unitPrice: "4000", sectionName: "مرحلة الإطلاق" },
          { title: "تدريب ودعم 6 أشهر", description: "تدريب الوسطاء والإدارة + دعم فني لمدة 6 أشهر", quantity: "1", unitPrice: "8000", sectionName: "مرحلة الإطلاق" },
        ],
      },
      // ─── 8. نظام ERP لنادي رياضي (وقت الحركات) ───────────────────────────
      {
        tenantId, name: "نظام ERP لنادي رياضي", nameEn: "Sports Club ERP System", category: "erp",
        defaultValidity: 30, defaultTaxPercent: "15", isDefault: true, displayOrder: 7,
        defaultTerms: TERMS_ERP,
        defaultTimelineDays: 180,
        defaultIntroText: `تقدم سوفت لكس بفخر تطوير نظام ERP متكامل لإدارة نادي وقت الحركات، يهدف إلى أتمتة جميع الخدمات والعمليات الحالية وبناء سير عمل متكامل وسلس بين جميع الأطراف المشاركة.

النظام مصمم لإدارة جميع مكونات النادي بدءًا من الأعضاء والاشتراكات، مرورًا بالمدربين والموظفين، وصولًا إلى الإدارة المالية والتقارير التشغيلية، مع ضمان تجربة سلسة لكل من الإدارة والعملاء.

نقترح تحويل النادي إلى نموذج تشغيل ذكي (Smart Gym Management System) بحيث يتم التحكم الكامل في جميع العمليات من لوحة تحكم مركزية واحدة، مع توفير تطبيقات متخصصة للأعضاء والموظفين على iOS وAndroid.

النظام ليس مجرد برنامج إدارة نادي، بل منصة رقمية متكاملة تمكّن الإدارة من التحكم الكامل، تحسين الإيرادات، رفع جودة الخدمة، واتخاذ قرارات ذكية مبنية على البيانات الفعلية.`,
        defaultRequirements: `يهدف هذا المشروع إلى تطوير نظام ERP متكامل لإدارة الأندية الرياضية، مخصص لنادي وقت الحركات، بحيث يغطي جميع العمليات التشغيلية والإدارية والمالية ضمن منصة واحدة مترابطة.

🧩 نطاق النظام (Scope of Work):

1️⃣ إدارة الأعضاء والاشتراكات (Membership Management)
• تسجيل الأعضاء وإدارة ملفاتهم الكاملة
• إدارة الاشتراكات (شهري / ربع سنوي / سنوي / باقات مخصصة)
• تجديد الاشتراكات والتنبيهات التلقائية قبل الانتهاء
• إدارة حالات الاشتراك (نشط / منتهي / مجمد)
• ربط الاشتراك بنظام الدخول (البصمة / QR Code)
• منع دخول الأعضاء تلقائيًا عند تجميد الاشتراك أو انتهائه

2️⃣ إدارة الدخول والحضور (Access Control & Attendance)
• تسجيل دخول الأعضاء عبر البصمة أو QR Code
• تسجيل حضور الموظفين عبر التطبيق
• تتبع أوقات الدخول والخروج بشكل دقيق
• تقارير الحضور اليومية والشهرية التفصيلية
• ربط الحضور بحالة الاشتراك تلقائيًا

3️⃣ إدارة الموارد البشرية (HR Management)
• إدارة بيانات الموظفين والمدربين الكاملة
• إدارة الحضور والانصراف عبر التطبيق
• إدارة الرواتب والعمولات (للمدربين)
• تقييم الأداء ومتابعة المهام
• إدارة الجداول الوظيفية والحصص والمناوبات

4️⃣ الإدارة المالية (Finance Management)
• إدارة الإيرادات (اشتراكات / خدمات إضافية / مبيعات)
• إدارة المصروفات والتكاليف التشغيلية
• إدارة الصندوق (Cash / POS / Online)
• تقارير مالية تفصيلية لحظية
• الربط المباشر مع الاشتراكات والمبيعات

5️⃣ إدارة الخدمات والبرامج (Classes & Programs)
• إدارة الحصص التدريبية الجماعية (Classes)
• جدولة المدربين وإدارة سعة القاعات
• تسجيل الأعضاء في الحصص
• تتبع الحضور داخل الحصص
• إدارة البرامج الخاصة (Personal Training / Packages)

6️⃣ إدارة المبيعات (Sales Management)
• إدارة عمليات البيع داخل النادي
• نقاط البيع (POS) مع ربط الطابعات
• إدارة العروض والخصومات والباقات
• تتبع أداء المبيعات ومؤشرات الأداء
• تقارير التحويل (Leads → Members)

7️⃣ إدارة العملاء والتجربة (CRM)
• إدارة العملاء المحتملين (Leads)
• متابعة العملاء وتحويلهم إلى مشتركين
• إدارة التواصل (SMS / WhatsApp / Email)
• سجل كامل لجميع تفاعلات العميل

8️⃣ التقارير والتحليلات (Reports & Analytics)
• تقارير الاشتراكات (نشط / منتهي / مجمد)
• تقارير الحضور اليومية والشهرية
• تقارير الإيرادات والمصروفات
• تقارير أداء المدربين والموظفين
• Dashboard للإدارة العليا مع مؤشرات KPIs

🚀 أهداف النظام:
• رفع كفاءة تشغيل النادي وتقليل العمليات اليدوية
• تحسين تجربة الأعضاء ورفع معدل رضاهم
• زيادة معدل تجديد الاشتراكات وتقليل الهدر
• تحسين إدارة الإيرادات والتقارير المالية
• تمكين الإدارة من اتخاذ قرارات مبنية على البيانات`,
        defaultPaymentSchedule: [
          { milestone: "عند توقيع العقد وبدء المشروع", percent: 20, notes: "تشمل مرحلة التخطيط وتحديد المتطلبات الأولية وتشكيل الفريق" },
          { milestone: "عند تسليم وثيقة التحليل التفصيلي (SRS)", percent: 15, notes: "تسليم التحليل الشامل والمتطلبات لجميع إدارات النظام" },
          { milestone: "عند اعتماد التصميم المعماري (Architecture Design)", percent: 20, notes: "تشمل البنية التحتية والنظام الأساسي بما في ذلك الواجهة الخلفية وقواعد البيانات" },
          { milestone: "عند تسليم النسخة الأولية من النظام", percent: 15, notes: "النسخة الأولية تضم جميع المكونات الرئيسية للنظام" },
          { milestone: "عند تسليم النسخة التجريبية (Beta Version)", percent: 10, notes: "النسخة التجريبية للاختبار الداخلي وأخذ التغذية الراجعة" },
          { milestone: "عند تسليم النسخة النهائية", percent: 10, notes: "تشمل جميع الميزات والتعديلات بناءً على التغذية الراجعة" },
          { milestone: "عند تدريب الموظفين وتوثيق النظام الكامل", percent: 10, notes: "يشمل تدريب الفرق المعنية وتقديم وثائق النظام كاملة" },
        ],
        defaultTeamMembers: [
          { role: "مدير المشروع", name: "", title: "Project Manager (PMP Certified)", experience: "5+ سنوات", bio: "خبرة في تطوير البرمجيات الرشيقة (Agile) وإدارة مشاريع ERP متعددة المراحل" },
          { role: "محلل الأعمال", name: "", title: "Business Analyst", experience: "6+ سنوات", bio: "متخصص في تحليل متطلبات الأعمال وإعداد وثائق SRS التفصيلية للأنظمة المعقدة" },
          { role: "مدير تجربة المستخدم", name: "", title: "UX/UI Manager", experience: "9+ سنوات", bio: "خبير في تصميم تجارب المستخدم للأنظمة المؤسسية وإدارة فريق التصميم" },
          { role: "مصمم UX/UI أول", name: "", title: "Senior UX/UI Designer", experience: "6+ سنوات", bio: "متخصص في تصميم واجهات ERP وإنشاء Wireframes والنماذج الأولية التفاعلية" },
          { role: "كبار المطورين", name: "", title: "Senior Software Engineers", experience: "6+ سنوات", bio: "خبراء في تطوير Backend (NestJS) وFrontend (React) والتطبيقات (React Native)" },
          { role: "مهندس مراقبة الجودة", name: "", title: "QA Engineer", experience: "3+ سنوات", bio: "متخصص في اختبار البرمجيات وضمان جودة النظام على جميع المراحل" },
        ],
        targetAudience: [
          { group: "الإدارة العليا", role: "اتخاذ القرارات الاستراتيجية: Dashboard شامل، تقارير تحليلية متقدمة، مؤشرات الأداء KPIs، متابعة نمو النادي", language: "عربي", system: "Web (لوحة الإدارة)" },
          { group: "مدير الفرع / إدارة العمليات", role: "إدارة العمليات اليومية: متابعة الاشتراكات والحضور، إدارة الجداول والحصص، متابعة أداء المدربين والموظفين", language: "عربي", system: "Web (لوحة الإدارة)" },
          { group: "موظف الاستقبال / المبيعات", role: "تسجيل الأعضاء الجدد، إدارة الاشتراكات والتجديد، إصدار الفواتير واستلام المدفوعات، الوصول السريع لبيانات العميل", language: "عربي", system: "Web (لوحة الاستقبال)" },
          { group: "المدرب / الفني", role: "الاطلاع على جداول الحصص، متابعة حضور الأعضاء، إدارة الجلسات الشخصية (PT)، تقييم أداء الأعضاء وتسجيل الملاحظات", language: "عربي", system: "Web / تطبيق جوال" },
          { group: "الموظفون / HR", role: "تسجيل الحضور والانصراف عبر التطبيق، إدارة ملفات الموظفين والرواتب، طلب الإجازات، متابعة الجداول الوظيفية", language: "عربي", system: "Web / تطبيق جوال" },
          { group: "الفريق المالي", role: "تتبع الإيرادات (اشتراكات/خدمات)، إدارة المصروفات، إعداد التقارير المالية للإدارة العليا، إدارة الصندوق (Cash/POS/Online)", language: "عربي", system: "Web" },
          { group: "الأعضاء", role: "عرض الاشتراك والحالة، الدخول للنادي (QR/بصمة)، حجز الحصص التدريبية، متابعة الجلسات، استقبال الإشعارات والعروض", language: "عربي", system: "iOS / Android" },
          { group: "موظف الأمن / البوابة", role: "مراقبة دخول الأعضاء عبر بصمة أو QR والتحقق التلقائي من صلاحية الاشتراك ومنع الدخول غير المصرح به", language: "عربي", system: "جهاز البوابة / تطبيق" },
        ],
        deliverables: [
          { name: "لوحة تحكم مركزية (Web)", description: "لوحة إدارة شاملة لجميع عمليات النادي مع Dashboard لحظي ومؤشرات الأداء" },
          { name: "موديول إدارة الأعضاء والاشتراكات", description: "نظام متكامل لتسجيل الأعضاء وإدارة الباقات والاشتراكات (نشط/مجمد/منتهي) مع التجديد التلقائي" },
          { name: "موديول الدخول والحضور (QR + بصمة)", description: "نظام دخول ذكي عبر QR Code أو بصمة الإصبع مع ربط البوابات الإلكترونية وتقارير الحضور" },
          { name: "موديول إدارة الموارد البشرية والرواتب", description: "ملفات الموظفين والمدربين، تتبع الحضور والانصراف، كشوف الرواتب والعمولات" },
          { name: "موديول الإدارة المالية والمحاسبة", description: "إدارة الإيرادات والمصروفات، الصندوق (نقدي/POS/أونلاين)، تقارير مالية متقدمة" },
          { name: "موديول نقطة البيع (POS)", description: "نظام مبيعات لحظي للاشتراكات والمنتجات مع ربط الطابعات وإدارة الفواتير" },
          { name: "موديول الحصص والبرامج التدريبية", description: "جدولة الحصص الجماعية والتدريب الشخصي، تسجيل الأعضاء، إدارة سعة القاعات" },
          { name: "موديول CRM والتسويق", description: "إدارة العملاء المحتملين، حملات تسويقية، تتبع التحويلات، تذكيرات التجديد التلقائية" },
          { name: "موديول التقارير والتحليلات", description: "Dashboard شامل: تقارير الاشتراكات والإيرادات والحضور والمدربين مع مؤشرات KPIs" },
          { name: "موديول المنتجات والمخزون", description: "إدارة مخزون المكملات الغذائية والمنتجات، تتبع الكميات، ربط المبيعات بالمخزون" },
          { name: "موديول الصيانة والأصول", description: "تسجيل أجهزة وأصول النادي، جداول الصيانة الدورية، تتبع الأعطال وحالة الأجهزة" },
          { name: "موديول الصلاحيات والأمان", description: "نظام Roles & Permissions متكامل، سجل العمليات Audit Logs، حماية شاملة للبيانات" },
          { name: "تطبيق الأعضاء والموظفين (iOS + Android)", description: "تطبيق جوال للأعضاء (اشتراك/حجز/QR/إشعارات) وللموظفين (حضور/جداول)" },
          { name: "وثيقة SRS وتحليل المتطلبات", description: "توثيق شامل لكافة المتطلبات الوظيفية وغير الوظيفية لجميع الموديولات الـ 12" },
          { name: "دعم وصيانة 12 شهر", description: "ضمان كامل على الكود، دعم فني، تحديثات أمنية لمدة 12 شهر بعد التسليم" },
        ],
        technologies: [
          { name: "React.js / Vite", category: "واجهة الويب", description: "لوحة تحكم سريعة وتفاعلية لجميع مستخدمي الويب" },
          { name: "Node.js / NestJS", category: "الخادم", description: "Backend قابل للتوسع مع هيكلة Modular للموديولات الـ 12" },
          { name: "PostgreSQL", category: "قاعدة البيانات", description: "قاعدة بيانات علائقية موثوقة مع دعم Multi-tenant" },
          { name: "React Native / Capacitor", category: "تطبيق جوال", description: "تطبيق iOS وAndroid للأعضاء والموظفين" },
          { name: "Railway", category: "الخدمات السحابية", description: "استضافة سحابية للخادم وقاعدة البيانات" },
          { name: "Cloudflare R2", category: "الخدمات السحابية", description: "تخزين الملفات والصور بتكلفة منخفضة وأداء عالٍ" },
          { name: "Firebase", category: "الخدمات السحابية", description: "إشعارات Push الفورية للتطبيق وReal-time updates" },
          { name: "Redis", category: "قاعدة البيانات", description: "تخزين مؤقت للجلسات وتحسين الأداء" },
        ],
        items: [
          // مرحلة التخطيط والتحليل
          { title: "جمع المتطلبات وإعداد وثيقة SRS", description: "تحليل شامل لجميع عمليات النادي وإعداد وثيقة المواصفات التقنية الكاملة (SRS) للموديولات الـ 12", quantity: "1", unitPrice: "12000", sectionName: "مرحلة التخطيط والتحليل" },
          { title: "إعداد بيئة التطوير والتحكم في الكود", description: "إعداد Repository، Docker، CI/CD Pipeline، وبنية المشروع المعمارية (Architecture Design)", quantity: "1", unitPrice: "5000", sectionName: "مرحلة التخطيط والتحليل" },
          { title: "تصميم UI/UX (لوحة الويب + تطبيق الجوال)", description: "تصميم احترافي على Figma لجميع شاشات لوحة الإدارة وتطبيق الجوال مع Prototype تفاعلي", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التخطيط والتحليل" },
          // مرحلة التطوير - الموديولات الأساسية
          { title: "موديول إدارة الأعضاء والاشتراكات", description: "تسجيل الأعضاء، إدارة الباقات، حالات الاشتراك (نشط/مجمد/منتهي)، تجديد تلقائي، صور الأعضاء", quantity: "1", unitPrice: "16000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول الدخول والحضور (QR + بصمة)", description: "ربط البوابات الإلكترونية، دخول عبر QR Code أو بصمة، منع الدخول عند انتهاء الاشتراك، تقارير الحضور", quantity: "1", unitPrice: "14000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول الإدارة المالية والمحاسبة", description: "إدارة الإيرادات والمصروفات، الصندوق (نقدي/POS/أونلاين)، الفواتير، التقارير المالية المتقدمة", quantity: "1", unitPrice: "13000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول إدارة المبيعات ونقطة البيع (POS)", description: "نظام POS متكامل لبيع الاشتراكات والمنتجات، ربط الطابعات، إدارة الكاشير والفواتير", quantity: "1", unitPrice: "11000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول إدارة الموارد البشرية والرواتب", description: "ملفات الموظفين والمدربين، حضور وانصراف عبر التطبيق، كشوف الرواتب، العمولات، التقييم", quantity: "1", unitPrice: "12000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول إدارة الحصص والبرامج التدريبية", description: "جدولة الحصص الجماعية، التدريب الشخصي، تسجيل الأعضاء، إدارة سعة القاعات، تقارير الحضور", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول CRM والتسويق الرقمي", description: "إدارة العملاء المحتملين، حملات SMS/WhatsApp، تتبع التحويلات، تذكيرات تجديد الاشتراكات التلقائية", quantity: "1", unitPrice: "8000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول التقارير والتحليلات (Dashboard)", description: "Dashboard لحظي للإدارة، تقارير الاشتراكات والإيرادات والحضور والمدربين، مؤشرات KPIs متقدمة", quantity: "1", unitPrice: "10000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول إدارة المنتجات والمخزون", description: "إدارة مخزون المكملات والمنتجات، تتبع الكميات، ربط المبيعات بالمخزون، تنبيهات النقص", quantity: "1", unitPrice: "7000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول إدارة الصيانة والأصول", description: "تسجيل أجهزة النادي، جداول الصيانة الدورية، تتبع الأعطال، تقارير حالة الأجهزة", quantity: "1", unitPrice: "6000", sectionName: "مرحلة التطوير - الموديولات" },
          { title: "موديول الصلاحيات والأمان (Roles & Permissions)", description: "نظام صلاحيات متعدد المستويات، سجل العمليات Audit Logs، حماية بيانات متقدمة، 2FA", quantity: "1", unitPrice: "6000", sectionName: "مرحلة التطوير - الموديولات" },
          // التطبيق والبنية التحتية
          { title: "تطبيق الأعضاء والموظفين (iOS + Android)", description: "تطبيق جوال: عرض الاشتراك، حجز الحصص، دخول QR، الإشعارات، حضور الموظفين وجداولهم", quantity: "1", unitPrice: "16000", sectionName: "مرحلة التطوير - التطبيق" },
          { title: "نظام النسخ الاحتياطي وإدارة الخادم", description: "إعداد خوادم Railway، نسخ احتياطي تلقائي، Cloudflare R2، Redis، إدارة البيئة الإنتاجية", quantity: "1", unitPrice: "5000", sectionName: "مرحلة الإطلاق" },
          { title: "تعزيز الأمان وتحسين الأداء", description: "SSL، جدار الحماية، تحسين استعلامات DB، تحسين الأداء العام، اختبار الأمان والثغرات", quantity: "1", unitPrice: "4000", sectionName: "مرحلة الإطلاق" },
          { title: "اختبار الجودة الشامل وإصدار Beta", description: "اختبار وظيفي وأداء وأمان لجميع الموديولات على بيئة تجريبية مع العميل، إصلاح الملاحظات", quantity: "1", unitPrice: "7000", sectionName: "مرحلة الإطلاق" },
          { title: "النشر الإنتاجي والإطلاق الرسمي", description: "نشر النسخة النهائية على خوادم الإنتاج، ترحيل البيانات، إطلاق رسمي مع مراقبة", quantity: "1", unitPrice: "4000", sectionName: "مرحلة الإطلاق" },
          { title: "تدريب الموظفين وتوثيق النظام الكامل", description: "جلسات تدريبية للإدارة والمدربين والموظفين، دليل المستخدم الكامل، وثائق API ودليل التشغيل", quantity: "1", unitPrice: "5000", sectionName: "مرحلة الإطلاق" },
          { title: "دعم وصيانة ما بعد التسليم (12 شهر)", description: "ضمان شامل على الكود لمدة 12 شهر: إصلاح الأخطاء، تحديثات أمنية، دعم فني متواصل", quantity: "1", unitPrice: "8000", sectionName: "مرحلة الإطلاق" },
          // إضافي اختياري
          { title: "تكامل بوابة الدفع الإلكتروني", description: "ربط مع بوابة دفع (PayTabs / Moyasar / مدى) للاشتراكات والمدفوعات الأونلاين", quantity: "1", unitPrice: "5000", sectionName: "إضافات اختيارية", isOptional: true },
          { title: "نظام الولاء والمكافآت للأعضاء", description: "برنامج نقاط للأعضاء المميزين مع مكافآت التجديد المبكر والإحالة", quantity: "1", unitPrice: "4000", sectionName: "إضافات اختيارية", isOptional: true },
        ],
      },
    ];
  }

  // ── Google Import Buffer ──────────────────────────────────────────────────
  async getGoogleImportBuffer(tenantId: string): Promise<GoogleImportBuffer[]> {
    return db.select().from(googleImportBuffer).where(eq(googleImportBuffer.tenantId, tenantId)).orderBy(desc(googleImportBuffer.createdAt));
  }
  async createGoogleImportBufferItem(data: InsertGoogleImportBuffer): Promise<GoogleImportBuffer> {
    const [row] = await db.insert(googleImportBuffer).values(data).returning();
    return row;
  }
  async updateGoogleImportBufferItem(id: string, tenantId: string, data: Partial<InsertGoogleImportBuffer>): Promise<GoogleImportBuffer | undefined> {
    const [row] = await db.update(googleImportBuffer).set(data).where(and(eq(googleImportBuffer.id, id), eq(googleImportBuffer.tenantId, tenantId))).returning();
    return row;
  }
  async deleteGoogleImportBufferItem(id: string, tenantId: string): Promise<void> {
    await db.delete(googleImportBuffer).where(and(eq(googleImportBuffer.id, id), eq(googleImportBuffer.tenantId, tenantId)));
  }
  async clearGoogleImportBuffer(tenantId: string): Promise<void> {
    await db.delete(googleImportBuffer).where(and(eq(googleImportBuffer.tenantId, tenantId), eq(googleImportBuffer.status, "pending")));
  }

  // ── Service Library ───────────────────────────────────────────────────────
  async getServiceLibrary(tenantId: string): Promise<ServiceLibraryItem[]> {
    return db.select().from(serviceLibrary).where(and(eq(serviceLibrary.tenantId, tenantId), eq(serviceLibrary.isActive, true))).orderBy(asc(serviceLibrary.displayOrder));
  }
  async createServiceLibraryItem(data: InsertServiceLibraryItem): Promise<ServiceLibraryItem> {
    const [row] = await db.insert(serviceLibrary).values(data).returning();
    return row;
  }
  async updateServiceLibraryItem(id: string, tenantId: string, data: Partial<InsertServiceLibraryItem>): Promise<ServiceLibraryItem | undefined> {
    const [row] = await db.update(serviceLibrary).set(data).where(and(eq(serviceLibrary.id, id), eq(serviceLibrary.tenantId, tenantId))).returning();
    return row;
  }
  async deleteServiceLibraryItem(id: string, tenantId: string): Promise<void> {
    await db.update(serviceLibrary).set({ isActive: false }).where(and(eq(serviceLibrary.id, id), eq(serviceLibrary.tenantId, tenantId)));
  }
  async seedDefaultServiceLibrary(tenantId: string): Promise<void> {
    const existing = await this.getServiceLibrary(tenantId);
    if (existing.length > 0) return;
    const defaults = [
      { tenantId, title: "تصميم UI/UX", description: "تصميم شاشات وتجربة المستخدم", unitPrice: "5000", unit: "item", category: "design", displayOrder: 0 },
      { tenantId, title: "تطوير تطبيق Flutter", description: "تطبيق جوال iOS + Android", unitPrice: "15000", unit: "item", category: "mobile", displayOrder: 1 },
      { tenantId, title: "تطوير واجهة React", description: "واجهة أمامية React.js أو Next.js", unitPrice: "8000", unit: "item", category: "web", displayOrder: 2 },
      { tenantId, title: "تطوير Backend Node.js", description: "API وقاعدة بيانات PostgreSQL", unitPrice: "10000", unit: "item", category: "backend", displayOrder: 3 },
      { tenantId, title: "استضافة سحابية (شهرياً)", description: "استضافة على AWS أو GCP", unitPrice: "500", unit: "month", category: "hosting", displayOrder: 4 },
      { tenantId, title: "نشر على متاجر التطبيقات", description: "App Store + Google Play", unitPrice: "2000", unit: "item", category: "deployment", displayOrder: 5 },
      { tenantId, title: "إدارة سوشيال ميديا (شهرياً)", description: "إنشاء ونشر المحتوى + تقارير", unitPrice: "3000", unit: "month", category: "marketing", displayOrder: 6 },
      { tenantId, title: "إعلانات Google Ads (شهرياً)", description: "إدارة حملات جوجل الإعلانية", unitPrice: "2000", unit: "month", category: "marketing", displayOrder: 7 },
      { tenantId, title: "تصميم هوية بصرية", description: "شعار + دليل الهوية البصرية", unitPrice: "4000", unit: "item", category: "design", displayOrder: 8 },
      { tenantId, title: "تدريب وتوثيق", description: "تدريب الفريق وإعداد الدليل التشغيلي", unitPrice: "2000", unit: "item", category: "training", displayOrder: 9 },
      { tenantId, title: "صيانة وحماية (شهرياً)", description: "متابعة الأداء + تحديثات الأمان", unitPrice: "1000", unit: "month", category: "maintenance", displayOrder: 10 },
      { tenantId, title: "ساعة استشارة تقنية", description: "جلسة استشارية مع المختصين", unitPrice: "500", unit: "hr", category: "consulting", displayOrder: 11 },
    ];
    for (const item of defaults) await this.createServiceLibraryItem(item as any);
  }

  // ── Proposal Extras ───────────────────────────────────────────────────────
  async cloneProposal(id: string, tenantId: string): Promise<CrmProposal> {
    const original = await this.getCrmProposal(id, tenantId);
    if (!original) throw new Error("Proposal not found");

    const count = await db.select({ c: sql<number>`count(*)` }).from(crmProposals).where(eq(crmProposals.tenantId, tenantId));
    const num = (Number(count[0]?.c) || 0) + 1;
    const proposalNumber = `QT-${String(num).padStart(4, "0")}`;

    const [cloned] = await db.insert(crmProposals).values({
      tenantId, proposalNumber, title: `نسخة من: ${original.title}`,
      companyId: original.companyId, contactId: original.contactId, dealId: original.dealId,
      currency: original.currency, discountType: original.discountType,
      discountValue: original.discountValue, taxPercent: original.taxPercent,
      taxAmount: original.taxAmount, subtotal: original.subtotal, total: original.total,
      termsAndNotes: original.termsAndNotes, internalNotes: original.internalNotes,
      paymentSchedule: original.paymentSchedule as any,
      status: "draft", preparedById: original.preparedById,
    }).returning();

    const originalItems = await db.select().from(crmProposalItems).where(eq(crmProposalItems.proposalId, id));
    for (const item of originalItems) {
      await db.insert(crmProposalItems).values({
        proposalId: cloned.id, tenantId,
        title: item.title, description: item.description,
        quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.lineTotal,
        displayOrder: item.displayOrder, sectionName: item.sectionName, isOptional: item.isOptional,
      });
    }
    return cloned;
  }

  async signProposal(proposalId: string, tenantId: string, signature: string): Promise<CrmProposal | undefined> {
    const [row] = await db.update(crmProposals).set({
      clientSignature: signature, signedAt: new Date(),
      status: "accepted", acceptedAt: new Date(), updatedAt: new Date(),
    }).where(and(eq(crmProposals.id, proposalId), eq(crmProposals.tenantId, tenantId))).returning();
    return row;
  }

  async incrementProposalViewCount(id: string, tenantId: string): Promise<void> {
    await db.update(crmProposals).set({
      viewCount: sql`coalesce(${crmProposals.viewCount}, 0) + 1`,
      viewedAt: new Date(), updatedAt: new Date(),
    }).where(and(eq(crmProposals.id, id), eq(crmProposals.tenantId, tenantId)));
  }

  // ── Bookings ──────────────────────────────────────────────────────────────
  async createBooking(data: InsertBooking): Promise<Booking> {
    const [row] = await db.insert(bookings).values(data).returning();
    return row;
  }

  async getBookings(tenantId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.tenantId, tenantId)).orderBy(desc(bookings.createdAt));
  }

  async updateBooking(id: string, tenantId: string, data: Partial<InsertBooking>): Promise<Booking | null> {
    const [row] = await db.update(bookings).set(data).where(and(eq(bookings.id, id), eq(bookings.tenantId, tenantId))).returning();
    return row || null;
  }

  async deleteBooking(id: string, tenantId: string): Promise<void> {
    await db.delete(bookings).where(and(eq(bookings.id, id), eq(bookings.tenantId, tenantId)));
  }

  // ── Inventory ─────────────────────────────────────────────────────────────
  async getInventoryItems(tenantId: string, filters?: { category?: string; search?: string }): Promise<InventoryItem[]> {
    let q = db.select().from(inventoryItems).where(and(eq(inventoryItems.tenantId, tenantId), eq(inventoryItems.isActive, true))).$dynamic();
    if (filters?.category) q = q.where(eq(inventoryItems.category, filters.category));
    if (filters?.search) q = q.where(or(ilike(inventoryItems.name, `%${filters.search}%`), ilike(inventoryItems.sku!, `%${filters.search}%`)));
    return (await q).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getInventoryItem(id: string, tenantId: string): Promise<InventoryItem | null> {
    const [row] = await db.select().from(inventoryItems).where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId)));
    return row || null;
  }

  async createInventoryItem(data: InsertInventoryItem): Promise<InventoryItem> {
    const [row] = await db.insert(inventoryItems).values(data).returning();
    return row;
  }

  async updateInventoryItem(id: string, tenantId: string, data: Partial<InsertInventoryItem>): Promise<InventoryItem | null> {
    const [row] = await db.update(inventoryItems).set({ ...data, updatedAt: new Date() })
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId))).returning();
    return row || null;
  }

  async deleteInventoryItem(id: string, tenantId: string): Promise<void> {
    await db.update(inventoryItems).set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId)));
  }

  // ── Tickets ────────────────────────────────────────────────────────────────
  async getTickets(tenantId: string, filters?: { status?: string; priority?: string; category?: string }): Promise<Ticket[]> {
    let q = db.select().from(tickets).where(eq(tickets.tenantId, tenantId)).$dynamic();
    if (filters?.status) q = q.where(eq(tickets.status, filters.status));
    if (filters?.priority) q = q.where(eq(tickets.priority, filters.priority));
    if (filters?.category) q = q.where(eq(tickets.category, filters.category));
    return (await q).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTicket(id: string, tenantId: string): Promise<Ticket | null> {
    const [row] = await db.select().from(tickets).where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)));
    return row || null;
  }

  async createTicket(data: InsertTicket): Promise<Ticket> {
    const count = await db.select({ c: sql<number>`count(*)` }).from(tickets).where(eq(tickets.tenantId, data.tenantId));
    const num = (Number(count[0]?.c) || 0) + 1;
    const number = `TK-${String(num).padStart(4, "0")}`;
    const [row] = await db.insert(tickets).values({ ...data, number }).returning();
    return row;
  }

  async updateTicket(id: string, tenantId: string, data: Partial<InsertTicket>): Promise<Ticket | null> {
    const [row] = await db.update(tickets).set({ ...data, updatedAt: new Date() })
      .where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId))).returning();
    return row || null;
  }

  async deleteTicket(id: string, tenantId: string): Promise<void> {
    await db.delete(ticketMessages).where(eq(ticketMessages.ticketId, id));
    await db.delete(tickets).where(and(eq(tickets.id, id), eq(tickets.tenantId, tenantId)));
  }

  async getTicketMessages(ticketId: string, tenantId: string): Promise<TicketMessage[]> {
    return db.select().from(ticketMessages)
      .where(and(eq(ticketMessages.ticketId, ticketId), eq(ticketMessages.tenantId, tenantId)))
      .orderBy(asc(ticketMessages.createdAt));
  }

  async createTicketMessage(data: InsertTicketMessage): Promise<TicketMessage> {
    const [row] = await db.insert(ticketMessages).values(data).returning();
    return row;
  }

  // ── Employees ─────────────────────────────────────────────────────────────
  async getEmployees(tenantId: string, filters?: { status?: string; department?: string }): Promise<Employee[]> {
    let q = db.select().from(employees).where(eq(employees.tenantId, tenantId)).$dynamic();
    if (filters?.status) q = q.where(eq(employees.status, filters.status));
    if (filters?.department) q = q.where(eq(employees.department, filters.department));
    return (await q).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getEmployee(id: string, tenantId: string): Promise<Employee | null> {
    const [row] = await db.select().from(employees).where(and(eq(employees.id, id), eq(employees.tenantId, tenantId)));
    return row || null;
  }

  async createEmployee(data: InsertEmployee): Promise<Employee> {
    const [row] = await db.insert(employees).values(data).returning();
    return row;
  }

  async updateEmployee(id: string, tenantId: string, data: Partial<InsertEmployee>): Promise<Employee | null> {
    const [row] = await db.update(employees).set({ ...data, updatedAt: new Date() })
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId))).returning();
    return row || null;
  }

  async deleteEmployee(id: string, tenantId: string): Promise<void> {
    await db.delete(employees).where(and(eq(employees.id, id), eq(employees.tenantId, tenantId)));
  }

  // Phone Settings
  async getPhoneSettings(tenantId: string): Promise<PhoneSetting[]> {
    return db.select().from(phoneSettings).where(eq(phoneSettings.tenantId, tenantId)).orderBy(asc(phoneSettings.displayOrder));
  }

  async getPhoneSettingByCategory(tenantId: string, category: string): Promise<PhoneSetting | undefined> {
    const [row] = await db.select().from(phoneSettings)
      .where(and(eq(phoneSettings.tenantId, tenantId), eq(phoneSettings.category, category)));
    return row;
  }

  async getDefaultPhoneSetting(tenantId: string): Promise<PhoneSetting | undefined> {
    const [row] = await db.select().from(phoneSettings)
      .where(and(eq(phoneSettings.tenantId, tenantId), eq(phoneSettings.isDefault, true)));
    return row;
  }

  async createPhoneSetting(tenantId: string, data: InsertPhoneSetting): Promise<PhoneSetting> {
    const [row] = await db.insert(phoneSettings).values({ ...data, tenantId }).returning();
    return row;
  }

  async updatePhoneSetting(id: string, tenantId: string, data: Partial<InsertPhoneSetting>): Promise<PhoneSetting | undefined> {
    const [row] = await db.update(phoneSettings).set({ ...data, updatedAt: new Date() })
      .where(and(eq(phoneSettings.id, id), eq(phoneSettings.tenantId, tenantId))).returning();
    return row;
  }

  async deletePhoneSetting(id: string, tenantId: string): Promise<void> {
    await db.delete(phoneSettings).where(and(eq(phoneSettings.id, id), eq(phoneSettings.tenantId, tenantId)));
  }
}

export const storage = new DatabaseStorage();
