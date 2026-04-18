import { Request, Response } from "express";
import { Request as RequestModel } from "./request.model";
import { RequestStatus } from "../../shared/types/enums";
import {
  sendRequestCreatedNotification,
  sendRequestStatusNotification,
} from "./request.notifications";
import { onRequestCreated, onRequestUpdate } from "../../services/StatsService";

// Create a new request
export const createRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if user is a business - businesses cannot create requests
    if (req.user?.role === "business") {
      return res.status(403).json({
        success: false,
        message: "Business users cannot create requests",
      });
    }

    const {
      title,
      description,
      category,
      quantity,
      urgency,
      needsDelivery,
      deliveryAddress,
      notes,
      expiresAt,
    } = req.body;

    const request = new RequestModel({
      title,
      description,
      category,
      quantity,
      urgency,
      requesterId: req.user!.userId,
      needsDelivery,
      deliveryAddress: needsDelivery ? deliveryAddress : undefined,
      notes,
      expiresAt,
      status: RequestStatus.APPROVED, // Auto-approve requests
    });

    await request.save();

    // Send notification to admins
    await sendRequestCreatedNotification(request._id);

    // Update stats
    await onRequestCreated();

    const populatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .lean();

    res.status(201).json({
      success: true,
      data: populatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create request",
    });
  }
};

// Get all requests (with filters)
export const getRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      status,
      category,
      urgency,
      needsDelivery,
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = {};

    // Only show approved requests to non-admins
    if (status) {
      query.status = status;
    } else {
      query.status = RequestStatus.APPROVED;
    }

    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (needsDelivery !== undefined)
      query.needsDelivery = needsDelivery === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await RequestModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    const total = await RequestModel.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch requests",
    });
  }
};

// Get all requests for admin
export const getAdminRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      status,
      category,
      urgency,
      needsDelivery,
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (needsDelivery !== undefined)
      query.needsDelivery = needsDelivery === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await RequestModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    const total = await RequestModel.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch requests",
    });
  }
};

// Get my requests (as requester)
export const getMyRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { requesterId: req.user!.userId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await RequestModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    const total = await RequestModel.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch requests",
    });
  }
};

// Get my fulfilled requests (as donor)
export const getMyFulfilledRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { fulfilledBy: req.user!.userId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await RequestModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    const total = await RequestModel.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch fulfilled requests",
    });
  }
};

// Get request by ID
export const getRequestById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch request",
    });
  }
};

// Update request
export const updateRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only requester can update their own request (before approval)
    if (
      request.requesterId.toString() !== req.user!.userId &&
      req.user!.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this request",
      });
    }

    // Can only update before someone takes/fulfills the request
    if (
      ![RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED].includes(request.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot update request in current status",
      });
    }

    const allowedUpdates = [
      "title",
      "description",
      "category",
      "quantity",
      "urgency",
      "needsDelivery",
      "deliveryAddress",
      "notes",
      "expiresAt",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (request as any)[field] = req.body[field];
      }
    });

    // If status was rejected, set back to pending
    if (request.status === RequestStatus.REJECTED) {
      request.status = RequestStatus.PENDING;
    }

    await request.save();

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update request",
    });
  }
};

// Approve request (Admin)
export const approveRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== RequestStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Request is not pending approval",
      });
    }

    const oldStatus = request.status;
    request.status = RequestStatus.APPROVED;
    await request.save();

    // Send notification to requester
    await sendRequestStatusNotification(request._id, oldStatus, request.status);

    // Update stats
    await onRequestUpdate(
      request._id,
      oldStatus,
      request.status,
      request.needsDelivery
    );

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to approve request",
    });
  }
};

// Reject request (Admin)
export const rejectRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== RequestStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: "Request is not pending approval",
      });
    }

    const oldStatus = request.status;
    request.status = RequestStatus.REJECTED;
    await request.save();

    // Send notification to requester
    await sendRequestStatusNotification(request._id, oldStatus, request.status);

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to reject request",
    });
  }
};

// Fulfill request (Donor/Business)
export const fulfillRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== RequestStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        message: "Request is not available for fulfillment",
      });
    }

    // Cannot fulfill your own request
    if (request.requesterId.toString() === req.user!.userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot fulfill your own request",
      });
    }

    const oldStatus = request.status;
    request.fulfilledBy = req.user!.userId as any;
    request.status = request.needsDelivery
      ? RequestStatus.WAITING_FOR_DELIVERY
      : RequestStatus.FULFILLED;
    await request.save();

    // Send notifications
    await sendRequestStatusNotification(request._id, oldStatus, request.status);

    // Update stats
    await onRequestUpdate(
      request._id,
      oldStatus,
      request.status,
      request.needsDelivery,
      req.user!.userId
    );

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fulfill request",
    });
  }
};

// Retract fulfillment (Donor/Business)
export const retractFulfillment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only the fulfiller can retract
    if (request.fulfilledBy?.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not the fulfiller of this request",
      });
    }

    // Can only retract if FULFILLED or WAITING_FOR_DELIVERY (before driver starts)
    if (
      ![RequestStatus.FULFILLED, RequestStatus.WAITING_FOR_DELIVERY].includes(
        request.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot retract fulfillment at this stage",
      });
    }

    const oldStatus = request.status;
    request.fulfilledBy = undefined as any;
    request.status = RequestStatus.APPROVED; // Back to available
    await request.save();

    // Send notifications
    await sendRequestStatusNotification(request._id, oldStatus, request.status);

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "firstName lastName email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retract fulfillment",
    });
  }
};

// Assign driver to request
export const assignDriver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== RequestStatus.WAITING_FOR_DELIVERY) {
      return res.status(400).json({
        success: false,
        message: "Request does not need delivery",
      });
    }

    if (request.assignedDriverId) {
      return res.status(400).json({
        success: false,
        message: "Request already has an assigned driver",
      });
    }

    const oldStatus = request.status;
    request.assignedDriverId = req.user!.userId as any;
    await request.save();

    // Send notifications
    await sendRequestStatusNotification(request._id, oldStatus, request.status);

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to assign driver",
    });
  }
};

// Unassign driver from request
export const unassignDriver = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only the assigned driver or admin can unassign
    if (
      request.assignedDriverId?.toString() !== req.user!.userId &&
      req.user!.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to unassign driver",
      });
    }

    // Can only unassign before in transit
    if (request.status !== RequestStatus.WAITING_FOR_DELIVERY) {
      return res.status(400).json({
        success: false,
        message: "Cannot unassign driver at this stage",
      });
    }

    request.assignedDriverId = undefined;
    await request.save();

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to unassign driver",
    });
  }
};

// Mark request as in transit
export const markInTransit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only assigned driver can mark in transit
    if (request.assignedDriverId?.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (request.status !== RequestStatus.WAITING_FOR_DELIVERY) {
      return res.status(400).json({
        success: false,
        message: "Request is not waiting for delivery",
      });
    }

    const oldStatus = request.status;
    request.status = RequestStatus.IN_TRANSIT;
    await request.save();

    // Send notifications
    await sendRequestStatusNotification(request._id, oldStatus, request.status);

    // Update stats
    await onRequestUpdate(
      request._id,
      oldStatus,
      request.status,
      request.needsDelivery
    );

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to mark request as in transit",
    });
  }
};

// Mark request as delivered
export const markDelivered = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only assigned driver can mark delivered
    if (request.assignedDriverId?.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (request.status !== RequestStatus.IN_TRANSIT) {
      return res.status(400).json({
        success: false,
        message: "Request is not in transit",
      });
    }

    const oldStatus = request.status;
    request.status = RequestStatus.DELIVERED;
    await request.save();

    // Send notifications
    await sendRequestStatusNotification(request._id, oldStatus, request.status);

    // Update stats (including driver delivery stats)
    await onRequestUpdate(
      request._id,
      oldStatus,
      request.status,
      request.needsDelivery,
      undefined,
      req.user!.userId
    );

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to mark request as delivered",
    });
  }
};

// Mark request as completed
export const markCompleted = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only requester can mark completed
    if (request.requesterId.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Can mark completed from FULFILLED (no delivery) or DELIVERED (with delivery)
    const validStatuses = [RequestStatus.FULFILLED, RequestStatus.DELIVERED];
    if (!validStatuses.includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be completed at this stage",
      });
    }

    const oldStatus = request.status;
    request.status = RequestStatus.COMPLETED;
    await request.save();

    // Send notifications
    await sendRequestStatusNotification(request._id, oldStatus, request.status);

    // Update stats
    await onRequestUpdate(
      request._id,
      oldStatus,
      request.status,
      request.needsDelivery
    );

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to mark request as completed",
    });
  }
};

// Cancel request
export const cancelRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only requester or admin can cancel
    if (
      request.requesterId.toString() !== req.user!.userId &&
      req.user!.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this request",
      });
    }

    // Requester can only cancel before fulfilled
    if (
      request.requesterId.toString() === req.user!.userId &&
      ![RequestStatus.PENDING, RequestStatus.APPROVED].includes(request.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel request at this stage",
      });
    }

    const oldStatus = request.status;
    request.status = RequestStatus.CANCELLED;
    await request.save();

    // Send notifications
    await sendRequestStatusNotification(request._id, oldStatus, request.status);

    const updatedRequest = await RequestModel.findById(request._id)
      .populate(
        "requesterId",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "fulfilledBy",
        "firstName lastName email role profileCompletionStatus"
      )
      .populate(
        "assignedDriverId",
        "name email role profileCompletionStatus driverInfo"
      )
      .lean();

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel request",
    });
  }
};

// Delete request
export const deleteRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = await RequestModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only admin or requester (if pending/rejected) can delete
    if (req.user!.role !== "admin") {
      if (request.requesterId.toString() !== req.user!.userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this request",
        });
      }

      if (
        ![RequestStatus.PENDING, RequestStatus.REJECTED].includes(
          request.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete request in current status",
        });
      }
    }

    await RequestModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete request",
    });
  }
};
