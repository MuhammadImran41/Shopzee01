import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'women',
    loadComponent: () =>
      import('./features/shop/shop.component').then(m => m.ShopComponent),
    data: { category: 'women' }
  },
  {
    path: 'men',
    loadComponent: () =>
      import('./features/shop/shop.component').then(m => m.ShopComponent),
    data: { category: 'men' }
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent)
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./features/account/account.component').then(m => m.AccountComponent)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then(m => m.ContactComponent)
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
        path: 'seo',
        loadComponent: () =>
          import('./features/admin/components/seo/seo.component').then(m => m.SeoComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
