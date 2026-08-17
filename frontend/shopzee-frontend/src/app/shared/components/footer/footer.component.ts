import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, SvgIconsComponent],
  template: `
    <footer class="footer" role="contentinfo">
      <!-- Ornament top border -->
      <div class="footer__ornament">
        <div class="orn-line"></div>
        <div class="orn-diamond"></div>
        <div class="orn-line"></div>
      </div>

      <div class="footer__main container">
        <div class="footer__grid">

          <!-- Brand Column -->
          <div class="footer__brand">
            <a routerLink="/" class="footer__logo" aria-label="Trendzy Home">
            <svg viewBox="0 0 160 40" class="logo-svg" aria-hidden="true">
                <path d="M8 28L4 14l8 6 8-12 8 12 8-6-4 14H8z"
                  fill="none" stroke="#C9A84C" stroke-width="1.5" stroke-linejoin="round"/>
                <circle cx="4"  cy="14" r="2" fill="#C9A84C"/>
                <circle cx="20" cy="8"  r="2" fill="#C9A84C"/>
                <circle cx="36" cy="14" r="2" fill="#C9A84C"/>
                <text x="46" y="26"
                  font-family="Cormorant Garamond, Georgia, serif"
                  font-size="19" font-weight="600" fill="#1A1A1A" letter-spacing="3">TRENDZY</text>
                <line x1="46" y1="31" x2="158" y2="31" stroke="#C9A84C" stroke-width="0.75"/>
              </svg>
            </a>
            <p class="footer__tagline">
              Timeless elegance for the modern Pakistani wardrobe. Premium men's and women's clothing crafted with love.
            </p>
            <!-- Social Links -->
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="3.5"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="TikTok">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer__col">
            <h4 class="footer__heading">Quick Links</h4>
            <ul class="footer__links">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/women">Women's Collection</a></li>
              <li><a routerLink="/men">Men's Collection</a></li>
              <li><a routerLink="/women" [queryParams]="{tag:'new'}">New Arrivals</a></li>
              <li><a routerLink="/women" [queryParams]="{tag:'sale'}">Sale</a></li>
              <li><a routerLink="/about">Our Story</a></li>
            </ul>
          </div>

          <!-- Customer Care -->
          <div class="footer__col">
            <h4 class="footer__heading">Customer Care</h4>
            <ul class="footer__links">
              <li><a routerLink="/account">My Account</a></li>
              <li><a routerLink="/cart">Shopping Cart</a></li>
              <li><a routerLink="/wishlist">My Wishlist</a></li>
              <li><a routerLink="/contact">Track Order</a></li>
              <li><a routerLink="/contact">Returns & Exchange</a></li>
              <li><a routerLink="/contact">Size Guide</a></li>
              <li><a routerLink="/contact">Contact Us</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="footer__col">
            <h4 class="footer__heading">Stay Connected</h4>
            <p class="footer__newsletter-text">
              Subscribe for exclusive offers, new arrivals, and style inspiration.
            </p>
            <form class="newsletter-form" (submit)="onNewsletterSubmit($event)">
              <div class="newsletter-input-wrap">
                <input
                  type="email"
                  placeholder="Your email address"
                  class="newsletter-input"
                  aria-label="Email for newsletter"
                  required
                />
                <button type="submit" class="newsletter-btn" aria-label="Subscribe">
                  <app-icon name="arrow-right" [size]="18"/>
                </button>
              </div>
            </form>
            <div class="footer__contact-info">
              <div class="contact-item">
                <app-icon name="map-pin" [size]="16"/>
                <span>Lahore, Pakistan</span>
              </div>
              <div class="contact-item">
                <app-icon name="mail" [size]="16"/>
                <span>trendzyofficial.store&#64;gmail.com</span>
              </div>
              <div class="contact-item">
                <app-icon name="phone" [size]="16"/>
                <span>+92 300 1234567</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer__bottom">
        <div class="container">
          <div class="footer__bottom-inner">
            <p class="footer__copyright">
              &copy; {{ currentYear }} Trendzy. All rights reserved. Crafted with elegance.
            </p>
            <div class="footer__bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a routerLink="/admin">Admin</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--black);
      color: var(--cream);
      margin-top: auto;

      &__ornament {
        display: flex; align-items: center; padding: 0 2rem;
        @media (max-width: 480px) { padding: 0 1rem; }

        .orn-line {
          flex: 1; height: 1px;
          background: linear-gradient(to right, var(--black), var(--gold));
          &:last-child { background: linear-gradient(to left, var(--black), var(--gold)); }
        }
        .orn-diamond {
          width: 10px; height: 10px; background: var(--gold);
          transform: rotate(45deg); margin: 0 1rem; flex-shrink: 0;
        }
      }

      &__main {
        padding: 4rem 2rem;
        @media (max-width: 768px) { padding: 3rem 1.5rem; }
        @media (max-width: 480px) { padding: 2.5rem 1rem; }
      }

      &__grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
        gap: 3rem;
        @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
        @media (max-width: 600px)  { grid-template-columns: 1fr 1fr; gap: 2rem; }
        @media (max-width: 400px)  { grid-template-columns: 1fr; gap: 2rem; }
      }

      &__brand {
        @media (max-width: 600px) { grid-column: 1/-1; }

        .logo-svg {
          width: 160px; height: 42px; margin-bottom: 1.25rem;
          @media (max-width: 480px) { width: 140px; height: 36px; }
        }
      }

      &__tagline {
        font-size: 0.875rem; color: var(--gray-400); line-height: 1.7; margin-bottom: 1.5rem;
        @media (max-width: 480px) { font-size: 0.8rem; }
      }

      &__logo { display: inline-block; margin-bottom: 1rem; }

      &__heading {
        font-family: var(--font-body); font-size: 0.7rem; font-weight: 700;
        letter-spacing: 0.2em; text-transform: uppercase;
        color: var(--gold); margin-bottom: 1.25rem;
        @media (max-width: 480px) { margin-bottom: 1rem; }
      }

      &__links {
        list-style: none; padding: 0; margin: 0;
        display: flex; flex-direction: column; gap: 0.625rem;

        a {
          font-size: 0.875rem; color: var(--gray-400); text-decoration: none;
          transition: color 0.2s; display: inline-block;
          &:hover { color: var(--gold-light); }
          @media (max-width: 480px) { font-size: 0.8rem; }
        }
      }

      &__newsletter-text {
        font-size: 0.875rem; color: var(--gray-400); line-height: 1.6; margin-bottom: 1rem;
        @media (max-width: 480px) { font-size: 0.8rem; }
      }

      &__contact-info {
        margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.625rem;
      }

      &__bottom {
        border-top: 1px solid rgba(201,168,76,0.15);
        padding: 1.25rem 0;

        &-inner {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; padding: 0 2rem;
          @media (max-width: 768px) { padding: 0 1.5rem; }
          @media (max-width: 600px) { flex-direction: column; text-align: center; gap: 0.75rem; padding: 0 1rem; }
        }
      }

      &__copyright {
        font-size: 0.75rem; color: var(--gray-500); letter-spacing: 0.05em;
        @media (max-width: 480px) { font-size: 0.7rem; }
      }

      &__bottom-links {
        display: flex; gap: 1.5rem;
        @media (max-width: 400px) { gap: 1rem; flex-wrap: wrap; justify-content: center; }

        a {
          font-size: 0.75rem; color: var(--gray-500); text-decoration: none;
          letter-spacing: 0.05em; transition: color 0.2s;
          &:hover { color: var(--gold-light); }
        }
      }
    }

    .social-links { display: flex; gap: 0.75rem; flex-wrap: wrap; }

    .social-link {
      display: flex; align-items: center; justify-content: center;
      width: 38px; height: 38px; border: 1px solid rgba(201,168,76,0.25);
      border-radius: 50%; color: var(--gray-400); transition: all 0.3s; text-decoration: none;
      &:hover { border-color: var(--gold); color: var(--gold); background: rgba(201,168,76,0.08); }
    }

    .newsletter-form {
      .newsletter-input-wrap {
        display: flex; align-items: stretch;
        border: 1px solid rgba(201,168,76,0.3);
        transition: border-color 0.3s;
        &:focus-within { border-color: var(--gold); }
      }

      .newsletter-input {
        flex: 1; background: rgba(255,255,255,0.05); border: none;
        padding: 0.75rem 1rem; color: var(--cream); font-size: 0.875rem; outline: none;
        &::placeholder { color: var(--gray-500); }
      }

      .newsletter-btn {
        padding: 0 1rem; background: var(--gold); color: var(--black);
        border: none; cursor: pointer; display: flex; align-items: center;
        transition: background 0.3s; flex-shrink: 0;
        &:hover { background: var(--gold-dark); }
      }
    }

    .contact-item {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.8125rem; color: var(--gray-400);
      app-icon { color: var(--gold); flex-shrink: 0; }
      @media (max-width: 480px) { font-size: 0.75rem; }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  onNewsletterSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    if (input.value) {
      input.value = '';
      // Toast would show here via ToastService
    }
  }
}
