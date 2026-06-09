import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineManagement } from './medicine-management';

describe('MedicineManagement', () => {
  let component: MedicineManagement;
  let fixture: ComponentFixture<MedicineManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
