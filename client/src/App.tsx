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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  return <>{children}</>;
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isRTL } = useLanguage() ?? { isRTL: false };
  
  return (
    <div 
      className="dashboard-layout flex min-h-screen w-full"
      style={{ 
        flexDirection: isRTL ? 'row-reverse' : 'row',
        display: 'flex'
      }}
    >
      <AppSidebar />
      <SidebarInset className="sidebar-inset flex flex-col flex-1">
        <header 
          className="dashboard-header flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sticky top-0 z-50"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
        >
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <div 
            className="header-controls flex items-center gap-2"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
          >
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      <Route path="/login">
        <AuthLayout>
          <Login />
        </AuthLayout>
      </Route>
      
      <Route path="/register">
        <AuthLayout>
          <Register />
        </AuthLayout>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/companies">
        <ProtectedRoute>
          <DashboardLayout>
            <Companies />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/companies/new">
        <ProtectedRoute>
          <DashboardLayout>
            <CompanyForm />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/companies/:id">
        <ProtectedRoute>
          <DashboardLayout>
            <CompanyForm />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/companies/:id/edit">
        <ProtectedRoute>
          <DashboardLayout>
            <CompanyForm />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/contacts">
        <ProtectedRoute>
          <DashboardLayout>
            <Contacts />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/contacts/new">
        <ProtectedRoute>
          <DashboardLayout>
            <ContactForm />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/contacts/:id">
        <ProtectedRoute>
          <DashboardLayout>
            <ContactForm />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/contacts/:id/edit">
        <ProtectedRoute>
          <DashboardLayout>
            <ContactForm />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/tasks">
        <ProtectedRoute>
          <DashboardLayout>
            <Tasks />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/tickets">
        <ProtectedRoute>
          <DashboardLayout>
            <Tickets />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/hr">
        <ProtectedRoute>
          <DashboardLayout>
            <HR />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/inventory">
        <ProtectedRoute>
          <DashboardLayout>
            <Inventory />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
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
