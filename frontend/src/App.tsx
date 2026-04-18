import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./shared/components/layout/Layout";
import ProtectedRoute from "./shared/components/auth/ProtectedRoute";
import PermissionGuard from "./shared/components/auth/PermissionGuard";
import GuestRoute from "./shared/components/auth/GuestRoute";
import SkipToContent from "./shared/components/shared/SkipToContent";
import { useAuthStore } from "./shared/stores/authStore";
import { getCurrentUser } from "./shared/services/userService";

// Pages
import HomePage from "./features/home/HomePage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import EmailVerificationPage from "./features/auth/EmailVerificationPage";
import ProfileCompletionPage from "./features/auth/ProfileCompletionPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import DonationsPage from "./features/donations/DonationsPage";
import DonationDetailPage from "./features/donations/DonationDetailPage";
import MyDonationsPage from "./features/donations/MyDonationsPage";
import MyRequestsPage from "./features/donations/MyRequestsPage";
import { RequestsPage } from "./features/requests/RequestsPage";
import RequestDetailPage from "./features/requests/RequestDetailPage";
import MyRequestsPendingPage from "./features/requests/MyRequestsPage";
import MyFulfilledRequestsPage from "./features/requests/MyFulfilledRequestsPage";
import AdminRequestsPage from "./features/requests/AdminRequestsPage";
import DeliveriesPage from "./features/deliveries/DeliveriesPage";
import MyDeliveriesPage from "./features/deliveries/MyDeliveriesPage";
import UserProfilePage from "./features/user-profile/UserProfilePage";
import AdminPanel from "./features/admin/AdminPanel";
import UserManagement from "./features/admin/components/UserManagement";
import UserVerification from "./features/admin/components/UserVerification";
import RoleManagement from "./features/admin/components/RoleManagement";
import PermissionManagement from "./features/admin/components/PermissionManagement";
import DonationManagement from "./features/admin/components/DonationManagement";
import { TransactionManagement } from "./features/payments/components/TransactionManagement";
import ActivityManagement from "./features/admin/components/ActivityManagement";
import { NotificationsPage } from "./features/notifications/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import {
  HowItWorksPage,
  AboutPage,
  ContactPage,
  FAQPage,
  CommunityPage,
  PrivacyPage,
  TermsPage,
  CookiesPage,
} from "./pages/static";

function App() {
  const { isAuthenticated, accessToken, setUser, setPermissions, clearAuth } =
    useAuthStore();
  const hasFetchedUser = useRef(false);

  // Fetch user data from /me endpoint on app initialization
  useEffect(() => {
    const fetchUserData = async () => {
      // Prevent double fetch in React StrictMode (development)
      if (hasFetchedUser.current) {
        return;
      }

      if (isAuthenticated && accessToken) {
        hasFetchedUser.current = true;

        try {
          const response = await getCurrentUser();
          const userData = response.data;

          // Transform backend user format to frontend format
          const user = {
            id: userData._id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            role: {
              key: userData.role,
              name: userData.role,
            },
            language: userData.language,
            status: userData.status,
            profileCompletionStatus: userData.profileCompletionStatus,
            profileImage: userData.profileImage,
            createdAt: userData.createdAt,
            address: userData.address,
            documents: userData.documents,
          };

          setUser(user);
          setPermissions(userData.permissions || []);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          // Clear auth if token is invalid
          clearAuth();
          hasFetchedUser.current = false; // Reset on error to allow retry
        }
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <>
      <SkipToContent />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* Static Pages */}
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="cookies" element={<CookiesPage />} />

          {/* Guest-only routes (redirect to dashboard if logged in) */}
          <Route element={<GuestRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route path="verify-email" element={<EmailVerificationPage />} />
          <Route path="complete-profile" element={<ProfileCompletionPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="profile/:userId" element={<UserProfilePage />} />
          </Route>

          {/* Donations - Permission Protected */}
          <Route
            element={
              <PermissionGuard
                requiredPermissions={["donations.view", "donations.view.own"]}
                requireAll={false}
              />
            }
          >
            <Route path="donations" element={<DonationsPage />} />
            <Route path="donations/:id" element={<DonationDetailPage />} />
          </Route>

          {/* Requests - Permission Protected */}
          <Route
            element={
              <PermissionGuard
                requiredPermissions={["requests.view", "requests.view.own"]}
                requireAll={false}
              />
            }
          >
            <Route path="requests" element={<RequestsPage />} />
            <Route path="requests/:id" element={<RequestDetailPage />} />
          </Route>

          {/* Deliveries - Driver Protected */}
          <Route
            element={
              <PermissionGuard
                requiredPermissions={["deliveries.view"]}
                requireAll={false}
              />
            }
          >
            <Route path="deliveries" element={<DeliveriesPage />} />
            <Route path="my-deliveries" element={<MyDeliveriesPage />} />
          </Route>

          {/* My Donations */}
          <Route path="my-donations" element={<MyDonationsPage />} />

          {/* My Requests (donation requests by user) */}
          <Route path="my-requests" element={<MyRequestsPage />} />
          
          {/* My User Requests (items requested by user) */}
          <Route path="my-user-requests" element={<MyRequestsPendingPage />} />

          {/* My Fulfilled Requests (items user has fulfilled/donated to) */}
          <Route path="my-fulfilled-requests" element={<MyFulfilledRequestsPage />} />

          {/* Notifications */}
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Admin Routes - Protected by Permission */}
          <Route
            element={
              <PermissionGuard
                requiredPermissions={[
                  "system.admin",
                  "users.manage",
                  "users.view",
                  "users.verify",
                  "roles.view",
                  "roles.create",
                  "roles.edit",
                  "roles.delete",
                  "roles.assign",
                  "permissions.view",
                  "permissions.create",
                  "permissions.edit",
                  "permissions.delete",
                  "permissions.grant",
                  "permissions.deny",
                ]}
                requireAll={false}
              />
            }
          >
            <Route path="admin" element={<AdminPanel />}>
              <Route index element={<Navigate to="/admin/users" replace />} />

              {/* User Management - Protected */}
              <Route
                path="users"
                element={
                  <PermissionGuard
                    requiredPermissions={["users.view", "users.manage"]}
                    requireAll={false}
                  >
                    <UserManagement />
                  </PermissionGuard>
                }
              />

              {/* User Verification - Protected */}
              <Route
                path="verification"
                element={
                  <PermissionGuard
                    requiredPermissions={["users.verify"]}
                    requireAll={false}
                  >
                    <UserVerification />
                  </PermissionGuard>
                }
              />

              {/* Donation Management - Protected */}
              <Route
                path="donations"
                element={
                  <PermissionGuard
                    requiredPermissions={["donations.approve", "donations.delete"]}
                    requireAll={false}
                  >
                    <DonationManagement />
                  </PermissionGuard>
                }
              />

              {/* Request Management - Protected */}
              <Route
                path="requests"
                element={
                  <PermissionGuard
                    requiredPermissions={["requests.approve", "requests.delete"]}
                    requireAll={false}
                  >
                    <AdminRequestsPage />
                  </PermissionGuard>
                }
              />

              {/* Activity Management - Protected */}
              <Route
                path="activities"
                element={
                  <PermissionGuard requiredPermissions={["system.admin"]}>
                    <ActivityManagement />
                  </PermissionGuard>
                }
              />

              {/* Role Management - Protected */}
              <Route
                path="roles"
                element={
                  <PermissionGuard
                    requiredPermissions={[
                      "roles.view",
                      "roles.create",
                      "roles.edit",
                      "roles.delete",
                      "roles.assign",
                    ]}
                    requireAll={false}
                  >
                    <RoleManagement />
                  </PermissionGuard>
                }
              />

              {/* Permission Management - Protected */}
              <Route
                path="permissions"
                element={
                  <PermissionGuard
                    requiredPermissions={[
                      "permissions.view",
                      "permissions.create",
                      "permissions.edit",
                      "permissions.delete",
                      "permissions.grant",
                      "permissions.deny",
                    ]}
                    requireAll={false}
                  >
                    <PermissionManagement />
                  </PermissionGuard>
                }
              />

              {/* Transaction Management - Admin Only */}
              <Route
                path="transactions"
                element={
                  <PermissionGuard
                    requiredPermissions={["system.admin"]}
                    requireAll={false}
                  >
                    <TransactionManagement />
                  </PermissionGuard>
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
