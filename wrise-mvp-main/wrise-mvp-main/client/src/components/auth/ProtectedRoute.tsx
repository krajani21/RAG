import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  requireAuth?: boolean;
  requireCreator?: boolean;
  requireFan?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireCreator = false,
  requireFan = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading, to get your credentials</p>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <Navigate
        to={`${redirectTo}?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (requireCreator && !user?.isCreator) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireFan && user?.isCreator) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

