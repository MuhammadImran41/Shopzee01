import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthApiService } from './core/services/api/auth-api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `
    <!-- Public layout: navbar + content + footer -->
    @if (!isAdminRoute()) {
      <!-- Announcement Slider — top of page -->
      <div class="announcement-slider" aria-label="Announcements">
        <div class="announcement-track">
          <div class="announcement-inner">
            <span class="announcement-item">🚚 Free Home Delivery on orders above PKR 5,000</span>
            <span class="announcement-sep">✦</span>
            <span class="announcement-item">🔄 7 Days Easy Returns &amp; Exchange</span>
            <span class="announcement-sep">✦</span>
            <span class="announcement-item">🛡️ 100% Secure Payment</span>
            <span class="announcement-sep">✦</span>
            <span class="announcement-item">⭐ Premium Quality Fabrics &amp; Craftsmanship</span>
            <span class="announcement-sep">✦</span>
            <span class="announcement-item">🚚 Free Home Delivery on orders above PKR 5,000</span>
            <span class="announcement-sep">✦</span>
            <span class="announcement-item">🔄 7 Days Easy Returns &amp; Exchange</span>
            <span class="announcement-sep">✦</span>
            <span class="announcement-item">🛡️ 100% Secure Payment</span>
            <span class="announcement-sep">✦</span>
            <span class="announcement-item">⭐ Premium Quality Fabrics &amp; Craftsmanship</span>
            <span class="announcement-sep">✦</span>
          </div>
        </div>
      </div>
      <app-navbar/>
      <main class="main-content" id="main-content">
        <router-outlet/>
      </main>
      <app-footer/>
    }

    <!-- Admin layout: router-outlet only (admin component has its own shell) -->
    @if (isAdminRoute()) {
      <router-outlet/>
    }

    <!-- Toast always visible -->
    <app-toast/>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      padding-top: 0;
    }

    /* ── ANNOUNCEMENT SLIDER — fixed at very top ─────────── */
    .announcement-slider {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--black);
      overflow: hidden;
      height: 36px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(201,168,76,0.2);
      z-index: 202;
    }

    .announcement-track { width: 100%; overflow: hidden; }

    .announcement-inner {
      display: flex;
      align-items: center;
      gap: 2rem;
      white-space: nowrap;
      animation: announcement-scroll 28s linear infinite;
      width: max-content;
    }

    .announcement-item {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #F5F0E8;
    }

    .announcement-sep {
      color: #C9A84C;
      font-size: 0.55rem;
      flex-shrink: 0;
    }

    @keyframes announcement-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `]
})
export class AppComponent implements OnInit {
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private authApi    = inject(AuthApiService);

  isAdminRoute = signal(false);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Auto-redirect admin users to /admin panel
    if (this.authApi.currentUser()?.role === 'admin' && !this.router.url.startsWith('/admin')) {
      this.router.navigate(['/admin']);
    }

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin'));
      });

    this.isAdminRoute.set(this.router.url.startsWith('/admin'));
  }
}
