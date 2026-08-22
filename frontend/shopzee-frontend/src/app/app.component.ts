import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal.component';
import { AuthApiService } from './core/services/api/auth-api.service';
import { ThemeService } from './core/services/theme.service';
import { SiteImagesService } from './core/services/site-images.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ToastComponent, AuthModalComponent],
  template: `
    <!-- Admin layout: full screen, no navbar/footer -->
    @if (isAdminRoute()) {
      <router-outlet/>
    }

    <!-- Public + Reseller layout: navbar + content + footer -->
    @if (!isAdminRoute() && !isAdminUser()) {
      <app-navbar/>
      <main class="main-content" id="main-content">
        <router-outlet/>
      </main>
      <app-footer/>
    }

    <!-- Global auth modal (triggered by ?signIn=1) -->
    @if (showGlobalAuth()) {
      <app-auth-modal
        (close)="onAuthClose()"
        (loggedIn)="onAuthLoggedIn()"
      />
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
  `]
})
export class AppComponent implements OnInit {
  private router     = inject(Router);
  private route      = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private authApi    = inject(AuthApiService);
  private themeService  = inject(ThemeService);
  private imagesService = inject(SiteImagesService);

  isAdminRoute   = signal(false);
  showGlobalAuth = signal(false);
  private returnUrl = '';

  isAdminUser    = () => this.authApi.currentUser()?.role === 'admin';
  isResellerUser = () => {
    const r = this.authApi.currentUser()?.role;
    return r === 'reseller' || r === 'reseller_pending';
  };

  onAuthClose() {
    this.showGlobalAuth.set(false);
    // Remove query params from URL
    this.router.navigate(['/'], { replaceUrl: true });
  }

  onAuthLoggedIn() {
    this.showGlobalAuth.set(false);
    const dest = this.returnUrl || '/';
    this.returnUrl = '';
    // Navigate to returnUrl after login (checkout, etc.)
    this.router.navigate([dest], { replaceUrl: true });
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Init theme + images from localStorage/backend on startup
    this.themeService.init();
    this.imagesService.init();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const url = e.urlAfterRedirects;
        this.isAdminRoute.set(url.startsWith('/admin'));

        // Check for ?signIn=1 — open auth modal + save returnUrl
        const urlObj = new URL(window.location.href);
        if (urlObj.searchParams.get('signIn') === '1') {
          this.returnUrl = urlObj.searchParams.get('returnUrl') || '/';
          this.showGlobalAuth.set(true);
        }

        // Admin redirect
        if (this.authApi.currentUser()?.role === 'admin' && !url.startsWith('/admin')) {
          this.router.navigate(['/admin']);
        }
        // Reseller: only block admin panel access, allow public pages
        // (reseller can browse products, view site normally)
      });

    this.isAdminRoute.set(this.router.url.startsWith('/admin'));

    // On app load: if admin already logged in, go to admin panel immediately
    if (this.authApi.currentUser()?.role === 'admin' && !this.router.url.startsWith('/admin')) {
      this.router.navigate(['/admin']);
    }
  }
}
