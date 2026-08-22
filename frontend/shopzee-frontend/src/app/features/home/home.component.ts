import {
  Component, inject, AfterViewInit, OnInit, ElementRef,
  PLATFORM_ID, OnDestroy, signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { SiteImagesService } from '../../core/services/site-images.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SvgIconsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  private productService  = inject(ProductService);
  private cartService     = inject(CartService);
  private wishlistService = inject(WishlistService);
  private toastService    = inject(ToastService);
  private router          = inject(Router);
  private el              = inject(ElementRef);
  private platformId      = inject(PLATFORM_ID);
  readonly siteImages     = inject(SiteImagesService);

  private _womenProducts = signal<Product[]>(this.productService.womenProducts());
  private _menProducts   = signal<Product[]>(this.productService.menProducts());
  private _allProducts   = signal<Product[]>(this.productService.products());

  womenProducts         = this._womenProducts.asReadonly();
  menProducts           = this._menProducts.asReadonly();
  allProductsForMarquee = this._allProducts.asReadonly();

  loading = signal(false);

  private observers: IntersectionObserver[] = [];

  testimonials = [
    {
      name: 'Ayesha Malik', location: 'Lahore', rating: 5,
      text: 'Absolutely stunning quality! The embroidery on my suit was even more beautiful in person. Will definitely order again.'
    },
    {
      name: 'Fatima Khan', location: 'Karachi', rating: 5,
      text: 'STYLEMAKER never disappoints. Fast delivery, premium packaging, and the fabric quality is exceptional.'
    },
    {
      name: 'Sana Rehman', location: 'Islamabad', rating: 5,
      text: 'The cream shalwar kameez for my husband was perfect for Eid. He got so many compliments!'
    }
  ];

  ngOnInit() {
    this.loadProductsFromApi();
  }

  private loadProductsFromApi() {
    this.loading.set(true);
    this.productService.getProductsFromApi({ pageSize: 50 }).subscribe({
      next: res => {
        const women = res.items.filter(p => p.category === 'women');
        const men   = res.items.filter(p => p.category === 'men');
        if (women.length) this._womenProducts.set(women);
        if (men.length)   this._menProducts.set(men);
        this._allProducts.set(res.items);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initScrollReveal();
  }

  ngOnDestroy() {
    this.observers.forEach(o => o.disconnect());
  }

  private initScrollReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    this.el.nativeElement
      .querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach((el: Element) => obs.observe(el));

    this.observers.push(obs);
  }

  addToCart(product: Product) {
    this.cartService.addItem(product, product.sizes[1] || product.sizes[0], product.colors[0]);
    this.toastService.cart(`${product.name} added to cart`);
    this.router.navigate(['/cart']);
  }

  toggleWishlist(product: Product) {
    this.wishlistService.toggle(product);
    const msg = this.wishlistService.isWishlisted(product.id)
      ? `${product.name} added to wishlist`
      : `${product.name} removed from wishlist`;
    this.toastService.wishlist(msg);
  }

  isWishlisted(id: number): boolean {
    return this.wishlistService.isWishlisted(id);
  }

  formatPrice(price: number): string {
    return 'PKR ' + price.toLocaleString('en-PK');
  }

  stars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
}
