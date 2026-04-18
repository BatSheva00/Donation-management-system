import api from "../../../lib/axios";
import { CreateRequestDto, IRequest, RequestFilters } from "../types/request.types";

export const requestApi = {
  // Get all requests (approved only for non-admins)
  getRequests: async (filters?: RequestFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.urgency) params.append("urgency", filters.urgency);
    if (filters?.needsDelivery !== undefined)
      params.append("needsDelivery", String(filters.needsDelivery));
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const response = await api.get(`/requests?${params.toString()}`);
    return response.data;
  },

  // Get all requests for admin
  getAdminRequests: async (filters?: RequestFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.urgency) params.append("urgency", filters.urgency);
    if (filters?.needsDelivery !== undefined)
      params.append("needsDelivery", String(filters.needsDelivery));
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const response = await api.get(`/requests/admin/all?${params.toString()}`);
    return response.data;
  },

  // Get my requests (as requester)
  getMyRequests: async (filters?: RequestFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const response = await api.get(`/requests/my/requests?${params.toString()}`);
    return response.data;
  },

  // Get my fulfilled requests (as donor)
  getMyFulfilledRequests: async (filters?: RequestFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const response = await api.get(`/requests/my/fulfilled?${params.toString()}`);
    return response.data;
  },

  // Get request by ID
  getRequestById: async (id: string) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  // Create request
  createRequest: async (data: CreateRequestDto) => {
    const response = await api.post("/requests", data);
    return response.data;
  },

  // Update request
  updateRequest: async (id: string, data: Partial<CreateRequestDto>) => {
    const response = await api.put(`/requests/${id}`, data);
    return response.data;
  },

  // Delete request
  deleteRequest: async (id: string) => {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  },

  // Approve request (Admin)
  approveRequest: async (id: string) => {
    const response = await api.post(`/requests/${id}/approve`);
    return response.data;
  },

  // Reject request (Admin)
  rejectRequest: async (id: string) => {
    const response = await api.post(`/requests/${id}/reject`);
    return response.data;
  },

  // Fulfill request (Donor/Business)
  fulfillRequest: async (id: string) => {
    const response = await api.post(`/requests/${id}/fulfill`);
    return response.data;
  },

  // Retract fulfillment (Donor/Business)
  retractFulfillment: async (id: string) => {
    const response = await api.post(`/requests/${id}/retract`);
    return response.data;
  },

  // Assign driver to request
  assignDriver: async (id: string) => {
    const response = await api.post(`/requests/${id}/assign-driver`);
    return response.data;
  },

  // Unassign driver from request
  unassignDriver: async (id: string) => {
    const response = await api.post(`/requests/${id}/unassign-driver`);
    return response.data;
  },

  // Mark request as in transit
  markInTransit: async (id: string) => {
    const response = await api.post(`/requests/${id}/in-transit`);
    return response.data;
  },

  // Mark request as delivered
  markDelivered: async (id: string) => {
    const response = await api.post(`/requests/${id}/delivered`);
    return response.data;
  },

  // Mark request as completed
  markCompleted: async (id: string) => {
    const response = await api.post(`/requests/${id}/complete`);
    return response.data;
  },

  // Cancel request
  cancelRequest: async (id: string) => {
    const response = await api.post(`/requests/${id}/cancel`);
    return response.data;
  },
};

