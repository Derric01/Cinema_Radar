import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private notificationId = 0;

  get notifications$(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 5000,
    action?: { label: string; handler: () => void }
  ): string {
    const id = `notification-${++this.notificationId}`;
    const notification: Notification = {
      id,
      message,
      type,
      duration,
      action
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  success(message: string, duration?: number, action?: { label: string; handler: () => void }): string {
    return this.show(message, 'success', duration, action);
  }

  error(message: string, duration?: number, action?: { label: string; handler: () => void }): string {
    return this.show(message, 'error', duration, action);
  }

  warning(message: string, duration?: number, action?: { label: string; handler: () => void }): string {
    return this.show(message, 'warning', duration, action);
  }

  info(message: string, duration?: number, action?: { label: string; handler: () => void }): string {
    return this.show(message, 'info', duration, action);
  }

  dismiss(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  dismissAll(): void {
    this.notificationsSubject.next([]);
  }
}
