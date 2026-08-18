import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';
import { AuthApiService } from '../../../core/services/api/auth-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { API_BASE } from '../../../core/services/api/api.config';

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
    <div class="overlay" (click)="close.emit()" role="dialog" aria-modal="true"></div>

    <div class="auth-modal" [@modalFade] [class.modal-wide]="mode() === 'reseller'">
      <!-- Close -->
      <button class="auth-modal__close" (click)="close.emit()" aria-label="Close">
        <app-icon name="close" [size]="20"/>
      </button>

      <!-- Logo -->
      <div class="auth-modal__logo">
        <svg viewBox="0 0 180 32" width="180" height="32" aria-hidden="true">
          <path d="M8 24L4 12l8 5 8-10 8 10 8-5-4 12H8z" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <text x="40" y="22" font-family="Cormorant Garamond,serif" font-size="15" font-weight="600" fill="#1A1A1A" letter-spacing="2">STYLEMAKER</text>
        </svg>
      </div>

      <!-- Tabs -->
      <div class="auth-modal__tabs">
        <button class="auth-tab" [class.active]="mode() === 'login'"    (click)="mode.set('login')">Sign In</button>
        <button class="auth-tab" [class.active]="mode() === 'register'" (click)="mode.set('register')">Register</button>
        <button class="auth-tab auth-tab--reseller" [class.active]="mode() === 'reseller'" (click)="mode.set('reseller')">
          ✦ Reseller
        </button>
      </div>

      <!-- ── LOGIN FORM ──────────────────────────────────── -->
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
          @if (error()) { <p class="auth-error">{{ error() }}</p> }
          <button type="submit" class="btn btn-primary w-full auth-submit" [disabled]="loading()">
            @if (loading()) { <span>Signing in...</span> } @else { <span>Sign In</span> }
          </button>
          <p class="auth-hint">
            Demo: <strong>admin&#64;stylemaker.pk</strong> / <strong>Admin&#64;123</strong><br/>
            <small style="color:#aaa">Support: STYLEMAKERofficial.store&#64;gmail.com</small>
          </p>
        </form>
      }

      <!-- ── REGISTER FORM ───────────────────────────────── -->
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
          @if (error()) { <p class="auth-error">{{ error() }}</p> }
          <button type="submit" class="btn btn-primary w-full auth-submit" [disabled]="loading()">
            @if (loading()) { <span>Creating account...</span> } @else { <span>Create Account</span> }
          </button>
        </form>
      }

      <!-- ── RESELLER SIGNUP FORM ────────────────────────── -->
      @if (mode() === 'reseller') {

        <!-- Success State -->
        @if (resellerSuccess()) {
          <div class="reseller-success">
            <div class="success-icon-wrap">
              <app-icon name="check" [size]="40" class="success-check"/>
            </div>
            <h3>Application Submitted!</h3>
            <p>Thank you for applying as a StyleMaker Reseller. We'll review your application and notify you within <strong>24 hours</strong>.</p>
            <p class="success-email">Check your email: <strong>{{ resellerForm.email }}</strong></p>
            <button class="btn btn-primary" style="margin-top:1.5rem" (click)="close.emit()">Close</button>
          </div>
        }

        @if (!resellerSuccess()) {
          <!-- Step Indicator -->
          <div class="reseller-steps">
            <div class="step" [class.active]="resellerStep() >= 1" [class.done]="resellerStep() > 1">
              <span class="step-num">1</span>
              <span class="step-label">Personal Info</span>
            </div>
            <div class="step-line"></div>
            <div class="step" [class.active]="resellerStep() >= 2" [class.done]="resellerStep() > 2">
              <span class="step-num">2</span>
              <span class="step-label">Business Info</span>
            </div>
            <div class="step-line"></div>
            <div class="step" [class.active]="resellerStep() >= 3">
              <span class="step-num">3</span>
              <span class="step-label">Payment</span>
            </div>
          </div>

          <!-- Step 1: Personal Info -->
          @if (resellerStep() === 1) {
            <form class="auth-form reseller-form" (submit)="resellerNext($event)">
              <div class="reseller-section-title">
                <app-icon name="user" [size]="16"/> Personal Information
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label>Full Name <span class="req">*</span></label>
                  <input type="text" [(ngModel)]="resellerForm.name" name="r_name"
                    placeholder="Muhammad Ali" required/>
                </div>
                <div class="form-group">
                  <label>Email Address <span class="req">*</span></label>
                  <input type="email" [(ngModel)]="resellerForm.email" name="r_email"
                    placeholder="you@gmail.com" required/>
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label>Phone Number <span class="req">*</span></label>
                  <input type="tel" [(ngModel)]="resellerForm.phone" name="r_phone"
                    placeholder="0300 0000000" required/>
                </div>
                <div class="form-group">
                  <label>CNIC (optional)</label>
                  <input type="text" [(ngModel)]="resellerForm.cnic" name="r_cnic"
                    placeholder="35201-1234567-1"/>
                </div>
              </div>
              <div class="form-group">
                <label>Password <span class="req">*</span></label>
                <div class="password-wrap">
                  <input [type]="showPass() ? 'text' : 'password'" [(ngModel)]="resellerForm.password"
                    name="r_password" placeholder="Min 8 characters" required minlength="8"/>
                  <button type="button" class="pass-toggle" (click)="togglePass()">
                    <app-icon [name]="showPass() ? 'eye' : 'eye'" [size]="16"/>
                  </button>
                </div>
              </div>
              @if (error()) { <p class="auth-error">{{ error() }}</p> }
              <button type="submit" class="btn btn-primary w-full auth-submit">
                Next — Business Info →
              </button>
            </form>
          }

          <!-- Step 2: Business Info -->
          @if (resellerStep() === 2) {
            <form class="auth-form reseller-form" (submit)="resellerNext($event)">
              <div class="reseller-section-title">
                <app-icon name="package" [size]="16"/> Business Information
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label>Business / Shop Name <span class="req">*</span></label>
                  <input type="text" [(ngModel)]="resellerForm.businessName" name="r_biz"
                    placeholder="Ali's Fashion Store" required/>
                </div>
                <div class="form-group">
                  <label>WhatsApp Number <span class="req">*</span></label>
                  <input type="tel" [(ngModel)]="resellerForm.whatsApp" name="r_wa"
                    placeholder="0300 0000000" required/>
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label>City <span class="req">*</span></label>
                  <select [(ngModel)]="resellerForm.city" name="r_city" required class="form-select">
                    <option value="">Select City</option>
                    @for (city of pakistanCities; track city) {
                      <option [value]="city">{{ city }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label>Full Address <span class="req">*</span></label>
                  <input type="text" [(ngModel)]="resellerForm.address" name="r_addr"
                    placeholder="House #, Street, Area" required/>
                </div>
              </div>
              <div class="reseller-info-box">
                <app-icon name="shield" [size]="16"/>
                <p>By applying, you agree to sell StyleMaker products at your own price and deliver orders placed through our system.</p>
              </div>
              @if (error()) { <p class="auth-error">{{ error() }}</p> }
              <div class="form-row-2">
                <button type="button" class="btn btn-ghost" (click)="resellerStep.set(1)">← Back</button>
                <button type="submit" class="btn btn-primary">Next — Payment →</button>
              </div>
            </form>
          }

          <!-- Step 3: Payment Info -->
          @if (resellerStep() === 3) {
            <form class="auth-form reseller-form" (submit)="onResellerSubmit($event)">
              <div class="reseller-section-title">
                <app-icon name="cart" [size]="16"/> Payment Information
              </div>
              <p class="payment-note">Where should we send your earnings?</p>

              <!-- Payment Method Selector -->
              <div class="payment-methods">
                @for (m of paymentMethods; track m.value) {
                  <button type="button"
                    class="payment-method-btn"
                    [class.active]="resellerForm.paymentMethod === m.value"
                    (click)="resellerForm.paymentMethod = m.value">
                    <span class="pm-icon">{{ m.icon }}</span>
                    <span class="pm-label">{{ m.label }}</span>
                  </button>
                }
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label>Account Title <span class="req">*</span></label>
                  <input type="text" [(ngModel)]="resellerForm.accountTitle" name="r_acctitle"
                    placeholder="Muhammad Ali" required/>
                </div>
                <div class="form-group">
                  <label>
                    @if (resellerForm.paymentMethod === 'bank') { Account Number }
                    @else { Mobile Number }
                    <span class="req">*</span>
                  </label>
                  <input type="text" [(ngModel)]="resellerForm.accountNumber" name="r_accnum"
                    [placeholder]="resellerForm.paymentMethod === 'bank' ? 'IBAN or Account #' : '0300 0000000'"
                    required/>
                </div>
              </div>

              @if (resellerForm.paymentMethod === 'bank') {
                <div class="form-group">
                  <label>Bank Name <span class="req">*</span></label>
                  <select [(ngModel)]="resellerForm.bankName" name="r_bank" class="form-select">
                    <option value="">Select Bank</option>
                    @for (b of banks; track b) {
                      <option [value]="b">{{ b }}</option>
                    }
                  </select>
                </div>
              }

              <div class="reseller-benefits">
                <h4>✦ Reseller Benefits</h4>
                <ul>
                  <li>✓ Sell at your own price — keep 100% profit</li>
                  <li>✓ Access all product images for sharing</li>
                  <li>✓ StyleMaker delivers directly to your customers</li>
                  <li>✓ No upfront investment needed</li>
                  <li>✓ Earnings paid within 24 hours of delivery</li>
                </ul>
              </div>

              @if (error()) { <p class="auth-error">{{ error() }}</p> }
              <div class="form-row-2">
                <button type="button" class="btn btn-ghost" (click)="resellerStep.set(2)">← Back</button>
                <button type="submit" class="btn btn-primary" [disabled]="loading()">
                  @if (loading()) { Submitting... } @else { Submit Application ✦ }
                </button>
              </div>
            </form>
          }
        }
      }

    </div>
  `,
  styles: [`
    .overlay { position:fixed; inset:0; background:rgba(26,26,26,0.6); backdrop-filter:blur(4px); z-index:var(--z-overlay); }

    .auth-modal {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: var(--cream-light);
      z-index: var(--z-modal);
      width: 90%; max-width: 440px;
      max-height: 90vh; overflow-y: auto;
      padding: 2.5rem;
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-xl);

      &.modal-wide { max-width: 560px; }
    }

    .auth-modal__close { position:absolute; top:1rem; right:1rem; background:none; border:none; cursor:pointer; color:var(--gray-400); display:flex; &:hover{color:var(--black);} }
    .auth-modal__logo { text-align:center; margin-bottom:1.5rem; }

    .auth-modal__tabs {
      display: flex; border-bottom: 1px solid var(--gray-200); margin-bottom: 1.5rem;
    }

    .auth-tab {
      flex: 1; padding: 0.75rem 0.5rem; background: none; border: none; cursor: pointer;
      font-size: 0.8rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--gray-400); transition: all 0.2s;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      &.active { color: var(--gold-dark); border-bottom-color: var(--gold); }
      &:hover:not(.active) { color: var(--black); }

      &--reseller {
        color: var(--gold-dark); font-weight: 700;
        &.active { background: rgba(201,168,76,0.06); }
      }
    }

    .auth-form { display:flex; flex-direction:column; gap:0; }
    .password-wrap { position:relative; }
    .password-wrap input { padding-right:2.5rem; }
    .pass-toggle { position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--gray-400); display:flex; }
    .auth-error { color:#E53935; font-size:0.8125rem; margin:0.5rem 0; background:rgba(229,57,53,0.08); padding:0.5rem 0.75rem; }
    .auth-submit { margin-top:1rem; padding:0.9375rem; font-size:0.875rem; }
    .auth-hint { font-size:0.75rem; color:var(--gray-400); text-align:center; margin-top:0.75rem; }

    /* ── Reseller Steps ───────────────────────────── */
    .reseller-steps {
      display: flex; align-items: center; margin-bottom: 1.75rem; gap: 0;
    }

    .step {
      display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;

      .step-num {
        width: 28px; height: 28px; border-radius: 50%;
        border: 2px solid var(--gray-300);
        display: flex; align-items: center; justify-content: center;
        font-size: 0.75rem; font-weight: 700; color: var(--gray-400);
        transition: all 0.3s;
      }

      .step-label {
        font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em;
        text-transform: uppercase; color: var(--gray-400); white-space: nowrap;
      }

      &.active .step-num { border-color: var(--gold); background: var(--gold); color: var(--black); }
      &.active .step-label { color: var(--gold-dark); }
      &.done .step-num { border-color: #4CAF50; background: #4CAF50; color: #fff; }
    }

    .step-line { flex: 1; height: 2px; background: var(--gray-200); margin: 0 0.5rem 1.25rem; }

    /* ── Reseller Form ────────────────────────────── */
    .reseller-form { gap: 0; }

    .reseller-section-title {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--gold-dark);
      margin-bottom: 1rem; padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(201,168,76,0.2);
    }

    .form-row-2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;
      margin-bottom: 0;
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }

    .form-select {
      width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-300);
      background: var(--cream-light); font-family: var(--font-body);
      font-size: 0.875rem; cursor: pointer; outline: none; box-sizing: border-box;
      &:focus { border-color: var(--gold); }
    }

    .req { color: var(--gold-dark); }

    .reseller-info-box {
      display: flex; gap: 0.75rem; align-items: flex-start;
      background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.2);
      padding: 0.75rem 1rem; margin: 0.75rem 0;

      app-icon { color: var(--gold); flex-shrink: 0; margin-top: 2px; }
      p { font-size: 0.75rem; color: var(--gray-500); line-height: 1.6; margin: 0; }
    }

    /* Payment Methods */
    .payment-note { font-size: 0.8rem; color: var(--gray-400); margin-bottom: 0.75rem; }

    .payment-methods {
      display: flex; gap: 0.5rem; margin-bottom: 1rem;
    }

    .payment-method-btn {
      flex: 1; padding: 0.625rem 0.5rem;
      border: 1.5px solid var(--gray-300); background: none; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
      transition: all 0.2s; border-radius: 6px;

      .pm-icon { font-size: 1.25rem; }
      .pm-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.05em; color: var(--gray-500); }

      &.active {
        border-color: var(--gold); background: rgba(201,168,76,0.08);
        .pm-label { color: var(--gold-dark); }
      }
      &:hover:not(.active) { border-color: var(--gray-400); }
    }

    /* Benefits box */
    .reseller-benefits {
      background: var(--black); padding: 1rem 1.25rem;
      margin: 1rem 0; border-radius: 4px;

      h4 { color: var(--gold); font-size: 0.75rem; font-weight: 700;
           letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.625rem; }

      ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.375rem; }
      li { font-size: 0.75rem; color: rgba(245,240,232,0.75); }
    }

    /* Success State */
    .reseller-success {
      text-align: center; padding: 1.5rem 0;

      .success-icon-wrap {
        width: 72px; height: 72px; border-radius: 50%;
        background: rgba(76,175,80,0.12); margin: 0 auto 1.25rem;
        display: flex; align-items: center; justify-content: center;
      }

      .success-check { color: #4CAF50; }

      h3 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 400; margin-bottom: 0.75rem; }
      p { font-size: 0.875rem; color: var(--gray-500); line-height: 1.7; margin-bottom: 0.5rem; }
      .success-email { font-size: 0.8rem; color: var(--gray-400); }
    }
  `]
})
export class AuthModalComponent {
  @Output() close    = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<void>();

  private authApi = inject(AuthApiService);
  private toast   = inject(ToastService);
  private http    = inject(HttpClient);

  mode          = signal<'login' | 'register' | 'reseller'>('login');
  loading       = signal(false);
  error         = signal('');
  showPass      = signal(false);
  resellerStep  = signal(1);
  resellerSuccess = signal(false);

  loginForm    = { email: '', password: '' };
  registerForm = { name: '', email: '', password: '', phone: '' };

  resellerForm = {
    // Step 1
    name: '', email: '', phone: '', cnic: '', password: '',
    // Step 2
    businessName: '', whatsApp: '', city: '', address: '',
    // Step 3
    paymentMethod: 'easypaisa', accountTitle: '', accountNumber: '', bankName: ''
  };

  paymentMethods = [
    { value: 'easypaisa', label: 'EasyPaisa', icon: '💚' },
    { value: 'jazzcash',  label: 'JazzCash',  icon: '🔴' },
    { value: 'bank',      label: 'Bank',      icon: '🏦' },
  ];

  pakistanCities = [
    'Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan',
    'Peshawar','Quetta','Sialkot','Gujranwala','Hyderabad','Bahawalpur',
    'Sargodha','Sukkur','Larkana','Sheikhupura','Rahim Yar Khan','Other'
  ];

  banks = [
    'HBL','MCB','UBL','Allied Bank','Bank Alfalah','Meezan Bank',
    'Standard Chartered','Faysal Bank','Silk Bank','Bank Al-Habib',
    'Askari Bank','Summit Bank','Other'
  ];

  togglePass() { this.showPass.update(v => !v); }

  // ── Login ──────────────────────────────────────────────────
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

  // ── Register ───────────────────────────────────────────────
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
        this.toast.success('Account created! Welcome to StyleMaker.');
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

  // ── Reseller: next step validation ────────────────────────
  resellerNext(e: Event) {
    e.preventDefault();
    this.error.set('');

    if (this.resellerStep() === 1) {
      if (!this.resellerForm.name || !this.resellerForm.email || !this.resellerForm.password) {
        this.error.set('Please fill all required fields.'); return;
      }
      if (this.resellerForm.password.length < 8) {
        this.error.set('Password must be at least 8 characters.'); return;
      }
      this.resellerStep.set(2);
    } else if (this.resellerStep() === 2) {
      if (!this.resellerForm.businessName || !this.resellerForm.whatsApp || !this.resellerForm.city || !this.resellerForm.address) {
        this.error.set('Please fill all required fields.'); return;
      }
      this.resellerStep.set(3);
    }
  }

  // ── Reseller: final submit ─────────────────────────────────
  onResellerSubmit(e: Event) {
    e.preventDefault();
    this.error.set('');

    if (!this.resellerForm.accountTitle || !this.resellerForm.accountNumber) {
      this.error.set('Please fill payment details.'); return;
    }

    this.loading.set(true);

    const payload = {
      name:          this.resellerForm.name,
      email:         this.resellerForm.email,
      password:      this.resellerForm.password,
      phone:         this.resellerForm.phone,
      cnic:          this.resellerForm.cnic,
      businessName:  this.resellerForm.businessName,
      whatsApp:      this.resellerForm.whatsApp,
      city:          this.resellerForm.city,
      address:       this.resellerForm.address,
      paymentMethod: this.resellerForm.paymentMethod,
      accountTitle:  this.resellerForm.accountTitle,
      accountNumber: this.resellerForm.accountNumber,
      bankName:      this.resellerForm.bankName
    };

    this.http.post(`${API_BASE}/reseller/signup`, payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.resellerSuccess.set(true);
      },
      error: err => {
        this.error.set(err.error?.message || 'Submission failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
