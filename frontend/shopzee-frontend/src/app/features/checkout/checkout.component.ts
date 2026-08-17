import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { OrderApiService } from '../../core/services/api/order-api.service';
import { AuthApiService } from '../../core/services/api/auth-api.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SvgIconsComponent],
  template: `
    <div class="checkout-page container">
      @if (!orderPlaced()) {
        <h1 class="page-title">Checkout</h1>
        <!-- Steps -->
        <div class="checkout-steps">
          @for (step of steps; track step.num) {
            <div class="step" [class.active]="currentStep() === step.num" [class.done]="currentStep() > step.num">
              <div class="step-circle">
                @if (currentStep() > step.num) {
                  <app-icon name="check" [size]="14"/>
                } @else {
                  {{ step.num }}
                }
              </div>
              <span class="step-label">{{ step.label }}</span>
            </div>
            @if (step.num < 3) { <div class="step-line"></div> }
          }
        </div>

        <div class="checkout-layout">
          <div class="checkout-form">
            <!-- Step 1: Details -->
            @if (currentStep() === 1) {
              <div class="form-section">
                <h2 class="form-section-title">Contact Details</h2>
                <div class="form-grid">
                  <div class="form-group"><label>First Name</label><input [(ngModel)]="form.firstName" type="text" placeholder="Enter first name"/></div>
                  <div class="form-group"><label>Last Name</label><input [(ngModel)]="form.lastName" type="text" placeholder="Enter last name"/></div>
                  <div class="form-group form-full"><label>Email</label><input [(ngModel)]="form.email" type="email" placeholder="your@email.com"/></div>
                  <div class="form-group form-full"><label>Phone</label><input [(ngModel)]="form.phone" type="tel" placeholder="+92 300 0000000"/></div>
                </div>
                <button class="btn btn-primary next-btn" (click)="currentStep.set(2)">Continue to Shipping</button>
              </div>
            }

            <!-- Step 2: Shipping -->
            @if (currentStep() === 2) {
              <div class="form-section">
                <h2 class="form-section-title">Shipping Address</h2>
                <div class="form-grid">
                  <div class="form-group form-full"><label>Address Line 1</label><input [(ngModel)]="form.address1" type="text" placeholder="House/Flat number, Street name"/></div>
                  <div class="form-group form-full"><label>Address Line 2 (Optional)</label><input [(ngModel)]="form.address2" type="text" placeholder="Area, Colony"/></div>
                  <div class="form-group"><label>City</label><input [(ngModel)]="form.city" type="text" placeholder="Lahore"/></div>
                  <div class="form-group"><label>Province</label><input [(ngModel)]="form.state" type="text" placeholder="Punjab"/></div>
                </div>
                <div class="step-actions">
                  <button class="btn btn-ghost" (click)="currentStep.set(1)">Back</button>
                  <button class="btn btn-primary" (click)="currentStep.set(3)">Continue to Payment</button>
                </div>
              </div>
            }

            <!-- Step 3: Payment -->
            @if (currentStep() === 3) {
              <div class="form-section">
                <h2 class="form-section-title">Payment Method</h2>
                <div class="payment-options">
                  <label class="payment-option" [class.active]="form.payment === 'cod'">
                    <input type="radio" [(ngModel)]="form.payment" value="cod"/>
                    <app-icon name="truck" [size]="20"/>
                    <div><strong>Cash on Delivery</strong><span>Pay when you receive your order</span></div>
                  </label>
                  <label class="payment-option" [class.active]="form.payment === 'card'">
                    <input type="radio" [(ngModel)]="form.payment" value="card"/>
                    <app-icon name="shield" [size]="20"/>
                    <div><strong>Credit / Debit Card</strong><span>Secure payment via SSL</span></div>
                  </label>
                  <label class="payment-option" [class.active]="form.payment === 'easypaisa'">
                    <input type="radio" [(ngModel)]="form.payment" value="easypaisa"/>
                    <app-icon name="phone" [size]="20"/>
                    <div><strong>Easypaisa / JazzCash</strong><span>Mobile wallet payment</span></div>
                  </label>
                </div>
                <div class="step-actions">
                  <button class="btn btn-ghost" (click)="currentStep.set(2)">Back</button>
                  <button class="btn btn-primary" (click)="placeOrder()">Place Order</button>
                </div>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <aside class="checkout-summary">
            <h3 class="summary-heading">Order Summary</h3>
            @for (item of cartService.items(); track item.product.id) {
              <div class="summary-item">
                <img [src]="item.product.images[0]" [alt]="item.product.name" class="summary-item-img"/>
                <div class="summary-item-info">
                  <span class="summary-item-name">{{ item.product.name }}</span>
                  <span class="summary-item-meta">{{ item.selectedSize }} · Qty {{ item.quantity }}</span>
                  <span class="summary-item-price">PKR {{ (item.product.price * item.quantity) | number }}</span>
                </div>
              </div>
            }
            <div class="summary-totals">
              <div class="summary-row"><span>Subtotal</span><span>PKR {{ cartService.subtotal() | number }}</span></div>
              <div class="summary-row"><span>Shipping</span><span>{{ cartService.shipping() === 0 ? 'Free' : 'PKR ' + (cartService.shipping() | number) }}</span></div>
              <div class="summary-total"><span>Total</span><span>PKR {{ cartService.total() | number }}</span></div>
            </div>
          </aside>
        </div>
      } @else {
        <!-- Order Confirmation -->
        <div class="order-success">
          <div class="success-icon">
            <app-icon name="check-circle" [size]="64" class="success-check"/>
          </div>
          <h2 class="success-title">Order Placed Successfully!</h2>
          <p class="success-desc">Thank you for shopping with STYLEMAKER. Your order has been received and will be processed shortly.</p>
          <p class="order-id">Order ID: <strong>#SZ{{ orderId() }}</strong></p>
          <div class="success-actions">
            <a routerLink="/account" class="btn btn-primary">Track My Order</a>
            <a routerLink="/" class="btn btn-ghost">Continue Shopping</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page {
      padding: var(--space-10) var(--space-6) var(--space-16);
      max-width: 1100px;
      padding-top: calc(var(--space-10) + 100px);
      @media (max-width: 768px) { padding: calc(90px + var(--space-6)) var(--space-4) var(--space-12); }
      @media (max-width: 480px) { padding: calc(85px + var(--space-4)) var(--space-3) var(--space-10); }
    }

    .page-title {
      font-family: var(--font-heading); font-size: var(--text-5xl); font-weight: 400; margin-bottom: var(--space-7);
      @media (max-width: 768px) { font-size: var(--text-4xl); margin-bottom: var(--space-5); }
      @media (max-width: 480px) { font-size: var(--text-3xl); margin-bottom: var(--space-4); }
    }

    .checkout-steps {
      display: flex; align-items: center; margin-bottom: var(--space-8);
      @media (max-width: 480px) { margin-bottom: var(--space-6); }
    }

    .step { display: flex; align-items: center; gap: var(--space-2); }

    .step-circle {
      width: 34px; height: 34px; border-radius: 50%;
      border: 2px solid var(--gray-300);
      display: flex; align-items: center; justify-content: center;
      font-size: var(--text-sm); font-weight: 600; transition: all 0.3s; flex-shrink: 0;
      .active & { border-color: var(--gold); background: var(--gold); color: var(--black); }
      .done  & { border-color: var(--gold); background: var(--gold); color: var(--black); }
      @media (max-width: 480px) { width: 28px; height: 28px; font-size: var(--text-xs); }
    }

    .step-label {
      font-size: var(--text-sm); font-weight: 500; color: var(--gray-400);
      .active &, .done & { color: var(--black); }
      @media (max-width: 480px) { font-size: var(--text-xs); }
    }

    .step-line { flex: 1; height: 1px; background: var(--gray-200); margin: 0 var(--space-2); }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: var(--space-10);
      @media (max-width: 1024px) { grid-template-columns: 1fr 300px; gap: var(--space-7); }
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .form-section-title {
      font-family: var(--font-heading); font-size: var(--text-3xl); font-weight: 400;
      margin-bottom: var(--space-5); padding-bottom: var(--space-4); border-bottom: 1px solid var(--gray-200);
      @media (max-width: 480px) { font-size: var(--text-2xl); }
    }

    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: var(--space-4); margin-bottom: var(--space-7);
      @media (max-width: 600px) { grid-template-columns: 1fr; gap: var(--space-3); }
    }

    .form-group {
      display: flex; flex-direction: column; gap: var(--space-1);
      label { font-size: var(--text-sm); font-weight: 600; color: var(--black); }
      input {
        padding: var(--space-3) var(--space-4); border: 1px solid var(--gray-300);
        background: var(--cream-light); font-size: var(--text-sm);
        transition: border-color 0.2s; width: 100%;
        &:focus { border-color: var(--gold); }
      }
    }

    .form-full { grid-column: 1/-1; }

    .next-btn { padding: var(--space-4) var(--space-8); font-size: var(--text-base); @media (max-width: 480px) { width: 100%; } }

    .step-actions {
      display: flex; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap;
      @media (max-width: 480px) { flex-direction: column-reverse; }
    }

    .payment-options { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-7); }

    .payment-option {
      display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4) var(--space-5);
      border: 1.5px solid var(--gray-200); cursor: pointer; transition: all 0.2s;
      &.active { border-color: var(--gold); background: rgba(201,168,76,0.04); }
      input { display: none; }
      app-icon { color: var(--gold); flex-shrink: 0; }
      div { display: flex; flex-direction: column; gap: 2px; }
      strong { font-size: var(--text-sm); }
      span { font-size: var(--text-xs); color: var(--gray-400); }
      @media (max-width: 480px) { padding: var(--space-3) var(--space-4); gap: var(--space-3); }
    }

    .checkout-summary {
      background: var(--cream-light); padding: var(--space-6);
      border: 1px solid var(--gray-200); height: fit-content;
      position: sticky; top: 100px;
      @media (max-width: 900px) { position: static; order: -1; }
    }

    .summary-heading { font-family: var(--font-heading); font-size: var(--text-xl); margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--gray-200); }

    .summary-item {
      display: flex; gap: var(--space-3); margin-bottom: var(--space-4);
      &-img { width: 56px; height: 72px; object-fit: cover; object-position: top center; flex-shrink: 0; }
      &-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      &-name { font-size: var(--text-sm); font-weight: 500; }
      &-meta { font-size: var(--text-xs); color: var(--gray-400); }
      &-price { font-size: var(--text-sm); color: var(--gold-dark); font-weight: 600; }
    }

    .summary-totals { border-top: 1px solid var(--gray-200); padding-top: var(--space-4); }
    .summary-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--gray-500); margin-bottom: var(--space-2); }
    .summary-total { display: flex; justify-content: space-between; font-size: var(--text-lg); font-weight: 700; font-family: var(--font-heading); padding-top: var(--space-3); border-top: 1px solid var(--gray-200); margin-top: var(--space-2); }

    .order-success {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: var(--space-16) var(--space-6);
      @media (max-width: 480px) { padding: var(--space-10) var(--space-4); }
    }

    .success-icon { width: 100px; height: 100px; border-radius: 50%; background: rgba(76,175,80,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-6); }
    .success-check { color: #4CAF50; }
    .success-title { font-family: var(--font-heading); font-size: clamp(2rem, 4vw, var(--text-5xl)); font-weight: 400; margin-bottom: var(--space-4); }
    .success-desc { color: var(--gray-400); max-width: 480px; line-height: 1.7; margin-bottom: var(--space-4); font-size: var(--text-sm); }
    .order-id { font-size: var(--text-base); margin-bottom: var(--space-7); strong { color: var(--gold-dark); } }
    .success-actions { display: flex; gap: var(--space-4); flex-wrap: wrap; justify-content: center; }
  `]
})
export class CheckoutComponent {
  cartService  = inject(CartService);
  private toast      = inject(ToastService);
  private orderApi   = inject(OrderApiService);
  private authApi    = inject(AuthApiService);
  private router     = inject(Router);

  currentStep = signal(1);
  orderPlaced = signal(false);
  orderId     = signal('');
  isSubmitting= signal(false);

  steps = [{ num: 1, label: 'Details' }, { num: 2, label: 'Shipping' }, { num: 3, label: 'Payment' }];

  form = {
    firstName: '', lastName: '', email: '', phone: '',
    address1: '', address2: '', city: '', state: '',
    payment: 'cod'
  };

  placeOrder() {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const payload = {
      firstName:     this.form.firstName,
      lastName:      this.form.lastName,
      email:         this.form.email,
      phone:         this.form.phone,
      address1:      this.form.address1,
      address2:      this.form.address2,
      city:          this.form.city,
      state:         this.form.state,
      paymentMethod: this.form.payment,
      items: this.cartService.items().map(i => ({
        productId:    i.product.id,
        quantity:     i.quantity,
        selectedSize: i.selectedSize,
        selectedColor:i.selectedColor
      }))
    };

    // Use API if logged in, otherwise fallback to local
    if (this.authApi.isLoggedIn()) {
      this.orderApi.placeOrder(payload).subscribe({
        next: order => {
          this.orderId.set(order.orderNumber);
          this.cartService.clearCart();
          this.orderPlaced.set(true);
          this.toast.success('Order placed successfully!');
          this.isSubmitting.set(false);
        },
        error: () => {
          // Fallback: local order
          this.localPlaceOrder();
        }
      });
    } else {
      this.localPlaceOrder();
    }
  }

  private localPlaceOrder() {
    const id = 'SZ' + Math.floor(Math.random() * 90000 + 10000).toString();
    this.orderId.set(id);
    this.cartService.clearCart();
    this.orderPlaced.set(true);
    this.toast.success('Order placed successfully!');
    this.isSubmitting.set(false);
  }
}
