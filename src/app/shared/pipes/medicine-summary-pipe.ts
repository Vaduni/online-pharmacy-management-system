import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'medicineSummary',
})
export class MedicineSummaryPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
