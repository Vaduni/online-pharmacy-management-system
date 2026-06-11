import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/order.service';

@Component({
  selector: 'app-admin-support',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-support.html',
  styleUrl: './admin-support.css'
})
export class AdminSupport {

  private orderService = inject(OrderService);

  readonly tickets = computed(() =>
    this.orderService.supportTickets()
  );

  reply(ticketId: string) {

    const response = prompt('Enter response for customer');

    if (!response?.trim()) return;

    this.orderService.respondToSupportTicket(
      ticketId,
      response
    );
  }
}