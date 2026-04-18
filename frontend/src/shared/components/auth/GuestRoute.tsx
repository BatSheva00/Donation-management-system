import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../shared/stores/authStore";

/**
 * GuestRoute - Redirects authenticated users away from guest-only pages
 * Used for login, register, etc.
 */
const GuestRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  // If user is authenticated, redirect based on profile completion status
  if (isAuthenticated && user) {
    // If profile is incomplete or rejected, redirect to complete-profile
    const needsProfileCompletion =
      user.profileCompletionStatus === "incomplete" ||
      user.profileCompletionStatus === "rejected";

    if (needsProfileCompletion) {
      return <Navigate to="/complete-profile" replace />;
    }

    // Otherwise redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
