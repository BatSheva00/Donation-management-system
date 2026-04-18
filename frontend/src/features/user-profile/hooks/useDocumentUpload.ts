import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  uploadDocument,
  deleteDocument,
} from "../../../shared/services/userService";

export const useDocumentUpload = (userId: string) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) =>
      uploadDocument(file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success(t("profile.uploadSuccess"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("profile.uploadError"));
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => deleteDocument(userId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success(t("profile.deleteSuccess"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("profile.deleteError"));
    },
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate({ file, type });
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm(t("profile.confirmDeleteDocument"))) {
      deleteMutation.mutate(documentId);
    }
  };

  return {
    uploadMutation,
    deleteMutation,
    handleFileUpload,
    handleDeleteDocument,
  };
};
