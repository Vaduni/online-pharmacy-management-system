import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth.service';
import { OrderService } from '../../../core/order.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    StatusBadgePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class CustomerDashboardComponent {

  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  readonly currentUser = this.auth.currentUser;

  readonly customerTickets = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    return this.orderService
      .supportTickets()
      .filter(t => t.customerId === user.id);
  });

  readonly activeOrders = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    return this.orderService
      .orders()
      .filter(o => o.customerId === user.id)
      .slice(0, 3);
  });

  readonly totalOrdersCount = computed(() => {
    const user = this.currentUser();

    return this.orderService
      .orders()
      .filter(o => o.customerId === user?.id)
      .length;
  });

  readonly remindersCount = computed(() =>
    this.currentUser()?.preferences?.refillReminders ? 1 : 0
  );

  readonly healthAlertsText = computed(() =>
    this.currentUser()?.preferences?.healthAlerts
      ? 'Enabled'
      : 'Disabled'
  );

  supportForm: FormGroup = this.fb.group({
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(15)]]
  });

  isStepCompleted(
    currentStatus: string,
    stepName: string
  ): boolean {

    const orderOfStatuses = [
      'pending_verification',
      'accepted',
      'packed',
      'shipped',
      'delivered'
    ];

    const currentIdx =
      orderOfStatuses.indexOf(currentStatus);

    const stepIdx =
      orderOfStatuses.indexOf(stepName);

    if (currentStatus === 'rejected') {
      return stepName === 'pending_verification';
    }

    if (currentStatus === 'canceled') {
      return false;
    }

    return currentIdx >= stepIdx;
  }

  submitSupportTicket() {

    if (this.supportForm.valid) {

      const { subject, message } =
        this.supportForm.value;

      this.orderService.createSupportTicket(
        subject,
        message
      );

      this.supportForm.reset();
    }
  }
}