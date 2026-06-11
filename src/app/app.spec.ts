import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { App } from './app';
import { StatusBadgePipe } from './shared/pipes/status-badge.pipe';
import { ageEligibilityValidator, deliverySlotValidator, prescriptionFileRequired, quantityLimitValidator } from './shared/validators';
import { medicineReducer, initialState } from './state/medicine.reducer';
import * as MedicineActions from './state/medicine.actions';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

describe('Aura Pharmacy Suite', () => {

  describe('Root App Component', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
        providers: [
          provideStore({ medicines: medicineReducer }),
          provideEffects([])
        ]
      }).compileComponents();
    });

    it('should compile the root App successfully', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      expect(app).toBeTruthy();
    });
  });

  describe('StatusBadgePipe', () => {
    let pipe: StatusBadgePipe;

    beforeEach(() => {
      pipe = new StatusBadgePipe();
    });

    it('should format status values to readable labels', () => {
      expect(pipe.transform('pending_verification', 'label')).toBe('Under Review');
      expect(pipe.transform('accepted', 'label')).toBe('Approved');
      expect(pipe.transform('resolved', 'label')).toBe('Resolved');
    });

    it('should return visual CSS classes for statuses', () => {
      expect(pipe.transform('pending_verification', 'class')).toBe('status-pending');
      expect(pipe.transform('accepted', 'class')).toBe('status-approved');
      expect(pipe.transform('rejected', 'class')).toBe('status-rejected');
    });

    it('should fallback gracefully for invalid keys', () => {
      expect(pipe.transform('non_existent', 'label')).toBe('non_existent');
      expect(pipe.transform('non_existent', 'class')).toBe('status-unknown');
    });
  });

  describe('Custom Form Validators', () => {
    
    it('prescriptionFileRequired validator checks', () => {
      const validator = prescriptionFileRequired(true);
      
      const emptyControl = new FormControl('');
      expect(validator(emptyControl)).toEqual({ prescriptionRequired: expect.any(String) });

      const fileControl = new FormControl({ name: 'prescription.pdf' });
      expect(validator(fileControl)).toBeNull();

      const nonRxValidator = prescriptionFileRequired(false);
      expect(nonRxValidator(emptyControl)).toBeNull();
    });

    it('quantityLimitValidator bounds check', () => {
      // Prescription item limit is 5
      const rxValidator = quantityLimitValidator(true);
      
      let control = new FormControl(3);
      expect(rxValidator(control)).toBeNull();

      control = new FormControl(10);
      expect(rxValidator(control)).toEqual({
        quantityLimitExceeded: expect.objectContaining({ maxAllowed: 5 })
      });

      // OTC item limit is 30
      const otcValidator = quantityLimitValidator(false);
      
      control = new FormControl(15);
      expect(otcValidator(control)).toBeNull();

      control = new FormControl(40);
      expect(otcValidator(control)).toEqual({
        quantityLimitExceeded: expect.objectContaining({ maxAllowed: 30 })
      });
    });

    it('ageEligibilityValidator checks', () => {
      const validator = ageEligibilityValidator(18);

      // Patient DOB is 1990 (Eligible)
      let control = new FormControl('1990-05-15');
      expect(validator(control)).toBeNull();

      // Patient is underage (e.g. current year is 2026, DOB is 2015 -> 11 years old)
      control = new FormControl('2015-10-20');
      expect(validator(control)).toEqual({
        underage: expect.objectContaining({ minAge: 18 })
      });
    });

    it('deliverySlotValidator checks lead time', () => {
      const validator = deliverySlotValidator();

      // Set schedule time 10 hours in the future
      const futureDate = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString();
      let control = new FormControl(futureDate);
      expect(validator(control)).toBeNull();

      // Set schedule time 1 hour in the future (Insufficient lead time)
      const nearDate = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();
      control = new FormControl(nearDate);
      expect(validator(control)).toEqual({
        insufficientLeadTime: expect.any(Object)
      });
    });
  });

  describe('NgRx Reducer Cache Sync', () => {
    it('should handle search filter set operations', () => {
      const action = MedicineActions.setSearchQuery({ query: 'amox' });
      const state = medicineReducer(initialState, action);
      expect(state.searchQuery).toBe('amox');
    });

    it('should handle category filter choices', () => {
      const action = MedicineActions.setCategoryFilter({ category: 'Antibiotics' });
      const state = medicineReducer(initialState, action);
      expect(state.categoryFilter).toBe('Antibiotics');
    });

    it('should handle stock adjustment actions', () => {
      const seedState = {
        ...initialState,
        ids: ['med-1'],
        entities: {
          'med-1': {
            id: 'med-1',
            name: 'Amoxicillin',
            brand: 'Amoxil',
            category: 'Antibiotics',
            description: 'Test desc',
            price: 15,
            stock: 10,
            isPrescriptionRequired: true,
            sideEffects: '',
            dosage: '',
            alternateIds: []
          }
        }
      };

      const action = MedicineActions.adjustStockSuccess({ medicineId: 'med-1', newStock: 35 });
      const state = medicineReducer(seedState, action);
      expect(state.entities['med-1']?.stock).toBe(35);
    });
  });
});
