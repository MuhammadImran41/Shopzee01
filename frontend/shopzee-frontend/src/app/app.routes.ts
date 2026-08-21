import { Routes } from '@angular/router';
import { authGuard, adminGuard, publicOnlyGuard, resellerGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'women',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/shop/shop.component').then(m => m.ShopComponent),
    data: { category: 'women' }
  },
  {
    path: 'men',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/shop/shop.component').then(m => m.ShopComponent),
    data: { category: 'men' }
  },
  {
    path: 'new-arrivals',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/new-arrivals/new-arrivals.component').then(m => m.NewArrivalsComponent)
  },
  {
    path: 'sale',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/sale/sale.component').then(m => m.SaleComponent)
  },
  {
    path: 'product/:id',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [publicOnlyGuard, authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'wishlist',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent)
  },
  {
    path: 'account',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/account/account.component').then(m => m.AccountComponent)
  },
  {
    path: 'about',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'reseller',
    canActivate: [resellerGuard],
    loadComponent: () =>
      import('./features/reseller/reseller-dashboard.component').then(m => m.ResellerDashboardComponent)
  },
  {
    path: 'search',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'size-guide',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/size-guide/size-guide.component').then(m => m.SizeGuideComponent)
  },
  {
    path: 'privacy-policy',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'terms-of-service',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent)
  },
  {
    path: 'return-policy',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/return-policy/return-policy.component').then(m => m.ReturnPolicyComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin.component').then(m => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/components/products/products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/components/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/admin/components/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/admin/components/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'resellers',
        loadComponent: () =>
          import('./features/admin/components/resellers/resellers.component').then(m => m.ResellersComponent)
      },
      {
        path: 'seo',
        loadComponent: () =>
          import('./features/admin/components/seo/seo.component').then(m => m.SeoComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/components/settings/settings.component').then(m => m.AdminSettingsComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
