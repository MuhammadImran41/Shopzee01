import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ThemeService, DEFAULT_THEME, ThemeColors } from '../../../../core/services/theme.service';
import { SiteImagesService, DEFAULT_IMAGES, HomeImages } from '../../../../core/services/site-images.service';
import { ToastService } from '../../../../core/services/toast.service';
import { API_BASE } from '../../../../core/services/api/api.config';

interface ImageSection {
  key:         keyof HomeImages;
  label:       string;
  badge:       string;
  desc:        string;
  sectionName: string;
  aspectRatio: 'wide' | 'tall';
}

interface ImageAdjust {
  objectPosition: string;  // "top center" | "center" | etc.
  zoom:           number;   // 100 = 100%
  brightness:     number;   // 100 = normal
  contrast:       number;   // 100 = normal
}

const DEFAULT_ADJUST: ImageAdjust = {
  objectPosition: 'center top',
  zoom:           100,
  brightness:     100,
  contrast:       100,
};

const ADJUST_KEY = 'STYLEMAKER_img_adjust';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-section">

      <!-- Header -->
      <div class="section-top">
        <div>
          <h1 class="admin-page-title">Settings</h1>
          <p class="sub">Manage admin credentials, site theme and home page images</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="tab()==='creds'"  (click)="tab.set('creds')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Credentials
        </button>
        <button class="tab" [class.active]="tab()==='theme'" (click)="tab.set('theme')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          Theme Changer
        </button>
        <button class="tab" [class.active]="tab()==='images'" (click)="tab.set('images')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Image Changer
        </button>
      </div>

      <!-- ═══════════ CREDENTIALS ═══════════ -->
      @if (tab() === 'creds') {
        <div class="card">
          <div class="card-head">
            <h2>Admin Credentials</h2>
            <p>Change your login email or password. Current password is required.</p>
          </div>
          <div class="card-body">
            <div class="field-group">
              <label>Current Password *</label>
              <input type="password" [(ngModel)]="creds.currentPassword" placeholder="Enter current password"/>
            </div>
            <div class="field-row">
              <div class="field-group">
                <label>New Email (optional)</label>
                <input type="email" [(ngModel)]="creds.newEmail" placeholder="Leave blank to keep current"/>
              </div>
              <div class="field-group">
                <label>New Password (optional)</label>
                <input type="password" [(ngModel)]="creds.newPassword" placeholder="Leave blank to keep current"/>
              </div>
            </div>
            @if (credErr()) { <div class="alert alert-err">{{ credErr() }}</div> }
            @if (credOk())  { <div class="alert alert-ok">✓ {{ credOk() }}</div> }
            <button class="btn-save" (click)="saveCreds()" [disabled]="credLoading()">
              {{ credLoading() ? 'Saving...' : 'Save Credentials' }}
            </button>
          </div>
        </div>
      }

      <!-- ═══════════ THEME ═══════════ -->
      @if (tab() === 'theme') {
        <div class="card">
          <div class="card-head">
            <h2>Theme Changer</h2>
            <p>Change the site-wide color palette. Live preview updates instantly as you pick colors.</p>
          </div>
          <div class="card-body">

            <!-- Live Preview -->
            <div class="theme-preview">
              <div class="tp-bar" [style.background]="tc['--black']">
                <span class="tp-logo" [style.color]="tc['--gold']">STYLEMAKER</span>
                <div class="tp-nav">
                  <span [style.color]="tc['--cream']">Women</span>
                  <span [style.color]="tc['--cream']">Men</span>
                  <span [style.color]="tc['--cream']">Sale</span>
                </div>
              </div>
              <div class="tp-hero" [style.background]="tc['--cream-dark']">
                <div>
                  <div class="tp-title" [style.color]="tc['--black']">Timeless Elegance</div>
                  <div class="tp-sub" [style.color]="tc['--black']" style="opacity:0.6">Premium Pakistani Fashion</div>
                </div>
                <div class="tp-btn" [style.background]="tc['--gold']" [style.color]="tc['--black']">Shop Now</div>
              </div>
              <div class="tp-cards">
                <div class="tp-card" [style.background]="tc['--black']">
                  <div class="tp-card-cat" [style.color]="tc['--gold']">FORMAL</div>
                  <div class="tp-card-name" [style.color]="tc['--cream']">Embroidered Suit</div>
                  <div class="tp-card-price" [style.color]="tc['--gold-light']">PKR 12,500</div>
                </div>
                <div class="tp-card" [style.background]="tc['--black']">
                  <div class="tp-card-cat" [style.color]="tc['--gold']">BRIDAL</div>
                  <div class="tp-card-name" [style.color]="tc['--cream']">Luxury Gown</div>
                  <div class="tp-card-price" [style.color]="tc['--gold-light']">PKR 28,000</div>
                </div>
              </div>
            </div>

            <!-- Color Pickers -->
            <div class="color-grid">
              @for (c of colorFields; track c.key) {
                <div class="color-item">
                  <div class="color-swatch-wrap">
                    <div class="color-swatch" [style.background]="tc[c.key]"></div>
                    <input type="color" [ngModel]="tc[c.key]" (ngModelChange)="onColor(c.key,$event)" class="color-input-hidden"/>
                  </div>
                  <div class="color-info">
                    <label>{{ c.label }}</label>
                    <div class="hex-wrap">
                      <input type="text" [ngModel]="tc[c.key]" (ngModelChange)="onColor(c.key,$event)" class="hex-input" maxlength="7" placeholder="#000000"/>
                    </div>
                    <span class="color-hint">{{ c.hint }}</span>
                  </div>
                </div>
              }
            </div>

            <div class="theme-footer">
              <button class="btn-save" (click)="saveTheme()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13"/><polyline points="7 3 7 8 15 8"/></svg>
                Apply & Save Theme
              </button>
              <button class="btn-ghost" (click)="resetTheme()">Reset to Default</button>
            </div>
            @if (themeOk()) { <div class="alert alert-ok" style="margin-top:0.75rem">✓ {{ themeOk() }}</div> }
          </div>
        </div>
      }

      <!-- ═══════════ IMAGES ═══════════ -->
      @if (tab() === 'images') {
        <div class="card">
          <div class="card-head">
            <h2>Image Changer</h2>
            <p>Upload new images for each home page section. Use the adjust panel to fine-tune position, zoom and style.</p>
          </div>
          <div class="card-body">

            <div class="img-list">
              @for (sec of imageSections; track sec.key) {
                <div class="img-row" [class.expanded]="expandedKey() === sec.key">

                  <!-- Preview col -->
                  <div class="img-preview-col" [class.img-wide]="sec.aspectRatio==='wide'">
                    <div class="img-preview-box">
                      <img
                        [src]="siteImages.getImage(sec.key)"
                        [alt]="sec.label"
                        [style.object-position]="getAdj(sec.key).objectPosition"
                        [style.transform]="'scale(' + getAdj(sec.key).zoom/100 + ')'"
                        [style.filter]="'brightness(' + getAdj(sec.key).brightness + '%) contrast(' + getAdj(sec.key).contrast + '%)'"
                        loading="lazy"
                        class="preview-img"
                      />
                      @if (uploadingKey() === sec.key) {
                        <div class="img-spinner-overlay"><div class="spinner"></div></div>
                      }
                    </div>
                  </div>

                  <!-- Info col -->
                  <div class="img-info-col">
                    <div class="img-badge">{{ sec.badge }}</div>
                    <h3 class="img-title">{{ sec.label }}</h3>
                    <p class="img-section-name">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                      {{ sec.sectionName }}
                    </p>
                    <p class="img-desc">{{ sec.desc }}</p>

                    <!-- Action buttons -->
                    <div class="img-actions">
                      <label class="btn-upload" [for]="'up-'+sec.key">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload
                      </label>

                      @if (historyMap[sec.key]?.length) {
                        <button class="btn-revert" (click)="revertImage(sec.key)" title="Revert to previous image">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                          Revert
                        </button>
                      }

                      <button class="btn-adjust" [class.btn-adjust-active]="expandedKey()===sec.key" (click)="toggleAdjust(sec.key)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
                        Adjust
                      </button>

                      <button class="btn-reset-img" (click)="resetImage(sec.key)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        Default
                      </button>

                      @if (uploadedMap[sec.key]) {
                        <span class="img-changed-badge">✓ Changed</span>
                      }
                    </div>

                    <input type="file" [id]="'up-'+sec.key" accept="image/*" class="hidden-input" (change)="onUpload($event, sec.key)"/>
                  </div>

                  <!-- Adjust Panel -->
                  @if (expandedKey() === sec.key) {
                    <div class="adjust-panel">
                      <div class="adjust-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
                        Image Adjustments — {{ sec.label }}
                      </div>

                      <div class="adjust-grid">

                        <!-- Position -->
                        <div class="adj-field">
                          <label>Image Position</label>
                          <select [(ngModel)]="adjustments[sec.key].objectPosition" (ngModelChange)="onAdjust(sec.key)" class="adj-select">
                            <option value="center top">Top Center (default for portraits)</option>
                            <option value="center center">Center (default for landscapes)</option>
                            <option value="center bottom">Bottom Center</option>
                            <option value="left top">Top Left</option>
                            <option value="right top">Top Right</option>
                            <option value="left center">Center Left</option>
                            <option value="right center">Center Right</option>
                          </select>
                          <p class="adj-hint">Controls which part of the image is visible when cropped</p>
                        </div>

                        <!-- Zoom -->
                        <div class="adj-field">
                          <label>Zoom — {{ adjustments[sec.key].zoom }}%</label>
                          <input type="range" [(ngModel)]="adjustments[sec.key].zoom" (ngModelChange)="onAdjust(sec.key)" min="80" max="150" step="1" class="adj-range"/>
                          <div class="adj-range-labels"><span>80%</span><span>100%</span><span>150%</span></div>
                          <p class="adj-hint">Scale the image larger or smaller within its frame</p>
                        </div>

                        <!-- Brightness -->
                        <div class="adj-field">
                          <label>Brightness — {{ adjustments[sec.key].brightness }}%</label>
                          <input type="range" [(ngModel)]="adjustments[sec.key].brightness" (ngModelChange)="onAdjust(sec.key)" min="60" max="140" step="1" class="adj-range"/>
                          <div class="adj-range-labels"><span>60%</span><span>100%</span><span>140%</span></div>
                          <p class="adj-hint">Make the image brighter or darker</p>
                        </div>

                        <!-- Contrast -->
                        <div class="adj-field">
                          <label>Contrast — {{ adjustments[sec.key].contrast }}%</label>
                          <input type="range" [(ngModel)]="adjustments[sec.key].contrast" (ngModelChange)="onAdjust(sec.key)" min="60" max="150" step="1" class="adj-range"/>
                          <div class="adj-range-labels"><span>60%</span><span>100%</span><span>150%</span></div>
                          <p class="adj-hint">Increase or decrease color contrast</p>
                        </div>

                      </div>

                      <div class="adjust-actions">
                        <button class="btn-save" (click)="saveAdjust(sec.key)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13"/><polyline points="7 3 7 8 15 8"/></svg>
                          Save Adjustments
                        </button>
                        <button class="btn-ghost" (click)="resetAdjust(sec.key)">Reset Adjustments</button>
                      </div>
                    </div>
                  }

                </div>
              }
            </div>

            <div class="img-footer">
              <button class="btn-ghost" (click)="resetAllImages()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                Reset All Images to Default
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .sub { font-size:0.875rem; color:var(--gray-400); margin-top:0.25rem; }

    /* ── Tabs ── */
    .tabs { display:flex; border-bottom:2px solid var(--gray-200); margin-bottom:1.75rem; gap:0; flex-wrap:wrap; }
    .tab {
      display:inline-flex; align-items:center; gap:0.5rem;
      padding:0.875rem 1.5rem; background:none; border:none; cursor:pointer;
      font-size:0.8rem; font-weight:600; letter-spacing:0.06em; color:var(--gray-400);
      border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.2s;
      svg { stroke:currentColor; }
      &:hover { color:var(--black); }
      &.active { color:var(--gold-dark); border-bottom-color:var(--gold); background:rgba(201,168,76,0.03); }
    }

    /* ── Card ── */
    .card { background:var(--cream-light); border:1px solid var(--gray-200); overflow:hidden; }
    .card-head {
      padding:1.5rem 2rem; border-bottom:1px solid var(--gray-200);
      background:linear-gradient(135deg,var(--black) 0%,#2a2010 100%);
      h2 { font-family:var(--font-heading); font-size:1.5rem; font-weight:400; color:var(--cream); }
      p  { font-size:0.8125rem; color:rgba(245,240,232,0.5); margin-top:0.25rem; }
    }
    .card-body { padding:2rem; }

    /* ── Fields ── */
    .field-group { display:flex; flex-direction:column; gap:0.375rem; margin-bottom:1rem;
      label { font-size:0.7rem; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:var(--black); }
      input { padding:0.75rem 1rem; border:1px solid var(--gray-300); background:var(--cream); font-size:0.9rem; outline:none; transition:border-color 0.2s;
        &:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,168,76,0.1); }
      }
    }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; @media(max-width:640px){grid-template-columns:1fr;} }

    .alert { padding:0.75rem 1rem; font-size:0.8125rem; margin-bottom:1rem; border-radius:2px;
      &-err { background:rgba(229,57,53,0.08); border-left:3px solid #E53935; color:#c62828; }
      &-ok  { background:rgba(46,125,50,0.08); border-left:3px solid #4CAF50; color:#2e7d32; }
    }

    /* ── Buttons ── */
    .btn-save {
      display:inline-flex; align-items:center; gap:0.5rem;
      padding:0.8125rem 1.75rem; background:var(--gold); color:var(--black);
      border:none; cursor:pointer; font-size:0.8rem; font-weight:700; letter-spacing:0.1em;
      text-transform:uppercase; transition:all 0.2s;
      &:hover { background:var(--gold-dark); }
      &:disabled { opacity:0.6; cursor:not-allowed; }
    }
    .btn-ghost {
      display:inline-flex; align-items:center; gap:0.5rem;
      padding:0.8125rem 1.25rem; background:none; border:1px solid var(--gray-300);
      cursor:pointer; font-size:0.8rem; font-weight:600; color:var(--gray-500);
      letter-spacing:0.06em; transition:all 0.2s;
      &:hover { border-color:var(--black); color:var(--black); }
    }

    /* ── Theme Preview ── */
    .theme-preview {
      background:var(--gray-100); border:1px solid var(--gray-200);
      overflow:hidden; margin-bottom:2rem; border-radius:2px;
    }
    .tp-bar { padding:0.75rem 1.25rem; display:flex; align-items:center; justify-content:space-between; }
    .tp-logo { font-family:var(--font-heading); font-size:1rem; font-weight:600; letter-spacing:0.2em; }
    .tp-nav  { display:flex; gap:1.25rem; font-size:0.75rem; opacity:0.7; }
    .tp-hero { padding:1.5rem 1.5rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; }
    .tp-title { font-family:var(--font-heading); font-size:1.25rem; font-weight:400; }
    .tp-sub   { font-size:0.75rem; margin-top:0.25rem; }
    .tp-btn   { font-size:0.65rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; padding:0.5rem 1.25rem; white-space:nowrap; flex-shrink:0; }
    .tp-cards { display:flex; gap:1px; background:var(--gray-200); }
    .tp-card  { flex:1; padding:1rem 1.25rem; }
    .tp-card-cat   { font-size:0.58rem; font-weight:800; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.25rem; }
    .tp-card-name  { font-family:var(--font-heading); font-size:0.875rem; margin-bottom:0.125rem; }
    .tp-card-price { font-size:0.8rem; font-weight:700; }

    /* ── Color Grid ── */
    .color-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem;
      @media(max-width:1000px){grid-template-columns:repeat(3,1fr);}
      @media(max-width:700px) {grid-template-columns:repeat(2,1fr);}
    }
    .color-item { display:flex; align-items:flex-start; gap:0.75rem; padding:0.875rem; background:var(--cream); border:1px solid var(--gray-200); transition:border-color 0.2s; &:hover{border-color:var(--gray-300);} }
    .color-swatch-wrap { position:relative; flex-shrink:0; }
    .color-swatch { width:40px; height:40px; border-radius:4px; border:2px solid rgba(0,0,0,0.1); cursor:pointer; }
    .color-input-hidden { position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer; border:none; padding:0; }
    .color-info { flex:1; min-width:0;
      label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--black); margin-bottom:0.375rem; }
    }
    .hex-wrap { display:flex; }
    .hex-input { width:100%; padding:0.4rem 0.625rem; border:1px solid var(--gray-300); background:var(--cream-light); font-family:monospace; font-size:0.8rem; color:var(--black); outline:none; &:focus{border-color:var(--gold);} }
    .color-hint { display:block; font-size:0.65rem; color:var(--gray-400); margin-top:0.3rem; line-height:1.4; }

    .theme-footer { display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; }

    /* ── Image List ── */
    .img-list { display:flex; flex-direction:column; gap:1px; background:var(--gray-200); border:1px solid var(--gray-200); margin-bottom:1.5rem; }

    .img-row {
      display:grid; grid-template-columns:260px 1fr; background:var(--cream-light);
      transition:background 0.15s;
      &:hover { background:var(--cream); }
      &.expanded { background:var(--cream); }
      @media(max-width:700px) { grid-template-columns:160px 1fr; }
      @media(max-width:480px) { grid-template-columns:1fr; }
    }

    .img-preview-col { overflow:hidden; background:var(--cream-dark); }
    .img-preview-box { position:relative; width:100%; height:200px; overflow:hidden;
      @media(max-width:480px) { height:220px; }
    }
    .preview-img { width:100%; height:100%; object-fit:cover; display:block; transform-origin:center center; }
    .img-wide .img-preview-box { height:160px; }
    .img-spinner-overlay { position:absolute; inset:0; background:rgba(26,26,26,0.55); display:flex; align-items:center; justify-content:center; }

    .img-info-col {
      padding:1.5rem; border-left:1px solid var(--gray-200); display:flex; flex-direction:column; justify-content:center; gap:0.5rem;
      @media(max-width:480px) { border-left:none; border-top:1px solid var(--gray-200); }
    }

    .img-badge {
      display:inline-block; font-size:0.58rem; font-weight:800; letter-spacing:0.18em;
      text-transform:uppercase; background:var(--gold); color:var(--black);
      padding:0.2rem 0.625rem; align-self:flex-start;
    }
    .img-title { font-family:var(--font-heading); font-size:1.125rem; font-weight:500; color:var(--black); line-height:1.3; }
    .img-section-name { font-size:0.75rem; color:var(--gold-dark); display:flex; align-items:center; gap:0.25rem; font-weight:600; letter-spacing:0.05em; }
    .img-desc { font-size:0.8125rem; color:var(--gray-500); line-height:1.6; }

    .img-actions { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-top:0.25rem; }
    .btn-upload {
      display:inline-flex; align-items:center; gap:0.4rem; cursor:pointer;
      padding:0.55rem 1rem; background:var(--gold); color:var(--black);
      font-size:0.72rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
      transition:background 0.2s;
      &:hover { background:var(--gold-dark); }
    }
    .btn-revert {
      display:inline-flex; align-items:center; gap:0.35rem; cursor:pointer;
      padding:0.55rem 0.875rem; background:rgba(33,150,243,0.1); border:1px solid rgba(33,150,243,0.3);
      color:#1565c0; font-size:0.72rem; font-weight:700; letter-spacing:0.06em;
      transition:all 0.2s;
      &:hover { background:rgba(33,150,243,0.18); }
    }
    .btn-adjust {
      display:inline-flex; align-items:center; gap:0.35rem; cursor:pointer;
      padding:0.55rem 0.875rem; background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.3);
      color:var(--gold-dark); font-size:0.72rem; font-weight:700; letter-spacing:0.06em;
      transition:all 0.2s;
      &:hover { background:rgba(201,168,76,0.16); }
      &.btn-adjust-active { background:var(--black); border-color:var(--gold); color:var(--gold); }
    }
    .btn-reset-img {
      display:inline-flex; align-items:center; gap:0.35rem; cursor:pointer;
      padding:0.55rem 0.875rem; background:none; border:1px solid var(--gray-200);
      color:var(--gray-400); font-size:0.72rem; font-weight:600; letter-spacing:0.06em;
      transition:all 0.2s;
      &:hover { border-color:var(--gray-400); color:var(--black); }
    }
    .img-changed-badge {
      font-size:0.65rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
      background:rgba(76,175,80,0.12); color:#2e7d32; padding:0.2rem 0.625rem; border-radius:2px;
    }

    /* ── Adjust Panel ── */
    .adjust-panel {
      grid-column:1/-1; background:var(--black); border-top:1px solid rgba(201,168,76,0.2);
      padding:1.5rem 2rem;
    }
    .adjust-title {
      display:flex; align-items:center; gap:0.5rem;
      font-size:0.7rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;
      color:var(--gold); margin-bottom:1.25rem;
    }
    .adjust-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.25rem;
      @media(max-width:640px){grid-template-columns:1fr;}
    }
    .adj-field { display:flex; flex-direction:column; gap:0.375rem;
      label { font-size:0.7rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--gold-light); }
    }
    .adj-select {
      padding:0.625rem 0.875rem; background:rgba(245,240,232,0.08); border:1px solid rgba(201,168,76,0.25);
      color:var(--cream); font-size:0.875rem; outline:none; cursor:pointer;
      &:focus { border-color:var(--gold); }
      option { background:var(--black); }
    }
    .adj-range { width:100%; accent-color:var(--gold); cursor:pointer; height:4px; }
    .adj-range-labels { display:flex; justify-content:space-between; font-size:0.65rem; color:rgba(245,240,232,0.35); margin-top:2px; }
    .adj-hint { font-size:0.7rem; color:rgba(245,240,232,0.4); line-height:1.5; }

    .adjust-actions { display:flex; gap:0.75rem; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.08); padding-top:1.25rem;
      .btn-save { background:var(--gold); }
      .btn-ghost { border-color:rgba(255,255,255,0.15); color:rgba(245,240,232,0.5); &:hover{border-color:rgba(255,255,255,0.4);color:var(--cream);} }
    }

    .hidden-input { display:none; }
    .img-footer { padding-top:1rem; }

    /* Spinner */
    .spinner { width:32px; height:32px; border:3px solid rgba(255,255,255,0.25); border-top-color:var(--gold); border-radius:50%; animation:spin 0.7s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg);} }
  `]
})
export class AdminSettingsComponent {
  private themeService = inject(ThemeService);
  siteImages           = inject(SiteImagesService);
  private toast        = inject(ToastService);
  private http         = inject(HttpClient);

  tab = signal<'creds'|'theme'|'images'>('creds');

  // ── Credentials ────────────────────────────────────
  creds       = { currentPassword: '', newEmail: '', newPassword: '' };
  credLoading = signal(false);
  credErr     = signal('');
  credOk      = signal('');

  saveCreds() {
    if (!this.creds.currentPassword) { this.credErr.set('Current password required.'); return; }
    if (!this.creds.newEmail && !this.creds.newPassword) { this.credErr.set('Enter new email or new password.'); return; }
    this.credLoading.set(true); this.credErr.set(''); this.credOk.set('');
    this.http.post<any>(`${API_BASE}/settings/admin-credentials`, {
      currentPassword: this.creds.currentPassword,
      newEmail:        this.creds.newEmail    || null,
      newPassword:     this.creds.newPassword || null
    }).subscribe({
      next: r => { this.credOk.set(r.message); this.credLoading.set(false); this.creds = { currentPassword:'', newEmail:'', newPassword:'' }; },
      error: e => { this.credErr.set(e.error?.message || 'Failed.'); this.credLoading.set(false); }
    });
  }

  // ── Theme ──────────────────────────────────────────
  tc: ThemeColors = this.themeService.getCurrent();
  themeOk = signal('');

  colorFields: { key: keyof ThemeColors; label: string; hint: string }[] = [
    { key:'--gold',        label:'Primary Gold',    hint:'Buttons, prices, accents' },
    { key:'--gold-light',  label:'Gold Light',      hint:'Hover states, badges' },
    { key:'--gold-dark',   label:'Gold Dark',       hint:'Active links, titles' },
    { key:'--black',       label:'Primary Black',   hint:'Navbar, product cards' },
    { key:'--cream',       label:'Cream',           hint:'Page background' },
    { key:'--cream-light', label:'Cream Light',     hint:'Cards & forms bg' },
    { key:'--cream-dark',  label:'Cream Dark',      hint:'Dividers & skeleton' },
  ];

  onColor(key: keyof ThemeColors, v: string) {
    this.tc = { ...this.tc, [key]: v };
    this.themeService.apply({ [key]: v });
  }

  saveTheme() {
    this.themeService.save(this.tc);
    this.themeOk.set('Theme applied and saved!');
    this.toast.success('Theme updated!');
    setTimeout(() => this.themeOk.set(''), 3000);
  }

  resetTheme() {
    this.tc = { ...DEFAULT_THEME };
    this.themeService.reset();
    this.themeOk.set('Theme reset to default.');
    setTimeout(() => this.themeOk.set(''), 3000);
  }

  // ── Images ─────────────────────────────────────────
  uploadingKey = signal<string|null>(null);
  expandedKey  = signal<string|null>(null);
  uploadedMap: Record<string, boolean>   = {};
  historyMap:  Record<string, string[]>  = {};  // previous images for revert

  // Adjustments per section
  adjustments: Record<string, ImageAdjust> = {};

  imageSections: ImageSection[] = [
    { key:'hero-bg',  label:'Hero Section — Background',         badge:'Hero',        sectionName:'"Timeless Elegance" — main full-page banner', desc:'Full-page background covering the entire hero. Appears behind the heading and CTAs.', aspectRatio:'wide' },
    { key:'women-3',  label:'Women\'s Collection — Feature Image', badge:'Women Section', sectionName:'"Her Story Begins Here" — split layout left side', desc:'Portrait photo on the left side of the women\'s collection split section.', aspectRatio:'tall' },
    { key:'men-2',    label:'Men\'s Collection — Feature Image',   badge:'Men Section',   sectionName:'"Crafted for the Modern Man" — split layout left side', desc:'Portrait photo on the left side of the men\'s collection split section.', aspectRatio:'tall' },
    { key:'women-7',  label:'Full-Width Banner — Background',     badge:'Banner',       sectionName:'"New Collection 2026" — large full-width banner', desc:'Wide background image of the large banner between Men\'s Picks and Newsletter.', aspectRatio:'wide' },
  ];

  constructor() {
    // Init adjustments for each section
    this.imageSections.forEach(s => {
      this.adjustments[s.key] = { ...DEFAULT_ADJUST };
      this.historyMap[s.key]  = [];
    });
    this.loadAdjustments();
  }

  getAdj(key: string): ImageAdjust {
    return this.adjustments[key] || { ...DEFAULT_ADJUST };
  }

  toggleAdjust(key: string) {
    this.expandedKey.set(this.expandedKey() === key ? null : key);
  }

  onAdjust(key: string) {
    // Live preview — already bound via [style] bindings
  }

  saveAdjust(key: string) {
    const all = { ...this.loadRawAdjust(), [key]: this.adjustments[key] };
    localStorage.setItem(ADJUST_KEY, JSON.stringify(all));
    this.toast.success('Adjustments saved!');
    this.expandedKey.set(null);
  }

  resetAdjust(key: string) {
    this.adjustments[key] = { ...DEFAULT_ADJUST };
    const all = this.loadRawAdjust();
    delete all[key];
    localStorage.setItem(ADJUST_KEY, JSON.stringify(all));
    this.toast.info('Adjustments reset.');
  }

  private loadAdjustments() {
    const raw = this.loadRawAdjust();
    Object.keys(raw).forEach(k => {
      if (this.adjustments[k]) this.adjustments[k] = { ...DEFAULT_ADJUST, ...raw[k] };
    });
  }

  private loadRawAdjust(): Record<string, ImageAdjust> {
    try { return JSON.parse(localStorage.getItem(ADJUST_KEY) || '{}'); } catch { return {}; }
  }

  onUpload(event: Event, key: keyof HomeImages) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { this.toast.error('Max file size is 5MB.'); return; }

    this.uploadingKey.set(key);
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      // Save previous for revert
      const prev = this.siteImages.getImage(key);
      if (prev && prev !== DEFAULT_IMAGES[key]) {
        this.historyMap[key] = [prev, ...(this.historyMap[key] || [])].slice(0, 5);
      }
      this.siteImages.saveImage(key, dataUrl);
      this.uploadedMap[key] = true;
      this.uploadingKey.set(null);
      this.toast.success(`${this.imageSections.find(s=>s.key===key)?.label} updated!`);
      (event.target as HTMLInputElement).value = '';
    };
    reader.readAsDataURL(file);
  }

  revertImage(key: keyof HomeImages) {
    const history = this.historyMap[key];
    if (!history?.length) { this.toast.error('No previous image to revert to.'); return; }
    const prev = history[0];
    this.historyMap[key] = history.slice(1);
    this.siteImages.saveImage(key, prev);
    this.toast.success('Image reverted to previous version!');
  }

  resetImage(key: keyof HomeImages) {
    this.historyMap[key] = [];
    this.siteImages.resetImage(key);
    this.uploadedMap[key] = false;
    this.toast.info('Image reset to default.');
  }

  resetAllImages() {
    this.siteImages.resetAll();
    this.uploadedMap = {};
    this.historyMap  = {};
    this.toast.info('All images reset to default.');
  }
}
