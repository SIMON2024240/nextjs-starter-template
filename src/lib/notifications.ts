import type { Notification, BookingRequest, UserRole } from '@/types';
import { notificationDB, userDB } from '@/lib/database';

export interface NotificationTemplate {
  title: string;
  message: string;
  type: Notification['type'];
}

// Notification templates
const NOTIFICATION_TEMPLATES = {
  NEW_REQUEST: (requesterName: string, venue: string): NotificationTemplate => ({
    title: 'New Booking Request',
    message: `${requesterName} has submitted a new booking request for ${venue}`,
    type: 'info',
  }),

  REQUEST_ROUTED: (venue: string): NotificationTemplate => ({
    title: 'Request Routed for Approval',
    message: `Your booking request for ${venue} has been routed to the Soft Service Manager for approval`,
    type: 'info',
  }),

  REQUEST_APPROVED: (venue: string, eventDate: string): NotificationTemplate => ({
    title: 'Booking Request Approved',
    message: `Your booking request for ${venue} on ${eventDate} has been approved`,
    type: 'success',
  }),

  REQUEST_REJECTED: (venue: string, reason?: string): NotificationTemplate => ({
    title: 'Booking Request Rejected',
    message: `Your booking request for ${venue} has been rejected${reason ? `: ${reason}` : ''}`,
    type: 'error',
  }),

  APPROVAL_NEEDED: (requesterName: string, venue: string): NotificationTemplate => ({
    title: 'Approval Required',
    message: `Booking request from ${requesterName} for ${venue} requires your approval`,
    type: 'warning',
  }),

  USER_CREATED: (userName: string, role: string): NotificationTemplate => ({
    title: 'New User Account Created',
    message: `A new ${role} account has been created for ${userName}`,
    type: 'info',
  }),

  USER_DEACTIVATED: (userName: string): NotificationTemplate => ({
    title: 'User Account Deactivated',
    message: `User account for ${userName} has been deactivated`,
    type: 'warning',
  }),
} as const;

// Send notification to specific user
export const sendNotification = (
  userId: string,
  template: NotificationTemplate,
  relatedRequestId?: string
): Notification => {
  const notification = notificationDB.create({
    userId,
    title: template.title,
    message: template.message,
    type: template.type,
    read: false,
    relatedRequestId,
  });

  // Send browser notification if permission granted
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(template.title, {
        body: template.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  }

  return notification;
};

// Send notification to users by role
export const sendNotificationToRole = (
  role: UserRole,
  template: NotificationTemplate,
  relatedRequestId?: string
): Notification[] => {
  const users = userDB.getAll().filter(user => user.role === role && user.isActive);
  return users.map(user => sendNotification(user.id, template, relatedRequestId));
};

// Send notification to multiple users
export const sendNotificationToUsers = (
  userIds: string[],
  template: NotificationTemplate,
  relatedRequestId?: string
): Notification[] => {
  return userIds.map(userId => sendNotification(userId, template, relatedRequestId));
};

// Workflow-specific notification functions
export const notifyNewRequest = (request: BookingRequest): void => {
  const template = NOTIFICATION_TEMPLATES.NEW_REQUEST(
    request.requesterInfo.name,
    request.eventDetails.venueRequested
  );
  
  // Notify all help desk staff
  sendNotificationToRole('helpdesk', template, request.id);
};

export const notifyRequestRouted = (request: BookingRequest): void => {
  // Notify requester
  const requesterUser = userDB.getByEmail(request.requesterInfo.email);
  if (requesterUser) {
    const requesterTemplate = NOTIFICATION_TEMPLATES.REQUEST_ROUTED(
      request.eventDetails.venueRequested
    );
    sendNotification(requesterUser.id, requesterTemplate, request.id);
  }

  // Notify managers
  const managerTemplate = NOTIFICATION_TEMPLATES.APPROVAL_NEEDED(
    request.requesterInfo.name,
    request.eventDetails.venueRequested
  );
  sendNotificationToRole('manager', managerTemplate, request.id);
};

export const notifyRequestApproved = (request: BookingRequest): void => {
  // Notify requester
  const requesterUser = userDB.getByEmail(request.requesterInfo.email);
  if (requesterUser) {
    const template = NOTIFICATION_TEMPLATES.REQUEST_APPROVED(
      request.eventDetails.venueRequested,
      request.eventDetails.eventScheduleStartDate
    );
    sendNotification(requesterUser.id, template, request.id);
  }

  // Notify help desk
  const helpdeskTemplate = NOTIFICATION_TEMPLATES.REQUEST_APPROVED(
    request.eventDetails.venueRequested,
    request.eventDetails.eventScheduleStartDate
  );
  sendNotificationToRole('helpdesk', helpdeskTemplate, request.id);
};

export const notifyRequestRejected = (request: BookingRequest, reason?: string): void => {
  // Notify requester
  const requesterUser = userDB.getByEmail(request.requesterInfo.email);
  if (requesterUser) {
    const template = NOTIFICATION_TEMPLATES.REQUEST_REJECTED(
      request.eventDetails.venueRequested,
      reason
    );
    sendNotification(requesterUser.id, template, request.id);
  }

  // Notify help desk
  const helpdeskTemplate = NOTIFICATION_TEMPLATES.REQUEST_REJECTED(
    request.eventDetails.venueRequested,
    reason
  );
  sendNotificationToRole('helpdesk', helpdeskTemplate, request.id);
};

export const notifyUserCreated = (userName: string, role: string): void => {
  const template = NOTIFICATION_TEMPLATES.USER_CREATED(userName, role);
  sendNotificationToRole('admin', template);
};

export const notifyUserDeactivated = (userName: string): void => {
  const template = NOTIFICATION_TEMPLATES.USER_DEACTIVATED(userName);
  sendNotificationToRole('admin', template);
};

// Request browser notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Get unread notification count for user
export const getUnreadCount = (userId: string): number => {
  const notifications = notificationDB.getByUserId(userId);
  return notifications.filter(notification => !notification.read).length;
};

// Mark all notifications as read for user
export const markAllAsRead = (userId: string): void => {
  const notifications = notificationDB.getByUserId(userId);
  notifications.forEach(notification => {
    if (!notification.read) {
      notificationDB.markAsRead(notification.id);
    }
  });
};
