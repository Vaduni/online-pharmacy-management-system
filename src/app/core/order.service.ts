import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CartItem, Order, Medicine, SupportTicket } from './types';

import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { MedicineService } from './medicine.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);

  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly medicineService = inject(MedicineService);

  private readonly API_URL = 'http://localhost:3000';

  readonly cart = signal<CartItem[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly supportTickets = signal<SupportTicket[]>([]);

  constructor() {
    this.loadOrders();
    this.loadSupportTickets();
    this.loadCart();
  }

  loadOrders() {
    this.http.get<Order[]>(`${this.API_URL}/orders`).subscribe((data) => {
      this.orders.set(data);
    });
  }

  loadSupportTickets() {
    this.http.get<SupportTicket[]>(`${this.API_URL}/supportTickets`).subscribe((data) => {
      this.supportTickets.set(data);
    });
  }
  loadCart() {
    const user = this.auth.currentUser();

    if (!user) return;

    this.http.get<any[]>(`${this.API_URL}/cart?userId=${user.id}`).subscribe((cartData) => {
      if (cartData.length > 0) {
        this.cart.set(cartData[0].items || []);
      }
    });
  }

  saveCart() {
    const user = this.auth.currentUser();

    if (!user) return;

    this.http.get<any[]>(`${this.API_URL}/cart?userId=${user.id}`).subscribe((cartData) => {
      if (cartData.length > 0) {
        const cartRecord = cartData[0];

        this.http
          .patch(`${this.API_URL}/cart/${cartRecord.id}`, {
            items: this.cart(),
            updatedAt: new Date().toISOString(),
          })
          .subscribe();
      } else {
        this.http
          .post(`${this.API_URL}/cart`, {
            userId: user.id,
            items: this.cart(),
            updatedAt: new Date().toISOString(),
          })
          .subscribe();
      }
    });
  }
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
      const newQty = currentCart[existingIdx].quantity + quantity;

      if (newQty > limit) {
        this.notifications.addNotification(
          'Quantity Limit Reached',
          `Maximum allowed quantity is ${limit}.`,
          'warning',
        );

        return;
      }

      currentCart[existingIdx].quantity = newQty;

      this.cart.set([...currentCart]);
      this.saveCart();
    } else {
      if (quantity > limit) {
        this.notifications.addNotification(
          'Quantity Limit Reached',
          `Maximum allowed quantity is ${limit}.`,
          'warning',
        );

        return;
      }

      this.cart.set([
        ...currentCart,
        {
          medicine,
          quantity,
        },
      ]);
      this.saveCart();
    }

    this.notifications.addNotification(
      'Added To Cart',
      `${medicine.name} added successfully.`,
      'success',
    );
  }

  updateCartQuantity(medicineId: string, quantity: number) {
    const currentCart = this.cart();

    const item = currentCart.find((i) => i.medicine.id === medicineId);

    if (!item) return;

    const limit = item.medicine.isPrescriptionRequired ? 5 : 30;

    if (quantity > limit) {
      this.notifications.addNotification('Limit Exceeded', `Quantity limit is ${limit}`, 'warning');

      return;
    }

    if (quantity <= 0) {
      this.removeFromCart(medicineId);
    } else {
      item.quantity = quantity;

      this.cart.set([...currentCart]);
      this.saveCart();
    }
  }

  removeFromCart(medicineId: string) {

  this.cart.update((current) =>
    current.filter((item) => item.medicine.id !== medicineId)
  );

  this.saveCart();

  this.notifications.addNotification(
    'Removed',
    'Item removed from cart.',
    'info'
  );
}
  clearCart() {
    this.cart.set([]);
    this.saveCart();
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
    prescriptionFile: {
      name: string;
      size: number;
      base64?: string;
    } | null,
  ): Order | null {
    const user = this.auth.currentUser();

    if (!user) return null;

    const cartItems = this.cart();

    if (cartItems.length === 0) return null;

    const requiresRx = this.cartRequiresPrescription();

    if (requiresRx && !prescriptionFile) {
      this.notifications.addNotification(
        'Checkout Blocked',
        'Please upload a valid prescription.',
        'error',
      );

      return null;
    }

    const orderId = 'ord-' + Math.floor(100000 + Math.random() * 900000);

    const initialStatus: Order['status'] = requiresRx ? 'pending_verification' : 'accepted';

    const newOrder: Order = {
      id: orderId,

      customerId: user.id,

      customerName: user.profile?.name || user.name || user.email,

      items: [...cartItems],

      total: this.cartTotal(),

      shippingAddress,

      status: initialStatus,

      deliverySlot,

      prescriptionUrl: prescriptionFile?.base64,

      prescriptionName: prescriptionFile?.name,

      timeline: [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          comment: requiresRx
            ? 'Prescription uploaded and awaiting verification.'
            : 'Order placed successfully.',
        },
      ],

      createdAt: new Date().toISOString(),
    };

    if (!requiresRx) {
      newOrder.timeline.push({
        status: 'accepted',
        timestamp: new Date().toISOString(),
        comment: 'Stock verified and order accepted.',
      });
    }

    cartItems.forEach((item) => {
      this.medicineService.adjustStock(item.medicine.id, -item.quantity).subscribe();
    });

    this.http.post<Order>(`${this.API_URL}/orders`, newOrder).subscribe((savedOrder) => {
      this.orders.update((current) => [savedOrder, ...current]);

      this.clearCart();

      this.notifications.addNotification(
        'Order Placed',
        `Order ${savedOrder.id} submitted successfully.`,
        'success',
      );
    });

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status'], comment?: string) {
    const currentOrders = this.orders();

    const orderIdx = currentOrders.findIndex((o) => o.id === orderId);

    if (orderIdx === -1) return;

    const order = currentOrders[orderIdx];

    const updatedOrder: Order = {
      ...order,

      status,

      timeline: [
        ...order.timeline,
        {
          status,
          timestamp: new Date().toISOString(),
          comment: comment || `Status updated to ${status}`,
        },
      ],
    };

    this.http
      .patch<Order>(`${this.API_URL}/orders/${orderId}`, {
        status,
        timeline: updatedOrder.timeline,
      })
      .subscribe(() => {
        const updated = [...currentOrders];

        updated[orderIdx] = updatedOrder;

        this.orders.set(updated);

        this.notifications.addNotification(
          'Order Updated',
          `${orderId} is now ${status}`,
          status === 'rejected' || status === 'canceled' ? 'warning' : 'success',
        );
      });
  }

  createSupportTicket(subject: string, message: string) {
    const user = this.auth.currentUser();

    if (!user) return;

    const newTicket: SupportTicket = {
      id: 'tkt-' + Math.floor(100000 + Math.random() * 900000),

      customerId: user.id,

      customerName: user.profile?.name || user.name || user.email,

      subject,

      message,

      status: 'open',

      createdAt: new Date().toISOString(),
    };

    this.http
      .post<SupportTicket>(`${this.API_URL}/supportTickets`, newTicket)
      .subscribe((savedTicket) => {
        this.supportTickets.update((current) => [savedTicket, ...current]);

        this.notifications.addNotification(
          'Support Ticket Created',
          'Your support request has been submitted.',
          'info',
        );
      });
  }

  respondToSupportTicket(ticketId: string, response: string) {
    const currentTickets = this.supportTickets();

    const idx = currentTickets.findIndex((t) => t.id === ticketId);

    if (idx === -1) return;

    const updatedTicket = {
      ...currentTickets[idx],

      status: 'resolved' as const,

      response,
    };

    this.http
      .patch(`${this.API_URL}/supportTickets/${ticketId}`, {
        status: 'resolved',
        response,
      })
      .subscribe(() => {
        const updated = [...currentTickets];

        updated[idx] = updatedTicket;

        this.supportTickets.set(updated);

        this.notifications.addNotification(
          'Ticket Resolved',
          `Response sent for ${ticketId}`,
          'success',
        );
      });
  }
}
