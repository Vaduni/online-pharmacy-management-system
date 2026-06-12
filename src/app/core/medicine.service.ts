import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Medicine } from './types';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  [x: string]: any;
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/medicines';

  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.apiUrl);
  }

  getMedicineById(id: string): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
  }

  saveMedicine(medicine: Medicine): Observable<Medicine> {
    return this.http.put<Medicine>(
      `${this.apiUrl}/${medicine.id}`,
      medicine
    );
  }

  addMedicine(medicine: Medicine): Observable<Medicine> {
    return this.http.post<Medicine>(
      this.apiUrl,
      medicine
    );
  }

  deleteMedicine(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
  adjustStock(id: string, count: number): Observable<Medicine> {
  return this.getMedicineById(id).pipe(
    switchMap((medicine) => {
      const updatedMedicine: Medicine = {
        ...medicine,
        stock: Math.max(0, medicine.stock + count)
      };

      return this.http.put<Medicine>(
        `${this.apiUrl}/${id}`,
        updatedMedicine
      );
    })
  );
}
}