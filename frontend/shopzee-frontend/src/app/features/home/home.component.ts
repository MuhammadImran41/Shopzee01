import {
  Component, inject, AfterViewInit, OnInit, ElementRef,
  PLATFORM_ID, OnDestroy, ViewChild, signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';
import { Product } from '../../core/models/product.model';

// ── Network API type (not in standard TS lib yet) ────────
declare const navigator: Navigator & {
  connection?: {
    effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
    saveData: boolean;
    downlink: number;  // Mbps
  };
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SvgIconsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('heroVideo')   heroVideoRef!:   ElementRef<HTMLVideoElement>;
  @ViewChild('menVideo')    menVideoRef!:    ElementRef<HTMLVideoElement>;
  @ViewChild('bannerVideo') bannerVideoRef!: ElementRef<HTMLVideoElement>;

  private productService  = inject(ProductService);
  private cartService     = inject(CartService);
  private wishlistService = inject(WishlistService);
  private toastService    = inject(ToastService);
  private el              = inject(ElementRef);
  private platformId      = inject(PLATFORM_ID);

  // Product signals — mock data first, API replaces
  private _womenProducts = signal<Product[]>(this.productService.womenProducts());
  private _menProducts   = signal<Product[]>(this.productService.menProducts());
  private _allProducts   = signal<Product[]>(this.productService.products());

  womenProducts         = this._womenProducts.asReadonly();
  menProducts           = this._menProducts.asReadonly();
  allProductsForMarquee = this._allProducts.asReadonly();

  loading = signal(false);

  /**
   * videoEnabled = false  →  slow connection detected
   * Show poster image only, no video loaded at all
   * This is the key fix for slow internet
   */
  videoEnabled = signal(true);

  private observers: IntersectionObserver[] = [];
  private networkMonitor: (() => void) | null = null;

  testimonials = [
    {
      name: 'Ayesha Malik', location: 'Lahore', rating: 5,
      text: 'Absolutely stunning quality! The embroidery on my suit was even more beautiful in person. Will definitely order again.'
    },
    {
      name: 'Fatima Khan', location: 'Karachi', rating: 5,
      text: 'Shopzee never disappoints. Fast delivery, premium packaging, and the fabric quality is exceptional.'
    },
    {
      name: 'Sana Rehman', location: 'Islamabad', rating: 5,
      text: 'The cream shalwar kameez for my husband was perfect for Eid. He got so many compliments!'
    }
  ];

  ngOnInit() {
    this.loadProductsFromApi();
    if (isPlatformBrowser(this.platformId)) {
      this.checkNetworkAndDecide();
    }
  }

  // ── Network detection: should we load videos? ────────────
  private checkNetworkAndDecide() {
    const conn = navigator.connection;

    // 1. User opted into data-saver mode → no videos
    if (conn?.saveData) {
      this.videoEnabled.set(false);
      return;
    }

    // 2. Slow connection types → no videos
    if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') {
      this.videoEnabled.set(false);
      return;
    }

    // 3. 3G with < 1.5 Mbps → no videos
    if (conn?.effectiveType === '3g' && conn?.downlink < 1.5) {
      this.videoEnabled.set(false);
      return;
    }

    // 4. Network API not available → assume ok, but use conservative loading
    // Videos load only when in viewport (preload="none" already set)
    this.videoEnabled.set(true);

    // 5. Monitor network changes in real-time
    if (conn) {
      const handler = () => {
        const slow = conn.saveData
          || conn.effectiveType === 'slow-2g'
          || conn.effectiveType === '2g'
          || (conn.effectiveType === '3g' && conn.downlink < 1.5);

        if (slow) {
          // Connection degraded — pause and unload all videos
          this.videoEnabled.set(false);
          this.pauseAllVideos();
        } else {
          this.videoEnabled.set(true);
        }
      };

      (conn as any).addEventListener('change', handler);
      this.networkMonitor = () => (conn as any).removeEventListener('change', handler);
    }
  }

  private pauseAllVideos() {
    [this.heroVideoRef, this.menVideoRef, this.bannerVideoRef].forEach(ref => {
      const v = ref?.nativeElement;
      if (v) {
        v.pause();
        v.src = '';
        v.load(); // release resources
      }
    });
  }

  // ── Products from API ─────────────────────────────────────
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

    setTimeout(() => {
      // Only init videos if connection is fast enough
      if (!this.videoEnabled()) return;

      // Hero: play immediately (it's in viewport)
      this.initHeroVideo();

      // Below-fold: lazy play via IntersectionObserver
      this.lazyPlayVideo(this.menVideoRef,    0.25);
      this.lazyPlayVideo(this.bannerVideoRef, 0.20);
    }, 300);
  }

  ngOnDestroy() {
    this.observers.forEach(o => o.disconnect());
    if (this.networkMonitor) this.networkMonitor();
  }

  // ── Hero video: buffer-aware playback ────────────────────
  private initHeroVideo() {
    const video = this.heroVideoRef?.nativeElement;
    if (!video) return;

    // Track stall events — if video stalls more than 3 times, hide it
    let stallCount = 0;

    const onWaiting = () => {
      stallCount++;
      if (stallCount >= 3) {
        // Too many stalls = slow internet — show poster only
        video.pause();
        video.removeEventListener('waiting', onWaiting);
        video.classList.add('video-hidden');
        video.previousElementSibling?.classList.add('poster-visible');
      }
    };

    // When video can play smoothly, actually start it
    const onCanPlay = () => {
      video.play().catch(() => {});
    };

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay, { once: true });

    // Start loading
    video.load();
  }

  // ── Below-fold lazy video: play only when in viewport ────
  private lazyPlayVideo(ref: ElementRef<HTMLVideoElement>, threshold = 0.2) {
    if (!ref?.nativeElement) return;
    const video = ref.nativeElement;
    let hasLoaded = false;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.videoEnabled()) {
          if (!hasLoaded) {
            // Only load when visible — saves bandwidth
            video.load();
            hasLoaded = true;
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, {
      threshold,
      rootMargin: '100px 0px'  // Start loading 100px before visible
    });

    obs.observe(video);
    this.observers.push(obs);
  }

  // ── Scroll reveal ─────────────────────────────────────────
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

  // ── Cart / Wishlist actions ───────────────────────────────
  addToCart(product: Product) {
    this.cartService.addItem(product, product.sizes[1] || product.sizes[0], product.colors[0]);
    this.toastService.cart(`${product.name} added to cart`);
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
