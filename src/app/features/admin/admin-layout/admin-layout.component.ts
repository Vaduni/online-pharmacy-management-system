import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { OrderService } from '../../../core/order.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
   templateUrl: './admin-layout.component.html',

  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private orderService = inject(OrderService);

  readonly currentUser = this.auth.currentUser;
  
  readonly pendingPrescriptionsCount = computed(() => 
    this.orderService.orders().filter(o => o.status === 'pending_verification').length
  );


  logout() {
    this.auth.logout();
  }
}
