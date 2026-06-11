import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private notifService = inject(NotificationService);
  
  readonly toasts = this.notifService.toasts;

  removeToast(id: string) {
    this.notifService.removeToast(id);
  }
}
