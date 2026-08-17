import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconsComponent],
  animations: [
    trigger('modalFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ],
  template: `
    <div class="overlay" (click)="close.emit()" role="dialog" aria-modal="true" aria-label="Login / Register"></div>

    <div class="auth-modal" [@modalFade]>
      <!-- Close -->
      <button class="auth-modal__close" (click)="close.emit()" aria-label="Close">
        <app-icon name="close" [size]="20"/>
      </button>

      <!-- Logo -->
      <div class="auth-modal__logo">
        <svg viewBox="0 0 120 32" width="120" height="32" aria-hidden="true">
          <path d="M8 24L4 12l8 5 8-10 8 10 8-5-4 12H8z" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <text x="40" y="22" font-family="Cormorant Garamond,serif" font-size="16" font-weight="600" fill="#1A1A1A" letter-spacing="2">SHOPZEE</text>
        </svg>
      </div>

      <!-- Tabs -->
      <div class="auth-modal__tabs">
        <button class="auth-tab" [class.active]="mode() === 'login'" (click)="mode.set('login')">Sign In</button>
        <button class="auth-tab" [class.active]="mode() === 'register'" (click)="mode.set('register')">Register</button>
      </div>

      <!-- Login Form -->
      @if (mode() === 'login') {
        <form class="auth-form" (submit)="onLogin($event)">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="loginForm.email" name="email" placeholder="your@email.com" required/>
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-wrap">
              <input [type]="showPass() ? 'text' : 'password'" [(ngModel)]="loginForm.password" name="password" placeholder="••••••••" required/>
              <button type="button" class="pass-toggle" (click)="togglePass()" aria-label="Toggle password">
                <app-icon [name]="showPass() ? 'eye' : 'eye'" [size]="16"/>
              </button>
            </div>
          </div>
          @if (error()) {
            <p class="auth-error">{{ error() }}</p>
          }
          <button type="submit" class="btn btn-primary w-full auth-submit" [disabled]="loading()">
            @if (loading()) { <span>Signing in...</span> } @else { <span>Sign In</span> }
          </button>
          <p class="auth-hint">
            Demo: <strong>admin&#64;STYLEMAKER.pk</strong> / <strong>Admin&#64;123</strong><br/>
            <small style="color:#aaa">Support: trendzyofficial.store&#64;gmail.com</small>
          </p>
        </form>
      }

      <!-- Register Form -->
      @if (mode() === 'register') {
        <form class="auth-form" (submit)="onRegister($event)">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="registerForm.name" name="name" placeholder="Your full name" required/>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="registerForm.email" name="email" placeholder="your@email.com" required/>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="registerForm.phone" name="phone" placeholder="+92 300 0000000"/>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input [type]="showPass() ? 'text' : 'password'" [(ngModel)]="registerForm.password" name="password" placeholder="Min 6 characters" required/>
          </div>
          @if (error()) {
            <p class="auth-error">{{ error() }}</p>
          }
          <button type="submit" class="btn btn-primary w-full auth-submit" [disabled]="loading()">
            @if (loading()) { <span>Creating account...</span> } @else { <span>Create Account</span> }
          </button>
        </form>
      }
    </div>
  `,
  styles: [`
    .overlay { position:fixed; inset:0; background:rgba(26,26,26,0.6); backdrop-filter:blur(4px); z-index:var(--z-overlay); }
    .auth-modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:var(--cream-light); z-index:var(--z-modal); width:90%; max-width:440px; padding:2.5rem; border:1px solid var(--gray-200); box-shadow:var(--shadow-xl); }
    .auth-modal__close { position:absolute; top:1rem; right:1rem; background:none; border:none; cursor:pointer; color:var(--gray-400); display:flex; &:hover{color:var(--black);} }
    .auth-modal__logo { text-align:center; margin-bottom:1.5rem; }
    .auth-modal__tabs { display:flex; border-bottom:1px solid var(--gray-200); margin-bottom:1.5rem; }
    .auth-tab { flex:1; padding:0.75rem; background:none; border:none; cursor:pointer; font-size:0.875rem; font-weight:500; letter-spacing:0.08em; text-transform:uppercase; color:var(--gray-400); transition:all 0.2s; border-bottom:2px solid transparent; margin-bottom:-1px; &.active{color:var(--gold-dark);border-bottom-color:var(--gold);} }
    .auth-form { display:flex; flex-direction:column; gap:0; }
    .password-wrap { position:relative; }
    .password-wrap input { padding-right:2.5rem; }
    .pass-toggle { position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--gray-400); display:flex; }
    .auth-error { color:#E53935; font-size:0.8125rem; margin:0.5rem 0; background:rgba(229,57,53,0.08); padding:0.5rem 0.75rem; }
    .auth-submit { margin-top:1rem; padding:0.9375rem; font-size:0.875rem; }
    .auth-hint { font-size:0.75rem; color:var(--gray-400); text-align:center; margin-top:0.75rem; }
  `]
})
export class AuthModalComponent {
  @Output() close    = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<void>();

  private authApi = inject(AuthApiService);
  private toast   = inject(ToastService);

  mode     = signal<'login' | 'register'>('login');
  loading  = signal(false);
  error    = signal('');
  showPass = signal(false);

  loginForm    = { email: '', password: '' };
  registerForm = { name: '', email: '', password: '', phone: '' };

  togglePass() { this.showPass.update(v => !v); }

  onLogin(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    this.error.set('');

    this.authApi.login(this.loginForm.email, this.loginForm.password).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.loading.set(false);
        this.loggedIn.emit();
        this.close.emit();
      },
      error: err => {
        this.error.set(err.error?.message || 'Invalid email or password.');
        this.loading.set(false);
      }
    });
  }

  onRegister(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    this.error.set('');

    this.authApi.register(
      this.registerForm.name,
      this.registerForm.email,
      this.registerForm.password,
      this.registerForm.phone
    ).subscribe({
      next: () => {
        this.toast.success('Account created! Welcome to STYLEMAKER.');
        this.loading.set(false);
        this.loggedIn.emit();
        this.close.emit();
      },
      error: err => {
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
