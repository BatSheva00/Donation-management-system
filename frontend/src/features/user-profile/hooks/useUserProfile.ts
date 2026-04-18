import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  getUserById,
  updateUserProfile,
} from "../../../shared/services/userService";

export interface UserFormData {
  firstName: string;
  lastName: string;
  phone: { countryCode: string; number: string };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    registrationNumber: string;
    description: string;
    website: string;
  };
  driverInfo: {
    licenseNumber: string;
    licenseExpiry: string;
    vehicleType: string;
    vehicleModel: string;
  };
}

export const useUserProfile = (userId?: string) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    phone: { countryCode: "", number: "" },
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    businessInfo: {
      businessName: "",
      businessType: "",
      registrationNumber: "",
      description: "",
      website: "",
    },
    driverInfo: {
      licenseNumber: "",
      licenseExpiry: "",
      vehicleType: "",
      vehicleModel: "",
    },
  });

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || { countryCode: "", number: "" },
        address: userData.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        businessInfo: userData.businessInfo || {
          businessName: "",
          businessType: "",
          registrationNumber: "",
          description: "",
          website: "",
        },
        driverInfo: userData.driverInfo || {
          licenseNumber: "",
          licenseExpiry: "",
          vehicleType: "",
          vehicleModel: "",
        },
      });
    }
  }, [userData]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateUserProfile(userId!, data, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success(t("profile.updateSuccess"));
      setIsEditing(false);
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("profile.updateError"));
    },
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedFieldChange = (
    parent: string,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    setPendingData(formData);
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = () => {
    updateMutation.mutate(pendingData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original userData
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || { countryCode: "", number: "" },
        address: userData.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        businessInfo: userData.businessInfo || {
          businessName: "",
          businessType: "",
          registrationNumber: "",
          description: "",
          website: "",
        },
        driverInfo: userData.driverInfo || {
          licenseNumber: "",
          licenseExpiry: "",
          vehicleType: "",
          vehicleModel: "",
        },
      });
    }
  };

  return {
    userData,
    isLoading,
    isEditing,
    setIsEditing,
    showConfirmDialog,
    setShowConfirmDialog,
    formData,
    handleFieldChange,
    handleNestedFieldChange,
    handleSave,
    handleConfirmSave,
    handleCancelEdit,
    updateMutation,
  };
};
