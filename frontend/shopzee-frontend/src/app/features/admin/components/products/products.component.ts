import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService, ApiProduct } from '../../../../core/services/api/product-api.service';
import { SvgIconsComponent } from '../../../../shared/components/svg-icons/svg-icons.component';
import { SafeUrlPipe } from '../../../../shared/pipes/safe-url.pipe';
import { ToastService } from '../../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconsComponent, SafeUrlPipe],
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
                          [src]="product.images[0] || 'assets/images/women/women-1.png' | safeUrl"
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

            <!-- Product Images Upload -->
            <div class="form-group form-full">
              <label>Product Images</label>
              <div
                class="img-upload-zone"
                [class.drag-over]="imgDragOver"
                (dragover)="onImgDragOver($event)"
                (dragleave)="imgDragOver = false"
                (drop)="onImgDrop($event)"
              >
                @if (formProduct.images?.length) {
                  <div class="img-preview-list">
                    @for (img of formProduct.images; track $index) {
                      <div class="img-preview-item">
                        <img [src]="img" alt="Product image" class="img-preview-thumb"/>
                        <button class="img-remove-btn" (click)="removeImage($index)" aria-label="Remove image" type="button">
                          <app-icon name="close" [size]="10"/>
                        </button>
                      </div>
                    }
                    <label class="img-add-more" for="modal-img-upload" title="Add more images">
                      <app-icon name="plus" [size]="20"/>
                    </label>
                  </div>
                } @else {
                  <app-icon name="upload" [size]="28" class="upload-icon"/>
                  <p class="upload-text">Drag & drop or click to upload</p>
                  <p class="upload-sub">PNG, JPG up to 10MB each</p>
                  <label for="modal-img-upload" class="btn btn-outline" style="cursor:pointer">Browse Files</label>
                }
                <input type="file" multiple accept="image/*" class="upload-input"
                  (change)="onImgFileSelect($event)" id="modal-img-upload" aria-label="Upload product images"/>
              </div>
            </div>

            <!-- Name -->
            <div class="form-group form-full">
              <label>Product Name</label>
              <input [(ngModel)]="formProduct.name" type="text" placeholder="Enter product name"
                (ngModelChange)="onNameChange($event)"/>
            </div>

            <!-- Category -->
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="formProduct.categoryId" class="form-select"
                (ngModelChange)="onCategoryChange($event)">
                <option [value]="1">Women</option>
                <option [value]="2">Men</option>
              </select>
            </div>

            <!-- SKU (auto-generated but editable) -->
            <div class="form-group">
              <label>SKU <span class="sku-auto-label">(auto-generated)</span></label>
              <div class="sku-field">
                <input [(ngModel)]="formProduct.sku" type="text" placeholder="e.g. WF-001"/>
                <button class="sku-regen-btn" type="button" (click)="regenSku()" title="Re-generate SKU">
                  ↻
                </button>
              </div>
            </div>

            <!-- Price -->
            <div class="form-group">
              <label>Price (PKR)</label>
              <input [(ngModel)]="formProduct.price" type="number" placeholder="0"/>
            </div>

            <!-- Stock -->
            <div class="form-group">
              <label>Stock</label>
              <input [(ngModel)]="formProduct.stock" type="number" placeholder="0"/>
            </div>

            <!-- Sub Category -->
            <div class="form-group">
              <label>Sub Category</label>
              <input [(ngModel)]="formProduct.subCategory" type="text" placeholder="e.g. Formal"/>
            </div>

            <!-- Sizes -->
            <div class="form-group">
              <label>Sizes (comma-separated)</label>
              <input [(ngModel)]="formProduct.sizesStr" type="text" placeholder="XS,S,M,L,XL"/>
            </div>

            <!-- Colors -->
            <div class="form-group form-full">
              <label>Colors</label>
              <div class="colors-row">
                @for (color of formProduct.colorsArr; track $index) {
                  <div class="color-chip">
                    <span class="color-swatch" [style.background]="color"></span>
                    <span class="color-hex">{{ color }}</span>
                    <button class="color-remove" (click)="removeColor($index)" type="button" aria-label="Remove color">×</button>
                  </div>
                }
                <div class="color-add-wrap">
                  <input
                    type="color"
                    [(ngModel)]="newColor"
                    class="color-picker-input"
                    aria-label="Pick color"
                  />
                  <button class="btn btn-outline btn-sm" type="button" (click)="addColor()">+ Add Color</button>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="form-group form-full">
              <label>Description</label>
              <textarea [(ngModel)]="formProduct.description" rows="3" placeholder="Product description..."></textarea>
            </div>

            <!-- Checkboxes -->
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
          <button class="btn btn-primary" [disabled]="saving()" (click)="saveProduct()">
            {{ saving() ? 'Saving...' : (editMode() ? 'Save Changes' : 'Add Product') }}
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

    /* Image upload zone inside modal */
    .img-upload-zone {
      border: 2px dashed var(--gray-300); padding: 1.25rem; text-align: center;
      transition: all 0.3s; background: var(--cream); min-height: 110px;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4rem;
      &.drag-over { border-color: var(--gold); background: rgba(201,168,76,0.05); }
    }
    .upload-icon { color: var(--gold); }
    .upload-text { font-size: 0.875rem; font-weight: 500; margin: 0; }
    .upload-sub { font-size: 0.775rem; color: var(--gray-400); margin: 0 0 0.5rem; }
    .upload-input { display: none; }

    /* Image previews */
    .img-preview-list { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: flex-start; width: 100%; padding: 0.25rem 0; }
    .img-preview-item { position: relative; width: 72px; height: 88px; flex-shrink: 0; }
    .img-preview-thumb { width: 72px; height: 88px; object-fit: cover; border: 2px solid var(--gold); display: block; }
    .img-remove-btn {
      position: absolute; top: -6px; right: -6px; width: 18px; height: 18px;
      background: var(--black); color: #fff; border: none; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      padding: 0; line-height: 1;
    }
    .img-add-more {
      width: 72px; height: 88px; border: 2px dashed var(--gray-300); display: flex;
      align-items: center; justify-content: center; cursor: pointer; color: var(--gray-400);
      flex-shrink: 0; transition: all 0.2s;
      &:hover { border-color: var(--gold); color: var(--gold); }
    }

    /* SKU field */
    .sku-auto-label { font-size: 0.7rem; color: var(--gray-400); font-weight: 400; margin-left: 0.25rem; }
    .sku-field { display: flex; gap: 0.4rem; align-items: stretch; }
    .sku-field input { flex: 1; }
    .sku-regen-btn {
      padding: 0 0.75rem; border: 1px solid var(--gray-300); background: var(--cream);
      cursor: pointer; font-size: 1.1rem; color: var(--gray-500); transition: all 0.2s;
      &:hover { border-color: var(--gold); color: var(--gold); }
    }

    /* Colors */
    .colors-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
    .color-chip {
      display: flex; align-items: center; gap: 0.3rem; border: 1px solid var(--gray-200);
      padding: 0.2rem 0.5rem; background: var(--cream); font-size: 0.75rem;
    }
    .color-swatch { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0; }
    .color-hex { font-size: 0.7rem; color: var(--gray-500); }
    .color-remove { background: none; border: none; cursor: pointer; color: var(--gray-400); font-size: 1rem; line-height: 1; padding: 0 0.1rem; &:hover { color: var(--black); } }
    .color-add-wrap { display: flex; align-items: center; gap: 0.4rem; }
    .color-picker-input { width: 32px; height: 32px; border: 1px solid var(--gray-300); padding: 2px; cursor: pointer; background: none; }
    .btn-sm { padding: 0.3rem 0.625rem; font-size: 0.75rem; }

    /* Table */
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

    /* Modal */
    .admin-modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:var(--cream-light); z-index:var(--z-modal); width:90%; max-width:600px; max-height:90vh; overflow-y:auto; border:1px solid var(--gray-200); box-shadow:var(--shadow-xl); &--sm{max-width:400px;} }
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
  saving           = signal(false);
  totalCount       = signal(0);
  imgDragOver      = false;
  modalOpen        = signal(false);
  editMode         = signal(false);
  deleteId         = signal<number | null>(null);
  searchTerm       = '';
  newColor         = '#C9A84C';

  formProduct: any = this.blankForm();

  private blankForm() {
    return {
      name: '', categoryId: 1, price: 0, stock: 10, description: '',
      subCategory: '', sku: '', sizesStr: 'S,M,L,XL',
      isNew: false, isFeatured: false,
      images: [] as string[],
      colorsArr: [] as string[]
    };
  }

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
    this.formProduct = this.blankForm();
    this.modalOpen.set(true);
  }

  editProduct(p: ApiProduct) {
    this.editMode.set(true);
    this.formProduct = {
      ...p,
      categoryId: p.categoryId,
      sizesStr:   p.sizes?.join(',') || 'S,M,L,XL',
      images:     [...(p.images || [])],
      colorsArr:  [...(p.colors || [])]
    };
    this.modalOpen.set(true);
  }

  // ── SKU auto-generation ──────────────────────────────────────
  onNameChange(name: string) {
    if (!this.editMode()) {
      this.formProduct.sku = this.generateSku(name, this.formProduct.categoryId);
    }
  }

  onCategoryChange(catId: number) {
    if (!this.editMode()) {
      this.formProduct.sku = this.generateSku(this.formProduct.name, catId);
    }
  }

  regenSku() {
    this.formProduct.sku = this.generateSku(this.formProduct.name, this.formProduct.categoryId);
  }

  private generateSku(name: string, categoryId: number): string {
    const prefix = +categoryId === 2 ? 'MF' : 'WF';
    const words  = (name || '').trim().split(/\s+/).filter(Boolean);
    const abbr   = words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (words[0] || 'XX').substring(0, 2).toUpperCase();
    const num    = String(Math.floor(Math.random() * 900) + 100);
    return `${prefix}-${abbr}${num}`;
  }

  // ── Color management ─────────────────────────────────────────
  addColor() {
    const c = (this.newColor || '#000000').toUpperCase();
    if (!this.formProduct.colorsArr.includes(c)) {
      this.formProduct.colorsArr = [...this.formProduct.colorsArr, c];
    }
  }

  removeColor(idx: number) {
    this.formProduct.colorsArr = this.formProduct.colorsArr.filter((_: string, i: number) => i !== idx);
  }

  // ── Image handling inside modal ──────────────────────────────
  onImgDragOver(e: DragEvent) { e.preventDefault(); this.imgDragOver = true; }

  onImgDrop(e: DragEvent) {
    e.preventDefault();
    this.imgDragOver = false;
    this.readImageFiles(Array.from(e.dataTransfer?.files || []));
  }

  onImgFileSelect(e: Event) {
    this.readImageFiles(Array.from((e.target as HTMLInputElement).files || []));
    (e.target as HTMLInputElement).value = '';
  }

  private readImageFiles(files: File[]) {
    const imgs = files.filter(f => f.type.startsWith('image/'));
    imgs.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target?.result as string;
        // Compress via canvas — max 800px wide, 80% quality
        const img = new Image();
        img.onload = () => {
          const MAX = 800;
          const scale = img.width > MAX ? MAX / img.width : 1;
          const canvas = document.createElement('canvas');
          canvas.width  = Math.round(img.width  * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.80);
          this.formProduct.images = [...(this.formProduct.images || []), compressed];
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
    if (imgs.length) this.toast.success(`${imgs.length} image(s) added`);
  }

  removeImage(idx: number) {
    this.formProduct.images = this.formProduct.images.filter((_: string, i: number) => i !== idx);
  }

  // ── Save ─────────────────────────────────────────────────────
  saveProduct() {
    if (!this.formProduct.name?.trim()) {
      this.toast.error('Product name is required.');
      return;
    }

    const sizes = String(this.formProduct.sizesStr || 'S,M,L,XL')
      .split(',').map((s: string) => s.trim()).filter(Boolean);

    const payload = {
      name:        this.formProduct.name.trim(),
      description: this.formProduct.description  || '',
      price:       +this.formProduct.price        || 0,
      categoryId:  +this.formProduct.categoryId   || 1,
      subCategory: this.formProduct.subCategory   || '',
      sku:         this.formProduct.sku           || this.generateSku(this.formProduct.name, this.formProduct.categoryId),
      stock:       +this.formProduct.stock        || 0,
      sizes,
      colors:  this.formProduct.colorsArr || [],
      images:  this.formProduct.images    || [],
      tags:    this.formProduct.tags      || [],
      isNew:       !!this.formProduct.isNew,
      isFeatured:  !!this.formProduct.isFeatured,
      isActive:    true,
      isInStock:   true
    };

    this.saving.set(true);

    if (this.editMode() && this.formProduct.id) {
      this.productApi.update(this.formProduct.id, payload).subscribe({
        next: () => {
          this.toast.success('Product updated');
          this.modalOpen.set(false);
          this.saving.set(false);
          this.loadProducts();
        },
        error: () => { this.toast.error('Failed to update product.'); this.saving.set(false); }
      });
    } else {
      this.productApi.create(payload).subscribe({
        next: () => {
          this.toast.success('Product added');
          this.modalOpen.set(false);
          this.saving.set(false);
          this.loadProducts();
        },
        error: () => { this.toast.error('Failed to add product.'); this.saving.set(false); }
      });
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  deleteProduct(id: number) { this.deleteId.set(id); }

  toggleStock(product: ApiProduct) {
    this.productApi.toggleStock(product.id).subscribe({
      next: (res) => {
        this.products.set(
          this.products().map(p =>
            p.id === product.id ? { ...p, isInStock: res.isInStock } : p
          )
        );
        this.toast.success(res.isInStock
          ? `"${product.name}" marked In Stock ✓`
          : `"${product.name}" marked Out of Stock`
        );
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
}
