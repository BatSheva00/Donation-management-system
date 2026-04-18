import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { useAuthStore } from "../../../shared/stores/authStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const useLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", data);
      const responseData = response.data.data;

      // Check if email verification is needed
      if (responseData.needsEmailVerification) {
        toast.info(t("auth.pleaseVerifyEmail"));
        navigate("/verify-email", {
          state: {
            userId: responseData.userId,
            email: responseData.email,
          },
        });
        return;
      }

      // Check if profile completion is needed
      if (responseData.needsProfileCompletion) {
        const { accessToken, refreshToken } = responseData;
        const meResponse = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const userData = meResponse.data.data;

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

        setAuth(user, accessToken, refreshToken, userData.permissions || []);
        
        // Fetch notifications immediately after login
        queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
        
        toast.info(t("auth.pleaseCompleteProfile"));
        navigate("/complete-profile");
        return;
      }

      // Normal login flow
      const { accessToken, refreshToken } = responseData;
      const meResponse = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userData = meResponse.data.data;

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

      setAuth(user, accessToken, refreshToken, userData.permissions || []);
      
      // Fetch notifications immediately after login
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      
      toast.success(t("auth.welcomeBack"));
      navigate("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
