import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  categoryId: number;
  categoryName: string;
  subCategory: string;
  sku: string;
  images: string[];
  colors: string[];
  sizes: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductFilter {
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  search?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private http = inject(HttpClient);

  getAll(filter: ProductFilter = {}): Observable<PagedResult<ApiProduct>> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '')
        params = params.set(k, String(v));
    });
    return this.http.get<PagedResult<ApiProduct>>(`${API_BASE}/products`, { params });
  }

  getById(id: number): Observable<ApiProduct> {
    return this.http.get<ApiProduct>(`${API_BASE}/products/${id}`);
  }

  getBySlug(slug: string): Observable<ApiProduct> {
    return this.http.get<ApiProduct>(`${API_BASE}/products/slug/${slug}`);
  }

  getRelated(id: number): Observable<ApiProduct[]> {
    return this.http.get<ApiProduct[]>(`${API_BASE}/products/${id}/related`);
  }

  getFeatured(): Observable<ApiProduct[]> {
    return this.http.get<ApiProduct[]>(`${API_BASE}/products/featured`);
  }

  getCategories(): Observable<{ id: number; name: string; slug: string }[]> {
    return this.http.get<any[]>(`${API_BASE}/products/categories`);
  }

  // Admin
  create(data: any): Observable<ApiProduct> {
    return this.http.post<ApiProduct>(`${API_BASE}/products`, data);
  }

  update(id: number, data: any): Observable<ApiProduct> {
    return this.http.put<ApiProduct>(`${API_BASE}/products/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/products/${id}`);
  }

  updateSeo(id: number, data: { seoTitle?: string; seoDescription?: string; seoKeywords?: string }): Observable<any> {
    return this.http.put(`${API_BASE}/products/${id}/seo`, data);
  }
}
