import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestApi } from "../api/requestApi";
import { CreateRequestDto, RequestFilters } from "../types/request.types";
import { toast } from "react-toastify";

export const useRequests = (filters?: RequestFilters) => {
  return useQuery({
    queryKey: ["requests", filters],
    queryFn: () => requestApi.getRequests(filters),
  });
};

export const useAdminRequests = (filters?: RequestFilters) => {
  return useQuery({
    queryKey: ["adminRequests", filters],
    queryFn: () => requestApi.getAdminRequests(filters),
  });
};

export const useMyRequests = (filters?: RequestFilters) => {
  return useQuery({
    queryKey: ["myRequests", filters],
    queryFn: () => requestApi.getMyRequests(filters),
  });
};

export const useMyFulfilledRequests = (filters?: RequestFilters) => {
  return useQuery({
    queryKey: ["myFulfilledRequests", filters],
    queryFn: () => requestApi.getMyFulfilledRequests(filters),
  });
};

export const useRequest = (id: string) => {
  return useQuery({
    queryKey: ["request", id],
    queryFn: () => requestApi.getRequestById(id),
    enabled: !!id,
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequestDto) => requestApi.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
      toast.success("Request created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create request");
    },
  });
};

export const useUpdateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRequestDto> }) =>
      requestApi.updateRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["request", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
      toast.success("Request updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update request");
    },
  });
};

export const useDeleteRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
      toast.success("Request deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete request");
    },
  });
};

export const useApproveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.approveRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
      toast.success("Request approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve request");
    },
  });
};

export const useRejectRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.rejectRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
      toast.success("Request rejected");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject request");
    },
  });
};

export const useFulfillRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.fulfillRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myFulfilledRequests"] });
      toast.success("Request fulfilled! Thank you for your donation.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to fulfill request");
    },
  });
};

export const useRetractFulfillment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.retractFulfillment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myFulfilledRequests"] });
      toast.success("Fulfillment retracted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to retract fulfillment");
    },
  });
};

export const useAssignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.assignDriver(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myDeliveries"] });
      toast.success("Driver assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign driver");
    },
  });
};

export const useUnassignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.unassignDriver(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myDeliveries"] });
      toast.success("Driver unassigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unassign driver");
    },
  });
};

export const useMarkInTransit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.markInTransit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myDeliveries"] });
      toast.success("Request marked as in transit");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to mark as in transit");
    },
  });
};

export const useMarkDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.markDelivered(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myDeliveries"] });
      toast.success("Request marked as delivered");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to mark as delivered");
    },
  });
};

export const useMarkCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.markCompleted(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
      toast.success("Request completed! Thank you.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to complete request");
    },
  });
};

export const useCancelRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestApi.cancelRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
      toast.success("Request cancelled");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    },
  });
};
