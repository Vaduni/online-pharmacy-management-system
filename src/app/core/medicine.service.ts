import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Medicine } from './types';

@Injectable({
  providedIn: 'root',
})
export class MedicineService {
  private readonly STORAGE_KEY = 'pharmacy_medicines';

  constructor() {
    this.initializeMedicines();
  }

  private initializeMedicines() {
    const data = localStorage.getItem(this.STORAGE_KEY);

    if (!data) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  getMedicines(): Observable<Medicine[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const medicines: Medicine[] = data ? JSON.parse(data) : [];
    return of(medicines).pipe(delay(400));
  }

  getMedicineById(id: string): Observable<Medicine | undefined> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const medicines: Medicine[] = data ? JSON.parse(data) : [];
    const medicine = medicines.find((m) => m.id === id);
    return of(medicine).pipe(delay(200));
  }

  saveMedicine(medicine: Medicine): Observable<Medicine> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const medicines: Medicine[] = data ? JSON.parse(data) : [];
    const idx = medicines.findIndex((m) => m.id === medicine.id);

    if (idx !== -1) {
      medicines[idx] = medicine;
    } else {
      medicines.push(medicine);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(medicines));
    return of(medicine).pipe(delay(200));
  }

  deleteMedicine(id: string): Observable<string> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    let medicines: Medicine[] = data ? JSON.parse(data) : [];
    medicines = medicines.filter((m) => m.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(medicines));
    return of(id).pipe(delay(200));
  }

  adjustStock(id: string, count: number): Observable<Medicine | null> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const medicines: Medicine[] = data ? JSON.parse(data) : [];
    const idx = medicines.findIndex((m) => m.id === id);
    if (idx !== -1) {
      medicines[idx].stock = Math.max(0, medicines[idx].stock + count);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(medicines));
      return of(medicines[idx]);
    }
    return of(null);
  }
}
