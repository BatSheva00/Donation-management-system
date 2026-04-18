import { Request } from "./request.model";
import { NotificationType, RequestStatus } from "../../shared/types/enums";
import {
  sendNotificationToUser,
  sendNotificationToRole,
} from "../notifications/notification.service";
import { logger } from "../../config/logger";

// Map request status to notification type
function getNotificationTypeForStatus(status: RequestStatus): string {
  const mapping: Record<RequestStatus, string> = {
    [RequestStatus.PENDING]: NotificationType.REQUEST_CREATED,
    [RequestStatus.APPROVED]: NotificationType.REQUEST_APPROVED,
    [RequestStatus.REJECTED]: NotificationType.REQUEST_REJECTED,
    [RequestStatus.FULFILLED]: NotificationType.REQUEST_FULFILLED,
    [RequestStatus.WAITING_FOR_DELIVERY]: NotificationType.REQUEST_FULFILLED,
    [RequestStatus.IN_TRANSIT]: NotificationType.REQUEST_IN_TRANSIT,
    [RequestStatus.DELIVERED]: NotificationType.REQUEST_DELIVERED,
    [RequestStatus.COMPLETED]: NotificationType.REQUEST_COMPLETED,
    [RequestStatus.CANCELLED]: "system",
  };

  return mapping[status] || "system";
}

// Send notification when a new request is created
export async function sendRequestCreatedNotification(requestId: string) {
  try {
    const request = await Request.findById(requestId)
      .populate("requesterId", "name")
      .lean();

    if (!request) return;

    // Notify admins
    await sendNotificationToRole("admin", {
      type: NotificationType.REQUEST_CREATED,
      title: "New Request",
      message: `New request: ${request.title}`,
      data: {
        requestId: requestId,
        requesterId: request.requesterId._id,
        link: `/admin/requests/${requestId}`,
      },
    });
  } catch (error) {
    logger.error("Error sending request created notification:", error);
  }
}

// Send notification when request status changes
export async function sendRequestStatusNotification(
  requestId: string,
  oldStatus: RequestStatus,
  newStatus: RequestStatus
) {
  try {
    const request = await Request.findById(requestId)
      .populate("requesterId", "name _id")
      .populate("fulfilledBy", "name _id")
      .populate("assignedDriverId", "name _id")
      .lean();

    if (!request) return;

    const notificationType = getNotificationTypeForStatus(newStatus);

    // Determine notification messages based on status
    const statusMessages: Record<
      RequestStatus,
      { title: string; message: string }
    > = {
      [RequestStatus.PENDING]: {
        title: "Request Pending",
        message: "Request is pending approval",
      },
      [RequestStatus.APPROVED]: {
        title: "Request Approved",
        message: "Your request has been approved",
      },
      [RequestStatus.REJECTED]: {
        title: "Request Rejected",
        message: "Your request has been rejected",
      },
      [RequestStatus.FULFILLED]: {
        title: "Request Fulfilled",
        message: `Your request "${request.title}" has been fulfilled`,
      },
      [RequestStatus.WAITING_FOR_DELIVERY]: {
        title: "Waiting for Delivery",
        message: `Request "${request.title}" is waiting for delivery`,
      },
      [RequestStatus.IN_TRANSIT]: {
        title: "In Transit",
        message: `Request "${request.title}" is in transit`,
      },
      [RequestStatus.DELIVERED]: {
        title: "Delivered",
        message: `Request "${request.title}" has been delivered`,
      },
      [RequestStatus.COMPLETED]: {
        title: "Request Completed",
        message: `Request "${request.title}" has been completed`,
      },
      [RequestStatus.CANCELLED]: {
        title: "Request Cancelled",
        message: `Request "${request.title}" has been cancelled`,
      },
    };

    const { title, message } = statusMessages[newStatus];

    // Notify relevant parties based on status change
    switch (newStatus) {
      case RequestStatus.APPROVED:
      case RequestStatus.REJECTED:
        // Notify requester
        await sendNotificationToUser(request.requesterId._id.toString(), {
          type: notificationType,
          title,
          message,
          data: {
            requestId,
            oldStatus,
            newStatus,
            link: `/requests/${requestId}`,
          },
        });
        break;

      case RequestStatus.FULFILLED:
      case RequestStatus.WAITING_FOR_DELIVERY:
        // Notify requester
        await sendNotificationToUser(request.requesterId._id.toString(), {
          type: notificationType,
          title,
          message,
          data: {
            requestId,
            fulfilledBy: request.fulfilledBy?._id,
            link: `/requests/${requestId}`,
          },
        });
        // Notify admins
        await sendNotificationToRole("admin", {
          type: notificationType,
          title,
          message: `Request "${request.title}" has been fulfilled`,
          data: {
            requestId,
            fulfilledBy: request.fulfilledBy?._id,
            link: `/admin/requests/${requestId}`,
          },
        });
        break;

      case RequestStatus.IN_TRANSIT:
      case RequestStatus.DELIVERED:
        // Notify requester
        await sendNotificationToUser(request.requesterId._id.toString(), {
          type: notificationType,
          title,
          message,
          data: {
            requestId,
            link: `/requests/${requestId}`,
          },
        });
        // Notify fulfiller
        if (request.fulfilledBy) {
          await sendNotificationToUser(request.fulfilledBy._id.toString(), {
            type: notificationType,
            title,
            message,
            data: {
              requestId,
              link: `/requests/${requestId}`,
            },
          });
        }
        break;

      case RequestStatus.COMPLETED:
        // Notify fulfiller
        if (request.fulfilledBy) {
          await sendNotificationToUser(request.fulfilledBy._id.toString(), {
            type: notificationType,
            title,
            message,
            data: {
              requestId,
              link: `/requests/${requestId}`,
            },
          });
        }
        // Notify driver
        if (request.assignedDriverId) {
          await sendNotificationToUser(
            request.assignedDriverId._id.toString(),
            {
              type: notificationType,
              title,
              message,
              data: {
                requestId,
                link: `/requests/${requestId}`,
              },
            }
          );
        }
        break;

      case RequestStatus.CANCELLED:
        // Notify fulfiller
        if (request.fulfilledBy) {
          await sendNotificationToUser(request.fulfilledBy._id.toString(), {
            type: notificationType,
            title,
            message,
            data: {
              requestId,
              link: `/requests/${requestId}`,
            },
          });
        }
        // Notify driver
        if (request.assignedDriverId) {
          await sendNotificationToUser(
            request.assignedDriverId._id.toString(),
            {
              type: notificationType,
              title,
              message,
              data: {
                requestId,
                link: `/requests/${requestId}`,
              },
            }
          );
        }
        // Notify admins
        await sendNotificationToRole("admin", {
          type: notificationType,
          title,
          message: `Request "${request.title}" has been cancelled`,
          data: {
            requestId,
            link: `/admin/requests/${requestId}`,
          },
        });
        break;
    }

    // Special notification when driver assigns
    if (
      newStatus === RequestStatus.WAITING_FOR_DELIVERY &&
      request.assignedDriverId &&
      oldStatus === RequestStatus.WAITING_FOR_DELIVERY
    ) {
      // Notify requester
      await sendNotificationToUser(request.requesterId._id.toString(), {
        type: NotificationType.REQUEST_ASSIGNED,
        title: "Driver Assigned",
        message: `Driver assigned to request "${request.title}"`,
        data: {
          requestId,
          driverId: request.assignedDriverId._id,
          link: `/requests/${requestId}`,
        },
      });
      // Notify fulfiller
      if (request.fulfilledBy) {
        await sendNotificationToUser(request.fulfilledBy._id.toString(), {
          type: NotificationType.REQUEST_ASSIGNED,
          title: "Driver Assigned",
          message: `Driver assigned to request "${request.title}"`,
          data: {
            requestId,
            driverId: request.assignedDriverId._id,
            link: `/requests/${requestId}`,
          },
        });
      }
    }
  } catch (error) {
    logger.error("Error sending request status notification:", error);
  }
}
