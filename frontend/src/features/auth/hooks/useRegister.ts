import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../../lib/axios";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  roleKey: z.enum(["user", "business", "driver"]),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const useRegister = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    userId: string;
    email: string;
  } | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      roleKey: "user",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);

      const phoneStr = (data.phoneNumber || "").replace(/[\s\-\(\)]/g, "");
      const phoneMatch = phoneStr.match(/^(\+\d{1,4})(.+)$/);
      
      if (!phoneMatch) {
        toast.error(
          "❌ INVALID PHONE NUMBER - Please enter a valid phone with country code (e.g., +972-50-123-4567)",
          {
            autoClose: 1000,
            closeButton: true,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
          }
        );
        setLoading(false);
        return;
      }

      const [, countryCode, number] = phoneMatch;

      const requestData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: {
          countryCode: countryCode,
          number: number,
        },
        roleKey: data.roleKey,
      };

      const response = await api.post("/auth/register", requestData);

      if (response.data.data.needsEmailVerification) {
        setVerificationData({
          userId: response.data.data.userId,
          email: response.data.data.email,
        });
        toast.success("Registration successful! Please verify your email.");
        return {
          success: true,
          needsVerification: true,
          data: verificationData,
        };
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed", {
        autoClose: 5000,
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    verificationData,
    onSubmit: form.handleSubmit(onSubmit),
  };
};

