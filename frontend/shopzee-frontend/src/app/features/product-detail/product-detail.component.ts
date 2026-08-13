import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SvgIconsComponent],
  template: `
    @if (product()) {
      <div class="pd-container container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/">Home</a>
          <span>/</span>
          <a [routerLink]="'/' + product()!.category">{{ product()!.category | titlecase }}</a>
          <span>/</span>
          <span>{{ product()!.name }}</span>
        </nav>

        <div class="pd-layout">
          <!-- Gallery -->
          <div class="pd-gallery">
            <div class="pd-main-image">
              <img [src]="product()!.images[activeImage()]" [alt]="product()!.name" class="pd-img"/>
              <button
                class="pd-wishlist-btn"
                [class.active]="wishlistService.isWishlisted(product()!.id)"
                (click)="toggleWishlist()"
                [attr.aria-label]="'Toggle wishlist for ' + product()!.name"
              >
                <app-icon [name]="wishlistService.isWishlisted(product()!.id) ? 'heart-filled' : 'heart'" [size]="22"/>
              </button>
            </div>
            @if (product()!.images.length > 1) {
              <div class="pd-thumbs">
                @for (img of product()!.images; track $index) {
                  <button
                    class="pd-thumb"
                    [class.active]="activeImage() === $index"
                    (click)="activeImage.set($index)"
                    [attr.aria-label]="'View image ' + ($index + 1)"
                  >
                    <img [src]="img" [alt]="product()!.name + ' view ' + ($index + 1)" loading="lazy"/>
                  </button>
                }
              </div>
            }
          </div>

          <!-- Info -->
          <div class="pd-info">
            <span class="pd-category">{{ product()!.subCategory }}</span>
            <h1 class="pd-name">{{ product()!.name }}</h1>

            <!-- Rating -->
            <div class="pd-rating">
              <div class="stars">
                @for (_ of stars(); track $index) {
                  <app-icon name="star-filled" [size]="16" class="star-filled-icon"/>
                }
              </div>
              <span class="pd-reviews">{{ product()!.rating }} ({{ product()!.reviews }} reviews)</span>
            </div>

            <!-- Price -->
            <div class="pd-price-wrap">
              <span class="pd-price">PKR {{ product()!.price | number }}</span>
              @if (product()!.originalPrice) {
                <span class="pd-original-price">PKR {{ product()!.originalPrice | number }}</span>
                <span class="pd-discount-badge">{{ product()!.discount }}% OFF</span>
              }
            </div>

            <div class="ornament-divider"><div class="line"></div><div class="diamond"></div><div class="line"></div></div>

            <!-- Size Selector -->
            <div class="pd-option-group">
              <div class="pd-option-header">
                <span class="pd-option-label">Size: <strong>{{ selectedSize() }}</strong></span>
                <a href="#" class="pd-size-guide">Size Guide</a>
              </div>
              <div class="size-options">
                @for (size of product()!.sizes; track size) {
                  <button
                    class="size-btn"
                    [class.active]="selectedSize() === size"
                    (click)="selectedSize.set(size)"
                    [attr.aria-pressed]="selectedSize() === size"
                  >{{ size }}</button>
                }
              </div>
            </div>

            <!-- Color Selector -->
            <div class="pd-option-group">
              <span class="pd-option-label">Color</span>
              <div class="color-options">
                @for (color of product()!.colors; track color) {
                  <button
                    class="color-btn"
                    [class.active]="selectedColor() === color"
                    (click)="selectedColor.set(color)"
                    [style.background]="color"
                    [attr.aria-label]="'Select color ' + color"
                  ></button>
                }
              </div>
            </div>

            <!-- Quantity -->
            <div class="pd-option-group">
              <span class="pd-option-label">Quantity</span>
              <div class="qty-wrap">
                <button class="qty-btn" (click)="decQty()" aria-label="Decrease quantity">
                  <app-icon name="minus" [size]="16"/>
                </button>
                <span class="qty-value">{{ qty() }}</span>
                <button class="qty-btn" (click)="incQty()" aria-label="Increase quantity">
                  <app-icon name="plus" [size]="16"/>
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="pd-actions">
              <button class="btn btn-primary pd-add-btn" (click)="addToCart()">
                <app-icon name="cart" [size]="18"/> Add to Cart
              </button>
              <button
                class="btn btn-outline pd-wish-btn"
                [class.wishlisted]="wishlistService.isWishlisted(product()!.id)"
                (click)="toggleWishlist()"
              >
                <app-icon [name]="wishlistService.isWishlisted(product()!.id) ? 'heart-filled' : 'heart'" [size]="18"/>
              </button>
            </div>

            <!-- Stock Info -->
            <div class="pd-stock">
              <app-icon name="check-circle" [size]="16" class="stock-icon"/>
              <span>{{ product()!.stock > 10 ? 'In Stock' : 'Only ' + product()!.stock + ' left!' }}</span>
            </div>

            <!-- Description Accordion -->
            <div class="pd-accordion">
              <button class="accordion-btn" (click)="toggleDesc()" [attr.aria-expanded]="descOpen()">
                <span>Description</span>
                <app-icon [name]="descOpen() ? 'chevron-up' : 'chevron-down'" [size]="18"/>
              </button>
              @if (descOpen()) {
                <div class="accordion-content"><p>{{ product()!.description }}</p></div>
              }
            </div>
            <div class="pd-accordion">
              <button class="accordion-btn" (click)="toggleCare()" [attr.aria-expanded]="careOpen()">
                <span>Care Instructions</span>
                <app-icon [name]="careOpen() ? 'chevron-up' : 'chevron-down'" [size]="18"/>
              </button>
              @if (careOpen()) {
                <div class="accordion-content">
                  <p>Dry clean only. Store in a cool, dry place. Avoid direct sunlight. Handle embroidery with care.</p>
                </div>
              }
            </div>
            <div class="pd-accordion">
              <button class="accordion-btn" (click)="toggleShipping()" [attr.aria-expanded]="shippingOpen()">
                <span>Shipping & Returns</span>
                <app-icon [name]="shippingOpen() ? 'chevron-up' : 'chevron-down'" [size]="18"/>
              </button>
              @if (shippingOpen()) {
                <div class="accordion-content">
                  <p>Free shipping on orders above PKR 5,000. Delivery within 3-5 business days. Easy 7-day returns.</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Related Products -->
        <section class="pd-related" aria-labelledby="related-heading">
          <div class="section-header">
            <span class="section-label">You May Also Like</span>
            <h2 class="section-title" id="related-heading" style="font-size:var(--text-4xl)">Related Pieces</h2>
          </div>
          <div class="related-grid">
            @for (p of relatedProducts(); track p.id) {
              <article class="product-card">
                <a [routerLink]="['/product', p.id]" class="card-image-wrap">
                  <img [src]="p.images[0]" [alt]="p.name" loading="lazy"/>
                  <div class="card-overlay">
                    <button class="btn btn-primary w-full" (click)="$event.preventDefault(); quickAdd(p)">
                      Quick Add
                    </button>
                  </div>
                </a>
                <div class="card-body">
                  <span class="card-category">{{ p.subCategory }}</span>
                  <h3 class="card-title"><a [routerLink]="['/product', p.id]">{{ p.name }}</a></h3>
                  <span class="card-price">PKR {{ p.price | number }}</span>
                </div>
              </article>
            }
          </div>
        </section>
      </div>
    } @else {
      <div class="not-found-state container">
        <app-icon name="package" [size]="64" class="nf-icon"/>
        <h2>Product not found</h2>
        <a routerLink="/" class="btn btn-primary">Back to Home</a>
      </div>
    }
  `,
  styles: [`
    .pd-container {
      padding-top: calc(var(--space-8) + 100px);
      padding-bottom: var(--space-16);
      @media (max-width: 768px) { padding-top: calc(var(--space-6) + 90px); }
      @media (max-width: 480px) { padding-top: calc(var(--space-4) + 80px); padding-bottom: var(--space-10); }
    }

    .breadcrumb {
      display: flex; gap: var(--space-2); align-items: center;
      font-size: var(--text-sm); color: var(--gray-400);
      margin-bottom: var(--space-6); flex-wrap: wrap;
      a { color: var(--gray-400); text-decoration: none; &:hover { color: var(--gold); } }
      span { color: var(--gray-300); }
      @media (max-width: 480px) { font-size: var(--text-xs); margin-bottom: var(--space-4); }
    }

    .pd-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-12);
      margin-bottom: var(--space-16);
      @media (max-width: 900px) { gap: var(--space-8); }
      @media (max-width: 768px) { grid-template-columns: 1fr; gap: var(--space-6); margin-bottom: var(--space-10); }
    }

    .pd-gallery {}

    .pd-main-image {
      position: relative; aspect-ratio: 3/4;
      overflow: hidden; margin-bottom: var(--space-3);
      background: var(--cream-dark);
      @media (max-width: 480px) { aspect-ratio: 4/5; }
    }

    .pd-img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }

    .pd-wishlist-btn {
      position: absolute; top: var(--space-4); right: var(--space-4);
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(245,240,232,0.9); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--black); transition: all 0.3s;
      &.active, &:hover { color: var(--gold); background: var(--cream); }
    }

    .pd-thumbs {
      display: flex; gap: var(--space-2); flex-wrap: wrap;
      @media (max-width: 480px) { gap: var(--space-1); }
    }

    .pd-thumb {
      width: 72px; height: 90px; overflow: hidden;
      border: 2px solid transparent; cursor: pointer;
      transition: border-color 0.2s; padding: 0; background: none;
      &.active { border-color: var(--gold); }
      img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
      @media (max-width: 480px) { width: 60px; height: 75px; }
    }

    .pd-info { @media (max-width: 768px) { padding-top: 0; } }

    .pd-category { font-size: var(--text-xs); letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-dark); font-weight: 600; }

    .pd-name {
      font-family: var(--font-heading);
      font-size: clamp(1.5rem, 3vw, 2.5rem);
      font-weight: 400; color: var(--black);
      margin: var(--space-2) 0 var(--space-3);
    }

    .pd-rating { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); flex-wrap: wrap; }
    .stars { display: flex; gap: 2px; }
    .star-filled-icon { color: var(--gold); }
    .pd-reviews { font-size: var(--text-sm); color: var(--gray-400); }

    .pd-price-wrap {
      display: flex; align-items: baseline; gap: var(--space-3);
      flex-wrap: wrap; margin-bottom: var(--space-5);
    }

    .pd-price { font-size: clamp(1.5rem, 3vw, var(--text-3xl)); font-weight: 700; color: var(--gold-dark); font-family: var(--font-heading); }
    .pd-original-price { font-size: var(--text-lg); color: var(--gray-400); text-decoration: line-through; }
    .pd-discount-badge { background: var(--black); color: var(--gold); font-size: var(--text-xs); font-weight: 700; padding: var(--space-1) var(--space-3); letter-spacing: 0.1em; }

    .pd-option-group { margin-bottom: var(--space-5); }
    .pd-option-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); }
    .pd-option-label { font-size: var(--text-sm); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--black); display: block; margin-bottom: var(--space-3); }
    .pd-size-guide { font-size: var(--text-xs); color: var(--gold); text-decoration: underline; }

    .size-options { display: flex; gap: var(--space-2); flex-wrap: wrap; }
    .size-btn {
      min-width: 48px; height: 48px; padding: 0 var(--space-2);
      border: 1.5px solid var(--gray-300); background: none; cursor: pointer;
      font-size: var(--text-sm); font-weight: 500; transition: all 0.2s;
      &.active { border-color: var(--gold); background: var(--gold); color: var(--black); }
      &:hover:not(.active) { border-color: var(--gold); }
      @media (max-width: 480px) { min-width: 44px; height: 44px; font-size: var(--text-xs); }
    }

    .color-options { display: flex; gap: var(--space-2); flex-wrap: wrap; }
    .color-btn {
      width: 36px; height: 36px; border-radius: 50%;
      border: 2px solid transparent; cursor: pointer; transition: all 0.2s;
      box-shadow: 0 0 0 2px var(--cream);
      &.active { box-shadow: 0 0 0 2px var(--gold); }
    }

    .qty-wrap { display: inline-flex; align-items: center; border: 1px solid var(--gray-300); }
    .qty-btn {
      width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; color: var(--black); transition: all 0.2s;
      &:hover { color: var(--gold); }
    }
    .qty-value { width: 48px; text-align: center; font-size: var(--text-lg); font-weight: 500; }

    .pd-actions {
      display: flex; gap: var(--space-3); margin-bottom: var(--space-4);
      @media (max-width: 400px) {
        .pd-add-btn { flex: 1; }
      }
    }
    .pd-add-btn { flex: 1; padding: var(--space-4); font-size: var(--text-base); }
    .pd-wish-btn { width: 56px; padding: 0; &.wishlisted { border-color: var(--gold); color: var(--gold); } }

    .pd-stock { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--gray-400); margin-bottom: var(--space-5); .stock-icon { color: #4CAF50; } }

    .pd-accordion { border-bottom: 1px solid var(--gray-200); }
    .accordion-btn {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-4) 0; background: none; border: none; cursor: pointer;
      font-size: var(--text-sm); font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--black); transition: color 0.2s;
      &:hover { color: var(--gold); }
    }
    .accordion-content { padding: 0 0 var(--space-4); p { font-size: var(--text-sm); color: var(--gray-500); line-height: 1.8; } }

    .pd-related { padding-top: var(--space-10); }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-5);
      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
    }

    .card-image-wrap img { object-position: top center; }

    .not-found-state {
      display: flex; flex-direction: column; align-items: center;
      gap: var(--space-6); padding: var(--space-24) var(--space-6); text-align: center;
      .nf-icon { color: var(--gray-300); }
      h2 { font-family: var(--font-heading); font-size: var(--text-4xl); }
    }

    .ornament-divider {
      display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0;
      .line { flex: 1; max-width: 40px; height: 1px; background: linear-gradient(to right, var(--gold), transparent); &:last-child { background: linear-gradient(to left, var(--gold), transparent); } }
      .diamond { width: 7px; height: 7px; background: var(--gold); transform: rotate(45deg); flex-shrink: 0; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private productService  = inject(ProductService);
  cartService    = inject(CartService);
  wishlistService= inject(WishlistService);
  private toast  = inject(ToastService);
  private route  = inject(ActivatedRoute);

  product      = signal<Product | undefined>(undefined);
  activeImage  = signal(0);
  selectedSize = signal('');
  selectedColor= signal('');
  qty          = signal(1);
  descOpen     = signal(true);
  careOpen     = signal(false);
  shippingOpen = signal(false);

  stars = computed(() => Array(5).fill(0).map((_,i) => i < Math.floor(this.product()?.rating || 0) ? 1 : 0));

  relatedProducts = computed(() => {
    const p = this.product();
    if (!p) return [];
    return this.productService.getByCategory(p.category).filter(x => x.id !== p.id).slice(0, 4);
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      // Try API first, fallback to mock
      this.productService.getByIdFromApi(id).subscribe({
        next: p => {
          this.product.set(p);
          this.selectedSize.set(p.sizes[1] || p.sizes[0]);
          this.selectedColor.set(p.colors[0]);
        },
        error: () => {
          const p = this.productService.getById(id);
          this.product.set(p);
          if (p) {
            this.selectedSize.set(p.sizes[1] || p.sizes[0]);
            this.selectedColor.set(p.colors[0]);
          }
        }
      });
    });
  }

  toggleDesc()     { this.descOpen.update(v => !v); }
  toggleCare()     { this.careOpen.update(v => !v); }
  toggleShipping() { this.shippingOpen.update(v => !v); }

  incQty() { this.qty.update(q => q + 1); }
  decQty() { this.qty.update(q => Math.max(1, q - 1)); }

  addToCart() {
    const p = this.product();
    if (!p) return;
    this.cartService.addItem(p, this.selectedSize(), this.selectedColor(), this.qty());
    this.toast.cart(`${p.name} added to cart`);
  }

  toggleWishlist() {
    const p = this.product();
    if (!p) return;
    this.wishlistService.toggle(p);
    this.toast.wishlist(this.wishlistService.isWishlisted(p.id) ? 'Added to wishlist' : 'Removed from wishlist');
  }

  quickAdd(p: Product) {
    this.cartService.addItem(p, p.sizes[1] || p.sizes[0], p.colors[0]);
    this.toast.cart(`${p.name} added to cart`);
  }
}
