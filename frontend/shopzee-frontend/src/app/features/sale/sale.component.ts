import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [CommonModule, RouterLink, SvgIconsComponent],
  template: `
    <!-- Hero -->
    <section class="sale-hero">
      <div class="sale-hero__split">
        <div class="sale-hero__img"><img src="assets/images/women/women-6.png" alt="Sale" loading="eager"/></div>
        <div class="sale-hero__img"><img src="assets/images/men/men-3.png" alt="Sale" loading="eager"/></div>
        <div class="sale-hero__img"><img src="assets/images/women/women-7.png" alt="Sale" loading="eager"/></div>
      </div>
      <div class="sale-hero__overlay"></div>
      <div class="sale-hero__content">
        <span class="sale-hero__tag">LIMITED TIME</span>
        <h1 class="sale-hero__title">Sale</h1>
        <p class="sale-hero__sub">Up to 50% off — {{ saleProducts().length }} items</p>
        <div class="sale-hero__tabs">
          <button class="sale-tab" [class.active]="filter() === 'all'"   (click)="filter.set('all')">All</button>
          <button class="sale-tab" [class.active]="filter() === 'women'" (click)="filter.set('women')">Women</button>
          <button class="sale-tab" [class.active]="filter() === 'men'"   (click)="filter.set('men')">Men</button>
        </div>
      </div>
    </section>

    <!-- Breadcrumb -->
    <div class="sale-breadcrumb container">
      <a routerLink="/">Home</a><span>›</span><span class="sale-crumb">Sale</span>
    </div>

    <!-- Products -->
    <section class="sale-section container">
      <div class="sale-header">
        <div>
          <h2 class="sale-title">
            @if (filter() === 'all')   { All Sale Items }
            @if (filter() === 'women') { Women's Sale }
            @if (filter() === 'men')   { Men's Sale }
          </h2>
          <p class="sale-count">{{ filtered().length }} products on sale</p>
        </div>
        <div class="sale-filter-tabs hide-mobile">
          <button class="sale-tab" [class.active]="filter() === 'all'"   (click)="filter.set('all')">All</button>
          <button class="sale-tab" [class.active]="filter() === 'women'" (click)="filter.set('women')">Women</button>
          <button class="sale-tab" [class.active]="filter() === 'men'"   (click)="filter.set('men')">Men</button>
        </div>
      </div>

      @if (loading()) {
        <div class="sale-loading"><div class="sale-spinner"></div></div>
      } @else if (filtered().length === 0) {
        <div class="sale-empty">
          <h3>No sale items found</h3>
          <p>Check back soon for new deals!</p>
          <a routerLink="/women" class="btn btn-primary">Shop Women</a>
        </div>
      } @else {
        <div class="product-grid">
          @for (product of filtered(); track product.id) {
            <article class="product-card">
              <span class="card-badge badge-sale">-{{ product.discount }}%</span>
              @if (product.isNew) {
                <span class="card-badge badge-new" style="top:2.5rem">New</span>
              }
              <button class="card-wishlist"
                [class.active]="wishlistService.isWishlisted(product.id)"
                (click)="toggleWishlist(product)"
                [attr.aria-label]="wishlistService.isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
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
                <h3 class="card-title"><a [routerLink]="['/product', product.id]">{{ product.name }}</a></h3>
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
    </section>
  `,
  styles: [`
    .sale-hero {
      position: relative; height: 480px; overflow: hidden;
      @media (max-width: 768px) { height: 340px; }
      @media (max-width: 480px) { height: 280px; }

      &__split {
        display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; height: 100%; gap: 3px;
        @media (max-width: 600px) { grid-template-columns: 1fr; div:not(:first-child) { display: none; } }
      }

      &__img { overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; object-position: top center; } }

      &__overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to bottom, rgba(26,26,26,0.15) 0%, rgba(200,10,10,0.35) 60%, rgba(26,26,26,0.85) 100%);
      }

      &__content {
        position: absolute; inset: 0; display: flex; flex-direction: column;
        align-items: center; justify-content: flex-end; text-align: center;
        padding-bottom: 2.5rem; color: var(--cream);
      }

      &__tag {
        font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
        color: #ff6b6b; border: 1px solid rgba(255,107,107,0.6);
        padding: 0.25rem 1rem; margin-bottom: 0.75rem; display: inline-block;
      }

      &__title {
        font-family: var(--font-heading); font-size: clamp(3rem, 8vw, 6rem);
        font-weight: 400; line-height: 1; margin-bottom: 0.5rem; color: #fff;
      }

      &__sub {
        font-size: var(--text-sm); color: rgba(245,240,232,0.7);
        letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.5rem;
      }

      &__tabs { display: flex; gap: 0.5rem; @media (min-width: 901px) { display: none; } }
    }

    .sale-breadcrumb {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: var(--text-sm); color: var(--gray-400);
      padding-top: 1.25rem; padding-bottom: 0.5rem;
      a { color: var(--gray-400); text-decoration: none; &:hover { color: var(--gold); } }
      .sale-crumb { color: #e05252; font-weight: 600; }
    }

    .sale-section { padding-top: 2rem; padding-bottom: 5rem; }

    .sale-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;
    }

    .sale-title { font-family: var(--font-heading); font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 400; }
    .sale-count { font-size: var(--text-sm); color: var(--gray-400); margin-top: 0.25rem; }

    .sale-filter-tabs { display: flex; gap: 0.5rem; }

    .sale-tab {
      padding: 0.45rem 1.25rem; font-size: 0.72rem; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase;
      background: none; border: 1.5px solid var(--gray-300); cursor: pointer;
      color: var(--gray-400); transition: all 0.2s;
      &.active { border-color: #e05252; background: #e05252; color: #fff; }
      &:hover:not(.active) { border-color: #e05252; color: #e05252; }
    }

    .sale-loading { display: flex; justify-content: center; padding: 4rem; }
    .sale-spinner { width: 40px; height: 40px; border: 3px solid var(--gray-200); border-top-color: #e05252; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .sale-empty { text-align: center; padding: 4rem 1rem; h3 { font-family: var(--font-heading); font-size: var(--text-3xl); margin-bottom: 0.5rem; } p { color: var(--gray-400); margin-bottom: 1.5rem; } }

    .card-price-wrap { display: flex; align-items: baseline; gap: var(--space-2); flex-wrap: wrap; }

    @media (max-width: 768px) { .hide-mobile { display: none !important; } }
  `]
})
export class SaleComponent implements OnInit {
  private productService = inject(ProductService);
  cartService            = inject(CartService);
  wishlistService        = inject(WishlistService);
  private toast          = inject(ToastService);

  loading  = signal(true);
  filter   = signal<'all' | 'women' | 'men'>('all');
  private _products = signal<Product[]>([]);

  saleProducts = computed(() => this._products().filter(p => p.discount && p.discount > 0));
  filtered     = computed(() => {
    const f = this.filter();
    if (f === 'women') return this.saleProducts().filter(p => p.category === 'women');
    if (f === 'men')   return this.saleProducts().filter(p => p.category === 'men');
    return this.saleProducts();
  });

  ngOnInit() {
    this.productService.getProductsFromApi({ pageSize: 100 }).subscribe({
      next: res => { this._products.set(res.items); this.loading.set(false); },
      error: () => { this._products.set(this.productService.products()); this.loading.set(false); }
    });
  }

  addToCart(product: Product) {
    this.cartService.addItem(product, product.sizes[1] || product.sizes[0], product.colors[0]);
    this.toast.cart(`${product.name} added to cart`);
  }

  toggleWishlist(product: Product) {
    this.wishlistService.toggle(product);
    this.toast.wishlist(this.wishlistService.isWishlisted(product.id)
      ? `${product.name} added to wishlist`
      : `${product.name} removed from wishlist`);
  }

  formatPrice(price: number): string {
    return 'PKR ' + price.toLocaleString('en-PK');
  }
}
