import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, Order, Medicine, SupportTicket, OrderTimelineEvent } from './types';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { MedicineService } from './medicine.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly medicineService = inject(MedicineService);

  readonly cart = signal<CartItem[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly supportTickets = signal<SupportTicket[]>([]);

  readonly cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.medicine.price * item.quantity, 0),
  );
  readonly cartItemCount = computed(() =>
    this.cart().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly cartRequiresPrescription = computed(() =>
    this.cart().some((item) => item.medicine.isPrescriptionRequired),
  );

  addToCart(medicine: Medicine, quantity: number) {
    // Custom Validation: Check Stock
    if (medicine.stock <= 0) {
      this.notifications.addNotification(
        'Add to Cart Failed',
        `Sorry, ${medicine.name} is currently out of stock.`,
        'error',
      );
      return;
    }

    const limit = medicine.isPrescriptionRequired ? 5 : 30;

    const currentCart = this.cart();
    const existingIdx = currentCart.findIndex((item) => item.medicine.id === medicine.id);

    if (existingIdx !== -1) {
      // Custom Validation- Duplicate medicine restriction with quantity limit
      const newQty = currentCart[existingIdx].quantity + quantity;
      if (newQty > limit) {
        this.notifications.addNotification(
          'Quantity Limit Reached',
          `Restricted medicines are limited to ${limit} units per order. You currently have ${currentCart[existingIdx].quantity} in cart.`,
          'warning',
        );
        return;
      }
      currentCart[existingIdx].quantity = newQty;
      this.cart.set([...currentCart]);
    } else {
      if (quantity > limit) {
        this.notifications.addNotification(
          'Quantity Limit Reached',
          `This item is limited to a maximum of ${limit} units per order.`,
          'warning',
        );
        return;
      }
      this.cart.set([...currentCart, { medicine, quantity }]);
    }

    this.notifications.addNotification(
      'Added to Cart',
      `${medicine.name} has been added to your shopping cart.`,
      'success',
    );
  }

  updateCartQuantity(medicineId: string, quantity: number) {
    const currentCart = this.cart();
    const item = currentCart.find((i) => i.medicine.id === medicineId);
    if (!item) return;

    const limit = item.medicine.isPrescriptionRequired ? 5 : 30;
    if (quantity > limit) {
      this.notifications.addNotification(
        'Limit Exceeded',
        `Quantity limit for this item is ${limit} units.`,
        'warning',
      );
      return;
    }

    if (quantity <= 0) {
      this.removeFromCart(medicineId);
    } else {
      item.quantity = quantity;
      this.cart.set([...currentCart]);
    }
  }

  removeFromCart(medicineId: string) {
    this.cart.update((current) => current.filter((item) => item.medicine.id !== medicineId));
    this.notifications.addNotification('Removed from Cart', 'Item removed from your cart.', 'info');
  }

  clearCart() {
    this.cart.set([]);
  }

  checkout(
    shippingAddress: {
      fullName: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
    },
    deliverySlot: string,
    prescriptionFile: { name: string; size: number; base64?: string } | null,
  ): Order | null {
    const user = this.auth.currentUser();
    if (!user) return null;

    const cartItems = this.cart();
    if (cartItems.length === 0) return null;

    const requiresRx = this.cartRequiresPrescription();
    if (requiresRx && !prescriptionFile) {
      this.notifications.addNotification(
        'Checkout Blocked',
        "Your order contains prescription-only medicines. Please upload a valid doctor's prescription.",
        'error',
      );
      return null;
    }

    const orderId = 'ord-' + Math.floor(100 + Math.random() * 900);

    const initialStatus: Order['status'] = requiresRx ? 'pending_verification' : 'accepted';

    const newOrder: Order = {
      id: orderId,
      customerId: user.id,
      customerName: user.profile?.name || user.email,
      items: [...cartItems],
      total: this.cartTotal(),
      shippingAddress: shippingAddress,
      status: initialStatus,
      deliverySlot: deliverySlot,
      prescriptionUrl: prescriptionFile
        ? prescriptionFile.base64 || 'assets/mock-prescriptions/upload.pdf'
        : undefined,
      prescriptionName: prescriptionFile ? prescriptionFile.name : undefined,
      timeline: [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          comment: requiresRx
            ? 'Prescription uploaded. Awaiting verification by the pharmacist.'
            : 'Order placed. Checkout confirmed automatically for OTC products.',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    if (!requiresRx) {
      newOrder.timeline.push({
        status: 'accepted',
        timestamp: new Date().toISOString(),
        comment: 'Stock confirmed. Preparing order for packaging.',
      });
    }

    cartItems.forEach((item) => {
      this.medicineService.adjustStock(item.medicine.id, -item.quantity);
    });

    this.orders.update(current => [newOrder, ...current]);

    this.notifications.addNotification(
      'Order Placed',
      `Order ${orderId} has been successfully submitted! Status: ${newOrder.status}`,
      'success',
    );

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status'], comment?: string) {
    const currentOrders = this.orders();
    const orderIdx = currentOrders.findIndex((o) => o.id === orderId);

    if (orderIdx !== -1) {
      const order = currentOrders[orderIdx];
      const newTimelineEvent: OrderTimelineEvent = {
        status,
        timestamp: new Date().toISOString(),
        comment: comment || `Status updated to ${status}`,
      };

      const updatedOrder: Order = {
        ...order,
        status,
        timeline: [...order.timeline, newTimelineEvent],
      };

      const updated = [...currentOrders];
      updated[orderIdx] = updatedOrder;
      this.orders.set(updated);

      this.notifications.addNotification(
        'Order Status Update',
        `Your order ${orderId} is now: ${status.toUpperCase().replace('_', ' ')}. ${comment || ''}`,
        status === 'rejected' || status === 'canceled' ? 'warning' : 'success',
      );
    }
  }

  createSupportTicket(subject: string, message: string) {
    const user = this.auth.currentUser();
    if (!user) return;

    const newTicket: SupportTicket = {
      id: 'tkt-' + Math.floor(100 + Math.random() * 900),
      customerId: user.id,
      customerName: user.profile?.name || user.email,
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    this.supportTickets.update(current => [newTicket, ...current]);

    this.notifications.addNotification(
      'Support Ticket Opened',
      `Your query "${subject}" has been submitted. A support representative will respond shortly.`,
      'info',
    );
  }

  respondToSupportTicket(ticketId: string, response: string) {
    const currentTickets = this.supportTickets();
    const idx = currentTickets.findIndex((t) => t.id === ticketId);

    if (idx !== -1) {
      const updatedTicket: SupportTicket = {
        ...currentTickets[idx],
        status: 'resolved',
        response,
      };

      const updated = [...currentTickets];
      updated[idx] = updatedTicket;
     this.supportTickets.set(updated);

      this.notifications.addNotification(
        'Support Ticket Answered',
        `Admin responded to ticket ${ticketId}: "${response.substring(0, 40)}..."`,
        'success',
      );
    }
  }
}
