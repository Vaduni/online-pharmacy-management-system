import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: string, type: 'label' | 'class' = 'label'): string {
    const statuses: Record<string, { label: string; class: string }> = {
      pending_verification: { label: 'Under Review', class: 'status-pending' },
      accepted: { label: 'Approved', class: 'status-approved' },
      rejected: { label: 'Rejected', class: 'status-rejected' },
      packed: { label: 'Packed', class: 'status-packed' },
      shipped: { label: 'Dispatched', class: 'status-shipped' },
      delivered: { label: 'Delivered', class: 'status-delivered' },
      canceled: { label: 'Canceled', class: 'status-canceled' },
      open: { label: 'Open', class: 'status-open' },
      resolved: { label: 'Resolved', class: 'status-resolved' }
    };

    const match = statuses[status];
    if (!match) {
      return type === 'label' ? status : 'status-unknown';
    }

    return type === 'label' ? match.label : match.class;
  }
}