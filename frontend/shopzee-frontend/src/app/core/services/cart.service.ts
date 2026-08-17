import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();

  readonly itemCount = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  );

  readonly shipping = computed(() =>
    this.subtotal() >= 5000 ? 0 : 300
  );

  readonly total = computed(() => this.subtotal() + this.shipping());

  constructor() {
    // Auto-save to localStorage on change
    effect(() => {
      try {
        localStorage.setItem('trendzy_cart', JSON.stringify(this._items()));
      } catch {}
    });
  }

  addItem(product: Product, size: string, color: string, qty = 1) {
    const existing = this._items().find(
      i => i.product.id === product.id && i.selectedSize === size && i.selectedColor === color
    );
    if (existing) {
      this._items.update(items =>
        items.map(i =>
          i === existing ? { ...i, quantity: i.quantity + qty } : i
        )
      );
    } else {
      this._items.update(items => [
        ...items,
        { product, quantity: qty, selectedSize: size, selectedColor: color }
      ]);
    }
  }

  removeItem(productId: number, size: string, color: string) {
    this._items.update(items =>
      items.filter(
        i => !(i.product.id === productId && i.selectedSize === size && i.selectedColor === color)
      )
    );
  }

  updateQuantity(productId: number, size: string, color: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId, size, color);
      return;
    }
    this._items.update(items =>
      items.map(i =>
        i.product.id === productId && i.selectedSize === size && i.selectedColor === color
          ? { ...i, quantity }
          : i
      )
    );
  }

  clearCart() {
    this._items.set([]);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem('trendzy_cart');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
