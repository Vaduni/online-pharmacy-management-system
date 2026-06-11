import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  const path = state.url;
  
  if (path.startsWith('/admin') && currentUser.role !== 'admin') {
    router.navigate(['/customer/dashboard']);
    return false;
  }

  if (path.startsWith('/customer') && currentUser.role !== 'customer') {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  return true;
};