import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, Order, Medicine, SupportTicket, OrderTimelineEvent } from './types';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { MedicineService } from './medicine.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly medicineService = inject(MedicineService);

  readonly cart = signal<CartItem[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly supportTickets = signal<SupportTicket[]>([]);

  readonly cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0)
  );
  readonly cartItemCount = computed(() =>
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly cartRequiresPrescription = computed(() =>
    this.cart().some(item => item.medicine.isPrescriptionRequired)
  );

  private readonly STORAGE_KEY_ORDERS = 'pharmacy_orders';
  private readonly STORAGE_KEY_TICKETS = 'pharmacy_tickets';

  constructor() {
    this.loadState();
    if (this.orders().length === 0) {
      this.seedData();
    }
  }

  private loadState() {
    try {
      const savedOrders = localStorage.getItem(this.STORAGE_KEY_ORDERS);
      if (savedOrders) this.orders.set(JSON.parse(savedOrders));

      const savedTickets = localStorage.getItem(this.STORAGE_KEY_TICKETS);
      if (savedTickets) this.supportTickets.set(JSON.parse(savedTickets));
    } catch (e) {
      console.error('Failed to load order/ticket state', e);
    }
  }

  private saveOrders(updated: Order[]) {
    this.orders.set(updated);
    localStorage.setItem(this.STORAGE_KEY_ORDERS, JSON.stringify(updated));
  }

  private saveTickets(updated: SupportTicket[]) {
    this.supportTickets.set(updated);
    localStorage.setItem(this.STORAGE_KEY_TICKETS, JSON.stringify(updated));
  }

  private seedData() {
    const historicalOrders: Order[] = [
      {
        id: 'ord-101',
        customerId: 'usr-customer',
        customerName: 'Jane Doe',
        items: [
          {
            medicine: {
              id: 'med-1',
              name: 'Amoxicillin 500mg',
              brand: 'Amoxil',
              category: 'Antibiotics',
              description: 'Used to treat bacterial infections...',
              price: 18.50,
              stock: 45,
              isPrescriptionRequired: true,
              sideEffects: 'Nausea...',
              dosage: 'Take 1 capsule every 8 hours...',
              alternateIds: []
            },
            quantity: 2
          }
        ],
        total: 37.00,
        shippingAddress: {
          fullName: 'Jane Doe',
          street: '123 Healthway Blvd',
          city: 'Metro City',
          state: 'NY',
          zipCode: '10001'
        },
        status: 'pending_verification',
        deliverySlot: 'Standard Shipping - Evening Slot (6 PM - 9 PM)',
        prescriptionUrl: 'assets/mock-prescriptions/jane_doe_rx_amox.pdf',
        prescriptionName: 'jane_doe_rx_amox.pdf',
        timeline: [
          { status: 'pending_verification', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), comment: 'Prescription uploaded. Awaiting validation by pharmacist.' }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: 'ord-100',
        customerId: 'usr-customer',
        customerName: 'Jane Doe',
        items: [
          {
            medicine: {
              id: 'med-7',
              name: 'Ibuprofen 400mg',
              brand: 'Advil Ultra',
              category: 'Pain Relief',
              description: 'Nonsteroidal anti-inflammatory...',
              price: 6.50,
              stock: 200,
              isPrescriptionRequired: false,
              sideEffects: 'Stomach ache...',
              dosage: 'Take 1 tablet every 4 to 6 hours...',
              alternateIds: []
            },
            quantity: 3
          }
        ],
        total: 19.50,
        shippingAddress: {
          fullName: 'Jane Doe',
          street: '123 Healthway Blvd',
          city: 'Metro City',
          state: 'NY',
          zipCode: '10001'
        },
        status: 'delivered',
        deliverySlot: 'Standard Shipping - Morning Slot (9 AM - 12 PM)',
        timeline: [
          { status: 'pending_verification', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), comment: 'Order placed' },
          { status: 'accepted', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 30).toISOString(), comment: 'Order approved automatically (OTC products only)' },
          { status: 'packed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), comment: 'Items packaged and ready for dispatch' },
          { status: 'shipped', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(), comment: 'Dispatched via Express Delivery Courier' },
          { status: 'delivered', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), comment: 'Handed to recipient' }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
      }
    ];

    const initialTickets: SupportTicket[] = [
      {
        id: 'tkt-201',
        customerId: 'usr-customer',
        customerName: 'Jane Doe',
        subject: 'Prescription review time query',
        message: 'How long does it typically take for a pharmacist to verify my prescription upload? I placed my order ord-101 two hours ago.',
        status: 'open',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ];

    this.saveOrders(historicalOrders);
    this.saveTickets(initialTickets);
  }

  addToCart(medicine: Medicine, quantity: number) {
    // Custom Validation: Check Stock
    if (medicine.stock <= 0) {
      this.notifications.addNotification('Add to Cart Failed', Sorry, ${medicine.name} is currently out of stock., 'error');
      return;
    }

    const limit = medicine.isPrescriptionRequired ? 5 : 30;

    const currentCart = this.cart();
    const existingIdx = currentCart.findIndex(item => item.medicine.id === medicine.id);

    if (existingIdx !== -1) {
      // Custom Validation: Duplicate medicine restriction (if updating, we check limit)
      const newQty = currentCart[existingIdx].quantity + quantity;
      if (newQty > limit) {
        this.notifications.addNotification(
          'Quantity Limit Reached',
          Restricted medicines are limited to ${limit} units per order. You currently have ${currentCart[existingIdx].quantity} in cart.,
          'warning'
        );
        return;
      }
      currentCart[existingIdx].quantity = newQty;
      this.cart.set([...currentCart]);
    } else {
      if (quantity > limit) {
        this.notifications.addNotification(
          'Quantity Limit Reached',
          This item is limited to a maximum of ${limit} units per order.,
          'warning'
        );
        return;
      }
      this.cart.set([...currentCart, { medicine, quantity }]);
    }

    this.notifications.addNotification(
      'Added to Cart',
      ${medicine.name} has been added to your shopping cart.,
      'success'
    );
  }

  updateCartQuantity(medicineId: string, quantity: number) {
    const currentCart = this.cart();
    const item = currentCart.find(i => i.medicine.id === medicineId);
    if (!item) return;

    const limit = item.medicine.isPrescriptionRequired ? 5 : 30;
    if (quantity > limit) {
      this.notifications.addNotification(
        'Limit Exceeded',
        Quantity limit for this item is ${limit} units.,
        'warning'
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
    this.cart.update(current => current.filter(item => item.medicine.id !== medicineId));
    this.notifications.addNotification('Removed from Cart', 'Item removed from your cart.', 'info');
  }

  clearCart() {
    this.cart.set([]);
  }

  checkout(
    shippingAddress: { fullName: string; street: string; city: string; state: string; zipCode: string },
    deliverySlot: string,
    prescriptionFile: { name: string; size: number; base64?: string } | null
  ): Order | null {
    const user = this.auth.currentUser();
    if (!user) return null;

    const cartItems = this.cart();
    if (cartItems.length === 0) return null;

    const requiresRx = this.cartRequiresPrescription();
    if (requiresRx && !prescriptionFile) {
      this.notifications.addNotification(
        'Checkout Blocked',
        'Your order contains prescription-only medicines. Please upload a valid doctor\'s prescription.',
        'error'
      );
      return null;
    }

    const orderId = 'ord-' + Math.floor(100 + Math.random() * 900);

    const initialStatus: Order['status'] =
      requiresRx ? 'pending_verification' : 'accepted';

    const newOrder: Order = {
      id: orderId,
      customerId: user.id,
customerName: user.profile?.name || user.email,      items: [...cartItems],
      total: this.cartTotal(),
      shippingAddress: shippingAddress,
      status: initialStatus,
      deliverySlot: deliverySlot,
      prescriptionUrl: prescriptionFile
        ? (prescriptionFile.base64 || 'assets/mock-prescriptions/upload.pdf')
        : undefined,
      prescriptionName: prescriptionFile
        ? prescriptionFile.name
        : undefined,
      timeline: [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          comment: requiresRx
            ? 'Prescription uploaded. Awaiting verification by the pharmacist.'
            : 'Order placed. Checkout confirmed automatically for OTC products.'
        }
      ],
      createdAt: new Date().toISOString()
    };

    if (!requiresRx) {
      newOrder.timeline.push({
status: 'accepted',
        timestamp: new Date().toISOString(),
        comment: 'Stock confirmed. Preparing order for packaging.'
      });
    }

    cartItems.forEach(item => {
      this.medicineService.adjustStock(item.medicine.id, -item.quantity);
    });

    const updatedOrders = [newOrder, ...this.orders()];
    this.saveOrders(updatedOrders);
    this.clearCart();

    this.notifications.addNotification(
      'Order Placed',
      Order ${orderId} has been successfully submitted! Status: ${newOrder.status},
      'success'
    );

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status'], comment?: string) {
    const currentOrders = this.orders();
    const orderIdx = currentOrders.findIndex(o => o.id === orderId);

    if (orderIdx !== -1) {
      const order = currentOrders[orderIdx];
      const newTimelineEvent: OrderTimelineEvent = {
        status,
        timestamp: new Date().toISOString(),
        comment: comment || Status updated to ${status}
      };

      const updatedOrder: Order = {
        ...order,
        status,
        timeline: [...order.timeline, newTimelineEvent]
      };

      const updated = [...currentOrders];
      updated[orderIdx] = updatedOrder;
      this.saveOrders(updated);

      this.notifications.addNotification(
        'Order Status Update',
        Your order ${orderId} is now: ${status.toUpperCase().replace('_', ' ')}. ${comment || ''},
        status === 'rejected' || status === 'canceled' ? 'warning' : 'success'
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
      createdAt: new Date().toISOString()
    };

    const updated = [newTicket, ...this.supportTickets()];
    this.saveTickets(updated);

    this.notifications.addNotification(
      'Support Ticket Opened',
      Your query "${subject}" has been submitted. A support representative will respond shortly.,
      'info'
    );
  }

  respondToSupportTicket(ticketId: string, response: string) {
    const currentTickets = this.supportTickets();
    const idx = currentTickets.findIndex(t => t.id === ticketId);

    if (idx !== -1) {
      const updatedTicket: SupportTicket = {
        ...currentTickets[idx],
        status: 'resolved',
        response
      };

      const updated = [...currentTickets];
      updated[idx] = updatedTicket;
      this.saveTickets(updated);

      this.notifications.addNotification(
        'Support Ticket Answered',
        Admin responded to ticket ${ticketId}: "${response.substring(0, 40)}...",
        'success'
      );
    }
  }
}