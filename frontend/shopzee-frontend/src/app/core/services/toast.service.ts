import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'cart' | 'wishlist';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private counter = 0;

  show(message: string, type: Toast['type'] = 'success', duration = 3000) {
    const id = ++this.counter;
    this._toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
  info(msg: string)    { this.show(msg, 'info'); }
  cart(msg: string)    { this.show(msg, 'cart'); }
  wishlist(msg: string){ this.show(msg, 'wishlist'); }

  remove(id: number) {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }
}
