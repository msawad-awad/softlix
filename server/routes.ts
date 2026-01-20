import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { AuthenticatedUser } from "@shared/schema";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const companySchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["lead", "prospect", "client", "archived"]).optional(),
  notes: z.string().optional(),
});

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyId: z.string().optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
});

// Authentication middleware
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const session = await storage.getSession(sessionId);
  if (!session || new Date(session.expiresAt) < new Date()) {
    if (session) {
      await storage.deleteSession(session.id);
    }
    return res.status(401).json({ message: "Session expired" });
  }

  const user = await storage.getAuthenticatedUser(session.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  req.user = user;
  req.sessionId = sessionId;
  next();
}

// Helper to create slug from company name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 50) + "-" + Date.now().toString(36);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // =========================================================================
  // AUTH ROUTES
  // =========================================================================
  
  // Register a new company + admin user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create tenant
      const tenant = await storage.createTenant({
        name: data.companyName,
        slug: createSlug(data.companyName),
        localeDefault: "ar",
        timezone: "Asia/Riyadh",
      });

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create admin user
      const user = await storage.createUser({
        tenantId: tenant.id,
        name: data.name,
        email: data.email,
        passwordHash,
        role: "admin",
        status: "active",
        locale: "ar",
      });

      // Create trial subscription (15 days)
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 15);
      
      await storage.createSubscription({
        tenantId: tenant.id,
        planName: "trial",
        status: "trial",
        trialEnd,
        billingPeriod: "monthly",
        currency: "SAR",
        modulesEnabled: ["crm", "quotes", "tasks"],
      });

      // Create session
      const sessionExpiry = new Date();
      sessionExpiry.setDate(sessionExpiry.getDate() + 7);
      
      const session = await storage.createSession({
        userId: user.id,
        tenantId: tenant.id,
        expiresAt: sessionExpiry,
      });

      // Log activity
      await storage.createActivityLog({
        tenantId: tenant.id,
        userId: user.id,
        entityType: "user",
        entityId: user.id,
        action: "registered",
        dataJson: { email: data.email, companyName: data.companyName },
      });

      // Set session cookie
      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const authUser = await storage.getAuthenticatedUser(user.id);
      res.status(201).json(authUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(data.password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.status !== "active") {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Create session
      const sessionExpiry = new Date();
      sessionExpiry.setDate(sessionExpiry.getDate() + 7);
      
      const session = await storage.createSession({
        userId: user.id,
        tenantId: user.tenantId,
        expiresAt: sessionExpiry,
      });

      // Log activity
      await storage.createActivityLog({
        tenantId: user.tenantId,
        userId: user.id,
        entityType: "user",
        entityId: user.id,
        action: "login",
        dataJson: { email: data.email },
      });

      // Set session cookie
      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const authUser = await storage.getAuthenticatedUser(user.id);
      res.json(authUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    if (req.sessionId) {
      await storage.deleteSession(req.sessionId);
    }
    res.clearCookie("sessionId");
    res.json({ message: "Logged out" });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    res.json(req.user);
  });

  // =========================================================================
  // DASHBOARD ROUTES
  // =========================================================================
  
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user!.tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // COMPANIES ROUTES
  // =========================================================================
  
  app.get("/api/companies", requireAuth, async (req, res) => {
    try {
      const companies = await storage.getCompanies(req.user!.tenantId);
      res.json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id, req.user!.tenantId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/companies", requireAuth, async (req, res) => {
    try {
      const data = companySchema.parse(req.body);
      
      const company = await storage.createCompany({
        ...data,
        tenantId: req.user!.tenantId,
        ownerId: req.user!.id,
        email: data.email || null,
        website: data.website || null,
        status: data.status || "lead",
      });

      await storage.createActivityLog({
        tenantId: req.user!.tenantId,
        userId: req.user!.id,
        entityType: "company",
        entityId: company.id,
        action: "created",
        dataJson: { name: company.name },
      });

      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create company error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const data = companySchema.partial().parse(req.body);
      
      const company = await storage.updateCompany(req.params.id, req.user!.tenantId, {
        ...data,
        email: data.email || null,
        website: data.website || null,
      });
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      await storage.createActivityLog({
        tenantId: req.user!.tenantId,
        userId: req.user!.id,
        entityType: "company",
        entityId: company.id,
        action: "updated",
        dataJson: { name: company.name },
      });

      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update company error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id, req.user!.tenantId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      await storage.deleteCompany(req.params.id, req.user!.tenantId);

      await storage.createActivityLog({
        tenantId: req.user!.tenantId,
        userId: req.user!.id,
        entityType: "company",
        entityId: req.params.id,
        action: "deleted",
        dataJson: { name: company.name },
      });

      res.json({ message: "Company deleted" });
    } catch (error) {
      console.error("Delete company error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // CONTACTS ROUTES
  // =========================================================================
  
  app.get("/api/contacts", requireAuth, async (req, res) => {
    try {
      const contacts = await storage.getContacts(req.user!.tenantId);
      res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/contacts/:id", requireAuth, async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id, req.user!.tenantId);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Get contact error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/contacts", requireAuth, async (req, res) => {
    try {
      const data = contactSchema.parse(req.body);
      
      const contact = await storage.createContact({
        ...data,
        tenantId: req.user!.tenantId,
        email: data.email || null,
        companyId: data.companyId || null,
        isPrimary: data.isPrimary || false,
      });

      await storage.createActivityLog({
        tenantId: req.user!.tenantId,
        userId: req.user!.id,
        entityType: "contact",
        entityId: contact.id,
        action: "created",
        dataJson: { name: contact.name },
      });

      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create contact error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/contacts/:id", requireAuth, async (req, res) => {
    try {
      const data = contactSchema.partial().parse(req.body);
      
      const contact = await storage.updateContact(req.params.id, req.user!.tenantId, {
        ...data,
        email: data.email || null,
        companyId: data.companyId || null,
      });
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      await storage.createActivityLog({
        tenantId: req.user!.tenantId,
        userId: req.user!.id,
        entityType: "contact",
        entityId: contact.id,
        action: "updated",
        dataJson: { name: contact.name },
      });

      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update contact error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/contacts/:id", requireAuth, async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id, req.user!.tenantId);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      await storage.deleteContact(req.params.id, req.user!.tenantId);

      await storage.createActivityLog({
        tenantId: req.user!.tenantId,
        userId: req.user!.id,
        entityType: "contact",
        entityId: req.params.id,
        action: "deleted",
        dataJson: { name: contact.name },
      });

      res.json({ message: "Contact deleted" });
    } catch (error) {
      console.error("Delete contact error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
