import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { AuthenticatedUser } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendEmail, sendSms } from "./email";
import { google } from "googleapis";

// Secret masking helpers - يخفي كلمات السر عند الإرجاع
const SECRET_KEYS = ["pass", "password", "secret", "authToken", "apiKey", "accessToken", "appSid"];
function maskSecrets(config: Record<string, any>): Record<string, any> {
  if (!config) return {};
  const masked: Record<string, any> = {};
  for (const [k, v] of Object.entries(config)) {
    masked[k] = SECRET_KEYS.some(s => k.toLowerCase().includes(s.toLowerCase())) && v ? "••••••••" : v;
  }
  return masked;
}
// Merge new config with existing, keeping existing secrets if masked placeholder sent
function mergeMasked(existing: Record<string, any>, incoming: Record<string, any>): Record<string, any> {
  const merged = { ...existing };
  for (const [k, v] of Object.entries(incoming)) {
    const isMasked = SECRET_KEYS.some(s => k.toLowerCase().includes(s.toLowerCase())) && v === "••••••••";
    if (!isMasked) merged[k] = v;
  }
  return merged;
}

// Multer setup – store files in public/uploads with unique names
const uploadsDir = path.resolve(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, safe);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// Document + image uploader (for CRM attachments)
const uploadDoc = multer({
  storage: multerStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".zip", ".rar"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("File type not allowed"));
  },
});

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
  // Health check for Railway / deployment platforms
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

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

  // Helper: resolve tenantId for public routes (falls back to first tenant)
  async function resolvePublicTenantId(req: any): Promise<string> {
    const tid = req.query.tenantId as string || "";
    if (tid) return tid;
    try {
      const tenants = await storage.getAllTenants();
      if (tenants && tenants.length > 0) return tenants[0].id;
    } catch {}
    return "";
  }

  // Get published services (public)
  app.get("/api/public/services", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
      if (!tenantId) return res.json([]);
      const allServices = await storage.getServices(tenantId);
      res.json(allServices.filter(s => s.status === "published"));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/public/services/:slug", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
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
      const tenantId = await resolvePublicTenantId(req);
      if (!tenantId) return res.json([]);
      const allProjects = await storage.getProjects(tenantId);
      res.json(allProjects.filter(p => p.status === "published"));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/public/projects/:slug", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
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
      const tenantId = await resolvePublicTenantId(req);
      if (!tenantId) return res.json([]);
      const allPosts = await storage.getBlogPosts(tenantId);
      res.json(allPosts.filter(p => p.status === "published"));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/public/blog/:slug", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
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
      const tenantId = await resolvePublicTenantId(req);
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
  // FILE UPLOAD (Protected – returns public URL)
  // =========================================================================

  app.post("/api/upload", requireAuth, upload.single("file"), (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, size: req.file.size });
  });

  app.delete("/api/upload/:filename", requireAuth, (req: Request, res: Response) => {
    const filename = path.basename(req.params.filename); // prevent traversal
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "Deleted" });
    } else {
      res.status(404).json({ message: "File not found" });
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
      const tenantId = await resolvePublicTenantId(req);
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
  // NEWSLETTER SUBSCRIBERS
  // =========================================================================

  // Public: subscribe
  app.post("/api/public/newsletter/subscribe", async (req, res) => {
    try {
      const hostname = req.hostname;
      const tenant = await storage.getTenantBySlug("softlix");
      if (!tenant) return res.status(404).json({ message: "Tenant not found" });
      const { email, name, source } = req.body;
      if (!email) return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
      const existing = await storage.getNewsletterSubscriberByEmail(email, tenant.id);
      if (existing) {
        if (existing.status === "unsubscribed") {
          await storage.updateNewsletterSubscriber(existing.id, tenant.id, { status: "active" });
          return res.json({ success: true, message: "تم إعادة اشتراكك بنجاح" });
        }
        return res.json({ success: true, message: "أنت مشترك بالفعل" });
      }
      await storage.addNewsletterSubscriber({ tenantId: tenant.id, email, name: name || null, source: source || "website", status: "active" });
      res.json({ success: true, message: "تم الاشتراك بنجاح! شكراً لك" });
    } catch (error) {
      console.error("Newsletter subscribe error:", error);
      res.status(500).json({ message: "حدث خطأ، يرجى المحاولة لاحقاً" });
    }
  });

  // Admin: list subscribers
  app.get("/api/marketing/newsletter", requireAuth, async (req, res) => {
    try {
      const subs = await storage.getNewsletterSubscribers(req.user!.tenantId);
      res.json(subs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: delete subscriber
  app.delete("/api/marketing/newsletter/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteNewsletterSubscriber(req.params.id, req.user!.tenantId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: update subscriber status
  app.patch("/api/marketing/newsletter/:id", requireAuth, async (req, res) => {
    try {
      const sub = await storage.updateNewsletterSubscriber(req.params.id, req.user!.tenantId, req.body);
      res.json(sub);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =========================================================================
  // PRICING PLANS
  // =========================================================================

  // Public: get active plans
  app.get("/api/public/pricing", async (req, res) => {
    try {
      const hostname = req.hostname;
      const tenant = await storage.getTenantBySlug("softlix");
      if (!tenant) return res.status(404).json({ message: "Tenant not found" });
      const plans = await storage.getPricingPlans(tenant.id);
      res.json(plans.filter(p => p.isActive));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: list plans
  app.get("/api/marketing/pricing", requireAuth, async (req, res) => {
    try {
      const plans = await storage.getPricingPlans(req.user!.tenantId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: create plan
  app.post("/api/marketing/pricing", requireAuth, async (req, res) => {
    try {
      const plan = await storage.createPricingPlan({ ...req.body, tenantId: req.user!.tenantId });
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: update plan
  app.put("/api/marketing/pricing/:id", requireAuth, async (req, res) => {
    try {
      const plan = await storage.updatePricingPlan(req.params.id, req.user!.tenantId, req.body);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: delete plan
  app.delete("/api/marketing/pricing/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePricingPlan(req.params.id, req.user!.tenantId);
      res.json({ success: true });
    } catch (error) {
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

  // =========================================================================
  // SITE SETTINGS - Branding (Public + Protected)
  // =========================================================================

  app.get("/api/public/site-settings", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
      const s = await storage.getSiteSettings(tenantId);
      res.json(s || {});
    } catch { res.json({}); }
  });

  app.get("/api/cms/site-settings", requireAuth, async (req, res) => {
    try {
      const s = await storage.getSiteSettings(req.user!.tenantId);
      res.json(s || {});
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.put("/api/cms/site-settings", requireAuth, async (req, res) => {
    try {
      const s = await storage.upsertSiteSettings(req.user!.tenantId, req.body);
      res.json(s);
    } catch (e) { console.error(e); res.status(500).json({ message: "Internal server error" }); }
  });

  // =========================================================================
  // PAGE SECTIONS (Public + Protected)
  // =========================================================================

  app.get("/api/public/page-sections/:page", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
      const sections = await storage.getPageSections(tenantId, req.params.page);
      const map: Record<string, any> = {};
      sections.forEach(s => { map[s.sectionKey] = s; });
      res.json(map);
    } catch { res.json({}); }
  });

  app.get("/api/cms/page-sections/:page", requireAuth, async (req, res) => {
    try {
      const sections = await storage.getPageSections(req.user!.tenantId, req.params.page);
      const map: Record<string, any> = {};
      sections.forEach(s => { map[s.sectionKey] = s; });
      res.json(map);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.put("/api/cms/page-sections/:page/:key", requireAuth, async (req, res) => {
    try {
      const { contentAr, contentEn, isVisible } = req.body;
      const s = await storage.upsertPageSection(req.user!.tenantId, req.params.page, req.params.key, { contentAr, contentEn, isVisible });
      res.json(s);
    } catch (e) { console.error(e); res.status(500).json({ message: "Internal server error" }); }
  });

  // =========================================================================
  // TESTIMONIALS (Public + CRUD)
  // =========================================================================

  app.get("/api/public/testimonials", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
      const items = await storage.getTestimonials(tenantId);
      res.json(items.filter(t => t.isActive));
    } catch { res.json([]); }
  });

  app.get("/api/cms/testimonials", requireAuth, async (req, res) => {
    try { res.json(await storage.getTestimonials(req.user!.tenantId)); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.post("/api/cms/testimonials", requireAuth, async (req, res) => {
    try {
      const t = await storage.createTestimonial({ ...req.body, tenantId: req.user!.tenantId });
      res.status(201).json(t);
    } catch (e) { console.error(e); res.status(500).json({ message: "Internal server error" }); }
  });

  app.patch("/api/cms/testimonials/:id", requireAuth, async (req, res) => {
    try {
      const t = await storage.updateTestimonial(req.params.id, req.user!.tenantId, req.body);
      if (!t) return res.status(404).json({ message: "Not found" });
      res.json(t);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.delete("/api/cms/testimonials/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTestimonial(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // =========================================================================
  // PROCESS STEPS (Public + CRUD)
  // =========================================================================

  app.get("/api/public/process-steps", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
      res.json(await storage.getProcessSteps(tenantId));
    } catch { res.json([]); }
  });

  app.get("/api/cms/process-steps", requireAuth, async (req, res) => {
    try { res.json(await storage.getProcessSteps(req.user!.tenantId)); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.post("/api/cms/process-steps", requireAuth, async (req, res) => {
    try {
      const s = await storage.createProcessStep({ ...req.body, tenantId: req.user!.tenantId });
      res.status(201).json(s);
    } catch (e) { console.error(e); res.status(500).json({ message: "Internal server error" }); }
  });

  app.patch("/api/cms/process-steps/:id", requireAuth, async (req, res) => {
    try {
      const s = await storage.updateProcessStep(req.params.id, req.user!.tenantId, req.body);
      if (!s) return res.status(404).json({ message: "Not found" });
      res.json(s);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.delete("/api/cms/process-steps/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteProcessStep(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // =========================================================================
  // WHY US ITEMS (Public + CRUD)
  // =========================================================================

  app.get("/api/public/why-us", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
      res.json(await storage.getWhyUsItems(tenantId));
    } catch { res.json([]); }
  });

  app.get("/api/cms/why-us", requireAuth, async (req, res) => {
    try { res.json(await storage.getWhyUsItems(req.user!.tenantId)); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.post("/api/cms/why-us", requireAuth, async (req, res) => {
    try {
      const item = await storage.createWhyUsItem({ ...req.body, tenantId: req.user!.tenantId });
      res.status(201).json(item);
    } catch (e) { console.error(e); res.status(500).json({ message: "Internal server error" }); }
  });

  app.patch("/api/cms/why-us/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.updateWhyUsItem(req.params.id, req.user!.tenantId, req.body);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.delete("/api/cms/why-us/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteWhyUsItem(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // =========================================================================
  // ABOUT VALUES (Public + CRUD)
  // =========================================================================

  app.get("/api/public/about-values", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
      res.json(await storage.getAboutValues(tenantId));
    } catch { res.json([]); }
  });

  app.get("/api/cms/about-values", requireAuth, async (req, res) => {
    try { res.json(await storage.getAboutValues(req.user!.tenantId)); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.post("/api/cms/about-values", requireAuth, async (req, res) => {
    try {
      const v = await storage.createAboutValue({ ...req.body, tenantId: req.user!.tenantId });
      res.status(201).json(v);
    } catch (e) { console.error(e); res.status(500).json({ message: "Internal server error" }); }
  });

  app.patch("/api/cms/about-values/:id", requireAuth, async (req, res) => {
    try {
      const v = await storage.updateAboutValue(req.params.id, req.user!.tenantId, req.body);
      if (!v) return res.status(404).json({ message: "Not found" });
      res.json(v);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.delete("/api/cms/about-values/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAboutValue(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // =========================================================================
  // ABOUT TIMELINE (Public + CRUD)
  // =========================================================================

  app.get("/api/public/about-timeline", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
      res.json(await storage.getAboutTimeline(tenantId));
    } catch { res.json([]); }
  });

  app.get("/api/cms/about-timeline", requireAuth, async (req, res) => {
    try { res.json(await storage.getAboutTimeline(req.user!.tenantId)); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.post("/api/cms/about-timeline", requireAuth, async (req, res) => {
    try {
      const item = await storage.createAboutTimelineItem({ ...req.body, tenantId: req.user!.tenantId });
      res.status(201).json(item);
    } catch (e) { console.error(e); res.status(500).json({ message: "Internal server error" }); }
  });

  app.patch("/api/cms/about-timeline/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.updateAboutTimelineItem(req.params.id, req.user!.tenantId, req.body);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.delete("/api/cms/about-timeline/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAboutTimelineItem(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // =========================================================================
  // SITE STATS (Public + CRUD)
  // =========================================================================

  app.get("/api/public/site-stats", async (req, res) => {
    try {
      const tenantId = await resolvePublicTenantId(req);
      res.json(await storage.getSiteStats(tenantId));
    } catch { res.json([]); }
  });

  app.get("/api/cms/site-stats", requireAuth, async (req, res) => {
    try { res.json(await storage.getSiteStats(req.user!.tenantId)); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.post("/api/cms/site-stats", requireAuth, async (req, res) => {
    try {
      const s = await storage.createSiteStat({ ...req.body, tenantId: req.user!.tenantId });
      res.status(201).json(s);
    } catch (e) { console.error(e); res.status(500).json({ message: "Internal server error" }); }
  });

  app.patch("/api/cms/site-stats/:id", requireAuth, async (req, res) => {
    try {
      const s = await storage.updateSiteStat(req.params.id, req.user!.tenantId, req.body);
      if (!s) return res.status(404).json({ message: "Not found" });
      res.json(s);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.delete("/api/cms/site-stats/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSiteStat(req.params.id, req.user!.tenantId);
      res.json({ message: "Deleted" });
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Sitemap.xml - dynamic generation
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const tenantId = await resolvePublicTenantId(req);

      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "weekly" },
        { loc: "/about/", priority: "0.8", changefreq: "monthly" },
        { loc: "/services", priority: "0.9", changefreq: "weekly" },
        { loc: "/porjects/", priority: "0.8", changefreq: "weekly" },
        { loc: "/blog/", priority: "0.7", changefreq: "daily" },
        { loc: "/contact-us/", priority: "0.8", changefreq: "monthly" },
        // Old service pages preserved for SEO
        { loc: "/mobile-app-development/", priority: "0.8", changefreq: "monthly" },
        { loc: "/content-management-and-designs/", priority: "0.7", changefreq: "monthly" },
        { loc: "/software-services/", priority: "0.7", changefreq: "monthly" },
        { loc: "/technical-consulting/", priority: "0.7", changefreq: "monthly" },
        { loc: "/digital-marketing/", priority: "0.7", changefreq: "monthly" },
        // Category pages
        { loc: "/category/برمجة/", priority: "0.5", changefreq: "weekly" },
        { loc: "/category/تصميم/", priority: "0.5", changefreq: "weekly" },
        { loc: "/category/تواصل-إجتماعي/", priority: "0.5", changefreq: "weekly" },
      ];

      let urls = staticPages.map(p =>
        `  <url>\n    <loc>${baseUrl}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
      ).join("\n");

      // Add blog posts at root level (/{slug}/)
      if (tenantId) {
        const posts = await storage.getBlogPosts(tenantId);
        const publishedPosts = posts.filter(p => p.status === "published");
        const postUrls = publishedPosts.map(p => {
          const lastmod = p.publishedAt ? new Date(p.publishedAt).toISOString().split("T")[0] : "";
          return `  <url>\n    <loc>${baseUrl}/${encodeURIComponent(p.slug)}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`;
        }).join("\n");
        if (postUrls) urls += "\n" + postUrls;

        // Add project pages at /porjects/{slug}/
        const projects = await storage.getProjects(tenantId);
        const publishedProjects = projects.filter((p: any) => p.status === "published");
        const projectUrls = publishedProjects.map((p: any) =>
          `  <url>\n    <loc>${baseUrl}/porjects/${encodeURIComponent(p.slug)}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
        ).join("\n");
        if (projectUrls) urls += "\n" + projectUrls;

        // Add service pages at /services/{slug}/
        const services = await storage.getServices(tenantId);
        const publishedServices = services.filter((s: any) => s.status === "published");
        const serviceUrls = publishedServices.map((s: any) =>
          `  <url>\n    <loc>${baseUrl}/services/${encodeURIComponent(s.slug)}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
        ).join("\n");
        if (serviceUrls) urls += "\n" + serviceUrls;
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      res.status(500).send("Error generating sitemap");
    }
  });

  // ============================================================================
  // CRM API ROUTES
  // ============================================================================

  // Public lead capture (from website forms - no auth required)
  app.post("/api/public/lead-capture", async (req, res) => {
    try {
      const { name, email, phone, message, service, budget, pageSource, utmSource, utmMedium, utmCampaign } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });

      // Resolve tenant: try slug first, fallback to first tenant
      let tenant = await storage.getTenantBySlug("softlix");
      if (!tenant) {
        const allTenants = await storage.getAllTenants();
        tenant = allTenants[0];
      }
      if (!tenant) return res.status(404).json({ error: "Tenant not found" });

      // Create form lead first (primary operation)
      const formLead = await storage.createFormLead({
        tenantId: tenant.id, formType: pageSource || 'contact',
        name, email: email || null, phone: phone || null,
        message: message || null, pageSource: pageSource || null,
        ipAddress: req.ip || null, status: 'new',
      });

      // Create CRM lead + activity (secondary — non-fatal)
      let lead = null;
      try {
        const sources = await storage.getCrmLeadSources(tenant.id);
        const websiteSource = sources.find(s => s.name.includes('موقع') || s.name.toLowerCase().includes('website'));
        lead = await storage.createCrmLead({
          tenantId: tenant.id, fullName: name,
          email: email || null, mobile: phone || null,
          message: message || null,
          serviceInterested: service || null, estimatedBudget: budget || null,
          sourceId: websiteSource?.id || null,
          sourceName: websiteSource?.name || 'الموقع الإلكتروني',
          utmSource: utmSource || null, utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null, pageSource: pageSource || null,
          ipAddress: req.ip || null,
          formLeadId: formLead.id, status: 'new', priority: 'medium',
        });
        await storage.createCrmActivity({
          tenantId: tenant.id, entityType: 'lead', entityId: lead.id,
          type: 'note', subject: 'تم استقبال الطلب من الموقع',
          details: message || name,
        });
      } catch (crmErr: any) {
        console.error("[lead-capture] CRM ops failed (non-fatal):", crmErr.message);
      }

      res.json({ success: true, lead: lead || formLead });
    } catch (e: any) {
      console.error("[lead-capture] Error:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // Public booking - create consultation request (no auth)
  app.post("/api/public/bookings", async (req, res) => {
    try {
      const { name, email, phone, serviceType, preferredDate, preferredTime, notes } = req.body;
      if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });

      // Resolve tenant: try slug first, fallback to first tenant
      let tenant = await storage.getTenantBySlug("softlix");
      if (!tenant) {
        const allTenants = await storage.getAllTenants();
        tenant = allTenants[0];
      }
      if (!tenant) return res.status(404).json({ error: "Tenant not found" });

      // Create the booking (primary operation)
      const booking = await storage.createBooking({
        tenantId: tenant.id, name,
        email: email || null, phone,
        serviceType: serviceType || null,
        preferredDate: preferredDate || null,
        preferredTime: preferredTime || null,
        notes: notes || null,
        source: "website",
      });

      // Create CRM lead + activity (secondary — non-fatal)
      try {
        const sources = await storage.getCrmLeadSources(tenant.id);
        const websiteSource = sources.find(s => s.name.includes('موقع') || s.name.toLowerCase().includes('website'));
        const lead = await storage.createCrmLead({
          tenantId: tenant.id, fullName: name,
          email: email || null, mobile: phone,
          message: `طلب استشارة - ${serviceType || "غير محدد"}\n${preferredDate ? `التاريخ المفضل: ${preferredDate}` : ""}\n${preferredTime ? `الوقت المفضل: ${preferredTime}` : ""}\n${notes || ""}`,
          serviceInterested: serviceType || null,
          sourceId: websiteSource?.id || null,
          sourceName: websiteSource?.name || 'الموقع الإلكتروني',
          pageSource: "booking-widget", status: "new", priority: "high",
        });
        await storage.createCrmActivity({
          tenantId: tenant.id, entityType: "lead", entityId: lead.id,
          type: "note", subject: "طلب استشارة جديد من الموقع",
          details: `${name} - ${phone}`,
        });
      } catch (crmErr: any) {
        console.error("[booking] CRM ops failed (non-fatal):", crmErr.message);
      }

      res.json({ success: true, booking });
    } catch (e: any) {
      console.error("[booking] Error:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // Admin: list bookings
  app.get("/api/cms/bookings", requireAuth, async (req, res) => {
    try {
      const rows = await storage.getBookings(req.user!.tenantId);
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Admin: update booking status
  app.patch("/api/cms/bookings/:id", requireAuth, async (req, res) => {
    try {
      const row = await storage.updateBooking(req.params.id, req.user!.tenantId, req.body);
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Admin: delete booking
  app.delete("/api/cms/bookings/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteBooking(req.params.id, req.user!.tenantId);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Dashboard Stats
  app.get("/api/crm/dashboard", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getCrmDashboardStats(req.user!.tenant.id);
      res.json(stats);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Lead Sources
  app.get("/api/crm/lead-sources", requireAuth, async (req, res) => {
    try { res.json(await storage.getCrmLeadSources(req.user!.tenant.id)); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/crm/lead-sources", requireAuth, async (req, res) => {
    try { res.json(await storage.createCrmLeadSource({ ...req.body, tenantId: req.user!.tenant.id })); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.patch("/api/crm/lead-sources/:id", requireAuth, async (req, res) => {
    try { res.json(await storage.updateCrmLeadSource(req.params.id, req.user!.tenant.id, req.body)); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/crm/lead-sources/:id", requireAuth, async (req, res) => {
    try { await storage.deleteCrmLeadSource(req.params.id, req.user!.tenant.id); res.json({ ok: true }); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Leads
  app.get("/api/crm/leads", requireAuth, async (req, res) => {
    try {
      const { status, sourceId, assignedToId, search } = req.query as Record<string, string>;
      const leads = await storage.getCrmLeads(req.user!.tenant.id, { status, sourceId, assignedToId, search });
      res.json(leads);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/crm/leads/stats", requireAuth, async (req, res) => {
    try { res.json(await storage.getCrmLeadsStats(req.user!.tenant.id)); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/crm/leads/:id", requireAuth, async (req, res) => {
    try {
      const lead = await storage.getCrmLead(req.params.id, req.user!.tenant.id);
      if (!lead) return res.status(404).json({ error: "Not found" });
      res.json(lead);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/crm/leads", requireAuth, async (req, res) => {
    try {
      const lead = await storage.createCrmLead({ ...req.body, tenantId: req.user!.tenant.id, createdById: req.user!.id });
      await storage.createCrmActivity({ tenantId: req.user!.tenant.id, entityType: 'lead', entityId: lead.id, type: 'note', subject: 'تم إنشاء العميل المحتمل', createdById: req.user!.id });
      res.json(lead);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.patch("/api/crm/leads/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getCrmLead(req.params.id, req.user!.tenant.id);
      const lead = await storage.updateCrmLead(req.params.id, req.user!.tenant.id, req.body);
      if (existing && req.body.status && existing.status !== req.body.status) {
        await storage.createCrmActivity({ tenantId: req.user!.tenant.id, entityType: 'lead', entityId: req.params.id, type: 'status_change', subject: `تغيير الحالة: ${existing.status} → ${req.body.status}`, createdById: req.user!.id });
      }
      res.json(lead);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/crm/leads/:id", requireAuth, async (req, res) => {
    try { await storage.deleteCrmLead(req.params.id, req.user!.tenant.id); res.json({ ok: true }); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  // Convert lead to deal/contact/company
  app.post("/api/crm/leads/:id/convert", requireAuth, async (req, res) => {
    try {
      const lead = await storage.getCrmLead(req.params.id, req.user!.tenant.id);
      if (!lead) return res.status(404).json({ error: "Lead not found" });
      const { pipelineId, stageId } = req.body;
      // Create company if companyName exists
      let companyId: string | undefined;
      if (lead.companyName) {
        const company = await storage.createCompany({ tenantId: req.user!.tenant.id, name: lead.companyName, email: lead.email, phone: lead.mobile, source: lead.sourceName || undefined, status: 'prospect', ownerId: req.user!.id });
        companyId = company.id;
      }
      // Create contact
      const contact = await storage.createContact({ tenantId: req.user!.tenant.id, name: lead.fullName, email: lead.email, phone: lead.mobile, position: lead.jobTitle, companyId, notes: lead.notes });
      // Create deal
      let deal;
      if (pipelineId && stageId) {
        deal = await storage.createCrmDeal({ tenantId: req.user!.tenant.id, title: `صفقة - ${lead.fullName}`, companyId, contactId: contact.id, leadId: lead.id, pipelineId, stageId, serviceType: lead.serviceInterested, assignedToId: lead.assignedToId, sourceId: lead.sourceId, createdById: req.user!.id, status: 'open' });
      }
      // Update lead as converted
      await storage.updateCrmLead(req.params.id, req.user!.tenant.id, { status: 'converted', convertedAt: new Date(), convertedToContactId: contact.id, convertedToCompanyId: companyId, convertedToDealId: deal?.id });
      await storage.createCrmActivity({ tenantId: req.user!.tenant.id, entityType: 'lead', entityId: lead.id, type: 'status_change', subject: 'تم تحويل العميل المحتمل إلى صفقة', createdById: req.user!.id });
      res.json({ contact, company: companyId, deal });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Deal Pipelines
  app.get("/api/crm/pipelines", requireAuth, async (req, res) => {
    try { res.json(await storage.getCrmDealPipelines(req.user!.tenant.id)); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/crm/pipelines", requireAuth, async (req, res) => {
    try { res.json(await storage.createCrmDealPipeline({ ...req.body, tenantId: req.user!.tenant.id })); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.patch("/api/crm/pipelines/:id", requireAuth, async (req, res) => {
    try { res.json(await storage.updateCrmDealPipeline(req.params.id, req.user!.tenant.id, req.body)); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/crm/pipelines/:id", requireAuth, async (req, res) => {
    try { await storage.deleteCrmDealPipeline(req.params.id, req.user!.tenant.id); res.json({ ok: true }); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Deal Stages
  app.get("/api/crm/stages", requireAuth, async (req, res) => {
    try {
      const { pipelineId } = req.query as { pipelineId?: string };
      res.json(await storage.getCrmDealStages(req.user!.tenant.id, pipelineId));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/crm/stages", requireAuth, async (req, res) => {
    try { res.json(await storage.createCrmDealStage({ ...req.body, tenantId: req.user!.tenant.id })); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.patch("/api/crm/stages/:id", requireAuth, async (req, res) => {
    try { res.json(await storage.updateCrmDealStage(req.params.id, req.user!.tenant.id, req.body)); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/crm/stages/:id", requireAuth, async (req, res) => {
    try { await storage.deleteCrmDealStage(req.params.id, req.user!.tenant.id); res.json({ ok: true }); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Deals
  app.get("/api/crm/deals", requireAuth, async (req, res) => {
    try {
      const { status, pipelineId, stageId, assignedToId } = req.query as Record<string, string>;
      res.json(await storage.getCrmDeals(req.user!.tenant.id, { status, pipelineId, stageId, assignedToId }));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/crm/deals/:id", requireAuth, async (req, res) => {
    try {
      const deal = await storage.getCrmDeal(req.params.id, req.user!.tenant.id);
      if (!deal) return res.status(404).json({ error: "Not found" });
      res.json(deal);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/crm/deals", requireAuth, async (req, res) => {
    try {
      const deal = await storage.createCrmDeal({ ...req.body, tenantId: req.user!.tenant.id, createdById: req.user!.id });
      await storage.createCrmActivity({ tenantId: req.user!.tenant.id, entityType: 'deal', entityId: deal.id, type: 'note', subject: 'تم إنشاء الصفقة', createdById: req.user!.id });
      res.json(deal);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.patch("/api/crm/deals/:id", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getCrmDeal(req.params.id, req.user!.tenant.id);
      if (req.body.status === 'won') req.body.wonAt = new Date();
      if (req.body.status === 'lost') req.body.lostAt = new Date();
      const deal = await storage.updateCrmDeal(req.params.id, req.user!.tenant.id, req.body);
      if (existing && req.body.stageId && existing.stageId !== req.body.stageId) {
        await storage.createCrmActivity({ tenantId: req.user!.tenant.id, entityType: 'deal', entityId: req.params.id, type: 'stage_change', subject: 'تم تغيير مرحلة الصفقة', createdById: req.user!.id });
      }
      res.json(deal);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/crm/deals/:id", requireAuth, async (req, res) => {
    try { await storage.deleteCrmDeal(req.params.id, req.user!.tenant.id); res.json({ ok: true }); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Activities
  app.get("/api/crm/activities", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId } = req.query as Record<string, string>;
      res.json(await storage.getCrmActivities(req.user!.tenant.id, entityType, entityId));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/crm/activities", requireAuth, async (req, res) => {
    try { res.json(await storage.createCrmActivity({ ...req.body, tenantId: req.user!.tenant.id, createdById: req.user!.id })); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/crm/activities/:id", requireAuth, async (req, res) => {
    try { await storage.deleteCrmActivity(req.params.id, req.user!.tenant.id); res.json({ ok: true }); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Quick Communication - Send Email from lead/deal page
  app.post("/api/crm/send-email", requireAuth, async (req: Request, res: Response) => {
    try {
      const { to, subject, body } = req.body;
      if (!to) return res.status(400).json({ message: "بريد المستلم مطلوب" });
      await sendEmail(req.user!.tenantId, { to, subject: subject || "رسالة من Softlix CRM", html: body || subject || "" });
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // CRM Quick Communication - Send SMS from lead/deal page
  app.post("/api/crm/send-sms", requireAuth, async (req: Request, res: Response) => {
    try {
      const { to, message } = req.body;
      if (!to || !message) return res.status(400).json({ message: "رقم الجوال والرسالة مطلوبان" });
      await sendSms(req.user!.tenantId, { to, message });
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // CRM Tasks
  app.get("/api/crm/tasks", requireAuth, async (req, res) => {
    try {
      const { status, assignedToId, entityType, entityId } = req.query as Record<string, string>;
      res.json(await storage.getCrmTasks(req.user!.tenant.id, { status, assignedToId, entityType, entityId }));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/crm/tasks/:id", requireAuth, async (req, res) => {
    try {
      const task = await storage.getCrmTask(req.params.id, req.user!.tenant.id);
      if (!task) return res.status(404).json({ error: "Not found" });
      res.json(task);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/crm/tasks", requireAuth, async (req, res) => {
    try { res.json(await storage.createCrmTask({ ...req.body, tenantId: req.user!.tenant.id, createdById: req.user!.id })); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.patch("/api/crm/tasks/:id", requireAuth, async (req, res) => {
    try { res.json(await storage.updateCrmTask(req.params.id, req.user!.tenant.id, req.body)); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/crm/tasks/:id", requireAuth, async (req, res) => {
    try { await storage.deleteCrmTask(req.params.id, req.user!.tenant.id); res.json({ ok: true }); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Proposals
  app.get("/api/crm/proposals", requireAuth, async (req, res) => {
    try {
      const { status, dealId } = req.query as Record<string, string>;
      res.json(await storage.getCrmProposals(req.user!.tenant.id, { status, dealId }));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/crm/proposals/:id", requireAuth, async (req, res) => {
    try {
      const proposal = await storage.getCrmProposal(req.params.id, req.user!.tenant.id);
      if (!proposal) return res.status(404).json({ error: "Not found" });
      const items = await storage.getCrmProposalItems(proposal.id);
      res.json({ ...proposal, items });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/crm/proposals", requireAuth, async (req, res) => {
    try {
      const { items, ...proposalData } = req.body;
      const proposal = await storage.createCrmProposal({ ...proposalData, tenantId: req.user!.tenant.id, preparedById: req.user!.id });
      if (items?.length) await storage.replaceProposalItems(proposal.id, req.user!.tenant.id, items);
      await storage.createCrmActivity({ tenantId: req.user!.tenant.id, entityType: 'deal', entityId: proposal.dealId || proposal.leadId || proposal.id, type: 'proposal_action', subject: `تم إنشاء عرض سعر: ${proposal.proposalNumber}`, createdById: req.user!.id });
      res.json(proposal);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.patch("/api/crm/proposals/:id", requireAuth, async (req, res) => {
    try {
      const { items, ...proposalData } = req.body;
      const proposal = await storage.updateCrmProposal(req.params.id, req.user!.tenant.id, proposalData);
      if (items !== undefined) await storage.replaceProposalItems(req.params.id, req.user!.tenant.id, items);
      res.json(proposal);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/crm/proposals/:id", requireAuth, async (req, res) => {
    try { await storage.deleteCrmProposal(req.params.id, req.user!.tenant.id); res.json({ ok: true }); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // CRM Setup - Seed default data
  app.post("/api/crm/setup", requireAuth, async (req, res) => {
    try {
      const tenantId = req.user!.tenant.id;
      const existingSources = await storage.getCrmLeadSources(tenantId);
      if (!existingSources.length) {
        const defaultSources = [
          { name: 'الموقع الإلكتروني', nameEn: 'Website', color: '#6366f1', displayOrder: 0 },
          { name: 'إعلانات جوجل', nameEn: 'Google Ads', color: '#ef4444', displayOrder: 1 },
          { name: 'إعلانات ميتا', nameEn: 'Meta Ads', color: '#3b82f6', displayOrder: 2 },
          { name: 'واتساب', nameEn: 'WhatsApp', color: '#22c55e', displayOrder: 3 },
          { name: 'مكالمة هاتفية', nameEn: 'Phone Call', color: '#f59e0b', displayOrder: 4 },
          { name: 'إحالة', nameEn: 'Referral', color: '#8b5cf6', displayOrder: 5 },
          { name: 'مباشر', nameEn: 'Direct', color: '#64748b', displayOrder: 6 },
          { name: 'معرض / حدث', nameEn: 'Exhibition / Event', color: '#ec4899', displayOrder: 7 },
        ];
        for (const src of defaultSources) await storage.createCrmLeadSource({ ...src, tenantId, isDefault: true });
      }
      const existingPipelines = await storage.getCrmDealPipelines(tenantId);
      if (!existingPipelines.length) {
        const pipeline = await storage.createCrmDealPipeline({ tenantId, name: 'خط المبيعات الرئيسي', nameEn: 'Main Sales Pipeline', isDefault: true, displayOrder: 0 });
        const stages = [
          { name: 'فرصة جديدة', nameEn: 'New Opportunity', color: '#6366f1', probability: 10, displayOrder: 0 },
          { name: 'اكتشاف', nameEn: 'Discovery', color: '#8b5cf6', probability: 20, displayOrder: 1 },
          { name: 'اجتماع مجدول', nameEn: 'Meeting Scheduled', color: '#3b82f6', probability: 30, displayOrder: 2 },
          { name: 'جمع المتطلبات', nameEn: 'Requirement Gathering', color: '#06b6d4', probability: 40, displayOrder: 3 },
          { name: 'تحضير العرض', nameEn: 'Proposal Drafting', color: '#f59e0b', probability: 50, displayOrder: 4 },
          { name: 'تم إرسال العرض', nameEn: 'Proposal Sent', color: '#f97316', probability: 60, displayOrder: 5 },
          { name: 'تفاوض', nameEn: 'Negotiation', color: '#ef4444', probability: 75, displayOrder: 6 },
          { name: 'موافقة شفهية', nameEn: 'Verbal Approval', color: '#10b981', probability: 85, displayOrder: 7 },
          { name: 'رابح', nameEn: 'Won', color: '#22c55e', probability: 100, isWon: true, displayOrder: 8 },
          { name: 'خاسر', nameEn: 'Lost', color: '#94a3b8', probability: 0, isLost: true, displayOrder: 9 },
        ];
        for (const s of stages) await storage.createCrmDealStage({ ...s, tenantId, pipelineId: pipeline.id });
      }
      res.json({ ok: true, message: 'CRM setup complete' });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /login\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  // ============================================================================
  // INTEGRATION SETTINGS ROUTES
  // ============================================================================
  app.get("/api/integrations", requireAuth, async (req: Request, res: Response) => {
    const integrations = await storage.getAllIntegrations(req.user!.tenantId);
    // Mask passwords/secrets before returning
    const masked = integrations.map(i => ({
      ...i,
      config: maskSecrets(i.config as any),
    }));
    res.json(masked);
  });

  app.get("/api/integrations/:provider", requireAuth, async (req: Request, res: Response) => {
    const integration = await storage.getIntegration(req.user!.tenantId, req.params.provider);
    if (!integration) return res.json({ provider: req.params.provider, isEnabled: false, config: {} });
    res.json({ ...integration, config: maskSecrets(integration.config as any) });
  });

  app.put("/api/integrations/:provider", requireAuth, async (req: Request, res: Response) => {
    const { isEnabled, config } = req.body;
    const existing = await storage.getIntegration(req.user!.tenantId, req.params.provider);
    const mergedConfig = mergeMasked(existing?.config as any || {}, config || {});
    const result = await storage.upsertIntegration(req.user!.tenantId, req.params.provider, { isEnabled: !!isEnabled, config: mergedConfig });
    res.json({ ...result, config: maskSecrets(result.config as any) });
  });

  // Test SMTP connection
  app.post("/api/integrations/smtp/test", requireAuth, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await sendEmail(req.user!.tenantId, {
        to: email || req.user!.email,
        subject: "اختبار الاتصال - Softlix CRM",
        html: "<h2>✅ تم الاتصال بنجاح!</h2><p>إعدادات البريد الإلكتروني تعمل بشكل صحيح.</p>",
      });
      res.json({ ok: true, message: "تم إرسال بريد الاختبار بنجاح" });
    } catch (e: any) {
      res.status(400).json({ ok: false, message: e.message });
    }
  });

  // ============================================================================
  // EMAIL & SMS SENDING ROUTES
  // ============================================================================
  app.post("/api/send/email", requireAuth, async (req: Request, res: Response) => {
    try {
      const { to, subject, html } = req.body;
      if (!to || !subject) return res.status(400).json({ message: "البريد والموضوع مطلوبان" });
      await sendEmail(req.user!.tenantId, { to, subject, html: html || subject });
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/send/sms", requireAuth, async (req: Request, res: Response) => {
    try {
      const { to, message } = req.body;
      if (!to || !message) return res.status(400).json({ message: "الرقم والرسالة مطلوبان" });
      await sendSms(req.user!.tenantId, { to, message });
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Send proposal by email
  app.post("/api/crm/proposals/:id/send-email", requireAuth, async (req: Request, res: Response) => {
    try {
      const { to, subject, message } = req.body;
      const proposal = await storage.getCrmProposal(req.user!.tenantId, req.params.id);
      if (!proposal) return res.status(404).json({ message: "العرض غير موجود" });
      const token = await storage.createProposalToken(proposal.id, req.user!.tenantId);
      const host = `${req.protocol}://${req.get("host")}`;
      const link = `${host}/proposal/${token}`;
      const html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#1e40af;">عرض سعر: ${proposal.title}</h2>
          ${message ? `<p>${message}</p>` : ''}
          <p>يمكنك مشاهدة وتحميل عرض السعر من خلال الرابط أدناه:</p>
          <a href="${link}" style="display:inline-block;background:#1e40af;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
            عرض عرض السعر
          </a>
          <p style="font-size:12px;color:#666;">رقم العرض: ${proposal.proposalNumber} | الإجمالي: ${parseFloat(proposal.total || '0').toLocaleString()} ${proposal.currency}</p>
        </div>
      `;
      await sendEmail(req.user!.tenantId, { to, subject: subject || `عرض سعر: ${proposal.title}`, html });
      await storage.updateCrmProposal(req.user!.tenantId, req.params.id, { status: "sent", sentAt: new Date() });
      res.json({ ok: true, link });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Generate shareable proposal token
  app.post("/api/crm/proposals/:id/share-token", requireAuth, async (req: Request, res: Response) => {
    const proposal = await storage.getCrmProposal(req.user!.tenantId, req.params.id);
    if (!proposal) return res.status(404).json({ message: "العرض غير موجود" });
    const token = await storage.createProposalToken(proposal.id, req.user!.tenantId);
    const host = `${req.protocol}://${req.get("host")}`;
    res.json({ token, link: `${host}/proposal/${token}` });
  });

  // Public proposal view (no auth required)
  app.get("/api/public/proposal/:token", async (req: Request, res: Response) => {
    const proposal = await storage.getProposalByToken(req.params.token);
    if (!proposal) return res.status(404).json({ message: "العرض غير موجود أو انتهت صلاحيته" });
    // Update status to viewed if it was sent
    if (proposal.status === "sent") {
      await storage.updateCrmProposal(proposal.tenantId, proposal.id, { status: "viewed", viewedAt: new Date() });
    }
    res.json(proposal);
  });

  // ============================================================================
  // CRM ATTACHMENTS ROUTES
  // ============================================================================
  app.get("/api/crm/attachments", requireAuth, async (req: Request, res: Response) => {
    const { entityType, entityId } = req.query as any;
    if (!entityType || !entityId) return res.status(400).json({ message: "entityType and entityId required" });
    const attachments = await storage.getAttachments(req.user!.tenantId, entityType, entityId);
    res.json(attachments);
  });

  app.post("/api/crm/attachments", requireAuth, uploadDoc.single("file"), async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { entityType, entityId } = req.body;
    if (!entityType || !entityId) return res.status(400).json({ message: "entityType and entityId required" });
    const protocol = req.protocol;
    const host = req.get("host");
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    const attachment = await storage.createAttachment({
      tenantId: req.user!.tenantId,
      entityType,
      entityId,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user!.id,
    });
    res.json(attachment);
  });

  app.delete("/api/crm/attachments/:id", requireAuth, async (req: Request, res: Response) => {
    await storage.deleteAttachment(req.user!.tenantId, req.params.id);
    res.json({ ok: true });
  });

  // ============================================================================
  // GOOGLE OAUTH INTEGRATION
  // ============================================================================
  function getGoogleOAuth2Client(clientId: string, clientSecret: string, redirectUri: string) {
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  app.get("/api/integrations/google/auth-url", requireAuth, async (req: Request, res: Response) => {
    const integration = await storage.getIntegration(req.user!.tenantId, "google_oauth");
    const config = integration?.config as any || {};
    if (!config.clientId || !config.clientSecret) {
      return res.status(400).json({ message: "Google Client ID وClient Secret مطلوبان في الإعدادات أولاً" });
    }
    const redirectUri = `${req.protocol}://${req.get("host")}/api/integrations/google/callback`;
    const oauth2Client = getGoogleOAuth2Client(config.clientId, config.clientSecret, redirectUri);
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/gmail.send",
        "profile",
        "email",
      ],
      state: req.user!.tenantId,
    });
    res.json({ url });
  });

  app.get("/api/integrations/google/callback", async (req: Request, res: Response) => {
    const { code, state: tenantId } = req.query as any;
    if (!code || !tenantId) return res.status(400).send("Missing code or state");
    try {
      const integration = await storage.getIntegration(tenantId, "google_oauth");
      const config = integration?.config as any || {};
      const redirectUri = `${req.protocol}://${req.get("host")}/api/integrations/google/callback`;
      const oauth2Client = getGoogleOAuth2Client(config.clientId, config.clientSecret, redirectUri);
      const { tokens } = await oauth2Client.getToken(code);
      const newConfig = { ...config, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, tokenExpiry: tokens.expiry_date, scope: tokens.scope };
      await storage.upsertIntegration(tenantId, "google_oauth", { isEnabled: true, config: newConfig });
      res.send(`<html><body><script>window.close();opener.location.reload();</script><p>تم الربط بنجاح. يمكنك إغلاق هذه النافذة.</p></body></html>`);
    } catch (e: any) {
      res.status(500).send(`Error: ${e.message}`);
    }
  });

  app.post("/api/integrations/google/create-meet", requireAuth, async (req: Request, res: Response) => {
    try {
      const integration = await storage.getIntegration(req.user!.tenantId, "google_oauth");
      const config = integration?.config as any;
      if (!config?.refreshToken) return res.status(400).json({ message: "Google غير مرتبط. اربط حسابك أولاً." });
      const redirectUri = `${req.protocol}://${req.get("host")}/api/integrations/google/callback`;
      const oauth2Client = getGoogleOAuth2Client(config.clientId, config.clientSecret, redirectUri);
      oauth2Client.setCredentials({ refresh_token: config.refreshToken, access_token: config.accessToken });
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      const { title, description, startTime, endTime, attendeeEmails } = req.body;
      const event = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
          summary: title || "اجتماع CRM",
          description: description || "",
          start: { dateTime: startTime || new Date().toISOString(), timeZone: "Asia/Riyadh" },
          end: { dateTime: endTime || new Date(Date.now() + 3600000).toISOString(), timeZone: "Asia/Riyadh" },
          attendees: attendeeEmails?.map((e: string) => ({ email: e })) || [],
          conferenceData: { createRequest: { requestId: `meet-${Date.now()}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
        },
      });
      const meetLink = event.data.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === "video")?.uri;
      res.json({ ok: true, meetLink, eventLink: event.data.htmlLink, eventId: event.data.id });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ============================================================================
  // DB-driven redirect middleware (runs before SPA fallback)
  // ============================================================================
  app.use(async (req, res, next) => {
    const path = req.path;
    if (path.startsWith("/api") || path.startsWith("/assets") || path.includes(".")) {
      return next();
    }
    try {
      const tenantId = await resolvePublicTenantId(req);
      const allRedirects = tenantId ? await storage.getRedirects(tenantId) : [];
      const match = allRedirects.find(r => {
        if (!r.isActive) return false;
        // Exact match - only skip if destination is same as source (self-redirect)
        if (r.fromUrl === path) return r.toUrl !== path;
        // Match with trailing slash appended to current path
        // Only redirect if destination differs from current path (prevent loops)
        if (r.fromUrl === path + "/") {
          return r.toUrl !== path && r.toUrl !== path + "/";
        }
        return false;
      });
      if (match) {
        await storage.incrementRedirectHit(match.id);
        return res.redirect(match.statusCode || 301, match.toUrl);
      }
    } catch {}
    next();
  });

  return httpServer;
}
