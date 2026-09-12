import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductApiService } from './api/product-api.service';
import { ProductService, apiToProduct, MOCK_PRODUCTS } from './product.service';
import { Product } from '../models/product.model';

/**
 * Global product cache — fetches ALL products once on app start.
 * Every page reads from this cache instantly without waiting for DB.
 */
@Injectable({ providedIn: 'root' })
export class ProductCacheService {
  private productApi     = inject(ProductApiService);
  private productService = inject(ProductService);

  // ── State ────────────────────────────────────────────────
  private _all      = signal<Product[]>(MOCK_PRODUCTS);
  private _loaded   = signal(false);
  private _loading  = signal(false);

  readonly all      = this._all.asReadonly();
  readonly loaded   = this._loaded.asReadonly();
  readonly loading  = this._loading.asReadonly();

  // ── Derived slices (instant, no DB call) ─────────────────
  readonly women    = computed(() => this._all().filter(p => p.category === 'women'));
  readonly men      = computed(() => this._all().filter(p => p.category === 'men'));
  readonly featured = computed(() => this._all().filter(p => p.isFeatured));
  readonly isNew    = computed(() => this._all().filter(p => p.isNew));
  readonly onSale   = computed(() => this._all().filter(p => p.discount && p.discount > 0));

  // ── Prefetch: call once at app startup ───────────────────
  prefetch(): void {
    if (this._loaded() || this._loading()) return; // already done / in progress
    this._loading.set(true);

    // Fetch up to 200 products in one shot
    this.productApi.getAll({ pageSize: 200 }).subscribe({
      next: res => {
        const products = res.items.map(apiToProduct);
        this._all.set(products.length ? products : MOCK_PRODUCTS);
        this._loaded.set(true);
        this._loading.set(false);
        console.log(`[Cache] Loaded ${products.length} products`);
      },
      error: () => {
        // DB unavailable — fall back to mock data silently
        this._all.set(MOCK_PRODUCTS);
        this._loaded.set(true);
        this._loading.set(false);
        console.warn('[Cache] DB unavailable — using mock data');
      }
    });
  }

  // ── Refresh: force re-fetch (used after admin adds/deletes) ─
  refresh(): void {
    this._loaded.set(false);
    this._loading.set(false);
    this.prefetch();
  }

  // ── Get by id from cache ─────────────────────────────────
  getById(id: number): Product | undefined {
    return this._all().find(p => p.id === id);
  }

  // ── Filter helper ────────────────────────────────────────
  filter(opts: { category?: string; isNew?: boolean; onSale?: boolean; search?: string }): Product[] {
    return this._all().filter(p => {
      if (opts.category && opts.category !== 'all' && p.category !== opts.category) return false;
      if (opts.isNew && !p.isNew) return false;
      if (opts.onSale && !(p.discount && p.discount > 0)) return false;
      if (opts.search) {
        const q = opts.search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) &&
            !p.subCategory?.toLowerCase().includes(q) &&
            !p.tags?.some(t => t.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }
}
