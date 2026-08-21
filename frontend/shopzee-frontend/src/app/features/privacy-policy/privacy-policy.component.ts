import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="policy-page">

      <!-- ── HERO ───────────────────────────────────────── -->
      <header class="policy-hero">
        <div class="container">
          <div class="policy-hero__inner">
            <div class="policy-hero__badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Privacy & Security
            </div>
            <h1>Privacy Policy</h1>
            <p class="policy-hero__sub">How we collect, use, and protect your personal information</p>
            <div class="policy-hero__meta">
              <span>Last updated: August 21, 2026</span>
              <span class="dot">·</span>
              <span>Effective immediately</span>
            </div>
          </div>
        </div>
      </header>

      <!-- ── BODY ───────────────────────────────────────── -->
      <div class="container">
        <div class="policy-wrap">

          <!-- Sidebar -->
          <aside class="policy-toc">
            <div class="toc-card">
              <p class="toc-heading">On this page</p>
              <nav>
                <a href="#collect">1. Information We Collect</a>
                <a href="#use">2. How We Use It</a>
                <a href="#sharing">3. Information Sharing</a>
                <a href="#cookies">4. Cookies</a>
                <a href="#security">5. Data Security</a>
                <a href="#rights">6. Your Rights</a>
                <a href="#retention">7. Data Retention</a>
                <a href="#children">8. Children's Privacy</a>
                <a href="#changes">9. Policy Changes</a>
                <a href="#pp-contact">10. Contact Us</a>
              </nav>
            </div>
            <div class="toc-other-links">
              <p>Related Policies</p>
              <a routerLink="/terms-of-service">Terms of Service</a>
              <a routerLink="/return-policy">Return &amp; Exchange</a>
            </div>
          </aside>

          <!-- Content -->
          <main class="policy-content">

            <div class="intro-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>At <strong>STYLEMAKER</strong>, your privacy matters. This policy explains how we handle your data when you shop at <strong>stylemaker.store</strong>. By using our services, you agree to the practices described here.</p>
            </div>

            <section id="collect">
              <div class="section-label">Section 01</div>
              <h2>Information We Collect</h2>
              <h3>What you give us</h3>
              <p>When you create an account, place an order, or contact us:</p>
              <ul>
                <li><strong>Identity:</strong> Full name, date of birth</li>
                <li><strong>Contact:</strong> Email address, phone number, delivery address</li>
                <li><strong>Payment:</strong> JazzCash / EasyPaisa numbers, bank details (never full card data)</li>
                <li><strong>Orders:</strong> Products purchased, order history, delivery preferences</li>
                <li><strong>Credentials:</strong> Password (BCrypt-encrypted — never readable)</li>
              </ul>
              <h3>What we collect automatically</h3>
              <ul>
                <li><strong>Device:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage:</strong> Pages visited, time on site, links clicked, search queries</li>
                <li><strong>Location:</strong> Approximate location from IP address</li>
                <li><strong>Cookies:</strong> As described in Section 4</li>
              </ul>
            </section>

            <section id="use">
              <div class="section-label">Section 02</div>
              <h2>How We Use Your Information</h2>
              <ul>
                <li><strong>Order fulfillment:</strong> Processing, packing, shipping, and delivery of your orders</li>
                <li><strong>Account management:</strong> Creating and maintaining your account securely</li>
                <li><strong>Customer support:</strong> Responding to queries and resolving issues</li>
                <li><strong>Personalization:</strong> Tailoring product recommendations to your taste</li>
                <li><strong>Emails:</strong> Order confirmations, shipping updates, and (with consent) promotions</li>
                <li><strong>Security:</strong> Detecting fraud and preventing unauthorized access</li>
                <li><strong>Legal:</strong> Meeting regulatory and compliance obligations</li>
                <li><strong>Improvement:</strong> Analyzing usage to improve our platform</li>
              </ul>
            </section>

            <section id="sharing">
              <div class="section-label">Section 03</div>
              <h2>Information Sharing</h2>
              <div class="callout callout--green">
                <strong>We never sell your data.</strong> STYLEMAKER does not sell, rent, or trade your personal information to any third party.
              </div>
              <p>We only share data in these specific circumstances:</p>
              <ul>
                <li><strong>Courier partners:</strong> Your name, phone, and address — solely to deliver your order</li>
                <li><strong>Payment processors:</strong> Secure transaction processing (JazzCash, EasyPaisa, banks)</li>
                <li><strong>Legal requirements:</strong> When required by court order or Pakistani law</li>
                <li><strong>Business transfers:</strong> In the event of a merger or acquisition</li>
                <li><strong>Safety:</strong> To protect rights, property, or safety of STYLEMAKER or customers</li>
              </ul>
            </section>

            <section id="cookies">
              <div class="section-label">Section 04</div>
              <h2>Cookies &amp; Tracking</h2>
              <div class="cookies-grid">
                <div class="cookie-item">
                  <span class="cookie-badge essential">Essential</span>
                  <p>Required for core functions — cart, login, checkout. Cannot be disabled.</p>
                </div>
                <div class="cookie-item">
                  <span class="cookie-badge performance">Performance</span>
                  <p>Help us understand site usage — pages visited, errors encountered.</p>
                </div>
                <div class="cookie-item">
                  <span class="cookie-badge preference">Preference</span>
                  <p>Remember your preferences like language and region settings.</p>
                </div>
                <div class="cookie-item">
                  <span class="cookie-badge marketing">Marketing</span>
                  <p>Deliver relevant ads and track campaign effectiveness.</p>
                </div>
              </div>
              <p>Manage cookies through your browser settings. Disabling some may affect site functionality.</p>
            </section>

            <section id="security">
              <div class="section-label">Section 05</div>
              <h2>Data Security</h2>
              <div class="security-grid">
                <div class="security-item">
                  <div class="si-icon">🔒</div>
                  <div><strong>SSL/TLS Encryption</strong><p>All data transmitted via HTTPS</p></div>
                </div>
                <div class="security-item">
                  <div class="si-icon">🔑</div>
                  <div><strong>BCrypt Hashing</strong><p>Passwords never stored in plain text</p></div>
                </div>
                <div class="security-item">
                  <div class="si-icon">🛡️</div>
                  <div><strong>PCI-DSS Payments</strong><p>Compliant payment processing</p></div>
                </div>
                <div class="security-item">
                  <div class="si-icon">👤</div>
                  <div><strong>Access Control</strong><p>Data accessible to authorized staff only</p></div>
                </div>
              </div>
              <p>No internet transmission is 100% secure. We cannot guarantee absolute security, but we follow industry best practices.</p>
            </section>

            <section id="rights">
              <div class="section-label">Section 06</div>
              <h2>Your Rights</h2>
              <div class="rights-list">
                <div class="right-item"><span class="right-tag">Access</span><p>Request a copy of your personal data we hold</p></div>
                <div class="right-item"><span class="right-tag">Correct</span><p>Request correction of inaccurate information</p></div>
                <div class="right-item"><span class="right-tag">Delete</span><p>Request deletion of your data (subject to legal obligations)</p></div>
                <div class="right-item"><span class="right-tag">Portability</span><p>Receive your data in a machine-readable format</p></div>
                <div class="right-item"><span class="right-tag">Opt-Out</span><p>Unsubscribe from marketing emails at any time</p></div>
                <div class="right-item"><span class="right-tag">Object</span><p>Object to processing for direct marketing</p></div>
              </div>
              <p>To exercise any right, email us at <a href="mailto:trendzyofficial.store@gmail.com">trendzyofficial.store&#64;gmail.com</a></p>
            </section>

            <section id="retention">
              <div class="section-label">Section 07</div>
              <h2>Data Retention</h2>
              <p>We retain your data only as long as necessary:</p>
              <ul>
                <li>Order records: <strong>7 years</strong> (legal/accounting requirements)</li>
                <li>Account data: Deleted within <strong>30 days</strong> of account closure on request</li>
                <li>Marketing data: Until you opt out</li>
                <li>Legal compliance data: As required by Pakistani law</li>
              </ul>
            </section>

            <section id="children">
              <div class="section-label">Section 08</div>
              <h2>Children's Privacy</h2>
              <p>Our platform is not directed to children under <strong>13 years</strong> of age. We do not knowingly collect data from children. If you believe a child has submitted information to us, please contact us immediately and we will delete it.</p>
            </section>

            <section id="changes">
              <div class="section-label">Section 09</div>
              <h2>Policy Changes</h2>
              <p>We may update this policy periodically. When we do:</p>
              <ul>
                <li>The "Last updated" date will be revised</li>
                <li>Registered users will be notified via email for major changes</li>
                <li>A notice will appear on our website</li>
              </ul>
              <p>We encourage you to review this policy from time to time.</p>
            </section>

            <section id="pp-contact">
              <div class="section-label">Section 10</div>
              <h2>Contact Us</h2>
              <p>Questions about this Privacy Policy? Reach out anytime:</p>
              <div class="contact-block">
                <div class="cb-row"><span class="cb-icon">✉️</span><div><strong>Email</strong><a href="mailto:trendzyofficial.store@gmail.com">trendzyofficial.store&#64;gmail.com</a></div></div>
                <div class="cb-row"><span class="cb-icon">🌐</span><div><strong>Website</strong><a href="https://stylemaker.store">stylemaker.store</a></div></div>
                <div class="cb-row"><span class="cb-icon">📍</span><div><strong>Location</strong><span>Pakistan</span></div></div>
                <div class="cb-row"><span class="cb-icon">⏱️</span><div><strong>Response time</strong><span>Within 7 business days</span></div></div>
              </div>
            </section>

            <!-- Related pages nav -->
            <div class="related-nav">
              <a routerLink="/terms-of-service" class="related-card">
                <div class="rc-icon">📋</div>
                <div><strong>Terms of Service</strong><span>Usage rules and agreements</span></div>
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
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {}
