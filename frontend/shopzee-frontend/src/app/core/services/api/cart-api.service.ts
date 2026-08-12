import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';

export interface ApiCartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  lineTotal: number;
  stock: number;
}

export interface ApiCart {
  id: number;
  items: ApiCartItem[];
  subTotal: number;
  shippingCost: number;
  total: number;
  itemCount: number;
}

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private http = inject(HttpClient);

  getCart(): Observable<ApiCart> {
    return this.http.get<ApiCart>(`${API_BASE}/cart`);
  }

  addItem(productId: number, quantity: number, selectedSize: string, selectedColor: string): Observable<ApiCart> {
    return this.http.post<ApiCart>(`${API_BASE}/cart/items`, {
      productId, quantity, selectedSize, selectedColor
    });
  }

  updateItem(itemId: number, quantity: number): Observable<ApiCart> {
    return this.http.put<ApiCart>(`${API_BASE}/cart/items/${itemId}`, { quantity });
  }

  removeItem(itemId: number): Observable<ApiCart> {
    return this.http.delete<ApiCart>(`${API_BASE}/cart/items/${itemId}`);
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/cart`);
  }
}
