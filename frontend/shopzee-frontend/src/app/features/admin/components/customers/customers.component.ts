import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconsComponent } from '../../../../shared/components/svg-icons/svg-icons.component';
import { AdminApiService } from '../../../../core/services/api/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconsComponent],
  template: `
    <div class="admin-section">
      <div class="section-top">
        <h1 class="admin-page-title">Customers</h1>
        <div class="section-actions">
          <input
            type="search"
            [(ngModel)]="search"
            (ngModelChange)="onSearch()"
            placeholder="Search by name or email..."
            class="admin-input"
            aria-label="Search customers"
          />
          <button class="btn btn-outline" (click)="exportCsv()">
            <app-icon name="download" [size]="16"/> Export
          </button>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="cust-stats">
        <div class="c-stat">
          <span class="c-stat-val">{{ totalCount() }}</span>
          <span class="c-stat-label">Total Customers</span>
        </div>
        <div class="c-stat">
          <span class="c-stat-val" style="color:var(--gold-dark)">
            PKR {{ totalRevenue() | number }}
          </span>
          <span class="c-stat-label">Total Revenue</span>
        </div>
        <div class="c-stat">
          <span class="c-stat-val" style="color:#388E3C">{{ activeCount() }}</span>
          <span class="c-stat-label">Active</span>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-row">
          <div class="spinner"></div>
          <span>Loading customers...</span>
        </div>
      }

      @if (!loading()) {
        <div class="table-card">
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (c of customers(); track c.id) {
                  <tr>
                    <td>
                      <div class="cust-cell">
                        <div class="cust-avatar">{{ c.name[0] }}</div>
                        <span class="fw-500">{{ c.name }}</span>
                      </div>
                    </td>
                    <td class="text-sm text-gray">{{ c.email }}</td>
                    <td class="text-sm text-gray">{{ c.phone || '—' }}</td>
                    <td class="fw-500">{{ c.totalOrders }}</td>
                    <td class="fw-500" style="color:var(--gold-dark)">
                      PKR {{ c.totalSpent | number }}
                    </td>
                    <td class="text-xs text-gray">{{ c.joinedAt | date:'MMM y' }}</td>
                    <td>
                      <span class="status-dot" [class]="c.isActive ? 'status-active' : 'status-inactive'">
                        {{ c.isActive ? 'Active' : 'Disabled' }}
                      </span>
                    </td>
                    <td>
                      <button
                        class="icon-btn"
                        [title]="c.isActive ? 'Disable account' : 'Enable account'"
                        (click)="toggleCustomer(c)"
                      >
                        <app-icon [name]="c.isActive ? 'close' : 'check'" [size]="14"/>
                      </button>
                    </td>
                  </tr>
                }
                @if (customers().length === 0) {
                  <tr>
                    <td colspan="8" class="empty-row">No customers found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <span class="page-info">
              Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, totalCount()) }}
              of {{ totalCount() }}
            </span>
            <div class="page-btns">
              <button class="page-btn" [disabled]="page === 1" (click)="goPage(page - 1)">
                <app-icon name="chevron-right" [size]="16" style="transform:rotate(180deg)"/>
              </button>
              <span class="page-num">{{ page }}</span>
              <button
                class="page-btn"
                [disabled]="page * pageSize >= totalCount()"
                (click)="goPage(page + 1)"
              >
                <app-icon name="chevron-right" [size]="16"/>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-section {}
    .section-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
    .admin-page-title { font-family:var(--font-heading); font-size:var(--text-4xl); font-weight:400; }
    .section-actions { display:flex; gap:0.75rem; flex-wrap:wrap; }
    .admin-input { padding:0.5rem 0.875rem; border:1px solid var(--gray-200); background:var(--cream-light); font-size:0.875rem; outline:none; &:focus{border-color:var(--gold);} }
    .cust-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; @media(max-width:600px){grid-template-columns:1fr;} }
    .c-stat { background:var(--cream-light); border:1px solid var(--gray-200); padding:1.25rem; text-align:center; }
    .c-stat-val { display:block; font-family:var(--font-heading); font-size:2rem; font-weight:500; }
    .c-stat-label { font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--gray-400); }
    .loading-row { display:flex; align-items:center; gap:1rem; padding:2rem; color:var(--gray-400); }
    .spinner { width:24px; height:24px; border:2px solid var(--gray-200); border-top-color:var(--gold); border-radius:50%; animation:spin 0.7s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg);} }
    .table-card { background:var(--cream-light); border:1px solid var(--gray-200); overflow:hidden; }
    .table-wrap { overflow-x:auto; }
    .cust-cell { display:flex; align-items:center; gap:0.75rem; }
    .cust-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--gold),var(--gold-dark)); display:flex; align-items:center; justify-content:center; font-family:var(--font-heading); font-size:1rem; font-weight:600; color:var(--black); flex-shrink:0; }
    .fw-500 { font-weight:500; font-size:0.875rem; }
    .text-sm { font-size:0.8125rem; }
    .text-xs { font-size:0.75rem; }
    .text-gray { color:var(--gray-400); }
    .empty-row { text-align:center; padding:2rem; color:var(--gray-400); font-size:0.875rem; }
    .status-dot { font-size:0.75rem; font-weight:600; display:flex; align-items:center; gap:0.35rem;
      &::before{ content:''; width:6px; height:6px; border-radius:50%; background:currentColor; }
      &.status-active   { color:#388E3C; }
      &.status-inactive { color:#C62828; }
    }
    .icon-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:none; border:1px solid var(--gray-200); cursor:pointer; color:var(--gray-400); transition:all 0.2s; &:hover{border-color:var(--gold);color:var(--gold);} }
    .pagination { display:flex; align-items:center; justify-content:space-between; padding:0.875rem 1rem; border-top:1px solid var(--gray-200); }
    .page-info { font-size:0.8125rem; color:var(--gray-400); }
    .page-btns { display:flex; align-items:center; gap:0.5rem; }
    .page-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:none; border:1px solid var(--gray-200); cursor:pointer; color:var(--gray-400); &:disabled{opacity:0.4;cursor:default;} &:not(:disabled):hover{border-color:var(--gold);color:var(--gold);} }
    .page-num { font-size:0.875rem; font-weight:600; padding:0 0.5rem; }
  `]
})
export class CustomersComponent implements OnInit {
  private adminApi = inject(AdminApiService);
  private toast    = inject(ToastService);

  customers  = signal<any[]>([]);
  loading    = signal(false);
  totalCount = signal(0);
  totalRevenue = signal(0);
  activeCount  = signal(0);

  page     = 1;
  pageSize = 20;
  search   = '';

  protected readonly Math = Math;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminApi.getCustomers(this.search || undefined, this.page, this.pageSize).subscribe({
      next: res => {
        this.customers.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalRevenue.set(
          res.items.reduce((s: number, c: any) => s + (c.totalSpent || 0), 0)
        );
        this.activeCount.set(res.items.filter((c: any) => c.isActive).length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load customers.');
      }
    });
  }

  onSearch() { this.page = 1; this.load(); }
  goPage(p: number) { this.page = p; this.load(); }

  toggleCustomer(c: any) {
    this.adminApi.toggleCustomer(c.id).subscribe({
      next: res => {
        c.isActive = res.isActive;
        this.toast.success(`${c.name} ${res.isActive ? 'enabled' : 'disabled'}.`);
      },
      error: () => this.toast.error('Failed to update customer.')
    });
  }

  exportCsv() {
    const rows = [
      ['Name','Email','Phone','Orders','Total Spent','Joined','Active'],
      ...this.customers().map(c => [
        c.name, c.email, c.phone || '',
        c.totalOrders, c.totalSpent,
        new Date(c.joinedAt).toLocaleDateString(),
        c.isActive ? 'Yes' : 'No'
      ])
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
