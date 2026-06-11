import { Component, inject, computed,OnInit,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/order.service';
import { AuthService } from '../../../core/auth.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, StatusBadgePipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class CustomerOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private auth = inject(AuthService);

  readonly customerOrders = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return [];
    return this.orderService.orders().filter(o => o.customerId === user.id);
  });

  readonly selectedOrderId = signal<string | null>(null);

  readonly selectedOrder = computed(() => {
    const id = this.selectedOrderId();
    if (!id) return null;
    return this.customerOrders().find(o => o.id === id) || null;
  });

  ngOnInit() {
    const orders = this.customerOrders();
    if (orders.length > 0) {
      this.selectedOrderId.set(orders[0].id);
    }
  }

  selectOrder(id: string) {
    this.selectedOrderId.set(id);
  }

  countItems(order: any): number {
    return order.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
  }
}