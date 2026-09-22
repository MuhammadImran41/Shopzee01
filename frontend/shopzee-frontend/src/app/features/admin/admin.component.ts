import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { AuthApiService } from '../../core/services/api/auth-api.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'user' | 'system';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, SvgIconsComponent],
  animations: [
    trigger('notifDropdown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('250ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ],
  template: `
    <div class="admin-shell" [class.collapsed]="sidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="admin-sidebar" [attr.aria-expanded]="!sidebarCollapsed()">
        <div class="sidebar-brand">
          @if (!sidebarCollapsed()) {
            <span class="brand-text">STYLEMAKER</span>
            <span class="brand-sub">Admin Panel</span>
          } @else {
            <app-icon name="crown" [size]="24" class="brand-icon"/>
          }
        </div>

        <nav class="sidebar-nav" aria-label="Admin navigation">
          @for (item of navItems; track item.label) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              class="nav-item"
              [attr.title]="sidebarCollapsed() ? item.label : null"
            >
              <app-icon [name]="item.icon" [size]="20"/>
              @if (!sidebarCollapsed()) {
                <span>{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="nav-item nav-item--store" [attr.title]="sidebarCollapsed() ? 'View Store' : null">
            <app-icon name="globe" [size]="20"/>
            @if (!sidebarCollapsed()) { <span>View Store</span> }
          </a>
          <button class="nav-item nav-item--logout" (click)="logout()" [attr.title]="sidebarCollapsed() ? 'Logout' : null">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            @if (!sidebarCollapsed()) { <span>Logout</span> }
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="admin-main">
        <!-- Top Bar -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <button class="toggle-btn" (click)="toggleSidebar()" aria-label="Toggle sidebar">
              <app-icon name="menu" [size]="22"/>
            </button>
            <div class="topbar-search">
              <app-icon name="search" [size]="18" class="search-ico"/>
              <input type="search" placeholder="Search..." class="topbar-search-input" aria-label="Admin search"/>
            </div>
          </div>
          <div class="topbar-right">
            <!-- Notifications -->
            <div class="notif-wrap">
              <button class="topbar-btn" (click)="toggleNotif()" aria-label="Notifications">
                <app-icon name="bell" [size]="20"/>
                @if (unreadCount() > 0) {
                  <span class="notif-badge">{{ unreadCount() }}</span>
                }
              </button>
              @if (notifOpen()) {
                <div class="notif-dropdown" [@notifDropdown]>
                  <div class="notif-header">
                    <span>Notifications</span>
                    <button class="mark-all" (click)="markAllRead()">Mark all read</button>
                  </div>
                  @for (n of notifications(); track n.id) {
                    <div class="notif-item" [class.unread]="!n.read" (click)="readNotif(n.id)">
                      <div class="notif-dot" [class]="'dot-' + n.type"></div>
                      <div class="notif-body">
                        <p class="notif-msg">{{ n.message }}</p>
                        <span class="notif-time">{{ n.time }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
            <!-- Admin Avatar + Name -->
            <div class="admin-avatar">{{ adminInitial() }}</div>
            <div class="admin-name hide-mobile">
              <span>{{ authApi.currentUser()?.name || 'Admin' }}</span>
              <span class="admin-role">Super Admin</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="admin-content">
          <router-outlet/>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: var(--cream);
    }
    
    /* ============================================================ */
    /* BASE ADMIN SHELL — FULLY RESPONSIVE */
    /* ============================================================ */
    .admin-shell {
      display:flex;
      height:100vh;
      width:100vw;
      overflow:hidden;
      background:var(--cream);
      
      /* Mobile: Stack layout */
      @media (max-width: 900px) {
        position: relative;
      }
    }
    
    /* ============================================================ */
    /* SIDEBAR — RESPONSIVE BEHAVIOR */
    /* Desktop: Full sidebar always visible (240px) - Above 900px */
    /* Tablet (769-900px): Off-canvas drawer */
    /* Mobile (<769px): Off-canvas drawer from left */
    /* ============================================================ */
    .admin-sidebar {
      width:240px;
      background:var(--black);
      display:flex;
      flex-direction:column;
      transition:width 0.3s ease, transform 0.3s ease;
      flex-shrink:0;
      overflow:hidden;
      z-index: 100;
      
      /* Collapsed state — desktop only (above 900px) */
      .admin-shell.collapsed & {
        width:72px;
        
        @media (max-width: 900px) {
          width: 240px; /* On mobile/tablet, drawer is always full width when open */
        }
      }
      
      /* Mobile & Tablet: Off-canvas drawer */
      @media (max-width: 900px) {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 260px;
        max-width: 80vw;
        transform: translateX(-100%);
        box-shadow: 2px 0 16px rgba(0,0,0,0.2);
        
        .admin-shell:not(.collapsed) & {
          transform: translateX(0);
        }
      }
    }
    
    .sidebar-brand {
      padding:1.5rem 1.25rem;
      border-bottom:1px solid rgba(201,168,76,0.12);
      display:flex;
      flex-direction:column;
      gap:2px;
      
      @media (max-width: 480px) {
        padding: 1.25rem 1rem;
      }
      
      .brand-text {
        font-family:var(--font-heading);
        font-size:1.25rem;
        color:var(--cream);
        letter-spacing:0.15em;
        
        @media (max-width: 480px) {
          font-size: 1.1rem;
        }
      }
      
      .brand-sub {
        font-size:0.65rem;
        letter-spacing:0.2em;
        text-transform:uppercase;
        color:var(--gold);
      }
      
      .brand-icon {
        color:var(--gold);
      }
    }
    
    .sidebar-nav {
      flex:1;
      padding:1rem 0;
      overflow-y:auto;
      overflow-x:hidden;
      
      /* Smooth scrolling on mobile */
      -webkit-overflow-scrolling: touch;
    }
    
    .nav-item {
      display:flex;
      align-items:center;
      gap:0.875rem;
      padding:0.75rem 1.25rem;
      color:rgba(245,240,232,0.55);
      text-decoration:none;
      font-size:0.8125rem;
      font-weight:500;
      letter-spacing:0.04em;
      transition:all 0.2s;
      white-space:nowrap;
      border:none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      
      @media (max-width: 480px) {
        padding: 0.875rem 1rem;
        font-size: 0.875rem;
      }
      
      &:hover {
        color:var(--gold-light);
        background:rgba(201,168,76,0.06);
      }
      
      &.active {
        color:var(--gold);
        background:rgba(201,168,76,0.1);
        border-left:2px solid var(--gold);
      }
      
      app-icon {
        flex-shrink:0;
      }
    }
    
    .sidebar-footer {
      padding:0.75rem 0;
      border-top:1px solid rgba(201,168,76,0.1);
      display:flex;
      flex-direction:column;
      gap:2px;
    }
    
    .nav-item--store {
      color:rgba(245,240,232,0.4);
      
      &:hover {
        color:var(--gold-light);
        background:rgba(201,168,76,0.06);
      }
    }
    
    .nav-item--logout {
      width:100%;
      background:none;
      border:none;
      cursor:pointer;
      text-align:left;
      display:flex;
      align-items:center;
      gap:0.875rem;
      padding:0.75rem 1.25rem;
      font-size:0.8125rem;
      font-weight:500;
      letter-spacing:0.04em;
      color:rgba(229,57,53,0.7);
      transition:all 0.2s;
      white-space:nowrap;
      
      @media (max-width: 480px) {
        padding: 0.875rem 1rem;
        font-size: 0.875rem;
      }
      
      &:hover {
        color:#ef5350;
        background:rgba(229,57,53,0.08);
      }
      
      svg {
        flex-shrink:0;
      }
    }
    
    /* Mobile & Tablet overlay when sidebar is open */
    @media (max-width: 900px) {
      .admin-shell:not(.collapsed)::before {
        content: '';
        position: fixed;
        inset: 0;
        background: rgba(26,26,26,0.5);
        z-index: 99;
        animation: fadeIn 0.3s ease;
      }
    }
    
    /* ============================================================ */
    /* MAIN CONTENT AREA — RESPONSIVE */
    /* ============================================================ */
    .admin-main {
      flex:1;
      display:flex;
      flex-direction:column;
      overflow:hidden;
      min-width: 0; /* Prevent overflow */
      
      @media (max-width: 900px) {
        width: 100%;
      }
    }
    
    /* ============================================================ */
    /* TOPBAR — FULLY RESPONSIVE */
    /* ============================================================ */
    .admin-topbar {
      height:64px;
      background:var(--cream-light);
      border-bottom:1px solid var(--gray-200);
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:0 1.5rem;
      flex-shrink:0;
      gap: 1rem;
      
      @media (max-width: 900px) {
        padding: 0 1rem;
        height: 56px;
        gap: 0.75rem;
      }
      
      @media (max-width: 480px) {
        padding: 0 0.75rem;
        gap: 0.5rem;
      }
    }
    
    .topbar-left {
      display:flex;
      align-items:center;
      gap:1rem;
      flex: 1;
      min-width: 0;
      
      @media (max-width: 480px) {
        gap: 0.5rem;
      }
    }
    
    .toggle-btn {
      display:flex;
      align-items:center;
      justify-content:center;
      width:40px;
      height:40px;
      background:none;
      border:none;
      cursor:pointer;
      color:var(--black);
      border-radius:50%;
      transition:all 0.2s;
      flex-shrink: 0;
      
      @media (max-width: 480px) {
        width: 36px;
        height: 36px;
      }
      
      &:hover {
        background:rgba(201,168,76,0.08);
        color:var(--gold);
      }
    }
    
    .topbar-search {
      display:flex;
      align-items:center;
      gap:0.5rem;
      background:var(--cream);
      border:1px solid var(--gray-200);
      padding:0.5rem 1rem;
      border-radius: 6px;
      flex: 1;
      max-width: 400px;
      
      /* Hide on tablets and below */
      @media(max-width:900px) {
        display:none;
      }
      
      .search-ico {
        color:var(--gray-400);
        flex-shrink: 0;
      }
      
      &-input {
        background:none;
        border:none;
        font-size:0.875rem;
        color:var(--black);
        width:100%;
        outline:none;
        min-width: 0;
        
        &::placeholder {
          color:var(--gray-400);
        }
      }
    }
    
    .topbar-right {
      display:flex;
      align-items:center;
      gap:0.75rem;
      flex-shrink: 0;
      
      @media (max-width: 480px) {
        gap: 0.5rem;
      }
    }
    
    .topbar-btn {
      position:relative;
      width:40px;
      height:40px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:none;
      border:none;
      cursor:pointer;
      color:var(--black);
      border-radius:50%;
      transition:all 0.2s;
      flex-shrink: 0;
      
      @media (max-width: 480px) {
        width: 36px;
        height: 36px;
      }
      
      &:hover {
        background:rgba(201,168,76,0.08);
        color:var(--gold);
      }
    }
    
    .notif-badge {
      position:absolute;
      top:4px;
      right:4px;
      min-width:18px;
      height:18px;
      padding: 0 4px;
      border-radius:9px;
      background:var(--gold);
      color:var(--black);
      font-size:10px;
      font-weight:700;
      display:flex;
      align-items:center;
      justify-content:center;
      
      @media (max-width: 480px) {
        min-width: 16px;
        height: 16px;
        font-size: 9px;
        top: 2px;
        right: 2px;
      }
    }
    
    .notif-wrap {
      position:relative;
    }
    
    .notif-dropdown {
      position:absolute;
      top:calc(100% + 0.5rem);
      right:0;
      width:320px;
      max-width: 90vw;
      background:var(--cream-light);
      border:1px solid var(--gray-200);
      box-shadow:var(--shadow-xl);
      z-index:200;
      max-height:400px;
      overflow-y:auto;
      border-radius: 8px;
      
      @media (max-width: 480px) {
        width: 280px;
        max-height: 60vh;
        right: -0.5rem;
      }
      
      @media (max-width: 360px) {
        width: calc(100vw - 1rem);
        right: -0.75rem;
      }
    }
    
    .notif-header {
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:0.75rem 1rem;
      border-bottom:1px solid var(--gray-200);
      font-size:0.875rem;
      font-weight:600;
      position: sticky;
      top: 0;
      background: var(--cream-light);
      z-index: 1;
      
      @media (max-width: 480px) {
        padding: 0.625rem 0.875rem;
        font-size: 0.8125rem;
      }
    }
    
    .mark-all {
      font-size:0.75rem;
      color:var(--gold);
      background:none;
      border:none;
      cursor:pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
      
      &:hover {
        background: rgba(201,168,76,0.1);
      }
    }
    
    .notif-item {
      display:flex;
      gap:0.75rem;
      padding:0.875rem 1rem;
      cursor:pointer;
      border-bottom:1px solid var(--gray-200);
      transition:background 0.2s;
      
      @media (max-width: 480px) {
        padding: 0.75rem 0.875rem;
        gap: 0.625rem;
      }
      
      &.unread {
        background:rgba(201,168,76,0.05);
      }
      
      &:hover {
        background:rgba(201,168,76,0.08);
      }
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .notif-dot {
      width:10px;
      height:10px;
      border-radius:50%;
      margin-top:4px;
      flex-shrink:0;
      
      &.dot-order {
        background:var(--gold);
      }
      
      &.dot-user {
        background:#4CAF50;
      }
      
      &.dot-system {
        background:#2196F3;
      }
    }
    
    .notif-body {
      flex:1;
      min-width: 0;
    }
    
    .notif-msg {
      font-size:0.8125rem;
      color:var(--black);
      line-height:1.4;
      margin-bottom:2px;
      word-wrap: break-word;
      
      @media (max-width: 480px) {
        font-size: 0.75rem;
      }
    }
    
    .notif-time {
      font-size:0.75rem;
      color:var(--gray-400);
      
      @media (max-width: 480px) {
        font-size: 0.7rem;
      }
    }
    
    .admin-avatar {
      width:36px;
      height:36px;
      border-radius:50%;
      background:linear-gradient(135deg,var(--gold),var(--gold-dark));
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:var(--font-heading);
      font-size:1.125rem;
      font-weight:600;
      color:var(--black);
      flex-shrink:0;
      
      @media (max-width: 480px) {
        width: 32px;
        height: 32px;
        font-size: 1rem;
      }
    }
    
    .admin-name {
      display:flex;
      flex-direction:column;
      gap:1px;
      min-width: 0;
      
      span:first-child {
        font-size:0.875rem;
        font-weight:600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    
    .admin-role {
      font-size:0.7rem;
      color:var(--gray-400);
      letter-spacing:0.08em;
      white-space: nowrap;
    }
    
    /* Hide admin name on mobile */
    .hide-mobile {
      @media (max-width: 600px) {
        display: none;
      }
    }
    
    /* ============================================================ */
    /* ADMIN CONTENT — RESPONSIVE PADDING */
    /* ============================================================ */
    .admin-content {
      flex:1;
      overflow-y:auto;
      overflow-x:hidden;
      padding:1.5rem;
      background:var(--cream);
      -webkit-overflow-scrolling: touch;
      
      @media (max-width: 1024px) {
        padding: 1.25rem;
      }
      
      @media (max-width: 768px) {
        padding: 1rem;
      }
      
      @media (max-width: 480px) {
        padding: 0.875rem;
      }
      
      @media (max-width: 360px) {
        padding: 0.75rem;
      }
    }
    
    /* ============================================================ */
    /* ANIMATIONS */
    /* ============================================================ */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  sidebarCollapsed = signal(false);
  notifOpen        = signal(false);
  authApi          = inject(AuthApiService);
  private router   = inject(Router);
  private notifTimer: ReturnType<typeof setInterval> | null = null;

  adminInitial = () => (this.authApi.currentUser()?.name?.[0] ?? 'A').toUpperCase();

  logout() {
    this.authApi.logout();
    this.router.navigate(['/']);
  }

  navItems = [
    { path: '/admin/dashboard',  label: 'Dashboard',  icon: 'chart'       },
    { path: '/admin/products',   label: 'Products',   icon: 'package'     },
    { path: '/admin/orders',     label: 'Orders',     icon: 'bag'         },
    { path: '/admin/customers',  label: 'Customers',  icon: 'users'       },
    { path: '/admin/resellers',  label: 'Resellers',  icon: 'star-filled' },
    { path: '/admin/analytics',  label: 'Analytics',  icon: 'chart'       },
    { path: '/admin/seo',        label: 'SEO',        icon: 'globe'       },
  ];

  notifications = signal<Notification[]>([
    { id: 1, message: 'New order #SZ45930 received for PKR 22,500', time: '2 min ago', read: false, type: 'order' },
    { id: 2, message: 'New customer registered: sara.malik@email.com', time: '15 min ago', read: false, type: 'user' },
    { id: 3, message: 'Product "Ivory Gold Bridal" is low in stock', time: '1 hr ago', read: true, type: 'system' },
    { id: 4, message: 'New order #SZ45929 received for PKR 8,500', time: '2 hr ago', read: true, type: 'order' }
  ]);

  unreadCount = () => this.notifications().filter(n => !n.read).length;

  ngOnInit() {
    // Simulate real-time notifications
    this.notifTimer = setInterval(() => {
      const newNotif: Notification = {
        id: Date.now(),
        message: `New order #SZ${Math.floor(Math.random() * 90000 + 10000)} received!`,
        time: 'just now',
        read: false,
        type: 'order'
      };
      this.notifications.update(n => [newNotif, ...n].slice(0, 8));
    }, 30000);
  }

  ngOnDestroy() {
    if (this.notifTimer) clearInterval(this.notifTimer);
  }

  readNotif(id: number) {
    this.notifications.update(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  }

  markAllRead() {
    this.notifications.update(n => n.map(x => ({ ...x, read: true })));
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleNotif() {
    this.notifOpen.update(v => !v);
  }
}
