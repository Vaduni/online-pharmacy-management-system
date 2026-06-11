import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Medicine } from '../core/types';
import * as MedicineActions from './medicine.actions';

export interface MedicineState extends EntityState<Medicine> {
  searchQuery: string;
  categoryFilter: string;
  wellnessSegment: string;
  onlyAvailable: boolean;
  loading: boolean;
  error: string | null;
}

export const adapter: EntityAdapter<Medicine> = createEntityAdapter<Medicine>({
  selectId: (medicine: Medicine) => medicine.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

export const initialState: MedicineState = adapter.getInitialState({
  searchQuery: '',
  categoryFilter: '',
  wellnessSegment: '',
  onlyAvailable: false,
  loading: false,
  error: null
});

export const medicineReducer = createReducer(
  initialState,
  
  on(MedicineActions.loadMedicines, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MedicineActions.loadMedicinesSuccess, (state, { medicines }) => 
    adapter.setAll(medicines, { ...state, loading: false })
  ),
  on(MedicineActions.loadMedicinesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(MedicineActions.setSearchQuery, (state, { query }) => ({
    ...state,
    searchQuery: query
  })),
  on(MedicineActions.setCategoryFilter, (state, { category }) => ({
    ...state,
    categoryFilter: category
  })),
  on(MedicineActions.setWellnessSegment, (state, { segment }) => ({
    ...state,
    wellnessSegment: segment
  })),
  on(MedicineActions.setAvailabilityFilter, (state, { onlyAvailable }) => ({
    ...state,
    onlyAvailable
  })),

  on(MedicineActions.adjustStockSuccess, (state, { medicineId, newStock }) => 
    adapter.updateOne({ id: medicineId, changes: { stock: newStock } }, state)
  ),
  on(MedicineActions.updateMedicineSuccess, (state, { medicine }) => 
    adapter.updateOne({ id: medicine.id, changes: medicine }, state)
  ),
  on(MedicineActions.addMedicineSuccess, (state, { medicine }) => 
    adapter.addOne(medicine, state)
  ),
  on(MedicineActions.deleteMedicineSuccess, (state, { medicineId }) => 
    adapter.removeOne(medicineId, state)
  )
);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = adapter.getSelectors();