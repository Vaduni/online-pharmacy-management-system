import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineCard } from './medicine-card';

describe('MedicineCard', () => {
  let component: MedicineCard;
  let fixture: ComponentFixture<MedicineCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
