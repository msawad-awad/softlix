import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { LanguageProvider, useLanguage } from "@/lib/language-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { LoadingPage } from "@/components/loading-spinner";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Companies from "@/pages/companies";
import CompanyForm from "@/pages/company-form";
import Contacts from "@/pages/contacts";
import ContactForm from "@/pages/contact-form";
import Settings from "@/pages/settings";
import Tasks from "@/pages/tasks";
import Tickets from "@/pages/tickets";
import HR from "@/pages/hr";
import Inventory from "@/pages/inventory";

import PublicHome from "@/pages/public/home";
import PublicAbout from "@/pages/public/about";
import PublicServices from "@/pages/public/services";
import ServiceDetail from "@/pages/public/service-detail";
import PublicProjects from "@/pages/public/projects";
import PublicBlog, { BlogPostPage, CategoryPage } from "@/pages/public/blog";
import PublicContact from "@/pages/public/contact";
import PublicClients from "@/pages/public/clients";

import WebsiteOverview from "@/pages/website/index";
import WebsiteServices from "@/pages/website/services";
import WebsiteProjects from "@/pages/website/projects";
import WebsiteBlog from "@/pages/website/blog";
import WebsiteLeads from "@/pages/website/leads";
import WebsiteClients from "@/pages/website/clients";
import WebsiteRedirects from "@/pages/website/redirects";
import WebsiteBookings from "@/pages/website/bookings";
import WebsiteBranding from "@/pages/website/branding";
import WebsiteHomeContent from "@/pages/website/home-content";
import WebsiteAboutContent from "@/pages/website/about-content";
import WebsiteTestimonials from "@/pages/website/testimonials";
import WebsiteProcessSteps from "@/pages/website/process-steps";
import WebsiteWhyUs from "@/pages/website/why-us";
import WebsiteSiteStats from "@/pages/website/site-stats";
import Marketing from "@/pages/marketing";
import MarketingNewsletter from "@/pages/marketing/newsletter";
import MarketingPricing from "@/pages/marketing/pricing";
import VisitorsPage from "@/pages/dashboard/visitors";
import PublicPricing from "@/pages/public/pricing";
import { useMarketingTracking } from "@/hooks/use-marketing-tracking";
import { FloatingContactWidget, ExitIntentPopup, AnnouncementBar, SocialProofToast } from "@/components/public/marketing-widgets";
import type { MarketingSettings } from "@shared/schema";
import { BookingModal } from "@/components/public/booking-modal";

import CrmDashboard from "@/pages/crm/dashboard";
import CrmLeads from "@/pages/crm/leads";
import LeadDetail from "@/pages/crm/lead-detail";
import CrmDeals from "@/pages/crm/deals";
import CrmActivities from "@/pages/crm/activities";
import CrmProposals from "@/pages/crm/proposals";
import { ProposalPreviewById, ProposalPublicView } from "@/pages/crm/proposal-preview";
import GoogleImport from "@/pages/crm/google-import";
import IntegrationsSettings from "@/pages/settings/integrations";
import TeamUsersPage from "@/pages/settings/users";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  if (isLoading) return <LoadingPage />;
  if (!isAuthenticated) return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  return <>{children}</>;
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isRTL } = useLanguage() ?? { isRTL: false };
  const content = (
    <SidebarInset className="flex flex-col flex-1 min-w-0" {...(isRTL ? { dir: "rtl" } : {})}>
      <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sticky top-0 z-50">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </SidebarInset>
  );
  return (
    <div className="flex min-h-screen w-full" dir="ltr">
      {isRTL ? <>{content}<AppSidebar /></> : <><AppSidebar />{content}</>}
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem", "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function PublicSite() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [bookingOpen, setBookingOpen] = useState(false);
  const p = { lang, onLangChange: setLang };
  useMarketingTracking();

  const { data: siteSettings } = useQuery<any>({ queryKey: ["/api/public/site-settings"] });
  const { data: mktSettings } = useQuery<MarketingSettings>({ queryKey: ["/api/public/marketing-settings"] });
  const waUrl = siteSettings?.socialWhatsapp || (mktSettings?.whatsappNumber ? `https://wa.me/${mktSettings.whatsappNumber.replace(/\D/g,"")}` : "https://wa.me/966537861534");

  return (
    <>
      <AnnouncementBar lang={lang} onBookingClick={() => setBookingOpen(true)} />
      <Switch>
      <Route path="/about"><PublicAbout {...p} /></Route>
      <Route path="/about/"><PublicAbout {...p} /></Route>
      <Route path="/services/:slug"><ServiceDetail {...p} /></Route>
      <Route path="/services"><PublicServices {...p} /></Route>
      {/* Old WordPress URL: /porjects/ (with WordPress typo for SEO) */}
      <Route path="/porjects/:slug">{(params) => <PublicProjects {...p} slug={params.slug} />}</Route>
      <Route path="/porjects"><PublicProjects {...p} /></Route>
      <Route path="/projects/:slug"><PublicProjects {...p} /></Route>
      <Route path="/projects"><PublicProjects {...p} /></Route>
      <Route path="/blog/:slug"><PublicBlog {...p} /></Route>
      <Route path="/blog"><PublicBlog {...p} /></Route>
      {/* Old WordPress URL: /contact-us/ */}
      <Route path="/contact-us"><PublicContact {...p} /></Route>
      <Route path="/contact-us/"><PublicContact {...p} /></Route>
      <Route path="/contact"><PublicContact {...p} /></Route>
      <Route path="/pricing"><PublicPricing lang={lang} /></Route>
      <Route path="/clients"><PublicClients {...p} /></Route>
      {/* Category pages: /category/{cat}/ */}
      <Route path="/category/:cat">{(params) => <CategoryPage {...p} category={decodeURIComponent(params.cat)} />}</Route>
      {/* Service-specific old WordPress URLs */}
      <Route path="/mobile-app-development"><ServiceDetail {...p} slug="mobile-app-development" /></Route>
      <Route path="/mobile-app-development/"><ServiceDetail {...p} slug="mobile-app-development" /></Route>
      <Route path="/content-management-and-designs"><ServiceDetail {...p} slug="content-management-and-designs" /></Route>
      <Route path="/content-management-and-designs/"><ServiceDetail {...p} slug="content-management-and-designs" /></Route>
      <Route path="/software-services"><ServiceDetail {...p} slug="software-services" /></Route>
      <Route path="/technical-consulting"><ServiceDetail {...p} slug="technical-consulting" /></Route>
      <Route path="/product-e-commerce"><ServiceDetail {...p} slug="product-e-commerce" /></Route>
      <Route path="/web-programming"><ServiceDetail {...p} slug="web-programming" /></Route>
      <Route path="/digital-marketing"><ServiceDetail {...p} slug="digital-marketing" /></Route>
      <Route path="/"><PublicHome {...p} /></Route>
      {/* Root-level blog post catch-all: /{arabic-slug}/ */}
      <Route path="/:slug">{(params) => <BlogPostPage {...p} slug={decodeURIComponent(params.slug)} />}</Route>
      <Route component={NotFound} />
    </Switch>

      <FloatingContactWidget lang={lang} whatsappUrl={waUrl} onBookingClick={() => setBookingOpen(true)} settings={mktSettings} />
      <ExitIntentPopup lang={lang} onBookingClick={() => setBookingOpen(true)} settings={mktSettings} />
      <SocialProofToast lang={lang} settings={mktSettings} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} lang={lang} />
    </>
  );
}

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login"><Login /></Route>
      <Route path="/register"><Register /></Route>

      {/* Admin / CRM dashboard routes */}
      <Route path="/dashboard"><AdminRoute><Dashboard /></AdminRoute></Route>
      <Route path="/companies/new"><AdminRoute><CompanyForm /></AdminRoute></Route>
      <Route path="/companies/:id/edit"><AdminRoute><CompanyForm /></AdminRoute></Route>
      <Route path="/companies/:id"><AdminRoute><CompanyForm /></AdminRoute></Route>
      <Route path="/companies"><AdminRoute><Companies /></AdminRoute></Route>
      <Route path="/contacts/new"><AdminRoute><ContactForm /></AdminRoute></Route>
      <Route path="/contacts/:id/edit"><AdminRoute><ContactForm /></AdminRoute></Route>
      <Route path="/contacts/:id"><AdminRoute><ContactForm /></AdminRoute></Route>
      <Route path="/contacts"><AdminRoute><Contacts /></AdminRoute></Route>
      <Route path="/settings"><AdminRoute><Settings /></AdminRoute></Route>
      <Route path="/tasks"><AdminRoute><Tasks /></AdminRoute></Route>
      <Route path="/tickets"><AdminRoute><Tickets /></AdminRoute></Route>
      <Route path="/hr"><AdminRoute><HR /></AdminRoute></Route>
      <Route path="/inventory"><AdminRoute><Inventory /></AdminRoute></Route>

      {/* CRM Routes */}
      <Route path="/crm/leads/:id"><AdminRoute><LeadDetail /></AdminRoute></Route>
      <Route path="/crm/leads"><AdminRoute><CrmLeads /></AdminRoute></Route>
      <Route path="/crm/deals"><AdminRoute><CrmDeals /></AdminRoute></Route>
      <Route path="/crm/activities"><AdminRoute><CrmActivities /></AdminRoute></Route>
      <Route path="/crm/proposals/:id/preview"><AdminRoute><ProposalPreviewById /></AdminRoute></Route>
      <Route path="/crm/proposals"><AdminRoute><CrmProposals /></AdminRoute></Route>
      <Route path="/crm/google-import"><AdminRoute><GoogleImport /></AdminRoute></Route>
      <Route path="/crm"><AdminRoute><CrmDashboard /></AdminRoute></Route>

      {/* Integrations Settings */}
      <Route path="/settings/integrations"><AdminRoute><IntegrationsSettings /></AdminRoute></Route>

      {/* Team Users Management */}
      <Route path="/settings/users"><AdminRoute><TeamUsersPage /></AdminRoute></Route>

      {/* Public proposal view (no auth required) */}
      <Route path="/proposal/:token"><ProposalPublicView /></Route>

      {/* CMS website routes */}
      <Route path="/website/branding"><AdminRoute><WebsiteBranding /></AdminRoute></Route>
      <Route path="/website/home-content"><AdminRoute><WebsiteHomeContent /></AdminRoute></Route>
      <Route path="/website/about-content"><AdminRoute><WebsiteAboutContent /></AdminRoute></Route>
      <Route path="/website/testimonials"><AdminRoute><WebsiteTestimonials /></AdminRoute></Route>
      <Route path="/website/process-steps"><AdminRoute><WebsiteProcessSteps /></AdminRoute></Route>
      <Route path="/website/why-us"><AdminRoute><WebsiteWhyUs /></AdminRoute></Route>
      <Route path="/website/site-stats"><AdminRoute><WebsiteSiteStats /></AdminRoute></Route>
      <Route path="/website/services"><AdminRoute><WebsiteServices /></AdminRoute></Route>
      <Route path="/website/projects"><AdminRoute><WebsiteProjects /></AdminRoute></Route>
      <Route path="/website/blog"><AdminRoute><WebsiteBlog /></AdminRoute></Route>
      <Route path="/website/leads"><AdminRoute><WebsiteLeads /></AdminRoute></Route>
      <Route path="/website/bookings"><AdminRoute><WebsiteBookings /></AdminRoute></Route>
      <Route path="/website/clients"><AdminRoute><WebsiteClients /></AdminRoute></Route>
      <Route path="/website/redirects"><AdminRoute><WebsiteRedirects /></AdminRoute></Route>
      <Route path="/website"><AdminRoute><WebsiteOverview /></AdminRoute></Route>
      <Route path="/marketing/newsletter"><AdminRoute><MarketingNewsletter /></AdminRoute></Route>
      <Route path="/marketing/pricing"><AdminRoute><MarketingPricing /></AdminRoute></Route>
      <Route path="/marketing"><AdminRoute><Marketing /></AdminRoute></Route>
      <Route path="/dashboard/visitors"><AdminRoute><VisitorsPage /></AdminRoute></Route>

      {/* Public website routes */}
      <Route path="/about"><PublicSite /></Route>
      <Route path="/about/"><PublicSite /></Route>
      <Route path="/services/:slug"><PublicSite /></Route>
      <Route path="/services"><PublicSite /></Route>
      {/* Projects: /projects/ and /porjects/ (WordPress typo preserved for SEO) */}
      <Route path="/projects/:slug"><PublicSite /></Route>
      <Route path="/projects"><PublicSite /></Route>
      <Route path="/porjects/:slug"><PublicSite /></Route>
      <Route path="/porjects"><PublicSite /></Route>
      <Route path="/blog/:slug"><PublicSite /></Route>
      <Route path="/blog"><PublicSite /></Route>
      {/* Contact: /contact and /contact-us/ (old WordPress URL) */}
      <Route path="/contact"><PublicSite /></Route>
      <Route path="/contact-us"><PublicSite /></Route>
      <Route path="/contact-us/"><PublicSite /></Route>
      {/* Public pricing page */}
      <Route path="/pricing"><PublicSite /></Route>
      {/* Category pages */}
      <Route path="/category/:cat"><PublicSite /></Route>
      {/* Old service-specific WordPress URLs */}
      <Route path="/mobile-app-development"><PublicSite /></Route>
      <Route path="/mobile-app-development/"><PublicSite /></Route>
      <Route path="/content-management-and-designs"><PublicSite /></Route>
      <Route path="/content-management-and-designs/"><PublicSite /></Route>
      <Route path="/software-services"><PublicSite /></Route>
      <Route path="/technical-consulting"><PublicSite /></Route>
      <Route path="/product-e-commerce"><PublicSite /></Route>
      <Route path="/web-programming"><PublicSite /></Route>
      <Route path="/digital-marketing"><PublicSite /></Route>
      {/* Home */}
      <Route path="/"><PublicSite /></Route>
      {/* Root-level slug catch-all (blog posts, old Arabic URLs) - must be last */}
      <Route path="/:slug"><PublicSite /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function FaviconSync() {
  const { data: siteSettings } = useQuery<any>({
    queryKey: ["/api/public/site-settings"],
    staleTime: 60 * 1000,
  });
  useEffect(() => {
    const faviconUrl = siteSettings?.faviconUrl;
    if (!faviconUrl) return;
    let link = document.getElementById("app-favicon") as HTMLLinkElement | null;
    if (!link) {
      link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    }
    if (!link) {
      link = document.createElement("link");
      link.id = "app-favicon";
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
    const ext = faviconUrl.split("?")[0].split(".").pop()?.toLowerCase() || "png";
    const mimeMap: Record<string, string> = {
      ico: "image/x-icon", svg: "image/svg+xml",
      png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp"
    };
    link.type = mimeMap[ext] || "image/png";
  }, [siteSettings?.faviconUrl]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <LanguageProvider defaultLanguage="ar">
          <TooltipProvider>
            <AuthProvider>
              <FaviconSync />
              <Toaster />
              <Router />
            </AuthProvider>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
