import { Injectable, signal, inject, effect, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: ApiUser;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // ── Reactive state ───────────────────────────────────────
  currentUser = signal<ApiUser | null>(this.loadUser());
  isLoggedIn  = signal<boolean>(!!this.loadToken());
  isAdmin     = signal<boolean>(this.loadUser()?.role === 'admin');

  constructor() {
    // Sync isAdmin whenever currentUser changes
    effect(() => {
      this.isAdmin.set(this.currentUser()?.role === 'admin');
    });
  }

  // ── Auth endpoints ───────────────────────────────────────
  register(name: string, email: string, password: string, phone = ''): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/register`, { name, email, password, phone })
      .pipe(tap(res => this.handleAuth(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/login`, { email, password })
      .pipe(tap(res => this.handleAuth(res)));
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('trendzy_token');
      localStorage.removeItem('trendzy_user');
    }
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  updateProfile(name: string, phone: string): Observable<ApiUser> {
    return this.http.put<ApiUser>(`${API_BASE}/auth/profile`, { name, phone })
      .pipe(tap(user => this.currentUser.set(user)));
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.put(`${API_BASE}/auth/change-password`, { currentPassword, newPassword });
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId)
      ? localStorage.getItem('trendzy_token')
      : null;
  }

  // ── Private helpers ──────────────────────────────────────
  private handleAuth(res: AuthResponse) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('trendzy_token', res.token);
      localStorage.setItem('trendzy_user', JSON.stringify(res.user));
    }
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
  }

  private loadToken(): string | null {
    return isPlatformBrowser(this.platformId)
      ? localStorage.getItem('trendzy_token')
      : null;
  }

  private loadUser(): ApiUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem('trendzy_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
