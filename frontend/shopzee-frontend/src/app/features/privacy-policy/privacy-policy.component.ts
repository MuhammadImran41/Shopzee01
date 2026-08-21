import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="policy-page">
      <!-- Hero -->
      <div class="policy-hero">
        <div class="container">
          <p class="policy-label">Legal</p>
          <h1 class="policy-title">Privacy Policy</h1>
          <p class="policy-updated">Last updated: August 21, 2026</p>
        </div>
      </div>

      <div class="container">
        <div class="policy-layout">

          <!-- Sidebar TOC -->
          <aside class="policy-toc">
            <p class="toc-title">Contents</p>
            <ul>
              <li><a href="#info-collect">Information We Collect</a></li>
              <li><a href="#how-use">How We Use Your Information</a></li>
              <li><a href="#sharing">Information Sharing</a></li>
              <li><a href="#cookies">Cookies & Tracking</a></li>
              <li><a href="#security">Data Security</a></li>
              <li><a href="#rights">Your Rights</a></li>
              <li><a href="#retention">Data Retention</a></li>
              <li><a href="#children">Children's Privacy</a></li>
              <li><a href="#changes">Policy Changes</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </aside>

          <!-- Content -->
          <main class="policy-content">

            <div class="policy-intro">
              <p>
                At <strong>STYLEMAKER</strong>, we take your privacy seriously. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you visit our website
                <strong>stylemaker.store</strong> or make a purchase with us. Please read this policy carefully.
                By using our services, you agree to the practices described here.
              </p>
            </div>

            <section id="info-collect" class="policy-section">
              <h2>1. Information We Collect</h2>

              <h3>Personal Information You Provide</h3>
              <p>When you register, place an order, or contact us, we may collect:</p>
              <ul>
                <li><strong>Identity information:</strong> Full name, username, date of birth</li>
                <li><strong>Contact information:</strong> Email address, phone number, postal address</li>
                <li><strong>Payment information:</strong> Credit/debit card details, JazzCash or EasyPaisa account numbers (processed securely — we do not store full card numbers)</li>
                <li><strong>Order information:</strong> Products purchased, order history, delivery preferences</li>
                <li><strong>Account credentials:</strong> Password (stored in encrypted form, never in plain text)</li>
              </ul>

              <h3>Information Collected Automatically</h3>
              <p>When you browse our website, we automatically collect:</p>
              <ul>
                <li><strong>Device information:</strong> IP address, browser type and version, operating system</li>
                <li><strong>Usage data:</strong> Pages visited, time spent on pages, links clicked, search queries</li>
                <li><strong>Location data:</strong> Approximate geographic location based on IP address</li>
                <li><strong>Cookie data:</strong> As described in our Cookies section below</li>
              </ul>
            </section>

            <section id="how-use" class="policy-section">
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li><strong>Order fulfillment:</strong> Processing and delivering your orders, sending order confirmations and tracking updates</li>
                <li><strong>Account management:</strong> Creating and managing your account, authenticating your identity</li>
                <li><strong>Customer support:</strong> Responding to your inquiries, resolving disputes, troubleshooting issues</li>
                <li><strong>Personalization:</strong> Tailoring product recommendations and promotional content to your interests</li>
                <li><strong>Communications:</strong> Sending transactional emails (order confirmations, shipping updates) and, with your consent, marketing emails</li>
                <li><strong>Security:</strong> Detecting and preventing fraud, unauthorized access, and other illegal activities</li>
                <li><strong>Legal compliance:</strong> Meeting our legal and regulatory obligations</li>
                <li><strong>Business improvement:</strong> Analyzing usage patterns to improve our website, products, and services</li>
              </ul>
            </section>

            <section id="sharing" class="policy-section">
              <h2>3. Information Sharing</h2>
              <p>We do <strong>not sell, rent, or trade</strong> your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul>
                <li><strong>Service providers:</strong> Trusted third-party vendors who assist us in operating our website, processing payments, and delivering orders (e.g., courier companies, payment gateways). These partners are bound by confidentiality agreements.</li>
                <li><strong>Delivery partners:</strong> Your name, phone number, and delivery address are shared with our courier partners solely to fulfill your order.</li>
                <li><strong>Legal requirements:</strong> We may disclose information when required by law, court order, or government regulation.</li>
                <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                <li><strong>Safety:</strong> To protect the rights, property, or safety of STYLEMAKER, our customers, or others.</li>
              </ul>
            </section>

            <section id="cookies" class="policy-section">
              <h2>4. Cookies & Tracking</h2>
              <p>We use cookies and similar tracking technologies to enhance your experience on our website.</p>

              <h3>Types of Cookies We Use</h3>
              <ul>
                <li><strong>Essential cookies:</strong> Required for the website to function properly (e.g., shopping cart, login session). Cannot be disabled.</li>
                <li><strong>Performance cookies:</strong> Help us understand how visitors interact with our site (e.g., pages visited, errors encountered).</li>
                <li><strong>Preference cookies:</strong> Remember your preferences such as language and region settings.</li>
                <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements and track the effectiveness of our campaigns.</li>
              </ul>
              <p>You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect website functionality.</p>
            </section>

            <section id="security" class="policy-section">
              <h2>5. Data Security</h2>
              <p>We implement industry-standard security measures to protect your personal information:</p>
              <ul>
                <li>All data transmitted between your browser and our servers is encrypted using <strong>SSL/TLS (HTTPS)</strong></li>
                <li>Passwords are hashed using <strong>BCrypt</strong> — never stored in plain text</li>
                <li>Payment card data is processed through PCI-DSS compliant payment gateways</li>
                <li>Access to customer data is restricted to authorized personnel only</li>
                <li>Regular security audits and vulnerability assessments are conducted</li>
              </ul>
              <p>While we take all reasonable precautions, no method of internet transmission is 100% secure. We cannot guarantee absolute security of your information.</p>
            </section>

            <section id="rights" class="policy-section">
              <h2>6. Your Rights</h2>
              <p>You have the following rights regarding your personal data:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
                <li><strong>Portability:</strong> Request transfer of your data in a structured, machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time via the unsubscribe link in emails</li>
                <li><strong>Objection:</strong> Object to processing of your data for direct marketing purposes</li>
              </ul>
              <p>To exercise any of these rights, contact us at <strong>trendzyofficial.store&#64;gmail.com</strong></p>
            </section>

            <section id="retention" class="policy-section">
              <h2>7. Data Retention</h2>
              <p>We retain your personal information for as long as necessary to:</p>
              <ul>
                <li>Maintain your account and provide our services</li>
                <li>Comply with legal, tax, and accounting requirements</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p>Order records are typically retained for <strong>7 years</strong> for accounting and legal purposes. Account data is deleted within <strong>30 days</strong> of account closure upon request.</p>
            </section>

            <section id="children" class="policy-section">
              <h2>8. Children's Privacy</h2>
              <p>Our website and services are not directed to individuals under the age of <strong>13 years</strong>. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete it immediately. If you believe a child has submitted personal information to us, please contact us.</p>
            </section>

            <section id="changes" class="policy-section">
              <h2>9. Policy Changes</h2>
              <p>We may update this Privacy Policy periodically to reflect changes in our practices or for legal, regulatory, or operational reasons. When we make material changes, we will:</p>
              <ul>
                <li>Update the "Last updated" date at the top of this page</li>
                <li>Notify registered users via email for significant changes</li>
                <li>Display a notice on our website</li>
              </ul>
              <p>We encourage you to review this policy periodically.</p>
            </section>

            <section id="contact" class="policy-section">
              <h2>10. Contact Us</h2>
              <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              <div class="contact-card">
                <p><strong>STYLEMAKER</strong></p>
                <p>📧 Email: <a href="mailto:trendzyofficial.store@gmail.com">trendzyofficial.store&#64;gmail.com</a></p>
                <p>🌐 Website: <a href="https://stylemaker.store">stylemaker.store</a></p>
                <p>📍 Pakistan</p>
              </div>
              <p style="margin-top:1rem">We will respond to all privacy-related inquiries within <strong>7 business days</strong>.</p>
            </section>

            <div class="policy-nav">
              <a routerLink="/terms-of-service" class="btn btn-outline">Terms of Service →</a>
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
      background: var(--black);
      padding: 100px 0 48px;
      .policy-label {
        font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase;
        color: var(--gold); margin-bottom: 0.75rem; display: block;
      }
      .policy-title {
        font-family: var(--font-heading); font-size: clamp(2.5rem, 5vw, 4rem);
        font-weight: 400; color: var(--cream); margin-bottom: 0.75rem;
      }
      .policy-updated { font-size: 0.875rem; color: rgba(245,240,232,0.45); }
    }

    .policy-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 4rem;
      padding: 3rem 0 5rem;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .policy-toc {
      position: sticky; top: 100px; height: fit-content;
      @media (max-width: 900px) { display: none; }
      .toc-title {
        font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
        color: var(--gold); font-weight: 700; margin-bottom: 1rem;
      }
      ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }
      a {
        font-size: 0.8125rem; color: var(--gray-500); text-decoration: none;
        display: block; padding: 0.35rem 0.75rem;
        border-left: 2px solid var(--gray-200);
        transition: all 0.2s;
        &:hover { color: var(--gold-dark); border-left-color: var(--gold); }
      }
    }

    .policy-intro {
      background: var(--cream-light); border-left: 3px solid var(--gold);
      padding: 1.25rem 1.5rem; margin-bottom: 2.5rem;
      p { font-size: 0.9375rem; line-height: 1.8; color: var(--black-soft); margin: 0; }
    }

    .policy-section {
      margin-bottom: 2.5rem; padding-bottom: 2.5rem;
      border-bottom: 1px solid var(--gray-200);
      &:last-of-type { border-bottom: none; }

      h2 {
        font-family: var(--font-heading); font-size: 1.5rem; font-weight: 500;
        color: var(--black); margin-bottom: 1rem;
        padding-bottom: 0.5rem; border-bottom: 1px solid var(--gray-200);
      }
      h3 { font-size: 0.875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold-dark); margin: 1.25rem 0 0.5rem; }
      p { font-size: 0.9375rem; line-height: 1.8; color: var(--gray-500); margin-bottom: 0.875rem; }
      ul { padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.875rem;
        li { font-size: 0.9375rem; line-height: 1.7; color: var(--gray-500); padding-left: 1.25rem; position: relative;
          &::before { content: '—'; position: absolute; left: 0; color: var(--gold); font-size: 0.75rem; top: 0.35rem; }
          strong { color: var(--black-soft); }
        }
      }
    }

    .contact-card {
      background: var(--black); padding: 1.5rem 2rem; margin: 1rem 0;
      p { color: rgba(245,240,232,0.75); margin-bottom: 0.5rem; font-size: 0.9rem; line-height: 1.6;
        strong { color: var(--gold-light); }
        a { color: var(--gold); text-decoration: none; &:hover { text-decoration: underline; } }
      }
    }

    .policy-nav {
      display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 3rem;
      padding-top: 2rem; border-top: 1px solid var(--gray-200);
    }
  `]
})
export class PrivacyPolicyComponent {}
