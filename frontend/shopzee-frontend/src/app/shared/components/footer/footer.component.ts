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
            <h4 class="footer__heading" style="margin-top:1rem">Contact</h4>
            <div class="footer__contact-info">
              <div class="contact-item">
                <app-icon name="map-pin" [size]="16"/>
                <span>Lahore, Pakistan</span>
              </div>
              <div class="contact-item">
                <app-icon name="mail" [size]="16"/>
                <span>stylemakerofficial.store&#64;gmail.com</span>
              </div>
              <div class="contact-item">
                <app-icon name="phone" [size]="16"/>
                <span>03364153050</span>
              </div>
            </div>

          </div>

          <!-- Social Media -->
          <div class="footer__col">
            <h4 class="footer__heading">Social Media</h4>
            <div class="social-links-list">
              <a href="#" class="social-list-link" aria-label="Instagram">
                <span class="social-list-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="3.5"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </span>
                Instagram
              </a>
              <a href="#" class="social-list-link" aria-label="Facebook">
                <span class="social-list-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </span>
                Facebook
              </a>
              <a href="#" class="social-list-link" aria-label="TikTok">
                <span class="social-list-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                  </svg>
                </span>
                TikTok
              </a>
              <a href="#" class="social-list-link" aria-label="WhatsApp">
                <span class="social-list-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                  </svg>
                </span>
                WhatsApp
              </a>
            </div>
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

          <!-- Contact Us -->
          <div class="footer__col">
            <h4 class="footer__heading">Newsletter</h4>
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
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer__bottom">
        <div class="container">
          <div class="footer__bottom-inner">
            <p class="footer__copyright">
              &copy; {{ currentYear }} StyleMaker. All rights reserved. Crafted with elegance.
            </p>
            <div class="footer__bottom-links">
              <a routerLink="/privacy-policy">Privacy Policy</a>
              <a routerLink="/terms-of-service">Terms of Service</a>
              <a routerLink="/return-policy">Return Policy</a>
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
        font-size: 0.875rem; color: var(--cream); line-height: 1.7; margin-bottom: 1.5rem;
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
          font-size: 0.875rem; color: var(--cream); text-decoration: none;
          transition: color 0.2s; display: inline-block;
          &:hover { color: var(--gold-light); }
          @media (max-width: 480px) { font-size: 0.8rem; }
        }
      }

      &__newsletter-text {
        font-size: 0.875rem; color: var(--cream); line-height: 1.6; margin-bottom: 1rem;
        @media (max-width: 480px) { font-size: 0.8rem; }
      }

      &__contact-info {
        margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem;
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
        font-size: 0.75rem; color: var(--cream); letter-spacing: 0.05em;
        @media (max-width: 480px) { font-size: 0.7rem; }
      }

      &__bottom-links {
        display: flex; gap: 1.5rem;
        @media (max-width: 400px) { gap: 1rem; flex-wrap: wrap; justify-content: center; }

        a {
          font-size: 0.75rem; color: var(--cream); text-decoration: none;
          letter-spacing: 0.05em; transition: color 0.2s;
          &:hover { color: var(--gold-light); }
        }
      }
    }

    .social-links { display: flex; gap: 0.75rem; flex-wrap: wrap; }

    .social-link {
      display: flex; align-items: center; justify-content: center;
      width: 38px; height: 38px; border: 1px solid rgba(201,168,76,0.25);
      border-radius: 50%; color: var(--cream); transition: all 0.3s; text-decoration: none;
      &:hover { border-color: var(--gold); color: var(--gold); background: rgba(201,168,76,0.08); }
    }

    .social-links-list {
      display: flex; flex-direction: column; gap: 0.625rem;
    }

    .social-list-link {
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 0.875rem; color: var(--cream); text-decoration: none;
      transition: color 0.2s;
      &:hover { color: var(--gold-light); }
      @media (max-width: 480px) { font-size: 0.8rem; }
    }

    .social-list-icon {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; flex-shrink: 0;
      border: 1px solid rgba(201,168,76,0.25); border-radius: 50%;
      color: var(--cream); transition: all 0.25s;
      .social-list-link:hover & {
        border-color: var(--gold); color: var(--gold);
        background: rgba(201,168,76,0.08);
      }
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
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 0.8125rem; color: var(--cream);
      padding: 0.5rem 0;
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
