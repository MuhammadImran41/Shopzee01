import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SvgIconsComponent } from '../../../../shared/components/svg-icons/svg-icons.component';
import { ThemeService, DEFAULT_THEME, ThemeColors } from '../../../../core/services/theme.service';
import { SiteImagesService, DEFAULT_IMAGES, HomeImages } from '../../../../core/services/site-images.service';
import { ToastService } from '../../../../core/services/toast.service';
import { API_BASE } from '../../../../core/services/api/api.config';

interface ImageSection {
  key:         keyof HomeImages;
  label:       string;
  desc:        string;
  badge:       string;
  type:        string;
  size:        string;
  aspectRatio: 'wide' | 'tall' | 'square';
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconsComponent],
  template: `
    <div class="admin-section">

      <!-- Page Header -->
      <div class="section-top">
        <div>
          <h1 class="admin-page-title">Settings</h1>
          <p class="admin-page-sub">Manage credentials, theme, and home page images</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="settings-tabs">
        <button class="stab" [class.active]="tab() === 'credentials'" (click)="tab.set('credentials')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Admin Credentials
        </button>
        <button class="stab" [class.active]="tab() === 'theme'" (click)="tab.set('theme')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          Theme Changer
        </button>
        <button class="stab" [class.active]="tab() === 'images'" (click)="tab.set('images')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Image Changer
        </button>
      </div>

      <!-- ══ TAB: CREDENTIALS ══════════════════════════════ -->
      @if (tab() === 'credentials') {
        <div class="settings-card">
          <div class="sc-header">
            <h2>Admin Credentials</h2>
            <p>Change your admin email address or password.</p>
          </div>
          <div class="sc-body">
            <div class="form-row">
              <div class="form-group">
                <label>Current Password <span class="req">*</span></label>
                <input type="password" [(ngModel)]="creds.currentPassword" placeholder="Your current password"/>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>New Email Address</label>
                <input type="email" [(ngModel)]="creds.newEmail" placeholder="Leave blank to keep current"/>
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input type="password" [(ngModel)]="creds.newPassword" placeholder="Leave blank to keep current"/>
              </div>
            </div>
            @if (credError()) { <p class="err-msg">{{ credError() }}</p> }
            @if (credSuccess()) { <p class="success-msg">✓ {{ credSuccess() }}</p> }
            <button class="btn btn-primary save-btn" (click)="saveCredentials()" [disabled]="credLoading()">
              @if (credLoading()) { Saving... } @else { Save Credentials }
            </button>
          </div>
        </div>
      }

      <!-- ══ TAB: THEME CHANGER ════════════════════════════ -->
      @if (tab() === 'theme') {
        <div class="settings-card">
          <div class="sc-header">
            <h2>Theme Changer</h2>
            <p>Change the color palette of the entire website. Changes apply instantly.</p>
          </div>
          <div class="sc-body">

            <!-- Live Preview -->
            <div class="theme-preview" [style.--preview-gold]="themeColors['--gold']" [style.--preview-black]="themeColors['--black']" [style.--preview-cream]="themeColors['--cream']">
              <div class="preview-navbar" [style.background]="themeColors['--black']">
                <div class="preview-logo" [style.color]="themeColors['--gold']">STYLEMAKER</div>
                <div class="preview-nav-links">
                  <span [style.color]="themeColors['--cream']">Home</span>
                  <span [style.color]="themeColors['--cream']">Women</span>
                  <span [style.color]="themeColors['--cream']">Men</span>
                </div>
              </div>
              <div class="preview-hero" [style.background]="themeColors['--cream']">
                <div class="preview-title" [style.color]="themeColors['--black']">Timeless Elegance</div>
                <div class="preview-btn" [style.background]="themeColors['--gold']" [style.color]="themeColors['--black']">Shop Now</div>
              </div>
              <div class="preview-card" [style.background]="themeColors['--black']">
                <div class="preview-card-cat" [style.color]="themeColors['--gold']">FORMAL</div>
                <div class="preview-card-name" [style.color]="themeColors['--cream']">Embroidered Suit</div>
                <div class="preview-card-price" [style.color]="themeColors['--gold-light']">PKR 12,500</div>
              </div>
            </div>

            <!-- Color Pickers -->
            <div class="color-grid">
              @for (c of colorFields; track c.key) {
                <div class="color-field">
                  <label class="cf-label">{{ c.label }}</label>
                  <div class="cf-input-wrap">
                    <input type="color" [ngModel]="themeColors[c.key]" (ngModelChange)="onColorChange(c.key, $event)" class="color-picker" [id]="'cp-'+c.key"/>
                    <input type="text" [ngModel]="themeColors[c.key]" (ngModelChange)="onColorChange(c.key, $event)" class="color-hex" placeholder="#000000" maxlength="7"/>
                  </div>
                  <p class="cf-desc">{{ c.desc }}</p>
                </div>
              }
            </div>

            <div class="theme-actions">
              <button class="btn btn-primary save-btn" (click)="saveTheme()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13"/><polyline points="7 3 7 8 15 8"/></svg>
                Apply & Save Theme
              </button>
              <button class="btn btn-ghost" (click)="resetTheme()">Reset to Default</button>
            </div>
            @if (themeSuccess()) { <p class="success-msg" style="margin-top:0.75rem">✓ {{ themeSuccess() }}</p> }
          </div>
        </div>
      }

      <!-- ══ TAB: IMAGE CHANGER ════════════════════════════ -->
      @if (tab() === 'images') {
        <div class="settings-card">
          <div class="sc-header">
            <h2>Image Changer</h2>
            <p>Upload a new image for any home page section. Image is applied instantly with the same size and responsiveness.</p>
          </div>
          <div class="sc-body">

            <div class="img-sections-list">
              @for (section of imageSections; track section.key) {
                <div class="img-section-row" [class.img-uploading]="uploadingKey() === section.key">

                  <!-- Left: Preview -->
                  <div class="isr-preview-wrap">
                    <div class="isr-preview" [class.isr-wide]="section.aspectRatio === 'wide'" [class.isr-tall]="section.aspectRatio === 'tall'">
                      <img [src]="siteImages.getImage(section.key)" [alt]="section.label" loading="lazy"/>
                      @if (uploadingKey() === section.key) {
                        <div class="isr-loading"><div class="spinner"></div></div>
                      }
                      @if (uploadedKeys().includes(section.key)) {
                        <div class="isr-done">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Right: Info + Actions -->
                  <div class="isr-info">
                    <div class="isr-badge">{{ section.badge }}</div>
                    <h3 class="isr-title">{{ section.label }}</h3>
                    <p class="isr-desc">{{ section.desc }}</p>
                    <div class="isr-meta">
                      <span class="isr-tag">{{ section.type }}</span>
                      <span class="isr-size">{{ section.size }}</span>
                    </div>
                    <div class="isr-actions">
                      <label class="btn btn-primary isr-upload-btn" [for]="'img-' + section.key">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload New Image
                      </label>
                      @if (uploadedKeys().includes(section.key) || !section.key.includes('default')) {
                        <button class="btn btn-ghost isr-reset-btn" (click)="resetImage(section.key)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                          Reset
                        </button>
                      }
                    </div>
                  </div>

                  <input type="file" [id]="'img-' + section.key" accept="image/*" class="hidden-input" (change)="onImageUpload($event, section.key)"/>
                </div>
              }
            </div>

            <div class="image-actions" style="margin-top:1.5rem">
              <button class="btn btn-ghost" (click)="resetAllImages()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                Reset All Images to Default
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .admin-page-sub { font-size:0.875rem; color:var(--gray-400); margin-top:0.25rem; }

    /* Tabs */
    .settings-tabs { display:flex; gap:0; border-bottom:1px solid var(--gray-200); margin-bottom:1.75rem; flex-wrap:wrap; }
    .stab {
      display:flex; align-items:center; gap:0.5rem;
      padding:0.75rem 1.25rem; background:none; border:none; cursor:pointer;
      font-size:0.8125rem; font-weight:600; letter-spacing:0.05em; color:var(--gray-400);
      border-bottom:2px solid transparent; margin-bottom:-1px; transition:all 0.2s;
      svg { stroke:currentColor; }
      &:hover { color:var(--black); }
      &.active { color:var(--gold-dark); border-bottom-color:var(--gold); }
    }

    /* Card */
    .settings-card { background:var(--cream-light); border:1px solid var(--gray-200); }
    .sc-header { padding:1.5rem 1.75rem; border-bottom:1px solid var(--gray-200); h2{font-family:var(--font-heading);font-size:1.5rem;font-weight:400;} p{font-size:0.875rem;color:var(--gray-400);margin-top:0.25rem;} }
    .sc-body { padding:1.75rem; }

    /* Form */
    .form-row { margin-bottom:1rem; }
    .form-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; @media(max-width:600px){grid-template-columns:1fr;} }
    .form-group { display:flex; flex-direction:column; gap:0.375rem; label{font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--black);} input{padding:0.75rem 1rem;border:1px solid var(--gray-300);background:var(--cream);font-size:0.9rem;outline:none;&:focus{border-color:var(--gold);}}}
    .req { color:var(--gold-dark); }
    .err-msg { color:#E53935; font-size:0.8125rem; background:rgba(229,57,53,0.08); padding:0.5rem 0.75rem; margin-bottom:0.875rem; }
    .success-msg { color:#2e7d32; font-size:0.8125rem; background:rgba(76,175,80,0.08); padding:0.5rem 0.75rem; margin-bottom:0.875rem; }
    .save-btn { padding:0.875rem 2rem; }

    /* Theme Preview */
    .theme-preview {
      background:var(--gray-100); border:1px solid var(--gray-200); padding:1rem;
      margin-bottom:1.75rem; border-radius:4px; overflow:hidden;
    }
    .preview-navbar { padding:0.75rem 1.25rem; display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem; }
    .preview-logo { font-family:var(--font-heading); font-size:1rem; letter-spacing:0.2em; font-weight:600; }
    .preview-nav-links { display:flex; gap:1rem; font-size:0.75rem; opacity:0.8; }
    .preview-hero { padding:1.5rem; display:flex; align-items:center; gap:1.5rem; margin-bottom:0.5rem; }
    .preview-title { font-family:var(--font-heading); font-size:1.25rem; font-weight:400; }
    .preview-btn { font-size:0.65rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; padding:0.5rem 1rem; }
    .preview-card { padding:1rem 1.25rem; display:flex; flex-direction:column; gap:0.25rem; }
    .preview-card-cat { font-size:0.6rem; font-weight:700; letter-spacing:0.2em; }
    .preview-card-name { font-family:var(--font-heading); font-size:0.9rem; }
    .preview-card-price { font-size:0.875rem; font-weight:700; }

    /* Color Grid */
    .color-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; @media(max-width:900px){grid-template-columns:repeat(2,1fr);} @media(max-width:480px){grid-template-columns:1fr 1fr;} }
    .color-field { display:flex; flex-direction:column; gap:0.375rem; }
    .cf-label { font-size:0.7rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--black); }
    .cf-input-wrap { display:flex; align-items:center; gap:0.5rem; border:1px solid var(--gray-300); padding:0.375rem 0.625rem; background:var(--cream); }
    .color-picker { width:36px; height:28px; padding:0; border:none; cursor:pointer; background:none; flex-shrink:0; }
    .color-hex { flex:1; border:none; background:none; font-size:0.8125rem; font-family:monospace; color:var(--black); outline:none; min-width:0; }
    .cf-desc { font-size:0.7rem; color:var(--gray-400); line-height:1.4; }
    .theme-actions { display:flex; gap:0.875rem; align-items:center; flex-wrap:wrap; }

    /* Images List — row layout */
    .img-sections-list { display:flex; flex-direction:column; gap:1px; background:var(--gray-200); border:1px solid var(--gray-200); }

    .img-section-row {
      display:grid; grid-template-columns:280px 1fr; gap:0;
      background:var(--cream-light); transition:background 0.2s;
      &:hover { background:var(--cream); }
      @media(max-width:700px) { grid-template-columns:160px 1fr; }
      @media(max-width:480px) { grid-template-columns:1fr; }
    }

    .isr-preview-wrap { overflow:hidden; background:var(--cream-dark); }

    .isr-preview {
      position:relative; width:100%; height:180px; overflow:hidden;
      img { width:100%; height:100%; object-fit:cover; object-position:center top; display:block; }
      &.isr-wide img { object-position:center center; }
      &.isr-tall img { object-position:top center; }
      @media(max-width:480px) { height:220px; }
    }

    .isr-loading { position:absolute; inset:0; background:rgba(26,26,26,0.6); display:flex; align-items:center; justify-content:center; }
    .isr-done { position:absolute; top:0.5rem; right:0.5rem; width:28px; height:28px; border-radius:50%; background:#4CAF50; display:flex; align-items:center; justify-content:center; }

    .spinner { width:32px; height:32px; border:3px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg);} }

    .isr-info {
      padding:1.25rem 1.5rem; display:flex; flex-direction:column; justify-content:center; gap:0.5rem;
      border-left:1px solid var(--gray-200);
      @media(max-width:480px) { border-left:none; border-top:1px solid var(--gray-200); }
    }

    .isr-badge {
      display:inline-block; font-size:0.6rem; font-weight:800; letter-spacing:0.2em;
      text-transform:uppercase; color:var(--black); background:var(--gold);
      padding:0.2rem 0.625rem; align-self:flex-start;
    }

    .isr-title { font-family:var(--font-heading); font-size:1.0625rem; font-weight:500; color:var(--black); }
    .isr-desc { font-size:0.8125rem; color:var(--gray-500); line-height:1.6; }

    .isr-meta { display:flex; gap:0.625rem; flex-wrap:wrap; }
    .isr-tag { font-size:0.65rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:var(--black); color:var(--gold); padding:0.2rem 0.625rem; }
    .isr-size { font-size:0.7rem; color:var(--gray-400); padding:0.2rem 0; }

    .isr-actions { display:flex; gap:0.625rem; flex-wrap:wrap; margin-top:0.25rem; }
    .isr-upload-btn { display:inline-flex; align-items:center; gap:0.4rem; font-size:0.75rem; padding:0.6rem 1rem; cursor:pointer; }
    .isr-reset-btn { display:inline-flex; align-items:center; gap:0.35rem; font-size:0.75rem; padding:0.6rem 0.875rem; }

    .img-uploading { opacity:0.7; pointer-events:none; }
    .hidden-input { display:none; }
    .image-actions { border-top:1px solid var(--gray-200); padding-top:1rem; }
  `]
})
export class AdminSettingsComponent {
  private themeService = inject(ThemeService);
  siteImages           = inject(SiteImagesService);
  private toast        = inject(ToastService);
  private http         = inject(HttpClient);

  tab = signal<'credentials' | 'theme' | 'images'>('credentials');

  // ── Credentials ──────────────────────────────────────────
  creds       = { currentPassword: '', newEmail: '', newPassword: '' };
  credLoading = signal(false);
  credError   = signal('');
  credSuccess = signal('');

  saveCredentials() {
    if (!this.creds.currentPassword) { this.credError.set('Current password is required.'); return; }
    if (!this.creds.newEmail && !this.creds.newPassword) {
      this.credError.set('Enter a new email or new password.'); return;
    }
    this.credLoading.set(true);
    this.credError.set('');
    this.credSuccess.set('');
    this.http.post<any>(`${API_BASE}/settings/admin-credentials`, {
      currentPassword: this.creds.currentPassword,
      newEmail:        this.creds.newEmail || null,
      newPassword:     this.creds.newPassword || null
    }).subscribe({
      next: (res) => {
        this.credSuccess.set(res.message);
        this.credLoading.set(false);
        this.creds = { currentPassword: '', newEmail: '', newPassword: '' };
      },
      error: (err) => {
        this.credError.set(err.error?.message || 'Failed to update credentials.');
        this.credLoading.set(false);
      }
    });
  }

  // ── Theme ─────────────────────────────────────────────────
  themeColors: ThemeColors = this.themeService.getCurrent();
  themeSuccess = signal('');

  colorFields: { key: keyof ThemeColors; label: string; desc: string }[] = [
    { key: '--gold',        label: 'Primary Gold',    desc: 'Main accent color — buttons, prices, icons' },
    { key: '--gold-light',  label: 'Gold Light',      desc: 'Lighter gold — hover states, badges' },
    { key: '--gold-dark',   label: 'Gold Dark',       desc: 'Darker gold — active states, links' },
    { key: '--black',       label: 'Primary Black',   desc: 'Navbar, product cards background' },
    { key: '--cream',       label: 'Cream',           desc: 'Main background color' },
    { key: '--cream-light', label: 'Cream Light',     desc: 'Cards, forms background' },
    { key: '--cream-dark',  label: 'Cream Dark',      desc: 'Skeleton, hover backgrounds' },
  ];

  onColorChange(key: keyof ThemeColors, value: string) {
    this.themeColors = { ...this.themeColors, [key]: value };
    // Live preview — apply instantly
    this.themeService.apply({ [key]: value });
  }

  saveTheme() {
    this.themeService.save(this.themeColors);
    this.themeSuccess.set('Theme applied and saved successfully!');
    this.toast.success('Theme updated!');
    setTimeout(() => this.themeSuccess.set(''), 3000);
  }

  resetTheme() {
    this.themeColors = { ...DEFAULT_THEME };
    this.themeService.reset();
    this.themeSuccess.set('Theme reset to default.');
    this.toast.info('Theme reset to default.');
    setTimeout(() => this.themeSuccess.set(''), 3000);
  }

  // ── Images ────────────────────────────────────────────────
  uploadingKey = signal<string | null>(null);
  uploadedKeys = signal<string[]>([]);

  imageSections: ImageSection[] = [
    {
      key: 'hero-bg',
      label: 'Hero Section — Background',
      desc: 'Full-page background of the home page hero. "Timeless Elegance" section.',
      badge: 'Section 1 — Hero',
      type: 'Section Background',
      size: 'Recommended: 1920×1080px or wider',
      aspectRatio: 'wide'
    },
    {
      key: 'women-3',
      label: 'Women\'s Collection — Feature Image',
      desc: 'Left photo in "Her Story Begins Here" split section.',
      badge: 'Section 2 — Women Feature',
      type: 'Section Feature Image (Left Side)',
      size: 'Recommended: 800×1000px (portrait)',
      aspectRatio: 'tall'
    },
    {
      key: 'men-2',
      label: 'Men\'s Collection — Feature Image',
      desc: 'Left photo in "Crafted for the Modern Man" split section.',
      badge: 'Section 3 — Men Feature',
      type: 'Section Feature Image (Left Side)',
      size: 'Recommended: 800×1000px (portrait)',
      aspectRatio: 'tall'
    },
    {
      key: 'women-7',
      label: 'Full-Width Banner — Background',
      desc: 'Large banner showing "New Collection 2026" between Men\'s Picks and Newsletter.',
      badge: 'Section 4 — Banner',
      type: 'Banner Background (Full Width)',
      size: 'Recommended: 1920×700px (landscape)',
      aspectRatio: 'wide'
    },
  ];

  onImageUpload(event: Event, key: keyof HomeImages) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { this.toast.error('Image too large. Max 5MB.'); return; }

    this.uploadingKey.set(key);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      this.siteImages.saveImage(key, dataUrl);
      this.uploadingKey.set(null);
      this.uploadedKeys.update(keys => [...new Set([...keys, key])]);
      this.toast.success(`${this.imageSections.find(s => s.key === key)?.label} updated!`);
      // Clear input so same file can be re-selected
      (event.target as HTMLInputElement).value = '';
    };
    reader.readAsDataURL(file);
  }

  resetImage(key: keyof HomeImages) {
    this.siteImages.resetImage(key);
    this.uploadedKeys.update(keys => keys.filter(k => k !== key));
    this.toast.info('Image reset to default.');
  }

  resetAllImages() {
    this.siteImages.resetAll();
    this.uploadedKeys.set([]);
    this.toast.info('All images reset to default.');
  }
}
