import Link from 'next/link';
import '@/styles/legal.css';

export default function TermsPage() {
  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <Link href="/" className="legal-nav-logo">
          <span className="legal-nav-mark" />
          <span className="legal-nav-text">Imprynt</span>
        </Link>
      </nav>

      <main className="legal-content">
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: February 11, 2026</p>

        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the Imprynt platform, including the website at trysygnet.com and any associated NFC accessories (&quot;Products&quot;), operated by Imprynt LLC (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;). By creating an account or using the platform, you agree to these Terms.
        </p>

        <h2>1. Account Registration</h2>
        <p>
          You must provide a valid email address and create a password to register. You are responsible for maintaining the security of your account credentials. You must be at least 13 years old to use this service. One account per person. You agree to provide accurate information during registration and keep it up to date.
        </p>

        <h2>2. Acceptable Use</h2>
        <p>
          You may use the platform to create and share your personal or professional digital identity. You may not use the platform to impersonate another person, distribute malware, engage in illegal activities, scrape or harvest data from other users&apos; profiles, or attempt to bypass security measures including PIN protection. We reserve the right to suspend or terminate accounts that violate these terms.
        </p>

        <h2>3. Subscriptions and Payments</h2>
        <p>
          Free accounts have limited features as described on our pricing page. Paid subscriptions are billed through Stripe on a recurring monthly or annual basis. You may cancel at any time through your account settings. Cancellation takes effect at the end of the current billing period. NFC accessories are one-time purchases and are non-refundable once programmed, except in cases of defect. We offer a size exchange for rings within 14 days of delivery.
        </p>

        <h2>4. NFC Accessories</h2>
        <p>
          NFC rings, bands, and other accessories are programmed with a URL unique to your account. They are intended for personal use only. We are not responsible for NFC compatibility issues with specific phone models. Delivery times are estimates, not guarantees. Risk of loss transfers to you upon delivery to the carrier.
        </p>

        <h2>5. Your Content</h2>
        <p>
          You retain ownership of all content you add to your profile, including text, links, and images. By using the platform, you grant us a limited license to host, display, and transmit your content as necessary to operate the service. We do not claim any intellectual property rights over your content. You are responsible for ensuring you have the right to share any content you upload.
        </p>

        <h2>6. Privacy</h2>
        <p>
          Your use of the platform is also governed by our <Link href="/privacy">Privacy Policy</Link>. We take your privacy seriously and do not sell your personal data.
        </p>

        <h2>7. Service Availability</h2>
        <p>
          We aim for high availability but do not guarantee uninterrupted service. We may perform maintenance, updates, or modifications to the platform at any time. We will make reasonable efforts to notify users of planned downtime. We are not liable for any damages resulting from service interruptions.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          The platform is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law, Imprynt LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or Products. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
        </p>

        <h2>9. Termination</h2>
        <p>
          You may delete your account at any time. We may terminate or suspend your account for violation of these Terms. Upon termination, your profile will be removed and your data will be deleted in accordance with our Privacy Policy. NFC accessories will continue to function but will redirect to a generic page.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be communicated via email or a notice on the platform. Continued use after changes constitutes acceptance.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about these Terms? Contact us at <a href="mailto:hello@imprynt.io">hello@imprynt.io</a>.
        </p>
      </main>
    </div>
  );
}
