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
  `]
})
export class AppComponent implements OnInit {
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private authApi    = inject(AuthApiService);

  isAdminRoute = signal(false);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin'));
      });

    this.isAdminRoute.set(this.router.url.startsWith('/admin'));

    // If admin is already logged in and not on admin route, redirect immediately
    if (this.authApi.currentUser()?.role === 'admin' && !this.router.url.startsWith('/admin')) {
      this.router.navigate(['/admin']);
    }
  }
}
