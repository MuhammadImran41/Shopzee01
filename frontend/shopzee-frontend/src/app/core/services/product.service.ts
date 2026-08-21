import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductApiService, ApiProduct, ProductFilter } from './api/product-api.service';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productApi = inject(ProductApiService);

  // Local signal cache for home page (featured/loaded products)
  private _products = signal<Product[]>(MOCK_PRODUCTS);

  readonly products         = this._products.asReadonly();
  readonly womenProducts    = computed(() => this._products().filter(p => p.category === 'women'));
  readonly menProducts      = computed(() => this._products().filter(p => p.category === 'men'));
  readonly featuredProducts = computed(() => this._products().filter(p => p.isFeatured));

  // ── API methods (return Observables for components) ──────
  getProductsFromApi(filter: ProductFilter = {}) {
    return this.productApi.getAll(filter).pipe(
      map(res => ({
        ...res,
        items: res.items.map(apiToProduct)
      }))
    );
  }

  getByIdFromApi(id: number): Observable<Product> {
    return this.productApi.getById(id).pipe(map(apiToProduct));
  }

  getRelatedFromApi(id: number): Observable<Product[]> {
    return this.productApi.getRelated(id).pipe(map(items => items.map(apiToProduct)));
  }

  getFeaturedFromApi(): Observable<Product[]> {
    return this.productApi.getFeatured().pipe(map(items => items.map(apiToProduct)));
  }

  // ── Local mock fallback (used when API unavailable) ──────
  getById(id: number) {
    return this._products().find(p => p.id === id);
  }

  getByCategory(category: 'women' | 'men') {
    return this._products().filter(p => p.category === category);
  }
}

// ── Convert API response to local Product model ───────────
export function apiToProduct(p: ApiProduct): Product {
  return {
    id:            p.id,
    name:          p.name,
    category:      (p.categoryName?.toLowerCase() as 'women' | 'men') || 'women',
    subCategory:   p.subCategory,
    price:         p.price,
    originalPrice: p.originalPrice,
    discount:      p.discountPercent,
    images:        p.images?.length ? p.images : [`assets/images/${p.categoryName?.toLowerCase() || 'women'}/${p.sku?.toLowerCase() || 'default'}.png`],
    colors:        p.colors || [],
    sizes:         p.sizes || [],
    description:   p.description,
    rating:        p.rating,
    reviews:       p.reviewCount,
    stock:         p.stock,
    isNew:         p.isNew,
    isFeatured:    p.isFeatured,
    isInStock:     p.isInStock ?? true,
    tags:          p.tags || [],
    sku:           p.sku,
    seoTitle:      p.seoTitle,
    seoDescription:p.seoDescription,
    seoKeywords:   p.seoKeywords?.split(',') || []
  };
}

// ── Mock data (fallback when backend unavailable) ─────────
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1, name: 'Sage Embroidered Net Suit', category: 'women', subCategory: 'Formal',
    price: 12500, originalPrice: 16000, discount: 22,
    images: ['assets/images/women/women-1.png'],
    colors: ['#8FAF8F','#C9A84C','#F5F0E8'], sizes: ['XS','S','M','L','XL'],
    description: 'Exquisitely crafted sage green net suit with intricate gold embroidery.',
    rating: 4.8, reviews: 124, stock: 15, isNew: true, isFeatured: true,
    tags: ['formal','embroidered','net'], sku: 'WF-001'
  },
  {
    id: 2, name: 'Lavender Chiffon Ensemble', category: 'women', subCategory: 'Semi-Formal',
    price: 9800, originalPrice: 12500, discount: 22,
    images: ['assets/images/women/women-2.png'],
    colors: ['#B8A9C9','#F5F0E8','#C9A84C'], sizes: ['XS','S','M','L','XL'],
    description: 'Delicate lavender chiffon suit with floral embroidery.',
    rating: 4.7, reviews: 98, stock: 12, isFeatured: true, tags: ['semi-formal'], sku: 'WF-002'
  },
  {
    id: 3, name: 'Ivory Gold Bridal Luxury', category: 'women', subCategory: 'Bridal',
    price: 28000, images: ['assets/images/women/women-3.png'],
    colors: ['#F5F0E8','#C9A84C'], sizes: ['XS','S','M','L'],
    description: 'Regal ivory and gold bridal ensemble.',
    rating: 5.0, reviews: 56, stock: 8, isNew: true, isFeatured: true, tags: ['bridal'], sku: 'WB-001'
  },
  {
    id: 4, name: 'Mint Organza Party Wear', category: 'women', subCategory: 'Party Wear',
    price: 8500, originalPrice: 10500, discount: 19,
    images: ['assets/images/women/women-4.png'],
    colors: ['#98D4C8','#F5F0E8'], sizes: ['S','M','L','XL'],
    description: 'Stunning mint organza party wear.', rating: 4.6, reviews: 83, stock: 20,
    isFeatured: true, tags: ['party','organza'], sku: 'WP-001'
  },
  {
    id: 5, name: 'Cream Pearl Embroidered Suit', category: 'women', subCategory: 'Formal',
    price: 15000, images: ['assets/images/women/women-5.png'],
    colors: ['#F5F0E8','#E8DCC8'], sizes: ['XS','S','M','L','XL'],
    description: 'Classic cream suit adorned with pearl and crystal embroidery.',
    rating: 4.9, reviews: 142, stock: 10, isNew: true, tags: ['formal','pearl'], sku: 'WF-003'
  },
  {
    id: 6, name: 'Rose Gold Evening Gown', category: 'women', subCategory: 'Evening Wear',
    price: 22000, originalPrice: 28000, discount: 21,
    images: ['assets/images/women/women-6.png'],
    colors: ['#E8B4A0','#C9A84C'], sizes: ['XS','S','M','L'],
    description: 'Breathtaking rose gold evening gown.', rating: 4.8, reviews: 67, stock: 6,
    tags: ['evening','gown'], sku: 'WE-001'
  },
  {
    id: 7, name: 'Turquoise Festive Collection', category: 'women', subCategory: 'Festive',
    price: 11500, images: ['assets/images/women/women-7.png'],
    colors: ['#40B8C4','#C9A84C','#F5F0E8'], sizes: ['S','M','L','XL','XXL'],
    description: 'Vibrant turquoise festive suit.', rating: 4.7, reviews: 91, stock: 18,
    isNew: true, tags: ['festive','eid'], sku: 'WF-004'
  },
  {
    id: 8, name: 'Classic Cream Shalwar Kameez', category: 'men', subCategory: 'Formal',
    price: 6500, originalPrice: 8000, discount: 19,
    images: ['assets/images/men/men-1.png'],
    colors: ['#F5F0E8','#E8DCC8'], sizes: ['S','M','L','XL','XXL'],
    description: 'Elegant cream shalwar kameez in premium cotton.',
    rating: 4.7, reviews: 108, stock: 25, isFeatured: true, isNew: true, sku: 'MF-001',
    tags: ['formal','cotton']
  },
  {
    id: 9, name: 'Midnight Black Kurta Set', category: 'men', subCategory: 'Party Wear',
    price: 7800, images: ['assets/images/men/men-2.png'],
    colors: ['#1A1A1A','#2C2C2C'], sizes: ['S','M','L','XL','XXL'],
    description: 'Sophisticated midnight black kurta set.',
    rating: 4.9, reviews: 87, stock: 15, isFeatured: true, tags: ['party'], sku: 'MP-001'
  },
  {
    id: 10, name: 'Charcoal Grey Embroidered Kurta', category: 'men', subCategory: 'Semi-Formal',
    price: 5500, originalPrice: 7000, discount: 21,
    images: ['assets/images/men/men-3.png'],
    colors: ['#4A4A4A','#6B6560'], sizes: ['S','M','L','XL','XXL'],
    description: 'Contemporary charcoal grey kurta.', rating: 4.6, reviews: 72, stock: 20,
    tags: ['semi-formal'], sku: 'MS-001'
  },
  {
    id: 11, name: 'Navy Blue Luxury Suit', category: 'men', subCategory: 'Bridal / Sherwani',
    price: 18500, images: ['assets/images/men/men-4.png'],
    colors: ['#1B3A6B','#C9A84C'], sizes: ['S','M','L','XL'],
    description: 'Majestic navy blue luxury suit.', rating: 5.0, reviews: 43, stock: 8,
    isNew: true, isFeatured: true, tags: ['bridal','sherwani'], sku: 'MB-001'
  }
];
