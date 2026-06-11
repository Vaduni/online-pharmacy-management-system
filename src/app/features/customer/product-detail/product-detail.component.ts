import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MedicineService } from '../../../core/medicine.service';
import { OrderService } from '../../../core/order.service';
import { Medicine } from '../../../core/types';

@Component({
  selector: 'app-customer-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class CustomerProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private medicineService = inject(MedicineService);
  private orderService = inject(OrderService);

  readonly medicine = signal<Medicine | null>(null);
  readonly alternates = signal<Medicine[]>([]);
  readonly loading = signal<boolean>(true);
  readonly qty = signal<number>(1);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProductDetails(id);
      }
    });
  }

  loadProductDetails(id: string) {
    this.loading.set(true);
    this.qty.set(1);
    this.medicineService.getMedicineById(id).subscribe(med => {
      if (med) {
        this.medicine.set(med);
        // Load alternates
        if (med.alternateIds && med.alternateIds.length > 0) {
          this.loadAlternates(med.alternateIds);
        } else {
          this.alternates.set([]);
          this.loading.set(false);
        }
      } else {
        this.medicine.set(null);
        this.alternates.set([]);
        this.loading.set(false);
      }
    });
  }

  loadAlternates(ids: string[]) {
    this.medicineService.getMedicines().subscribe(allList => {
      const matched = allList.filter(m => ids.includes(m.id));
      this.alternates.set(matched);
      this.loading.set(false);
    });
  }

  reloadProduct(id: string) {
    this.loadProductDetails(id);
  }

  adjustQty(val: number) {
    this.qty.update(q => q + val);
  }

  maxAllowedQty(med: Medicine): number {
    return med.isPrescriptionRequired ? 5 : 30;
  }

  addToCart(med: Medicine) {
    this.orderService.addToCart(med, this.qty());
  }
}