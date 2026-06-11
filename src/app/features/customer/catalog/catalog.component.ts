import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Medicine } from '../../../core/types';
import { OrderService } from '../../../core/order.service';
import { RestrictedIndicatorDirective } from '../../../shared/directives/restricted-badge.directive';
import * as MedicineActions from '../../../state/medicine.actions';
import * as MedicineSelectors from '../../../state/medicine.selectors';

@Component({
  selector: 'app-customer-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, RestrictedIndicatorDirective],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CustomerCatalogComponent implements OnInit {
  private store = inject(Store);
  private orderService = inject(OrderService);

  readonly medicines$ = this.store.select(MedicineSelectors.selectFilteredMedicines);
  readonly loading$ = this.store.select(MedicineSelectors.selectLoading);
  readonly onlyAvailable$ = this.store.select(MedicineSelectors.selectOnlyAvailable);

  readonly activeCategory = signal<string>('');

  ngOnInit() {
    this.store.dispatch(MedicineActions.loadMedicines());
    this.store.select(MedicineSelectors.selectCategoryFilter).subscribe(cat => {
      this.activeCategory.set(cat);
    });
  }

  onSearch(event: any) {
    const query = event.target.value;
    this.store.dispatch(MedicineActions.setSearchQuery({ query }));
  }

  onSelectCategory(category: string) {
    this.store.dispatch(MedicineActions.setCategoryFilter({ category }));
  }

  onToggleAvailability(event: any) {
    const onlyAvailable = event.target.checked;
    this.store.dispatch(MedicineActions.setAvailabilityFilter({ onlyAvailable }));
  }

  addToCart(med: Medicine) {
    this.orderService.addToCart(med, 1);
  }

  truncateDesc(desc: string): string {
    if (desc.length > 70) {
      return desc.substring(0, 67) + '...';
    }
    return desc;
  }
}