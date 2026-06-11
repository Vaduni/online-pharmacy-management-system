import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrders {

  private orderService = inject(OrderService);


  readonly orders = computed((): any[] =>
    this.orderService.orders() as any[]
  );

  updateStatus(id: string) {

    const order = this.orders().find(o => o.id === id);

    if (!order) return;

    let nextStatus = order.status;

    switch (order.status) {

      case 'pending_verification':
        nextStatus = 'accepted';
        break;

      case 'accepted':
        nextStatus = 'packed';
        break;

      case 'packed':
        nextStatus = 'shipped';
        break;

      case 'shipped':
        nextStatus = 'delivered';
        break;

      default:
        return;
    }

    this.orderService.updateOrderStatus(id, nextStatus);
  }
}