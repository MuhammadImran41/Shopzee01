import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { AuthApiService } from '../../core/services/api/auth-api.service';
import { ToastService } from '../../core/services/toast.service';
import { API_BASE } from '../../core/services/api/api.config';

interface ResellerProfile {
  id: number;
  name: string;
  email: string;
  businessName: string;
  whatsApp: string;
  city: string;
  status: string;
  paymentMethod: string;
  accountNumber: string;
  totalEarnings: number;
  pendingEarnings: number;
  withdrawnAmount: number;
  totalOrders: number;
}

interface Product {
  id: number;
  name: string;
  subCategory: string;
  price: number;
  originalPrice?: number;
  images: string;
  sizes: string;
  colors: string;
  stock: number;
  rating: number;
  category: string;
}

interface ResellerOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  paymentMethod: string;
  subTotal: number;
  shippingCost: number;
  resellerProfit: number;
  totalAmount: number;
  status: string;
  trackingNumber?: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  productName: string;
  productImage: string;
  basePrice: number;
  resellerPrice: number;
  profit: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

@Component({
  selector: 'app-reseller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SvgIconsComponent],
  template: `
    <div class="rd-page">

      <!-- ── PENDING APPROVAL STATE ───────────────────────── -->
      @if (profile() && profile()!.status === 'pending') {
        <div class="rd-pending">
          <div class="rd-pending__icon">⏳</div>
          <h2>Application Under Review</h2>
          <p>Your reseller application has been submitted. Our team will review it within <strong>24 hours</strong>.</p>
          <div class="rd-pending__info">
            <div class="info-row"><span>Business</span><strong>{{ profile()!.businessName }}</strong></div>
            <div class="info-row"><span>Applied</span><strong>Application Pending</strong></div>
            <div class="info-row"><span>Status</span><span class="badge-pending">Pending Review</span></div>
          </div>
          <a routerLink="/" class="btn btn-outline" style="margin-top:2rem">Back to Home</a>
        </div>
      }

      <!-- ── REJECTED STATE ─────────────────────────────────── -->
      @if (profile() && profile()!.status === 'rejected') {
        <div class="rd-pending rd-pending--rejected">
          <div class="rd-pending__icon">❌</div>
          <h2>Application Not Approved</h2>
          <p>Unfortunately your reseller application was not approved at this time.</p>
          <a routerLink="/" class="btn btn-primary" style="margin-top:2rem">Back to Home</a>
        </div>
      }

      <!-- ── NOT LOGGED IN ──────────────────────────────────── -->
      @if (!profile() && !loading()) {
        <div class="rd-pending">
          <div class="rd-pending__icon">🔐</div>
          <h2>Reseller Portal</h2>
          <p>Please login with your reseller account to access the dashboard.</p>
          <a routerLink="/" class="btn btn-primary" style="margin-top:2rem">Go to Home</a>
        </div>
      }

      <!-- ── LOADING ────────────────────────────────────────── -->
      @if (loading()) {
        <div class="rd-loading">
          <div class="rd-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      }

      <!-- ── APPROVED DASHBOARD ──────────────────────────────── -->
      @if (profile() && profile()!.status === 'approved') {
        <!-- Header -->
        <div class="rd-header">
          <div class="rd-header__left">
            <div class="rd-avatar">{{ profile()!.name[0] }}</div>
            <div>
              <h1 class="rd-title">{{ profile()!.businessName }}</h1>
              <p class="rd-sub">Welcome back, {{ profile()!.name }} · Reseller Dashboard</p>
            </div>
          </div>
          <div class="rd-header__right">
            <a routerLink="/" class="btn btn-ghost btn-sm">← Back to Store</a>
          </div>
        </div>

        <!-- Stats -->
        <div class="rd-stats">
          <div class="rd-stat">
            <span class="rd-stat__label">Total Earned</span>
            <span class="rd-stat__value gold">PKR {{ profile()!.totalEarnings | number }}</span>
          </div>
          <div class="rd-stat">
            <span class="rd-stat__label">Pending Earnings</span>
            <span class="rd-stat__value">PKR {{ profile()!.pendingEarnings | number }}</span>
          </div>
          <div class="rd-stat">
            <span class="rd-stat__label">Withdrawn</span>
            <span class="rd-stat__value">PKR {{ profile()!.withdrawnAmount | number }}</span>
          </div>
          <div class="rd-stat">
            <span class="rd-stat__label">Total Orders</span>
            <span class="rd-stat__value">{{ profile()!.totalOrders }}</span>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="rd-tabs">
          <button class="rd-tab" [class.active]="activeTab() === 'products'" (click)="activeTab.set('products')">
            <app-icon name="package" [size]="16"/> Products
          </button>
          <button class="rd-tab" [class.active]="activeTab() === 'order'" (click)="activeTab.set('order')">
            <app-icon name="cart" [size]="16"/> Place Order
          </button>
          <button class="rd-tab" [class.active]="activeTab() === 'orders'" (click)="activeTab.set('orders')">
            <app-icon name="bag" [size]="16"/> My Orders
            @if (orders().length > 0) {
              <span class="rd-tab-badge">{{ orders().length }}</span>
            }
          </button>
        </div>

        <!-- ── PRODUCTS TAB ───────────────────────────────── -->
        @if (activeTab() === 'products') {
          <div class="rd-products-header">
            <div class="rd-search-wrap">
              <app-icon name="search" [size]="16" class="rd-search-icon"/>
              <input class="rd-search" [(ngModel)]="productSearch"
                placeholder="Search products..." type="search"/>
            </div>
            <div class="rd-filter-btns">
              <button class="rd-filter-btn" [class.active]="productFilter() === 'all'"   (click)="productFilter.set('all')">All</button>
              <button class="rd-filter-btn" [class.active]="productFilter() === 'women'" (click)="productFilter.set('women')">Women</button>
              <button class="rd-filter-btn" [class.active]="productFilter() === 'men'"   (click)="productFilter.set('men')">Men</button>
            </div>
          </div>

          <div class="rd-products-grid">
            @for (p of filteredProducts(); track p.id) {
              <div class="rd-product-card">
                <div class="rd-product-img-wrap">
                  <img [src]="getFirstImage(p.images)" [alt]="p.name" loading="lazy"/>
                  <!-- Badges only -->
                  <span class="rd-cat-badge">{{ p.category }}</span>
                  <span class="rd-stock-badge" [class.low]="p.stock < 5">
                    {{ p.stock }} in stock
                  </span>
                </div>
                <div class="rd-product-info">
                  <p class="rd-product-sub">{{ p.subCategory }}</p>
                  <h3 class="rd-product-name">{{ p.name }}</h3>
                  <div class="rd-price-info">
                    <div class="rd-price-row">
                      <span class="rd-price-label">Base Price</span>
                      <span class="rd-price-val">PKR {{ p.price | number }}</span>
                    </div>
                    <div class="rd-price-row rd-price-row--hint">
                      <span class="rd-price-label">You set your selling price</span>
                      <span class="rd-price-arrow">→</span>
                    </div>
                  </div>
                  <div class="rd-card-actions">
                    <button class="rd-card-btn rd-card-btn--order" (click)="startOrder(p)">
                      <app-icon name="cart" [size]="14"/> Place Order
                    </button>
                    <button class="rd-card-btn rd-card-btn--dl" (click)="downloadImage(p)">
                      <app-icon name="download" [size]="14"/>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- ── PLACE ORDER TAB ────────────────────────────── -->
        @if (activeTab() === 'order') {
          <div class="rd-order-wrap">

            @if (orderSuccess()) {
              <div class="rd-order-success">
                <div class="success-check">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3>Order Placed Successfully!</h3>
                <p>Your profit on this order:</p>
                <div class="success-profit">PKR {{ lastProfit() | number }}</div>
                <button class="rd-submit-btn" (click)="resetOrder()">Place Another Order</button>
              </div>
            } @else {
              <form (submit)="submitOrder($event)" class="rd-order-form-grid">

                <!-- LEFT: Form -->
                <div class="rd-form-col">

                  <!-- Customer Details -->
                  <div class="rd-form-section">
                    <div class="rfs-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Customer Details
                    </div>
                    <div class="rfs-body">
                      <div class="rfs-row">
                        <div class="rfs-field">
                          <label>Customer Name <span class="req">*</span></label>
                          <input type="text" [(ngModel)]="orderForm.customerName" name="cust_name" placeholder="Full name" required/>
                        </div>
                        <div class="rfs-field">
                          <label>Phone Number <span class="req">*</span></label>
                          <input type="tel" [(ngModel)]="orderForm.customerPhone" name="cust_phone" placeholder="03XX XXXXXXX" required/>
                        </div>
                      </div>
                      <div class="rfs-row">
                        <div class="rfs-field">
                          <label>City <span class="req">*</span></label>
                          <input type="text" [(ngModel)]="orderForm.customerCity" name="cust_city" placeholder="Lahore, Karachi, Islamabad..." required/>
                        </div>
                        <div class="rfs-field">
                          <label>Payment Method</label>
                          <select [(ngModel)]="orderForm.paymentMethod" name="cust_pay" class="rfs-select">
                            <option value="cod">Cash on Delivery</option>
                            <option value="easypaisa">EasyPaisa</option>
                            <option value="jazzcash">JazzCash</option>
                            <option value="bank">Bank Transfer</option>
                          </select>
                        </div>
                      </div>
                      <div class="rfs-field rfs-field--full">
                        <label>Full Address <span class="req">*</span></label>
                        <input type="text" [(ngModel)]="orderForm.customerAddress" name="cust_addr" placeholder="House #, Street, Area, Colony" required/>
                      </div>
                      <div class="rfs-field rfs-field--full">
                        <label>Notes (Optional)</label>
                        <input type="text" [(ngModel)]="orderForm.notes" name="notes" placeholder="Special instructions, colour preference, etc."/>
                      </div>
                    </div>
                  </div>

                  <!-- Order Items -->
                  <div class="rd-form-section">
                    <div class="rfs-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                      Order Items
                      <button type="button" class="rfs-add-btn" (click)="addOrderItem()">+ Add Product</button>
                    </div>
                    <div class="rfs-body">
                      @for (item of orderItems(); track $index; let i = $index) {
                        <div class="rfs-item-card">
                          <div class="rfs-item-top">
                            <select class="rfs-select rfs-item-select"
                              [(ngModel)]="item.productId" [name]="'item_prod_'+i"
                              (ngModelChange)="onProductSelect(i,$event)">
                              <option [value]="0">— Select Product —</option>
                              @for (p of products(); track p.id) {
                                <option [value]="p.id">{{ p.name }} — PKR {{ p.price | number }}</option>
                              }
                            </select>
                            @if (orderItems().length > 1) {
                              <button type="button" class="rfs-remove-btn" (click)="removeItem(i)" aria-label="Remove">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            }
                          </div>

                          @if (item.productId > 0) {
                            <div class="rfs-item-details">
                              <div class="rfs-item-field">
                                <label>Size</label>
                                <select class="rfs-select-sm" [(ngModel)]="item.selectedSize" [name]="'sz_'+i">
                                  @for (s of getSizes(item.productId); track s) {
                                    <option [value]="s">{{ s }}</option>
                                  }
                                </select>
                              </div>
                              <div class="rfs-item-field">
                                <label>Quantity</label>
                                <input class="rfs-input-sm" type="number" [(ngModel)]="item.quantity" [name]="'qty_'+i" min="1" max="50"/>
                              </div>
                              <div class="rfs-item-field">
                                <label>Your Selling Price (PKR)</label>
                                <input class="rfs-input-sm rfs-price-input" type="number"
                                  [(ngModel)]="item.resellerPrice" [name]="'price_'+i"
                                  [min]="getBasePrice(item.productId)"
                                  [placeholder]="getBasePrice(item.productId)"/>
                              </div>
                              <div class="rfs-item-profit">
                                <span class="iprofit-label">Your Profit</span>
                                <span class="iprofit-val">PKR {{ (item.resellerPrice - getBasePrice(item.productId)) * item.quantity | number }}</span>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>

                  @if (orderError()) {
                    <div class="rfs-error">{{ orderError() }}</div>
                  }

                  <button type="submit" class="rd-submit-btn" [disabled]="orderLoading()">
                    @if (orderLoading()) {
                      <div class="btn-spinner"></div> Placing Order...
                    } @else {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                      Place Order — Earn PKR {{ orderTotalProfit() | number }}
                    }
                  </button>
                </div>

                <!-- RIGHT: Live Order Summary -->
                <aside class="rd-summary-col">
                  <div class="rd-summary-card">
                    <div class="rsc-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                      Order Summary
                    </div>

                    <!-- Items preview -->
                    @if (orderItems().length > 0 && orderItems()[0].productId > 0) {
                      <div class="rsc-items">
                        @for (item of orderItems(); track $index) {
                          @if (item.productId > 0) {
                            <div class="rsc-item">
                              <div class="rsc-item-name">{{ getProductName(item.productId) }}</div>
                              <div class="rsc-item-meta">
                                {{ item.selectedSize }} × {{ item.quantity }}
                                @if (item.resellerPrice > 0) {
                                  · PKR {{ item.resellerPrice | number }}
                                }
                              </div>
                            </div>
                          }
                        }
                      </div>
                    } @else {
                      <div class="rsc-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.2)" stroke-width="1.5" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/></svg>
                        <p>Select products to see summary</p>
                      </div>
                    }

                    <div class="rsc-divider"></div>

                    <!-- Totals -->
                    <div class="rsc-row"><span>Subtotal (Base)</span><span>PKR {{ orderSubTotal() | number }}</span></div>
                    <div class="rsc-row"><span>Shipping</span><span>{{ orderSubTotal() >= 5000 ? 'Free' : 'PKR 300' }}</span></div>
                    <div class="rsc-divider"></div>
                    <div class="rsc-row rsc-total"><span>Customer Pays</span><span>PKR {{ (orderSubTotal() + (orderSubTotal() >= 5000 ? 0 : 300)) | number }}</span></div>

                    <!-- Profit highlight -->
                    <div class="rsc-profit-box">
                      <div class="rpb-label">Your Total Profit</div>
                      <div class="rpb-value">PKR {{ orderTotalProfit() | number }}</div>
                      @if (orderTotalProfit() > 0) {
                        <div class="rpb-note">✓ Will be added to your earnings after delivery</div>
                      }
                    </div>

                    <!-- Tips -->
                    <div class="rsc-tips">
                      <div class="tip">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Set your selling price higher than base to earn profit
                      </div>
                      <div class="tip">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Free shipping when base total ≥ PKR 5,000
                      </div>
                      <div class="tip">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Profit paid within 24 hrs of delivery
                      </div>
                    </div>
                  </div>
                </aside>

              </form>
            }
          </div>
        }

        <!-- ── MY ORDERS TAB ──────────────────────────────── -->
        @if (activeTab() === 'orders') {
          <div class="rd-orders">
            <h2 class="rd-section-title">My Orders</h2>

            @if (ordersLoading()) {
              <div class="rd-loading"><div class="rd-spinner"></div></div>
            }

            @if (!ordersLoading() && orders().length === 0) {
              <div class="rd-empty">
                <app-icon name="bag" [size]="48" class="empty-icon"/>
                <p>No orders yet. Place your first order!</p>
                <button class="btn btn-primary" (click)="activeTab.set('order')">Place Order</button>
              </div>
            }

            @for (order of orders(); track order.id) {
              <div class="rd-order-card">
                <div class="rd-order-card__header">
                  <div class="rd-order-card__left">
                    <span class="order-id">#{{ order.id }}</span>
                    <span class="order-customer">{{ order.customerName }}</span>
                    <span class="order-city">{{ order.customerCity }}</span>
                  </div>
                  <div class="rd-order-card__right">
                    <span class="order-profit">+PKR {{ order.resellerProfit | number }}</span>
                    <span class="order-status status-{{ order.status }}">{{ order.status }}</span>
                    <span class="order-date">{{ order.createdAt | date:'dd MMM' }}</span>
                  </div>
                </div>
                <div class="rd-order-card__items">
                  @for (item of order.items; track item.productName) {
                    <div class="order-item-mini">
                      <img [src]="item.productImage" [alt]="item.productName" loading="lazy"/>
                      <div>
                        <div class="oim-name">{{ item.productName }}</div>
                        <div class="oim-meta">{{ item.selectedSize }} × {{ item.quantity }} | Sell: PKR {{ item.resellerPrice | number }} | Profit: PKR {{ item.profit | number }}</div>
                      </div>
                    </div>
                  }
                </div>
                @if (order.trackingNumber) {
                  <div class="rd-tracking">
                    <app-icon name="truck" [size]="14"/> Tracking: <strong>{{ order.trackingNumber }}</strong>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .rd-page {
      padding-top: calc(100px + 2rem);
      padding-bottom: 4rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      @media (max-width: 768px) { padding-top: calc(90px + 1rem); padding-left: 1rem; padding-right: 1rem; }
    }

    /* ── Loading ─────────────────────────────────────── */
    .rd-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: var(--gray-400); }
    .rd-spinner { width: 40px; height: 40px; border: 3px solid var(--gray-200); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Pending / Rejected ──────────────────────────── */
    .rd-pending {
      max-width: 480px; margin: 4rem auto; text-align: center; padding: 3rem 2rem;
      background: var(--cream-light); border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-md);

      &__icon { font-size: 3rem; margin-bottom: 1rem; }
      h2 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 400; margin-bottom: 0.75rem; }
      p  { color: var(--gray-500); font-size: 0.9rem; line-height: 1.7; margin-bottom: 1.5rem; }

      &--rejected h2 { color: #C62828; }
    }

    .rd-pending__info {
      background: var(--cream); border: 1px solid var(--gray-200); padding: 1rem 1.5rem;
      display: flex; flex-direction: column; gap: 0.5rem; text-align: left;
    }

    .info-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--gray-500); }
    .badge-pending { background: rgba(201,168,76,0.15); color: var(--gold-dark); padding: 2px 8px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }

    /* ── Header ──────────────────────────────────────── */
    .rd-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap;

      &__left { display: flex; align-items: center; gap: 1rem; }
    }

    .rd-avatar {
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: var(--black);
    }

    .rd-title { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 400; }
    .rd-sub   { font-size: 0.8rem; color: var(--gray-400); margin-top: 2px; }

    .btn-sm { padding: 0.5rem 1rem; font-size: 0.75rem; }

    /* ── Stats ───────────────────────────────────────── */
    .rd-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
      margin-bottom: 2rem;
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 400px) { grid-template-columns: 1fr 1fr; }
    }

    .rd-stat {
      background: var(--cream-light); border: 1px solid var(--gray-200);
      padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.25rem;

      &__label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-400); }
      &__value { font-family: var(--font-heading); font-size: 1.4rem; font-weight: 400; color: var(--black); &.gold { color: var(--gold-dark); } }
    }

    /* ── Tabs ────────────────────────────────────────── */
    .rd-tabs {
      display: flex; gap: 0; border-bottom: 2px solid var(--gray-200); margin-bottom: 1.75rem;
    }

    .rd-tab {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.75rem 1.5rem; background: none; border: none;
      font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
      cursor: pointer; color: var(--gray-400);
      border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s;
      &.active { color: var(--gold-dark); border-bottom-color: var(--gold); }
      &:hover:not(.active) { color: var(--black); }
      @media (max-width: 480px) { padding: 0.75rem 0.875rem; font-size: 0.72rem; }
    }

    .rd-tab-badge {
      background: var(--gold); color: var(--black); border-radius: 10px;
      font-size: 0.6rem; font-weight: 700; padding: 1px 6px; min-width: 18px; text-align: center;
    }

    /* ── Products ────────────────────────────────────── */
    .rd-products-header {
      display: flex; justify-content: space-between; align-items: center;
      gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;
    }

    .rd-search-wrap { position: relative; flex: 1; min-width: 200px; }
    .rd-search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
    .rd-search {
      width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem;
      border: 1px solid var(--gray-300); background: var(--cream-light);
      font-family: var(--font-body); font-size: 0.875rem; outline: none; box-sizing: border-box;
      &:focus { border-color: var(--gold); }
    }

    .rd-filter-btns { display: flex; gap: 0.5rem; }
    .rd-filter-btn {
      padding: 0.5rem 1rem; border: 1.5px solid var(--gray-300); background: none;
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer; transition: all 0.2s;
      &.active { border-color: var(--gold); background: var(--gold); color: var(--black); }
      &:hover:not(.active) { border-color: var(--gold); color: var(--gold-dark); }
    }

    .rd-products-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;
      @media (max-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 768px)  { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 400px)  { grid-template-columns: 1fr; }
    }

    .rd-product-card {
      background: var(--cream-light); border: 1px solid var(--gray-200);
      overflow: hidden; transition: box-shadow 0.2s;
      &:hover { box-shadow: var(--shadow-md); }
    }

    .rd-product-img-wrap {
      position: relative; aspect-ratio: 3/4; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
    }

    .rd-cat-badge {
      position: absolute; top: 0.5rem; left: 0.5rem;
      background: var(--black); color: var(--gold);
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      padding: 2px 8px;
    }

    .rd-product-info { padding: 1rem; }
    .rd-product-sub  { font-size:0.62rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold); margin-bottom:0.25rem; font-weight:700; }
    .rd-product-name { font-family:var(--font-heading); font-size:1rem; font-weight:400; margin-bottom:0.75rem; line-height:1.3; color:var(--black); }

    .rd-price-info { background:var(--cream-dark); padding:0.75rem; margin-bottom:0.75rem; display:flex; flex-direction:column; gap:0.375rem; }
    .rd-price-row  { display:flex; justify-content:space-between; align-items:center;
      &--hint { opacity:0.6; }
    }
    .rd-price-label { font-size:0.72rem; color:var(--gray-500); }
    .rd-price-val   { font-size:0.875rem; font-weight:700; color:var(--black); }
    .rd-price-arrow { font-size:0.75rem; color:var(--gold); }

    .rd-card-actions { display:flex; gap:0.5rem; }
    .rd-card-btn {
      flex:1; display:flex; align-items:center; justify-content:center; gap:0.375rem;
      padding:0.625rem; border:none; cursor:pointer; font-size:0.72rem; font-weight:700;
      letter-spacing:0.06em; text-transform:uppercase; transition:all 0.2s;
      &--order { background:var(--gold); color:var(--black); flex:3; &:hover{background:var(--gold-dark);} }
      &--dl    { background:var(--black); color:var(--gold); flex:1; &:hover{background:#333;} }
    }

    .rd-stock-badge {
      position:absolute; top:0.5rem; right:0.5rem; padding:2px 8px;
      font-size:0.62rem; font-weight:700; background:rgba(76,175,80,0.9); color:#fff;
      &.low { background:rgba(229,57,53,0.9); }
    }

    /* ── Order Form — 2 col layout ──────────────────────── */
    .rd-order-wrap { width: 100%; }

    .rd-order-success {
      text-align:center; padding:4rem 2rem; max-width:480px; margin:0 auto;
      .success-check { width:80px; height:80px; border-radius:50%; background:rgba(76,175,80,0.1); display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; }
      h3 { font-family:var(--font-heading); font-size:2rem; font-weight:400; margin-bottom:0.5rem; }
      p  { color:var(--gray-400); margin-bottom:0.75rem; }
      .success-profit { font-family:var(--font-heading); font-size:2.5rem; color:var(--gold-dark); font-weight:400; margin-bottom:2rem; }
    }

    .rd-order-form-grid {
      display:grid; grid-template-columns:1fr 360px; gap:1.75rem; align-items:start;
      @media(max-width:1024px) { grid-template-columns:1fr 300px; gap:1.25rem; }
      @media(max-width:800px)  { grid-template-columns:1fr; }
    }

    /* Form sections */
    .rd-form-col { display:flex; flex-direction:column; gap:1rem; }

    .rd-form-section { background:var(--cream-light); border:1px solid var(--gray-200); overflow:hidden; }

    .rfs-header {
      display:flex; align-items:center; gap:0.625rem;
      padding:0.875rem 1.25rem; background:var(--black);
      font-size:0.7rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold);
      svg { stroke:var(--gold); flex-shrink:0; }
    }

    .rfs-add-btn {
      margin-left:auto; padding:0.3rem 0.75rem; background:rgba(201,168,76,0.15);
      border:1px solid rgba(201,168,76,0.4); color:var(--gold-dark); font-size:0.7rem;
      font-weight:700; cursor:pointer; letter-spacing:0.08em;
      &:hover { background:rgba(201,168,76,0.25); }
    }

    .rfs-body { padding:1.25rem; }

    .rfs-row { display:grid; grid-template-columns:1fr 1fr; gap:0.875rem; margin-bottom:0.875rem;
      @media(max-width:600px) { grid-template-columns:1fr; }
    }

    .rfs-field {
      display:flex; flex-direction:column; gap:0.3rem;
      &--full { grid-column:1/-1; }
      label { font-size:0.68rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--black); }
      input { padding:0.7rem 0.875rem; border:1px solid var(--gray-300); background:var(--cream); font-size:0.9rem; outline:none; transition:border-color 0.2s;
        &:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,168,76,0.1); }
      }
    }

    .rfs-select {
      padding:0.7rem 0.875rem; border:1px solid var(--gray-300); background:var(--cream);
      font-size:0.9rem; outline:none; width:100%; cursor:pointer;
      &:focus { border-color:var(--gold); }
    }

    /* Item cards */
    .rfs-item-card { border:1px solid var(--gray-200); padding:1rem; margin-bottom:0.75rem; background:var(--cream); &:last-child{margin-bottom:0;} }

    .rfs-item-top { display:flex; gap:0.5rem; margin-bottom:0.875rem; }
    .rfs-item-select { flex:1; }

    .rfs-remove-btn {
      width:36px; height:36px; background:rgba(229,57,53,0.08); border:1px solid rgba(229,57,53,0.2);
      color:#E53935; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;
      &:hover { background:rgba(229,57,53,0.15); }
    }

    .rfs-item-details { display:grid; grid-template-columns:1fr 1fr 1.5fr auto; gap:0.75rem; align-items:end;
      @media(max-width:600px) { grid-template-columns:1fr 1fr; }
    }

    .rfs-item-field {
      display:flex; flex-direction:column; gap:0.25rem;
      label { font-size:0.65rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--gray-400); }
    }

    .rfs-select-sm {
      padding:0.5rem 0.625rem; border:1px solid var(--gray-300); background:var(--cream);
      font-size:0.875rem; outline:none; width:100%;
      &:focus { border-color:var(--gold); }
    }

    .rfs-input-sm {
      padding:0.5rem 0.625rem; border:1px solid var(--gray-300); background:var(--cream);
      font-size:0.875rem; outline:none; width:100%; box-sizing:border-box;
      &:focus { border-color:var(--gold); }
    }

    .rfs-price-input { border-color:var(--gold); background:rgba(201,168,76,0.05); font-weight:600; }

    .rfs-item-profit {
      display:flex; flex-direction:column; gap:2px; padding:0.5rem 0.75rem;
      background:rgba(76,175,80,0.08); border:1px solid rgba(76,175,80,0.2); align-self:end;
      @media(max-width:600px) { grid-column:1/-1; flex-direction:row; justify-content:space-between; }
      .iprofit-label { font-size:0.62rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#388E3C; }
      .iprofit-val   { font-size:0.9rem; font-weight:700; color:#2e7d32; }
    }

    .rfs-error { background:rgba(229,57,53,0.08); border-left:3px solid #E53935; padding:0.75rem 1rem; font-size:0.875rem; color:#c62828; margin-bottom:1rem; }

    .rd-submit-btn {
      width:100%; padding:1rem; background:var(--gold); color:var(--black); border:none; cursor:pointer;
      font-size:0.8rem; font-weight:800; letter-spacing:0.14em; text-transform:uppercase;
      display:flex; align-items:center; justify-content:center; gap:0.625rem;
      transition:background 0.2s;
      &:hover { background:var(--gold-dark); }
      &:disabled { opacity:0.6; cursor:not-allowed; }
      .btn-spinner { width:18px; height:18px; border:2px solid rgba(26,26,26,0.3); border-top-color:var(--black); border-radius:50%; animation:spin 0.7s linear infinite; }
    }

    /* Right: Summary */
    .rd-summary-col { position:sticky; top:100px; }

    .rd-summary-card { background:var(--black); overflow:hidden; }

    .rsc-title {
      display:flex; align-items:center; gap:0.625rem;
      padding:1rem 1.25rem; border-bottom:1px solid rgba(201,168,76,0.15);
      font-size:0.7rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold);
      svg { stroke:var(--gold); flex-shrink:0; }
    }

    .rsc-items { padding:0.875rem 1.25rem; display:flex; flex-direction:column; gap:0.625rem; }

    .rsc-item {
      .rsc-item-name { font-size:0.8125rem; font-weight:600; color:var(--cream); }
      .rsc-item-meta { font-size:0.72rem; color:rgba(245,240,232,0.5); margin-top:2px; }
    }

    .rsc-empty { padding:2rem; text-align:center;
      svg { margin:0 auto 0.75rem; display:block; }
      p { font-size:0.75rem; color:rgba(245,240,232,0.3); }
    }

    .rsc-divider { height:1px; background:rgba(255,255,255,0.08); margin:0 1.25rem; }

    .rsc-row {
      display:flex; justify-content:space-between; align-items:center;
      padding:0.625rem 1.25rem; font-size:0.8125rem; color:rgba(245,240,232,0.6);
      &.rsc-total { color:var(--cream); font-weight:600; font-size:0.9rem; }
    }

    .rsc-profit-box {
      margin:0.75rem; padding:1rem 1.25rem; background:rgba(201,168,76,0.1);
      border:1px solid rgba(201,168,76,0.25);
      .rpb-label { font-size:0.65rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:rgba(201,168,76,0.65); margin-bottom:0.375rem; }
      .rpb-value { font-family:var(--font-heading); font-size:1.75rem; font-weight:400; color:var(--gold); }
      .rpb-note  { font-size:0.7rem; color:rgba(76,175,80,0.8); margin-top:0.375rem; }
    }

    .rsc-tips { padding:0.875rem 1.25rem; display:flex; flex-direction:column; gap:0.375rem; border-top:1px solid rgba(255,255,255,0.06); }
    .tip { display:flex; align-items:flex-start; gap:0.5rem; font-size:0.7rem; color:rgba(245,240,232,0.35); line-height:1.5; svg{stroke:rgba(201,168,76,0.5);flex-shrink:0;margin-top:2px;} }
    .item-product-select { flex: 1; }
    .item-remove { background: none; border: none; cursor: pointer; color: var(--gray-300); padding: 0.25rem; &:hover { color: #C62828; } display: flex; }

    .item-row-details {
      display: flex; gap: 0.75rem; align-items: flex-end; flex-wrap: wrap;
    }

    .form-group-sm { display: flex; flex-direction: column; gap: 0.2rem; label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray-500); } }
    .form-select-sm { padding: 0.4rem 0.5rem; border: 1px solid var(--gray-300); background: var(--cream-light); font-size: 0.8rem; outline: none; }
    .form-input-sm { width: 60px; padding: 0.4rem 0.5rem; border: 1px solid var(--gray-300); background: var(--cream-light); font-size: 0.8rem; outline: none; text-align: center; &:focus { border-color: var(--gold); } }
    .form-input-sm--price { width: 100px; border-color: var(--gold); background: rgba(201,168,76,0.05); font-weight: 600; }
    .item-profit-display { font-size: 0.75rem; color: var(--gold-dark); font-weight: 600; padding: 0.4rem 0; white-space: nowrap; }

    .order-summary-box {
      background: var(--black); padding: 1.25rem 1.5rem; margin: 1rem 0;
      display: flex; flex-direction: column; gap: 0.5rem;
    }

    .summary-row {
      display: flex; justify-content: space-between; font-size: 0.875rem; color: rgba(245,240,232,0.6);
      &--profit { color: var(--gold-light); font-weight: 600; }
      &--total  { font-family: var(--font-heading); font-size: 1.125rem; color: var(--cream); padding-top: 0.5rem; border-top: 1px solid rgba(245,240,232,0.15); margin-top: 0.25rem; }
    }

    .profit-val { color: var(--gold); }

    .order-submit-btn { padding: 1rem; font-size: 0.875rem; margin-top: 0.5rem; }

    .rd-order-success {
      text-align: center; padding: 3rem;
      .order-success-icon { color: #4CAF50; display: block; margin: 0 auto 1rem; }
      h3 { font-family: var(--font-heading); font-size: 2rem; font-weight: 400; margin-bottom: 0.5rem; }
      p { color: var(--gray-500); margin-bottom: 1.5rem; }
      .profit-highlight { color: var(--gold-dark); font-size: 1.25rem; }
    }

    .auth-error { color: #E53935; font-size: 0.8rem; background: rgba(229,57,53,0.08); padding: 0.5rem 0.75rem; margin: 0.5rem 0; }
    .req { color: var(--gold-dark); }

    .form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.875rem; label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--black); } input, .form-select { padding: 0.7rem 1rem; border: 1px solid var(--gray-300); background: var(--cream-light); font-family: var(--font-body); font-size: 0.875rem; width: 100%; box-sizing: border-box; outline: none; &:focus { border-color: var(--gold); } } }

    /* ── Orders ──────────────────────────────────────── */
    .rd-orders { max-width: 800px; }

    .rd-empty { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; text-align: center; .empty-icon { color: var(--gray-300); } p { color: var(--gray-400); } }

    .rd-order-card {
      border: 1px solid var(--gray-200); margin-bottom: 1rem; overflow: hidden;

      &__header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.875rem 1rem; background: var(--cream); gap: 1rem; flex-wrap: wrap;
      }

      &__left { display: flex; align-items: center; gap: 0.75rem; }
      &__right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

      &__items { padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.625rem; }
    }

    .order-id { font-weight: 700; color: var(--gold-dark); font-size: 0.875rem; }
    .order-customer { font-weight: 600; font-size: 0.875rem; }
    .order-city { font-size: 0.75rem; color: var(--gray-400); }
    .order-profit { font-weight: 700; color: var(--gold-dark); font-family: var(--font-heading); }
    .order-date { font-size: 0.75rem; color: var(--gray-400); }

    .order-status {
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      padding: 2px 8px;
      &.status-pending    { background: rgba(201,168,76,0.15); color: var(--gold-dark); }
      &.status-processing { background: rgba(33,150,243,0.12); color: #1565C0; }
      &.status-shipped    { background: rgba(76,175,80,0.12);  color: #388E3C; }
      &.status-delivered  { background: rgba(76,175,80,0.2);   color: #2E7D32; }
      &.status-cancelled  { background: rgba(229,57,53,0.12);  color: #C62828; }
    }

    .order-item-mini {
      display: flex; gap: 0.75rem; align-items: center;
      img { width: 44px; height: 56px; object-fit: cover; object-position: top center; flex-shrink: 0; }
      .oim-name { font-size: 0.8rem; font-weight: 500; }
      .oim-meta { font-size: 0.7rem; color: var(--gray-400); margin-top: 2px; }
    }

    .rd-tracking {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; background: rgba(201,168,76,0.06);
      border-top: 1px solid rgba(201,168,76,0.2);
      font-size: 0.75rem; color: var(--gold-dark);
    }
  `]
})
export class ResellerDashboardComponent implements OnInit {
  private http    = inject(HttpClient);
  private authApi = inject(AuthApiService);
  private toast   = inject(ToastService);

  profile       = signal<ResellerProfile | null>(null);
  products      = signal<Product[]>([]);
  orders        = signal<ResellerOrder[]>([]);
  loading       = signal(true);
  ordersLoading = signal(false);
  orderLoading  = signal(false);
  orderError    = signal('');
  orderSuccess  = signal(false);
  lastProfit    = signal(0);
  activeTab     = signal<'products' | 'order' | 'orders'>('products');
  productFilter = signal<'all' | 'women' | 'men'>('all');
  productSearch = '';

  // Per-product profit map
  profitMap = signal<Record<number, number>>({});

  // Order form
  orderForm = {
    customerName: '', customerPhone: '', customerCity: '',
    customerAddress: '', paymentMethod: 'cod', notes: ''
  };

  orderItems = signal<Array<{
    productId: number; quantity: number;
    selectedSize: string; selectedColor: string; resellerPrice: number;
  }>>([{ productId: 0, quantity: 1, selectedSize: '', selectedColor: '', resellerPrice: 0 }]);

  filteredProducts = computed(() => {
    let list = this.products();
    if (this.productFilter() !== 'all') list = list.filter(p => p.category === this.productFilter());
    if (this.productSearch.trim()) {
      const q = this.productSearch.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.subCategory.toLowerCase().includes(q));
    }
    return list;
  });

  orderSubTotal = computed(() =>
    this.orderItems().reduce((sum, item) => {
      if (item.productId === 0) return sum;
      return sum + (item.resellerPrice || this.getBasePrice(item.productId)) * item.quantity;
    }, 0)
  );

  orderTotalProfit = computed(() =>
    this.orderItems().reduce((sum, item) => {
      if (item.productId === 0) return sum;
      const base = this.getBasePrice(item.productId);
      const sell = item.resellerPrice || base;
      return sum + (sell - base) * item.quantity;
    }, 0)
  );

  private get headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.authApi.getToken()}` });
  }

  ngOnInit() { this.loadProfile(); }

  loadProfile() {
    this.loading.set(true);
    this.http.get<ResellerProfile>(`${API_BASE}/reseller/profile`, { headers: this.headers })
      .subscribe({
        next: profile => {
          this.profile.set(profile);
          this.loading.set(false);
          if (profile.status === 'approved') {
            this.loadProducts();
            this.loadOrders();
          }
        },
        error: () => { this.loading.set(false); }
      });
  }

  loadProducts() {
    this.http.get<Product[]>(`${API_BASE}/reseller/products`, { headers: this.headers })
      .subscribe({ next: p => this.products.set(p), error: () => {} });
  }

  loadOrders() {
    this.ordersLoading.set(true);
    this.http.get<ResellerOrder[]>(`${API_BASE}/reseller/orders`, { headers: this.headers })
      .subscribe({
        next: o => { this.orders.set(o); this.ordersLoading.set(false); },
        error: () => { this.ordersLoading.set(false); }
      });
  }

  getProductName(productId: number): string {
    return this.products().find(p => p.id === productId)?.name || '';
  }

  getFirstImage(images: string): string {
    return images.split(',')[0]?.trim() || 'assets/images/women/women-1.png';
  }

  getProfitFor(productId: number): number {
    return this.profitMap()[productId] || 0;
  }

  setProfit(productId: number, value: number) {
    this.profitMap.update(m => ({ ...m, [productId]: value || 0 }));
  }

  getBasePrice(productId: number): number {
    return this.products().find(p => p.id === productId)?.price || 0;
  }

  getSizes(productId: number): string[] {
    const p = this.products().find(p => p.id === productId);
    return p ? p.sizes.split(',').map(s => s.trim()) : [];
  }

  downloadImage(product: Product) {
    const url = this.getFirstImage(product.images);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.target = '_blank';
    link.click();
    this.toast.success(`Downloading: ${product.name}`);
  }

  startOrder(product: Product) {
    this.activeTab.set('order');
    const items = this.orderItems();
    items[0] = {
      productId: product.id,
      quantity: 1,
      selectedSize: this.getSizes(product.id)[0] || '',
      selectedColor: '',
      resellerPrice: product.price + this.getProfitFor(product.id)
    };
    this.orderItems.set([...items]);
  }

  addOrderItem() {
    this.orderItems.update(items => [...items, { productId: 0, quantity: 1, selectedSize: '', selectedColor: '', resellerPrice: 0 }]);
  }

  removeItem(index: number) {
    this.orderItems.update(items => items.filter((_, i) => i !== index));
  }

  onProductSelect(index: number, productId: number) {
    const base = this.getBasePrice(+productId);
    const profit = this.getProfitFor(+productId);
    this.orderItems.update(items => {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        productId: +productId,
        resellerPrice: base + profit,
        selectedSize: this.getSizes(+productId)[0] || ''
      };
      return updated;
    });
  }

  submitOrder(e: Event) {
    e.preventDefault();
    this.orderError.set('');

    const validItems = this.orderItems().filter(i => i.productId > 0);
    if (!validItems.length) { this.orderError.set('Add at least one product.'); return; }
    if (!this.orderForm.customerName || !this.orderForm.customerPhone || !this.orderForm.customerAddress) {
      this.orderError.set('Fill all customer details.'); return;
    }

    this.orderLoading.set(true);

    const payload = {
      ...this.orderForm,
      items: validItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
        resellerPrice: i.resellerPrice || this.getBasePrice(i.productId)
      }))
    };

    this.http.post<any>(`${API_BASE}/reseller/orders`, payload, { headers: this.headers })
      .subscribe({
        next: res => {
          this.lastProfit.set(res.profit || this.orderTotalProfit());
          this.orderSuccess.set(true);
          this.orderLoading.set(false);
          this.loadProfile();
          this.loadOrders();
        },
        error: err => {
          this.orderError.set(err.error?.message || 'Order failed. Please try again.');
          this.orderLoading.set(false);
        }
      });
  }

  resetOrder() {
    this.orderSuccess.set(false);
    this.orderForm = { customerName: '', customerPhone: '', customerCity: '', customerAddress: '', paymentMethod: 'cod', notes: '' };
    this.orderItems.set([{ productId: 0, quantity: 1, selectedSize: '', selectedColor: '', resellerPrice: 0 }]);
  }
}
