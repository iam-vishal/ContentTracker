import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/login";
import OtpVerificationPage from "@/pages/otp-verification";
import SocialConnectPage from "@/pages/social-connect";
import DashboardPage from "@/pages/dashboard";
import ContentSubmissionPage from "@/pages/content-submission";
import RewardClaimPage from "@/pages/reward-claim";
import OrderTrackingPage from "@/pages/order-tracking";
import BottomNavigation from "@/components/bottom-navigation";
import NotFound from "@/pages/not-found";
import Inspiration from "./pages/inspiration";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative overflow-hidden">
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={LoginPage} />
            <Route path="/verify-otp" component={OtpVerificationPage} />
          </>
        ) : (
          <>
            <Route path="/" component={DashboardPage} />
            <Route path="/social-connect" component={SocialConnectPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/content" component={ContentSubmissionPage} />
            <Route path="/rewards" component={RewardClaimPage} />
            <Route path="/tracking" component={OrderTrackingPage} />
            <Route path="/inspiration" component={Inspiration} />
            <Route path="/profile" component={DashboardPage} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>

      {isAuthenticated && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
