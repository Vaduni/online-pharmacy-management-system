import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Medicine } from './types';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private readonly STORAGE_KEY = 'pharmacy_medicines';

  private readonly seedMedicines: Medicine[] = [
    {
      id: 'med-1',
      name: 'Amoxicillin 500mg',
      brand: 'Amoxil',
      category: 'Antibiotics',
      description: 'Used to treat bacterial infections such as pneumonia, bronchitis, and infections of the ear, nose, throat, urinary tract, and skin.',
      price: 18.50,
      stock: 45,
      isPrescriptionRequired: true,
      sideEffects: 'Nausea, vomiting, diarrhea, rash, allergic reactions.',
      dosage: 'Take 1 capsule every 8 hours with water for 7-10 days as directed.',
      alternateIds: ['med-2']
    },
    {
      id: 'med-2',
      name: 'Azithromycin 250mg',
      brand: 'Zithromax',
      category: 'Antibiotics',
      description: 'An antibiotic used for the treatment of a number of bacterial infections, including middle ear infections, strep throat, and traveler\'s diarrhea.',
      price: 24.00,
      stock: 12,
      isPrescriptionRequired: true,
      sideEffects: 'Diarrhea, abdominal pain, headache, mild skin rash.',
      dosage: 'Take 500mg on Day 1, followed by 250mg daily on Days 2-5.',
      alternateIds: ['med-1']
    },
    {
      id: 'med-3',
      name: 'Metformin XR 500mg',
      brand: 'Glucophage XR',
      category: 'Diabetes Care',
      description: 'Oral diabetes medicine that helps control blood sugar levels for people with type 2 diabetes.',
      price: 12.99,
      stock: 150,
      isPrescriptionRequired: true,
      sideEffects: 'Lactic acidosis, stomach upset, metallic taste, nausea, gas.',
      dosage: 'Take 1 tablet daily with dinner. Swallow whole, do not crush.',
      alternateIds: ['med-4']
    },
    {
      id: 'med-4',
      name: 'Glipizide 5mg',
      brand: 'Glucotrol',
      category: 'Diabetes Care',
      description: 'Used along with diet and exercise to lower blood sugar levels in adults with type 2 diabetes mellitus.',
      price: 9.75,
      stock: 80,
      isPrescriptionRequired: true,
      sideEffects: 'Hypoglycemia (low blood sugar), weight gain, nausea, dizziness.',
      dosage: 'Take 30 minutes before breakfast or first main meal of the day.',
      alternateIds: ['med-3']
    },
    {
      id: 'med-5',
      name: 'Lisinopril 10mg',
      brand: 'Zestril',
      category: 'Heart Health',
      description: 'ACE inhibitor used to treat high blood pressure (hypertension) in adults and children who are at least 6 years old.',
      price: 15.20,
      stock: 90,
      isPrescriptionRequired: true,
      sideEffects: 'Dry cough, dizziness, headache, tiredness, hyperkalemia.',
      dosage: 'Take 1 tablet daily at the same time each day, with or without food.',
      alternateIds: ['med-6']
    },
    {
      id: 'med-6',
      name: 'Amlodipine 5mg',
      brand: 'Norvasc',
      category: 'Heart Health',
      description: 'Calcium channel blocker used to treat high blood pressure (hypertension) or chest pain (angina).',
      price: 11.40,
      stock: 3, 
      isPrescriptionRequired: true,
      sideEffects: 'Swelling of ankles or feet, dizziness, palpitations, flushing.',
      dosage: 'Take 1 tablet daily. Can be taken with or without food.',
      alternateIds: ['med-5']
    },
    {
      id: 'med-7',
      name: 'Ibuprofen 400mg',
      brand: 'Advil Ultra',
      category: 'Pain Relief',
      description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for relieving pain, helping reduce fever and reducing inflammation.',
      price: 6.50,
      stock: 200,
      isPrescriptionRequired: false,
      sideEffects: 'Stomach ache, heartburn, headache, mild dizziness, tinnitus.',
      dosage: 'Take 1 tablet every 4 to 6 hours as needed. Do not exceed 6 tablets in 24 hours.',
      alternateIds: ['med-8']
    },
    {
      id: 'med-8',
      name: 'Acetaminophen 500mg',
      brand: 'Tylenol Extra Strength',
      category: 'Pain Relief',
      description: 'Analgesic and antipyretic used to treat mild to moderate pain and reduce fever.',
      price: 5.99,
      stock: 175,
      isPrescriptionRequired: false,
      sideEffects: 'Generally safe, but excessive dosage can cause severe liver damage.',
      dosage: 'Take 1 or 2 tablets every 6 hours. Maximum 8 tablets in 24 hours.',
      alternateIds: ['med-7']
    },
    {
      id: 'med-9',
      name: 'Liposomal Vitamin C 1000mg',
      brand: 'NutriLabs',
      category: 'Vitamins & Wellness',
      description: 'High absorption vitamin C supplement supporting immune health, collagen production, and antioxidant protection.',
      price: 22.99,
      stock: 60,
      isPrescriptionRequired: false,
      sideEffects: 'High doses may cause mild diarrhea or abdominal cramping.',
      dosage: 'Take 1 capsule daily with food, preferably in the morning.',
      alternateIds: []
    },
    {
      id: 'med-10',
      name: 'Vitamin D3 + K2 Drops',
      brand: 'Sports Research',
      category: 'Vitamins & Wellness',
      description: 'Synergistic supplement formula supporting bone strength, cardiovascular health, and calcium absorption.',
      price: 19.95,
      stock: 40,
      isPrescriptionRequired: false,
      sideEffects: 'Extremely rare. Avoid excessive dosing above recommendations.',
      dosage: 'Place 1 drop under the tongue daily or mix into a beverage.',
      alternateIds: []
    }
  ];

  constructor() {
    this.initializeMedicines();
  }

  private initializeMedicines() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.seedMedicines));
    }
  }

  getMedicines(): Observable<Medicine[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const medicines: Medicine[] = data ? JSON.parse(data) : this.seedMedicines;
    return of(medicines).pipe(delay(400));
  }

  getMedicineById(id: string): Observable<Medicine | undefined> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const medicines: Medicine[] = data ? JSON.parse(data) : this.seedMedicines;
    const medicine = medicines.find(m => m.id === id);
    return of(medicine).pipe(delay(200));
  }

  saveMedicine(medicine: Medicine): Observable<Medicine> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const medicines: Medicine[] = data ? JSON.parse(data) : [...this.seedMedicines];
    const idx = medicines.findIndex(m => m.id === medicine.id);
    
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
    let medicines: Medicine[] = data ? JSON.parse(data) : [...this.seedMedicines];
    medicines = medicines.filter(m => m.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(medicines));
    return of(id).pipe(delay(200));
  }

  adjustStock(id: string, count: number): Observable<Medicine | null> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const medicines: Medicine[] = data ? JSON.parse(data) : [...this.seedMedicines];
    const idx = medicines.findIndex(m => m.id === id);
    if (idx !== -1) {
      medicines[idx].stock = Math.max(0, medicines[idx].stock + count);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(medicines));
      return of(medicines[idx]);
    }
    return of(null);
  }
}