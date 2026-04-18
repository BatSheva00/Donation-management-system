import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "../../../lib/axios";
import { CreateDonationDto, DonationType } from "../types/donation.types";
import { useAuthStore } from "../../../shared/stores/authStore";

export const useDonationForm = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<CreateDonationDto>({
    title: "",
    description: "",
    type: DonationType.FOOD,
    quantity: 1,
    unit: "items",
    pickupLocation: {
      address: user?.address?.street || "",
      city: user?.address?.city || "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateDonationDto) => {
      const response = await api.post("/donations", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success(t("donations.createSuccess") || "Donation created successfully!");
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t("donations.createError") || "Failed to create donation";
      const errors = error.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const handleOpen = () => {
    // Auto-fill address from user profile when opening
    setFormData(prev => ({
      ...prev,
      pickupLocation: {
        ...prev.pickupLocation,
        address: user?.address?.street || "",
        city: user?.address?.city || "",
      },
    }));
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      type: DonationType.FOOD,
      quantity: 1,
      unit: "items",
      pickupLocation: {
        address: "",
        city: "",
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
    });
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedFieldChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.pickupLocation.address || !formData.pickupLocation.city) {
      toast.error("Please provide complete pickup location");
      return;
    }

    // For now, use default coordinates if not set (in production, use geocoding)
    const dataToSubmit = {
      ...formData,
      pickupLocation: {
        ...formData.pickupLocation,
        coordinates: {
          latitude: formData.pickupLocation.coordinates.latitude || 40.7128,
          longitude: formData.pickupLocation.coordinates.longitude || -74.0060,
        },
      },
    };

    createMutation.mutate(dataToSubmit);
  };

  return {
    open,
    formData,
    handleOpen,
    handleClose,
    handleFieldChange,
    handleNestedFieldChange,
    handleSubmit,
    isCreating: createMutation.isPending,
  };
};

