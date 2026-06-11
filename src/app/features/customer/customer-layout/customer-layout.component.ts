import { Component, inject, signal,computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { OrderService } from '../../../core/order.service';
import { NotificationService } from '../../../core/notification.service';


@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css'],
})
export class CustomerLayoutComponent {
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private notifService = inject(NotificationService);

  readonly currentUser = this.auth.currentUser;
  readonly cartCount = this.orderService.cartItemCount;
  readonly notifications = this.notifService.notifications;
  
  readonly unreadCount = computed(() => 
    this.notifications().filter(n => !n.isRead).length
  );
  
  readonly showNotifDropdown = signal(false);
readonly sidebarCollapsed = signal(false);

toggleSidebar() {
  this.sidebarCollapsed.update(v => !v);
}

  userInitials() {
    const user = this.currentUser() as any;
    const name = user?.profile?.name || user?.name || '';
    if (!name) return 'C';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  toggleNotifDropdown() {
    this.showNotifDropdown.update(v => !v);
  }

  markAsRead(id: string) {
    this.notifService.markAsRead(id);
  }

  markAllAsRead() {
    this.notifService.markAllAsRead();
  }

  logout() {
    this.auth.logout();
  }
}