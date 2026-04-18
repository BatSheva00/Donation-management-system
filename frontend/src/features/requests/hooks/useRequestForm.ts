import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
// import api from "../../../lib/axios";
import { CreateRequestDto } from "../types/request.types";

export const useRequestForm = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<CreateRequestDto>({
    title: "",
    description: "",
    category: "food",
    quantity: 1,
    unit: "items",
    urgency: "medium",
    location: {
      address: "",
      city: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateRequestDto) => {
      // TODO: Replace with actual API call
      // const response = await api.post("/requests", data);
      // return response.data.data;
      console.log("Creating request:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success(t("requests.createSuccess"));
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("requests.createError"));
    },
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      category: "food",
      quantity: 1,
      unit: "items",
      urgency: "medium",
      location: {
        address: "",
        city: "",
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
    createMutation.mutate(formData);
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

