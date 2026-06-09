import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStatusWidget } from './order-status-widget';

describe('OrderStatusWidget', () => {
  let component: OrderStatusWidget;
  let fixture: ComponentFixture<OrderStatusWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderStatusWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderStatusWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
