import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from './api/api.config';

export interface ThemeColors {
  '--gold':         string;
  '--gold-light':   string;
  '--gold-dark':    string;
  '--black':        string;
  '--cream':        string;
  '--cream-light':  string;
  '--cream-dark':   string;
}

export const DEFAULT_THEME: ThemeColors = {
  '--gold':         '#C9A84C',
  '--gold-light':   '#E2C97E',
  '--gold-dark':    '#B8963C',
  '--black':        '#1A1A1A',
  '--cream':        '#F5F0E8',
  '--cream-light':  '#FAF7F2',
  '--cream-dark':   '#EDE6D6',
};

const STORAGE_KEY = 'STYLEMAKER_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private http       = inject(HttpClient);

  /** Apply theme from localStorage on startup */
  init() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.apply(JSON.parse(saved));
      } catch {}
    }
    // Also try loading from backend
    this.loadFromBackend();
  }

  /** Apply CSS variables to :root */
  apply(colors: Partial<ThemeColors>) {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, val]) => {
      if (val) root.style.setProperty(key, val);
    });
  }

  /** Save to localStorage + backend */
  save(colors: Partial<ThemeColors>) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    }
    this.apply(colors);

    // Save to backend
    const settings = Object.entries(colors).map(([key, value]) => ({
      key:   `theme.${key.replace('--', '')}`,
      value: value as string,
      group: 'theme'
    }));
    this.http.post(`${API_BASE}/settings/bulk`, { settings }).subscribe({ error: () => {} });
  }

  /** Reset to defaults */
  reset() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.apply(DEFAULT_THEME);
    const settings = Object.entries(DEFAULT_THEME).map(([key, value]) => ({
      key:   `theme.${key.replace('--', '')}`,
      value,
      group: 'theme'
    }));
    this.http.post(`${API_BASE}/settings/bulk`, { settings }).subscribe({ error: () => {} });
  }

  /** Load from backend (merges with defaults) */
  private loadFromBackend() {
    this.http.get<Record<string, string>>(`${API_BASE}/settings/theme`).subscribe({
      next: (data) => {
        const colors: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => {
          // k = "theme.gold" → "--gold"
          const cssVar = `--${k.replace('theme.', '')}`;
          colors[cssVar] = v;
        });
        if (Object.keys(colors).length > 0) {
          this.apply(colors as Partial<ThemeColors>);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
          }
        }
      },
      error: () => {}
    });
  }

  getCurrent(): ThemeColors {
    if (!isPlatformBrowser(this.platformId)) return { ...DEFAULT_THEME };
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return { ...DEFAULT_THEME, ...JSON.parse(saved) }; } catch {}
    }
    return { ...DEFAULT_THEME };
  }
}
