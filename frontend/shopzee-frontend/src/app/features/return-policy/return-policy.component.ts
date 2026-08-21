import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-return-policy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="policy-page">

      <header class="policy-hero">
        <div class="container">
          <div class="policy-hero__inner">
            <div class="policy-hero__badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
              Customer Care
            </div>
            <h1>Return &amp; Exchange Policy</h1>
            <p class="policy-hero__sub">Easy returns, smooth exchanges — because your satisfaction comes first</p>
            <div class="policy-hero__meta">
              <span>Last updated: August 21, 2026</span>
              <span class="dot">·</span>
              <span>7-day return window</span>
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
                <a href="#overview">1. Overview</a>
                <a href="#eligible">2. Eligible Returns</a>
                <a href="#not-eligible">3. Non-Returnable Items</a>
                <a href="#process">4. Return Process</a>
                <a href="#exchange">5. Exchange Policy</a>
                <a href="#refunds">6. Refund Methods</a>
                <a href="#defective">7. Defective Items</a>
                <a href="#shipping-cost">8. Shipping Costs</a>
                <a href="#rp-contact">9. Contact Us</a>
              </nav>
            </div>
            <div class="toc-other-links">
              <p>Related Policies</p>
              <a routerLink="/privacy-policy">Privacy Policy</a>
              <a routerLink="/terms-of-service">Terms of Service</a>
            </div>
          </aside>

          <main class="policy-content">

            <div class="intro-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              <p>At <strong>STYLEMAKER</strong>, your satisfaction is everything. If your order isn't right, we'll make it right — quickly, fairly, and without unnecessary hassle.</p>
            </div>

            <!-- Quick Stats -->
            <div class="summary-cards">
              <div class="summary-card">
                <div class="sc-icon">📦</div>
                <strong>7 Days</strong>
                <span>Return window from delivery date</span>
              </div>
              <div class="summary-card">
                <div class="sc-icon">🔄</div>
                <strong>Free Exchange</strong>
                <span>Size or color swap available</span>
              </div>
              <div class="summary-card">
                <div class="sc-icon">💰</div>
                <strong>5–10 Days</strong>
                <span>Refund processing timeline</span>
              </div>
              <div class="summary-card">
                <div class="sc-icon">✅</div>
                <strong>Original Condition</strong>
                <span>Unworn, tags intact required</span>
              </div>
            </div>

            <section id="overview">
              <div class="section-label">Section 01</div>
              <h2>Overview</h2>
              <p>We accept returns and exchanges within <strong>7 calendar days</strong> of the delivery date. All return requests must be initiated by contacting our customer support team before shipping anything back.</p>
              <div class="callout callout--gold">
                <strong>⚡ Important:</strong> Items sent back without prior authorization will not be accepted. Always contact us first.
              </div>
            </section>

            <section id="eligible">
              <div class="section-label">Section 02</div>
              <h2>Eligible Returns</h2>
              <p>To be eligible for a return or exchange, <strong>all of the following</strong> must be true:</p>
              <ul>
                <li>Returned within <strong>7 days</strong> of the delivery date</li>
                <li>Item is <strong>unused, unworn, and unwashed</strong></li>
                <li>All <strong>original tags, labels, and packaging</strong> are intact and attached</li>
                <li>No <strong>stains, odors, tears, or signs of use</strong></li>
                <li>Valid <strong>order number</strong> is provided</li>
                <li>Item was purchased at <strong>full price</strong> (not on sale)</li>
              </ul>
            </section>

            <section id="not-eligible">
              <div class="section-label">Section 03</div>
              <h2>Non-Returnable Items</h2>
              <div class="not-eligible-box">
                <h4>⛔ Cannot be returned or exchanged</h4>
                <ul>
                  <li>Sale &amp; discounted items — all sale purchases are final (unless defective)</li>
                  <li>Custom or tailored items made to specific measurements</li>
                  <li>Items marked "Final Sale" at time of purchase</li>
                  <li>Worn, washed, altered, or customer-damaged items</li>
                  <li>Items returned after 7 days of delivery</li>
                  <li>Items missing original tags and packaging</li>
                  <li>Gift cards and digital vouchers</li>
                </ul>
              </div>
            </section>

            <section id="process">
              <div class="section-label">Section 04</div>
              <h2>Return Process</h2>
              <p>Follow these 4 steps to initiate a return:</p>
              <div class="steps-list">
                <div class="step-row">
                  <div class="step-num">1</div>
                  <div class="step-body">
                    <h4>Contact Us First</h4>
                    <p>Email <a href="mailto:trendzyofficial.store@gmail.com">trendzyofficial.store&#64;gmail.com</a> with your order number, item(s) to return, and reason. Include photos if the item is defective.</p>
                  </div>
                </div>
                <div class="step-row">
                  <div class="step-num">2</div>
                  <div class="step-body">
                    <h4>Wait for Authorization</h4>
                    <p>We'll respond within <strong>2 business days</strong> with approval or explanation. Do not ship items before receiving our go-ahead.</p>
                  </div>
                </div>
                <div class="step-row">
                  <div class="step-num">3</div>
                  <div class="step-body">
                    <h4>Pack &amp; Ship</h4>
                    <p>Securely pack the item in its original packaging. Ship to the address in our approval email. We recommend using a <strong>tracked courier service</strong>.</p>
                  </div>
                </div>
                <div class="step-row">
                  <div class="step-num">4</div>
                  <div class="step-body">
                    <h4>Inspection &amp; Processing</h4>
                    <p>We inspect returned items within <strong>2–3 business days</strong> of receipt. Approved returns are processed for refund or exchange immediately.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="exchange">
              <div class="section-label">Section 05</div>
              <h2>Exchange Policy</h2>
              <p>We offer free exchanges for a <strong>different size or color</strong> of the same product, subject to availability:</p>
              <ul>
                <li>Follow the same return process (steps 1–4 above)</li>
                <li>Specify your desired size/color in the email</li>
                <li>If the requested variant is unavailable, a full refund will be issued</li>
                <li>STYLEMAKER covers shipping on the <strong>first exchange</strong> per order</li>
                <li>Subsequent exchanges may incur a shipping fee</li>
              </ul>
            </section>

            <section id="refunds">
              <div class="section-label">Section 06</div>
              <h2>Refund Methods</h2>
              <p>After inspection and approval, refunds are processed as follows:</p>
              <table class="refund-table">
                <thead>
                  <tr>
                    <th>Payment Method</th>
                    <th>Refund To</th>
                    <th>Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>Cash on Delivery</strong></td><td>Bank transfer / EasyPaisa / JazzCash</td><td>5–7 business days</td></tr>
                  <tr><td><strong>EasyPaisa</strong></td><td>EasyPaisa wallet</td><td>3–5 business days</td></tr>
                  <tr><td><strong>JazzCash</strong></td><td>JazzCash wallet</td><td>3–5 business days</td></tr>
                  <tr><td><strong>Bank Transfer</strong></td><td>Original bank account</td><td>5–10 business days</td></tr>
                </tbody>
              </table>
              <p>Original shipping charges are <strong>non-refundable</strong> unless the return is due to our error.</p>
            </section>

            <section id="defective">
              <div class="section-label">Section 07</div>
              <h2>Defective or Wrong Items</h2>
              <p>We sincerely apologize if you received a damaged or incorrect item. In such cases:</p>
              <ul>
                <li>Contact us within <strong>48 hours</strong> of delivery with clear photographs</li>
                <li>We will arrange a <strong>free pickup</strong> from your address</li>
                <li>You will receive a <strong>full refund</strong> (including original shipping) or a replacement</li>
                <li>Zero return shipping cost for defective or incorrectly sent items</li>
              </ul>
              <div class="callout callout--gold">
                📸 <strong>Tip:</strong> Always photograph your unboxing, especially if packaging appears damaged. This helps us process claims faster.
              </div>
            </section>

            <section id="shipping-cost">
              <div class="section-label">Section 08</div>
              <h2>Return Shipping Costs</h2>
              <ul>
                <li><strong>Customer-initiated return</strong> (size issue, change of mind): Customer pays return shipping</li>
                <li><strong>Defective or wrong item:</strong> STYLEMAKER covers 100% of return shipping</li>
                <li><strong>Exchange:</strong> STYLEMAKER covers outbound shipping for the replacement item</li>
              </ul>
              <p>We recommend using a courier with package tracking. STYLEMAKER is not liable for return packages lost in transit without a tracking number.</p>
            </section>

            <section id="rp-contact">
              <div class="section-label">Section 09</div>
              <h2>Contact Us</h2>
              <p>Our customer care team is ready to help:</p>
              <div class="contact-block">
                <div class="cb-row"><span class="cb-icon">✉️</span><div><strong>Email</strong><a href="mailto:trendzyofficial.store@gmail.com">trendzyofficial.store&#64;gmail.com</a></div></div>
                <div class="cb-row"><span class="cb-icon">🌐</span><div><strong>Website</strong><a href="https://stylemaker.store">stylemaker.store</a></div></div>
                <div class="cb-row"><span class="cb-icon">⏱️</span><div><strong>Response time</strong><span>24–48 hours (business days)</span></div></div>
              </div>
            </section>

            <div class="related-nav">
              <a routerLink="/privacy-policy" class="related-card">
                <div class="rc-icon">🔒</div>
                <div><strong>Privacy Policy</strong><span>How we protect your data</span></div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a routerLink="/terms-of-service" class="related-card">
                <div class="rc-icon">📋</div>
                <div><strong>Terms of Service</strong><span>Usage rules and agreements</span></div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>

          </main>
        </div>
      </div>
    </article>
  `,
  styleUrls: ['./return-policy.component.scss']
})
export class ReturnPolicyComponent {}
