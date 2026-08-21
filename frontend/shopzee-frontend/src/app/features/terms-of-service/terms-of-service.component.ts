import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="policy-page">

      <header class="policy-hero">
        <div class="container">
          <div class="policy-hero__inner">
            <div class="policy-hero__badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Legal Agreement
            </div>
            <h1>Terms of Service</h1>
            <p class="policy-hero__sub">The rules and agreements that govern your use of STYLEMAKER</p>
            <div class="policy-hero__meta">
              <span>Last updated: August 21, 2026</span>
              <span class="dot">·</span>
              <span>Applicable to all users</span>
            </div>
          </div>
        </div>
      </header>

      <div class="container">
        <div class="policy-wrap">

          <aside class="policy-toc">
            <div class="toc-card">
              <p class="toc-heading">On this page</p>
              <nav>
                <a href="#acceptance">1. Acceptance</a>
                <a href="#account">2. Account Registration</a>
                <a href="#products">3. Products &amp; Pricing</a>
                <a href="#orders">4. Orders &amp; Payment</a>
                <a href="#shipping">5. Shipping &amp; Delivery</a>
                <a href="#returns">6. Returns &amp; Refunds</a>
                <a href="#ip">7. Intellectual Property</a>
                <a href="#conduct">8. Prohibited Conduct</a>
                <a href="#liability">9. Limitation of Liability</a>
                <a href="#governing">10. Governing Law</a>
                <a href="#tos-contact">11. Contact</a>
              </nav>
            </div>
            <div class="toc-other-links">
              <p>Related Policies</p>
              <a routerLink="/privacy-policy">Privacy Policy</a>
              <a routerLink="/return-policy">Return &amp; Exchange</a>
            </div>
          </aside>

          <main class="policy-content">

            <div class="intro-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>These Terms of Service govern your use of <strong>stylemaker.store</strong> and all STYLEMAKER services. By accessing or placing an order, you agree to be bound by these Terms. Please read them carefully.</p>
            </div>

            <section id="acceptance">
              <div class="section-label">Section 01</div>
              <h2>Acceptance of Terms</h2>
              <p>By creating an account or placing an order on stylemaker.store, you confirm that:</p>
              <ul>
                <li>You are at least <strong>18 years of age</strong>, or accessing under parental supervision</li>
                <li>You have the legal capacity to enter into a binding agreement</li>
                <li>All information you provide is accurate, current, and complete</li>
                <li>You will comply with all applicable Pakistani laws and these Terms</li>
              </ul>
              <p>STYLEMAKER reserves the right to modify these Terms at any time. Continued use after changes constitutes acceptance.</p>
            </section>

            <section id="account">
              <div class="section-label">Section 02</div>
              <h2>Account Registration</h2>
              <p>To place orders, you may be required to create an account. You are responsible for:</p>
              <ul>
                <li>Maintaining the <strong>confidentiality</strong> of your login credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized account access</li>
                <li>Keeping your account information accurate and up to date</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts involved in fraudulent activity, policy violations, or platform abuse.</p>
            </section>

            <section id="products">
              <div class="section-label">Section 03</div>
              <h2>Products &amp; Pricing</h2>
              <h3>Product Descriptions</h3>
              <p>We strive to display product images and colors accurately. Due to screen calibrations and photography lighting, actual product colors may vary slightly. We cannot guarantee that images perfectly represent the physical product.</p>
              <h3>Pricing Policy</h3>
              <ul>
                <li>All prices are listed in <strong>Pakistani Rupees (PKR)</strong></li>
                <li>Prices may change without prior notice</li>
                <li>Sale prices are valid for the specified promotional period only</li>
                <li>In case of a pricing error, STYLEMAKER reserves the right to cancel orders placed at the incorrect price and will notify the customer</li>
              </ul>
              <h3>Availability</h3>
              <p>Product availability is subject to stock levels. We reserve the right to limit quantities, discontinue products, or refuse service at our discretion.</p>
            </section>

            <section id="orders">
              <div class="section-label">Section 04</div>
              <h2>Orders &amp; Payment</h2>
              <h3>Order Placement</h3>
              <p>Placing an order constitutes an offer to purchase. STYLEMAKER may accept or decline any order, including due to unavailability, pricing errors, or suspected fraud. An order confirmation email does not guarantee acceptance — acceptance occurs upon dispatch.</p>
              <h3>Accepted Payment Methods</h3>
              <ul>
                <li><strong>Cash on Delivery (COD)</strong> — Payment collected upon delivery</li>
                <li><strong>EasyPaisa</strong> — Mobile wallet transfer</li>
                <li><strong>JazzCash</strong> — Mobile wallet transfer</li>
                <li><strong>Bank Transfer</strong> — Direct bank account deposit</li>
              </ul>
              <h3>Cancellations</h3>
              <p>Orders may be cancelled before dispatch. Once shipped, orders cannot be cancelled but may be returned per our Return Policy.</p>
            </section>

            <section id="shipping">
              <div class="section-label">Section 05</div>
              <h2>Shipping &amp; Delivery</h2>
              <ul>
                <li><strong>Free shipping</strong> on all orders above <strong>PKR 5,000</strong></li>
                <li>Standard delivery charge: <strong>PKR 300</strong> for orders below PKR 5,000</li>
                <li>Estimated delivery: <strong>3–7 working days</strong> across Pakistan</li>
                <li>Remote areas may require additional time</li>
                <li>STYLEMAKER is not liable for delays caused by courier companies, weather, or force majeure</li>
                <li>Risk of loss transfers to the customer upon handover to the courier</li>
              </ul>
              <p>If your order hasn't arrived within the estimated window, contact us and we will investigate with our courier partner.</p>
            </section>

            <section id="returns">
              <div class="section-label">Section 06</div>
              <h2>Returns &amp; Refunds</h2>
              <p>Our full Return Policy is available at <a routerLink="/return-policy">Return &amp; Exchange Policy</a>. Key highlights:</p>
              <ul>
                <li>Returns accepted within <strong>7 days</strong> of delivery date</li>
                <li>Items must be unused, unwashed, and in original packaging with all tags</li>
                <li>Sale and discounted items are <strong>non-refundable</strong> unless defective</li>
                <li>Refunds processed within <strong>5–10 business days</strong> after approval</li>
              </ul>
            </section>

            <section id="ip">
              <div class="section-label">Section 07</div>
              <h2>Intellectual Property</h2>
              <p>All content on stylemaker.store — including text, graphics, logos, product images, and software — is the exclusive property of STYLEMAKER and is protected under Pakistani and international intellectual property laws.</p>
              <p>You may <strong>not</strong>:</p>
              <ul>
                <li>Copy, reproduce, or commercially exploit any content without written permission</li>
                <li>Use our trademarks, logo, or brand name without prior written consent</li>
                <li>Reverse engineer or extract source code from our platform</li>
                <li>Use our product images for resale or personal brand promotion without authorization</li>
              </ul>
            </section>

            <section id="conduct">
              <div class="section-label">Section 08</div>
              <h2>Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use our platform for any unlawful purpose</li>
                <li>Submit false, misleading, or fraudulent orders or reviews</li>
                <li>Attempt to gain unauthorized access to our systems or data</li>
                <li>Harass or threaten STYLEMAKER staff or other customers</li>
                <li>Use automated scripts or bots to scrape or overload our platform</li>
                <li>Engage in any activity that disrupts or interferes with our services</li>
              </ul>
              <div class="callout callout--gold">
                Violation of these prohibitions may result in immediate account termination, order cancellation, and potential legal action under applicable Pakistani law.
              </div>
            </section>

            <section id="liability">
              <div class="section-label">Section 09</div>
              <h2>Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, STYLEMAKER is not liable for:</p>
              <ul>
                <li>Indirect, incidental, or consequential damages from platform use</li>
                <li>Loss of data, profits, or business opportunities</li>
                <li>Delays caused by courier partners, weather, or other events beyond our control</li>
                <li>Issues arising from third-party payment processors</li>
                <li>Losses due to unauthorized account access not caused by our negligence</li>
              </ul>
              <p>Our total liability to any customer shall not exceed the <strong>total amount paid</strong> for the specific order in question.</p>
            </section>

            <section id="governing">
              <div class="section-label">Section 10</div>
              <h2>Governing Law</h2>
              <p>These Terms are governed by the laws of the <strong>Islamic Republic of Pakistan</strong>. Any disputes shall be subject to the exclusive jurisdiction of Pakistani courts. We encourage amicable resolution of disputes before pursuing legal action.</p>
            </section>

            <section id="tos-contact">
              <div class="section-label">Section 11</div>
              <h2>Contact</h2>
              <p>Questions about these Terms? We're here to help:</p>
              <div class="contact-block">
                <div class="cb-row"><span class="cb-icon">✉️</span><div><strong>Email</strong><a href="mailto:trendzyofficial.store@gmail.com">trendzyofficial.store&#64;gmail.com</a></div></div>
                <div class="cb-row"><span class="cb-icon">🌐</span><div><strong>Website</strong><a href="https://stylemaker.store">stylemaker.store</a></div></div>
                <div class="cb-row"><span class="cb-icon">⏱️</span><div><strong>Response time</strong><span>Within 48 business hours</span></div></div>
              </div>
            </section>

            <div class="related-nav">
              <a routerLink="/privacy-policy" class="related-card">
                <div class="rc-icon">🔒</div>
                <div><strong>Privacy Policy</strong><span>How we handle your data</span></div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a routerLink="/return-policy" class="related-card">
                <div class="rc-icon">🔄</div>
                <div><strong>Return &amp; Exchange</strong><span>Returns, refunds, exchanges</span></div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>

          </main>
        </div>
      </div>
    </article>
  `,
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent {}
