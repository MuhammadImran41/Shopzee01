import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApiService } from '../services/api/auth-api.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = () => {
  const auth  = inject(AuthApiService);
  const router= inject(Router);
  const toast = inject(ToastService);

  if (auth.isLoggedIn()) return true;

  toast.info('Please sign in to continue.');
  router.navigate(['/account']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth  = inject(AuthApiService);
  const router= inject(Router);
  const toast = inject(ToastService);

  if (auth.isAdmin()) return true;

  toast.error('Admin access required.');
  router.navigate(['/']);
  return false;
};

// Redirect admin users away from public pages to /admin
export const publicOnlyGuard: CanActivateFn = () => {
  const auth   = inject(AuthApiService);
  const router = inject(Router);

  // Check both signal and localStorage directly for reliability
  const user = auth.currentUser();
  if (user?.role === 'admin') {
    router.navigate(['/admin']);
    return false;
  }
  return true;
};
