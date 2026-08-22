import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApiService } from '../services/api/auth-api.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth  = inject(AuthApiService);
  const router= inject(Router);
  const toast = inject(ToastService);

  if (auth.isLoggedIn()) return true;

  toast.info('Please sign in to continue.');
  // Save the attempted URL so we can redirect after login
  router.navigate(['/'], { queryParams: { signIn: '1', returnUrl: state.url } });
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

// Redirect admin away from public pages to /admin
// Resellers can access public pages normally
export const publicOnlyGuard: CanActivateFn = () => {
  const auth   = inject(AuthApiService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user?.role === 'admin') {
    router.navigate(['/admin']);
    return false;
  }
  // Resellers can browse public pages freely
  return true;
};
