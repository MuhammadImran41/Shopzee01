import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from './api/api.config';

export interface SocialLinks {
  instagram: string;
  facebook:  string;
  tiktok:    string;
  whatsapp:  string;
  youtube:   string;
}

export const DEFAULT_SOCIAL: SocialLinks = {
  instagram: '',
  facebook:  '',
  tiktok:    '',
  whatsapp:  '',
  youtube:   '',
};

const STORAGE_KEY = 'STYLEMAKER_social';

@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private platformId = inject(PLATFORM_ID);
  private http       = inject(HttpClient);

  social = signal<SocialLinks>({ ...DEFAULT_SOCIAL });

  init() {
    if (!isPlatformBrowser(this.platformId)) return;
    // Load from localStorage first (instant)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { this.social.set({ ...DEFAULT_SOCIAL, ...JSON.parse(saved) }); } catch {}
    }
    // Then sync from backend
    this.http.get<Record<string, string>>(`${API_BASE}/settings/social`).subscribe({
      next: (data) => {
        const links: Partial<SocialLinks> = {};
        Object.entries(data).forEach(([k, v]) => {
          const key = k.replace('social.', '') as keyof SocialLinks;
          if (key in DEFAULT_SOCIAL) links[key] = v;
        });
        if (Object.keys(links).length > 0) {
          const updated = { ...DEFAULT_SOCIAL, ...links };
          this.social.set(updated);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          }
        }
      },
      error: () => {}
    });
  }

  save(links: SocialLinks) {
    this.social.set(links);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    }
    // Save to backend
    const settings = Object.entries(links).map(([k, v]) => ({
      key:   `social.${k}`,
      value: v,
      group: 'social'
    }));
    this.http.post(`${API_BASE}/settings/bulk`, { settings }).subscribe({ error: () => {} });
  }
}
