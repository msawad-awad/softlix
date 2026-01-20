import {
  tenants, users, subscriptions, companies, contacts, activityLog, sessions,
  type Tenant, type InsertTenant,
  type User, type InsertUser,
  type Subscription, type InsertSubscription,
  type Company, type InsertCompany,
  type Contact, type InsertContact,
  type ActivityLog, type InsertActivityLog,
  type Session, type InsertSession,
  type AuthenticatedUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Tenants
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
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
}

export class DatabaseStorage implements IStorage {
  // Tenants
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
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
}

export const storage = new DatabaseStorage();
