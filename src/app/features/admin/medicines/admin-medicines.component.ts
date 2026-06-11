import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MedicineService } from '../../../core/medicine.service';
import { Medicine } from '../../../core/types';
import * as MedicineActions from '../../../state/medicine.actions';

@Component({
  selector: 'app-admin-medicines',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-medicines.component.html',
  styleUrls: ['./admin-medicines.component.css']
})
export class AdminMedicinesComponent implements OnInit {
  private medicineService = inject(MedicineService);
  private fb = inject(FormBuilder);
  private store = inject(Store);

  readonly medicines = signal<Medicine[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<string | null>(null);

  medForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadMedicinesList();
  }

  initForm() {
    this.medForm = this.fb.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      category: ['Antibiotics', Validators.required],
      price: [0.00, [Validators.required, Validators.min(0.01)]],
      stock: [100, [Validators.required, Validators.min(0)]],
      isPrescriptionRequired: [false],
      description: ['', Validators.required],
      dosage: ['', Validators.required],
      sideEffects: ['', Validators.required]
    });
  }

  loadMedicinesList() {
    this.medicineService.getMedicines().subscribe(list => {
      this.medicines.set(list);
    });
  }

  openCreateForm() {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.medForm.reset({
      category: 'Antibiotics',
      price: 0.00,
      stock: 100,
      isPrescriptionRequired: false
    });
    this.showForm.set(true);
  }

  editProduct(med: Medicine) {
    this.isEditMode.set(true);
    this.selectedId.set(med.id);
    this.medForm.patchValue({
      name: med.name,
      brand: med.brand,
      category: med.category,
      price: med.price,
      stock: med.stock,
      isPrescriptionRequired: med.isPrescriptionRequired,
      description: med.description,
      dosage: med.dosage,
      sideEffects: med.sideEffects
    });
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  saveProduct() {
    if (this.medForm.valid) {
      const val = this.medForm.value;
      const medicine: Medicine = {
        id: this.isEditMode() && this.selectedId() ? (this.selectedId() as string) : 'med-' + Math.floor(100 + Math.random() * 900),
        name: val.name,
        brand: val.brand,
        category: val.category,
        price: Number(val.price),
        stock: Number(val.stock),
        isPrescriptionRequired: !!val.isPrescriptionRequired,
        description: val.description,
        dosage: val.dosage,
        sideEffects: val.sideEffects,
        alternateIds: []
      };

      this.medicineService.saveMedicine(medicine).subscribe(() => {
        this.loadMedicinesList();
        
        // Dispatch actions to sync NgRx state cache
        if (this.isEditMode()) {
          this.store.dispatch(MedicineActions.updateMedicineSuccess({ medicine }));
        } else {
          this.store.dispatch(MedicineActions.addMedicineSuccess({ medicine }));
        }
        
        this.closeForm();
      });
    }
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this medication from the formulary?')) {
      this.medicineService.deleteMedicine(id).subscribe(() => {
        this.loadMedicinesList();
        
        this.store.dispatch(MedicineActions.deleteMedicineSuccess({ medicineId: id }));
      });
    }
  }

  adjustStockInline(id: string, delta: number) {
    this.medicineService.adjustStock(id, delta).subscribe(updated => {
      if (updated) {
        this.loadMedicinesList();
        
        // Sync NgRx store cache
        this.store.dispatch(MedicineActions.adjustStockSuccess({ medicineId: id, newStock: updated.stock }));
      }
    });
  }
}
