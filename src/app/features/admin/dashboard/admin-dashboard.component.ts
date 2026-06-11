import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/order.service';
import { MedicineService } from '../../../core/medicine.service';
import { Store } from '@ngrx/store';
import {  adjustStockSuccess } from '../../../state/medicine.actions';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
  
export class AdminDashboardComponent {
  private orderService = inject(OrderService);
  private medicineService = inject(MedicineService);
  private store = inject(Store);

  readonly allMedicines = signal<any[]>([]);

  readonly pendingOrders = computed(() =>
    this.orderService.orders().filter(o => o.status === 'pending_verification')
  );

  readonly pendingRxCount = computed(() => this.pendingOrders().length);

  readonly openTicketsCount = computed(() =>
    this.orderService.supportTickets().filter(t => t.status === 'open').length
  );

  readonly lowStockItems = computed(() =>
    this.allMedicines().filter((m: any) => m.stock <= 5));

  readonly lowStockCount = computed(() => this.lowStockItems().length);

  readonly grossRevenues = computed(() =>
    this.orderService.orders()
      .filter(o => o.status !== 'rejected' && o.status !== 'canceled')
      .reduce((sum, o) => sum + o.total, 0)
  );

  constructor() {
    this.loadCatalogData();
  }

  loadCatalogData() {
    this.medicineService.getMedicines().subscribe(meds => {
      this.allMedicines.set(meds);
    });
  }

  restockItem(id: string) {
    this.medicineService.adjustStock(id, 20).subscribe(updated => {
      if (updated) {
        this.loadCatalogData();
        this.store.dispatch(adjustStockSuccess({ medicineId: id, newStock: updated.stock }));
      }
    });
  }
}
