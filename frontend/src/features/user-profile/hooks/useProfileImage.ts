import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../../lib/axios";

export const useProfileImage = (userId: string) => {
  const queryClient = useQueryClient();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  // Profile image upload mutation (doesn't trigger re-approval)
  const uploadProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profileImage", file);
      const response = await api.post("/users/upload-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success("Profile image updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to upload profile image"
      );
    },
  });

  const handleProfileImageSelect = (file: File) => {
    uploadProfileImageMutation.mutate(file);
  };

  const handleProfileImageRemove = () => {
    // Currently we don't support removing profile images
    // Could add backend endpoint for this in the future
  };

  const handleViewImage = (url: string) => {
    setSelectedImageUrl(url);
    setImageViewerOpen(true);
  };

  return {
    uploadProfileImageMutation,
    handleProfileImageSelect,
    handleProfileImageRemove,
    imageViewerOpen,
    setImageViewerOpen,
    selectedImageUrl,
    handleViewImage,
  };
};

