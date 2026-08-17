import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SvgIconsComponent } from '../../../../shared/components/svg-icons/svg-icons.component';
import { AuthApiService } from '../../../../core/services/api/auth-api.service';
import { API_BASE } from '../../../../core/services/api/api.config';

interface Reseller {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  whatsApp: string;
  city: string;
  paymentMethod: string;
  accountNumber: string;
  status: string;
  appliedAt: string;
  totalEarnings: number;
  totalOrders: number;
}

@Component({
  selector: 'app-resellers',
  standalone: true,
  imports: [CommonModule, SvgIconsComponent],
  template: `
    <div class="resellers-page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Resellers</h1>
          <p class="page-sub">Manage reseller applications and accounts</p>
        </div>
        <div class="header-stats">
          <div class="stat-pill stat-pill--pending">
            <span class="stat-num">{{ pending().length }}</span>
            <span>Pending</span>
          </div>
          <div class="stat-pill stat-pill--approved">
            <span class="stat-num">{{ approved().length }}</span>
            <span>Approved</span>
          </div>
          <div class="stat-pill stat-pill--rejected">
            <span class="stat-num">{{ rejected().length }}</span>
            <span>Rejected</span>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button class="filter-tab" [class.active]="activeTab() === 'all'"      (click)="activeTab.set('all')">All ({{ resellers().length }})</button>
        <button class="filter-tab" [class.active]="activeTab() === 'pending'"  (click)="activeTab.set('pending')">Pending ({{ pending().length }})</button>
        <button class="filter-tab" [class.active]="activeTab() === 'approved'" (click)="activeTab.set('approved')">Approved ({{ approved().length }})</button>
        <button class="filter-tab" [class.active]="activeTab() === 'rejected'" (click)="activeTab.set('rejected')">Rejected ({{ rejected().length }})</button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading resellers...</p>
        </div>
      }

      <!-- Resellers Table -->
      @if (!loading() && filtered().length === 0) {
        <div class="empty-state">
          <app-icon name="users" [size]="48" class="empty-icon"/>
          <h3>No resellers found</h3>
          <p>{{ activeTab() === 'pending' ? 'No pending applications' : 'No resellers in this category' }}</p>
        </div>
      }

      @if (!loading() && filtered().length > 0) {
        <div class="resellers-table-wrap">
          <table class="resellers-table">
            <thead>
              <tr>
                <th>Reseller</th>
                <th>Business</th>
                <th>Contact</th>
                <th>Payment</th>
                <th>Applied</th>
                <th>Earnings</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of filtered(); track r.id) {
                <tr class="reseller-row" [class.selected]="selectedId() === r.id">
                  <td>
                    <div class="reseller-info">
                      <div class="reseller-avatar">{{ r.name[0] }}</div>
                      <div>
                        <div class="reseller-name">{{ r.name }}</div>
                        <div class="reseller-email">{{ r.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="biz-name">{{ r.businessName }}</div>
                    <div class="biz-city">{{ r.city }}</div>
                  </td>
                  <td>
                    <div class="contact-phone">{{ r.phone }}</div>
                    <div class="contact-wa">
                      <app-icon name="phone" [size]="12"/> {{ r.whatsApp }}
                    </div>
                  </td>
                  <td>
                    <span class="payment-badge">{{ r.paymentMethod }}</span>
                    <div class="account-num">{{ r.accountNumber }}</div>
                  </td>
                  <td class="applied-date">{{ r.appliedAt | date:'dd MMM y' }}</td>
                  <td class="earnings">PKR {{ r.totalEarnings | number }}</td>
                  <td class="orders-count">{{ r.totalOrders }}</td>
                  <td>
                    <span class="status-badge status-{{ r.status }}">{{ r.status }}</span>
                  </td>
                  <td>
                    <div class="action-btns">
                      @if (r.status === 'pending') {
                        <button class="action-btn action-btn--approve"
                          (click)="approve(r.id)"
                          [disabled]="actionLoading()">
                          <app-icon name="check" [size]="14"/> Approve
                        </button>
                        <button class="action-btn action-btn--reject"
                          (click)="openReject(r.id)"
                          [disabled]="actionLoading()">
                          <app-icon name="close" [size]="14"/> Reject
                        </button>
                      }
                      @if (r.status === 'approved') {
                        <button class="action-btn action-btn--reject"
                          (click)="openReject(r.id)"
                          [disabled]="actionLoading()">
                          Suspend
                        </button>
                      }
                      @if (r.status === 'rejected') {
                        <button class="action-btn action-btn--approve"
                          (click)="approve(r.id)"
                          [disabled]="actionLoading()">
                          Re-approve
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Reject Modal -->
      @if (showRejectModal()) {
        <div class="modal-overlay" (click)="showRejectModal.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Reject Reseller</h2>
              <button class="modal-close" (click)="showRejectModal.set(false)">
                <app-icon name="close" [size]="20"/>
              </button>
            </div>
            <div class="modal-body">
              <p>Please provide a reason for rejection:</p>
              <textarea
                class="reject-reason"
                placeholder="e.g. Incomplete information, CNIC mismatch..."
                rows="4"
                #reasonInput
              ></textarea>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="showRejectModal.set(false)">Cancel</button>
              <button class="btn-reject-confirm"
                (click)="confirmReject(reasonInput.value)"
                [disabled]="actionLoading()">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .resellers-page { padding: 2rem; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;
    }

    .page-title { font-family: var(--font-heading); font-size: 2rem; font-weight: 400; margin-bottom: 0.25rem; }
    .page-sub { font-size: 0.875rem; color: var(--gray-400); }

    .header-stats { display: flex; gap: 0.75rem; }

    .stat-pill {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.4rem 0.875rem; border-radius: 20px;
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;

      &--pending  { background: rgba(201,168,76,0.12); color: var(--gold-dark); border: 1px solid rgba(201,168,76,0.3); }
      &--approved { background: rgba(76,175,80,0.1);  color: #388E3C; border: 1px solid rgba(76,175,80,0.3); }
      &--rejected { background: rgba(229,57,53,0.1);  color: #C62828; border: 1px solid rgba(229,57,53,0.3); }

      .stat-num { font-size: 1rem; }
    }

    /* Filter tabs */
    .filter-tabs {
      display: flex; gap: 0; margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--gray-200);
    }

    .filter-tab {
      padding: 0.75rem 1.25rem; background: none; border: none;
      font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; cursor: pointer; color: var(--gray-400);
      border-bottom: 2px solid transparent; margin-bottom: -2px;
      transition: all 0.2s;

      &.active { color: var(--gold-dark); border-bottom-color: var(--gold); }
      &:hover:not(.active) { color: var(--black); }
    }

    /* Loading / Empty */
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: var(--gray-400); }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--gray-200); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 4rem; text-align: center; .empty-icon { color: var(--gray-300); } h3 { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 400; } p { color: var(--gray-400); font-size: 0.875rem; } }

    /* Table */
    .resellers-table-wrap { overflow-x: auto; }

    .resellers-table {
      width: 100%; border-collapse: collapse; font-size: 0.875rem;

      th {
        padding: 0.75rem 1rem; text-align: left;
        font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em;
        text-transform: uppercase; color: var(--gold-dark);
        background: var(--cream-dark); border-bottom: 2px solid var(--gold);
        white-space: nowrap;
      }

      td {
        padding: 0.875rem 1rem; border-bottom: 1px solid var(--gray-200);
        vertical-align: middle;
      }

      tr:hover td { background: rgba(201,168,76,0.03); }
    }

    .reseller-info { display: flex; align-items: center; gap: 0.75rem; }

    .reseller-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-heading); font-weight: 700; color: var(--black);
      font-size: 1rem; flex-shrink: 0;
    }

    .reseller-name { font-weight: 600; color: var(--black); }
    .reseller-email { font-size: 0.75rem; color: var(--gray-400); }
    .biz-name { font-weight: 500; color: var(--black); }
    .biz-city { font-size: 0.75rem; color: var(--gray-400); }
    .contact-phone { font-weight: 500; }
    .contact-wa { font-size: 0.75rem; color: var(--gray-400); display: flex; align-items: center; gap: 3px; }
    .account-num { font-size: 0.75rem; color: var(--gray-400); margin-top: 2px; }

    .payment-badge {
      display: inline-block; padding: 2px 8px; border-radius: 10px;
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      background: rgba(201,168,76,0.12); color: var(--gold-dark);
    }

    .applied-date { color: var(--gray-400); white-space: nowrap; }
    .earnings { font-weight: 600; color: var(--gold-dark); }
    .orders-count { font-weight: 600; text-align: center; }

    .status-badge {
      display: inline-block; padding: 0.25rem 0.75rem;
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      border-radius: 4px;

      &.status-pending  { background: rgba(201,168,76,0.15); color: var(--gold-dark); }
      &.status-approved { background: rgba(76,175,80,0.12); color: #388E3C; }
      &.status-rejected { background: rgba(229,57,53,0.12); color: #C62828; }
    }

    .action-btns { display: flex; gap: 0.5rem; }

    .action-btn {
      display: flex; align-items: center; gap: 0.3rem;
      padding: 0.35rem 0.75rem; border: none; border-radius: 4px;
      font-size: 0.72rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; white-space: nowrap;

      &--approve { background: rgba(76,175,80,0.12); color: #388E3C; &:hover { background: rgba(76,175,80,0.2); } }
      &--reject  { background: rgba(229,57,53,0.1); color: #C62828; &:hover { background: rgba(229,57,53,0.18); } }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(26,26,26,0.6);
      backdrop-filter: blur(4px); z-index: 500;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }

    .modal {
      background: var(--cream-light); border: 1px solid var(--gray-200);
      border-radius: 12px; width: 100%; max-width: 480px;
      box-shadow: 0 24px 60px rgba(26,26,26,0.2); overflow: hidden;
    }

    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 1.5rem; background: var(--black); color: var(--cream);

      h2 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 400; }
    }

    .modal-close { background: none; border: none; color: var(--cream); cursor: pointer; opacity: 0.6; &:hover { opacity: 1; } }

    .modal-body { padding: 1.5rem; p { font-size: 0.875rem; color: var(--gray-500); margin-bottom: 0.75rem; } }

    .reject-reason {
      width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300);
      background: var(--cream); font-family: var(--font-body); font-size: 0.875rem;
      resize: vertical; outline: none; box-sizing: border-box;
      &:focus { border-color: var(--gold); }
    }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.5rem; border-top: 1px solid var(--gray-200);
    }

    .btn-cancel { padding: 0.6rem 1.25rem; background: none; border: 1px solid var(--gray-300); cursor: pointer; font-size: 0.875rem; border-radius: 4px; &:hover { border-color: var(--black); } }
    .btn-reject-confirm { padding: 0.6rem 1.25rem; background: #C62828; color: #fff; border: none; cursor: pointer; font-size: 0.875rem; border-radius: 4px; font-weight: 600; &:hover { background: #a31f1f; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
  `]
})
export class ResellersComponent implements OnInit {
  private http    = inject(HttpClient);
  private authApi = inject(AuthApiService);

  resellers    = signal<Reseller[]>([]);
  loading      = signal(true);
  actionLoading = signal(false);
  activeTab    = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  showRejectModal = signal(false);
  selectedId   = signal<number | null>(null);

  pending  = computed(() => this.resellers().filter(r => r.status === 'pending'));
  approved = computed(() => this.resellers().filter(r => r.status === 'approved'));
  rejected = computed(() => this.resellers().filter(r => r.status === 'rejected'));
  filtered = computed(() => {
    const tab = this.activeTab();
    if (tab === 'all') return this.resellers();
    return this.resellers().filter(r => r.status === tab);
  });

  private get headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.authApi.getToken()}` });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<Reseller[]>(`${API_BASE}/reseller/admin/all`, { headers: this.headers })
      .subscribe({
        next: data => { this.resellers.set(data); this.loading.set(false); },
        error: () => { this.loading.set(false); }
      });
  }

  approve(id: number) {
    this.actionLoading.set(true);
    this.http.put(`${API_BASE}/reseller/admin/${id}/approve`,
      { action: 'approve' }, { headers: this.headers })
      .subscribe({
        next: () => { this.load(); this.actionLoading.set(false); },
        error: () => { this.actionLoading.set(false); }
      });
  }

  openReject(id: number) {
    this.selectedId.set(id);
    this.showRejectModal.set(true);
  }

  confirmReject(reason: string) {
    const id = this.selectedId();
    if (!id) return;
    this.actionLoading.set(true);
    this.http.put(`${API_BASE}/reseller/admin/${id}/approve`,
      { action: 'reject', rejectionReason: reason }, { headers: this.headers })
      .subscribe({
        next: () => {
          this.showRejectModal.set(false);
          this.load();
          this.actionLoading.set(false);
        },
        error: () => { this.actionLoading.set(false); }
      });
  }
}
