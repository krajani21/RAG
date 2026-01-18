// src/components/auth/AuthRedirector.tsx
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const AuthRedirector = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't run if still loading or if no user (not authenticated)
    if (loading || !user) return;
    
    const fromAuthPages = ["/", "/login", "/signup"];
    if (fromAuthPages.includes(location.pathname)) {
      // Check if there's a redirect parameter
      const params = new URLSearchParams(location.search);
      const redirectPath = params.get("redirect");
      
      if (redirectPath) {
        // If there's a redirect parameter, use it
        navigate(redirectPath, { replace: true });
      } else {
        // Otherwise, use default behavior
        if (user.isCreator) {
          navigate("/", { replace: true });
        } else {
          navigate("/fan", { replace: true });
        }
      }
    }
  }, [user, loading, location.pathname, location.search, navigate]);

  return null;
};

export default AuthRedirector;
