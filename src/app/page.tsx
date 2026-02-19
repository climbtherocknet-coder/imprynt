import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import WaitlistBanner from '@/components/WaitlistBanner';
import { WaitlistProvider, WaitlistButton } from '@/components/WaitlistCTA';
import '@/styles/landing.css';

export default function HomePage() {
  return (
    <WaitlistProvider>
      <div className="landing">
        <WaitlistBanner />

        {/* ═══════ NAV ═══════ */}
        <nav className="lp-nav">
          <Link href="/" className="lp-nav-logo">
            <span className="lp-logo-mark" />
            <span className="lp-logo-text">Imprynt</span>
          </Link>
          <div className="lp-nav-links">
            <a href="#compare" className="lp-nav-link hide-m">Why Imprynt</a>
            <a href="#pricing" className="lp-nav-link hide-m">Pricing</a>
            <ThemeToggle />
            <Link href="/login" className="lp-nav-link">Sign in</Link>
            <WaitlistButton className="lp-nav-cta">Join waitlist</WaitlistButton>
          </div>
        </nav>

        {/* ═══════ HERO ═══════ */}
        <section className="lp-hero">
          <div className="lp-hero-content">
            <div className="lp-hero-eyebrow">NFC-powered networking</div>
            <h1 className="lp-hero-headline">
              Make every<br />introduction<br /><em>unforgettable</em>
            </h1>
            <p className="lp-hero-sub">
              Tap your ring, share your page. Your profile, your portfolio, your private layer
              for real connections, all in one tap. No cards. No app. No friction.
            </p>
            <div className="lp-hero-ctas">
              <WaitlistButton className="lp-btn-primary">Join waitlist</WaitlistButton>
              <a href="#compare" className="lp-btn-ghost">Why not Linktree?</a>
            </div>
            <p className="lp-hero-proof">Free to start. No credit card required.</p>
          </div>
          <div className="lp-hero-visual">
            <div className="lp-phone">
              <div className="lp-phone-screen">
                <div className="m-row">
                  <div className="m-photo" />
                  <div className="m-info">
                    <div className="m-name">Sofia Reyes</div>
                    <div className="m-title">Luxury Real Estate · Austin TX</div>
                  </div>
                </div>
                <div className="m-pills">
                  <span className="m-pill">LinkedIn</span>
                  <span className="m-pill">Website</span>
                  <span className="m-pill">Email</span>
                  <span className="m-pill">Call</span>
                  <span className="m-pill">Instagram</span>
                </div>
                <div className="m-save">↓ Save Contact</div>
                <div className="m-hr" />
                <div className="m-card">
                  <div className="m-card-t">About Sofia</div>
                  <div className="m-card-p">Helping families find their place. Luxury properties across Central Texas since 2012.</div>
                </div>
                <div className="m-card">
                  <div className="m-card-t">Track Record</div>
                  <div className="m-card-p">$142M volume · 340+ homes · 98% satisfaction</div>
                </div>
                <div className="m-listing">
                  <div className="m-listing-img" />
                  <div className="m-listing-body">
                    <div className="m-listing-type">Listing · Active</div>
                    <div className="m-listing-name">2847 Ridgewood Trail</div>
                    <div className="m-listing-meta">4 bed · 3.5 bath · $1.85M</div>
                  </div>
                </div>
                <div className="m-listing">
                  <div className="m-listing-img" />
                  <div className="m-listing-body">
                    <div className="m-listing-type">Listing · Pending</div>
                    <div className="m-listing-name">The Elms at Barton Creek</div>
                    <div className="m-listing-meta">5 bed · 4 bath · $2.4M</div>
                  </div>
                </div>
                <div className="m-gate">🔒 View all listings (5)</div>
                <div className="m-impression" />
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ COMPARISON ═══════ */}
        <section className="lp-compare" id="compare">
          <p className="lp-label">More than a link in bio</p>
          <h2 className="lp-headline">
            Linktree gives you links.<br />Imprynt gives you a <em>presence</em>.
          </h2>
          <div className="lp-compare-table">
            <div className="lp-ct-h lp-ct-h-them">Others</div>
            <div className="lp-ct-h lp-ct-h-us">Imprynt</div>
            <div className="lp-ct-c lp-ct-them">A list of links</div>
            <div className="lp-ct-c lp-ct-us"><strong>Full profile page</strong> you design</div>
            <div className="lp-ct-c lp-ct-them">Public only</div>
            <div className="lp-ct-c lp-ct-us"><strong>PIN-protected layers</strong> you control</div>
            <div className="lp-ct-c lp-ct-them">Same card as everyone</div>
            <div className="lp-ct-c lp-ct-us"><strong>Typed showcase:</strong> projects, listings, services</div>
            <div className="lp-ct-c lp-ct-them">Copy-paste a URL</div>
            <div className="lp-ct-c lp-ct-us"><strong>Tap your ring.</strong> That{"'"}s it.</div>
            <div className="lp-ct-c lp-ct-them">Their platform, their ads</div>
            <div className="lp-ct-c lp-ct-us"><strong>Your page, your brand.</strong> No middleman.</div>
          </div>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <div className="lp-section-alt">
          <section className="lp-how">
            <div className="lp-how-header">
              <p className="lp-label">How it works</p>
              <h2 className="lp-headline">Three steps. Five minutes. Done.</h2>
            </div>
            <div className="lp-how-grid">
              <div className="lp-how-card">
                <div className="lp-how-num">1</div>
                <h3>Build your page</h3>
                <p>Name, bio, links, and a few sections about what you do. Pick a template. Publish in minutes.</p>
              </div>
              <div className="lp-how-card">
                <div className="lp-how-num">2</div>
                <h3>Add your layers</h3>
                <p>Public page for everyone. Portfolio for clients. A private Personal page for real connections. Each with its own PIN.</p>
              </div>
              <div className="lp-how-card">
                <div className="lp-how-num">3</div>
                <h3>Tap and connect</h3>
                <p>Your ring arrives ready. Tap any phone. No app needed on their end. They see your world instantly.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ IMPRESSION ═══════ */}
        <section className="lp-impression">
          <p className="lp-label">The hidden layer</p>
          <h2 className="lp-headline" style={{ marginBottom: '0.75rem' }}>Your <em>Personal</em> layer</h2>
          <p className="lp-impression-desc">
            Every profile has a hidden layer only you know about. Share the PIN with someone you trust,
            and they unlock your personal side: your real number, your Instagram, a note just for them.
            The icon is yours to customize, color, transparency, placement. Subtle enough to miss,
            obvious enough to find when you know where to look.
          </p>
          <div className="lp-impression-demos">
            <div className="lp-imp-demo">
              <div className="lp-imp-icon lp-imp-subtle" />
              <span className="lp-imp-label">Subtle</span>
            </div>
            <div className="lp-imp-demo">
              <div className="lp-imp-icon lp-imp-visible" />
              <span className="lp-imp-label">Visible</span>
            </div>
            <div className="lp-imp-demo">
              <div className="lp-imp-icon lp-imp-bold" />
              <span className="lp-imp-label">Bold</span>
            </div>
          </div>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ USE CASES ═══════ */}
        <section className="lp-cases">
          <div className="lp-cases-header">
            <p className="lp-label">Built for people who show up</p>
            <h2 className="lp-headline">From conferences to open houses</h2>
            <p className="lp-cases-sub">If you meet people face to face, Imprynt works for you.</p>
          </div>
          <div className="lp-cases-grid">
            <div className="lp-case-card">
              <div className="lp-case-who">Real Estate</div>
              <div className="lp-case-quote">{"\u201C"}They tapped my ring and saw my listings before I finished my pitch.{"\u201D"}</div>
              <p className="lp-case-desc">Active listings on your public page. Sold history and investor decks behind a PIN. Price visibility you control.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Listings</span>
                <span className="lp-case-tag">Status badges</span>
                <span className="lp-case-tag">Custom fields</span>
              </div>
            </div>
            <div className="lp-case-card">
              <div className="lp-case-who">Founders</div>
              <div className="lp-case-quote">{"\u201C"}One tap and they had my deck, my bio, and a Calendly link.{"\u201D"}</div>
              <p className="lp-case-desc">Your story and traction up front. Pitch deck and metrics behind a portfolio PIN. Personal number in your hidden page.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Projects</span>
                <span className="lp-case-tag">Services</span>
                <span className="lp-case-tag">Personal</span>
              </div>
            </div>
            <div className="lp-case-card">
              <div className="lp-case-who">Sales Teams</div>
              <div className="lp-case-quote">{"\u201C"}No more {"\u2018"}let me find my card.{"\u2019"} I tap their phone and keep talking.{"\u201D"}</div>
              <p className="lp-case-desc">Professional profile with booking link front and center. Case studies and pricing in the portfolio. Conversation keeps moving.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Services</span>
                <span className="lp-case-tag">Booking</span>
                <span className="lp-case-tag">vCard</span>
              </div>
            </div>
            <div className="lp-case-card">
              <div className="lp-case-who">Creatives</div>
              <div className="lp-case-quote">{"\u201C"}My work speaks for itself. Now it literally does.{"\u201D"}</div>
              <p className="lp-case-desc">Portfolio on your profile with images, links, and tags. Best work public, client work gated. Social links everywhere.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Projects</span>
                <span className="lp-case-tag">Events</span>
                <span className="lp-case-tag">Custom links</span>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ PRODUCTS ═══════ */}
        <div className="lp-section-alt">
          <section className="lp-products">
            <div className="lp-products-header">
              <p className="lp-label">The accessories</p>
              <h2 className="lp-headline">Wear your network</h2>
              <p className="lp-products-sub">NFC accessories that work with any phone. No app needed on their end.</p>
            </div>
            <div className="lp-products-grid">
              <div className="lp-prod-card">
                <div className="lp-prod-icon lp-prod-icon-ring" />
                <div className="lp-prod-name">Sygnet</div>
                <div className="lp-prod-latin">signum — seal, mark</div>
                <p className="lp-prod-desc">Ceramic NFC ring. Wear it, tap it, done. Sizes 6-12.</p>
                <div className="lp-prod-price">Pricing coming soon</div>
              </div>
              <div className="lp-prod-card">
                <div className="lp-prod-icon lp-prod-icon-band" />
                <div className="lp-prod-name">Armilla</div>
                <div className="lp-prod-latin">armilla — honor bracelet</div>
                <p className="lp-prod-desc">Adjustable silicone NFC band. Lightweight, durable, one size fits all.</p>
                <div className="lp-prod-price">Pricing coming soon</div>
              </div>
            </div>
          </section>
        </div>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ PRICING ═══════ */}
        <section className="lp-pricing" id="pricing">
          <div className="lp-pricing-header">
            <p className="lp-label">Pricing</p>
            <h2 className="lp-headline">Start free. Upgrade when you{"'"}re ready.</h2>
            <p className="lp-pricing-sub">We{"'"}re in early access. Pricing details coming soon.</p>
          </div>
          <div className="lp-pricing-grid">
            <div className="lp-pr lp-pr-free">
              <div className="lp-pr-tier">Free</div>
              <div className="lp-pr-price">$0</div>
              <div className="lp-pr-note">Free forever</div>
              <div className="lp-pr-list">
                <div className="lp-pr-item"><span className="d">●</span> Public profile page</div>
                <div className="lp-pr-item"><span className="d">●</span> 2 content sections</div>
                <div className="lp-pr-item"><span className="d">●</span> 4 templates</div>
                <div className="lp-pr-item"><span className="d">●</span> Share via link or QR code</div>
                <div className="lp-pr-item"><span className="d">●</span> Imprynt branding on profile</div>
              </div>
              <WaitlistButton className="lp-pr-btn lp-pr-btn-free">Join waitlist</WaitlistButton>
            </div>
            <div className="lp-pr lp-pr-prem">
              <div className="lp-pr-badge">Early Access</div>
              <div className="lp-pr-tier">Premium</div>
              <div className="lp-pr-price">Coming soon</div>
              <div className="lp-pr-note">Early testers get access free</div>
              <div className="lp-pr-list">
                <div className="lp-pr-item"><span className="d">●</span> Everything in Free</div>
                <div className="lp-pr-item"><span className="d">●</span> 6 content sections</div>
                <div className="lp-pr-item"><span className="d">●</span> All 10 templates + full customization</div>
                <div className="lp-pr-item"><span className="d">●</span> Portfolio page with content blocks</div>
                <div className="lp-pr-item"><span className="d">●</span> Portfolio button on profile</div>
                <div className="lp-pr-item"><span className="d">●</span> Personal page (hidden layer)</div>
                <div className="lp-pr-item"><span className="d">●</span> Analytics</div>
                <div className="lp-pr-item"><span className="d">●</span> No ads, no watermark, no data sharing</div>
              </div>
              <WaitlistButton className="lp-pr-btn lp-pr-btn-prem">Join waitlist</WaitlistButton>
            </div>
          </div>
          <p className="lp-pricing-note">
            NFC accessories (ring, bracelet) available with Premium. Pricing announced at launch.
          </p>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="lp-final">
          <h2 className="lp-final-headline">Stop handing out paper. Start making connections that stick.</h2>
          <p className="lp-final-sub">Build your page in five minutes. Free to start.</p>
          <WaitlistButton className="lp-btn-primary">Join the waitlist</WaitlistButton>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="lp-footer">
          <div className="lp-footer-left">
            <span className="lp-footer-mark" />
            © 2026 Imprynt LLC
          </div>
          <div className="lp-footer-links">
            <Link href="/terms" className="lp-footer-link">Terms</Link>
            <Link href="/privacy" className="lp-footer-link">Privacy</Link>
            <a href="mailto:hello@imprynt.io" className="lp-footer-link">hello@imprynt.io</a>
          </div>
        </footer>
      </div>
    </WaitlistProvider>
  );
}
