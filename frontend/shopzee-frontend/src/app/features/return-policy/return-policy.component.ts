import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-return-policy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="policy-page">
      <div class="policy-hero">
        <div class="container">
          <p class="policy-label">Customer Care</p>
          <h1 class="policy-title">Return & Exchange Policy</h1>
          <p class="policy-updated">Last updated: August 21, 2026</p>
        </div>
      </div>

      <div class="container">
        <div class="policy-layout">

          <aside class="policy-toc">
            <p class="toc-title">Contents</p>
            <ul>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#eligible">What Can Be Returned</a></li>
              <li><a href="#not-eligible">Non-Returnable Items</a></li>
              <li><a href="#process">Return Process</a></li>
              <li><a href="#exchange">Exchange Policy</a></li>
              <li><a href="#refunds">Refund Methods</a></li>
              <li><a href="#defective">Defective Items</a></li>
              <li><a href="#shipping-cost">Return Shipping</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </aside>

          <main class="policy-content">

            <div class="policy-intro">
              <p>
                At <strong>STYLEMAKER</strong>, customer satisfaction is our highest priority. If you are not completely
                satisfied with your purchase, we're here to help. Please read our Return &amp; Exchange Policy carefully
                before initiating a return.
              </p>
            </div>

            <!-- Quick Summary Cards -->
            <div class="summary-cards">
              <div class="summary-card">
                <div class="card-icon">📦</div>
                <div class="card-text">
                  <strong>7 Days</strong>
                  <span>Return window from delivery date</span>
                </div>
              </div>
              <div class="summary-card">
                <div class="card-icon">🔄</div>
                <div class="card-text">
                  <strong>Free Exchange</strong>
                  <span>Size or color exchange available</span>
                </div>
              </div>
              <div class="summary-card">
                <div class="card-icon">💰</div>
                <div class="card-text">
                  <strong>5–10 Days</strong>
                  <span>Refund processing time</span>
                </div>
              </div>
              <div class="summary-card">
                <div class="card-icon">✅</div>
                <div class="card-text">
                  <strong>Original Condition</strong>
                  <span>Items must be unworn & unaltered</span>
                </div>
              </div>
            </div>

            <section id="overview" class="policy-section">
              <h2>1. Overview</h2>
              <p>We accept returns and exchanges within <strong>7 calendar days</strong> of the delivery date. All return requests must be initiated by contacting our customer support team via email or WhatsApp. Items sent back without prior authorization will not be accepted.</p>
              <div class="highlight-box">
                <p>⚡ <strong>Important:</strong> To qualify for a return, please contact us within 7 days of receiving your order. Returns requested after this period will not be accepted under any circumstances.</p>
              </div>
            </section>

            <section id="eligible" class="policy-section">
              <h2>2. What Can Be Returned</h2>
              <p>To be eligible for a return or exchange, the following conditions <strong>must all be met</strong>:</p>
              <ul>
                <li>Item must be returned within <strong>7 days</strong> of delivery</li>
                <li>Item must be in its <strong>original, unused condition</strong> — unworn, unwashed, and unaltered</li>
                <li>All original <strong>tags, labels, and packaging</strong> must be intact and attached</li>
                <li>Item must not have any <strong>stains, tears, odors, or signs of use</strong></li>
                <li>A valid <strong>order number</strong> must be provided</li>
                <li>Item must have been purchased at <strong>full price</strong> (see non-returnable items below)</li>
              </ul>
            </section>

            <section id="not-eligible" class="policy-section">
              <h2>3. Non-Returnable Items</h2>
              <p>The following items <strong>cannot be returned or exchanged</strong>:</p>
              <ul>
                <li><strong>Sale & discounted items</strong> — All sale purchases are final (unless the item is defective or wrongly delivered)</li>
                <li><strong>Custom/tailored items</strong> — Items made to specific measurements or customized at customer request</li>
                <li><strong>Intimate apparel</strong> — For hygiene reasons</li>
                <li><strong>Items marked "Final Sale"</strong> at time of purchase</li>
                <li>Items that have been <strong>worn, washed, altered, or damaged</strong> by the customer</li>
                <li>Items returned <strong>after 7 days</strong> of delivery</li>
                <li>Items without <strong>original tags and packaging</strong></li>
                <li>Gift cards</li>
              </ul>
            </section>

            <section id="process" class="policy-section">
              <h2>4. Return Process</h2>
              <p>Follow these steps to initiate a return:</p>

              <div class="steps">
                <div class="step-item">
                  <div class="step-num">1</div>
                  <div class="step-body">
                    <h4>Contact Us</h4>
                    <p>Email us at <a href="mailto:trendzyofficial.store@gmail.com">trendzyofficial.store&#64;gmail.com</a> with your order number, the item(s) you wish to return, and the reason for return. Include clear photographs if the item is defective.</p>
                  </div>
                </div>
                <div class="step-item">
                  <div class="step-num">2</div>
                  <div class="step-body">
                    <h4>Await Authorization</h4>
                    <p>Our team will review your request and respond within <strong>2 business days</strong> with either approval or the reason for denial. Do not ship items before receiving authorization.</p>
                  </div>
                </div>
                <div class="step-item">
                  <div class="step-num">3</div>
                  <div class="step-body">
                    <h4>Pack & Ship</h4>
                    <p>Once approved, securely pack the item in its original packaging. Ship to the address provided in our authorization email. We recommend using a tracked courier service.</p>
                  </div>
                </div>
                <div class="step-item">
                  <div class="step-num">4</div>
                  <div class="step-body">
                    <h4>Inspection & Processing</h4>
                    <p>Upon receiving the returned item, our quality team will inspect it within <strong>2–3 business days</strong>. If approved, your refund or exchange will be processed.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="exchange" class="policy-section">
              <h2>5. Exchange Policy</h2>
              <p>We offer free exchanges for a <strong>different size or color</strong> of the same product, subject to availability. For exchanges:</p>
              <ul>
                <li>Follow the same return process (steps 1–4 above)</li>
                <li>Specify in your email that you want an exchange and mention the desired size/color</li>
                <li>If the requested size or color is unavailable, we will offer a refund</li>
                <li>Exchange shipping costs are borne by STYLEMAKER for the first exchange</li>
                <li>Subsequent exchanges on the same order may incur shipping charges</li>
              </ul>
            </section>

            <section id="refunds" class="policy-section">
              <h2>6. Refund Methods</h2>
              <p>Once your return is approved and inspected, refunds will be processed as follows:</p>

              <div class="refund-table">
                <div class="refund-row header">
                  <span>Payment Method</span>
                  <span>Refund Method</span>
                  <span>Processing Time</span>
                </div>
                <div class="refund-row">
                  <span>Cash on Delivery</span>
                  <span>Bank transfer or EasyPaisa/JazzCash</span>
                  <span>5–7 business days</span>
                </div>
                <div class="refund-row">
                  <span>EasyPaisa</span>
                  <span>EasyPaisa wallet</span>
                  <span>3–5 business days</span>
                </div>
                <div class="refund-row">
                  <span>JazzCash</span>
                  <span>JazzCash wallet</span>
                  <span>3–5 business days</span>
                </div>
                <div class="refund-row">
                  <span>Bank Transfer</span>
                  <span>Original bank account</span>
                  <span>5–10 business days</span>
                </div>
              </div>

              <p style="margin-top:1rem">Original shipping charges are <strong>non-refundable</strong> unless the return is due to our error (wrong or defective item).</p>
            </section>

            <section id="defective" class="policy-section">
              <h2>7. Defective or Wrong Items</h2>
              <p>If you received a <strong>defective, damaged, or incorrect item</strong>, we sincerely apologize. In such cases:</p>
              <ul>
                <li>Contact us within <strong>48 hours</strong> of delivery with photographs of the issue</li>
                <li>We will arrange a <strong>free pickup</strong> from your address</li>
                <li>You will receive a <strong>full refund</strong> including original shipping cost, or a replacement at no additional charge</li>
                <li>No return shipping cost will be charged for defective/wrong items</li>
              </ul>
              <div class="highlight-box">
                <p>📸 <strong>Tip:</strong> Always photograph your package upon receiving it, especially if packaging appears damaged during transit. This helps us process your claim faster.</p>
              </div>
            </section>

            <section id="shipping-cost" class="policy-section">
              <h2>8. Return Shipping Costs</h2>
              <ul>
                <li><strong>Customer-initiated returns</strong> (change of mind, size issue): Return shipping cost is borne by the customer</li>
                <li><strong>Defective or wrong item:</strong> STYLEMAKER covers all return shipping costs</li>
                <li><strong>Exchange:</strong> STYLEMAKER covers outbound shipping for the replacement item</li>
              </ul>
              <p>We recommend using a reliable courier with tracking. STYLEMAKER is not responsible for return packages lost in transit without a tracking number.</p>
            </section>

            <section id="contact" class="policy-section">
              <h2>9. Contact Us</h2>
              <p>Our customer care team is available to help you with returns and exchanges:</p>
              <div class="contact-card">
                <p><strong>STYLEMAKER Customer Care</strong></p>
                <p>📧 Email: <a href="mailto:trendzyofficial.store@gmail.com">trendzyofficial.store&#64;gmail.com</a></p>
                <p>🌐 Website: <a href="https://stylemaker.store">stylemaker.store</a></p>
                <p>🕐 Response time: Within 24–48 hours (business days)</p>
              </div>
            </section>

            <div class="policy-nav">
              <a routerLink="/privacy-policy" class="btn btn-outline">← Privacy Policy</a>
              <a routerLink="/terms-of-service" class="btn btn-outline">← Terms of Service</a>
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
    .policy-intro { background:var(--cream-light); border-left:3px solid var(--gold); padding:1.25rem 1.5rem; margin-bottom:2rem; p{font-size:0.9375rem;line-height:1.8;color:var(--black-soft);margin:0;} }

    /* Summary Cards */
    .summary-cards {
      display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:2.5rem;
      @media(max-width:768px) { grid-template-columns:repeat(2,1fr); }
      @media(max-width:480px) { grid-template-columns:1fr 1fr; }
    }
    .summary-card {
      background:var(--black); padding:1.25rem; display:flex; align-items:center; gap:0.875rem;
      .card-icon { font-size:1.5rem; flex-shrink:0; }
      .card-text { display:flex; flex-direction:column; gap:2px;
        strong { font-size:0.875rem; font-weight:700; color:var(--gold-light); }
        span { font-size:0.7rem; color:rgba(245,240,232,0.5); line-height:1.4; }
      }
    }

    .policy-section {
      margin-bottom:2.5rem; padding-bottom:2.5rem; border-bottom:1px solid var(--gray-200); &:last-of-type{border-bottom:none;}
      h2 { font-family:var(--font-heading); font-size:1.5rem; font-weight:500; color:var(--black); margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid var(--gray-200); }
      h4 { font-size:0.9rem; font-weight:700; color:var(--black); margin-bottom:0.375rem; }
      p { font-size:0.9375rem; line-height:1.8; color:var(--gray-500); margin-bottom:0.875rem; a{color:var(--gold);text-decoration:none;&:hover{text-decoration:underline;}} }
      ul { padding-left:0; list-style:none; display:flex; flex-direction:column; gap:0.5rem; margin-bottom:0.875rem;
        li { font-size:0.9375rem; line-height:1.7; color:var(--gray-500); padding-left:1.25rem; position:relative; &::before{content:'—';position:absolute;left:0;color:var(--gold);font-size:0.75rem;top:0.35rem;} strong{color:var(--black-soft);} }
      }
    }

    .highlight-box {
      background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.25);
      padding:1rem 1.25rem; margin:1rem 0;
      p { margin:0; font-size:0.875rem; color:var(--black-soft); }
    }

    /* Steps */
    .steps { display:flex; flex-direction:column; gap:0; }
    .step-item {
      display:flex; gap:1.25rem; padding:1.25rem 0;
      border-bottom:1px solid var(--gray-200); &:last-child{border-bottom:none;}
      .step-num {
        width:36px; height:36px; border-radius:50%; background:var(--gold); color:var(--black);
        display:flex; align-items:center; justify-content:center;
        font-weight:700; font-size:0.875rem; flex-shrink:0; margin-top:2px;
      }
      .step-body { flex:1; }
      h4 { font-size:0.9375rem; font-weight:700; color:var(--black); margin-bottom:0.25rem; }
      p { font-size:0.875rem; color:var(--gray-500); line-height:1.7; margin:0; a{color:var(--gold);} }
    }

    /* Refund Table */
    .refund-table { border:1px solid var(--gray-200); overflow:hidden; }
    .refund-row {
      display:grid; grid-template-columns:1fr 1.5fr 1fr;
      gap:0; border-bottom:1px solid var(--gray-200); &:last-child{border-bottom:none;}
      &.header { background:var(--black); span{color:var(--gold-light);font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;} }
      span { padding:0.75rem 1rem; font-size:0.8125rem; color:var(--gray-500); border-right:1px solid var(--gray-200); &:last-child{border-right:none;} }
      &:not(.header):hover { background:var(--cream-light); }
    }

    .contact-card { background:var(--black); padding:1.5rem 2rem; margin:1rem 0; p{color:rgba(245,240,232,0.75);margin-bottom:0.5rem;font-size:0.9rem;line-height:1.6; strong{color:var(--gold-light);} a{color:var(--gold);text-decoration:none;&:hover{text-decoration:underline;}} } }
    .policy-nav { display:flex; gap:1rem; flex-wrap:wrap; margin-top:3rem; padding-top:2rem; border-top:1px solid var(--gray-200); }
  `]
})
export class ReturnPolicyComponent {}
