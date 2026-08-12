import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, SvgIconsComponent],
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('350ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms ease', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ],
  template: `
    <div class="toast-container" role="status" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [@toastAnim] [class]="'toast toast--' + toast.type">
          <app-icon [name]="getIcon(toast.type)" [size]="20" class="toast-icon"/>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.remove(toast.id)" aria-label="Dismiss">
            <app-icon name="close" [size]="16"/>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 500;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--black);
      color: var(--cream);
      border-left: 3px solid var(--gold);
      box-shadow: 0 8px 32px rgba(26,26,26,0.25);
      min-width: 280px;
      max-width: 360px;
      pointer-events: all;
      font-size: 0.875rem;

      &--success { border-left-color: #4CAF50; }
      &--error   { border-left-color: #E53935; }
      &--info    { border-left-color: var(--gold); }
      &--cart    { border-left-color: var(--gold); }
      &--wishlist{ border-left-color: #E91E63; }
    }

    .toast-icon {
      flex-shrink: 0;
      color: var(--gold);
    }

    .toast--success .toast-icon { color: #4CAF50; }
    .toast--error   .toast-icon { color: #E53935; }
    .toast--wishlist .toast-icon { color: #E91E63; }

    .toast-msg {
      flex: 1;
      line-height: 1.4;
    }

    .toast-close {
      cursor: pointer;
      border: none;
      background: none;
      color: var(--gray-400);
      padding: 0;
      display: flex;
      transition: color 0.2s;
      &:hover { color: var(--cream); }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    const map: Record<string, string> = {
      success: 'check-circle',
      error:   'close',
      info:    'bell',
      cart:    'cart',
      wishlist:'heart-filled'
    };
    return map[type] ?? 'check-circle';
  }
}
