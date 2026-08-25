import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [CommonModule, RouterLink, SvgIconsComponent],
  template: `
    <!-- Hero -->
    <section class="na-hero">
      <div class="na-hero__split">
        <div class="na-hero__img-wrap">
          <img src="assets/images/women/women-1.png" alt="New Arrivals" loading="eager"/>
        </div>
        <div class="na-hero__img-wrap">
          <img src="assets/images/men/men-1.png" alt="New Arrivals" loading="eager"/>
        </div>
        <div class="na-hero__img-wrap">
          <img src="assets/images/women/women-5.png" alt="New Arrivals" loading="eager"/>
        </div>
      </div>
      <div class="na-hero__overlay"></div>
      <div class="na-hero__content">
        <span class="na-hero__label">✦ Just Landed</span>
        <h1 class="na-hero__title">New Arrivals</h1>
        <div class="na-hero__tabs">
          <button class="na-tab" [class.active]="activeFilter() === 'all'"   (click)="activeFilter.set('all')">All</button>
          <button class="na-tab" [class.active]="activeFilter() === 'women'" (click)="activeFilter.set('women')">Women</button>
          <button class="na-tab" [class.active]="activeFilter() === 'men'"   (click)="activeFilter.set('men')">Men</button>
        </div>
      </div>
    </section>

    <!-- Breadcrumb -->
    <div class="na-breadcrumb container">
      <a routerLink="/">Home</a>
      <span>›</span>
      <span>New Arrivals</span>
    </div>

    <!-- Products -->
    <section class="na-section container">

      <!-- Section Header -->
      <div class="na-section__header">
        <div class="na-section__left">
          <h2 class="na-section__title">
            @if (activeFilter() === 'all')   { Latest Arrivals }
            @if (activeFilter() === 'women') { Women's New Arrivals }
            @if (activeFilter() === 'men')   { Men's New Arrivals }
          </h2>
          <p class="na-section__count">{{ filtered().length }} products</p>
        </div>
        <div class="na-filter-tabs hide-mobile">
          <button class="na-tab" [class.active]="activeFilter() === 'all'"   (click)="activeFilter.set('all')">All</button>
          <button class="na-tab" [class.active]="activeFilter() === 'women'" (click)="activeFilter.set('women')">Women</button>
          <button class="na-tab" [class.active]="activeFilter() === 'men'"   (click)="activeFilter.set('men')">Men</button>
        </div>
      </div>

      <!-- Grid -->
      @if (loading()) {
        <div class="na-loading">
          <div class="na-spinner"></div>
          <p>Loading new arrivals...</p>
        </div>
      } @else if (filtered().length === 0) {
        <div class="na-empty">
          <app-icon name="package" [size]="56" class="na-empty__icon"/>
          <h3>No new arrivals yet</h3>
          <p>Check back soon for the latest pieces</p>
          <a routerLink="/women" class="btn btn-primary">Shop Women</a>
        </div>
      } @else {
        <div class="product-grid">
          @for (product of filtered(); track product.id) {
            <article class="product-card">
              <span class="card-badge badge-new">New</span>
              @if (product.discount) {
                <span class="card-badge badge-sale" style="top:2.5rem">-{{ product.discount }}%</span>
              }
              <button
                class="card-wishlist"
                [class.active]="wishlistService.isWishlisted(product.id)"
                (click)="toggleWishlist(product)"
                [attr.aria-label]="wishlistService.isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
              >
                <app-icon [name]="wishlistService.isWishlisted(product.id) ? 'heart-filled' : 'heart'" [size]="18"/>
              </button>
              <a [routerLink]="['/product', product.id]" class="card-image-wrap">
                <img [src]="product.images[0]" [alt]="product.name" loading="lazy" decoding="async"/>
                <div class="card-overlay">
                  <button class="btn btn-primary w-full" (click)="$event.preventDefault(); addToCart(product)">
                    <app-icon name="cart" [size]="16"/> Quick Add
                  </button>
                </div>
              </a>
              <div class="card-body">
                <span class="card-category">{{ product.subCategory }}</span>
                <h3 class="card-title">
                  <a [routerLink]="['/product', product.id]">{{ product.name }}</a>
                </h3>
                <div class="card-price-wrap">
                  <span class="card-price">{{ formatPrice(product.price) }}</span>
                  @if (product.originalPrice) {
                    <span class="card-price-original">{{ formatPrice(product.originalPrice) }}</span>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      }

      <!-- CTA at bottom -->
      <div class="na-cta">
        <div class="na-cta__inner">
          <h3>Looking for something specific?</h3>
          <p>Browse our full collections</p>
          <div class="na-cta__btns">
            <a routerLink="/women" class="btn btn-dark">Shop Women</a>
            <a routerLink="/men" class="btn btn-outline">Shop Men</a>
          </div>
        </div>
      </div>

    </section>
  `,
  styles: [`
    /* ── HERO ───────────────────────────────────────── */
    .na-hero {
      position: relative;
      height: 520px;
      overflow: hidden;
      margin-top: 0;

      @media (max-width: 768px) { height: 380px; }
      @media (max-width: 480px) { height: 300px; }

      &__split {
        display: grid;
        grid-template-columns: 1.2fr 1fr 1.2fr;
        height: 100%;
        gap: 3px;

        @media (max-width: 600px) {
          grid-template-columns: 1fr;
          div:not(:first-child) { display: none; }
        }
      }

      &__img-wrap {
        overflow: hidden;
        img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: top center;
          transition: transform 0.6s ease;
          &:hover { transform: scale(1.04); }
        }
      }

      &__overlay {
        position: absolute; inset: 0;
        background:
          linear-gradient(to bottom, rgba(26,26,26,0.2) 0%, rgba(26,26,26,0.65) 70%, rgba(26,26,26,0.85) 100%);
      }

      &__content {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: flex-end;
        color: var(--cream); text-align: center;
        padding-bottom: 3rem;
        @media (max-width: 480px) { padding-bottom: 2rem; }
      }

      &__label {
        font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase;
        color: var(--gold-light); margin-bottom: 0.75rem;
        border: 1px solid rgba(201,168,76,0.4); padding: 0.25rem 1rem;
        display: inline-block;
      }

      &__title {
        font-family: var(--font-heading);
        font-size: clamp(2.5rem, 6vw, 5rem);
        font-weight: 400; line-height: 1;
        margin-bottom: 0.5rem; color: var(--cream);
      }

      &__sub {
        font-size: var(--text-sm); color: rgba(245,240,232,0.65);
        letter-spacing: 0.15em; text-transform: uppercase;
        margin-bottom: 1.5rem;
      }

      &__tabs {
        display: flex; gap: 0.5rem;
        @media (min-width: 901px) { display: none; }
      }
    }

    /* ── BREADCRUMB ─────────────────────────────────── */
    .na-breadcrumb {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: var(--text-sm); color: var(--gray-400);
      padding-top: 1.25rem; padding-bottom: 0.5rem;

      a { color: var(--gray-400); text-decoration: none; &:hover { color: var(--gold); } }
    }

    /* ── STATS STRIP ────────────────────────────────── */
    .na-stats {
      background: var(--black);
      padding: 1.5rem 0;
      margin-bottom: 0;

      @media (max-width: 480px) { padding: 1rem 0; }

      &__inner {
        display: flex; align-items: center; justify-content: center;
        gap: 0; flex-wrap: wrap;
      }
    }

    .na-stat {
      display: flex; flex-direction: column;
      align-items: center; gap: 0.25rem;
      padding: 0 3rem;

      @media (max-width: 768px) { padding: 0.5rem 1.5rem; }
      @media (max-width: 480px) { padding: 0.5rem 1rem; }

      &__num {
        font-family: var(--font-heading); font-size: 2rem; font-weight: 400;
        color: var(--gold);
        @media (max-width: 480px) { font-size: 1.5rem; }
      }

      &__label {
        font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
        color: rgba(245,240,232,0.5);
      }

      &__divider {
        width: 1px; height: 40px;
        background: rgba(201,168,76,0.2);
        @media (max-width: 480px) { display: none; }
      }
    }

    /* ── SECTION ────────────────────────────────────── */
    .na-section {
      padding-top: 3rem;
      padding-bottom: 5rem;

      @media (max-width: 480px) { padding-top: 2rem; padding-bottom: 3rem; }

      &__header {
        display: flex; align-items: flex-end; justify-content: space-between;
        margin-bottom: 2.5rem; gap: 1rem; flex-wrap: wrap;

        @media (max-width: 600px) { margin-bottom: 1.5rem; }
      }

      &__title {
        font-family: var(--font-heading); font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 400; color: var(--black); margin-bottom: 0.25rem;
      }

      &__count {
        font-size: var(--text-sm); color: var(--gray-400); letter-spacing: 0.1em;
      }
    }

    /* Filter tabs */
    .na-filter-tabs {
      display: flex; gap: 0.5rem;
    }

    .na-tab {
      padding: 0.45rem 1.25rem;
      font-family: var(--font-body); font-size: 0.72rem; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase;
      background: none; border: 1.5px solid var(--gray-300);
      cursor: pointer; color: var(--gray-400);
      transition: all 0.2s ease;

      &.active {
        border-color: var(--gold); background: var(--gold);
        color: var(--black);
      }

      &:hover:not(.active) {
        border-color: var(--gold); color: var(--gold-dark);
      }
    }

    /* ── LOADING / EMPTY ────────────────────────────── */
    .na-loading {
      display: flex; flex-direction: column; align-items: center;
      gap: 1rem; padding: 5rem 0; color: var(--gray-400);

      p { font-size: var(--text-sm); letter-spacing: 0.1em; }
    }

    .na-spinner {
      width: 40px; height: 40px; border-radius: 50%;
      border: 3px solid var(--gray-200); border-top-color: var(--gold);
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .na-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 1rem; padding: 5rem 1rem; text-align: center;

      &__icon { color: var(--gray-300); }
      h3 { font-family: var(--font-heading); font-size: var(--text-3xl); font-weight: 400; }
      p { color: var(--gray-400); font-size: var(--text-sm); }
    }

    /* ── CTA BANNER ─────────────────────────────────── */
    .na-cta {
      margin-top: 4rem;
      background: var(--black);
      padding: 3rem 2rem;
      text-align: center;

      &__inner {
        max-width: 500px; margin: 0 auto;

        h3 {
          font-family: var(--font-heading); font-size: 2rem; font-weight: 400;
          color: var(--cream); margin-bottom: 0.5rem;
        }

        p { color: rgba(245,240,232,0.5); font-size: var(--text-sm); margin-bottom: 1.5rem; }
      }

      &__btns {
        display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;

        .btn-outline {
          color: var(--cream); border-color: rgba(245,240,232,0.4);
          &:hover { border-color: var(--gold); color: var(--gold); }
        }
      }
    }

    /* hide-mobile */
    @media (max-width: 768px) { .hide-mobile { display: none !important; } }

    .card-price-wrap { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
  `]
})
export class NewArrivalsComponent implements OnInit {
  private productService = inject(ProductService);
  cartService            = inject(CartService);
  wishlistService        = inject(WishlistService);
  private toast          = inject(ToastService);

  loading      = signal(true);
  activeFilter = signal<'all' | 'women' | 'men'>('all');

  private _products = signal<Product[]>([]);

  allNew    = computed(() => this._products().filter(p => p.isNew));
  womenNew  = computed(() => this.allNew().filter(p => p.category === 'women'));
  menNew    = computed(() => this.allNew().filter(p => p.category === 'men'));

  filtered  = computed(() => {
    const f = this.activeFilter();
    if (f === 'women') return this.womenNew();
    if (f === 'men')   return this.menNew();
    return this.allNew();
  });

  ngOnInit() {
    this.productService.getProductsFromApi({ pageSize: 100 }).subscribe({
      next: res => {
        this._products.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        // Fallback to local mock data
        this._products.set(this.productService.products());
        this.loading.set(false);
      }
    });
  }

  addToCart(product: Product) {
    this.cartService.addItem(product, product.sizes[1] || product.sizes[0], product.colors[0]);
    this.toast.cart(`${product.name} added to cart`);
  }

  toggleWishlist(product: Product) {
    this.wishlistService.toggle(product);
    const msg = this.wishlistService.isWishlisted(product.id)
      ? `${product.name} added to wishlist`
      : `${product.name} removed from wishlist`;
    this.toast.wishlist(msg);
  }

  formatPrice(price: number): string {
    return 'PKR ' + price.toLocaleString('en-PK');
  }
}
