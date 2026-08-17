import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgIconsComponent } from '../../shared/components/svg-icons/svg-icons.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, SvgIconsComponent],
  template: `
    <!-- Hero -->
    <div class="about-hero">
      <img src="assets/images/women/women-3.png" alt="About Shopzee" class="about-hero__img" loading="eager"/>
      <div class="about-hero__overlay"></div>
      <div class="about-hero__content">
        <span class="hero-label">Our Story</span>
        <h1 class="hero-title">Crafted with<br/><em>Passion</em></h1>
      </div>
    </div>

    <!-- Story -->
    <section class="section">
      <div class="container">
        <div class="story-layout">
          <div class="story-text reveal-left">
            <span class="section-label">Who We Are</span>
            <h2 class="story-title">Born from a love<br/>of Pakistani fashion</h2>
            <div class="ornament-divider"><div class="line"></div><div class="diamond"></div><div class="line"></div></div>
            <p>Trendzy was founded with a singular vision — to bring the timeless beauty of Pakistani fashion to a modern audience. We believe that every thread tells a story, every embroidery carries heritage, and every garment deserves to be worn with pride.</p>
            <p>From the bustling markets of Lahore to the fashion-forward streets of Karachi, our curated collection celebrates the rich textile traditions of Pakistan while embracing contemporary design sensibilities.</p>
            <a routerLink="/women" class="btn btn-primary" style="margin-top:2rem">Shop the Collection</a>
          </div>
          <div class="story-image reveal-right">
            <img src="assets/images/women/women-1.png" alt="Our collection" loading="lazy"/>
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="section" style="background:var(--cream-dark)">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">What We Stand For</span>
          <h2 class="section-title">Our Values</h2>
        </div>
        <div class="values-grid">
          @for (v of values; track v.title) {
            <div class="value-card reveal">
              <div class="value-icon"><app-icon [name]="v.icon" [size]="32"/></div>
              <h3 class="value-title">{{ v.title }}</h3>
              <p class="value-desc">{{ v.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section section">
      <div class="container">
        <div class="stats-grid">
          @for (stat of stats; track stat.label) {
            <div class="stat-item reveal">
              <span class="stat-number">{{ stat.number }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about-hero { position:relative; height:520px; overflow:hidden; margin-top:0; &__img{width:100%;height:100%;object-fit:cover;object-position:top center;filter:brightness(1.1) contrast(1.05);} &__overlay{position:absolute;inset:0;background:linear-gradient(to bottom, rgba(26,26,26,0.35) 0%, rgba(26,26,26,0.6) 100%);} &__content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--cream);text-align:center;padding-top:100px;} .hero-label{font-size:var(--text-xs);letter-spacing:0.3em;text-transform:uppercase;color:var(--gold-light);margin-bottom:var(--space-3);} .hero-title{font-family:var(--font-heading);font-size:clamp(2.5rem,5vw,4.5rem);font-weight:400;line-height:1.1; em{font-style:italic;color:var(--gold-light);}} }
    .story-layout { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-16); align-items:center; @media(max-width:768px){grid-template-columns:1fr;} }
    .story-title { font-family:var(--font-heading); font-size:clamp(1.75rem,3vw,2.75rem); font-weight:400; margin:var(--space-3) 0 var(--space-4); }
    .story-text p { color:var(--gray-500); line-height:1.8; margin-bottom:var(--space-4); }
    .story-image { aspect-ratio:3/4; overflow:hidden; img{width:100%;height:100%;object-fit:cover;object-position:top center;} }
    .values-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:var(--space-6); @media(max-width:900px){grid-template-columns:repeat(2,1fr);} }
    .value-card { background:var(--cream); padding:var(--space-8); text-align:center; border:1px solid var(--gray-200); transition:box-shadow 0.3s; &:hover{box-shadow:var(--shadow-gold);} }
    .value-icon { width:72px; height:72px; border-radius:50%; background:rgba(201,168,76,0.1); display:flex; align-items:center; justify-content:center; margin:0 auto var(--space-4); app-icon{color:var(--gold);} }
    .value-title { font-family:var(--font-heading); font-size:var(--text-xl); margin-bottom:var(--space-3); }
    .value-desc { font-size:var(--text-sm); color:var(--gray-400); line-height:1.7; }
    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:var(--space-6); text-align:center; @media(max-width:768px){grid-template-columns:repeat(2,1fr);} }
    .stat-item { padding:var(--space-8); border:1px solid var(--gray-200); }
    .stat-number { display:block; font-family:var(--font-heading); font-size:var(--text-6xl); font-weight:400; color:var(--gold); }
    .stat-label { font-size:var(--text-sm); color:var(--gray-400); letter-spacing:0.1em; text-transform:uppercase; }
  `]
})
export class AboutComponent {
  values = [
    { icon: 'star-filled', title: 'Premium Quality', desc: 'We source only the finest fabrics and work with master craftsmen to ensure every piece meets our exacting standards.' },
    { icon: 'heart', title: 'Handcrafted Love', desc: 'Each garment is a labor of love, with intricate embroidery and detailing that reflects generations of Pakistani artistry.' },
    { icon: 'globe', title: 'Cultural Heritage', desc: 'We celebrate the rich textile traditions of Pakistan, from Phulkari to Zari work, keeping heritage alive.' },
    { icon: 'truck', title: 'Reliable Delivery', desc: 'Fast, secure nationwide delivery with careful packaging to ensure your garments arrive in perfect condition.' }
  ];

  stats = [
    { number: '5000+', label: 'Happy Customers' },
    { number: '200+', label: 'Premium Pieces' },
    { number: '15+', label: 'Cities Covered' },
    { number: '4.9★', label: 'Average Rating' }
  ];
}
