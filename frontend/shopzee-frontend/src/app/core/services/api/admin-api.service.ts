import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private http = inject(HttpClient);

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${API_BASE}/admin/dashboard`);
  }

  getCustomers(search?: string, page = 1, pageSize = 20): Observable<any> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${API_BASE}/admin/customers`, { params });
  }

  toggleCustomer(id: number): Observable<any> {
    return this.http.put(`${API_BASE}/admin/customers/${id}/toggle`, {});
  }

  getAnalytics(range = '30d'): Observable<any> {
    return this.http.get<any>(`${API_BASE}/admin/analytics?range=${range}`);
  }
}
