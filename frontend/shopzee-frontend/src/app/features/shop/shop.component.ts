import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SvgIconsComponent],
  template: `
    <!-- Page Hero — full image, no cut -->
    <div class="shop-hero" [class.shop-hero--men]="category() === 'men'">
      <!-- Women: use multiple images in split layout; Men: single full image -->
      @if (category() === 'women') {
        <div class="shop-hero__split">
          <div class="shop-hero__img-wrap">
            <img src="assets/images/women/women-5.png" alt="Women's collection" class="shop-hero__img" loading="eager"/>
          </div>
          <div class="shop-hero__img-wrap">
            <img src="assets/images/women/women-3.png" alt="Women's collection" class="shop-hero__img" loading="eager"/>
          </div>
          <div class="shop-hero__img-wrap">
            <img src="assets/images/women/women-1.png" alt="Women's collection" class="shop-hero__img" loading="eager"/>
          </div>
        </div>
      } @else {
        <div class="shop-hero__split">
          <div class="shop-hero__img-wrap">
            <img src="assets/images/men/men-4.png" alt="Men's collection" class="shop-hero__img" loading="eager"/>
          </div>
          <div class="shop-hero__img-wrap">
            <img src="assets/images/men/men-1.png" alt="Men's collection" class="shop-hero__img" loading="eager"/>
          </div>
          <div class="shop-hero__img-wrap">
            <img src="assets/images/men/men-2.png" alt="Men's collection" class="shop-hero__img" loading="eager"/>
          </div>
        </div>
      }
      <div class="shop-hero__overlay"></div>
      <div class="shop-hero__content">
        <span class="shop-hero__label">{{ category() === 'women' ? 'Her World' : 'His World' }}</span>
        <h1 class="shop-hero__title">{{ category() === 'women' ? "Women's Collection" : "Men's Collection" }}</h1>
        <p class="shop-hero__count">{{ filteredProducts().length }} pieces</p>
      </div>
    </div>

    <div class="shop-layout container">
      <!-- Sidebar Filters -->
      <aside class="shop-sidebar" [class.open]="filterOpen()">
        <div class="sidebar-header">
          <h2 class="sidebar-title">Filter</h2>
          <button class="sidebar-close hide-desktop" (click)="filterOpen.set(false)" aria-label="Close filters">
            <app-icon name="close" [size]="20"/>
          </button>
        </div>

        <!-- Sort -->
        <div class="filter-group">
          <h3 class="filter-label">Sort By</h3>
          <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <!-- Sub Category -->
        <div class="filter-group">
          <h3 class="filter-label">Category</h3>
          <div class="filter-options">
            @for (cat of subCategories(); track cat) {
              <label class="filter-check">
                <input
                  type="checkbox"
                  [checked]="selectedCats().includes(cat)"
                  (change)="toggleCat(cat)"
                />
                <span class="check-box"></span>
                <span>{{ cat }}</span>
              </label>
            }
          </div>
        </div>

        <!-- Price Range -->
        <div class="filter-group">
          <h3 class="filter-label">Max Price: PKR {{ maxPrice | number }}</h3>
          <input type="range" [(ngModel)]="maxPrice" (ngModelChange)="applyFilters()"
            min="1000" max="30000" step="500" class="price-slider" aria-label="Max price filter"/>
          <div class="price-range-labels">
            <span>PKR 1,000</span>
            <span>PKR 30,000</span>
          </div>
        </div>

        <!-- Tags -->
        <div class="filter-group">
          <h3 class="filter-label">Tags</h3>
          <div class="tag-chips">
            @for (tag of allTags(); track tag) {
              <button
                class="tag-chip"
                [class.active]="selectedTags().includes(tag)"
                (click)="toggleTag(tag)"
              >{{ tag }}</button>
            }
          </div>
        </div>

        <button class="btn btn-ghost w-full" (click)="clearFilters()" style="margin-top:1.5rem">
          Clear Filters
        </button>
      </aside>

      <!-- Products Area -->
      <div class="shop-main">
        <!-- Toolbar -->
        <div class="shop-toolbar">
          <button class="btn btn-ghost hide-desktop" (click)="filterOpen.set(true)">
            <app-icon name="filter" [size]="16"/> Filters
          </button>
          <span class="results-count">{{ filteredProducts().length }} results</span>
          <div class="view-toggle">
            <button [class.active]="gridView() === 'grid'"   (click)="gridView.set('grid')"   aria-label="Grid view">
              <app-icon name="grid" [size]="18"/>
            </button>
            <button [class.active]="gridView() === 'list'"   (click)="gridView.set('list')"   aria-label="List view">
              <app-icon name="list" [size]="18"/>
            </button>
          </div>
        </div>

        <!-- Grid -->
        <div class="product-grid" [class.list-view]="gridView() === 'list'">
          @for (product of filteredProducts(); track product.id) {
            <article class="product-card">
              @if (product.isNew) { <span class="card-badge badge-new">New</span> }
              @if (product.discount) {
                <span class="card-badge badge-sale" [style.top]="product.isNew ? 'calc(var(--space-3) + 30px)' : 'var(--space-3)'">-{{ product.discount }}%</span>
              }
              @if (product.isInStock === false) {
                <span class="card-badge badge-stockout">Out of Stock</span>
              }
              <button
                class="card-wishlist"
                [class.active]="wishlistService.isWishlisted(product.id)"
                (click)="toggleWishlist(product)"
                [attr.aria-label]="'Toggle wishlist for ' + product.name"
              >
                <app-icon [name]="wishlistService.isWishlisted(product.id) ? 'heart-filled' : 'heart'" [size]="18"/>
              </button>
              <a [routerLink]="['/product', product.id]" class="card-image-wrap">
                <img [src]="product.images[0]" [alt]="product.name" loading="lazy"/>
                <div class="card-overlay">
                  @if (product.isInStock !== false) {
                    <button class="btn btn-primary w-full" (click)="$event.preventDefault(); addToCart(product)">
                      <app-icon name="cart" [size]="16"/> Quick Add
                    </button>
                  } @else {
                    <div class="card-stockout-overlay">Out of Stock</div>
                  }
                </div>
              </a>
              <div class="card-body">
                <span class="card-category">{{ product.subCategory }}</span>
                <h3 class="card-title"><a [routerLink]="['/product', product.id]">{{ product.name }}</a></h3>
                <div class="card-price-wrap flex gap-2">
                  <span class="card-price">PKR {{ product.price | number }}</span>
                  @if (product.originalPrice) {
                    <span class="card-price-original">PKR {{ product.originalPrice | number }}</span>
                  }
                </div>
              </div>
            </article>
          }

          @if (filteredProducts().length === 0) {
            <div class="no-results">
              <app-icon name="search" [size]="48" class="no-results-icon"/>
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
              <button class="btn btn-primary" (click)="clearFilters()">Clear Filters</button>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Mobile Filter Overlay -->
    @if (filterOpen()) {
      <div class="overlay" (click)="filterOpen.set(false)"></div>
    }
  `,
  styles: [`
    .shop-hero {
      position: relative;
      height: 480px;
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
          .shop-hero__img-wrap:not(:first-child) { display: none; }
        }
      }

      &__img-wrap { overflow: hidden; position: relative; height: 100%; }

      &__img {
        width: 100%; height: 100%;
        object-fit: cover; object-position: top center;
        filter: brightness(1.05) contrast(1.02);
        transition: transform 0.7s ease;
        &:hover { filter: brightness(1.05); }
      }

      &__overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to bottom, rgba(26,26,26,0.15) 0%, rgba(26,26,26,0.55) 70%, rgba(26,26,26,0.75) 100%);
      }

      &__content {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: flex-end;
        color: var(--cream); text-align: center;
        padding-bottom: 2.5rem;
        @media (max-width: 480px) { padding-bottom: 1.75rem; }
      }

      &__label {
        font-size: var(--text-xs); letter-spacing: 0.3em;
        text-transform: uppercase; color: var(--gold-light);
        margin-bottom: var(--space-3);
        border: 1px solid rgba(201,168,76,0.4); padding: 0.25rem 1rem;
        display: inline-block;
        @media (max-width: 480px) { font-size: 0.6rem; letter-spacing: 0.2em; }
      }

      &__title {
        font-family: var(--font-heading);
        font-size: clamp(2rem, 5vw, 4.5rem);
        font-weight: 400; line-height: 1.1;
        margin-bottom: var(--space-2); color: var(--cream);
      }

      &__count {
        font-size: var(--text-sm);
        color: rgba(245,240,232,0.7);
        letter-spacing: 0.15em; text-transform: uppercase;
        @media (max-width: 480px) { font-size: var(--text-xs); }
      }
    }

    .shop-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--space-8);
      padding-top: var(--space-10);
      padding-bottom: var(--space-16);

      @media (max-width: 900px) { grid-template-columns: 1fr; gap: var(--space-6); }
      @media (max-width: 480px) { padding-top: var(--space-6); padding-bottom: var(--space-12); }
    }

    .shop-sidebar {
      @media (max-width: 900px) {
        position: fixed; top: 0; left: 0; bottom: 0;
        width: min(300px, 85vw);
        background: var(--cream-light);
        z-index: var(--z-modal);
        padding: var(--space-6);
        overflow-y: auto;
        transform: translateX(-100%);
        transition: transform 0.35s ease;
        box-shadow: 4px 0 32px rgba(26,26,26,0.15);
        &.open { transform: translateX(0); }
      }
    }

    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--space-6); padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--gray-200);
    }

    .sidebar-title { font-family: var(--font-heading); font-size: var(--text-2xl); }
    .sidebar-close { background: none; border: none; cursor: pointer; color: var(--black); padding: 4px; }

    .filter-group {
      margin-bottom: var(--space-6); padding-bottom: var(--space-6);
      border-bottom: 1px solid var(--gray-200);
    }

    .filter-label {
      font-size: var(--text-xs); font-weight: 600;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: var(--gold-dark); margin-bottom: var(--space-3);
      display: block;
    }

    .filter-select {
      width: 100%; padding: var(--space-2) var(--space-3);
      border: 1px solid var(--gray-300); background: var(--cream);
      font-size: var(--text-sm); cursor: pointer;
    }

    .filter-options { display: flex; flex-direction: column; gap: var(--space-2); }

    .filter-check {
      display: flex; align-items: center; gap: var(--space-3);
      cursor: pointer; font-size: var(--text-sm);
      input { display: none; }
      input:checked ~ .check-box { background: var(--gold); border-color: var(--gold); &::after { opacity: 1; } }
    }

    .check-box {
      width: 18px; height: 18px; border: 1.5px solid var(--gray-300);
      position: relative; flex-shrink: 0; transition: all 0.2s;
      &::after {
        content: ''; position: absolute;
        top: 2px; left: 5px; width: 5px; height: 9px;
        border: 2px solid var(--black); border-top: none; border-left: none;
        transform: rotate(45deg); opacity: 0; transition: opacity 0.2s;
      }
    }

    .price-slider { width: 100%; accent-color: var(--gold); margin: var(--space-3) 0; cursor: pointer; }
    .price-range-labels { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--gray-400); }

    .tag-chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .tag-chip {
      padding: var(--space-1) var(--space-3); border: 1px solid var(--gray-300);
      font-size: var(--text-xs); background: none; cursor: pointer;
      transition: all 0.2s; text-transform: capitalize;
      &.active, &:hover { border-color: var(--gold); background: rgba(201,168,76,0.08); color: var(--gold-dark); }
    }

    .shop-toolbar {
      display: flex; align-items: center; gap: var(--space-3);
      margin-bottom: var(--space-6); padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--gray-200);
      flex-wrap: wrap;
    }

    .results-count { font-size: var(--text-sm); color: var(--gray-400); flex: 1; min-width: 100px; }

    .view-toggle {
      display: flex; gap: var(--space-1);
      button {
        width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
        border: 1px solid var(--gray-300); background: none; cursor: pointer;
        color: var(--gray-400); transition: all 0.2s;
        &.active, &:hover { border-color: var(--gold); color: var(--gold); }
      }
    }

    .card-price-wrap { display: flex; align-items: baseline; gap: var(--space-2); flex-wrap: wrap; }

    .no-results {
      grid-column: 1/-1; text-align: center;
      padding: var(--space-20) var(--space-6);
      display: flex; flex-direction: column; align-items: center; gap: var(--space-4);
      .no-results-icon { color: var(--gray-300); }
      h3 { font-family: var(--font-heading); font-size: var(--text-3xl); }
      p { color: var(--gray-400); }

      @media (max-width: 480px) {
        padding: var(--space-12) var(--space-4);
        h3 { font-size: var(--text-2xl); }
      }
    }

    .overlay {
      position: fixed; inset: 0;
      background: rgba(26,26,26,0.5);
      backdrop-filter: blur(4px);
      z-index: calc(var(--z-modal) - 1);
    }

    /* Mobile filter button */
    @media (max-width: 900px) {
      .hide-desktop { display: flex !important; }
    }
  `]
})
export class ShopComponent implements OnInit {
  private productService  = inject(ProductService);
  cartService    = inject(CartService);
  wishlistService= inject(WishlistService);
  private toast  = inject(ToastService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  category   = signal<'women' | 'men'>('women');
  filterOpen = signal(false);
  gridView   = signal<'grid'|'list'>('grid');
  loading    = signal(false);
  sortBy     = 'default';
  maxPrice   = 30000;
  selectedCats = signal<string[]>([]);
  selectedTags = signal<string[]>([]);

  private _products = signal<Product[]>([]);

  subCategories = computed(() => [...new Set(this._products().map(p => p.subCategory || '').filter(Boolean))]);
  allTags       = computed(() => [...new Set(this._products().flatMap(p => p.tags || []))]);

  filteredProducts = computed(() => {
    let list = [...this._products()];
    if (this.selectedCats().length)
      list = list.filter(p => this.selectedCats().includes(p.subCategory || ''));
    if (this.selectedTags().length)
      list = list.filter(p => this.selectedTags().some(t => p.tags?.includes(t)));
    list = list.filter(p => p.price <= this.maxPrice);
    switch (this.sortBy) {
      case 'price-asc':  list.sort((a,b) => a.price - b.price); break;
      case 'price-desc': list.sort((a,b) => b.price - a.price); break;
      case 'newest':     list.sort((a,b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case 'rating':     list.sort((a,b) => b.rating - a.rating); break;
    }
    return list;
  });

  ngOnInit() {
    this.route.data.subscribe(data => {
      const cat = (data['category'] as 'women' | 'men') || 'women';
      this.category.set(cat);
      this.loadProducts(cat);
    });
    this.route.queryParams.subscribe(qp => {
      if (qp['tag']) this.selectedTags.set([qp['tag']]);
    });
  }

  private loadProducts(cat: 'women' | 'men') {
    this.loading.set(true);
    this.productService.getProductsFromApi({ category: cat, pageSize: 50 }).subscribe({
      next: res => {
        this._products.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        // Fallback to mock data if API unavailable
        this._products.set(this.productService.getByCategory(cat));
        this.loading.set(false);
      }
    });
  }

  toggleCat(cat: string) {
    this.selectedCats.update(cats =>
      cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat]
    );
  }

  toggleTag(tag: string) {
    this.selectedTags.update(tags =>
      tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    );
  }

  applyFilters() {} // Computed signal auto-updates

  clearFilters() {
    this.selectedCats.set([]);
    this.selectedTags.set([]);
    this.maxPrice = 30000;
    this.sortBy = 'default';
  }

  addToCart(product: Product) {
    this.cartService.addItem(product, product.sizes[1] || product.sizes[0], product.colors[0]);
    this.toast.cart(`${product.name} added to cart`);
    this.router.navigate(['/cart']);
  }

  toggleWishlist(product: Product) {
    this.wishlistService.toggle(product);
    this.toast.wishlist(this.wishlistService.isWishlisted(product.id) ? `Added to wishlist` : `Removed from wishlist`);
  }
}
