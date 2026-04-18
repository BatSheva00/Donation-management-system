import axios from "axios";
import { useAuthStore } from "../shared/stores/authStore";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 Forbidden
    // Only auto-logout for suspended/inactive accounts, not permission errors
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || "";

      // Check if it's an account status error (suspended/inactive)
      const isAccountSuspended =
        errorMessage.toLowerCase().includes("suspended") ||
        errorMessage.toLowerCase().includes("inactive");

      if (isAccountSuspended) {
        const { accessToken } = useAuthStore.getState();

        // If user is logged in and account is suspended, log them out
        if (accessToken) {
          toast.error(errorMessage || "Your account has been suspended");
          useAuthStore.getState().clearAuth();
          window.location.href = "/login";
        }
      }

      // Always reject the error so components can handle it
      return Promise.reject(error);
    }

    // Don't auto-retry for auth endpoints (login, register, etc.)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const { refreshToken, user, permissions } = useAuthStore.getState();
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000/api"
          }/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAccessToken } = response.data.data;
        useAuthStore
          .getState()
          .setAuth(user!, newAccessToken, refreshToken!, permissions);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
