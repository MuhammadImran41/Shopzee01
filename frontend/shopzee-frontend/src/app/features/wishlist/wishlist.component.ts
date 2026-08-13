import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, SvgIconsComponent],
  template: `
    <div class="wishlist-page container">
      <div class="page-header">
        <h1 class="page-title">My Wishlist</h1>
        <span class="page-subtitle">{{ wishlistService.count() }} saved items</span>
      </div>

      @if (wishlistService.items().length > 0) {
        <div class="product-grid">
          @for (product of wishlistService.items(); track product.id) {
            <article class="product-card">
              <button class="card-wishlist active" (click)="remove(product)" aria-label="Remove from wishlist">
                <app-icon name="heart-filled" [size]="18"/>
              </button>
              <a [routerLink]="['/product', product.id]" class="card-image-wrap">
                <img [src]="product.images[0]" [alt]="product.name" loading="lazy"/>
                <div class="card-overlay">
                  <button class="btn btn-primary w-full" (click)="$event.preventDefault(); moveToCart(product)">
                    <app-icon name="cart" [size]="16"/> Move to Cart
                  </button>
                </div>
              </a>
              <div class="card-body">
                <span class="card-category">{{ product.subCategory }}</span>
                <h3 class="card-title"><a [routerLink]="['/product', product.id]">{{ product.name }}</a></h3>
                <span class="card-price">PKR {{ product.price | number }}</span>
              </div>
            </article>
          }
        </div>
      } @else {
        <div class="empty-wish">
          <app-icon name="heart" [size]="64" class="empty-icon"/>
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite items here and shop them later.</p>
          <div class="flex-center gap-4" style="margin-top:2rem">
            <a routerLink="/women" class="btn btn-primary">Shop Women</a>
            <a routerLink="/men" class="btn btn-dark">Shop Men</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .wishlist-page {
      padding: var(--space-10) var(--space-6) var(--space-16);
      padding-top: calc(var(--space-10) + 100px);
      @media (max-width: 768px) { padding: calc(90px + var(--space-6)) var(--space-4) var(--space-12); }
      @media (max-width: 480px) { padding: calc(85px + var(--space-4)) var(--space-3) var(--space-10); }
    }

    .page-header { margin-bottom: var(--space-7); }

    .page-title {
      font-family: var(--font-heading); font-size: var(--text-5xl); font-weight: 400;
      @media (max-width: 768px) { font-size: var(--text-4xl); }
      @media (max-width: 480px) { font-size: var(--text-3xl); }
    }

    .page-subtitle { font-size: var(--text-sm); color: var(--gray-400); letter-spacing: 0.1em; }

    .empty-wish {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-4);
      padding: var(--space-20) var(--space-6); text-align: center;
      @media (max-width: 480px) { padding: var(--space-12) var(--space-4); }
      .empty-icon { color: var(--gray-300); }
      h2 { font-family: var(--font-heading); font-size: var(--text-3xl); @media (max-width: 480px) { font-size: var(--text-2xl); } }
      p { color: var(--gray-400); font-size: var(--text-sm); }
    }
  `]
})
export class WishlistComponent {
  wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);

  remove(product: Product) {
    this.wishlistService.remove(product.id);
    this.toast.info('Removed from wishlist');
  }

  moveToCart(product: Product) {
    this.cartService.addItem(product, product.sizes[1] || product.sizes[0], product.colors[0]);
    this.wishlistService.remove(product.id);
    this.toast.cart(`${product.name} moved to cart`);
  }
}
