// Notification service for managing in-app notifications and SMS
import { smsService } from './sms';

const API_URL = 'http://localhost:3001';

interface Notification {
  id: number;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  type: 'request' | 'approval' | 'system';
}

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: 'request' | 'approval' | 'system';
}

class NotificationService {
  private subscribers: ((notification: Notification) => void)[] = [];

  /**
   * Create a new notification
   */
  async createNotification(payload: NotificationPayload): Promise<Notification> {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const newNotification = await response.json();

    // Notify subscribers (for real-time updates)
    this.subscribers.forEach(callback => callback(newNotification));

    return newNotification;
  }

  /**
   * Handle new request submission
   */
  async handleNewRequest(
    employeeName: string,
    requestType: string,
    managerMobile: string,
    managerId: string
  ): Promise<void> {
    // Create in-app notification
    await this.createNotification({
      userId: managerId,
      title: 'درخواست جدید',
      body: `${employeeName} درخواست ${requestType} ارسال کرده است`,
      type: 'request',
    });

    // Send SMS notification
    try {
      // @ts-ignore
      await smsService.sendNewRequestNotification(managerMobile, employeeName, requestType);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  /**
   * Handle request approval/rejection
   */
  async handleRequestStatusChange(
    employeeName: string,
    requestType: string,
    status: 'approved' | 'rejected',
    employeeMobile: string,
    employeeId: string
  ): Promise<void> {
    // Create in-app notification
    await this.createNotification({
      userId: employeeId,
      title: status === 'approved' ? 'درخواست تایید شد' : 'درخواست رد شد',
      body: `درخواست ${requestType} شما ${status === 'approved' ? 'تایید' : 'رد'} شد`,
      type: 'approval',
    });

    // Send SMS notification
    try {
      // @ts-ignore
      await smsService.sendRequestStatusNotification(employeeMobile, employeeName, status);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  /**
   * Subscribe to new notifications
   */
  subscribe(callback: (notification: Notification) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    const response = await fetch(`${API_URL}/notifications?userId=${userId}`);
    const notifications = await response.json();
    return notifications;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;