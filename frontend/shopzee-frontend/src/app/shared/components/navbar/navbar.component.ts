import {
  Component, inject, signal, computed, HostListener, OnInit, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, SvgIconsComponent, AuthModalComponent],
  animations: [
    trigger('drawerAnim', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('350ms cubic-bezier(0.25,0.46,0.45,0.94)',
          style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease',
          style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ]),
    trigger('overlayAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease', style({ opacity: 0 }))
      ])
    ]),
    trigger('searchAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ],
  template: `
    <header class="navbar" [class.scrolled]="isScrolled()" role="banner">
      <div class="navbar__inner container">

        <!-- Logo -->
        <a routerLink="/" class="navbar__logo" aria-label="Shopzee Home">
          <div class="logo-wrap">
            <svg viewBox="0 0 160 40" class="logo-svg" aria-hidden="true">
              <!-- Crown ornament -->
              <path d="M8 28L4 14l8 6 8-12 8 12 8-6-4 14H8z"
                fill="none" stroke="#C9A84C" stroke-width="1.5" stroke-linejoin="round"/>
              <circle cx="4"  cy="14" r="2" fill="#C9A84C"/>
              <circle cx="20" cy="8"  r="2" fill="#C9A84C"/>
              <circle cx="36" cy="14" r="2" fill="#C9A84C"/>
              <!-- Text: x=46 to give enough space for full SHOPZEE -->
              <text x="46" y="26"
                font-family="Cormorant Garamond, Georgia, serif"
                font-size="19"
                font-weight="600"
                fill="#1A1A1A"
                letter-spacing="3">SHOPZEE</text>
              <!-- Gold underline -->
              <line x1="46" y1="31" x2="158" y2="31"
                stroke="#C9A84C" stroke-width="0.75"/>
            </svg>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="navbar__nav" aria-label="Main navigation">
          <ul class="nav-list">
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a></li>
            <li><a routerLink="/women" routerLinkActive="active" class="nav-link">Women</a></li>
            <li><a routerLink="/men" routerLinkActive="active" class="nav-link">Men</a></li>
            <li><a routerLink="/women" [queryParams]="{tag:'new'}" class="nav-link">New Arrivals</a></li>
            <li><a routerLink="/women" [queryParams]="{tag:'sale'}" class="nav-link nav-link--sale">Sale</a></li>
          </ul>
        </nav>

        <!-- Action Icons -->
        <div class="navbar__actions">
          <!-- Search -->
          <button class="action-btn" (click)="toggleSearch()" aria-label="Search">
            <app-icon name="search" [size]="22"/>
          </button>

          <!-- Wishlist -->
          <a routerLink="/wishlist" class="action-btn" aria-label="Wishlist">
            <app-icon name="heart" [size]="22"/>
            @if (wishlistService.count() > 0) {
              <span class="action-badge">{{ wishlistService.count() }}</span>
            }
          </a>

          <!-- Cart -->
          <a routerLink="/cart" class="action-btn" aria-label="Cart">
            <app-icon name="cart" [size]="22"/>
            @if (cartService.itemCount() > 0) {
              <span class="action-badge">{{ cartService.itemCount() }}</span>
            }
          </a>

          <!-- Account / Login — with user dropdown on desktop -->
          @if (authApi.isLoggedIn()) {
            <div class="user-menu-wrap">
              <button
                class="user-menu-btn"
                (click)="toggleDrop()"
                [attr.aria-expanded]="userDropOpen()"
                aria-label="Account menu"
              >
                <div class="user-avatar-sm">{{ userInitial() }}</div>
                <span class="user-name-sm hide-mobile">{{ authApi.currentUser()!.name.split(' ')[0] }}</span>
                <app-icon name="chevron-down" [size]="12" class="user-chevron hide-mobile" [class.rotated]="userDropOpen()"/>
              </button>

              @if (userDropOpen()) {
                <!-- Close on outside click -->
                <div class="user-drop-backdrop" (click)="userDropOpen.set(false)"></div>

                <div class="user-dropdown" [@searchAnim]>
                  <!-- User info header -->
                  <div class="user-drop-header">
                    <div class="user-drop-avatar">{{ userInitial() }}</div>
                    <div>
                      <span class="user-drop-name">{{ authApi.currentUser()?.name }}</span>
                      <span class="user-drop-email">{{ authApi.currentUser()?.email }}</span>
                      @if (authApi.isAdmin()) {
                        <span class="user-drop-role">Admin</span>
                      }
                    </div>
                  </div>

                  <!-- Menu items -->
                  <div class="user-drop-menu">
                    <a routerLink="/account" (click)="userDropOpen.set(false)" class="user-drop-item">
                      <app-icon name="user" [size]="16"/>
                      My Account
                    </a>
                    <a routerLink="/account" [queryParams]="{tab:'orders'}" (click)="userDropOpen.set(false)" class="user-drop-item">
                      <app-icon name="package" [size]="16"/>
                      My Orders
                    </a>
                    <a routerLink="/wishlist" (click)="userDropOpen.set(false)" class="user-drop-item">
                      <app-icon name="heart" [size]="16"/>
                      Wishlist
                      @if (wishlistService.count() > 0) {
                        <span class="drop-badge">{{ wishlistService.count() }}</span>
                      }
                    </a>
                    @if (authApi.isAdmin()) {
                      <div class="user-drop-divider"></div>
                      <a routerLink="/admin" (click)="userDropOpen.set(false)" class="user-drop-item user-drop-item--admin">
                        <app-icon name="chart" [size]="16"/>
                        Admin Panel
                      </a>
                    }
                    <div class="user-drop-divider"></div>
                    <button class="user-drop-item user-drop-item--logout" (click)="logout()">
                      <app-icon name="close" [size]="16"/>
                      Sign Out
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <button class="action-btn login-btn" (click)="showAuthModal.set(true)" aria-label="Sign In">
              <app-icon name="user" [size]="18"/>
              <span class="login-text">Sign In</span>
            </button>
          }

          <!-- Mobile Menu Toggle -->
          <button class="action-btn hide-desktop" (click)="toggleMobileMenu()" aria-label="Toggle menu">
            <app-icon [name]="mobileMenuOpen() ? 'close' : 'menu'" [size]="24"/>
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      @if (searchOpen()) {
        <div class="search-bar" [@searchAnim]>
          <div class="container">
            <div class="search-inner">
              <app-icon name="search" [size]="20" class="search-icon"/>
              <input
                type="search"
                placeholder="Search for men's and women's clothing..."
                class="search-input"
                autofocus
                (keydown.escape)="toggleSearch()"
                aria-label="Search products"
              />
              <button class="action-btn" (click)="toggleSearch()" aria-label="Close search">
                <app-icon name="close" [size]="20"/>
              </button>
            </div>
          </div>
        </div>
      }
    </header>

    <!-- Mobile Drawer Overlay -->
    @if (mobileMenuOpen()) {
      <div class="mobile-overlay" [@overlayAnim] (click)="closeMobileMenu()" aria-hidden="true"></div>
      <nav class="mobile-drawer" [@drawerAnim] aria-label="Mobile navigation">
        <div class="drawer-header">
          <span class="drawer-logo">SHOPZEE</span>
          <button class="action-btn" (click)="closeMobileMenu()" aria-label="Close menu">
            <app-icon name="close" [size]="24"/>
          </button>
        </div>
        <ul class="drawer-nav">
          <li><a routerLink="/" (click)="closeMobileMenu()" class="drawer-link">Home</a></li>
          <li><a routerLink="/women" (click)="closeMobileMenu()" class="drawer-link">Women's Collection</a></li>
          <li><a routerLink="/men" (click)="closeMobileMenu()" class="drawer-link">Men's Collection</a></li>
          <li><a routerLink="/women" [queryParams]="{tag:'new'}" (click)="closeMobileMenu()" class="drawer-link">New Arrivals</a></li>
          <li><a routerLink="/women" [queryParams]="{tag:'sale'}" (click)="closeMobileMenu()" class="drawer-link drawer-link--sale">Sale</a></li>
        </ul>
        <div class="drawer-actions">
          <a routerLink="/account" (click)="closeMobileMenu()" class="drawer-action-link">
            <app-icon name="user" [size]="18"/> My Account
          </a>
          <a routerLink="/wishlist" (click)="closeMobileMenu()" class="drawer-action-link">
            <app-icon name="heart" [size]="18"/> Wishlist
            @if (wishlistService.count() > 0) {
              <span class="action-badge">{{ wishlistService.count() }}</span>
            }
          </a>
          <a routerLink="/cart" (click)="closeMobileMenu()" class="drawer-action-link">
            <app-icon name="cart" [size]="18"/> Cart
            @if (cartService.itemCount() > 0) {
              <span class="action-badge">{{ cartService.itemCount() }}</span>
            }
          </a>
        </div>
        <div class="drawer-admin">
          @if (authApi.isLoggedIn()) {
            <span class="drawer-user">{{ authApi.currentUser()?.name }}</span>
            <a routerLink="/account" (click)="closeMobileMenu()" class="drawer-link">My Account</a>
            <a routerLink="/admin" *ngIf="authApi.isAdmin()" (click)="closeMobileMenu()" class="drawer-link drawer-link--admin">Admin Panel</a>
            <button class="drawer-link drawer-link--logout" (click)="logout()">Sign Out</button>
          } @else {
            <button class="drawer-link drawer-link--login" (click)="showAuthModal.set(true); closeMobileMenu()">Sign In / Register</button>
          }
        </div>
      </nav>
    }

    <!-- Auth Modal -->
    @if (showAuthModal()) {
      <app-auth-modal
        (close)="showAuthModal.set(false)"
        (loggedIn)="showAuthModal.set(false)"
      />
    }
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 16px;
      left: 24px;
      right: 24px;
      width: auto;
      max-width: 1400px;
      margin: 0 auto;
      z-index: var(--z-sticky);
      transition:
        background 0.35s ease,
        box-shadow 0.35s ease,
        border-color 0.35s ease,
        top 0.35s ease;
      padding: 0;
      /* Default: fully transparent — no background */
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border: 2px solid transparent;
      border-radius: 16px;
      box-shadow: none;
      will-change: background, box-shadow;
      transform: translateZ(0);

      &__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 68px;
        padding: 0 1.5rem;
        transition: height 0.3s ease;
      }

      /* Scrolled state — golden border + glass background */
      &.scrolled {
        top: 10px;
        background: rgba(245,240,232,0.94);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 2px solid #C9A84C;
        box-shadow:
          0 8px 32px rgba(26,26,26,0.13),
          0 1px 0 rgba(255,255,255,0.45) inset;

        .navbar__inner {
          height: 60px;
        }
      }

      @media (max-width: 768px) {
        top: 10px;
        left: 12px;
        right: 12px;
        border-radius: 12px;
      }
    }

    .navbar__logo {
      display: flex;
      align-items: center;
      text-decoration: none;
    }

    .logo-wrap {
      display: flex;
      align-items: center;
    }

    .logo-svg {
      width: 170px;
      height: 44px;

      /* Default: white text on transparent navbar */
      text { fill: #fff; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4)); }
    }

    /* Scrolled: dark text */
    .navbar.scrolled .logo-svg text {
      fill: #1A1A1A;
      filter: none;
    }

    .navbar__nav {
      .nav-list {
        display: flex;
        align-items: center;
        gap: var(--space-6);
        list-style: none;
        padding: 0;
        margin: 0;

        @media (max-width: 900px) {
          display: none;
        }
      }
    }

    .nav-link {
      font-family: var(--font-body);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #fff;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
      text-decoration: none;
      position: relative;
      padding-bottom: 4px;
      transition: color var(--transition-base);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--gold);
        transition: width var(--transition-base);
      }

      &:hover, &.active {
        color: var(--gold);
        text-shadow: none;
        &::after { width: 100%; }
      }

      &--sale {
        color: #C9A84C;
        font-weight: 700;
        text-shadow: 0 1px 4px rgba(0,0,0,0.4);
      }
    }

    /* Scrolled state nav links — dark text */
    .navbar.scrolled .nav-link {
      color: var(--black);
      text-shadow: none;

      &:hover, &.active {
        color: var(--gold-dark);
      }

      &--sale {
        color: var(--gold-dark);
      }
    }

    .navbar__actions {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }

    .action-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: none;
      border: none;
      cursor: pointer;
      color: #fff;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));
      border-radius: 50%;
      transition: all var(--transition-base);
      text-decoration: none;
      flex-shrink: 0;

      &:hover {
        color: var(--gold);
        filter: none;
        background: rgba(201,168,76,0.12);
      }
    }

    /* Scrolled state icons — dark */
    .navbar.scrolled .action-btn {
      color: var(--black);
      filter: none;

      &:hover {
        color: var(--gold);
        background: rgba(201,168,76,0.08);
      }
    }

    .action-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--gold);
      color: var(--black);
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    // Search bar
    .search-bar {
      position: fixed;
      top: 94px;
      left: 24px;
      right: 24px;
      max-width: 1400px;
      margin: 0 auto;
      background: rgba(245,240,232,0.97);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(26,26,26,0.12);
      padding: var(--space-3) var(--space-5);
      z-index: calc(var(--z-sticky) - 1);
      transform: translateZ(0);

      .search-inner {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .search-icon {
        color: var(--gray-400);
        flex-shrink: 0;
      }

      .search-input {
        flex: 1;
        background: none;
        border: none;
        font-size: var(--text-lg);
        font-family: var(--font-heading);
        color: var(--black);
        outline: none;

        &::placeholder {
          color: var(--gray-400);
        }
      }
    }

    // Mobile Overlay
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(26,26,26,0.5);
      backdrop-filter: blur(4px);
      z-index: 150;
    }

    // Mobile Drawer
    .mobile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: min(320px, 85vw);
      background: var(--cream-light);
      z-index: 160;
      display: flex;
      flex-direction: column;
      padding: var(--space-6);
      overflow-y: auto;

      .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-8);
        padding-bottom: var(--space-6);
        border-bottom: 1px solid var(--gray-200);

        .drawer-logo {
          font-family: var(--font-heading);
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--black);
          letter-spacing: 0.15em;
        }
      }

      .drawer-nav {
        list-style: none;
        padding: 0;
        margin: 0 0 var(--space-8);
        flex: 1;
      }

      .drawer-link {
        display: block;
        padding: var(--space-3) 0;
        font-size: var(--text-lg);
        font-family: var(--font-heading);
        color: var(--black);
        text-decoration: none;
        border-bottom: 1px solid var(--gray-200);
        transition: color var(--transition-base);

        &:hover {
          color: var(--gold);
        }

        &--sale {
          color: var(--gold-dark);
          font-weight: 600;
        }

        &--admin {
          font-size: var(--text-sm);
          font-family: var(--font-body);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gray-400);
        }
      }

      .drawer-actions {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        margin-bottom: var(--space-6);
        padding-bottom: var(--space-6);
        border-bottom: 1px solid var(--gray-200);
      }

      .drawer-action-link {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3);
        font-size: var(--text-sm);
        color: var(--black);
        text-decoration: none;
        transition: color var(--transition-base);
        position: relative;

        &:hover {
          color: var(--gold);
        }
      }

      .drawer-admin {
        margin-top: auto;
        padding-top: var(--space-4);
      }

      .drawer-user {
        display: block;
        font-family: var(--font-heading);
        font-size: var(--text-lg);
        color: var(--black);
        padding: var(--space-3) 0;
        border-bottom: 1px solid var(--gray-200);
        margin-bottom: var(--space-2);
      }

      .drawer-link--logout {
        color: var(--black) !important;
        font-size: var(--text-sm);
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--space-3) 0;
        width: 100%;
        text-align: left;
        border-bottom: 1px solid var(--gray-200);
        font-family: var(--font-heading);

        &:hover { color: var(--gold) !important; }
      }

      .drawer-link--login {
        color: var(--gold-dark) !important;
        font-weight: 600;
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--space-3) 0;
        width: 100%;
        text-align: left;
        font-family: var(--font-heading);
        font-size: var(--text-lg);
      }
    }

    @media (min-width: 901px) {
      .hide-desktop { display: none !important; }
    }

    /* ── User dropdown ──────────────────────────────── */
    .user-menu-wrap {
      position: relative;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: rgba(201,168,76,0.08);
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: 20px;
      padding: 0.25rem 0.625rem 0.25rem 0.25rem;
      cursor: pointer;
      color: var(--black);
      transition: all 0.25s ease;
      font-family: var(--font-body);
      white-space: nowrap;
      height: auto;
      width: auto;

      &:hover {
        background: rgba(201,168,76,0.14);
        border-color: var(--gold);
      }
    }

    .user-avatar-sm {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--black);
      flex-shrink: 0;
    }

    .user-name-sm {
      font-size: 0.75rem;
      font-weight: 600;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-chevron {
      color: var(--gray-400);
      transition: transform 0.25s ease;
      &.rotated { transform: rotate(180deg); }
    }

    /* Login button */
    .login-btn {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      border: 1px solid rgba(255,255,255,0.6) !important;
      border-radius: 20px !important;
      padding: 0.3rem 0.75rem !important;
      font-size: 0.7rem !important;
      font-weight: 700 !important;
      letter-spacing: 0.1em !important;
      text-transform: uppercase !important;
      white-space: nowrap !important;
      width: auto !important;
      height: auto !important;
      color: #fff !important;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4));

      &:hover {
        background: rgba(201,168,76,0.15) !important;
        border-color: var(--gold) !important;
        color: var(--gold) !important;
        filter: none;
      }
    }

    .navbar.scrolled .login-btn {
      border: 1px solid rgba(201,168,76,0.3) !important;
      color: var(--black) !important;
      filter: none;

      &:hover {
        background: rgba(201,168,76,0.1) !important;
        border-color: var(--gold) !important;
        color: var(--gold-dark) !important;
      }
    }

    .login-text {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      white-space: nowrap;
      line-height: 1;
    }

    /* Backdrop to close dropdown on outside click */
    .user-drop-backdrop {
      position: fixed;
      inset: 0;
      z-index: calc(var(--z-dropdown) - 1);
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 240px;
      background: var(--cream-light);
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(26,26,26,0.14);
      z-index: var(--z-dropdown);
      overflow: hidden;
    }

    .user-drop-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--black);
      border-bottom: 1px solid rgba(201,168,76,0.15);
    }

    .user-drop-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--black);
      flex-shrink: 0;
    }

    .user-drop-name {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--cream);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-drop-email {
      display: block;
      font-size: 0.7rem;
      color: rgba(245,240,232,0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-drop-role {
      display: inline-block;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      background: var(--gold);
      color: var(--black);
      padding: 1px 6px;
      border-radius: 2px;
      margin-top: 2px;
    }

    .user-drop-menu {
      padding: 0.375rem 0;
    }

    .user-drop-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      color: var(--black);
      text-decoration: none;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      font-family: var(--font-body);
      transition: background 0.15s, color 0.15s;

      app-icon { color: var(--gray-400); flex-shrink: 0; }

      &:hover {
        background: rgba(201,168,76,0.06);
        color: var(--gold-dark);
        app-icon { color: var(--gold); }
      }

      &--admin {
        color: var(--gold-dark);
        font-weight: 500;
        app-icon { color: var(--gold); }
      }

      &--logout {
        color: var(--gray-500);
        &:hover {
          background: rgba(26,26,26,0.04);
          color: var(--black);
        }
      }
    }

    .drop-badge {
      margin-left: auto;
      background: var(--gold);
      color: var(--black);
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .user-drop-divider {
      height: 1px;
      background: var(--gray-200);
      margin: 0.25rem 0;
    }

    /* hide-mobile on sm screens */
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  cartService     = inject(CartService);
  wishlistService = inject(WishlistService);
  authApi         = inject(AuthApiService);
  private router      = inject(Router);
  private platformId  = inject(PLATFORM_ID);

  isScrolled     = signal(false);
  mobileMenuOpen = signal(false);
  searchOpen     = signal(false);
  showAuthModal  = signal(false);
  userDropOpen   = signal(false);

  userInitial = computed(() =>
    (this.authApi.currentUser()?.name?.[0] ?? 'U').toUpperCase()
  );

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScroll();
    }
  }

  private _ticking = false;

  @HostListener('window:scroll')
  checkScroll() {
    // requestAnimationFrame throttle — prevents scroll jitter
    // by batching scroll updates with paint cycle
    if (!this._ticking) {
      requestAnimationFrame(() => {
        this.isScrolled.set(window.scrollY > 20);
        this._ticking = false;
      });
      this._ticking = true;
    }
  }

  toggleDrop()   { this.userDropOpen.update(v => !v); }
  toggleMobileMenu() { this.mobileMenuOpen.update(v => !v); }
  closeMobileMenu()  { this.mobileMenuOpen.set(false); }
  toggleSearch()     { this.searchOpen.update(v => !v); }

  logout() {
    this.authApi.logout();
    this.userDropOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }
}
