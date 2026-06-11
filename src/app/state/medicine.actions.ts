import { createAction, props } from '@ngrx/store';
import { Medicine } from '../core/types';

export const loadMedicines = createAction('[Medicine Catalog] Load Medicines');
export const loadMedicinesSuccess = createAction(
  '[Medicine Catalog] Load Medicines Success',
  props<{ medicines: Medicine[] }>()
);
export const loadMedicinesFailure = createAction(
  '[Medicine Catalog] Load Medicines Failure',
  props<{ error: string }>()
);

export const setSearchQuery = createAction(
  '[Medicine Catalog] Set Search Query',
  props<{ query: string }>()
);
export const setCategoryFilter = createAction(
  '[Medicine Catalog] Set Category Filter',
  props<{ category: string }>()
);
export const setWellnessSegment = createAction(
  '[Medicine Catalog] Set Wellness Segment',
  props<{ segment: string }>()
);
export const setAvailabilityFilter = createAction(
  '[Medicine Catalog] Set Availability Filter',
  props<{ onlyAvailable: boolean }>()
);

export const adjustStockSuccess = createAction(
  '[Medicine Catalog] Adjust Stock Success',
  props<{ medicineId: string; newStock: number }>()
);
export const updateMedicineSuccess = createAction(
  '[Medicine Catalog] Update Medicine Success',
  props<{ medicine: Medicine }>()
);
export const addMedicineSuccess = createAction(
  '[Medicine Catalog] Add Medicine Success',
  props<{ medicine: Medicine }>()
);
export const deleteMedicineSuccess = createAction(
  '[Medicine Catalog] Delete Medicine Success',
  props<{ medicineId: string }>()
);