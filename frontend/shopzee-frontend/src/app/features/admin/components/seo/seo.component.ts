import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from '../../../../core/services/api/product-api.service';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SvgIconsComponent } from '../../../../shared/components/svg-icons/svg-icons.component';

@Component({
  selector: 'app-seo',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconsComponent],
  template: `
    <div class="admin-section">
      <div class="section-top">
        <h1 class="admin-page-title">SEO Management</h1>
        <button class="btn btn-outline"><app-icon name="globe" [size]="16"/> Generate Sitemap</button>
      </div>

      <!-- SEO Stats -->
      <div class="seo-stats">
        <div class="seo-stat"><span class="seo-stat-val">11</span><span class="seo-stat-label">Total Pages</span></div>
        <div class="seo-stat"><span class="seo-stat-val c-green">8</span><span class="seo-stat-label">Optimized</span></div>
        <div class="seo-stat"><span class="seo-stat-val c-orange">3</span><span class="seo-stat-label">Needs Attention</span></div>
      </div>

      <!-- Product SEO List -->
      <div class="seo-list">
        @for (product of products(); track product.id) {
          <div class="seo-item" [class.expanded]="expandedId() === product.id">
            <div class="seo-item-header" (click)="toggle(product.id)">
              <img [src]="product.images[0]" [alt]="product.name" class="seo-img" loading="lazy"/>
              <div class="seo-item-info">
                <span class="seo-item-name">{{ product.name }}</span>
                <span class="seo-item-status" [class]="getSeoStatus(product)">{{ getSeoStatusLabel(product) }}</span>
              </div>
              <app-icon [name]="expandedId() === product.id ? 'chevron-up' : 'chevron-down'" [size]="18" class="seo-chevron"/>
            </div>
            @if (expandedId() === product.id) {
              <div class="seo-form">
                <div class="form-group">
                  <label>Meta Title <span class="char-count">{{ (seoData[product.id].title || product.seoTitle || '').length }}/60</span></label>
                  <input
                    type="text"
                    [(ngModel)]="seoData[product.id].title"
                    [placeholder]="product.name + ' | Trendzy'"
                    maxlength="60"
                  />
                </div>
                <div class="form-group">
                  <label>Meta Description <span class="char-count">{{ (seoData[product.id].desc || product.seoDescription || '').length }}/160</span></label>
                  <textarea
                    [(ngModel)]="seoData[product.id].desc"
                    [placeholder]="'Describe ' + product.name + ' for search engines...'"
                    maxlength="160"
                    rows="3"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label>Keywords (comma separated)</label>
                  <input type="text" [(ngModel)]="seoData[product.id].keywords" placeholder="women suit, embroidered, Pakistani fashion"/>
                </div>
                <div class="seo-preview">
                  <h4 class="preview-label">Search Preview</h4>
                  <div class="google-preview">
                    <span class="gp-url">trendzy.pk/product/{{ product.id }}</span>
                    <span class="gp-title">{{ seoData[product.id].title || product.name }}</span>
                    <span class="gp-desc">{{ seoData[product.id].desc || product.description }}</span>
                  </div>
                </div>
                <button class="btn btn-primary" (click)="saveSeo(product)" style="margin-top:1rem">Save SEO Data</button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-section {}
    .section-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
    .admin-page-title { font-family:var(--font-heading); font-size:var(--text-4xl); font-weight:400; }
    .seo-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; max-width:500px; }
    .seo-stat { background:var(--cream-light); border:1px solid var(--gray-200); padding:1rem; text-align:center; }
    .seo-stat-val { display:block; font-family:var(--font-heading); font-size:2rem; font-weight:500; }
    .seo-stat-label { font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--gray-400); }
    .c-green{color:#388E3C;} .c-orange{color:#E65100;}
    .seo-list { display:flex; flex-direction:column; gap:0; border:1px solid var(--gray-200); background:var(--cream-light); }
    .seo-item { border-bottom:1px solid var(--gray-200); &:last-child{border-bottom:none;} }
    .seo-item-header { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; cursor:pointer; transition:background 0.2s; &:hover{background:rgba(201,168,76,0.04);} }
    .seo-img { width:48px; height:60px; object-fit:cover; object-position:top center; flex-shrink:0; }
    .seo-item-info { flex:1; }
    .seo-item-name { display:block; font-size:0.9375rem; font-weight:500; margin-bottom:0.25rem; }
    .seo-item-status { font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:0.15rem 0.5rem; }
    .seo-ok { background:rgba(76,175,80,0.12); color:#388E3C; }
    .seo-warn { background:rgba(255,152,0,0.15); color:#E65100; }
    .seo-missing { background:rgba(229,57,53,0.12); color:#C62828; }
    .seo-chevron { color:var(--gray-400); flex-shrink:0; }
    .seo-form { padding:1.25rem 1.25rem 1.25rem 4rem; border-top:1px solid var(--gray-200); background:rgba(245,240,232,0.5); }
    .char-count { font-size:0.7rem; color:var(--gray-400); font-weight:400; margin-left:0.5rem; }
    .seo-preview { margin-top:1rem; }
    .preview-label { font-size:0.7rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold-dark); margin-bottom:0.625rem; }
    .google-preview { border:1px solid var(--gray-200); padding:1rem; background:white; }
    .gp-url { display:block; font-size:0.75rem; color:#0D652D; margin-bottom:0.25rem; }
    .gp-title { display:block; font-size:1rem; color:#1a0dab; margin-bottom:0.25rem; &:hover{text-decoration:underline;} }
    .gp-desc { display:block; font-size:0.8125rem; color:#4d5156; line-height:1.5; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
  `]
})
export class SeoComponent {
  private productApi     = inject(ProductApiService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  products = signal(this.productService.products());
  expandedId = signal<number | null>(null);
  seoData: Record<number, { title: string; desc: string; keywords: string }> = {};

  constructor() {
    // Load products from API
    this.productApi.getAll({ pageSize: 50 }).subscribe({
      next: res => {
        res.items.forEach(p => {
          this.seoData[p.id] = {
            title:    p.seoTitle    || '',
            desc:     p.seoDescription || '',
            keywords: p.seoKeywords  || ''
          };
        });
      },
      error: () => {
        // fallback: use cached products signal
        this.productService.products().forEach(p => {
          this.seoData[p.id] = {
            title:    p.seoTitle    || '',
            desc:     p.seoDescription || '',
            keywords: (p.seoKeywords || []).join(', ')
          };
        });
      }
    });
  }

  toggle(id: number) {
    this.expandedId.update(v => v === id ? null : id);
    if (!this.seoData[id]) {
      this.seoData[id] = { title: '', desc: '', keywords: '' };
    }
  }

  getSeoStatus(p: any): string {
    const d = this.seoData[p.id];
    if (!d?.title && !d?.desc) return 'seo-item-status seo-missing';
    if (!d?.title || !d?.desc) return 'seo-item-status seo-warn';
    return 'seo-item-status seo-ok';
  }

  getSeoStatusLabel(p: any): string {
    const d = this.seoData[p.id];
    if (!d?.title && !d?.desc) return 'Not Optimized';
    if (!d?.title || !d?.desc) return 'Needs Attention';
    return 'Optimized';
  }

  saveSeo(product: any) {
    const d = this.seoData[product.id];
    this.productApi.updateSeo(product.id, {
      seoTitle:       d?.title,
      seoDescription: d?.desc,
      seoKeywords:    d?.keywords
    }).subscribe({
      next: () => this.toast.success(`SEO saved for "${product.name}"`),
      error: () => this.toast.error('Failed to save SEO data.')
    });
  }
}
