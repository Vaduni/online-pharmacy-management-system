import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../core/order.service';
import { Order } from '../../../core/types';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-admin-prescriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe],
  templateUrl: './admin-prescriptions.component.html',
  styleUrls: ['./admin-prescriptions.component.css']
})
export class AdminPrescriptionsComponent {
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  readonly pendingOrders = computed(() => 
    this.orderService.orders().filter(o => o.status === 'pending_verification')
  );

  readonly selectedOrderId = signal<string | null>(null);

  readonly selectedOrder = computed(() => {
    const id = this.selectedOrderId();
    if (!id) return null;
    return this.orderService.orders().find(o => o.id === id) || null;
  });

  reviewForm: FormGroup = this.fb.group({
    reviewComment: ['', Validators.required]
  });

  selectOrder(id: string) {
    this.selectedOrderId.set(id);
    this.reviewForm.reset();
  }

  onApprove(orderId: string) {
    const comment = this.reviewForm.value.reviewComment || 'Prescription checked. License verified. Approved.';
    this.orderService.updateOrderStatus(orderId, 'accepted', comment);
    
    this.autoSelectNext();
  }

  onReject(orderId: string) {
    if (this.reviewForm.valid) {
      const comment = this.reviewForm.value.reviewComment;
      this.orderService.updateOrderStatus(orderId, 'rejected', `Prescription rejected: ${comment}`);
      
      this.autoSelectNext();
    }
  }

  advanceStatus(orderId: string, status: Order['status'], comment: string) {
    this.orderService.updateOrderStatus(orderId, status, comment);
  }

  private autoSelectNext() {
    this.reviewForm.reset();
    const nextPending = this.pendingOrders();
    if (nextPending.length > 0) {
      this.selectedOrderId.set(nextPending[0].id);
    } else {
      this.selectedOrderId.set(null);
    }
  }
}
