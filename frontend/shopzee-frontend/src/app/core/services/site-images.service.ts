import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from './api/api.config';

export interface HomeImages {
  'hero-bg':        string;
  'women-1':        string;
  'women-2':        string;
  'women-3':        string;
  'women-4':        string;
  'women-5':        string;
  'women-6':        string;
  'women-7':        string;
  'men-1':          string;
  'men-2':          string;
  'men-3':          string;
  'men-4':          string;
}

export const DEFAULT_IMAGES: HomeImages = {
  'hero-bg':   'assets/images/hero-bg.png',
  'women-1':   'assets/images/women/women-1.png',
  'women-2':   'assets/images/women/women-2.png',
  'women-3':   'assets/images/women/women-3.png',
  'women-4':   'assets/images/women/women-4.png',
  'women-5':   'assets/images/women/women-5.png',
  'women-6':   'assets/images/women/women-6.png',
  'women-7':   'assets/images/women/women-7.png',
  'men-1':     'assets/images/men/men-1.png',
  'men-2':     'assets/images/men/men-2.png',
  'men-3':     'assets/images/men/men-3.png',
  'men-4':     'assets/images/men/men-4.png',
};

const STORAGE_KEY = 'STYLEMAKER_images';

@Injectable({ providedIn: 'root' })
export class SiteImagesService {
  private platformId = inject(PLATFORM_ID);
  private http       = inject(HttpClient);

  images = signal<HomeImages>({ ...DEFAULT_IMAGES });

  init() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { this.images.set({ ...DEFAULT_IMAGES, ...JSON.parse(saved) }); } catch {}
    }
    this.loadFromBackend();
  }

  getImage(key: keyof HomeImages): string {
    return this.images()[key] || DEFAULT_IMAGES[key];
  }

  saveImage(key: keyof HomeImages, dataUrl: string) {
    const updated = { ...this.images(), [key]: dataUrl };
    this.images.set(updated);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    // Save to backend
    this.http.post(`${API_BASE}/settings/bulk`, {
      settings: [{ key: `images.${key}`, value: dataUrl, group: 'images' }]
    }).subscribe({ error: () => {} });
  }

  resetImage(key: keyof HomeImages) {
    const updated = { ...this.images(), [key]: DEFAULT_IMAGES[key] };
    this.images.set(updated);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    this.http.post(`${API_BASE}/settings/bulk`, {
      settings: [{ key: `images.${key}`, value: DEFAULT_IMAGES[key], group: 'images' }]
    }).subscribe({ error: () => {} });
  }

  resetAll() {
    this.images.set({ ...DEFAULT_IMAGES });
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private loadFromBackend() {
    this.http.get<Record<string, string>>(`${API_BASE}/settings/images`).subscribe({
      next: (data) => {
        const imgs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => {
          if (v) imgs[k.replace('images.', '')] = v;
        });
        if (Object.keys(imgs).length > 0) {
          const updated = { ...DEFAULT_IMAGES, ...imgs } as HomeImages;
          this.images.set(updated);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          }
        }
      },
      error: () => {}
    });
  }
}
