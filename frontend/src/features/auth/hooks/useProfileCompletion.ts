import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import api from "../../../lib/axios";
import { useAuthStore } from "../../../shared/stores/authStore";

// Schemas
const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().optional(),
});

const businessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  registrationNumber: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const driverSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: z.string().min(1, "License expiry is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleModel: z.string().optional(),
  vehiclePlateNumber: z.string().min(1, "Vehicle plate number is required"),
  vehicleCapacity: z.number().min(1, "Vehicle capacity is required"),
});

const baseProfileSchema = z.object({
  address: addressSchema,
});

const businessProfileSchema = z.object({
  address: addressSchema,
  businessInfo: businessSchema,
});

const driverProfileSchema = z.object({
  address: addressSchema,
  driverInfo: driverSchema,
});

export type ProfileFormData =
  | z.infer<typeof baseProfileSchema>
  | z.infer<typeof businessProfileSchema>
  | z.infer<typeof driverProfileSchema>;

export const useProfileCompletion = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [documents, setDocuments] = useState<
    Array<{ type: string; file: File; uploaded: boolean }>
  >([]);
  const hasShownStatusToast = useRef(false);

  const isBusinessUser = user?.role?.key === "business";
  const isDriverUser = user?.role?.key === "driver";

  const profileSchema = isBusinessUser
    ? businessProfileSchema
    : isDriverUser
    ? driverProfileSchema
    : baseProfileSchema;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const steps = isBusinessUser
    ? ["Address", "Business Info", "Documents"]
    : isDriverUser
    ? ["Address", "Driver Info", "Documents"]
    : ["Address", "Documents"];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!hasShownStatusToast.current) {
      if (user.profileCompletionStatus === "rejected") {
        toast.error(
          "Your profile was rejected. Please update your information and resubmit."
        );
      }
      hasShownStatusToast.current = true;
    }
  }, [user, navigate]);

  const handleNext = async () => {
    const isStepValid = await form.trigger();
    if (isStepValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const uploadProfileImage = async () => {
    if (!profileImage) return;

    try {
      setProfileImageLoading(true);
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      await api.post("/users/upload-profile-image", formData);
      setProfileImageLoading(false);
    } catch (error: any) {
      setProfileImageLoading(false);
      throw error;
    }
  };

  const uploadDocuments = async () => {
    const documentsToUpload = documents.filter((doc) => !doc.uploaded);

    for (const doc of documentsToUpload) {
      const formData = new FormData();
      formData.append("document", doc.file);
      formData.append("type", doc.type);

      try {
        await api.post("/users/documents", formData);
        setDocuments((prev) =>
          prev.map((d) => (d.file === doc.file ? { ...d, uploaded: true } : d))
        );
      } catch (error) {
        throw error;
      }
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);

      // Upload profile image
      if (profileImage) {
        await uploadProfileImage();
      }

      // Upload documents
      if (documents.length > 0) {
        await uploadDocuments();
      }

      // Submit profile data
      await api.put("/users/profile", data);

      // Update user in store
      const updatedUser = {
        ...user,
        ...data,
        profileCompletionStatus: "pending",
      };
      setUser(updatedUser);

      toast.success("Profile submitted for review!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit profile");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    activeStep,
    steps,
    isBusinessUser,
    isDriverUser,
    profileImage,
    setProfileImage,
    profileImageLoading,
    setProfileImageLoading,
    documents,
    setDocuments,
    handleNext,
    handleBack,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
