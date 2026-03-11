import {
  tenants, users, subscriptions, companies, contacts, activityLog, sessions,
  services, projects, blogCategories, blogPosts, siteClients, redirects,
  marketingSettings, formLeads,
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
  type AuthenticatedUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, count, sql } from "drizzle-orm";

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
  
  // Sessions
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  deleteSession(id: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  
  // Subscriptions
  getSubscriptionByTenantId(tenantId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  
  // Companies
  getCompanies(tenantId: string): Promise<Company[]>;
  getCompany(id: string, tenantId: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, tenantId: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string, tenantId: string): Promise<void>;
  
  // Contacts
  getContacts(tenantId: string): Promise<Contact[]>;
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

  // Form Leads
  getFormLeads(tenantId: string): Promise<FormLead[]>;
  createFormLead(lead: InsertFormLead): Promise<FormLead>;
  updateFormLead(id: string, tenantId: string, lead: Partial<InsertFormLead>): Promise<FormLead | undefined>;
  deleteFormLead(id: string, tenantId: string): Promise<void>;
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
  async getCompanies(tenantId: string): Promise<Company[]> {
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
    await db.delete(companies).where(and(eq(companies.id, id), eq(companies.tenantId, tenantId)));
  }

  // Contacts
  async getContacts(tenantId: string): Promise<Contact[]> {
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
}

export const storage = new DatabaseStorage();
