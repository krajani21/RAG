import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { supabase } from "./lib/supabaseClient";
// import ConnectSocialMedia from "./pages/ConnectSocialMedia";

// Pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import FanHub from "./pages/FanHub";
import Onboarding from "./pages/Onboarding";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import AuthRedirector from "./components/auth/AuthRedirector";
import FanLandingPage from "./pages/FanLandingPage";
import PaymentCallback from "./pages/PaymentCallback";
import SuccessPage from "./pages/Success";

// Route Protection
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ConnectYoutube from "./pages/connectYoutubeScraper";
import ConnectInstagram from "./pages/connectInstagram";
import ConnectPdfFile from "./pages/connectPdfFile";
import ConnectSocialMedia from "./pages/ConnectSocialMedia";
import ProfilePage from "./pages/ProfilePage";
import ComingSoon from "./pages/ComingSoon";
import SubscriptionCheckerPage from "./pages/subscriptionCheckerPage";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Check if user session exists on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("User is already logged in:", session.user);
      }
    });

    // Track real-time auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, "Session:", session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <AuthRedirector />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/payment-callback" element={<PaymentCallback />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/hub/:creatorId" element={<FanHub />} />
              <Route path="/connect" element={<ConnectSocialMedia />} />
              <Route
                path="/connect/youtube"
                element={
                  <ProtectedRoute>
                    <ConnectYoutube />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/connect/instagram"
                element={
                  <ProtectedRoute>
                    <ConnectInstagram />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/connect/upload"
                element={
                  <ProtectedRoute>
                    <ConnectPdfFile />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/coming-soon" 
                element={<ComingSoon />} 
              />

              <Route
                path="/profile/:id"
                element={<ProfilePage />}
              />

              <Route
                path="/creator-dashboard"
                element={
                  <ProtectedRoute requireCreator>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fan"
                element={<FanLandingPage />}
              />
              <Route
                path="/fan-dashboard"
                element={
                  <ProtectedRoute requireFan>
                    <FanHub />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false} redirectTo="/creator-dashboard">
                    <Login />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/fan-login"
                element={
                  <ProtectedRoute requireAuth={false} redirectTo="/fan-dashboard">
                    <Login />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/signup"
                element={
                  <ProtectedRoute requireAuth={false} redirectTo="/login">
                    <SignUp />
                  </ProtectedRoute>
                }
              />
              <Route path="/subscription-checker" element={<SubscriptionCheckerPage />} />
              <Route
                path="/chat/:creatorId"
                element={
                  <ProtectedRoute requireFan redirectTo="/fan-login">
                    <FanHub />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
