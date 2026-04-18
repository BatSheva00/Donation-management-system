import { Request, Response, NextFunction } from "express";
import { Donation } from "./donation.model";
import { AppError } from "../../shared/utils/AppError";
import { DonationStatus } from "../../shared/types/enums";
import { io } from "../../server";
import { sendToUsers, sendToPermission } from "../../config/socket";
import {
  trackDonationCreated,
  trackDonationRequested,
  trackDonationApproved,
  trackDonationRejected,
  trackDriverAssigned,
  trackDriverInTransit,
  trackDonationDelivered,
  trackDonationCompleted,
} from "../activities/activity.helpers";
import { notifyDonationChange } from "../../services/NotificationService";
import {
  onDonationInsert,
  onDonationUpdate,
  onDonationDelete,
  onDonationRequested,
} from "../../services/StatsService";
import { sendNotificationToRole } from "../notifications/notification.service";
import { notifyDonationStatusChange } from "./donation.notifications";

/**
 * Get all donations with filtering and pagination
 */
export const getAllDonations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status,
      type,
      donorId,
      search,
      isFood,
      city,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      requestedByMe,
      assignedToMe,
    } = req.query;

    const filter: any = {};

    // Apply filters
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (donorId) filter.donorId = donorId;
    if (isFood !== undefined) filter.isFood = isFood === "true";
    if (city) filter["pickupLocation.city"] = { $regex: city, $options: "i" };
    
    // Filter by requested by current user
    if (requestedByMe === "true") {
      filter.requestedBy = req.user.userId;
    }
    
    // Filter by assigned to current user (driver)
    if (assignedToMe === "true") {
      filter.assignedDriverId = req.user.userId;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    // Execute query with population
    const donations = await Donation.find(filter)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus donorRating donorRatingCount")
      .populate("requestedBy", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("assignedDriverId", "firstName lastName phone profileCompletionStatus driverInfo.rating driverInfo.ratingCount")
      .populate("assignedPackerId", "firstName lastName phone profileCompletionStatus")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Donation.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get donation by ID
 */
export const getDonationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate(
        "donorId",
        "firstName lastName email phone profileImage address profileCompletionStatus donorRating donorRatingCount"
      )
      .populate("requestedBy", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("assignedDriverId", "firstName lastName phone email profileCompletionStatus driverInfo.rating driverInfo.ratingCount")
      .populate("assignedPackerId", "firstName lastName phone email profileCompletionStatus")
      .populate("requestId");

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Prevent caching to ensure fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new donation
 */
export const createDonation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      type,
      quantity,
      unit,
      images,
      pickupLocation,
      pickupTimeWindow,
      expiryDate,
      isFood,
      foodDetails,
      estimatedValue,
      weight,
      notes,
    } = req.body;

    // Get authenticated user ID
    const donorId = req.user?.userId;

    if (!donorId) {
      return next(new AppError("User not authenticated", 401));
    }

    // Validate required fields
    if (
      !title ||
      !description ||
      !type ||
      !quantity ||
      !unit ||
      !pickupLocation
    ) {
      return next(new AppError("Missing required fields", 400));
    }

    // Validate pickup location structure
    if (
      !pickupLocation.address ||
      !pickupLocation.city ||
      !pickupLocation.coordinates
    ) {
      return next(new AppError("Invalid pickup location structure", 400));
    }

    if (
      !pickupLocation.coordinates.latitude ||
      !pickupLocation.coordinates.longitude
    ) {
      return next(
        new AppError("Pickup location coordinates are required", 400)
      );
    }

    // Validate food details if isFood is true
    if (isFood && !foodDetails) {
      return next(
        new AppError("Food details are required for food donations", 400)
      );
    }

    // Create donation
    const donation = await Donation.create({
      donorId,
      title,
      description,
      type,
      quantity,
      unit,
      images: images || [],
      status: DonationStatus.PENDING,
      pickupLocation,
      pickupTimeWindow,
      expiryDate,
      isFood: isFood || false,
      foodDetails: isFood ? foodDetails : undefined,
      estimatedValue,
      weight,
      notes,
    });

    // Track activity
    await trackDonationCreated(donorId, donation._id.toString(), donation.title);

    // Update statistics
    await onDonationInsert(donation);

    // Send real-time notifications
    notifyDonationChange("insert", donation);

    // Notify admins about new donation
    await sendNotificationToRole("admin", {
      type: "donation_created",
      title: "New Donation Created",
      message: `A new donation "${donation.title}" has been created and is pending review.`,
      data: {
        donationId: donation._id.toString(),
        title: donation.title,
        type: donation.type,
      },
    });

    // Populate donor info for response
    await donation.populate("donorId", "firstName lastName email phone profileCompletionStatus");

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: donation,
    });
  } catch (error: any) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return next(new AppError("Validation error", 400, errors));
    }
    next(error);
  }
};

/**
 * Update donation
 */
export const updateDonation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if user is the donor or admin
    const isAdmin = req.user?.role === "admin";
    const isDonor = donation.donorId.toString() === userId;

    if (!isAdmin && !isDonor) {
      return next(
        new AppError("You do not have permission to update this donation", 403)
      );
    }

    // Don't allow updating if donation is already in progress or completed
    if (
      [
        DonationStatus.IN_TRANSIT,
        DonationStatus.DELIVERED,
        DonationStatus.COMPLETED,
      ].includes(donation.status)
    ) {
      return next(
        new AppError(
          "Cannot update donation that is in transit, delivered, or completed",
          400
        )
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      "title",
      "description",
      "quantity",
      "unit",
      "images",
      "pickupLocation",
      "pickupTimeWindow",
      "expiryDate",
      "isFood",
      "foodDetails",
      "estimatedValue",
      "weight",
      "notes",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (donation as any)[field] = req.body[field];
      }
    });

    await donation.save();

    // Send real-time notifications
    notifyDonationChange("update", donation);

    await donation.populate("donorId", "firstName lastName email phone profileCompletionStatus");

    res.status(200).json({
      success: true,
      message: "Donation updated successfully",
      data: donation,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return next(new AppError("Validation error", 400, errors));
    }
    next(error);
  }
};

/**
 * Delete donation
 */
export const deleteDonation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if user is the donor or admin
    const isAdmin = req.user?.role === "admin";
    const isDonor = donation.donorId.toString() === userId;

    if (!isAdmin && !isDonor) {
      return next(
        new AppError("You do not have permission to delete this donation", 403)
      );
    }

    // Don't allow deleting if donation is already assigned or in progress
    if (
      [
        DonationStatus.WAITING_FOR_DELIVERY,
        DonationStatus.IN_TRANSIT,
        DonationStatus.DELIVERED,
        DonationStatus.COMPLETED,
      ].includes(donation.status)
    ) {
      return next(
        new AppError(
          "Cannot delete donation that is assigned, in transit, delivered, or completed",
          400
        )
      );
    }

    // Store donation data before deleting
    const donationData = donation.toObject();
    
    await donation.deleteOne();

    // Update statistics
    await onDonationDelete(donationData);

    // Send real-time notifications
    notifyDonationChange("delete", donationData);

    res.status(200).json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update donation status (Admin or Driver only)
 */
export const updateDonationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;

    if (!status) {
      return next(new AppError("Status is required", 400));
    }

    // Validate status value
    if (!Object.values(DonationStatus).includes(status)) {
      return next(new AppError("Invalid status value", 400));
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Update status
    donation.status = status;

    // Handle rejection
    if (status === DonationStatus.REJECTED) {
      if (!rejectionReason) {
        return next(new AppError("Rejection reason is required", 400));
      }
      donation.rejectionReason = rejectionReason;
    }

    // Update admin notes if provided
    if (adminNotes) {
      donation.adminNotes = adminNotes;
    }

    // Set delivered timestamp if status is delivered or completed
    if (
      status === DonationStatus.DELIVERED ||
      status === DonationStatus.COMPLETED
    ) {
      donation.deliveredAt = new Date();
    }

    const oldStatus = donation.status;
    await donation.save();

    // Update statistics
    await onDonationUpdate(donation._id.toString(), oldStatus, status, donation);

    // Send real-time notifications
    notifyDonationChange("update", donation);

    await donation.populate("donorId", "firstName lastName email phone profileCompletionStatus");

    res.status(200).json({
      success: true,
      message: "Donation status updated successfully",
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my donations (for authenticated user)
 */
export const getMyDonations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const filter: any = { donorId: userId };
    if (status) filter.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const donations = await Donation.find(filter)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("requestedBy", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("assignedDriverId", "firstName lastName phone profileCompletionStatus")
      .populate("assignedPackerId", "firstName lastName phone profileCompletionStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Donation.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get donation statistics
 */
export const getDonationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { donorId } = req.query;

    const filter: any = {};
    if (donorId) filter.donorId = donorId;

    const stats = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", DonationStatus.PENDING] }, 1, 0],
            },
          },
          approved: {
            $sum: {
              $cond: [{ $eq: ["$status", DonationStatus.APPROVED] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", DonationStatus.COMPLETED] }, 1, 0],
            },
          },
          totalValue: { $sum: "$estimatedValue" },
        },
      },
    ]);

    const typeDistribution = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {
          total: 0,
          pending: 0,
          approved: 0,
          completed: 0,
          totalValue: 0,
        },
        typeDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request a donation (user can request to receive a donation)
 */
export const requestDonation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { needsDelivery, deliveryAddress, deliveryCity } = req.body;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if donation is pending and available
    if (donation.status !== DonationStatus.PENDING) {
      return next(
        new AppError("This donation is not available for request", 400)
      );
    }

    // Check if user is trying to request their own donation
    if (donation.donorId.toString() === userId) {
      return next(new AppError("You cannot request your own donation", 400));
    }

    // Check if donation is already requested
    if (donation.requestedBy) {
      return next(
        new AppError("This donation has already been requested", 400)
      );
    }

    // Validate delivery info if delivery is needed
    if (needsDelivery && (!deliveryAddress || !deliveryCity)) {
      return next(
        new AppError("Delivery address and city are required when delivery is needed", 400)
      );
    }

    // Update donation status based on delivery need
    donation.status = DonationStatus.REQUESTED;
    donation.requestedBy = userId as any;
    donation.requestedAt = new Date();
    donation.needsDelivery = needsDelivery;

    // Set delivery location if delivery is needed
    if (needsDelivery) {
      donation.deliveryLocation = {
        address: deliveryAddress,
        city: deliveryCity,
        coordinates: {
          latitude: 0, // TODO: geocode address
          longitude: 0,
        },
      };
    }

    const oldStatus = DonationStatus.PENDING;
    await donation.save();

    const populatedDonation = await Donation.findById(donation._id)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("requestedBy", "firstName lastName email phone profileCompletionStatus");

    // Notify all parties about status change (this will create DB notifications AND send WebSocket)
    await notifyDonationStatusChange({
      donationId: donation._id.toString(),
      donationTitle: donation.title,
      donorId: donation.donorId.toString(),
      receiverId: userId,
      oldStatus,
      newStatus: DonationStatus.REQUESTED,
    });

    // Notify admins about the request for approval
    await sendNotificationToRole("admin", {
      type: "donation_requested",
      title: "Donation Request Pending",
      message: `A donation "${donation.title}" has been requested and needs approval`,
      data: {
        donationId: donation._id.toString(),
        donationTitle: donation.title,
      },
    });

    // Track activity
    await trackDonationRequested(userId, donation._id.toString(), donation.title, !!needsDelivery);

    res.status(200).json({
      success: true,
      data: populatedDonation,
      message: needsDelivery
        ? "Donation requested successfully. Waiting for admin approval and driver assignment."
        : "Donation requested successfully. Waiting for admin approval.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a donation request (admin or donor)
 */
export const approveRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if user is the donor or has admin permission
    const isDonor = donation.donorId.toString() === userId;
    const hasAdminPermission = req.user.permissions?.includes("donations.approve");
    
    if (!isDonor && !hasAdminPermission) {
      return next(new AppError("You are not authorized to approve this donation", 403));
    }

    // Allow approval for REQUESTED or WAITING_FOR_DELIVERY (with driver) status
    if (donation.status !== DonationStatus.REQUESTED && donation.status !== DonationStatus.WAITING_FOR_DELIVERY) {
      return next(new AppError("This donation cannot be approved at this time", 400));
    }

    if (!donation.requestedBy) {
      return next(new AppError("No requester found for this donation", 400));
    }

    // Determine next status based on delivery needs and driver assignment
    let newStatus = DonationStatus.APPROVED;
    let message = "Request approved successfully.";

    if (donation.deliveryLocation) {
      // Needs delivery
      if (donation.assignedDriverId) {
        // Driver already assigned, approve and ready for delivery
        newStatus = DonationStatus.APPROVED;
        message = "Request and delivery approved. Ready for delivery.";
      } else {
        // No driver yet, approve and wait for driver
        newStatus = DonationStatus.APPROVED;
        message = "Request approved. Waiting for driver assignment.";
      }
    } else {
      // No delivery needed, directly approve
      newStatus = DonationStatus.APPROVED;
      message = "Request approved successfully.";
    }

    const oldStatus = donation.status;
    donation.status = newStatus;
    await donation.save();

    // Update statistics if completed
    if (newStatus === DonationStatus.COMPLETED) {
      await onDonationUpdate(donation._id.toString(), oldStatus, newStatus, donation);
    }

    // Send real-time notifications
    notifyDonationChange("update", donation);

    const populatedDonation = await Donation.findById(donation._id)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("requestedBy", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("assignedDriverId", "firstName lastName email phone");

    // Send WebSocket notifications for specific notification banner
    const notificationData = {
      type: "request_approved",
      donationId: donation._id,
      donationTitle: donation.title,
      status: newStatus,
      message: `Your request for "${donation.title}" has been approved`,
    };

    // Notify donor, requester, driver, and users with permission
    const userIds = [donation.donorId.toString()];
    if (donation.requestedBy) {
      userIds.push(donation.requestedBy.toString());
    }
    if (donation.assignedDriverId) {
      userIds.push(donation.assignedDriverId.toString());
    }

    sendToUsers(io, userIds, "notification", notificationData);
    sendToPermission(io, "donations.approve", "notification", notificationData);

    // Notify all parties about status change
    await notifyDonationStatusChange({
      donationId: donation._id.toString(),
      donationTitle: donation.title,
      donorId: donation.donorId.toString(),
      receiverId: donation.requestedBy?.toString(),
      driverId: donation.assignedDriverId?.toString(),
      oldStatus,
      newStatus,
    });

    // Track activity for requester
    if (donation.requestedBy) {
      await trackDonationApproved(
        donation.requestedBy.toString(),
        donation._id.toString(),
        donation.title
      );
    }

    res.status(200).json({
      success: true,
      data: populatedDonation,
      message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a donation request (admin only)
 */
export const rejectRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    if (donation.status !== DonationStatus.REQUESTED) {
      return next(new AppError("This donation has not been requested", 400));
    }

    // Store requestedBy before clearing
    const requestedByUserId = donation.requestedBy?.toString();
    const oldStatus = donation.status;

    // Update donation status back to pending and clear request info
    donation.status = DonationStatus.PENDING;
    donation.requestedBy = undefined;
    donation.requestedAt = undefined;
    donation.rejectionReason = rejectionReason;

    await donation.save();

    // Send real-time notifications
    notifyDonationChange("update", donation);

    const populatedDonation = await Donation.findById(donation._id).populate(
      "donorId",
      "firstName lastName email phone profileImage"
    );

    // Send WebSocket notifications for specific notification banner
    const notificationData = {
      type: "request_rejected",
      donationId: donation._id,
      donationTitle: donation.title,
      status: DonationStatus.PENDING,
      message: `Your request for "${donation.title}" has been rejected`,
      reason: rejectionReason,
    };

    // Notify donor, requester (if exists), and users with permission
    const userIds = [donation.donorId.toString()];
    if (requestedByUserId) {
      userIds.push(requestedByUserId);
    }

    sendToUsers(io, userIds, "notification", notificationData);
    sendToPermission(io, "donations.approve", "notification", notificationData);

    // Notify all parties about status change
    await notifyDonationStatusChange({
      donationId: donation._id.toString(),
      donationTitle: donation.title,
      donorId: donation.donorId.toString(),
      receiverId: requestedByUserId,
      oldStatus,
      newStatus: DonationStatus.PENDING,
    });

    // Track activity for requester
    if (requestedByUserId) {
      await trackDonationRejected(
        requestedByUserId,
        donation._id.toString(),
        donation.title,
        rejectionReason
      );
    }

    res.status(200).json({
      success: true,
      data: populatedDonation,
      message: "Request rejected. Donation is available for requests again.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Driver self-assignment (driver assigns themselves to a delivery)
 */
export const assignDriverSelf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const driverId = req.user.userId;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if donation is approved and needs delivery
    if (donation.status !== DonationStatus.APPROVED) {
      return next(
        new AppError("This donation is not available for delivery assignment", 400)
      );
    }

    // Check if donation has delivery location
    if (!donation.deliveryLocation) {
      return next(
        new AppError("This donation does not require delivery", 400)
      );
    }

    // Check if already has a driver assigned
    if (donation.assignedDriverId) {
      return next(
        new AppError("This donation already has a driver assigned", 400)
      );
    }

    // Assign driver - status goes to WAITING_FOR_DELIVERY
    donation.assignedDriverId = driverId as any;
    donation.status = DonationStatus.WAITING_FOR_DELIVERY;

    await donation.save();

    // Send real-time notifications
    notifyDonationChange("update", donation);

    const populatedDonation = await Donation.findById(donation._id)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("requestedBy", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("assignedDriverId", "firstName lastName email phone");

    // Send WebSocket notifications for specific notification banner
    const notificationData = {
      type: "driver_assigned",
      donationId: donation._id,
      donationTitle: donation.title,
      status: DonationStatus.WAITING_FOR_DELIVERY,
      message: `Driver assigned to "${donation.title}". Waiting for delivery.`,
    };

    // Notify donor and requester
    const userIds = [donation.donorId.toString()];
    if (donation.requestedBy) {
      userIds.push(donation.requestedBy.toString());
    }

    sendToUsers(io, userIds, "notification", notificationData);
    sendToPermission(io, "donations.approve", "notification", notificationData);

    // Track activity
    await trackDriverAssigned(
      driverId,
      donation._id.toString(),
      donation.title,
      donation.deliveryLocation?.city || "Unknown"
    );

    res.status(200).json({
      success: true,
      data: populatedDonation,
      message: "You have been assigned to this delivery. Waiting for admin approval.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Driver marks donation as in transit
 */
export const markInTransit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const driverId = req.user.userId;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if driver is assigned to this donation
    if (!donation.assignedDriverId || donation.assignedDriverId.toString() !== driverId) {
      return next(
        new AppError("You are not assigned to this donation", 403)
      );
    }

    // Check if donation is waiting for delivery
    if (donation.status !== DonationStatus.WAITING_FOR_DELIVERY) {
      return next(
        new AppError("Donation must be in waiting for delivery status before marking as in transit", 400)
      );
    }

    const oldStatus = donation.status;

    // Update status to in transit
    donation.status = DonationStatus.IN_TRANSIT;
    await donation.save();

    // Send real-time notifications
    notifyDonationChange("update", donation);

    const populatedDonation = await Donation.findById(donation._id)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("requestedBy", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("assignedDriverId", "firstName lastName email phone");

    // Send WebSocket notifications for specific notification banner
    const notificationData = {
      type: "donation_in_transit",
      donationId: donation._id,
      donationTitle: donation.title,
      status: DonationStatus.IN_TRANSIT,
      message: `Donation "${donation.title}" is now in transit`,
    };

    // Notify donor and requester
    const userIds = [donation.donorId.toString()];
    if (donation.requestedBy) {
      userIds.push(donation.requestedBy.toString());
    }

    sendToUsers(io, userIds, "notification", notificationData);

    // Notify all parties about status change
    await notifyDonationStatusChange({
      donationId: donation._id.toString(),
      donationTitle: donation.title,
      donorId: donation.donorId.toString(),
      receiverId: donation.requestedBy?.toString(),
      driverId,
      oldStatus,
      newStatus: DonationStatus.IN_TRANSIT,
    });

    // Track activity
    await trackDriverInTransit(driverId, donation._id.toString(), donation.title);

    res.status(200).json({
      success: true,
      data: populatedDonation,
      message: "Donation marked as in transit",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Driver marks donation as delivered
 */
export const markDelivered = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const driverId = req.user.userId;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if driver is assigned to this donation
    if (!donation.assignedDriverId || donation.assignedDriverId.toString() !== driverId) {
      return next(
        new AppError("You are not assigned to this donation", 403)
      );
    }

    // Check if donation is in transit
    if (donation.status !== DonationStatus.IN_TRANSIT) {
      return next(
        new AppError("Donation must be in transit before marking as delivered", 400)
      );
    }

    const oldStatus = donation.status;

    // Update status to delivered
    donation.status = DonationStatus.DELIVERED;
    donation.deliveredAt = new Date();
    await donation.save();

    // Update statistics (driver delivery count)
    await onDonationUpdate(donation._id.toString(), oldStatus, DonationStatus.DELIVERED, donation);

    // Send real-time notifications
    notifyDonationChange("update", donation);

    const populatedDonation = await Donation.findById(donation._id)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("requestedBy", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("assignedDriverId", "firstName lastName email phone");

    // Send WebSocket notifications for specific notification banner
    const notificationData = {
      type: "donation_delivered",
      donationId: donation._id,
      donationTitle: donation.title,
      status: DonationStatus.DELIVERED,
      message: `Donation "${donation.title}" has been delivered`,
    };

    // Notify donor and requester
    const userIds = [donation.donorId.toString()];
    if (donation.requestedBy) {
      userIds.push(donation.requestedBy.toString());
    }

    sendToUsers(io, userIds, "notification", notificationData);

    // Notify all parties about status change
    await notifyDonationStatusChange({
      donationId: donation._id.toString(),
      donationTitle: donation.title,
      donorId: donation.donorId.toString(),
      receiverId: donation.requestedBy?.toString(),
      driverId,
      oldStatus,
      newStatus: DonationStatus.DELIVERED,
    });

    // Track activity
    await trackDonationDelivered(driverId, donation._id.toString(), donation.title);

    res.status(200).json({
      success: true,
      data: populatedDonation,
      message: "Donation marked as delivered. Waiting for requester confirmation.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User marks donation as completed (requester only)
 */
export const markCompleted = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if user is the requester
    if (!donation.requestedBy || donation.requestedBy.toString() !== userId) {
      return next(
        new AppError("Only the requester can mark the donation as completed", 403)
      );
    }

    // Check if donation is ready to be completed
    // - If no delivery needed: must be APPROVED
    // - If delivery needed: must be DELIVERED
    const canComplete = 
      (!donation.needsDelivery && donation.status === DonationStatus.APPROVED) ||
      (donation.needsDelivery && donation.status === DonationStatus.DELIVERED);

    if (!canComplete) {
      return next(
        new AppError(
          donation.needsDelivery 
            ? "Donation must be delivered before marking as completed"
            : "Donation must be approved before marking as completed",
          400
        )
      );
    }

    // Update status to completed
    const oldStatus = donation.status;
    donation.status = DonationStatus.COMPLETED;
    await donation.save();

    // Update statistics
    await onDonationUpdate(donation._id.toString(), oldStatus, DonationStatus.COMPLETED, donation);

    // Send real-time notifications
    notifyDonationChange("update", donation);

    const populatedDonation = await Donation.findById(donation._id)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("requestedBy", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("assignedDriverId", "firstName lastName email phone");

    // Send WebSocket notifications for specific notification banner
    const notificationData = {
      type: "donation_completed",
      donationId: donation._id,
      donationTitle: donation.title,
      status: DonationStatus.COMPLETED,
      message: `Donation "${donation.title}" has been completed`,
    };

    // Notify donor, driver
    const userIds = [donation.donorId.toString()];
    if (donation.assignedDriverId) {
      userIds.push(donation.assignedDriverId.toString());
    }

    sendToUsers(io, userIds, "notification", notificationData);

    // Notify all parties about status change
    await notifyDonationStatusChange({
      donationId: donation._id.toString(),
      donationTitle: donation.title,
      donorId: donation.donorId.toString(),
      receiverId: userId,
      driverId: donation.assignedDriverId?.toString(),
      oldStatus,
      newStatus: DonationStatus.COMPLETED,
    });

    // Track activity
    await trackDonationCompleted(userId, donation._id.toString(), donation.title);

    res.status(200).json({
      success: true,
      data: populatedDonation,
      message: "Donation marked as completed. Thank you!",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User unassigns themselves from a donation (and driver if assigned)
 * Can only unassign until status reaches "waiting_for_delivery"
 */
export const unassignRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if user is the requester
    if (!donation.requestedBy || donation.requestedBy.toString() !== userId) {
      return next(
        new AppError("Only the requester can unassign themselves from this donation", 403)
      );
    }

    // Check status - can only unassign when status is REQUESTED
    // Cannot unassign if approved, waiting for delivery, in transit, delivered, or completed
    if (donation.status !== DonationStatus.REQUESTED) {
      return next(
        new AppError("Cannot unassign from donation after it has been approved", 400)
      );
    }

    const oldStatus = donation.status;
    
    // Store driver ID before clearing for notification
    const driverId = donation.assignedDriverId?.toString();

    // Unassign requester and driver
    donation.requestedBy = undefined;
    donation.requestedAt = undefined;
    donation.assignedDriverId = undefined;
    donation.deliveryLocation = undefined;
    donation.needsDelivery = false;
    donation.status = DonationStatus.PENDING;
    await donation.save();

    // Send real-time notifications
    notifyDonationChange("update", donation);

    // Notify all parties
    await notifyDonationStatusChange({
      donationId: donation._id.toString(),
      donationTitle: donation.title,
      donorId: donation.donorId.toString(),
      receiverId: userId,
      driverId,
      oldStatus,
      newStatus: DonationStatus.PENDING,
    });

    const populatedDonation = await Donation.findById(donation._id)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus");

    res.status(200).json({
      success: true,
      data: populatedDonation,
      message: "Successfully unassigned from donation",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Driver unassigns themselves from a delivery
 * Can only unassign when status is "approved" or "waiting_for_delivery"
 */
export const unassignDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const driverId = req.user.userId;

    const donation = await Donation.findById(id);

    if (!donation) {
      return next(new AppError("Donation not found", 404));
    }

    // Check if user is the assigned driver
    if (!donation.assignedDriverId || donation.assignedDriverId.toString() !== driverId) {
      return next(
        new AppError("You are not assigned to this delivery", 403)
      );
    }

    // Check status - can only unassign if waiting for delivery
    // Cannot unassign if in transit, delivered, or completed
    if (donation.status !== DonationStatus.WAITING_FOR_DELIVERY) {
      return next(
        new AppError("Cannot unassign from delivery once it's in transit, delivered, or completed", 400)
      );
    }

    const oldStatus = donation.status;

    // Unassign driver and revert status to approved
    donation.assignedDriverId = undefined;
    donation.status = DonationStatus.APPROVED;
    await donation.save();

    // Send real-time notifications
    notifyDonationChange("update", donation);

    // Notify all parties
    await notifyDonationStatusChange({
      donationId: donation._id.toString(),
      donationTitle: donation.title,
      donorId: donation.donorId.toString(),
      receiverId: donation.requestedBy?.toString(),
      driverId,
      oldStatus,
      newStatus: donation.status,
    });

    const populatedDonation = await Donation.findById(donation._id)
      .populate("donorId", "firstName lastName email phone profileImage profileCompletionStatus")
      .populate("requestedBy", "firstName lastName email phone profileImage profileCompletionStatus");

    res.status(200).json({
      success: true,
      data: populatedDonation,
      message: "Successfully unassigned from delivery",
    });
  } catch (error) {
    next(error);
  }
};
