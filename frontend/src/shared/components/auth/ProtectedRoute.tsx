import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../shared/stores/authStore";

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if profile is incomplete or rejected - redirect to complete-profile page
  // But don't redirect if already on the complete-profile page
  const needsProfileCompletion =
    user?.profileCompletionStatus === "incomplete" ||
    user?.profileCompletionStatus === "rejected";

  if (needsProfileCompletion && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
