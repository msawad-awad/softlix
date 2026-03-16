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
  proposalTemplates, googleImportBuffer, serviceLibrary,
  type ProposalTemplate, type InsertProposalTemplate,
  type GoogleImportBuffer, type InsertGoogleImportBuffer,
  type ServiceLibraryItem, type InsertServiceLibraryItem,
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
  type AuthenticatedUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, count, sql, like, or, ilike } from "drizzle-orm";

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

    return {
      totalCompanies: totalCompaniesResult?.count || 0,
      totalContacts: totalContactsResult?.count || 0,
      newLeadsThisMonth: newLeadsResult?.count || 0,
      activeClients: activeClientsResult?.count || 0,
      recentActivities,
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
    let q = db.select().from(crmLeads).where(eq(crmLeads.tenantId, tenantId)).$dynamic();
    if (filters?.status) q = q.where(and(eq(crmLeads.tenantId, tenantId), eq(crmLeads.status, filters.status)));
    if (filters?.sourceId) q = q.where(and(eq(crmLeads.tenantId, tenantId), eq(crmLeads.sourceId, filters.sourceId)));
    if (filters?.assignedToId) q = q.where(and(eq(crmLeads.tenantId, tenantId), eq(crmLeads.assignedToId, filters.assignedToId)));
    return (await q.orderBy(desc(crmLeads.createdAt))).filter(r => {
      if (!filters?.search) return true;
      const s = filters.search.toLowerCase();
      return (r.fullName?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s) || r.mobile?.includes(s) || r.companyName?.toLowerCase().includes(s));
    });
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
    if (existing.length > 0) return;
    const defaults = [
      {
        tenantId, name: "تطبيق جوال", nameEn: "Mobile App", category: "mobile-app",
        defaultValidity: 14, defaultTaxPercent: "15",
        defaultTerms: "• صلاحية العرض 14 يوماً من تاريخه\n• يتم تسليم المشروع خلال 90 يوم عمل\n• الدفع: 40% مقدم، 40% عند التسليم، 20% بعد التشغيل\n• يشمل صيانة مجانية 3 أشهر بعد الإطلاق",
        items: [
          { title: "تصميم UI/UX", description: "تصميم شاشات التطبيق وتجربة المستخدم", quantity: "1", unitPrice: "5000" },
          { title: "تطوير الواجهة الأمامية", description: "Flutter / React Native", quantity: "1", unitPrice: "15000" },
          { title: "تطوير الخادم والـ API", description: "Node.js + PostgreSQL", quantity: "1", unitPrice: "10000" },
          { title: "الاختبار والنشر", description: "نشر على App Store و Google Play", quantity: "1", unitPrice: "3000" },
        ],
        displayOrder: 0, isDefault: true,
      },
      {
        tenantId, name: "موقع ويب", nameEn: "Website", category: "web-platform",
        defaultValidity: 14, defaultTaxPercent: "15",
        defaultTerms: "• صلاحية العرض 14 يوماً\n• التسليم خلال 30-45 يوم عمل\n• الدفع: 50% مقدم، 50% عند التسليم\n• تدريب مجاني على لوحة التحكم",
        items: [
          { title: "تصميم الموقع", description: "تصميم احترافي متجاوب مع جميع الأجهزة", quantity: "1", unitPrice: "3000" },
          { title: "تطوير الموقع", description: "React.js / Next.js", quantity: "1", unitPrice: "7000" },
          { title: "لوحة تحكم CMS", description: "إدارة المحتوى بسهولة", quantity: "1", unitPrice: "2000" },
          { title: "الاستضافة والنطاق (سنة)", description: "استضافة سحابية سريعة", quantity: "1", unitPrice: "1000" },
        ],
        displayOrder: 1,
      },
      {
        tenantId, name: "نظام ERP / إدارة", nameEn: "ERP System", category: "erp",
        defaultValidity: 21, defaultTaxPercent: "15",
        defaultTerms: "• صلاحية العرض 21 يوماً\n• التسليم خلال 60-120 يوم حسب الحجم\n• الدفع: 30% مقدم، 40% منتصف المشروع، 30% عند التسليم\n• دعم فني 6 أشهر مجاناً",
        items: [
          { title: "تحليل المتطلبات", description: "دراسة العمليات وإعداد المواصفات", quantity: "1", unitPrice: "5000" },
          { title: "تطوير النظام", description: "نظام متكامل مع قاعدة البيانات", quantity: "1", unitPrice: "30000" },
          { title: "التكامل مع الأنظمة الخارجية", description: "API & Integrations", quantity: "1", unitPrice: "8000" },
          { title: "التدريب والتوثيق", description: "تدريب الفريق وإعداد الدليل", quantity: "1", unitPrice: "3000" },
        ],
        displayOrder: 2,
      },
      {
        tenantId, name: "خدمات تسويقية", nameEn: "Marketing Services", category: "marketing",
        defaultValidity: 7, defaultTaxPercent: "15",
        defaultTerms: "• صلاحية العرض 7 أيام\n• الدفع شهري مقدم\n• إشعار إيقاف الخدمة قبل 30 يوم",
        items: [
          { title: "إدارة حسابات التواصل الاجتماعي", description: "إنشاء ونشر المحتوى (شهرياً)", quantity: "1", unitPrice: "3000" },
          { title: "إعلانات جوجل", description: "إدارة حملات Google Ads", quantity: "1", unitPrice: "2000" },
          { title: "إنتاج المحتوى المرئي", description: "تصميم بوستات وفيديو موشن", quantity: "4", unitPrice: "500" },
        ],
        displayOrder: 3,
      },
    ];
    for (const t of defaults) await this.createProposalTemplate(t as any);
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
}

export const storage = new DatabaseStorage();
