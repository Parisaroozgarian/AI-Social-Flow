import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import LandingPage from "@/pages/landing-page";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SettingsPage from "@/pages/settings-page";
import GeneratePage from "@/pages/generate-page";
import SchedulePage from "@/pages/schedule-page";
import AnalyzePage from "@/pages/analyze-page";
import HistoryPage from "@/pages/history-page";
import ProfilePage from "@/pages/profile-page";
import ContactPage from "@/pages/contact-page"; // Added import
import NotFound from "@/pages/not-found";
import { Navigation } from "@/components/ui/navigation";
import { ProtectedRoute } from "@/lib/protected-route";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {({ isLoading }) => (
          <ThemeProvider defaultTheme="light">
            <div className="min-h-screen">
              {!isLoading && <Navigation />}
              <Switch>
                {/* Public Routes */}
                <Route path="/" component={LandingPage} />
                <Route path="/auth" component={AuthPage} />
                <Route path="/contact" component={ContactPage} />

                {/* Protected Routes */}
                <ProtectedRoute path="/dashboard" component={HomePage} />
                <ProtectedRoute path="/generate" component={GeneratePage} />
                <ProtectedRoute path="/schedule" component={SchedulePage} />
                <ProtectedRoute path="/analyze" component={AnalyzePage} />
                <ProtectedRoute path="/history" component={HistoryPage} />
                <ProtectedRoute path="/profile" component={ProfilePage} />
                <ProtectedRoute path="/settings" component={SettingsPage} />

                <Route component={NotFound} />
              </Switch>
              <Toaster />
            </div>
          </ThemeProvider>
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}