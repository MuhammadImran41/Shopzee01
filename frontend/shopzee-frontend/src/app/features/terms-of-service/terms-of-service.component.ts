import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="policy-page">
      <div class="policy-hero">
        <div class="container">
          <p class="policy-label">Legal</p>
          <h1 class="policy-title">Terms of Service</h1>
          <p class="policy-updated">Last updated: August 21, 2026</p>
        </div>
      </div>

      <div class="container">
        <div class="policy-layout">

          <aside class="policy-toc">
            <p class="toc-title">Contents</p>
            <ul>
              <li><a href="#acceptance">Acceptance of Terms</a></li>
              <li><a href="#account">Account Registration</a></li>
              <li><a href="#products">Products & Pricing</a></li>
              <li><a href="#orders">Orders & Payment</a></li>
              <li><a href="#shipping">Shipping & Delivery</a></li>
              <li><a href="#returns">Returns & Refunds</a></li>
              <li><a href="#ip">Intellectual Property</a></li>
              <li><a href="#conduct">Prohibited Conduct</a></li>
              <li><a href="#liability">Limitation of Liability</a></li>
              <li><a href="#governing">Governing Law</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </aside>

          <main class="policy-content">

            <div class="policy-intro">
              <p>
                These Terms of Service ("Terms") govern your use of the STYLEMAKER website at
                <strong>stylemaker.store</strong> and all associated services. By accessing or using our
                platform, you agree to be bound by these Terms. If you do not agree, please do not use our services.
              </p>
            </div>

            <section id="acceptance" class="policy-section">
              <h2>1. Acceptance of Terms</h2>
              <p>By creating an account or placing an order on stylemaker.store, you confirm that:</p>
              <ul>
                <li>You are at least <strong>18 years of age</strong> or accessing the site under parental/guardian supervision</li>
                <li>You have the legal capacity to enter into a binding agreement</li>
                <li>The information you provide is accurate, current, and complete</li>
                <li>You will comply with all applicable laws and these Terms</li>
              </ul>
              <p>STYLEMAKER reserves the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>
            </section>

            <section id="account" class="policy-section">
              <h2>2. Account Registration</h2>
              <p>To place orders, you may be required to create an account. You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring your account information is accurate and up to date</li>
              </ul>
              <p>STYLEMAKER reserves the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or abuse our platform in any way.</p>
            </section>

            <section id="products" class="policy-section">
              <h2>3. Products & Pricing</h2>
              <h3>Product Descriptions</h3>
              <p>We strive to display product images, colors, and descriptions as accurately as possible. However, actual colors may vary slightly due to screen calibrations and photography lighting. STYLEMAKER does not guarantee that product images perfectly represent the physical product.</p>

              <h3>Pricing</h3>
              <ul>
                <li>All prices are listed in <strong>Pakistani Rupees (PKR)</strong></li>
                <li>Prices are subject to change without prior notice</li>
                <li>Sale prices are valid for the specified promotional period only</li>
                <li>In case of a pricing error on our website, STYLEMAKER reserves the right to cancel orders placed at the incorrect price</li>
              </ul>

              <h3>Availability</h3>
              <p>Product availability is not guaranteed. We reserve the right to limit quantities, discontinue products, or refuse service to any customer at our sole discretion.</p>
            </section>

            <section id="orders" class="policy-section">
              <h2>4. Orders & Payment</h2>
              <h3>Order Placement</h3>
              <p>By placing an order, you make an offer to purchase the selected products. STYLEMAKER reserves the right to accept or decline any order for any reason, including but not limited to product unavailability, pricing errors, or suspected fraud.</p>

              <h3>Payment Methods</h3>
              <ul>
                <li><strong>Cash on Delivery (COD):</strong> Payment collected upon delivery</li>
                <li><strong>EasyPaisa:</strong> Mobile wallet payment</li>
                <li><strong>JazzCash:</strong> Mobile wallet payment</li>
                <li><strong>Bank Transfer:</strong> Direct bank account transfer</li>
              </ul>

              <h3>Order Confirmation</h3>
              <p>An order confirmation email will be sent to your registered email address upon successful placement. This confirmation does not constitute acceptance of the order — acceptance occurs when the order is dispatched.</p>

              <h3>Cancellation</h3>
              <p>Orders may be cancelled before dispatch. Once an order has been shipped, it cannot be cancelled but may be returned per our Return Policy.</p>
            </section>

            <section id="shipping" class="policy-section">
              <h2>5. Shipping & Delivery</h2>
              <ul>
                <li><strong>Free shipping</strong> on all orders above <strong>PKR 5,000</strong></li>
                <li>Standard delivery charge of <strong>PKR 300</strong> for orders below PKR 5,000</li>
                <li>Estimated delivery time: <strong>3–7 working days</strong> within Pakistan</li>
                <li>Remote areas may take additional time</li>
                <li>STYLEMAKER is not responsible for delays caused by courier companies, natural disasters, or other events beyond our control</li>
                <li>Risk of loss passes to the customer upon delivery to the courier</li>
              </ul>
              <p>If your order has not arrived within the expected timeframe, please contact us and we will investigate with our courier partner.</p>
            </section>

            <section id="returns" class="policy-section">
              <h2>6. Returns & Refunds</h2>
              <p>Our detailed Return Policy is available at <a routerLink="/return-policy">Return &amp; Exchange Policy</a>. Key highlights:</p>
              <ul>
                <li>Returns accepted within <strong>7 days</strong> of delivery</li>
                <li>Items must be unused, unwashed, and in original packaging</li>
                <li>Sale items are <strong>non-refundable</strong> unless defective</li>
                <li>Refunds processed within <strong>5–10 business days</strong></li>
              </ul>
            </section>

            <section id="ip" class="policy-section">
              <h2>7. Intellectual Property</h2>
              <p>All content on stylemaker.store — including but not limited to text, graphics, logos, product images, and software — is the exclusive property of STYLEMAKER and is protected by Pakistani and international intellectual property laws.</p>
              <p>You may <strong>not</strong>:</p>
              <ul>
                <li>Copy, reproduce, distribute, or commercially exploit any content without written permission</li>
                <li>Use our trademarks, logo, or brand name without prior written consent</li>
                <li>Reverse engineer or attempt to extract source code from our platform</li>
              </ul>
            </section>

            <section id="conduct" class="policy-section">
              <h2>8. Prohibited Conduct</h2>
              <p>You agree not to engage in any of the following:</p>
              <ul>
                <li>Using our platform for any unlawful purpose</li>
                <li>Submitting false, misleading, or fraudulent orders or information</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Harassing, threatening, or abusing STYLEMAKER staff or other customers</li>
                <li>Posting false or defamatory reviews about our products</li>
                <li>Using automated scripts or bots to access our platform</li>
              </ul>
              <p>Violation of these prohibitions may result in immediate account termination and legal action.</p>
            </section>

            <section id="liability" class="policy-section">
              <h2>9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, STYLEMAKER shall not be liable for:</p>
              <ul>
                <li>Indirect, incidental, or consequential damages arising from use of our platform</li>
                <li>Loss of data, profits, or business opportunities</li>
                <li>Damages resulting from courier delays, natural disasters, or force majeure events</li>
                <li>Issues arising from third-party payment processors or services</li>
              </ul>
              <p>Our total liability to any customer shall not exceed the <strong>total amount paid</strong> for the specific order in dispute.</p>
            </section>

            <section id="governing" class="policy-section">
              <h2>10. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of the <strong>Islamic Republic of Pakistan</strong>. Any disputes arising from these Terms or your use of our platform shall be subject to the exclusive jurisdiction of the courts of Pakistan.</p>
            </section>

            <section id="contact" class="policy-section">
              <h2>11. Contact</h2>
              <p>For questions about these Terms, please contact us:</p>
              <div class="contact-card">
                <p><strong>STYLEMAKER</strong></p>
                <p>📧 Email: <a href="mailto:trendzyofficial.store@gmail.com">trendzyofficial.store&#64;gmail.com</a></p>
                <p>🌐 Website: <a href="https://stylemaker.store">stylemaker.store</a></p>
              </div>
            </section>

            <div class="policy-nav">
              <a routerLink="/privacy-policy" class="btn btn-outline">← Privacy Policy</a>
              <a routerLink="/return-policy" class="btn btn-outline">Return Policy →</a>
            </div>

          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .policy-page { background: var(--cream); min-height: 100vh; }
    .policy-hero {
      background: var(--black); padding: 100px 0 48px;
      .policy-label { font-size:0.7rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--gold); margin-bottom:0.75rem; display:block; }
      .policy-title { font-family:var(--font-heading); font-size:clamp(2.5rem,5vw,4rem); font-weight:400; color:var(--cream); margin-bottom:0.75rem; }
      .policy-updated { font-size:0.875rem; color:rgba(245,240,232,0.45); }
    }
    .policy-layout {
      display:grid; grid-template-columns:220px 1fr; gap:4rem; padding:3rem 0 5rem;
      @media(max-width:900px) { grid-template-columns:1fr; }
    }
    .policy-toc {
      position:sticky; top:100px; height:fit-content;
      @media(max-width:900px) { display:none; }
      .toc-title { font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--gold); font-weight:700; margin-bottom:1rem; }
      ul { list-style:none; padding:0; display:flex; flex-direction:column; gap:0.25rem; }
      a { font-size:0.8125rem; color:var(--gray-500); text-decoration:none; display:block; padding:0.35rem 0.75rem; border-left:2px solid var(--gray-200); transition:all 0.2s; &:hover{color:var(--gold-dark);border-left-color:var(--gold);} }
    }
    .policy-intro { background:var(--cream-light); border-left:3px solid var(--gold); padding:1.25rem 1.5rem; margin-bottom:2.5rem; p{font-size:0.9375rem;line-height:1.8;color:var(--black-soft);margin:0;} }
    .policy-section {
      margin-bottom:2.5rem; padding-bottom:2.5rem; border-bottom:1px solid var(--gray-200); &:last-of-type{border-bottom:none;}
      h2 { font-family:var(--font-heading); font-size:1.5rem; font-weight:500; color:var(--black); margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid var(--gray-200); }
      h3 { font-size:0.875rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--gold-dark); margin:1.25rem 0 0.5rem; }
      p { font-size:0.9375rem; line-height:1.8; color:var(--gray-500); margin-bottom:0.875rem; a{color:var(--gold);text-decoration:none;&:hover{text-decoration:underline;}} }
      ul { padding-left:0; list-style:none; display:flex; flex-direction:column; gap:0.5rem; margin-bottom:0.875rem;
        li { font-size:0.9375rem; line-height:1.7; color:var(--gray-500); padding-left:1.25rem; position:relative; &::before{content:'—';position:absolute;left:0;color:var(--gold);font-size:0.75rem;top:0.35rem;} strong{color:var(--black-soft);} }
      }
    }
    .contact-card { background:var(--black); padding:1.5rem 2rem; margin:1rem 0; p{color:rgba(245,240,232,0.75);margin-bottom:0.5rem;font-size:0.9rem;line-height:1.6; strong{color:var(--gold-light);} a{color:var(--gold);text-decoration:none;&:hover{text-decoration:underline;}} } }
    .policy-nav { display:flex; gap:1rem; flex-wrap:wrap; margin-top:3rem; padding-top:2rem; border-top:1px solid var(--gray-200); }
  `]
})
export class TermsOfServiceComponent {}
