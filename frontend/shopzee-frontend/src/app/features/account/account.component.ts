import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { AuthApiService } from '../../core/services/api/auth-api.service';
import { OrderApiService, ApiOrder } from '../../core/services/api/order-api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthModalComponent } from '../../shared/components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SvgIconsComponent, AuthModalComponent],
  template: `
    <div class="account-page container">

      <!-- Not logged in state -->
      @if (!authApi.isLoggedIn()) {
        <div class="not-logged-in">
          <div class="nli-icon">
            <app-icon name="user" [size]="56"/>
          </div>
          <h1 class="nli-title">Sign in to your account</h1>
          <p class="nli-desc">View your orders, manage addresses and update your profile.</p>
          <button class="btn btn-primary nli-btn" (click)="showAuth.set(true)">
            <app-icon name="user" [size]="18"/> Sign In / Register
          </button>
          @if (showAuth()) {
            <app-auth-modal
              (close)="showAuth.set(false)"
              (loggedIn)="onLoggedIn()"
            />
          }
        </div>
      }

      <!-- Logged in state -->
      @if (authApi.isLoggedIn()) {
        <!-- Page Header -->
        <div class="page-header-row">
          <div>
            <h1 class="page-title">My Account</h1>
            <p class="page-welcome">Welcome back, <span class="welcome-name">{{ authApi.currentUser()?.name }}</span></p>
          </div>
          <button class="btn btn-ghost logout-btn" (click)="logout()">
            <app-icon name="close" [size]="16"/>
            Sign Out
          </button>
        </div>

        <div class="account-layout">

          <!-- Sidebar -->
          <nav class="account-nav" aria-label="Account navigation">
            <!-- User info card -->
            <div class="nav-user-card">
              <div class="nav-avatar">{{ userInitial() }}</div>
              <div class="nav-user-info">
                <span class="nav-user-name">{{ authApi.currentUser()?.name }}</span>
                <span class="nav-user-email">{{ authApi.currentUser()?.email }}</span>
                @if (authApi.isAdmin()) {
                  <span class="nav-admin-badge">Admin</span>
                }
              </div>
            </div>

            <!-- Nav links -->
            @for (tab of tabs; track tab.id) {
              <button
                class="account-nav-btn"
                [class.active]="activeTab() === tab.id"
                (click)="setTab(tab.id)"
              >
                <app-icon [name]="tab.icon" [size]="18"/>
                {{ tab.label }}
              </button>
            }

            <!-- Admin panel link -->
            @if (authApi.isAdmin()) {
              <a routerLink="/admin" class="account-nav-btn account-nav-btn--admin">
                <app-icon name="chart" [size]="18"/>
                Admin Panel
              </a>
            }

            <!-- Logout -->
            <button class="account-nav-btn account-nav-btn--logout" (click)="logout()">
              <app-icon name="close" [size]="18"/>
              Sign Out
            </button>
          </nav>

          <!-- Content area -->
          <div class="account-content">

            <!-- ── Profile Tab ─────────────────────────────── -->
            @if (activeTab() === 'profile') {
              <div class="tab-section">
                <h2 class="tab-title">Profile Information</h2>

                <div class="profile-avatar">
                  <div class="avatar-circle">{{ userInitial() }}</div>
                  <div>
                    <div class="avatar-name">{{ authApi.currentUser()?.name }}</div>
                    <div class="avatar-email">{{ authApi.currentUser()?.email }}</div>
                    @if (authApi.currentUser()?.phone) {
                      <div class="avatar-phone">{{ authApi.currentUser()?.phone }}</div>
                    }
                  </div>
                </div>

                <form class="form-grid" (submit)="saveProfile($event)">
                  <div class="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      [(ngModel)]="profileForm.name"
                      name="name"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      [(ngModel)]="profileForm.phone"
                      name="phone"
                      placeholder="+92 300 0000000"
                    />
                  </div>
                  <div class="form-group form-full">
                    <label>Email Address</label>
                    <input
                      type="email"
                      [value]="authApi.currentUser()?.email"
                      disabled
                      class="input-disabled"
                    />
                    <span class="input-hint">Email cannot be changed</span>
                  </div>

                  @if (profileMsg()) {
                    <div class="form-full">
                      <p class="success-msg">
                        <app-icon name="check-circle" [size]="16"/> {{ profileMsg() }}
                      </p>
                    </div>
                  }

                  <div class="form-full">
                    <button type="submit" class="btn btn-primary" [disabled]="savingProfile()">
                      @if (savingProfile()) { Saving... } @else { Save Changes }
                    </button>
                  </div>
                </form>
              </div>
            }

            <!-- ── Orders Tab ──────────────────────────────── -->
            @if (activeTab() === 'orders') {
              <div class="tab-section">
                <h2 class="tab-title">Order History</h2>

                @if (loadingOrders()) {
                  <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading your orders...</p>
                  </div>
                }

                @if (!loadingOrders() && orders().length === 0) {
                  <div class="empty-state">
                    <app-icon name="package" [size]="48" class="empty-icon"/>
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here after you make a purchase.</p>
                    <a routerLink="/women" class="btn btn-primary" style="margin-top:1rem">Start Shopping</a>
                  </div>
                }

                @if (!loadingOrders() && orders().length > 0) {
                  <div class="orders-list">
                    @for (order of orders(); track order.id) {
                      <div class="order-card" (click)="toggleOrder(order.id)" [class.expanded]="expandedOrder() === order.id">
                        <div class="order-card-header">
                          <div class="order-card-left">
                            <span class="order-num">#{{ order.orderNumber }}</span>
                            <span class="order-date">{{ order.createdAt | date:'MMM d, y' }}</span>
                          </div>
                          <div class="order-card-right">
                            <span class="order-total">PKR {{ order.total | number }}</span>
                            <span class="status-badge status-{{ order.status }}">{{ order.status | titlecase }}</span>
                            <app-icon [name]="expandedOrder() === order.id ? 'chevron-up' : 'chevron-down'" [size]="16" class="order-chevron"/>
                          </div>
                        </div>

                        @if (expandedOrder() === order.id) {
                          <div class="order-detail">
                            <!-- Items -->
                            <div class="order-items">
                              @for (item of order.items; track item.productId) {
                                <div class="order-item">
                                  <img [src]="item.productImage" [alt]="item.productName" class="order-item-img" loading="lazy"/>
                                  <div class="order-item-info">
                                    <span class="order-item-name">{{ item.productName }}</span>
                                    <span class="order-item-meta">{{ item.selectedSize }} · {{ item.quantity }} pcs</span>
                                  </div>
                                  <span class="order-item-price">PKR {{ item.lineTotal | number }}</span>
                                </div>
                              }
                            </div>
                            <!-- Summary -->
                            <div class="order-summary-row">
                              <span>Subtotal</span><span>PKR {{ order.subTotal | number }}</span>
                            </div>
                            <div class="order-summary-row">
                              <span>Shipping</span>
                              <span>{{ order.shippingCost === 0 ? 'Free' : 'PKR ' + (order.shippingCost | number) }}</span>
                            </div>
                            <div class="order-summary-row order-summary-total">
                              <span>Total</span><span>PKR {{ order.total | number }}</span>
                            </div>
                            <div class="order-shipping">
                              <app-icon name="truck" [size]="14"/>
                              Shipping to: {{ order.shippingName }}, {{ order.shippingCity }}
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- ── Addresses Tab ───────────────────────────── -->
            @if (activeTab() === 'addresses') {
              <div class="tab-section">
                <h2 class="tab-title">Saved Addresses</h2>
                <div class="empty-state">
                  <app-icon name="map-pin" [size]="48" class="empty-icon"/>
                  <h3>No addresses saved</h3>
                  <p>Save your delivery addresses for faster checkout.</p>
                </div>
                <button class="btn btn-outline" style="margin-top:1.5rem">
                  <app-icon name="plus" [size]="16"/> Add New Address
                </button>
              </div>
            }

            <!-- ── Security Tab ────────────────────────────── -->
            @if (activeTab() === 'security') {
              <div class="tab-section">
                <h2 class="tab-title">Change Password</h2>

                <form class="form-grid" style="max-width:480px" (submit)="changePassword($event)">
                  <div class="form-group form-full">
                    <label>Current Password</label>
                    <input type="password" [(ngModel)]="passwordForm.current" name="current" placeholder="••••••••" required/>
                  </div>
                  <div class="form-group form-full">
                    <label>New Password</label>
                    <input type="password" [(ngModel)]="passwordForm.newPass" name="newPass" placeholder="Min 6 characters" required/>
                  </div>
                  <div class="form-group form-full">
                    <label>Confirm New Password</label>
                    <input type="password" [(ngModel)]="passwordForm.confirm" name="confirm" placeholder="Repeat new password" required/>
                  </div>

                  @if (passwordError()) {
                    <div class="form-full">
                      <p class="error-msg">{{ passwordError() }}</p>
                    </div>
                  }
                  @if (passwordMsg()) {
                    <div class="form-full">
                      <p class="success-msg"><app-icon name="check-circle" [size]="16"/> {{ passwordMsg() }}</p>
                    </div>
                  }

                  <div class="form-full">
                    <button type="submit" class="btn btn-primary" [disabled]="savingPassword()">
                      @if (savingPassword()) { Updating... } @else { Update Password }
                    </button>
                  </div>
                </form>

                <!-- Danger zone -->
                <div class="danger-zone">
                  <h3 class="danger-title">Sign Out</h3>
                  <p class="danger-desc">Sign out from your account on this device.</p>
                  <button class="btn btn-dark" (click)="logout()">
                    <app-icon name="close" [size]="16"/> Sign Out
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .account-page {
      padding: var(--space-10) var(--space-6) var(--space-16);
      padding-top: calc(var(--space-10) + 100px);
      max-width: 1400px;
      margin: 0 auto;
      box-sizing: border-box;
      @media (max-width: 768px) { padding: calc(90px + var(--space-6)) var(--space-5) var(--space-12); }
      @media (max-width: 480px) { padding: calc(85px + var(--space-4)) var(--space-4) var(--space-10); }
    }

    /* ── Not logged in ─────────────────────────────── */
    .not-logged-in {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: var(--space-20) var(--space-6);
      @media (max-width: 480px) { padding: var(--space-12) var(--space-4); }
    }
    .nli-icon { width: 90px; height: 90px; border-radius: 50%; background: var(--cream-dark); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-6); app-icon { color: var(--gray-300); } }
    .nli-title { font-family: var(--font-heading); font-size: clamp(1.75rem, 4vw, var(--text-4xl)); font-weight: 400; margin-bottom: var(--space-3); }
    .nli-desc { color: var(--gray-400); margin-bottom: var(--space-7); max-width: 400px; font-size: var(--text-sm); }
    .nli-btn { padding: var(--space-4) var(--space-8); font-size: var(--text-base); display: flex; align-items: center; gap: var(--space-3); }

    /* ── Page header ───────────────────────────────── */
    .page-header-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: var(--space-7); flex-wrap: wrap; gap: var(--space-4);
    }
    .page-title {
      font-family: var(--font-heading); font-size: clamp(2rem, 5vw, var(--text-5xl)); font-weight: 400; margin-bottom: 0.25rem;
    }
    .page-welcome { font-size: var(--text-base); color: var(--gray-400); @media (max-width: 480px) { font-size: var(--text-sm); } }
    .welcome-name { color: var(--gold-dark); font-weight: 600; }
    .logout-btn { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--gray-500); border-color: var(--gray-200); &:hover { color: var(--black); border-color: var(--black); } }

    /* ── Layout ────────────────────────────────────── */
    .account-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: var(--space-8);
      min-width: 0;
      width: 100%;
      @media (max-width: 900px) { grid-template-columns: 1fr; gap: var(--space-5); }
    }

    /* ── Sidebar ───────────────────────────────────── */
    .account-nav {
      display: flex; flex-direction: column; gap: 0;
      background: var(--cream-light); border: 1px solid var(--gray-200);
      height: fit-content; overflow: hidden;

      @media (max-width: 900px) {
        flex-direction: row; overflow-x: auto;
        border-radius: 8px; -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }
      }
    }

    .nav-user-card {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-5); background: var(--black);
      border-bottom: 1px solid rgba(201,168,76,0.2);
      @media (max-width: 900px) { display: none; }
    }
    .nav-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); display: flex; align-items: center; justify-content: center; font-family: var(--font-heading); font-size: 1.25rem; font-weight: 600; color: var(--black); flex-shrink: 0; }
    .nav-user-info { min-width: 0; }
    .nav-user-name { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .nav-user-email { display: block; font-size: var(--text-xs); color: rgba(245,240,232,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .nav-admin-badge { display: inline-block; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; background: var(--gold); color: var(--black); padding: 1px 6px; border-radius: 2px; margin-top: 2px; }

    .account-nav-btn {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      background: none; border: none; border-bottom: 1px solid var(--gray-200);
      cursor: pointer; font-size: var(--text-sm); color: var(--gray-500);
      transition: all 0.2s; text-align: left; text-decoration: none; width: 100%;

      @media (max-width: 900px) {
        border-bottom: none; border-right: 1px solid var(--gray-200);
        flex-direction: column; gap: var(--space-1); padding: var(--space-3) var(--space-4);
        font-size: var(--text-xs); white-space: nowrap; flex-shrink: 0;
        text-align: center; min-width: 72px;
        app-icon { flex-shrink: 0; }
      }

      &.active {
        background: rgba(201,168,76,0.08); color: var(--gold-dark);
        border-left: 3px solid var(--gold);
        @media (max-width: 900px) { border-left: none; border-bottom: 2px solid var(--gold); }
      }
      &:hover:not(.active) { background: rgba(201,168,76,0.05); color: var(--black); }
      &--admin { color: var(--gold-dark); font-weight: 500; }
      &--logout {
        color: var(--gray-400); margin-top: auto; border-bottom: none;
        &:hover { color: var(--black); background: rgba(26,26,26,0.04); }
        @media (max-width: 900px) { display: none; }
      }
    }

    /* ── Content ───────────────────────────────────── */
    .account-content {
      background: var(--cream-light);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      min-width: 0;
      width: 100%;
    }
    .tab-section {
      padding: 2rem;
      box-sizing: border-box;
      width: 100%;
      overflow: hidden;
      @media (max-width: 768px) { padding: 1.5rem; }
      @media (max-width: 480px) { padding: 1.25rem; }
    }
    .tab-title {
      font-family: var(--font-heading); font-size: var(--text-3xl); font-weight: 400;
      margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: 1px solid var(--gray-200);
      @media (max-width: 480px) { font-size: var(--text-2xl); margin-bottom: var(--space-4); }
    }

    /* ── Profile ───────────────────────────────────── */
    .profile-avatar {
      display: flex; align-items: center; gap: var(--space-5);
      margin-bottom: var(--space-7); padding: var(--space-5);
      background: var(--cream); border: 1px solid var(--gray-200);
      @media (max-width: 480px) { gap: var(--space-4); padding: var(--space-4); }
    }
    .avatar-circle { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); display: flex; align-items: center; justify-content: center; font-family: var(--font-heading); font-size: var(--text-3xl); font-weight: 600; color: var(--black); flex-shrink: 0; }
    .avatar-name { font-family: var(--font-heading); font-size: var(--text-2xl); margin-bottom: 0.125rem; @media (max-width: 480px) { font-size: var(--text-xl); } }
    .avatar-email { font-size: var(--text-sm); color: var(--gray-400); }
    .avatar-phone { font-size: var(--text-sm); color: var(--gray-400); margin-top: 0.125rem; }

    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: var(--space-4); margin-bottom: var(--space-4);
      width: 100%; box-sizing: border-box;
      @media (max-width: 600px) { grid-template-columns: 1fr; gap: var(--space-3); }
    }
    .form-group {
      display: flex; flex-direction: column; gap: var(--space-1);
      min-width: 0;
      label { font-size: var(--text-sm); font-weight: 600; color: var(--black); }
      input {
        padding: var(--space-3) var(--space-4); border: 1px solid var(--gray-300);
        background: var(--cream-light); font-size: var(--text-sm);
        transition: border-color 0.2s; width: 100%; box-sizing: border-box;
        max-width: 100%;
        &:focus { border-color: var(--gold); }
      }
    }
    .form-full { grid-column: 1/-1; }
    .input-disabled { background: var(--cream-dark); color: var(--gray-400); cursor: not-allowed; }
    .input-hint { display: block; font-size: var(--text-xs); color: var(--gray-400); margin-top: var(--space-1); }
    .success-msg { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: #388E3C; background: rgba(76,175,80,0.08); padding: var(--space-3) var(--space-4); app-icon { color: #388E3C; } }
    .error-msg { font-size: var(--text-sm); color: #C62828; background: rgba(229,57,53,0.08); padding: var(--space-3) var(--space-4); }

    /* ── Orders ────────────────────────────────────── */
    .orders-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .order-card { border: 1px solid var(--gray-200); overflow: hidden; cursor: pointer; transition: box-shadow 0.2s; &:hover { box-shadow: var(--shadow-md); } &.expanded { border-color: var(--gold); } }
    .order-card-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-4) var(--space-5); gap: var(--space-3); flex-wrap: wrap;
      @media (max-width: 480px) { padding: var(--space-3) var(--space-4); }
    }
    .order-card-left { display: flex; flex-direction: column; gap: 0.25rem; }
    .order-num { font-size: var(--text-base); font-weight: 700; color: var(--gold-dark); }
    .order-date { font-size: var(--text-xs); color: var(--gray-400); letter-spacing: 0.05em; }
    .order-card-right { display: flex; align-items: center; gap: var(--space-3); }
    .order-total { font-family: var(--font-heading); font-size: var(--text-xl); font-weight: 500; @media (max-width: 480px) { font-size: var(--text-lg); } }
    .order-chevron { color: var(--gray-400); }
    .order-detail { border-top: 1px solid var(--gray-200); padding: var(--space-5); background: rgba(245,240,232,0.5); @media (max-width: 480px) { padding: var(--space-4); } }
    .order-items { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4); }
    .order-item { display: flex; align-items: center; gap: var(--space-3); }
    .order-item-img { width: 52px; height: 68px; object-fit: cover; object-position: top center; flex-shrink: 0; }
    .order-item-info { flex: 1; min-width: 0; }
    .order-item-name { display: block; font-size: var(--text-sm); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .order-item-meta { display: block; font-size: var(--text-xs); color: var(--gray-400); margin-top: 2px; }
    .order-item-price { font-size: var(--text-sm); font-weight: 600; color: var(--gold-dark); white-space: nowrap; }
    .order-summary-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--gray-500); padding: var(--space-2) 0; border-top: 1px solid var(--gray-200); }
    .order-summary-total { font-family: var(--font-heading); font-size: var(--text-lg); font-weight: 500; color: var(--black); }
    .order-shipping { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); color: var(--gray-400); margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--gray-200); app-icon { color: var(--gold); } }

    /* Status badges */
    .status-badge { padding: var(--space-1) var(--space-3); font-size: var(--text-xs); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .status-delivered  { background: rgba(76,175,80,0.12);  color: #388E3C; }
    .status-processing { background: rgba(201,168,76,0.15); color: var(--gold-dark); }
    .status-shipped    { background: rgba(33,150,243,0.12);  color: #1565C0; }
    .status-cancelled  { background: rgba(229,57,53,0.12);   color: #C62828; }
    .status-pending    { background: rgba(158,158,158,0.12); color: var(--gray-500); }

    /* Loading / Empty states */
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-16) var(--space-6); color: var(--gray-400); }
    .loading-spinner { width: 36px; height: 36px; border: 3px solid var(--gray-200); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) var(--space-6); text-align: center; .empty-icon { color: var(--gray-300); } h3 { font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 400; } p { font-size: var(--text-sm); color: var(--gray-400); } }

    /* ── Security ──────────────────────────────────── */
    .danger-zone { margin-top: var(--space-10); padding-top: var(--space-6); border-top: 1px solid var(--gray-200); }
    .danger-title { font-family: var(--font-heading); font-size: var(--text-xl); font-weight: 400; margin-bottom: var(--space-2); }
    .danger-desc { font-size: var(--text-sm); color: var(--gray-400); margin-bottom: var(--space-5); }
  `]
})
export class AccountComponent implements OnInit {
  authApi      = inject(AuthApiService);
  private orderApi = inject(OrderApiService);
  private toast    = inject(ToastService);
  private router   = inject(Router);

  activeTab     = signal('profile');
  showAuth      = signal(false);
  orders        = signal<ApiOrder[]>([]);
  loadingOrders = signal(false);
  expandedOrder = signal<number | null>(null);

  // Profile form
  savingProfile = signal(false);
  profileMsg    = signal('');
  profileForm   = {
    name:  this.authApi.currentUser()?.name  || '',
    phone: this.authApi.currentUser()?.phone || ''
  };

  // Password form
  savingPassword = signal(false);
  passwordError  = signal('');
  passwordMsg    = signal('');
  passwordForm   = { current: '', newPass: '', confirm: '' };

  userInitial = computed(() =>
    (this.authApi.currentUser()?.name?.[0] ?? 'U').toUpperCase()
  );

  tabs = [
    { id: 'profile',   label: 'Profile',   icon: 'user'    },
    { id: 'orders',    label: 'My Orders', icon: 'package' },
    { id: 'addresses', label: 'Addresses', icon: 'map-pin' },
    { id: 'security',  label: 'Security',  icon: 'shield'  }
  ];

  ngOnInit() {
    if (this.authApi.isLoggedIn()) {
      // Sync profile form with current user
      const u = this.authApi.currentUser();
      this.profileForm = { name: u?.name || '', phone: u?.phone || '' };
      this.loadOrders();
    }
  }

  setTab(id: string) {
    this.activeTab.set(id);
    if (id === 'orders' && this.orders().length === 0) {
      this.loadOrders();
    }
  }

  onLoggedIn() {
    this.showAuth.set(false);
    const u = this.authApi.currentUser();
    this.profileForm = { name: u?.name || '', phone: u?.phone || '' };
    this.loadOrders();
  }

  logout() {
    this.authApi.logout();
    this.toast.info('You have been signed out.');
    this.router.navigate(['/']);
  }

  // ── Load orders from API ──────────────────────────
  loadOrders() {
    this.loadingOrders.set(true);
    this.orderApi.getMyOrders().subscribe({
      next: orders => {
        this.orders.set(orders);
        this.loadingOrders.set(false);
      },
      error: () => {
        this.loadingOrders.set(false);
      }
    });
  }

  toggleOrder(id: number) {
    this.expandedOrder.update(v => v === id ? null : id);
  }

  // ── Save profile ──────────────────────────────────
  saveProfile(e: Event) {
    e.preventDefault();
    if (!this.profileForm.name.trim()) return;

    this.savingProfile.set(true);
    this.profileMsg.set('');

    this.authApi.updateProfile(this.profileForm.name.trim(), this.profileForm.phone).subscribe({
      next: () => {
        this.profileMsg.set('Profile updated successfully!');
        this.savingProfile.set(false);
        this.toast.success('Profile updated!');
        setTimeout(() => this.profileMsg.set(''), 4000);
      },
      error: () => {
        this.savingProfile.set(false);
        this.toast.error('Failed to update profile. Please try again.');
      }
    });
  }

  // ── Change password ───────────────────────────────
  changePassword(e: Event) {
    e.preventDefault();
    this.passwordError.set('');
    this.passwordMsg.set('');

    if (this.passwordForm.newPass.length < 6) {
      this.passwordError.set('New password must be at least 6 characters.');
      return;
    }
    if (this.passwordForm.newPass !== this.passwordForm.confirm) {
      this.passwordError.set('New passwords do not match.');
      return;
    }

    this.savingPassword.set(true);
    this.authApi.changePassword(this.passwordForm.current, this.passwordForm.newPass).subscribe({
      next: () => {
        this.passwordMsg.set('Password changed successfully!');
        this.savingPassword.set(false);
        this.passwordForm = { current: '', newPass: '', confirm: '' };
        this.toast.success('Password updated!');
        setTimeout(() => this.passwordMsg.set(''), 4000);
      },
      error: err => {
        this.passwordError.set(err.error?.message || 'Current password is incorrect.');
        this.savingPassword.set(false);
      }
    });
  }
}
