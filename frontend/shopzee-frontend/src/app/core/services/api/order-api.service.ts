import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';

export interface CreateOrderPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  paymentMethod: string;
  items: { productId: number; quantity: number; selectedSize: string; selectedColor: string }[];
}

export interface ApiOrder {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subTotal: number;
  shippingCost: number;
  total: number;
  shippingName: string;
  shippingCity: string;
  shippingPhone: string;
  trackingNumber?: string;
  createdAt: string;
  items: {
    productId: number;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    selectedSize: string;
    selectedColor: string;
    lineTotal: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private http = inject(HttpClient);

  placeOrder(payload: CreateOrderPayload): Observable<ApiOrder> {
    return this.http.post<ApiOrder>(`${API_BASE}/orders`, payload);
  }

  getMyOrders(): Observable<ApiOrder[]> {
    return this.http.get<ApiOrder[]>(`${API_BASE}/orders`);
  }

  getOrderById(id: number): Observable<ApiOrder> {
    return this.http.get<ApiOrder>(`${API_BASE}/orders/${id}`);
  }

  // Admin
  getAllOrders(status?: string, search?: string, page = 1, pageSize = 20): Observable<any> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status)  params = params.set('status', status);
    if (search)  params = params.set('search', search);
    return this.http.get<any>(`${API_BASE}/orders/admin/all`, { params });
  }

  updateStatus(id: number, status: string, trackingNumber?: string): Observable<any> {
    return this.http.put(`${API_BASE}/orders/admin/${id}/status`, { status, trackingNumber });
  }
}
