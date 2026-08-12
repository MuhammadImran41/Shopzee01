import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <div class="nf-content">
        <div class="nf-number">
          <span class="n">4</span>
          <div class="nf-logo-wrap">
            <svg viewBox="0 0 60 60" class="nf-logo-svg" aria-hidden="true">
              <path d="M30 5L5 20v20l25 15 25-15V20z" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
              <circle cx="30" cy="30" r="8" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
            </svg>
          </div>
          <span class="n">4</span>
        </div>
        <h1 class="nf-title">Page Not Found</h1>
        <p class="nf-desc">The page you are looking for might have been moved or doesn't exist.</p>
        <div class="nf-actions">
          <a routerLink="/" class="btn btn-primary">Back to Home</a>
          <a routerLink="/women" class="btn btn-outline">Shop Women</a>
          <a routerLink="/men" class="btn btn-outline">Shop Men</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found { min-height:80vh; display:flex; align-items:center; justify-content:center; padding:var(--space-12); }
    .nf-content { text-align:center; max-width:500px; }
    .nf-number { display:flex; align-items:center; justify-content:center; gap:var(--space-4); margin-bottom:var(--space-6); }
    .n { font-family:var(--font-heading); font-size:8rem; font-weight:300; color:var(--gray-200); line-height:1; }
    .nf-logo-wrap { width:100px; height:100px; }
    .nf-logo-svg { width:100%; height:100%; }
    .nf-title { font-family:var(--font-heading); font-size:var(--text-4xl); font-weight:400; margin-bottom:var(--space-4); }
    .nf-desc { color:var(--gray-400); line-height:1.7; margin-bottom:var(--space-8); }
    .nf-actions { display:flex; flex-wrap:wrap; justify-content:center; gap:var(--space-3); }
  `]
})
export class NotFoundComponent {}
