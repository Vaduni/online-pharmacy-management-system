import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { MedicineService } from '../core/medicine.service';
import * as MedicineActions from './medicine.actions';

@Injectable()
export class MedicineEffects {
  private actions$ = inject(Actions);
  private medicineService = inject(MedicineService);

  loadMedicines$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MedicineActions.loadMedicines),
      mergeMap(() =>
        this.medicineService.getMedicines().pipe(
          map((medicines) => MedicineActions.loadMedicinesSuccess({ medicines })),
          catchError((error) =>
            of(
              MedicineActions.loadMedicinesFailure({
                error: error.message || 'An error occurred while loading medicines.'
              })
            )
          )
        )
      )
    )
  );
}