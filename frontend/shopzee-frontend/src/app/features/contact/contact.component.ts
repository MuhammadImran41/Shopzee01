import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconsComponent],
  template: `
    <div class="contact-page">
      <!-- Hero -->
      <div class="contact-hero">
        <h1 class="contact-hero__title">Get in Touch</h1>
        <p class="contact-hero__sub">We'd love to hear from you</p>
      </div>

      <div class="container">
        <div class="contact-layout">
          <!-- Contact Form -->
          <div class="contact-form-wrap reveal-left">
            <h2 class="contact-section-title">Send Us a Message</h2>
            @if (!submitted()) {
              <form class="contact-form" (submit)="onSubmit($event)">
                <div class="form-grid">
                  <div class="form-group"><label>Your Name</label><input [(ngModel)]="form.name" name="name" type="text" placeholder="Full name" required/></div>
                  <div class="form-group"><label>Email Address</label><input [(ngModel)]="form.email" name="email" type="email" placeholder="your@email.com" required/></div>
                  <div class="form-group form-full"><label>Subject</label><input [(ngModel)]="form.subject" name="subject" type="text" placeholder="How can we help?"/></div>
                  <div class="form-group form-full"><label>Message</label><textarea [(ngModel)]="form.message" name="message" placeholder="Tell us more..." rows="5" required></textarea></div>
                </div>
                <button type="submit" class="btn btn-primary submit-btn">Send Message <app-icon name="arrow-right" [size]="18"/></button>
              </form>
            } @else {
              <div class="form-success">
                <app-icon name="check-circle" [size]="48" class="success-ico"/>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button class="btn btn-outline" (click)="submitted.set(false)" style="margin-top:1.5rem">Send Another</button>
              </div>
            }
          </div>

          <!-- Info Cards -->
          <div class="contact-info reveal-right">
            @for (info of contactInfo; track info.label) {
              <div class="info-card">
                <div class="info-icon"><app-icon [name]="info.icon" [size]="24"/></div>
                <div>
                  <h3 class="info-label">{{ info.label }}</h3>
                  <p class="info-value">{{ info.value }}</p>
                </div>
              </div>
            }

            <div class="contact-social">
              <h3 class="social-heading">Follow Us</h3>
              <div class="social-row">
                @for (s of socials; track s.name) {
                  <a [href]="s.url" class="social-chip" [attr.aria-label]="s.name">{{ s.name }}</a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-hero { background:var(--black); padding:var(--space-20) var(--space-6); padding-top:calc(var(--space-20) + 100px); text-align:center; &__title{font-family:var(--font-heading);font-size:clamp(2.5rem,5vw,4.5rem);font-weight:400;color:var(--cream);margin-bottom:var(--space-3);} &__sub{color:var(--gold-light);font-size:var(--text-lg);letter-spacing:0.1em;} }
    .contact-layout { display:grid; grid-template-columns:1fr 380px; gap:var(--space-12); padding:var(--space-16) 0; @media(max-width:900px){grid-template-columns:1fr;} }
    .contact-section-title { font-family:var(--font-heading); font-size:var(--text-3xl); font-weight:400; margin-bottom:var(--space-6); padding-bottom:var(--space-4); border-bottom:1px solid var(--gray-200); }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4); margin-bottom:var(--space-6); @media(max-width:600px){grid-template-columns:1fr;} }
    .form-full { grid-column:1/-1; }
    .submit-btn { padding:var(--space-4) var(--space-8); display:flex; align-items:center; gap:var(--space-3); font-size:var(--text-base); }
    .form-success { display:flex; flex-direction:column; align-items:center; gap:var(--space-4); padding:var(--space-12) 0; text-align:center; .success-ico{color:#4CAF50;} h3{font-family:var(--font-heading);font-size:var(--text-3xl);} p{color:var(--gray-400);} }
    .info-card { display:flex; align-items:flex-start; gap:var(--space-4); padding:var(--space-5); border:1px solid var(--gray-200); margin-bottom:var(--space-4); background:var(--cream-light); transition:box-shadow 0.3s; &:hover{box-shadow:var(--shadow-gold);} }
    .info-icon { width:48px; height:48px; border-radius:50%; background:rgba(201,168,76,0.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; app-icon{color:var(--gold);} }
    .info-label { font-size:var(--text-xs); font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold-dark); margin-bottom:var(--space-1); }
    .info-value { font-size:var(--text-sm); color:var(--gray-500); line-height:1.6; }
    .contact-social { padding:var(--space-5); border:1px solid var(--gray-200); background:var(--cream-light); }
    .social-heading { font-size:var(--text-xs); font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold-dark); margin-bottom:var(--space-3); }
    .social-row { display:flex; flex-wrap:wrap; gap:var(--space-2); }
    .social-chip { padding:var(--space-2) var(--space-4); border:1px solid var(--gray-200); font-size:var(--text-xs); color:var(--gray-500); text-decoration:none; transition:all 0.2s; &:hover{border-color:var(--gold);color:var(--gold-dark);} }
  `]
})
export class ContactComponent {
  submitted = signal(false);
  form = { name: '', email: '', subject: '', message: '' };

  contactInfo = [
    { icon: 'map-pin', label: 'Visit Us', value: '123 Fashion Street, DHA Phase 5, Lahore, Pakistan' },
    { icon: 'mail',    label: 'Email Us', value: 'hello@shopzee.pk\nsupport@shopzee.pk' },
    { icon: 'phone',   label: 'Call Us',  value: '+92 300 1234567\n+92 42 3456789' },
    { icon: 'clock',   label: 'Hours',    value: 'Mon–Sat: 10am–8pm\nSun: 12pm–6pm' }
  ];

  socials = [
    { name: 'Instagram', url: '#' },
    { name: 'Facebook',  url: '#' },
    { name: 'TikTok',    url: '#' },
    { name: 'Pinterest', url: '#' }
  ];

  onSubmit(e: Event) {
    e.preventDefault();
    this.submitted.set(true);
    this.form = { name: '', email: '', subject: '', message: '' };
  }
}
