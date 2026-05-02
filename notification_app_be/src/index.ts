export interface Notification {
  id: string;
  vehicleId: string;
  userId: string;
  type: 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'failed';
  scheduledFor: Date;
  sentAt?: Date;
  message: string;
}

export interface NotificationPreference {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}

export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreference> = new Map();

  createNotification(notification: Notification): Notification {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  getNotificationsByUserId(userId: string): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }

  updateNotificationStatus(id: string, status: Notification['status']): boolean {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    notification.status = status;
    if (status === 'sent') {
      notification.sentAt = new Date();
    }
    return true;
  }

  deleteNotification(id: string): boolean {
    return this.notifications.delete(id);
  }

  setPreference(preference: NotificationPreference): void {
    this.preferences.set(preference.userId, preference);
  }

  getPreference(userId: string): NotificationPreference | undefined {
    return this.preferences.get(userId);
  }
}

export const notificationService = new NotificationService();