import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductApiService, ApiProduct } from '../../core/services/api/product-api.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { apiToProduct } from '../../core/services/product.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SvgIconsComponent],
  template: `
    <div class="search-page">

      <!-- Search Hero Bar -->
      <div class="search-hero">
        <div class="container">
          <p class="search-hero__label">Search</p>
          <div class="search-bar-wrap">
            <form (submit)="onSearch($event)" class="search-form">
              <div class="search-input-wrap">
                <app-icon name="search" [size]="22" class="search-ico"/>
                <input
                  #searchInput
                  type="search"
                  [(ngModel)]="query"
                  name="q"
                  placeholder="Search clothing, styles, collections..."
                  class="search-input"
                  autocomplete="off"
                  autofocus
                />
                @if (query) {
                  <button type="button" class="search-clear" (click)="query=''; results.set([]); searched.set(false)" aria-label="Clear">
                    <app-icon name="close" [size]="18"/>
                  </button>
                }
                <button type="submit" class="btn btn-primary search-btn">Search</button>
              </div>
            </form>
          </div>
          @if (searched()) {
            <p class="search-count">
              @if (results().length > 0) {
                <strong>{{ results().length }}</strong> result{{ results().length !== 1 ? 's' : '' }} for "<em>{{ lastQuery() }}</em>"
              } @else {
                No results for "<em>{{ lastQuery() }}</em>"
              }
            </p>
          }
        </div>
      </div>

      <div class="container">

        <!-- Trending searches (shown before searching) -->
        @if (!searched() && !loading()) {
          <div class="trending-section">
            <p class="trending-label">Popular Searches</p>
            <div class="trending-chips">
              @for (tag of trendingTags; track tag) {
                <button class="trend-chip" (click)="searchTag(tag)">{{ tag }}</button>
              }
            </div>

            <p class="trending-label" style="margin-top:2rem">Shop By Category</p>
            <div class="category-cards">
              <a routerLink="/women" class="cat-card cat-card--women">
                <img src="assets/images/women/women-3.png" alt="Women"/>
                <div class="cat-card__overlay"><span>Women's</span></div>
              </a>
              <a routerLink="/men" class="cat-card cat-card--men">
                <img src="assets/images/men/men-2.png" alt="Men"/>
                <div class="cat-card__overlay"><span>Men's</span></div>
              </a>
              <a routerLink="/new-arrivals" class="cat-card cat-card--new">
                <img src="assets/images/women/women-1.png" alt="New Arrivals"/>
                <div class="cat-card__overlay"><span>New Arrivals</span></div>
              </a>
              <a routerLink="/sale" class="cat-card cat-card--sale">
                <img src="assets/images/women/women-5.png" alt="Sale"/>
                <div class="cat-card__overlay"><span>Sale</span></div>
              </a>
            </div>
          </div>
        }

        <!-- Loading -->
        @if (loading()) {
          <div class="search-loading">
            <div class="spinner"></div>
            <span>Searching...</span>
          </div>
        }

        <!-- Results Grid -->
        @if (searched() && !loading()) {
          @if (results().length > 0) {
            <div class="results-grid">
              @for (product of results(); track product.id) {
                <article class="product-card">
                  @if (product.isNew) { <span class="card-badge badge-new">New</span> }
                  @if (product.discount) { <span class="card-badge badge-sale" [style.top]="product.isNew ? '2.5rem' : 'var(--space-3)'">-{{ product.discount }}%</span> }
                  @if (product.isInStock === false) { <span class="card-badge badge-stockout">Out of Stock</span> }
                  <button class="card-wishlist" [class.active]="wishlist.isWishlisted(product.id)" (click)="toggleWishlist(product)">
                    <app-icon [name]="wishlist.isWishlisted(product.id) ? 'heart-filled' : 'heart'" [size]="18"/>
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
                    <div class="card-price-wrap">
                      <span class="card-price">PKR {{ product.price | number }}</span>
                      @if (product.originalPrice) {
                        <span class="card-price-original">PKR {{ product.originalPrice | number }}</span>
                      }
                    </div>
                  </div>
                </article>
              }
            </div>
          } @else {
            <!-- No results -->
            <div class="no-results">
              <div class="no-results__icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h2>No results found</h2>
              <p>We couldn't find anything for "<strong>{{ lastQuery() }}</strong>"</p>
              <p class="no-results__tips">Try:</p>
              <ul>
                <li>Checking your spelling</li>
                <li>Using more general terms (e.g. "suit" instead of "green embroidered suit")</li>
                <li>Browsing our collections below</li>
              </ul>
              <div class="no-results__cta">
                <a routerLink="/women" class="btn btn-primary">Women's Collection</a>
                <a routerLink="/men" class="btn btn-dark">Men's Collection</a>
              </div>
            </div>
          }
        }

      </div>
    </div>
  `,
  styles: [`
    .search-page { background: var(--cream); min-height: 100vh; }

    .search-hero {
      background: var(--black);
      padding: 100px 0 40px;
      &__label {
        font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
        color: var(--gold); margin-bottom: 1.25rem; display: block;
      }
    }

    .search-form { width: 100%; }

    .search-input-wrap {
      display: flex; align-items: center; gap: 0;
      background: rgba(245,240,232,0.06);
      border: 1px solid rgba(201,168,76,0.3);
      max-width: 720px;
      transition: border-color 0.2s;
      &:focus-within { border-color: var(--gold); }
      .search-ico { color: rgba(245,240,232,0.4); flex-shrink: 0; padding: 0 1rem; }
    }

    .search-input {
      flex: 1; background: none; border: none; outline: none;
      font-family: var(--font-heading); font-size: 1.375rem; font-weight: 300;
      color: var(--cream); padding: 1rem 0;
      &::placeholder { color: rgba(245,240,232,0.25); }
    }

    .search-clear {
      background: none; border: none; cursor: pointer; color: rgba(245,240,232,0.4);
      padding: 0 0.75rem; display: flex; align-items: center;
      &:hover { color: var(--cream); }
    }

    .search-btn { border-radius: 0; padding: 1rem 1.75rem; height: auto; }

    .search-count {
      margin-top: 1rem; font-size: 0.9rem; color: rgba(245,240,232,0.5);
      em { color: var(--gold-light); font-style: italic; }
      strong { color: var(--cream); }
    }

    .trending-section { padding: 3rem 0 2rem; }

    .trending-label {
      font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--gold-dark); font-weight: 700; margin-bottom: 1rem;
    }

    .trending-chips { display: flex; flex-wrap: wrap; gap: 0.625rem; }

    .trend-chip {
      padding: 0.4rem 1rem; border: 1px solid var(--gray-300);
      background: none; cursor: pointer; font-size: 0.8125rem; color: var(--gray-500);
      transition: all 0.2s;
      &:hover { border-color: var(--gold); color: var(--gold-dark); background: rgba(201,168,76,0.05); }
    }

    .category-cards {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
      background: var(--gray-200); border: 1px solid var(--gray-200);
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    }

    .cat-card {
      position: relative; aspect-ratio: 4/5; overflow: hidden;
      text-decoration: none; display: block;
      img { width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform 0.5s ease; }
      &:hover img { transform: scale(1.05); }
      &__overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to top, rgba(26,26,26,0.75) 0%, transparent 50%);
        display: flex; align-items: flex-end; padding: 1.25rem;
        span { font-family: var(--font-heading); font-size: 1.25rem; color: var(--cream); letter-spacing: 0.1em; }
      }
    }

    .search-loading { display: flex; align-items: center; gap: 1rem; padding: 4rem; justify-content: center; color: var(--gray-400); }
    .spinner { width: 28px; height: 28px; border: 2px solid var(--gray-200); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-5);
      padding: 2.5rem 0 5rem;
      @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 900px)  { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px)  { grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
    }

    .no-results {
      text-align: center; padding: 4rem 1rem 6rem;
      max-width: 480px; margin: 0 auto;
      &__icon { margin-bottom: 1.5rem; }
      h2 { font-family: var(--font-heading); font-size: 2rem; font-weight: 400; margin-bottom: 0.75rem; }
      p { color: var(--gray-500); margin-bottom: 0.5rem; strong { color: var(--black); } }
      &__tips { font-size: 0.875rem; font-weight: 600; color: var(--gold-dark); margin-top: 1.5rem; text-transform: uppercase; letter-spacing: 0.1em; }
      ul { list-style: none; padding: 0; margin: 0.75rem 0 0; text-align: left; display: inline-block;
        li { font-size: 0.875rem; color: var(--gray-400); padding: 0.25rem 0 0.25rem 1.25rem; position: relative;
          &::before { content: '—'; position: absolute; left: 0; color: var(--gold); }
        }
      }
      &__cta { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap; }
    }
  `]
})
export class SearchComponent implements OnInit {
  private productApi = inject(ProductApiService);
  private router     = inject(Router);
  private route      = inject(ActivatedRoute);
  wishlist           = inject(WishlistService);
  private cart       = inject(CartService);
  private toast      = inject(ToastService);

  query     = '';
  results   = signal<any[]>([]);
  loading   = signal(false);
  searched  = signal(false);
  lastQuery = signal('');

  trendingTags = ['Embroidered Suits', 'Bridal', 'Shalwar Kameez', 'Festive', 'Formal', 'Party Wear', 'Sherwani', 'Sale'];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const q = params['q'] || '';
      if (q) { this.query = q; this.doSearch(q); }
    });
  }

  onSearch(e: Event) {
    e.preventDefault();
    if (!this.query.trim()) return;
    this.router.navigate(['/search'], { queryParams: { q: this.query.trim() } });
    this.doSearch(this.query.trim());
  }

  searchTag(tag: string) {
    this.query = tag;
    this.router.navigate(['/search'], { queryParams: { q: tag } });
    this.doSearch(tag);
  }

  private doSearch(q: string) {
    this.loading.set(true);
    this.searched.set(false);
    this.lastQuery.set(q);
    this.productApi.getAll({ search: q, pageSize: 50 }).subscribe({
      next: res => {
        const items = res.items.map(apiToProduct);
        this.results.set(items);
        this.loading.set(false);
        this.searched.set(true);
        
        // Auto-redirect if single product found
        if (items.length === 1) {
          // Navigate to product detail page
          this.router.navigate(['/product', items[0].id]);
        } else if (items.length > 1) {
          // Check if all products belong to same category
          const categories = [...new Set(items.map((p: any) => p.category))];
          const tags = [...new Set(items.flatMap((p: any) => p.tags || []))];
          
          // Redirect based on dominant category/tag
          if (categories.length === 1) {
            const cat = categories[0].toLowerCase();
            if (cat === 'women' || cat === 'men') {
              this.router.navigate([`/${cat}`]);
              return;
            }
          }
          
          // Check for special tags
          if (tags.includes('new-arrival') || tags.includes('new')) {
            this.router.navigate(['/new-arrivals']);
            return;
          }
          
          if (tags.includes('sale') || items.some((p: any) => p.discount > 0)) {
            this.router.navigate(['/sale']);
            return;
          }
          
          // Otherwise stay on search results page
        }
      },
      error: () => { this.loading.set(false); this.searched.set(true); }
    });
  }

  addToCart(product: any) {
    this.cart.addItem(product, product.sizes?.[0] || 'M', product.colors?.[0] || '');
    this.toast.cart(`${product.name} added to cart`);
  }

  toggleWishlist(product: any) {
    this.wishlist.toggle(product);
    this.toast.wishlist(this.wishlist.isWishlisted(product.id) ? 'Added to wishlist' : 'Removed from wishlist');
  }
}
