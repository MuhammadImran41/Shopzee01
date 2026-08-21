import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthApiService } from '../../core/services/api/auth-api.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { Product } from '../../core/models/product.model';
import { API_BASE } from '../../core/services/api/api.config';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SvgIconsComponent],
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
              @if (product()!.isInStock !== false) {
                <button class="btn btn-primary pd-add-btn" (click)="addToCart()">
                  <app-icon name="cart" [size]="18"/> Add to Cart
                </button>
              } @else {
                <button class="btn pd-add-btn pd-stockout-btn" disabled>
                  Out of Stock
                </button>
              }
              <button
                class="btn btn-outline pd-wish-btn"
                [class.wishlisted]="wishlistService.isWishlisted(product()!.id)"
                (click)="toggleWishlist()"
              >
                <app-icon [name]="wishlistService.isWishlisted(product()!.id) ? 'heart-filled' : 'heart'" [size]="18"/>
              </button>
            </div>

            <!-- Stock Info -->
            <div class="pd-stock" [class.pd-stock--out]="product()!.isInStock === false">
              @if (product()!.isInStock === false) {
                <app-icon name="close" [size]="16" class="stock-icon-out"/>
                <span>Currently Out of Stock</span>
              } @else {
                <app-icon name="check-circle" [size]="16" class="stock-icon"/>
                <span>{{ product()!.stock > 10 ? 'In Stock' : 'Only ' + product()!.stock + ' left!' }}</span>
              }
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

        <!-- Reviews Section -->
        <section class="pd-reviews" aria-labelledby="reviews-heading">
          <div class="reviews-header">
            <div>
              <span class="section-label">Customer Reviews</span>
              <h2 class="section-title" id="reviews-heading" style="font-size:var(--text-4xl)">What People Say</h2>
            </div>
            @if (reviewsData()) {
              <div class="reviews-summary">
                <div class="avg-rating">
                  <span class="avg-num">{{ reviewsData()!.average }}</span>
                  <div class="avg-stars">
                    @for (s of [1,2,3,4,5]; track s) {
                      <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="s <= reviewsData()!.average ? '#C9A84C' : 'none'" stroke="#C9A84C" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    }
                  </div>
                  <span class="avg-count">{{ reviewsData()!.totalCount }} review{{ reviewsData()!.totalCount !== 1 ? 's' : '' }}</span>
                </div>
                <!-- Distribution bars -->
                <div class="rating-bars">
                  @for (i of [5,4,3,2,1]; track i) {
                    <div class="rating-bar-row">
                      <span class="bar-label">{{ i }}</span>
                      <div class="bar-track">
                        <div class="bar-fill" [style.width.%]="reviewsData()!.totalCount > 0 ? (reviewsData()!.distribution[i-1] / reviewsData()!.totalCount * 100) : 0"></div>
                      </div>
                      <span class="bar-count">{{ reviewsData()!.distribution[i-1] }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Write a review -->
          @if (authApi.isLoggedIn() && !reviewSubmitted()) {
            <div class="write-review">
              <h3 class="wr-title">Write a Review</h3>
              <div class="star-selector">
                <span class="wr-label">Your Rating</span>
                <div class="stars-input">
                  @for (s of [1,2,3,4,5]; track s) {
                    <button type="button" class="star-btn" [class.filled]="s <= newReview.rating" (click)="newReview.rating = s" [attr.aria-label]="s + ' star'">
                      <svg width="24" height="24" viewBox="0 0 24 24" [attr.fill]="s <= newReview.rating ? '#C9A84C' : 'none'" stroke="#C9A84C" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  }
                </div>
              </div>
              <textarea [(ngModel)]="newReview.comment" class="review-textarea" rows="4" placeholder="Share your experience with this product..."></textarea>
              @if (reviewError()) { <p class="review-error">{{ reviewError() }}</p> }
              <button class="btn btn-primary" (click)="submitReview()" [disabled]="reviewLoading()">
                @if (reviewLoading()) { Submitting... } @else { Submit Review }
              </button>
            </div>
          }
          @if (!authApi.isLoggedIn()) {
            <div class="review-login-prompt">
              <p>Please <strong>sign in</strong> to leave a review.</p>
            </div>
          }

          <!-- Reviews List -->
          @if (reviewsData() && reviewsData()!.reviews.length > 0) {
            <div class="reviews-list">
              @for (r of reviewsData()!.reviews; track r.id) {
                <div class="review-card">
                  <div class="review-card__header">
                    <div class="reviewer-avatar">{{ r.userInitial }}</div>
                    <div class="reviewer-info">
                      <span class="reviewer-name">{{ r.userName }}</span>
                      <span class="reviewer-date">{{ r.createdAt | date:'dd MMM yyyy' }}</span>
                    </div>
                    <div class="review-stars">
                      @for (s of [1,2,3,4,5]; track s) {
                        <svg width="14" height="14" viewBox="0 0 24 24" [attr.fill]="s <= r.rating ? '#C9A84C' : 'none'" stroke="#C9A84C" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      }
                    </div>
                  </div>
                  <p class="review-text">{{ r.comment }}</p>
                </div>
              }
            </div>
          } @else if (reviewsData() && reviewsData()!.reviews.length === 0) {
            <div class="no-reviews">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          }
        </section>

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

    .pd-stockout-btn {
      flex: 1; background: #C62828 !important; color: #fff !important;
      border-color: #C62828 !important; opacity: 0.85; cursor: not-allowed;
      letter-spacing: 0.12em;
    }

    .pd-stock { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--gray-400); margin-bottom: var(--space-5); .stock-icon { color: #4CAF50; } }
    .pd-stock--out { color: #C62828; .stock-icon-out { color: #C62828; } }

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

    /* ── REVIEWS ─────────────────────────────────────── */
    .pd-reviews {
      padding: var(--space-12) 0 var(--space-20);
      border-top: 1px solid var(--gray-200);
      margin-top: var(--space-8);
    }

    .reviews-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 2rem; flex-wrap: wrap; margin-bottom: 2.5rem;
    }

    .reviews-summary { display: flex; gap: 2rem; flex-wrap: wrap; }

    .avg-rating {
      display: flex; flex-direction: column; align-items: center; gap: 0.375rem;
      background: var(--black); padding: 1.25rem 1.75rem;
      .avg-num { font-family: var(--font-heading); font-size: 3rem; font-weight: 400; color: var(--gold); line-height: 1; }
      .avg-stars { display: flex; gap: 2px; }
      .avg-count { font-size: 0.75rem; color: rgba(245,240,232,0.5); letter-spacing: 0.1em; }
    }

    .rating-bars { display: flex; flex-direction: column; gap: 0.4rem; justify-content: center; min-width: 160px; }
    .rating-bar-row { display: flex; align-items: center; gap: 0.5rem; }
    .bar-label { font-size: 0.75rem; color: var(--gray-400); width: 10px; text-align: right; flex-shrink: 0; }
    .bar-track { flex: 1; height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--gold); border-radius: 3px; transition: width 0.4s ease; }
    .bar-count { font-size: 0.75rem; color: var(--gray-400); width: 16px; text-align: right; flex-shrink: 0; }

    .write-review {
      background: var(--cream-light); border: 1px solid var(--gray-200);
      padding: 1.75rem; margin-bottom: 2.5rem;
      .wr-title { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 400; margin-bottom: 1.25rem; }
      .wr-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold-dark); margin-right: 0.75rem; }
    }

    .star-selector { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .stars-input { display: flex; gap: 4px; }
    .star-btn { background: none; border: none; cursor: pointer; padding: 2px; transition: transform 0.15s; &:hover { transform: scale(1.2); } }

    .review-textarea {
      width: 100%; padding: 0.875rem 1rem; border: 1px solid var(--gray-300);
      background: var(--cream); font-family: var(--font-body); font-size: 0.9375rem;
      color: var(--black); resize: vertical; outline: none; margin-bottom: 1rem;
      box-sizing: border-box; min-height: 100px;
      &:focus { border-color: var(--gold); }
      &::placeholder { color: var(--gray-400); }
    }

    .review-error { color: #E53935; font-size: 0.8125rem; background: rgba(229,57,53,0.08); padding: 0.5rem 0.75rem; margin-bottom: 1rem; }

    .review-login-prompt {
      background: var(--cream-light); border: 1px solid var(--gray-200); padding: 1.25rem 1.5rem;
      margin-bottom: 2rem; font-size: 0.9rem; color: var(--gray-500);
      strong { color: var(--gold-dark); }
    }

    .reviews-list { display: flex; flex-direction: column; gap: 1px; background: var(--gray-200); border: 1px solid var(--gray-200); }

    .review-card {
      background: var(--cream-light); padding: 1.5rem;
      &__header { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 0.875rem; flex-wrap: wrap; }
    }

    .reviewer-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-dark));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--black); flex-shrink: 0;
    }

    .reviewer-info { flex: 1; .reviewer-name { display: block; font-weight: 600; font-size: 0.9rem; color: var(--black); } .reviewer-date { font-size: 0.75rem; color: var(--gray-400); } }
    .review-stars { display: flex; gap: 2px; margin-left: auto; }
    .review-text { font-size: 0.9375rem; color: var(--gray-500); line-height: 1.75; margin: 0; }

    .no-reviews { padding: 2rem; text-align: center; color: var(--gray-400); font-size: 0.9rem; border: 1px dashed var(--gray-300); }
  `]
})
export class ProductDetailComponent implements OnInit {
  private productService  = inject(ProductService);
  cartService    = inject(CartService);
  wishlistService= inject(WishlistService);
  private toast  = inject(ToastService);
  private route  = inject(ActivatedRoute);
  authApi        = inject(AuthApiService);
  private http   = inject(HttpClient);

  product      = signal<Product | undefined>(undefined);
  activeImage  = signal(0);
  selectedSize = signal('');
  selectedColor= signal('');
  qty          = signal(1);
  descOpen     = signal(true);
  careOpen     = signal(false);
  shippingOpen = signal(false);

  // Reviews
  reviewsData     = signal<any>(null);
  reviewLoading   = signal(false);
  reviewSubmitted = signal(false);
  reviewError     = signal('');
  newReview       = { rating: 5, comment: '' };

  stars = computed(() => Array(5).fill(0).map((_,i) => i < Math.floor(this.product()?.rating || 0) ? 1 : 0));

  relatedProducts = computed(() => {
    const p = this.product();
    if (!p) return [];
    return this.productService.getByCategory(p.category).filter(x => x.id !== p.id).slice(0, 4);
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.productService.getByIdFromApi(id).subscribe({
        next: p => {
          this.product.set(p);
          this.selectedSize.set(p.sizes[1] || p.sizes[0]);
          this.selectedColor.set(p.colors[0]);
          this.loadReviews(id);
        },
        error: () => {
          const p = this.productService.getById(id);
          this.product.set(p);
          if (p) {
            this.selectedSize.set(p.sizes[1] || p.sizes[0]);
            this.selectedColor.set(p.colors[0]);
            this.loadReviews(id);
          }
        }
      });
    });
  }

  loadReviews(productId: number) {
    this.http.get<any>(`${API_BASE}/products/${productId}/reviews`).subscribe({
      next: data => this.reviewsData.set(data),
      error: () => {}
    });
  }

  submitReview() {
    if (!this.newReview.rating) { this.reviewError.set('Please select a rating.'); return; }
    if (!this.newReview.comment.trim() || this.newReview.comment.trim().length < 5) {
      this.reviewError.set('Please write at least 5 characters.'); return;
    }
    this.reviewLoading.set(true);
    this.reviewError.set('');
    const productId = this.product()?.id;
    if (!productId) return;
    this.http.post<any>(`${API_BASE}/products/${productId}/reviews`, this.newReview).subscribe({
      next: () => {
        this.reviewSubmitted.set(true);
        this.reviewLoading.set(false);
        this.toast.success('Review submitted! Thank you.');
        this.loadReviews(productId);
        this.newReview = { rating: 5, comment: '' };
      },
      error: err => {
        this.reviewError.set(err.error?.message || 'Failed to submit review.');
        this.reviewLoading.set(false);
      }
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
    if (p.isInStock === false) { this.toast.error('This product is currently out of stock.'); return; }
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
