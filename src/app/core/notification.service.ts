import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Notification } from './types';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:3000/notifications';

  readonly notifications = signal<Notification[]>([]);

  readonly toasts = signal<Array<Notification & { duration?: number }>>([]);

  constructor() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.http.get<Notification[]>(this.API_URL).subscribe((data) => {
      this.notifications.set(data);
    });
  }

  addNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ) {
    const newNotif: Notification = {
      id: 'notif-' + Math.floor(100000 + Math.random() * 900000),

      title,

      message,

      type,

      timestamp: new Date().toISOString(),

      isRead: false,
    };

    this.http.post<Notification>(this.API_URL, newNotif).subscribe((savedNotification) => {
      this.notifications.update((current) => [savedNotification, ...current]);

      this.showToast(savedNotification);
    });
  }

  showToast(notif: Notification) {
    const toastItem = {
      ...notif,

      duration: 4000,
    };

    this.toasts.update((current) => [...current, toastItem]);

    setTimeout(() => {
      this.removeToast(toastItem.id);
    }, 4000);
  }

  removeToast(id: string) {
    this.toasts.update((current) => current.filter((toast) => toast.id !== id));
  }

  markAsRead(id: string) {
    this.http
      .patch<Notification>(`${this.API_URL}/${id}`, {
        isRead: true,
      })
      .subscribe(() => {
        this.notifications.update((current) =>
          current.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification,
          ),
        );
      });
  }

  markAllAsRead() {
    this.notifications().forEach((notification) => {
      this.http
        .patch(`${this.API_URL}/${notification.id}`, {
          isRead: true,
        })
        .subscribe();
    });

    this.notifications.update((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
  }

  clearAll() {
    this.notifications().forEach((notification) => {
      this.http.delete(`${this.API_URL}/${notification.id}`).subscribe();
    });

    this.notifications.set([]);
  }
}
