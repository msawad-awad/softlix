import { useState } from "react";
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
import PublicBlog from "@/pages/public/blog";
import PublicContact from "@/pages/public/contact";

import WebsiteOverview from "@/pages/website/index";
import WebsiteServices from "@/pages/website/services";
import WebsiteProjects from "@/pages/website/projects";
import WebsiteBlog from "@/pages/website/blog";
import WebsiteLeads from "@/pages/website/leads";
import WebsiteClients from "@/pages/website/clients";
import WebsiteRedirects from "@/pages/website/redirects";
import Marketing from "@/pages/marketing";
import { useMarketingTracking } from "@/hooks/use-marketing-tracking";

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
  const p = { lang, onLangChange: setLang };
  useMarketingTracking();
  return (
    <Switch>
      <Route path="/about"><PublicAbout {...p} /></Route>
      <Route path="/services/:slug"><ServiceDetail {...p} /></Route>
      <Route path="/services"><PublicServices {...p} /></Route>
      <Route path="/projects/:slug"><PublicProjects {...p} /></Route>
      <Route path="/projects"><PublicProjects {...p} /></Route>
      <Route path="/blog/:slug"><PublicBlog {...p} /></Route>
      <Route path="/blog"><PublicBlog {...p} /></Route>
      <Route path="/contact"><PublicContact {...p} /></Route>
      <Route path="/"><PublicHome {...p} /></Route>
      <Route component={NotFound} />
    </Switch>
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

      {/* CMS website routes */}
      <Route path="/website/services"><AdminRoute><WebsiteServices /></AdminRoute></Route>
      <Route path="/website/projects"><AdminRoute><WebsiteProjects /></AdminRoute></Route>
      <Route path="/website/blog"><AdminRoute><WebsiteBlog /></AdminRoute></Route>
      <Route path="/website/leads"><AdminRoute><WebsiteLeads /></AdminRoute></Route>
      <Route path="/website/clients"><AdminRoute><WebsiteClients /></AdminRoute></Route>
      <Route path="/website/redirects"><AdminRoute><WebsiteRedirects /></AdminRoute></Route>
      <Route path="/website"><AdminRoute><WebsiteOverview /></AdminRoute></Route>
      <Route path="/marketing"><AdminRoute><Marketing /></AdminRoute></Route>

      {/* Public website - catch all remaining paths */}
      <Route path="/about"><PublicSite /></Route>
      <Route path="/services/:slug"><PublicSite /></Route>
      <Route path="/services"><PublicSite /></Route>
      <Route path="/projects/:slug"><PublicSite /></Route>
      <Route path="/projects"><PublicSite /></Route>
      <Route path="/blog/:slug"><PublicSite /></Route>
      <Route path="/blog"><PublicSite /></Route>
      <Route path="/contact"><PublicSite /></Route>
      <Route path="/"><PublicSite /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <LanguageProvider defaultLanguage="ar">
          <TooltipProvider>
            <AuthProvider>
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
