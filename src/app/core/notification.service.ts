import { Injectable, signal } from '@angular/core';
import { Notification } from './types';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly notifications = signal<Notification[]>([]);
  
  readonly toasts = signal<Array<Notification & { duration?: number }>>([]);

  constructor() {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        this.notifications.set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notifications from localStorage', e);
      }
    }
  }

  addNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const newNotif: Notification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const updated = [newNotif, ...this.notifications()];
    this.notifications.set(updated);
    this.saveToStorage(updated);

    this.showToast(newNotif);
  }

  showToast(notif: Notification) {
    const toastItem = { ...notif, duration: 4000 };
    this.toasts.update(current => [...current, toastItem]);

    setTimeout(() => {
      this.removeToast(toastItem.id);
    }, 4000);
  }

  removeToast(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  markAsRead(id: string) {
    const updated = this.notifications().map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    this.notifications.set(updated);
    this.saveToStorage(updated);
  }

  markAllAsRead() {
    const updated = this.notifications().map(n => ({ ...n, isRead: true }));
    this.notifications.set(updated);
    this.saveToStorage(updated);
  }

  clearAll() {
    this.notifications.set([]);
    this.saveToStorage([]);
  }

  private saveToStorage(items: Notification[]) {
    localStorage.setItem('notifications', JSON.stringify(items));
  }
}