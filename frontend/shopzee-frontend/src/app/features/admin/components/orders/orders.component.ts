import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconsComponent } from '../../../../shared/components/svg-icons/svg-icons.component';
import { OrderApiService } from '../../../../core/services/api/order-api.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconsComponent],
  template: `
    <div class="admin-section">
      <!-- Header -->
      <div class="section-top">
        <h1 class="admin-page-title">Orders</h1>
        <div class="section-actions">
          <input
            type="search"
            [(ngModel)]="search"
            (ngModelChange)="onSearchChange()"
            placeholder="Search by order # or name..."
            class="admin-input"
            aria-label="Search orders"
          />
          <select
            [(ngModel)]="statusFilter"
            (ngModelChange)="onFilterChange()"
            class="admin-select"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button class="btn btn-outline" (click)="exportCsv()">
            <app-icon name="download" [size]="16"/> Export CSV
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="orders-stats">
        @for (stat of stats(); track stat.label) {
          <div class="o-stat">
            <span class="o-stat-val" [class]="stat.color">{{ stat.value }}</span>
            <span class="o-stat-label">{{ stat.label }}</span>
          </div>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-row">
          <div class="spinner"></div>
          <span>Loading orders...</span>
        </div>
      }

      <!-- Table -->
      @if (!loading()) {
        <div class="table-card">
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr>
                    <td class="order-id-cell">#{{ order.orderNumber }}</td>
                    <td>
                      <div>
                        <span class="fw-500">{{ order.customerName }}</span><br/>
                        <span class="text-xs text-gray">{{ order.customerEmail }}</span>
                      </div>
                    </td>
                    <td>{{ order.itemCount }} items</td>
                    <td class="fw-500">PKR {{ order.total | number }}</td>
                    <td>
                      <select
                        class="status-select"
                        [value]="order.status"
                        (change)="updateStatus(order, $any($event.target).value)"
                        [class]="'sel-' + order.status"
                        aria-label="Update status"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td class="text-xs text-gray">{{ order.createdAt | date:'MMM d, y' }}</td>
                    <td>
                      <button class="icon-btn" (click)="viewOrder(order)" aria-label="View order">
                        <app-icon name="eye" [size]="16"/>
                      </button>
                    </td>
                  </tr>
                }

                @if (orders().length === 0) {
                  <tr>
                    <td colspan="7" class="empty-row">No orders found.</td>
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
              <button class="page-btn" [disabled]="page * pageSize >= totalCount()" (click)="goPage(page + 1)">
                <app-icon name="chevron-right" [size]="16"/>
              </button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Order Detail Modal -->
    @if (selected()) {
      <div class="overlay" (click)="selected.set(null)"></div>
      <div class="admin-modal" role="dialog" aria-modal="true" aria-label="Order details">
        <div class="modal-header">
          <h2>Order #{{ selected()!.orderNumber }}</h2>
          <button (click)="selected.set(null)" aria-label="Close">
            <app-icon name="close" [size]="20"/>
          </button>
        </div>
        <div class="modal-body">
          <!-- Info grid -->
          <div class="detail-grid">
            <div>
              <p class="detail-label">Customer</p>
              <p class="fw-500">{{ selected()!.customerName }}</p>
              <p class="text-sm text-gray">{{ selected()!.customerEmail }}</p>
            </div>
            <div>
              <p class="detail-label">Payment</p>
              <p class="fw-500">{{ selected()!.paymentMethod | titlecase }}</p>
              <span class="pay-badge" [class]="'pay-' + selected()!.paymentStatus">
                {{ selected()!.paymentStatus | titlecase }}
              </span>
            </div>
            <div>
              <p class="detail-label">Amount</p>
              <p class="fw-500" style="color:var(--gold-dark)">PKR {{ selected()!.total | number }}</p>
              <p class="text-xs text-gray">{{ selected()!.itemCount }} items</p>
            </div>
            <div>
              <p class="detail-label">Ordered On</p>
              <p class="fw-500">{{ selected()!.createdAt | date:'MMM d, y, h:mm a' }}</p>
            </div>
          </div>

          <!-- Order timeline -->
          <div class="timeline">
            @for (step of getTimeline(selected()!.status); track step.label) {
              <div class="tl-step" [class.done]="step.done">
                <div class="tl-dot"></div>
                <div>
                  <span class="tl-label">{{ step.label }}</span>
                  <span class="tl-time">{{ step.done ? 'Completed' : 'Pending' }}</span>
                </div>
              </div>
            }
          </div>

          <!-- Update status -->
          <div class="status-update">
            <p class="detail-label">Update Status</p>
            <div class="status-update-row">
              <select
                class="admin-select"
                [(ngModel)]="newStatus"
                aria-label="New status"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="text"
                [(ngModel)]="trackingNo"
                placeholder="Tracking number (optional)"
                class="admin-input"
              />
              <button class="btn btn-primary" (click)="applyStatus()">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-section {}
    .section-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
    .admin-page-title { font-family:var(--font-heading); font-size:var(--text-4xl); font-weight:400; }
    .section-actions { display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; }
    .admin-input { padding:0.5rem 0.875rem; border:1px solid var(--gray-200); background:var(--cream-light); font-size:0.875rem; outline:none; &:focus{border-color:var(--gold);} }
    .admin-select { padding:0.5rem 0.875rem; border:1px solid var(--gray-200); background:var(--cream-light); font-size:0.875rem; outline:none; }
    .orders-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:1rem; margin-bottom:1.5rem; @media(max-width:900px){grid-template-columns:repeat(3,1fr);} }
    .o-stat { background:var(--cream-light); border:1px solid var(--gray-200); padding:1rem; text-align:center; }
    .o-stat-val { display:block; font-family:var(--font-heading); font-size:1.75rem; font-weight:500; }
    .o-stat-label { font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--gray-400); }
    .c-gold{color:var(--gold-dark);} .c-blue{color:#1565C0;} .c-orange{color:#E65100;} .c-green{color:#388E3C;} .c-red{color:#C62828;}
    .loading-row { display:flex; align-items:center; gap:1rem; padding:2rem; color:var(--gray-400); }
    .spinner { width:24px; height:24px; border:2px solid var(--gray-200); border-top-color:var(--gold); border-radius:50%; animation:spin 0.7s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg);} }
    .table-card { background:var(--cream-light); border:1px solid var(--gray-200); overflow:hidden; }
    .table-wrap { overflow-x:auto; }
    .order-id-cell { color:var(--gold-dark); font-weight:700; white-space:nowrap; }
    .fw-500 { font-weight:500; font-size:0.875rem; }
    .text-xs { font-size:0.75rem; }
    .text-sm { font-size:0.8125rem; }
    .text-gray { color:var(--gray-400); }
    .empty-row { text-align:center; padding:2rem; color:var(--gray-400); font-size:0.875rem; }
    .status-select { padding:0.25rem 0.5rem; border:1px solid var(--gray-200); font-size:0.75rem; font-weight:600; cursor:pointer; outline:none; background:var(--cream);
      &.sel-delivered{border-color:#4CAF50;color:#388E3C;background:rgba(76,175,80,0.08);}
      &.sel-processing{border-color:var(--gold);color:var(--gold-dark);background:rgba(201,168,76,0.08);}
      &.sel-shipped{border-color:#2196F3;color:#1565C0;background:rgba(33,150,243,0.08);}
      &.sel-pending{border-color:var(--gray-300);color:var(--gray-500);}
      &.sel-cancelled{border-color:var(--black);color:var(--black);background:rgba(26,26,26,0.05);}
    }
    .icon-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:none; border:1px solid var(--gray-200); cursor:pointer; color:var(--gray-400); transition:all 0.2s; &:hover{border-color:var(--gold);color:var(--gold);} }
    .pagination { display:flex; align-items:center; justify-content:space-between; padding:0.875rem 1rem; border-top:1px solid var(--gray-200); }
    .page-info { font-size:0.8125rem; color:var(--gray-400); }
    .page-btns { display:flex; align-items:center; gap:0.5rem; }
    .page-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:none; border:1px solid var(--gray-200); cursor:pointer; color:var(--gray-400); &:disabled{opacity:0.4;cursor:default;} &:not(:disabled):hover{border-color:var(--gold);color:var(--gold);} }
    .page-num { font-size:0.875rem; font-weight:600; padding:0 0.5rem; }
    .admin-modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:var(--cream-light); z-index:var(--z-modal); width:90%; max-width:580px; max-height:90vh; overflow-y:auto; border:1px solid var(--gray-200); box-shadow:var(--shadow-xl); }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid var(--gray-200); h2{font-family:var(--font-heading);font-size:var(--text-2xl);} button{background:none;border:none;cursor:pointer;} }
    .modal-body { padding:1.5rem; }
    .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.5rem; }
    .detail-label { font-size:0.7rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold-dark); margin-bottom:0.25rem; }
    .pay-badge { display:inline-block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:0.15rem 0.5rem; }
    .pay-paid   { background:rgba(76,175,80,0.12);  color:#388E3C; }
    .pay-pending{ background:rgba(255,152,0,0.12);  color:#E65100; }
    .timeline { border-left:2px solid var(--gray-200); padding-left:1.25rem; margin-bottom:1.5rem; }
    .tl-step { display:flex; gap:0.75rem; margin-bottom:1rem; position:relative;
      .tl-dot { width:12px; height:12px; border-radius:50%; background:var(--gray-300); flex-shrink:0; margin-top:3px; position:relative; left:-1.375rem; }
      &.done .tl-dot { background:var(--gold); }
      &.done .tl-label { color:var(--black); }
    }
    .tl-label { font-size:0.875rem; font-weight:500; color:var(--gray-400); display:block; }
    .tl-time  { font-size:0.75rem; color:var(--gray-400); }
    .status-update { padding-top:1rem; border-top:1px solid var(--gray-200); }
    .status-update-row { display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:0.75rem; align-items:center; }
  `]
})
export class OrdersComponent implements OnInit {
  private orderApi = inject(OrderApiService);
  private toast    = inject(ToastService);

  orders     = signal<any[]>([]);
  stats      = signal<any[]>([]);
  loading    = signal(false);
  selected   = signal<any>(null);
  totalCount = signal(0);

  page       = 1;
  pageSize   = 15;
  search     = '';
  statusFilter = '';
  newStatus  = 'processing';
  trackingNo = '';

  protected readonly Math = Math;

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.loading.set(true);
    this.orderApi.getAllOrders(
      this.statusFilter || undefined,
      this.search       || undefined,
      this.page,
      this.pageSize
    ).subscribe({
      next: res => {
        this.orders.set(res.items);
        this.totalCount.set(res.totalCount);
        this.buildStats(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load orders.');
      }
    });
  }

  private buildStats(orders: any[]) {
    const total      = this.totalCount();
    const pending    = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const delivered  = orders.filter(o => o.status === 'delivered').length;
    const cancelled  = orders.filter(o => o.status === 'cancelled').length;

    this.stats.set([
      { label:'Total Orders', value: String(total),      color:'c-gold'   },
      { label:'Pending',      value: String(pending),    color:'c-orange' },
      { label:'Processing',   value: String(processing), color:'c-blue'   },
      { label:'Delivered',    value: String(delivered),  color:'c-green'  },
      { label:'Cancelled',    value: String(cancelled),  color:'c-red'    }
    ]);
  }

  onSearchChange() { this.page = 1; this.loadOrders(); }
  onFilterChange() { this.page = 1; this.loadOrders(); }
  goPage(p: number){ this.page = p; this.loadOrders(); }

  viewOrder(order: any) {
    this.selected.set(order);
    this.newStatus  = order.status;
    this.trackingNo = order.trackingNumber || '';
  }

  updateStatus(order: any, status: string) {
    this.orderApi.updateStatus(order.id, status).subscribe({
      next: () => {
        order.status = status;
        this.toast.success(`Order #${order.orderNumber} → ${status}`);
      },
      error: () => this.toast.error('Failed to update status.')
    });
  }

  applyStatus() {
    const o = this.selected();
    if (!o) return;
    this.orderApi.updateStatus(o.id, this.newStatus, this.trackingNo || undefined).subscribe({
      next: () => {
        o.status = this.newStatus;
        this.toast.success('Status updated successfully.');
        this.selected.set(null);
        this.loadOrders();
      },
      error: () => this.toast.error('Failed to update status.')
    });
  }

  exportCsv() {
    const rows = [
      ['Order #', 'Customer', 'Email', 'Total', 'Status', 'Date'],
      ...this.orders().map(o => [
        o.orderNumber, o.customerName, o.customerEmail,
        o.total, o.status, new Date(o.createdAt).toLocaleDateString()
      ])
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  getTimeline(status: string) {
    const steps = ['pending','processing','shipped','delivered'];
    const idx   = steps.indexOf(status);
    return [
      { label:'Order Placed', done: idx >= 0 },
      { label:'Processing',   done: idx >= 1 },
      { label:'Shipped',      done: idx >= 2 },
      { label:'Delivered',    done: idx >= 3 }
    ];
  }
}
