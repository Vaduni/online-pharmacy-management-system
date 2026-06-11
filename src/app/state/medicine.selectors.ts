import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MedicineState, selectAll } from './medicine.reducer';

export const selectMedicineState = createFeatureSelector<MedicineState>('medicines');

export const selectAllMedicines = createSelector(
  selectMedicineState,
  selectAll
);

export const selectSearchQuery = createSelector(
  selectMedicineState,
  (state) => state.searchQuery
);

export const selectCategoryFilter = createSelector(
  selectMedicineState,
  (state) => state.categoryFilter
);

export const selectWellnessSegment = createSelector(
  selectMedicineState,
  (state) => state.wellnessSegment
);

export const selectOnlyAvailable = createSelector(
  selectMedicineState,
  (state) => state.onlyAvailable
);

export const selectLoading = createSelector(
  selectMedicineState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectMedicineState,
  (state) => state.error
);

export const selectFilteredMedicines = createSelector(
  selectAllMedicines,
  selectSearchQuery,
  selectCategoryFilter,
  selectWellnessSegment,
  selectOnlyAvailable,
  (medicines, query, category, segment, onlyAvailable) => {
    return medicines.filter((medicine) => {
      if (query && query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesName = medicine.name.toLowerCase().includes(q);
        const matchesBrand = medicine.brand.toLowerCase().includes(q);
        const matchesDesc = medicine.description.toLowerCase().includes(q);
        const matchesCat = medicine.category.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      if (category && category !== '') {
        if (category === 'Wellness') {
          if (medicine.isPrescriptionRequired) return false;
        } else if (medicine.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }
      }

      if (segment && segment !== '') {
        const matchesSegment = medicine.category.toLowerCase() === 'vitamins & wellness' || 
                                medicine.category.toLowerCase() === 'wellness' ||
                                !medicine.isPrescriptionRequired;
        if (!matchesSegment) {
          return false;
        }
      }

      if (onlyAvailable && medicine.stock <= 0) {
        return false;
      }

      return true;
    });
  }
);

export const selectUniqueCategories = createSelector(
  selectAllMedicines,
  (medicines) => {
    const categories = medicines.map(m => m.category);
    return Array.from(new Set(categories));
  }
);