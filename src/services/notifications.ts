// Notification service for managing in-app notifications and SMS
import { smsService } from './sms';
import db from '../lib/db';

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
    const { userId, title, body, type } = payload;
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(
      'INSERT INTO notifications (userId, title, body, isRead, createdAt, type) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(userId, title, body, 0, createdAt, type);

    const newNotification: Notification = {
      id: result.lastInsertRowid as number,
      userId,
      title,
      body,
      isRead: false,
      createdAt,
      type,
    };

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
  getNotifications(userId: string): Notification[] {
    const stmt = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC');
    const notifications = stmt.all(userId);
    return notifications.map(n => ({ ...n, isRead: n.isRead === 1 })) as Notification[];
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: number): void {
    const stmt = db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ?');
    stmt.run(notificationId);
  }
}

export const notificationService = new NotificationService();
export default notificationService;