import { Injectable, signal } from '@angular/core';
import { Notification } from './types';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  readonly notifications = signal<Notification[]>([]);

  readonly toasts = signal<Array<Notification & { duration?: number }>>([]);

  constructor() {}

  addNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    const newNotif: Notification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    this.notifications.update(current => [newNotif, ...current]);

    this.showToast(newNotif);
  }

  showToast(notif: Notification) {
    const toastItem = {
      ...notif,
      duration: 4000
    };

    this.toasts.update(current => [...current, toastItem]);

    setTimeout(() => {
      this.removeToast(toastItem.id);
    }, 4000);
  }

  removeToast(id: string) {
    this.toasts.update(current =>
      current.filter(t => t.id !== id)
    );
  }

  markAsRead(id: string) {
    this.notifications.update(current =>
      current.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }

  markAllAsRead() {
    this.notifications.update(current =>
      current.map(notification => ({
        ...notification,
        isRead: true
      }))
    );
  }

  clearAll() {
    this.notifications.set([]);
  }
}