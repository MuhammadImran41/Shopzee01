import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      [attr.viewBox]="viewBox"
      [attr.fill]="fill"
      [attr.stroke]="stroke"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.class]="cssClass"
      aria-hidden="true"
    >
      <ng-container [ngSwitch]="name">

        <!-- CART -->
        <ng-container *ngSwitchCase="'cart'">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </ng-container>

        <!-- HEART / WISHLIST -->
        <ng-container *ngSwitchCase="'heart'">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </ng-container>

        <!-- HEART FILLED -->
        <ng-container *ngSwitchCase="'heart-filled'">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="currentColor"/>
        </ng-container>

        <!-- USER / ACCOUNT -->
        <ng-container *ngSwitchCase="'user'">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </ng-container>

        <!-- SEARCH -->
        <ng-container *ngSwitchCase="'search'">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </ng-container>

        <!-- MENU / HAMBURGER -->
        <ng-container *ngSwitchCase="'menu'">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </ng-container>

        <!-- CLOSE / X -->
        <ng-container *ngSwitchCase="'close'">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </ng-container>

        <!-- ARROW RIGHT -->
        <ng-container *ngSwitchCase="'arrow-right'">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </ng-container>

        <!-- ARROW LEFT -->
        <ng-container *ngSwitchCase="'arrow-left'">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </ng-container>

        <!-- CHEVRON DOWN -->
        <ng-container *ngSwitchCase="'chevron-down'">
          <polyline points="6 9 12 15 18 9"/>
        </ng-container>

        <!-- CHEVRON UP -->
        <ng-container *ngSwitchCase="'chevron-up'">
          <polyline points="18 15 12 9 6 15"/>
        </ng-container>

        <!-- CHEVRON RIGHT -->
        <ng-container *ngSwitchCase="'chevron-right'">
          <polyline points="9 18 15 12 9 6"/>
        </ng-container>

        <!-- STAR -->
        <ng-container *ngSwitchCase="'star'">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </ng-container>

        <!-- STAR FILLED -->
        <ng-container *ngSwitchCase="'star-filled'">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none"/>
        </ng-container>

        <!-- BAG -->
        <ng-container *ngSwitchCase="'bag'">
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </ng-container>

        <!-- FILTER -->
        <ng-container *ngSwitchCase="'filter'">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </ng-container>

        <!-- GRID -->
        <ng-container *ngSwitchCase="'grid'">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </ng-container>

        <!-- LIST -->
        <ng-container *ngSwitchCase="'list'">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </ng-container>

        <!-- TRASH -->
        <ng-container *ngSwitchCase="'trash'">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </ng-container>

        <!-- PLUS -->
        <ng-container *ngSwitchCase="'plus'">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </ng-container>

        <!-- MINUS -->
        <ng-container *ngSwitchCase="'minus'">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </ng-container>

        <!-- CHECK -->
        <ng-container *ngSwitchCase="'check'">
          <polyline points="20 6 9 17 4 12"/>
        </ng-container>

        <!-- CHECK CIRCLE -->
        <ng-container *ngSwitchCase="'check-circle'">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </ng-container>

        <!-- BELL / NOTIFICATION -->
        <ng-container *ngSwitchCase="'bell'">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </ng-container>

        <!-- PACKAGE -->
        <ng-container *ngSwitchCase="'package'">
          <line x1="16.5" y1="9.4" x2="7.55" y2="4.24"/>
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </ng-container>

        <!-- USERS -->
        <ng-container *ngSwitchCase="'users'">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </ng-container>

        <!-- CHART -->
        <ng-container *ngSwitchCase="'chart'">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </ng-container>

        <!-- SETTINGS -->
        <ng-container *ngSwitchCase="'settings'">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </ng-container>

        <!-- UPLOAD -->
        <ng-container *ngSwitchCase="'upload'">
          <polyline points="16 16 12 12 8 16"/>
          <line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
        </ng-container>

        <!-- EYE -->
        <ng-container *ngSwitchCase="'eye'">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </ng-container>

        <!-- EDIT / PENCIL -->
        <ng-container *ngSwitchCase="'edit'">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </ng-container>

        <!-- DOWNLOAD -->
        <ng-container *ngSwitchCase="'download'">
          <polyline points="8 17 12 21 16 17"/>
          <line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
        </ng-container>

        <!-- MAP PIN / LOCATION -->
        <ng-container *ngSwitchCase="'map-pin'">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </ng-container>

        <!-- PHONE -->
        <ng-container *ngSwitchCase="'phone'">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.13 2.2 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.07-1.07a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </ng-container>

        <!-- MAIL -->
        <ng-container *ngSwitchCase="'mail'">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </ng-container>

        <!-- CLOCK -->
        <ng-container *ngSwitchCase="'clock'">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </ng-container>

        <!-- SHIELD -->
        <ng-container *ngSwitchCase="'shield'">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </ng-container>

        <!-- TRUCK / DELIVERY -->
        <ng-container *ngSwitchCase="'truck'">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </ng-container>

        <!-- REFRESH -->
        <ng-container *ngSwitchCase="'refresh'">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </ng-container>

        <!-- SHARE -->
        <ng-container *ngSwitchCase="'share'">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </ng-container>

        <!-- ORNAMENT / DIAMOND -->
        <ng-container *ngSwitchCase="'diamond'">
          <path d="M6 3h12l4 6-10 13L2 9 6 3z"/>
          <path d="M11 3L8 9l4 13 4-13-3-6"/>
          <path d="M2 9h20"/>
        </ng-container>

        <!-- LOGO ORNAMENT (crown) -->
        <ng-container *ngSwitchCase="'crown'">
          <path d="M2 20h20M4 20L2 8l5 4 5-8 5 8 5-4-2 12"/>
        </ng-container>

        <!-- SEO / GLOBE -->
        <ng-container *ngSwitchCase="'globe'">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </ng-container>

        <!-- DEFAULT -->
        <ng-container *ngSwitchDefault>
          <circle cx="12" cy="12" r="10"/>
        </ng-container>

      </ng-container>
    </svg>
  `
})
export class SvgIconsComponent {
  @Input() name = '';
  @Input() size: number | string = 24;
  @Input() fill = 'none';
  @Input() stroke = 'currentColor';
  @Input() strokeWidth: number | string = 1.5;
  @Input() cssClass = '';

  get viewBox(): string {
    return '0 0 24 24';
  }
}
