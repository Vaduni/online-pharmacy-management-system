export interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  isPrescriptionRequired: boolean;
  sideEffects: string;
  dosage: string;
  imageUrl?: string;
  alternateIds: string[];
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface OrderTimelineEvent {
  status: 'pending_verification' | 'accepted' | 'rejected' | 'packed' | 'shipped' | 'delivered' | 'canceled';
  timestamp: string;
  comment?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'pending_verification' | 'accepted' | 'rejected' | 'packed' | 'shipped' | 'delivered' | 'canceled';
  deliverySlot: string;
  prescriptionUrl?: string;
  prescriptionName?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface UserPreferences {
  refillReminders: boolean;
  healthAlerts: boolean;
  emailNotifications: boolean;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';

  name?: string;
  phone?: string;

  profile?: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };

  preferences?: {
    refillReminders: boolean;
    healthAlerts: boolean;
    emailNotifications: boolean;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  response?: string;
  createdAt: string;
}

