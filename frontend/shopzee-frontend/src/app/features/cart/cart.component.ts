import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, SvgIconsComponent],
  template: `
    <div class="cart-page container">
      <div class="page-header">
        <h1 class="page-title">Shopping Cart</h1>
        <span class="page-subtitle">{{ cartService.itemCount() }} items</span>
      </div>

      @if (cartService.items().length > 0) {
        <div class="cart-layout">
          <!-- Cart Items -->
          <div class="cart-items">
            @for (item of cartService.items(); track item.product.id + item.selectedSize + item.selectedColor) {
              <div class="cart-item">
                <a [routerLink]="['/product', item.product.id]" class="cart-item__img">
                  <img [src]="item.product.images[0]" [alt]="item.product.name" loading="lazy"/>
                </a>
                <div class="cart-item__info">
                  <span class="cart-item__cat">{{ item.product.subCategory }}</span>
                  <h3 class="cart-item__name">
                    <a [routerLink]="['/product', item.product.id]">{{ item.product.name }}</a>
                  </h3>
                  <div class="cart-item__meta">
                    <span>Size: <strong>{{ item.selectedSize }}</strong></span>
                    <span>Color: <strong [style.background]="item.selectedColor" class="color-dot"></strong></span>
                  </div>
                  <div class="cart-item__bottom">
                    <div class="qty-wrap">
                      <button class="qty-btn"
                        (click)="updateQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)"
                        aria-label="Decrease">
                        <app-icon name="minus" [size]="14"/>
                      </button>
                      <span class="qty-value">{{ item.quantity }}</span>
                      <button class="qty-btn"
                        (click)="updateQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)"
                        aria-label="Increase">
                        <app-icon name="plus" [size]="14"/>
                      </button>
                    </div>
                    <span class="cart-item__price">PKR {{ (item.product.price * item.quantity) | number }}</span>
                    <button class="remove-btn"
                      (click)="removeItem(item.product.id, item.selectedSize, item.selectedColor)"
                      aria-label="Remove item">
                      <app-icon name="trash" [size]="18"/>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <aside class="cart-summary">
            <h2 class="summary-title">Order Summary</h2>
            <div class="summary-rows">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>PKR {{ cartService.subtotal() | number }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>{{ cartService.shipping() === 0 ? 'Free' : 'PKR ' + (cartService.shipping() | number) }}</span>
              </div>
              @if (cartService.shipping() > 0) {
                <p class="free-shipping-tip">
                  Add PKR {{ (5000 - cartService.subtotal()) | number }} more for free shipping!
                </p>
              }
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span>PKR {{ cartService.total() | number }}</span>
            </div>
            <a routerLink="/checkout" class="btn btn-primary w-full checkout-btn">
              Proceed to Checkout <app-icon name="arrow-right" [size]="18"/>
            </a>
            <a routerLink="/women" class="btn btn-ghost w-full" style="margin-top:0.75rem; text-align:center">
              Continue Shopping
            </a>
            <div class="secure-badges">
              <app-icon name="shield" [size]="16"/>
              <span>Secure checkout with SSL encryption</span>
            </div>
          </aside>
        </div>
      } @else {
        <div class="empty-cart">
          <div class="empty-cart__icon">
            <app-icon name="cart" [size]="64" class="empty-icon"/>
          </div>
          <h2 class="empty-cart__title">Your cart is empty</h2>
          <p class="empty-cart__desc">Looks like you haven't added any items yet.</p>
          <div class="empty-cart__actions">
            <a routerLink="/women" class="btn btn-primary">Shop Women</a>
            <a routerLink="/men" class="btn btn-dark">Shop Men</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page {
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

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--space-10);
      @media (max-width: 1024px) { grid-template-columns: 1fr 320px; gap: var(--space-7); }
      @media (max-width: 900px) { grid-template-columns: 1fr; gap: var(--space-8); }
    }

    .cart-items { display: flex; flex-direction: column; gap: 0; }

    .cart-item {
      display: grid;
      grid-template-columns: 130px 1fr;
      gap: var(--space-4);
      padding: var(--space-5) 0;
      border-bottom: 1px solid var(--gray-200);

      @media (max-width: 480px) {
        grid-template-columns: 100px 1fr;
        gap: var(--space-3);
        padding: var(--space-4) 0;
      }

      &__img {
        display: block; overflow: hidden; aspect-ratio: 3/4;
        img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
      }

      &__info { display: flex; flex-direction: column; gap: var(--space-2); }
      &__cat { font-size: var(--text-xs); letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold-dark); }
      &__name {
        font-family: var(--font-heading); font-size: var(--text-xl);
        @media (max-width: 480px) { font-size: var(--text-lg); }
        a { color: var(--black); text-decoration: none; &:hover { color: var(--gold); } }
      }
      &__meta {
        display: flex; gap: var(--space-3); font-size: var(--text-sm); color: var(--gray-400);
        flex-wrap: wrap;
      }
      &__bottom {
        display: flex; align-items: center; gap: var(--space-3);
        margin-top: auto; flex-wrap: wrap;
        @media (max-width: 480px) { gap: var(--space-2); }
      }
      &__price {
        font-size: var(--text-base); font-weight: 600; color: var(--gold-dark);
        margin-left: auto;
        @media (max-width: 480px) { font-size: var(--text-sm); }
      }
    }

    .color-dot { display: inline-block; width: 14px; height: 14px; border-radius: 50%; vertical-align: middle; border: 1px solid var(--gray-300); }

    .qty-wrap { display: inline-flex; align-items: center; border: 1px solid var(--gray-300); }
    .qty-btn {
      width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; color: var(--black); transition: color 0.2s;
      &:hover { color: var(--gold); }
      @media (max-width: 480px) { width: 30px; height: 30px; }
    }
    .qty-value { width: 36px; text-align: center; font-size: var(--text-sm); }

    .remove-btn {
      display: flex; align-items: center; background: none; border: none; cursor: pointer;
      color: var(--gray-300); transition: color 0.2s; padding: var(--space-1);
      &:hover { color: var(--black); }
    }

    .cart-summary {
      background: var(--cream-light); padding: var(--space-7);
      border: 1px solid var(--gray-200); height: fit-content;
      position: sticky; top: 100px;
      @media (max-width: 900px) { position: static; }
      @media (max-width: 480px) { padding: var(--space-5); }
    }

    .summary-title { font-family: var(--font-heading); font-size: var(--text-2xl); margin-bottom: var(--space-5); padding-bottom: var(--space-4); border-bottom: 1px solid var(--gray-200); }
    .summary-rows { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4); }
    .summary-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--gray-500); }
    .free-shipping-tip { font-size: var(--text-xs); color: var(--gold-dark); background: rgba(201,168,76,0.08); padding: var(--space-2) var(--space-3); border-left: 2px solid var(--gold); }
    .summary-total { display: flex; justify-content: space-between; font-size: var(--text-xl); font-weight: 700; font-family: var(--font-heading); padding-top: var(--space-4); border-top: 1px solid var(--gray-200); margin-bottom: var(--space-5); }

    .checkout-btn { padding: var(--space-4); font-size: var(--text-base); display: flex; justify-content: center; align-items: center; gap: var(--space-3); }
    .secure-badges { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); color: var(--gray-400); margin-top: var(--space-4); justify-content: center; app-icon { color: var(--gold); } }

    .empty-cart {
      display: flex; flex-direction: column; align-items: center;
      padding: var(--space-20) var(--space-6); text-align: center;
      @media (max-width: 480px) { padding: var(--space-12) var(--space-4); }
      &__icon { width: 100px; height: 100px; border-radius: 50%; background: var(--cream-dark); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-6); .empty-icon { color: var(--gray-300); } }
      &__title { font-family: var(--font-heading); font-size: var(--text-3xl); margin-bottom: var(--space-3); @media (max-width: 480px) { font-size: var(--text-2xl); } }
      &__desc { color: var(--gray-400); margin-bottom: var(--space-7); font-size: var(--text-sm); }
      &__actions { display: flex; gap: var(--space-3); flex-wrap: wrap; justify-content: center; }
    }
  `]
})
export class CartComponent {
  cartService = inject(CartService);
  private toast = inject(ToastService);

  updateQty(id: number, size: string, color: string, qty: number) {
    this.cartService.updateQuantity(id, size, color, qty);
  }

  removeItem(id: number, size: string, color: string) {
    this.cartService.removeItem(id, size, color);
    this.toast.info('Item removed from cart');
  }
}
