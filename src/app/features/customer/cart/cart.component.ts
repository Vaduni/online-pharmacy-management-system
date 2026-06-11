import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/order.service';
import { CartItem } from '../../../core/types';

@Component({
  selector: 'app-customer-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CustomerCartComponent {
  private orderService = inject(OrderService);

  readonly cart = this.orderService.cart;
  readonly cartTotal = this.orderService.cartTotal;
  readonly requiresRx = this.orderService.cartRequiresPrescription;

  updateQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    this.orderService.updateCartQuantity(item.medicine.id, newQty);
  }

  removeItem(medicineId: string) {
    this.orderService.removeFromCart(medicineId);
  }

  clearCart() {
    this.orderService.clearCart();
  }
}