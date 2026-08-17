import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private _items = signal<Product[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem('trendzy_wishlist', JSON.stringify(this._items()));
      } catch {}
    });
  }

  toggle(product: Product) {
    const exists = this.isWishlisted(product.id);
    if (exists) {
      this._items.update(items => items.filter(p => p.id !== product.id));
    } else {
      this._items.update(items => [...items, product]);
    }
  }

  isWishlisted(id: number): boolean {
    return this._items().some(p => p.id === id);
  }

  remove(id: number) {
    this._items.update(items => items.filter(p => p.id !== id));
  }

  private loadFromStorage(): Product[] {
    try {
      const data = localStorage.getItem('trendzy_wishlist');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
