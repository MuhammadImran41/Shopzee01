import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService, ApiProduct } from '../../../../core/services/api/product-api.service';
import { SvgIconsComponent } from '../../../../shared/components/svg-icons/svg-icons.component';
import { ToastService } from '../../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconsComponent],
  animations: [
    trigger('modalAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('280ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'translateY(16px)' }))
      ])
    ])
  ],
  template: `
    <div class="admin-section">
      <!-- Header -->
      <div class="section-top">
        <h1 class="admin-page-title">Products</h1>
        <div class="section-actions">
          <div class="search-box">
            <app-icon name="search" [size]="16" class="search-ico"/>
            <input
              type="search"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
              placeholder="Search products..."
              class="admin-search-input"
              aria-label="Search products"
            />
          </div>
          <button class="btn btn-primary" (click)="openAddModal()">
            <app-icon name="plus" [size]="16"/> Add Product
          </button>
        </div>
      </div>

      <!-- Bulk Upload Zone -->
      <div
        class="upload-zone"
        [class.drag-over]="dragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="dragOver = false"
        (drop)="onDrop($event)"
      >
        <app-icon name="upload" [size]="32" class="upload-icon"/>
        <p class="upload-text">Drag & drop product images for bulk upload</p>
        <p class="upload-sub">PNG, JPG up to 10MB each</p>
        <input type="file" multiple accept="image/*" class="upload-input"
          (change)="onFileSelect($event)" id="bulk-upload" aria-label="Bulk upload"/>
        <label for="bulk-upload" class="btn btn-outline">Browse Files</label>
        @if (uploadedPreviews().length > 0) {
          <div class="upload-previews">
            @for (p of uploadedPreviews(); track $index) {
              <img [src]="p" alt="Preview" class="upload-preview-img" loading="lazy"/>
            }
          </div>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-row">
          <div class="spinner"></div><span>Loading products...</span>
        </div>
      }

      <!-- Products Table -->
      @if (!loading()) {
        <div class="table-card">
          <div class="table-wrap">
            <table class="admin-table products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products(); track product.id) {
                  <tr>
                    <td>
                      <div class="product-cell">
                        <img
                          [src]="product.images[0] || 'assets/images/women/women-1.png'"
                          [alt]="product.name"
                          class="product-thumb"
                          loading="lazy"
                        />
                        <div>
                          <span class="product-name">{{ product.name }}</span>
                          <span class="product-sku">{{ product.sku }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="cat-badge cat-{{ product.categoryName.toLowerCase() }}">
                        {{ product.categoryName }}
                      </span>
                    </td>
                    <td>PKR {{ product.price | number }}</td>
                    <td>
                      <span [class]="getStockClass(product.stock)">{{ product.stock }}</span>
                    </td>
                    <td>
                      <span class="status-dot" [class]="product.isActive ? 'status-active' : 'status-inactive'">
                        {{ product.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-btns">
                        <button class="icon-btn" (click)="editProduct(product)" aria-label="Edit">
                          <app-icon name="edit" [size]="16"/>
                        </button>
                        <button
                          class="icon-btn stock-toggle-btn"
                          [class.stock-toggle-btn--out]="!product.isInStock"
                          (click)="toggleStock(product)"
                          [attr.aria-label]="product.isInStock ? 'Mark out of stock' : 'Mark in stock'"
                          [title]="product.isInStock ? 'Mark Out of Stock' : 'Mark In Stock'"
                        >
                          <app-icon [name]="product.isInStock ? 'check' : 'close'" [size]="14"/>
                          <span class="stock-btn-label">{{ product.isInStock ? 'In Stock' : 'Out of Stock' }}</span>
                        </button>
                        <button class="icon-btn icon-btn--danger" (click)="deleteProduct(product.id)" aria-label="Delete">
                          <app-icon name="trash" [size]="16"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @if (products().length === 0) {
                  <tr><td colspan="6" class="empty-row">No products found.</td></tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="total-count">{{ totalCount() }} products total</span>
          </div>
        </div>
      }
    </div>

    <!-- Add / Edit Modal -->
    @if (modalOpen()) {
      <div class="overlay" (click)="modalOpen.set(false)"></div>
      <div class="admin-modal" [@modalAnim] role="dialog" aria-modal="true"
        [attr.aria-label]="editMode() ? 'Edit product' : 'Add product'">
        <div class="modal-header">
          <h2>{{ editMode() ? 'Edit Product' : 'Add New Product' }}</h2>
          <button (click)="modalOpen.set(false)" aria-label="Close">
            <app-icon name="close" [size]="20"/>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group form-full">
              <label>Product Name</label>
              <input [(ngModel)]="formProduct.name" type="text" placeholder="Enter product name"/>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="formProduct.categoryId" class="form-select">
                <option [value]="1">Women</option>
                <option [value]="2">Men</option>
              </select>
            </div>
            <div class="form-group">
              <label>Price (PKR)</label>
              <input [(ngModel)]="formProduct.price" type="number" placeholder="0"/>
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input [(ngModel)]="formProduct.stock" type="number" placeholder="0"/>
            </div>
            <div class="form-group">
              <label>Sub Category</label>
              <input [(ngModel)]="formProduct.subCategory" type="text" placeholder="e.g. Formal"/>
            </div>
            <div class="form-group">
              <label>SKU</label>
              <input [(ngModel)]="formProduct.sku" type="text" placeholder="e.g. WF-001"/>
            </div>
            <div class="form-group form-full">
              <label>Description</label>
              <textarea [(ngModel)]="formProduct.description" rows="3" placeholder="Product description..."></textarea>
            </div>
            <div class="form-group form-full">
              <label>Sizes (comma-separated)</label>
              <input [(ngModel)]="formProduct.sizesStr" type="text" placeholder="XS,S,M,L,XL"/>
            </div>
            <div class="form-group">
              <label class="check-label">
                <input type="checkbox" [(ngModel)]="formProduct.isNew"/>
                Mark as New
              </label>
            </div>
            <div class="form-group">
              <label class="check-label">
                <input type="checkbox" [(ngModel)]="formProduct.isFeatured"/>
                Featured Product
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="modalOpen.set(false)">Cancel</button>
          <button class="btn btn-primary" (click)="saveProduct()">
            {{ editMode() ? 'Save Changes' : 'Add Product' }}
          </button>
        </div>
      </div>
    }

    <!-- Delete Confirm Modal -->
    @if (deleteId() !== null) {
      <div class="overlay" (click)="deleteId.set(null)"></div>
      <div class="admin-modal admin-modal--sm" [@modalAnim] role="alertdialog"
        aria-modal="true" aria-label="Confirm delete">
        <div class="modal-header">
          <h2>Delete Product?</h2>
        </div>
        <div class="modal-body">
          <p>This action cannot be undone. The product will be deactivated.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="deleteId.set(null)">Cancel</button>
          <button class="btn btn-dark" (click)="confirmDelete()">Delete</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-section {}
    .section-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
    .admin-page-title { font-family:var(--font-heading); font-size:var(--text-4xl); font-weight:400; }
    .section-actions { display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; }
    .search-box { display:flex; align-items:center; gap:0.5rem; border:1px solid var(--gray-200); background:var(--cream-light); padding:0.5rem 0.875rem; .search-ico{color:var(--gray-400);} }
    .admin-search-input { border:none; background:none; font-size:0.875rem; color:var(--black); outline:none; width:200px; &::placeholder{color:var(--gray-400);} }
    .upload-zone { border:2px dashed var(--gray-300); padding:2rem; text-align:center; margin-bottom:1.5rem; transition:all 0.3s; &.drag-over{border-color:var(--gold);background:rgba(201,168,76,0.04);} }
    .upload-icon { color:var(--gold); margin:0 auto 0.75rem; }
    .upload-text { font-weight:500; margin-bottom:0.25rem; }
    .upload-sub { font-size:0.8125rem; color:var(--gray-400); margin-bottom:1rem; }
    .upload-input { display:none; }
    .upload-previews { display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:center; margin-top:1rem; }
    .upload-preview-img { width:80px; height:100px; object-fit:cover; border:2px solid var(--gold); }
    .loading-row { display:flex; align-items:center; gap:1rem; padding:2rem; color:var(--gray-400); }
    .spinner { width:24px; height:24px; border:2px solid var(--gray-200); border-top-color:var(--gold); border-radius:50%; animation:spin 0.7s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg);} }
    .table-card { background:var(--cream-light); border:1px solid var(--gray-200); overflow:hidden; }
    .table-wrap { overflow-x:auto; }
    .products-table { width:100%; }
    .product-cell { display:flex; align-items:center; gap:0.75rem; }
    .product-thumb { width:48px; height:60px; object-fit:cover; object-position:top center; flex-shrink:0; }
    .product-name { display:block; font-size:0.875rem; font-weight:500; }
    .product-sku { display:block; font-size:0.7rem; color:var(--gray-400); letter-spacing:0.08em; }
    .cat-badge { padding:0.2rem 0.625rem; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; &.cat-women{background:rgba(233,30,99,0.1);color:#880E4F;} &.cat-men{background:rgba(26,26,26,0.08);color:var(--black);} }
    .stock-badge { padding:0.2rem 0.625rem; font-size:0.75rem; font-weight:600; }
    .stock-ok{background:rgba(76,175,80,0.12);color:#388E3C;}
    .stock-low{background:rgba(255,152,0,0.15);color:#E65100;}
    .stock-out{background:rgba(229,57,53,0.12);color:#C62828;}
    .status-dot { font-size:0.75rem; font-weight:600; display:flex; align-items:center; gap:0.35rem; &::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor;} &.status-active{color:#388E3C;} &.status-inactive{color:#C62828;} }
    .action-btns { display:flex; gap:0.375rem; align-items:center; flex-wrap:wrap; }
    .icon-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:none; border:1px solid var(--gray-200); cursor:pointer; color:var(--gray-400); transition:all 0.2s; &:hover{border-color:var(--gold);color:var(--gold);} &--danger:hover{border-color:var(--black);color:var(--black);} }
    .stock-toggle-btn {
      width: auto; padding: 0 0.625rem; gap: 0.3rem; font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      background: rgba(76,175,80,0.1); border-color: rgba(76,175,80,0.4); color: #388E3C;
      &:hover { background: rgba(76,175,80,0.18); border-color: #4CAF50; color: #2e7d32; }
      &--out {
        background: rgba(229,57,53,0.1); border-color: rgba(229,57,53,0.4); color: #C62828;
        &:hover { background: rgba(229,57,53,0.18); border-color: #E53935; color: #b71c1c; }
      }
    }
    .stock-btn-label { white-space: nowrap; }
    .empty-row { text-align:center; padding:2rem; color:var(--gray-400); }
    .table-footer { padding:0.75rem 1rem; border-top:1px solid var(--gray-200); font-size:0.8125rem; color:var(--gray-400); }
    .total-count {}
    .admin-modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:var(--cream-light); z-index:var(--z-modal); width:90%; max-width:560px; max-height:90vh; overflow-y:auto; border:1px solid var(--gray-200); box-shadow:var(--shadow-xl); &--sm{max-width:400px;} }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid var(--gray-200); h2{font-family:var(--font-heading);font-size:var(--text-2xl);} button{background:none;border:none;cursor:pointer;color:var(--black);} }
    .modal-body { padding:1.5rem; p{font-size:0.875rem;color:var(--gray-500);} }
    .modal-footer { padding:1rem 1.5rem; border-top:1px solid var(--gray-200); display:flex; justify-content:flex-end; gap:0.75rem; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .form-full { grid-column:1/-1; }
    .form-select { width:100%; padding:0.625rem 0.875rem; border:1px solid var(--gray-300); background:var(--cream); font-size:0.875rem; outline:none; &:focus{border-color:var(--gold);} }
    .check-label { display:flex; align-items:center; gap:0.5rem; cursor:pointer; font-size:0.875rem; }
  `]
})
export class AdminProductsComponent implements OnInit {
  private productApi = inject(ProductApiService);
  private toast      = inject(ToastService);

  products         = signal<ApiProduct[]>([]);
  loading          = signal(false);
  totalCount       = signal(0);
  dragOver         = false;
  uploadedPreviews = signal<string[]>([]);
  modalOpen        = signal(false);
  editMode         = signal(false);
  deleteId         = signal<number | null>(null);
  searchTerm       = '';

  formProduct: any = {
    name: '', categoryId: 1, price: 0, stock: 10, description: '',
    subCategory: '', sku: '', sizesStr: 'S,M,L,XL', isNew: false, isFeatured: false
  };

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.loading.set(true);
    this.productApi.getAll({ search: this.searchTerm || undefined, pageSize: 50 }).subscribe({
      next: res => {
        this.products.set(res.items);
        this.totalCount.set(res.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load products.');
      }
    });
  }

  getStockClass(stock: number): string {
    if (stock > 10) return 'stock-badge stock-ok';
    if (stock > 0)  return 'stock-badge stock-low';
    return 'stock-badge stock-out';
  }

  onSearch() { this.loadProducts(); }

  openAddModal() {
    this.editMode.set(false);
    this.formProduct = {
      name: '', categoryId: 1, price: 0, stock: 10, description: '',
      subCategory: '', sku: '', sizesStr: 'S,M,L,XL', isNew: false, isFeatured: false
    };
    this.modalOpen.set(true);
  }

  editProduct(p: ApiProduct) {
    this.editMode.set(true);
    this.formProduct = {
      ...p,
      categoryId: p.categoryId,
      sizesStr:   p.sizes?.join(',') || 'S,M,L,XL'
    };
    this.modalOpen.set(true);
  }

  saveProduct() {
    const sizes = String(this.formProduct.sizesStr || 'S,M,L,XL')
      .split(',').map((s: string) => s.trim()).filter(Boolean);

    const payload = {
      name:        this.formProduct.name?.trim() || 'New Product',
      description: this.formProduct.description  || '',
      price:       +this.formProduct.price        || 0,
      categoryId:  +this.formProduct.categoryId   || 1,
      subCategory: this.formProduct.subCategory   || '',
      sku:         this.formProduct.sku           || '',
      stock:       +this.formProduct.stock        || 0,
      sizes,
      colors:  this.formProduct.colors  || [],
      images:  this.formProduct.images?.length ? this.formProduct.images : [],
      tags:    this.formProduct.tags    || [],
      isNew:       !!this.formProduct.isNew,
      isFeatured:  !!this.formProduct.isFeatured,
      isActive:    true
    };

    if (this.editMode() && this.formProduct.id) {
      this.productApi.update(this.formProduct.id, payload).subscribe({
        next: () => { this.toast.success('Product updated'); this.modalOpen.set(false); this.loadProducts(); },
        error: () => this.toast.error('Failed to update product.')
      });
    } else {
      this.productApi.create(payload).subscribe({
        next: () => { this.toast.success('Product added'); this.modalOpen.set(false); this.loadProducts(); },
        error: () => this.toast.error('Failed to add product.')
      });
    }
  }

  deleteProduct(id: number) { this.deleteId.set(id); }

  toggleStock(product: ApiProduct) {
    this.productApi.toggleStock(product.id).subscribe({
      next: (res) => {
        // Update product in list without full reload
        this.products.update(list =>
          list.map(p => p.id === product.id ? { ...p, isInStock: res.isInStock } : p)
        );
        this.toast.success(res.isInStock ? `"${product.name}" marked In Stock` : `"${product.name}" marked Out of Stock`);
      },
      error: () => this.toast.error('Failed to update stock status.')
    });
  }

  confirmDelete() {
    const id = this.deleteId();
    if (id !== null) {
      this.productApi.delete(id).subscribe({
        next: () => {
          this.toast.info('Product deleted');
          this.deleteId.set(null);
          this.loadProducts();
        },
        error: () => this.toast.error('Failed to delete product.')
      });
    }
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.dragOver = true; }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver = false;
    this.processFiles(Array.from(e.dataTransfer?.files || []));
  }

  onFileSelect(e: Event) {
    this.processFiles(Array.from((e.target as HTMLInputElement).files || []));
  }

  private processFiles(files: File[]) {
    const imgs = files.filter(f => f.type.startsWith('image/'));
    imgs.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => this.uploadedPreviews.update(p => [...p, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    if (imgs.length) this.toast.success(`${imgs.length} image(s) ready for upload`);
  }
}
