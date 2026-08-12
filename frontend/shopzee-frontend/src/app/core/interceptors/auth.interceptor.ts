import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthApiService } from '../services/api/auth-api.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthApiService);
  const toast       = inject(ToastService);

  const token = authService.getToken();

  // Clone request with Authorization header if token exists
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        authService.logout();
        toast.error('Session expired. Please login again.');
      } else if (err.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (err.status === 0) {
        toast.error('Cannot connect to server. Please try again.');
      } else if (err.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
      return throwError(() => err);
    })
  );
};
