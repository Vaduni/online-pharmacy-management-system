import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressManagement } from './address-management';

describe('AddressManagement', () => {
  let component: AddressManagement;
  let fixture: ComponentFixture<AddressManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
