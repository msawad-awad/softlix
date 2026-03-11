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

  // =========================================================================
  // PUBLIC API - No Auth Required (for public website)
  // =========================================================================

  // Get published services (public)
  app.get("/api/public/services", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "";
      if (!tenantId) return res.json([]);
      const allServices = await storage.getServices(tenantId);
      res.json(allServices.filter(s => s.status === "published"));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/public/services/:slug", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "";
      if (!tenantId) return res.status(404).json({ message: "Not found" });
      const service = await storage.getServiceBySlug(req.params.slug, tenantId);
      if (!service || service.status !== "published") return res.status(404).json({ message: "Not found" });
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get published projects (public)
  app.get("/api/public/projects", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "";
      if (!tenantId) return res.json([]);
      const allProjects = await storage.getProjects(tenantId);
      res.json(allProjects.filter(p => p.status === "published"));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/public/projects/:slug", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "";
      if (!tenantId) return res.status(404).json({ message: "Not found" });
      const project = await storage.getProjectBySlug(req.params.slug, tenantId);
      if (!project || project.status !== "published") return res.status(404).json({ message: "Not found" });
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get published blog posts (public)
  app.get("/api/public/blog", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "";
      if (!tenantId) return res.json([]);
      const allPosts = await storage.getBlogPosts(tenantId);
      res.json(allPosts.filter(p => p.status === "published"));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/public/blog/:slug", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "";
      if (!tenantId) return res.status(404).json({ message: "Not found" });
      const post = await storage.getBlogPostBySlug(req.params.slug, tenantId);
      if (!post || post.status !== "published") return res.status(404).json({ message: "Not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get site clients (public)
  app.get("/api/public/clients", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "";
      if (!tenantId) return res.json([]);
      const clients = await storage.getSiteClients(tenantId);
      res.json(clients.filter(c => c.status === "active"));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit form lead (public)
  app.post("/api/public/leads", async (req, res) => {
    try {
      let tenantId = req.query.tenantId as string || req.body.tenantId || "";
      // If no tenantId provided, use the first available tenant
      if (!tenantId) {
        try {
          const tenants = await storage.getAllTenants();
          if (tenants && tenants.length > 0) tenantId = tenants[0].id;
        } catch {}
      }
      if (!tenantId) return res.status(400).json({ message: "No tenant available" });
      const { name, email, phone, budget, message, formType, pageSource } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const lead = await storage.createFormLead({
        tenantId,
        name,
        email: email || null,
        phone: phone || null,
        budget: budget || null,
        message: message || null,
        formType: formType || "contact",
        pageSource: pageSource || null,
        ipAddress: req.ip || null,
        status: "new",
      });
      res.status(201).json(lead);
    } catch (error) {
      console.error("Lead submission error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // CMS - SERVICES (Protected)
  // =========================================================================

  app.get("/api/cms/services", requireAuth, async (req, res) => {
    try {
      const result = await storage.getServices(req.user!.tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/cms/services/:id", requireAuth, async (req, res) => {
    try {
      const service = await storage.getService(req.params.id, req.user!.tenantId);
      if (!service) return res.status(404).json({ message: "Not found" });
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cms/services", requireAuth, async (req, res) => {
    try {
      const { title, titleEn, slug, shortDescription, shortDescriptionEn, fullDescription, fullDescriptionEn, imageUrl, iconName, seoTitle, seoDescription, features, status, displayOrder } = req.body;
      if (!title || !slug) return res.status(400).json({ message: "Title and slug are required" });
      const service = await storage.createService({
        tenantId: req.user!.tenantId,
        title, titleEn: titleEn || null, slug,
        shortDescription: shortDescription || null, shortDescriptionEn: shortDescriptionEn || null,
        fullDescription: fullDescription || null, fullDescriptionEn: fullDescriptionEn || null,
        imageUrl: imageUrl || null, iconName: iconName || null,
        seoTitle: seoTitle || null, seoDescription: seoDescription || null,
        features: features || [], status: status || "published",
        displayOrder: displayOrder || 0,
      });
      res.status(201).json(service);
    } catch (error) {
      console.error("Create service error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/cms/services/:id", requireAuth, async (req, res) => {
    try {
      const service = await storage.updateService(req.params.id, req.user!.tenantId, req.body);
      if (!service) return res.status(404).json({ message: "Not found" });
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cms/services/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteService(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // CMS - PROJECTS (Protected)
  // =========================================================================

  app.get("/api/cms/projects", requireAuth, async (req, res) => {
    try {
      const result = await storage.getProjects(req.user!.tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/cms/projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id, req.user!.tenantId);
      if (!project) return res.status(404).json({ message: "Not found" });
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cms/projects", requireAuth, async (req, res) => {
    try {
      const { title, titleEn, slug, description, descriptionEn, thumbnailUrl, images, clientName, projectUrl, category, technologies, status, displayOrder } = req.body;
      if (!title || !slug) return res.status(400).json({ message: "Title and slug are required" });
      const project = await storage.createProject({
        tenantId: req.user!.tenantId,
        title, titleEn: titleEn || null, slug,
        description: description || null, descriptionEn: descriptionEn || null,
        thumbnailUrl: thumbnailUrl || null,
        images: images || [],
        clientName: clientName || null, projectUrl: projectUrl || null,
        category: category || null,
        technologies: technologies || [],
        status: status || "published", displayOrder: displayOrder || 0,
      });
      res.status(201).json(project);
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/cms/projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.user!.tenantId, req.body);
      if (!project) return res.status(404).json({ message: "Not found" });
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cms/projects/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // CMS - BLOG (Protected)
  // =========================================================================

  app.get("/api/cms/blog/categories", requireAuth, async (req, res) => {
    try {
      const result = await storage.getBlogCategories(req.user!.tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cms/blog/categories", requireAuth, async (req, res) => {
    try {
      const { name, nameEn, slug } = req.body;
      if (!name || !slug) return res.status(400).json({ message: "Name and slug are required" });
      const cat = await storage.createBlogCategory({ tenantId: req.user!.tenantId, name, nameEn: nameEn || null, slug });
      res.status(201).json(cat);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cms/blog/categories/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteBlogCategory(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/cms/blog", requireAuth, async (req, res) => {
    try {
      const result = await storage.getBlogPosts(req.user!.tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/cms/blog/:id", requireAuth, async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id, req.user!.tenantId);
      if (!post) return res.status(404).json({ message: "Not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cms/blog", requireAuth, async (req, res) => {
    try {
      const { title, titleEn, slug, excerpt, excerptEn, content, contentEn, featuredImageUrl, categoryId, seoTitle, seoDescription, status } = req.body;
      if (!title || !slug) return res.status(400).json({ message: "Title and slug are required" });
      const post = await storage.createBlogPost({
        tenantId: req.user!.tenantId,
        title, titleEn: titleEn || null, slug,
        excerpt: excerpt || null, excerptEn: excerptEn || null,
        content: content || null, contentEn: contentEn || null,
        featuredImageUrl: featuredImageUrl || null,
        categoryId: categoryId || null,
        seoTitle: seoTitle || null, seoDescription: seoDescription || null,
        status: status || "draft",
        publishedAt: status === "published" ? new Date() : null,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Create blog post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/cms/blog/:id", requireAuth, async (req, res) => {
    try {
      const update = { ...req.body };
      if (update.status === "published" && !update.publishedAt) {
        update.publishedAt = new Date();
      }
      const post = await storage.updateBlogPost(req.params.id, req.user!.tenantId, update);
      if (!post) return res.status(404).json({ message: "Not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cms/blog/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // CMS - SITE CLIENTS (Protected)
  // =========================================================================

  app.get("/api/cms/clients", requireAuth, async (req, res) => {
    try {
      const result = await storage.getSiteClients(req.user!.tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cms/clients", requireAuth, async (req, res) => {
    try {
      const { name, logoUrl, websiteUrl, displayOrder, status } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const client = await storage.createSiteClient({
        tenantId: req.user!.tenantId, name,
        logoUrl: logoUrl || null, websiteUrl: websiteUrl || null,
        displayOrder: displayOrder || 0, status: status || "active",
      });
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/cms/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.updateSiteClient(req.params.id, req.user!.tenantId, req.body);
      if (!client) return res.status(404).json({ message: "Not found" });
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cms/clients/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSiteClient(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // CMS - REDIRECTS (Protected)
  // =========================================================================

  app.get("/api/cms/redirects", requireAuth, async (req, res) => {
    try {
      const result = await storage.getRedirects(req.user!.tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cms/redirects", requireAuth, async (req, res) => {
    try {
      const { fromUrl, toUrl, statusCode, isActive } = req.body;
      if (!fromUrl || !toUrl) return res.status(400).json({ message: "from and to URLs are required" });
      const redirect = await storage.createRedirect({
        tenantId: req.user!.tenantId, fromUrl, toUrl,
        statusCode: statusCode || 301, isActive: isActive !== false,
      });
      res.status(201).json(redirect);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/cms/redirects/:id", requireAuth, async (req, res) => {
    try {
      const redirect = await storage.updateRedirect(req.params.id, req.user!.tenantId, req.body);
      if (!redirect) return res.status(404).json({ message: "Not found" });
      res.json(redirect);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cms/redirects/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteRedirect(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // MARKETING SETTINGS (Protected)
  // =========================================================================

  app.get("/api/public/marketing-settings", async (req, res) => {
    try {
      const tenantId = (req.query.tenantId as string) || "default";
      const settings = await storage.getMarketingSettings(tenantId);
      if (!settings) return res.json({});
      // Only return tracking IDs, not custom scripts for security
      res.json({
        gtmId: settings.gtmId,
        metaPixelId: settings.metaPixelId,
        googleAnalyticsId: settings.googleAnalyticsId,
        tiktokPixelId: settings.tiktokPixelId,
        snapchatPixelId: settings.snapchatPixelId,
        linkedinInsightId: settings.linkedinInsightId,
        customHeadScript: settings.customHeadScript,
        customBodyScript: settings.customBodyScript,
      });
    } catch (error) {
      res.json({});
    }
  });

  app.get("/api/marketing/settings", requireAuth, async (req, res) => {
    try {
      const ms = await storage.getMarketingSettings(req.user!.tenantId);
      res.json(ms || {});
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/marketing/settings", requireAuth, async (req, res) => {
    try {
      const ms = await storage.upsertMarketingSettings(req.user!.tenantId, req.body);
      res.json(ms);
    } catch (error) {
      console.error("Marketing settings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // FORM LEADS (Protected)
  // =========================================================================

  app.get("/api/cms/leads", requireAuth, async (req, res) => {
    try {
      const result = await storage.getFormLeads(req.user!.tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/cms/leads/:id", requireAuth, async (req, res) => {
    try {
      const lead = await storage.updateFormLead(req.params.id, req.user!.tenantId, req.body);
      if (!lead) return res.status(404).json({ message: "Not found" });
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cms/leads/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteFormLead(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sitemap.xml - dynamic generation
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "weekly" },
        { loc: "/about", priority: "0.8", changefreq: "monthly" },
        { loc: "/services", priority: "0.9", changefreq: "weekly" },
        { loc: "/projects", priority: "0.8", changefreq: "weekly" },
        { loc: "/blog", priority: "0.7", changefreq: "daily" },
        { loc: "/contact", priority: "0.8", changefreq: "monthly" },
      ];

      let urls = staticPages.map(p =>
        `  <url>\n    <loc>${baseUrl}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
      ).join("\n");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /login\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  // DB-driven redirect middleware (runs before SPA fallback)
  app.use(async (req, res, next) => {
    const path = req.path;
    if (path.startsWith("/api") || path.startsWith("/assets") || path.includes(".")) {
      return next();
    }
    try {
      const allRedirects = await storage.getRedirects("default");
      const match = allRedirects.find(r => r.isActive && (r.fromUrl === path || r.fromUrl === path + "/"));
      if (match) {
        await storage.incrementRedirectHit(match.id);
        return res.redirect(match.statusCode || 301, match.toUrl);
      }
    } catch {}
    next();
  });

  return httpServer;
}
