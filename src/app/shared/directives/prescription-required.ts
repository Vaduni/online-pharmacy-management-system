import { Directive } from '@angular/core';

@Directive({
  selector: '[appPrescriptionRequired]',
})
export class PrescriptionRequired {
  constructor() {}
}
