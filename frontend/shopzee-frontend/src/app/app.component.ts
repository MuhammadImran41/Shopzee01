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
    <!-- Admin layout: full screen, no navbar/footer -->
    @if (isAdminRoute()) {
      <router-outlet/>
    }

    <!-- Public layout: only for non-admin users -->
    @if (!isAdminRoute() && !isAdminUser()) {
      <app-navbar/>
      <main class="main-content" id="main-content">
        <router-outlet/>
      </main>
      <app-footer/>
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
  isAdminUser  = () => this.authApi.currentUser()?.role === 'admin';

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const url = e.urlAfterRedirects;
        this.isAdminRoute.set(url.startsWith('/admin'));

        // If admin is logged in and on any non-admin route, redirect to admin
        if (this.authApi.currentUser()?.role === 'admin' && !url.startsWith('/admin')) {
          this.router.navigate(['/admin']);
        }
      });

    this.isAdminRoute.set(this.router.url.startsWith('/admin'));

    // On app load: if admin already logged in, go to admin panel immediately
    if (this.authApi.currentUser()?.role === 'admin' && !this.router.url.startsWith('/admin')) {
      this.router.navigate(['/admin']);
    }
  }
}
