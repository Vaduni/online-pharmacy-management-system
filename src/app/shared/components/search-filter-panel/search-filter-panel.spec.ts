import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFilterPanel } from './search-filter-panel';

describe('SearchFilterPanel', () => {
  let component: SearchFilterPanel;
  let fixture: ComponentFixture<SearchFilterPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
