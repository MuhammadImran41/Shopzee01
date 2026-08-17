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
        animate('350ms cubic-bezier(0.25,0.46,0.45,0.94)', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ]),
    trigger('overlayAnim', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms ease', style({ opacity: 1 }))]),
      transition(':leave', [animate('250ms ease', style({ opacity: 0 }))])
    ]),
    trigger('megaAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('250ms cubic-bezier(0.25,0.46,0.45,0.94)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('180ms ease', style({ opacity: 0, transform: 'translateY(-6px)' }))
      ])
    ]),
    trigger('searchAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [animate('200ms ease', style({ opacity: 0, transform: 'translateY(-10px)' }))])
    ])
  ],
  template: `
    <header class="navbar" [class.scrolled]="isScrolled() || !isHomePage" role="banner">
      <div class="navbar__inner container">

        <!-- Logo -->
        <a routerLink="/" class="navbar__logo" aria-label="STYLEMAKER Home">
          <div class="logo-wrap">
            <svg viewBox="0 0 200 40" class="logo-svg" aria-hidden="true">
              <path d="M8 28L4 14l8 6 8-12 8 12 8-6-4 14H8z"
                fill="none" stroke="#C9A84C" stroke-width="1.5" stroke-linejoin="round"/>
              <circle cx="4"  cy="14" r="2" fill="#C9A84C"/>
              <circle cx="20" cy="8"  r="2" fill="#C9A84C"/>
              <circle cx="36" cy="14" r="2" fill="#C9A84C"/>
              <text x="46" y="26"
                font-family="Cormorant Garamond, Georgia, serif"
                font-size="17" font-weight="600" fill="#1A1A1A" letter-spacing="2">STYLEMAKER</text>
            </svg>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="navbar__nav" aria-label="Main navigation">
          <ul class="nav-list">

            <!-- Home -->
            <li>
              <a routerLink="/" routerLinkActive="active"
                [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>
            </li>

            <!-- Women Mega Menu -->
            <li class="has-mega">
              <a routerLink="/women" routerLinkActive="active" class="nav-link nav-link--mega">
                Women
                <svg class="nav-chevron" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                  <path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </a>
              <div class="mega-menu">
                <div class="mega-promo-bar">
                  <span>✦ Free shipping on orders above PKR 5,000</span>
                  <a routerLink="/women" [queryParams]="{tag:'new'}">View New Arrivals →</a>
                </div>
                <div class="mega-inner">
                  <div class="mega-col">
                    <p class="mega-heading">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                      Shop By Category
                    </p>
                    <ul class="mega-links">
                      <li><a routerLink="/women" [queryParams]="{sub:'suits'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2C6 2 4 7 4 12v8h16v-8c0-5-2-10-8-10z"/><path d="M8 6c0 2 2 4 4 4s4-2 4-4"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Embroidered Suits</strong></span>
                      </a></li>
                      <li><a routerLink="/women" [queryParams]="{sub:'kameez'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 3L4 7v4l8-2 8 2V7z"/><path d="M4 11v9h16v-9"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Shalwar Kameez</strong></span>
                      </a></li>
                      <li><a routerLink="/women" [queryParams]="{sub:'formal'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Formal Wear</strong></span>
                      </a></li>
                      <li><a routerLink="/women" [queryParams]="{sub:'bridal'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Bridal Collection</strong></span>
                      </a></li>
                      <li><a routerLink="/women" [queryParams]="{sub:'casual'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Casual Wear</strong></span>
                      </a></li>
                    </ul>
                  </div>
                  <div class="mega-col">
                    <p class="mega-heading">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Collections
                    </p>
                    <ul class="mega-links">
                      <li><a routerLink="/new-arrivals" (click)="closeMega()" class="mega-link mega-link--featured">
                        <span class="mega-badge mega-badge--new">NEW</span>
                        <span class="mega-link-content"><strong>New Arrivals</strong></span>
                        <svg class="mega-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </a></li>
                      <li><a routerLink="/women" [queryParams]="{tag:'sale'}" class="mega-link mega-link--sale">
                        <span class="mega-badge mega-badge--sale">SALE</span>
                        <span class="mega-link-content"><strong>Sale</strong></span>
                        <svg class="mega-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </a></li>
                      <li><a routerLink="/women" [queryParams]="{tag:'bestseller'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Best Sellers</strong></span>
                      </a></li>
                      <li><a routerLink="/women" [queryParams]="{tag:'luxury'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Luxury Edit</strong></span>
                      </a></li>
                    </ul>
                    <a routerLink="/women" class="mega-view-all">View All Women's →</a>
                  </div>
                  <div class="mega-col mega-col--image">
                    <a routerLink="/women" class="mega-featured">
                      <img src="assets/images/women/women-3.png" alt="Women's Collection" loading="lazy"/>
                      <div class="mega-featured-label">
                        <span>Women's Collection</span>
                        <strong>Shop Now →</strong>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </li>

            <!-- Men Mega Menu -->
            <li class="has-mega">
              <a routerLink="/men" routerLinkActive="active" class="nav-link nav-link--mega">
                Men
                <svg class="nav-chevron" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                  <path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </a>
              <div class="mega-menu">
                <div class="mega-promo-bar">
                  <span>✦ New arrivals every week — stay updated</span>
                  <a routerLink="/men" [queryParams]="{tag:'new'}">Explore Men's →</a>
                </div>
                <div class="mega-inner">
                  <div class="mega-col">
                    <p class="mega-heading">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                      Shop By Category
                    </p>
                    <ul class="mega-links">
                      <li><a routerLink="/men" [queryParams]="{sub:'shalwar'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 3L4 7v4l8-2 8 2V7z"/><path d="M4 11v9h16v-9"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Shalwar Kameez</strong></span>
                      </a></li>
                      <li><a routerLink="/men" [queryParams]="{sub:'kurta'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2C6 2 4 7 4 12v8h16v-8c0-5-2-10-8-10z"/><path d="M9 2l3 4 3-4"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Kurta Collection</strong></span>
                      </a></li>
                      <li><a routerLink="/men" [queryParams]="{sub:'formal'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Formal Wear</strong></span>
                      </a></li>
                      <li><a routerLink="/men" [queryParams]="{sub:'sherwani'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Sherwani</strong></span>
                      </a></li>
                      <li><a routerLink="/men" [queryParams]="{sub:'casual'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Casual Wear</strong></span>
                      </a></li>
                    </ul>
                  </div>
                  <div class="mega-col">
                    <p class="mega-heading">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Collections
                    </p>
                    <ul class="mega-links">
                      <li><a routerLink="/men" [queryParams]="{tag:'new'}" class="mega-link mega-link--featured">
                        <span class="mega-badge mega-badge--new">NEW</span>
                        <span class="mega-link-content"><strong>New Arrivals</strong></span>
                        <svg class="mega-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </a></li>
                      <li><a routerLink="/men" [queryParams]="{tag:'sale'}" class="mega-link mega-link--sale">
                        <span class="mega-badge mega-badge--sale">SALE</span>
                        <span class="mega-link-content"><strong>Sale</strong></span>
                        <svg class="mega-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </a></li>
                      <li><a routerLink="/men" [queryParams]="{tag:'bestseller'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Best Sellers</strong></span>
                      </a></li>
                      <li><a routerLink="/men" [queryParams]="{tag:'eid'}" class="mega-link">
                        <span class="mega-link-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 3a6 6 0 009 9 9 9 0 11-9-9z"/></svg>
                        </span>
                        <span class="mega-link-content"><strong>Eid Special</strong></span>
                      </a></li>
                    </ul>
                    <a routerLink="/men" class="mega-view-all">View All Men's →</a>
                  </div>
                  <div class="mega-col mega-col--image">
                    <a routerLink="/men" class="mega-featured">
                      <img src="assets/images/men/men-2.png" alt="Men's Collection" loading="lazy"/>
                      <div class="mega-featured-label">
                        <span>Men's Collection</span>
                        <strong>Shop Now →</strong>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </li>

            <!-- New Arrivals -->
            <li>
              <a routerLink="/new-arrivals" routerLinkActive="active" class="nav-link">New Arrivals</a>
            </li>

            <!-- Sale -->
            <li>
              <a routerLink="/women" [queryParams]="{tag:'sale'}" class="nav-link nav-link--sale">Sale</a>
            </li>

          </ul>
        </nav>

        <!-- Action Icons -->
        <div class="navbar__actions">
          <button class="action-btn" (click)="toggleSearch()" aria-label="Search">
            <app-icon name="search" [size]="22"/>
          </button>

          <a routerLink="/wishlist" class="action-btn" aria-label="Wishlist">
            <app-icon name="heart" [size]="22"/>
            @if (wishlistService.count() > 0) {
              <span class="action-badge">{{ wishlistService.count() }}</span>
            }
          </a>

          <a routerLink="/cart" class="action-btn" aria-label="Cart">
            <app-icon name="cart" [size]="22"/>
            @if (cartService.itemCount() > 0) {
              <span class="action-badge">{{ cartService.itemCount() }}</span>
            }
          </a>

          @if (authApi.isLoggedIn()) {
            <div class="user-menu-wrap">
              <button class="user-menu-btn" (click)="toggleDrop()"
                [attr.aria-expanded]="userDropOpen()" aria-label="Account menu">
                <div class="user-avatar-sm">{{ userInitial() }}</div>
                <span class="user-name-sm hide-mobile">{{ authApi.currentUser()!.name.split(' ')[0] }}</span>
                <app-icon name="chevron-down" [size]="12" class="user-chevron hide-mobile" [class.rotated]="userDropOpen()"/>
              </button>

              @if (userDropOpen()) {
                <div class="user-drop-backdrop" (click)="userDropOpen.set(false)"></div>
                <div class="user-dropdown" [@megaAnim]>
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
                  <div class="user-drop-menu">
                    <a routerLink="/account" (click)="userDropOpen.set(false)" class="user-drop-item">
                      <app-icon name="user" [size]="16"/> My Account
                    </a>
                    <a routerLink="/account" [queryParams]="{tab:'orders'}" (click)="userDropOpen.set(false)" class="user-drop-item">
                      <app-icon name="package" [size]="16"/> My Orders
                    </a>
                    <a routerLink="/wishlist" (click)="userDropOpen.set(false)" class="user-drop-item">
                      <app-icon name="heart" [size]="16"/> Wishlist
                      @if (wishlistService.count() > 0) {
                        <span class="drop-badge">{{ wishlistService.count() }}</span>
                      }
                    </a>
                    @if (authApi.isAdmin()) {
                      <div class="user-drop-divider"></div>
                      <a routerLink="/admin" (click)="userDropOpen.set(false)" class="user-drop-item user-drop-item--admin">
                        <app-icon name="chart" [size]="16"/> Admin Panel
                      </a>
                    }
                    <div class="user-drop-divider"></div>
                    <button class="user-drop-item user-drop-item--logout" (click)="logout()">
                      <app-icon name="close" [size]="16"/> Sign Out
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
              <input type="search" placeholder="Search clothing, styles, collections..."
                class="search-input" autofocus
                (keydown.escape)="toggleSearch()" aria-label="Search products"/>
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
          <span class="drawer-logo">STYLEMAKER</span>
          <button class="action-btn" (click)="closeMobileMenu()" aria-label="Close menu">
            <app-icon name="close" [size]="24"/>
          </button>
        </div>

        <ul class="drawer-nav">
          <li><a routerLink="/" (click)="closeMobileMenu()" class="drawer-link">Home</a></li>

          <!-- Women accordion -->
          <li class="drawer-accordion">
            <button class="drawer-link drawer-acc-btn" (click)="toggleDrawerAcc('women')">
              Women's Collection
              <svg class="acc-chevron" [class.open]="drawerAcc() === 'women'" viewBox="0 0 12 8" fill="none">
                <path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            @if (drawerAcc() === 'women') {
              <ul class="drawer-sub">
                <li><a routerLink="/women" (click)="closeMobileMenu()" class="drawer-sub-link">All Women's</a></li>
                <li><a routerLink="/women" [queryParams]="{sub:'suits'}" (click)="closeMobileMenu()" class="drawer-sub-link">Embroidered Suits</a></li>
                <li><a routerLink="/women" [queryParams]="{sub:'formal'}" (click)="closeMobileMenu()" class="drawer-sub-link">Formal Wear</a></li>
                <li><a routerLink="/women" [queryParams]="{sub:'bridal'}" (click)="closeMobileMenu()" class="drawer-sub-link">Bridal Collection</a></li>
                <li><a routerLink="/women" [queryParams]="{tag:'new'}" (click)="closeMobileMenu()" class="drawer-sub-link drawer-sub-link--gold">New Arrivals</a></li>
                <li><a routerLink="/women" [queryParams]="{tag:'sale'}" (click)="closeMobileMenu()" class="drawer-sub-link drawer-sub-link--red">Sale</a></li>
              </ul>
            }
          </li>

          <!-- Men accordion -->
          <li class="drawer-accordion">
            <button class="drawer-link drawer-acc-btn" (click)="toggleDrawerAcc('men')">
              Men's Collection
              <svg class="acc-chevron" [class.open]="drawerAcc() === 'men'" viewBox="0 0 12 8" fill="none">
                <path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            @if (drawerAcc() === 'men') {
              <ul class="drawer-sub">
                <li><a routerLink="/men" (click)="closeMobileMenu()" class="drawer-sub-link">All Men's</a></li>
                <li><a routerLink="/men" [queryParams]="{sub:'shalwar'}" (click)="closeMobileMenu()" class="drawer-sub-link">Shalwar Kameez</a></li>
                <li><a routerLink="/men" [queryParams]="{sub:'kurta'}" (click)="closeMobileMenu()" class="drawer-sub-link">Kurta Collection</a></li>
                <li><a routerLink="/men" [queryParams]="{sub:'sherwani'}" (click)="closeMobileMenu()" class="drawer-sub-link">Sherwani</a></li>
                <li><a routerLink="/men" [queryParams]="{tag:'new'}" (click)="closeMobileMenu()" class="drawer-sub-link drawer-sub-link--gold">New Arrivals</a></li>
                <li><a routerLink="/men" [queryParams]="{tag:'sale'}" (click)="closeMobileMenu()" class="drawer-sub-link drawer-sub-link--red">Sale</a></li>
              </ul>
            }
          </li>

          <li><a routerLink="/new-arrivals" (click)="closeMobileMenu()" class="drawer-link">New Arrivals</a></li>
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
            <button class="drawer-link drawer-link--logout" (click)="logout()">Sign Out</button>
          } @else {
            <button class="drawer-link drawer-link--login" (click)="showAuthModal.set(true); closeMobileMenu()">Sign In / Register</button>
          }
        </div>
      </nav>
    }

    @if (showAuthModal()) {
      <app-auth-modal (close)="showAuthModal.set(false)" (loggedIn)="showAuthModal.set(false)"/>
    }
  `,
  styles: [`
    /* ── NAVBAR BASE ─────────────────────────────────────── */
    .navbar {
      position: fixed;
      top: 16px; left: 24px; right: 24px;
      width: auto; max-width: 1400px;
      margin: 0 auto;
      z-index: 200;
      transition: background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, top 0.35s ease;
      background: transparent;
      backdrop-filter: none;
      border: 2px solid transparent;
      border-radius: 16px;
      box-shadow: none;
      will-change: background, box-shadow;
      transform: translateZ(0);

      &__inner {
        display: flex; align-items: center;
        justify-content: space-between;
        height: 68px; padding: 0 1.5rem;
        transition: height 0.3s ease;
      }

      &.scrolled {
        top: 10px;
        background: rgba(245,240,232,0.96);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 2px solid #C9A84C;
        box-shadow: 0 8px 32px rgba(26,26,26,0.13), 0 1px 0 rgba(255,255,255,0.45) inset;

        .navbar__inner { height: 60px; }
      }

      @media (max-width: 768px) {
        top: 10px; left: 12px; right: 12px; border-radius: 12px;
      }
    }

    /* ── LOGO ────────────────────────────────────────────── */
    .navbar__logo { display: flex; align-items: center; text-decoration: none; }
    .logo-wrap    { display: flex; align-items: center; }
    .logo-svg {
      width: 260px; height: 52px;
      text { fill: #fff; filter: drop-shadow(0 1px 4px rgba(0,0,0,0.6)); }
    }
    .navbar.scrolled .logo-svg text { fill: #1A1A1A; filter: none; }

    /* ── NAV LIST ────────────────────────────────────────── */
    .navbar__nav {
      .nav-list {
        display: flex; align-items: center; gap: 0.25rem;
        list-style: none; padding: 0; margin: 0;
        @media (max-width: 900px) { display: none; }
      }
    }

    .has-mega { position: relative; }

    .nav-link {
      display: flex; align-items: center; gap: 4px;
      font-family: var(--font-body);
      font-size: 0.78rem; font-weight: 600;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: #fff;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
      text-decoration: none;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      position: relative;
      transition: color 0.2s ease, background 0.2s ease;

      &:hover { color: #C9A84C; text-shadow: none; background: rgba(255,255,255,0.08); }
      &.active { color: #C9A84C; text-shadow: none; }

      &--sale { color: #C9A84C; font-weight: 700; }
    }

    .navbar.scrolled .nav-link {
      color: #1A1A1A; text-shadow: none;
      &:hover { color: #a07830; background: rgba(201,168,76,0.08); }
      &.active { color: #a07830; }
      &--sale { color: #a07830; }
    }

    .nav-chevron {
      width: 10px; height: 7px; flex-shrink: 0;
      transition: transform 0.25s ease;
    }
    .has-mega:hover .nav-chevron { transform: rotate(180deg); }

    /* ── MEGA MENU — pure CSS hover ──────────────────────── */
    .mega-menu {
      position: absolute;
      top: calc(100% + 16px);
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      width: 900px;
      background: #fdfaf6;
      border: 1px solid rgba(201,168,76,0.2);
      border-top: 3px solid #C9A84C;
      border-radius: 20px;
      box-shadow:
        0 32px 80px rgba(26,26,26,0.18),
        0 4px 20px rgba(26,26,26,0.08),
        0 0 0 1px rgba(201,168,76,0.06);
      z-index: 999;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .has-mega:hover .mega-menu {
      opacity: 1;
      pointer-events: all;
      transform: translateX(-50%) translateY(0);
    }

    /* Promo bar at top */
    .mega-promo-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.6rem 2rem;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2118 100%);
      font-family: var(--font-body);
      font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase;

      span { color: rgba(245,240,232,0.7); }

      a {
        color: #C9A84C; text-decoration: none; font-weight: 600;
        transition: color 0.2s;
        &:hover { color: #e8c96a; }
      }
    }

    .mega-inner {
      display: grid;
      grid-template-columns: 1fr 1fr 260px;
      gap: 0;
    }

    .mega-col {
      padding: 1.75rem 2rem;

      &:nth-child(1) { background: #fdfaf6; }
      &:nth-child(2) {
        background: #fdfaf6;
        border-left: 1px solid rgba(201,168,76,0.12);
        border-right: 1px solid rgba(201,168,76,0.12);
      }
      &--image { padding: 0; overflow: hidden; }
    }

    .mega-heading {
      display: flex; align-items: center; gap: 0.5rem;
      font-family: var(--font-body);
      font-size: 0.6rem; font-weight: 800;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: #C9A84C;
      margin: 0 0 1.25rem;
      padding-bottom: 0.875rem;
      border-bottom: 1px solid rgba(201,168,76,0.18);
    }

    .mega-links {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-direction: column; gap: 0;
    }

    .mega-link {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 0.65rem 0.75rem;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background: linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.04));
        transform: translateX(4px);

        .mega-link-content strong { color: #a07830; }
        .mega-arrow { opacity: 1; transform: translateX(0); }
      }

      &--featured {
        background: linear-gradient(135deg, rgba(201,168,76,0.06), transparent);
        border: 1px solid rgba(201,168,76,0.15);
        margin-bottom: 0.25rem;
      }

      &--sale {
        background: linear-gradient(135deg, rgba(220,50,50,0.05), transparent);
        border: 1px solid rgba(220,50,50,0.12);
        margin-bottom: 0.5rem;
      }
    }

    .mega-link-icon {
      width: 32px; height: 32px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 8px;
      background: rgba(201,168,76,0.05);
      transition: all 0.2s;

      svg {
        width: 15px; height: 15px;
        stroke: #b8964a;
        transition: stroke 0.2s;
      }

      .mega-link:hover & {
        background: rgba(201,168,76,0.12);
        border-color: rgba(201,168,76,0.4);
        svg { stroke: #C9A84C; }
      }
    }

    .mega-link-content {
      flex: 1;
      strong {
        display: block;
        font-family: var(--font-heading);
        font-size: 0.95rem; font-weight: 500;
        color: #1a1a1a;
        transition: color 0.2s;
      }
    }

    .mega-badge {
      flex-shrink: 0;
      font-family: var(--font-body);
      font-size: 0.55rem; font-weight: 800;
      letter-spacing: 0.12em; text-transform: uppercase;
      padding: 3px 7px; border-radius: 4px;

      &--new { background: #C9A84C; color: #1a1a1a; }
      &--sale { background: #dc3232; color: #fff; }
    }

    .mega-arrow {
      flex-shrink: 0; color: #C9A84C;
      opacity: 0; transform: translateX(-4px);
      transition: all 0.2s;
    }

    .mega-view-all {
      display: inline-flex; align-items: center;
      margin-top: 1rem;
      font-family: var(--font-body);
      font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: #C9A84C; text-decoration: none;
      padding: 0.5rem 1rem;
      border: 1.5px solid rgba(201,168,76,0.35);
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: #C9A84C; color: #1a1a1a;
        border-color: #C9A84C;
      }
    }

    /* Featured image col */
    .mega-featured {
      display: block; position: relative;
      height: 100%; min-height: 280px;
      overflow: hidden; text-decoration: none;

      img {
        width: 100%; height: 100%;
        object-fit: cover; object-position: center top;
        transition: transform 0.6s ease;
      }

      &:hover img { transform: scale(1.06); }

      &-label {
        position: absolute; bottom: 0; left: 0; right: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
        padding: 2.5rem 1.5rem 1.5rem;
        display: flex; flex-direction: column; gap: 0.375rem;

        span {
          font-family: var(--font-body);
          font-size: 0.6rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(201,168,76,0.8);
        }

        strong {
          font-family: var(--font-heading);
          font-size: 1.25rem; font-weight: 500;
          color: #fff; letter-spacing: 0.02em;
        }
      }
    }

    /* ── ACTIONS ─────────────────────────────────────────── */
    .navbar__actions {
      display: flex; align-items: center; gap: 2px; flex-shrink: 0;
    }

    .action-btn {
      position: relative;
      display: flex; align-items: center; justify-content: center;
      width: 44px; height: 44px;
      background: none; border: none; cursor: pointer;
      color: #fff;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));
      border-radius: 50%;
      transition: all 0.2s ease;
      text-decoration: none; flex-shrink: 0;

      &:hover { color: #C9A84C; filter: none; background: rgba(201,168,76,0.12); }
    }

    .navbar.scrolled .action-btn {
      color: #1A1A1A; filter: none;
      &:hover { color: #C9A84C; background: rgba(201,168,76,0.08); }
    }

    .action-badge {
      position: absolute; top: 6px; right: 6px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #C9A84C; color: #1A1A1A;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; line-height: 1;
    }

    /* ── SEARCH BAR ──────────────────────────────────────── */
    .search-bar {
      position: fixed;
      top: 96px; left: 24px; right: 24px;
      max-width: 1400px; margin: 0 auto;
      background: rgba(245,240,232,0.98);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(26,26,26,0.12);
      padding: 1rem 1.5rem;
      z-index: 198;

      .search-inner { display: flex; align-items: center; gap: 0.75rem; }
      .search-icon  { color: #aaa; flex-shrink: 0; }
      .search-input {
        flex: 1; background: none; border: none;
        font-size: 1.125rem; font-family: var(--font-heading);
        color: #1A1A1A; outline: none;
        &::placeholder { color: #bbb; }
      }
    }

    /* ── LOGIN BTN ───────────────────────────────────────── */
    .login-btn {
      display: flex; align-items: center; gap: 0.35rem;
      border: 1.5px solid rgba(255,255,255,0.6) !important;
      border-radius: 20px !important;
      padding: 0.35rem 0.9rem !important;
      font-size: 0.68rem !important; font-weight: 700 !important;
      letter-spacing: 0.1em !important; text-transform: uppercase !important;
      white-space: nowrap !important; width: auto !important; height: auto !important;
      color: #fff !important;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4));

      &:hover {
        background: rgba(201,168,76,0.15) !important;
        border-color: #C9A84C !important;
        color: #C9A84C !important;
        filter: none;
      }
    }

    .navbar.scrolled .login-btn {
      border: 1.5px solid rgba(201,168,76,0.4) !important;
      color: #1A1A1A !important; filter: none;
      &:hover {
        background: rgba(201,168,76,0.1) !important;
        border-color: #C9A84C !important;
        color: #a07830 !important;
      }
    }

    .login-text {
      font-size: 0.68rem; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      white-space: nowrap; line-height: 1;
    }

    /* ── USER DROPDOWN ───────────────────────────────────── */
    .user-menu-wrap { position: relative; }

    .user-menu-btn {
      display: flex; align-items: center; gap: 0.375rem;
      background: rgba(201,168,76,0.08);
      border: 1px solid rgba(201,168,76,0.25);
      border-radius: 20px;
      padding: 0.25rem 0.625rem 0.25rem 0.25rem;
      cursor: pointer; color: #1A1A1A;
      transition: all 0.25s ease;
      font-family: var(--font-body);
      white-space: nowrap; height: auto; width: auto;
      &:hover { background: rgba(201,168,76,0.14); border-color: #C9A84C; }
    }

    .user-avatar-sm {
      width: 26px; height: 26px; border-radius: 50%;
      background: linear-gradient(135deg, #C9A84C, #a07830);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-heading); font-size: 0.8rem; font-weight: 700;
      color: #1A1A1A; flex-shrink: 0;
    }

    .user-name-sm {
      font-size: 0.75rem; font-weight: 600;
      max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    .user-chevron {
      color: #aaa; transition: transform 0.25s ease;
      &.rotated { transform: rotate(180deg); }
    }

    .user-drop-backdrop { position: fixed; inset: 0; z-index: 198; }

    .user-dropdown {
      position: absolute; top: calc(100% + 10px); right: 0; width: 240px;
      background: #fff;
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(26,26,26,0.14);
      z-index: 199; overflow: hidden;
    }

    .user-drop-header {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem; background: #1A1A1A;
    }

    .user-drop-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, #C9A84C, #a07830);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-heading); font-size: 1.125rem; font-weight: 700;
      color: #1A1A1A; flex-shrink: 0;
    }

    .user-drop-name  { display: block; font-size: 0.875rem; font-weight: 600; color: #f5f0e8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .user-drop-email { display: block; font-size: 0.7rem; color: rgba(245,240,232,0.5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .user-drop-role  {
      display: inline-block; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.15em; text-transform: uppercase;
      background: #C9A84C; color: #1A1A1A;
      padding: 1px 6px; border-radius: 2px; margin-top: 2px;
    }

    .user-drop-menu  { padding: 0.375rem 0; }

    .user-drop-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.625rem 1rem;
      font-size: 0.875rem; color: #1A1A1A;
      text-decoration: none; cursor: pointer;
      background: none; border: none; width: 100%;
      text-align: left; font-family: var(--font-body);
      transition: background 0.15s, color 0.15s;

      app-icon { color: #aaa; flex-shrink: 0; }

      &:hover { background: rgba(201,168,76,0.06); color: #a07830; app-icon { color: #C9A84C; } }
      &--admin { color: #a07830; font-weight: 500; app-icon { color: #C9A84C; } }
      &--logout { color: #888; &:hover { background: rgba(26,26,26,0.04); color: #1A1A1A; } }
    }

    .drop-badge {
      margin-left: auto; background: #C9A84C; color: #1A1A1A;
      font-size: 0.65rem; font-weight: 700;
      padding: 1px 6px; border-radius: 10px; min-width: 18px; text-align: center;
    }

    .user-drop-divider { height: 1px; background: #eee; margin: 0.25rem 0; }

    /* ── MOBILE OVERLAY ──────────────────────────────────── */
    .mobile-overlay {
      position: fixed; inset: 0;
      background: rgba(26,26,26,0.55);
      backdrop-filter: blur(4px); z-index: 150;
    }

    /* ── MOBILE DRAWER ───────────────────────────────────── */
    .mobile-drawer {
      position: fixed; top: 0; left: 0; bottom: 0;
      width: min(320px, 85vw);
      background: #fff;
      z-index: 160;
      display: flex; flex-direction: column;
      padding: 1.5rem; overflow-y: auto;

      .drawer-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 2rem; padding-bottom: 1.5rem;
        border-bottom: 1px solid #eee;

        .drawer-logo {
          font-family: var(--font-heading); font-size: 1.5rem;
          font-weight: 600; color: #1A1A1A; letter-spacing: 0.15em;
        }
      }

      .drawer-nav { list-style: none; padding: 0; margin: 0 0 2rem; flex: 1; }

      .drawer-link {
        display: flex; align-items: center; justify-content: space-between;
        width: 100%; padding: 0.875rem 0;
        font-size: 1.1rem; font-family: var(--font-heading);
        color: #1A1A1A; text-decoration: none;
        border-bottom: 1px solid #f0f0f0;
        background: none; border-left: none; border-right: none; border-top: none;
        cursor: pointer;
        transition: color 0.2s;

        &:hover { color: #C9A84C; }
        &--sale { color: #a07830; font-weight: 600; }
      }

      .drawer-acc-btn { font-size: 1.1rem; font-family: var(--font-heading); }

      .acc-chevron {
        width: 12px; height: 8px; flex-shrink: 0;
        transition: transform 0.25s;
        &.open { transform: rotate(180deg); }
      }

      .drawer-sub {
        list-style: none; padding: 0.5rem 0 0.5rem 1rem; margin: 0;
        background: rgba(201,168,76,0.04);
        border-left: 2px solid rgba(201,168,76,0.3);
        margin-left: 0.5rem; border-radius: 0 0 4px 4px;
      }

      .drawer-sub-link {
        display: block; padding: 0.6rem 0.5rem;
        font-family: var(--font-heading); font-size: 0.95rem;
        color: #444; text-decoration: none;
        transition: color 0.18s, padding-left 0.18s;

        &:hover { color: #C9A84C; padding-left: 1rem; }
        &--gold { color: #a07830; font-weight: 500; }
        &--red  { color: #c94040; font-weight: 500; }
      }

      .drawer-actions {
        display: flex; flex-direction: column; gap: 0.5rem;
        margin-bottom: 1.5rem; padding-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
      }

      .drawer-action-link {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0.75rem; font-size: 0.875rem;
        color: #1A1A1A; text-decoration: none;
        border-radius: 8px;
        transition: color 0.2s, background 0.2s;
        position: relative;
        &:hover { color: #C9A84C; background: rgba(201,168,76,0.06); }
      }

      .drawer-admin { margin-top: auto; padding-top: 1rem; }

      .drawer-user {
        display: block; font-family: var(--font-heading); font-size: 1.1rem;
        color: #1A1A1A; padding: 0.75rem 0;
        border-bottom: 1px solid #eee; margin-bottom: 0.5rem;
      }

      .drawer-link--logout {
        color: #888 !important; font-size: 0.875rem;
        background: none; border: none; cursor: pointer;
        padding: 0.75rem 0; width: 100%; text-align: left;
        border-bottom: 1px solid #eee; font-family: var(--font-heading);
        &:hover { color: #1A1A1A !important; }
      }

      .drawer-link--login {
        color: #a07830 !important; font-weight: 600;
        background: none; border: none; cursor: pointer;
        padding: 0.75rem 0; width: 100%; text-align: left;
        font-family: var(--font-heading); font-size: 1.1rem;
      }
    }

    /* ── RESPONSIVE ──────────────────────────────────────── */
    @media (min-width: 901px) { .hide-desktop { display: none !important; } }
    @media (max-width: 768px) { .hide-mobile  { display: none !important; } }
  `]
})
export class NavbarComponent implements OnInit {
  cartService     = inject(CartService);
  wishlistService = inject(WishlistService);
  authApi         = inject(AuthApiService);
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isScrolled     = signal(false);
  mobileMenuOpen = signal(false);
  searchOpen     = signal(false);
  showAuthModal  = signal(false);
  userDropOpen   = signal(false);
  activeMega     = signal<string | null>(null);
  drawerAcc      = signal<string | null>(null);

  get isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  private megaTimer: any;

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
    if (!this._ticking) {
      requestAnimationFrame(() => {
        this.isScrolled.set(window.scrollY > 20);
        this._ticking = false;
      });
      this._ticking = true;
    }
  }

  openMega(name: string) {
    clearTimeout(this.megaTimer);
    this.activeMega.set(name);
  }

  closeMega() {
    this.megaTimer = setTimeout(() => this.activeMega.set(null), 120);
  }

  toggleDrawerAcc(name: string) {
    this.drawerAcc.update(v => v === name ? null : name);
  }

  toggleDrop()       { this.userDropOpen.update(v => !v); }
  toggleMobileMenu() { this.mobileMenuOpen.update(v => !v); }
  closeMobileMenu()  { this.mobileMenuOpen.set(false); this.drawerAcc.set(null); }
  toggleSearch()     { this.searchOpen.update(v => !v); }

  logout() {
    this.authApi.logout();
    this.userDropOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }
}
