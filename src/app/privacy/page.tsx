import Link from 'next/link';
import '@/styles/legal.css';

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <Link href="/" className="legal-nav-logo">
          <span className="legal-nav-mark" />
          <span className="legal-nav-text">Imprynt</span>
        </Link>
      </nav>

      <main className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: February 11, 2026</p>

        <p>
          Imprynt LLC (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates the Imprynt platform at trysygnet.com. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your information.
        </p>

        <p>
          <strong>The short version:</strong> We collect only what we need to run the service. We never sell your data. We never share it with advertisers. Your personal information belongs to you.
        </p>

        <h2>1. What We Collect</h2>
        <p>
          <strong>Account data:</strong> Email address and password (stored as a salted hash, never in plaintext) when you register.
        </p>
        <p>
          <strong>Profile data:</strong> Name, title, company, bio, links, and any other information you choose to add to your profile. This is content you create and control.
        </p>
        <p>
          <strong>Protected page data:</strong> Content on PIN-protected pages is encrypted at rest. PINs are stored as salted hashes.
        </p>
        <p>
          <strong>Analytics data:</strong> Page view counts, timestamps, and anonymized metadata (such as referral source). We do not track individual visitors by name. IP addresses used for rate limiting are hashed and never stored in raw form.
        </p>
        <p>
          <strong>Payment data:</strong> Payments are processed by Stripe. We store your Stripe customer ID but never see or store your credit card number, CVV, or billing details. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a>.
        </p>
        <p>
          <strong>Shipping data:</strong> If you order an NFC accessory, we collect a shipping address to fulfill your order.
        </p>

        <h2>2. How We Use Your Data</h2>
        <p>
          We use your data to: operate the platform, display your profile to visitors, process payments and fulfill orders, prevent abuse (rate limiting, fraud detection), and communicate with you about your account (password resets, service notices). That is the complete list. We do not use your data for advertising, profiling, or any purpose beyond operating the service you signed up for.
        </p>

        <h2>3. What We Never Do</h2>
        <p>
          We never sell, rent, or share your personal data with third parties for their own purposes. We never display ads on your profile or in the platform. We never scrape, mine, or analyze your content for commercial purposes beyond operating the service. We never share your contact information with other users unless you explicitly configure it to be visible. This is a core brand commitment, not just a legal obligation.
        </p>

        <h2>4. Anti-Scraping and Privacy Protections</h2>
        <p>
          Profile pages use randomized URLs (not your real name). All profile pages include noindex/nofollow directives to prevent search engine indexing. Contact information is rendered client-side via JavaScript, not in raw HTML, to limit automated scraping. Users can rotate their profile URL at any time to invalidate old links.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. When you delete your account, all your data (profile, links, protected pages, analytics, and order history) is permanently deleted from our systems within 30 days. Password reset tokens expire after 1 hour and are deleted after use.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You can access, edit, or delete your profile data at any time through your dashboard. You can delete your account at any time, which permanently removes all your data. You can request a copy of your data by contacting us. You can opt out of non-essential communications.
        </p>

        <h2>7. Cookies and Tracking</h2>
        <p>
          We use session cookies to keep you logged in. We do not use tracking cookies, advertising pixels, or third-party analytics scripts. We do not use Google Analytics, Facebook Pixel, or similar tools.
        </p>

        <h2>8. Third-Party Services</h2>
        <p>
          We use the following third-party services: Stripe for payment processing, Cloudflare for DNS and DDoS protection, and Hetzner for hosting. Each of these services has their own privacy policies. We have selected providers that align with our commitment to user privacy.
        </p>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          The platform is not intended for children under 13. We do not knowingly collect data from children under 13. If we learn that we have collected data from a child under 13, we will delete it promptly.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be communicated via email. The &quot;last updated&quot; date at the top reflects the most recent revision.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions or concerns about your privacy? Contact us at <a href="mailto:hello@imprynt.io">hello@imprynt.io</a>.
        </p>

        <p className="legal-footer-note">
          Also see our <Link href="/terms">Terms of Service</Link>.
        </p>
      </main>
    </div>
  );
}
