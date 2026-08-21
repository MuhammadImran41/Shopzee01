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

// Reseller guard — only approved/pending resellers
export const resellerGuard: CanActivateFn = () => {
  const auth  = inject(AuthApiService);
  const router= inject(Router);
  const toast = inject(ToastService);

  const role = auth.currentUser()?.role;
  if (role === 'reseller' || role === 'reseller_pending') return true;

  if (!auth.isLoggedIn()) {
    toast.info('Please sign in with your reseller account.');
    router.navigate(['/']);
    return false;
  }
  toast.error('Reseller account required.');
  router.navigate(['/']);
  return false;
};

// Redirect admin/reseller away from public pages to their respective dashboards
export const publicOnlyGuard: CanActivateFn = () => {
  const auth   = inject(AuthApiService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user?.role === 'admin') {
    router.navigate(['/admin']);
    return false;
  }
  if (user?.role === 'reseller' || user?.role === 'reseller_pending') {
    router.navigate(['/reseller']);
    return false;
  }
  return true;
};
