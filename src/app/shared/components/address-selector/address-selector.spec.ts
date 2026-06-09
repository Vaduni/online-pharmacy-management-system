import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressSelector } from './address-selector';

describe('AddressSelector', () => {
  let component: AddressSelector;
  let fixture: ComponentFixture<AddressSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
