import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import WaitlistBanner from '@/components/WaitlistBanner';
import { WaitlistProvider, WaitlistButton } from '@/components/WaitlistCTA';
import MobileNav from '@/components/MobileNav';
import HeroPhone from '@/components/HeroPhone';
import HeroPreviewButton from '@/components/HeroPreviewButton';
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
            <Link href="/demo" className="lp-nav-link hide-m">Demo</Link>
            <ThemeToggle />
            <Link href="/login" className="lp-nav-link hide-m">Sign in</Link>
            <WaitlistButton className="lp-nav-cta hide-m">Join waitlist</WaitlistButton>
            <MobileNav />
          </div>
        </nav>

        {/* ═══════ HERO ═══════ */}
        <section className="lp-hero">
          <div className="lp-hero-content">
            <div className="lp-hero-eyebrow">Your page. Your impression. Your rules.</div>
            <h1 className="lp-hero-headline">
              One page.<br /><em>Every connection.</em>
            </h1>
            <p className="lp-hero-sub">
              Build a profile page that actually represents you. Share it with a link, a QR code,
              or a tap of your ring. Add a hidden personal layer for people you trust.
              Free to start, no app required.
            </p>
            <div className="lp-hero-ctas">
              <WaitlistButton className="lp-btn-primary">Build your page free</WaitlistButton>
              <a href="#how" className="lp-btn-ghost">See how it works</a>
            </div>
            <p className="lp-hero-proof">Free forever. No credit card. Set up in 5 minutes.</p>
            <HeroPreviewButton />
          </div>
          <div className="lp-hero-visual">
            <HeroPhone />
          </div>
        </section>

        {/* ═══════ TRUST BAR ═══════ */}
        <div className="lp-trust-bar">
          <span className="lp-trust-item">Works with any phone</span>
          <span className="lp-trust-item">No app to download</span>
          <span className="lp-trust-item">iPhone + Android</span>
          <span className="lp-trust-item">Set up in 5 minutes</span>
        </div>

        {/* ═══════ TAGLINE ═══════ */}
        <div className="lp-tagline">
          <p>
            <em>You only get one chance to make a great first impression.</em>
            <br />
            Let us help you make it unforgettable.
          </p>
        </div>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ FREE TIER SHOWCASE ═══════ */}
        <section className="lp-free-showcase">
          <p className="lp-label">Start here</p>
          <h2 className="lp-headline">Everything you need.<br />Nothing you have to pay for.</h2>
          <p className="lp-free-sub">The free plan isn{"'"}t a teaser. It{"'"}s a real product.</p>
          <div className="lp-free-grid">
            <div className="lp-free-card">
              <h3>Your page, your way</h3>
              <p>Full profile page with your name, bio, links, and content sections. Pick from 4 templates. Customize your colors. Publish in minutes.</p>
            </div>
            <div className="lp-free-card">
              <h3>Share it anywhere</h3>
              <p>QR code, direct link, or add it to your socials. Every profile gets a free QR code you can download, print, or screenshot. No ring required.</p>
            </div>
            <div className="lp-free-card">
              <h3>Save Contact</h3>
              <p>Visitors tap one button and your name, number, and email land in their phone. No typing, no spelling, no {"\u201C"}what was your name again?{"\u201D"}</p>
            </div>
            <div className="lp-free-card">
              <h3>Content sections</h3>
              <p>Add an About section, showcase your stats, or feature a project. Your profile isn{"'"}t just links — it tells your story.</p>
            </div>
            <div className="lp-free-card">
              <h3>Works on any phone</h3>
              <p>No app to download. No account to create. When someone visits your page, it just works. Mobile-first, loads fast.</p>
            </div>
            <div className="lp-free-card">
              <h3>Privacy by default</h3>
              <p>Your profile URL is randomized. Contact info is rendered client-side. You control what{"'"}s visible and what{"'"}s not.</p>
            </div>
          </div>
          <WaitlistButton className="lp-btn-primary">Build your page free</WaitlistButton>
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
            <div className="lp-ct-c lp-ct-us"><strong>Full profile page</strong> with content sections</div>
            <div className="lp-ct-c lp-ct-them">One layout, no personality</div>
            <div className="lp-ct-c lp-ct-us"><strong>10 templates,</strong> custom colors, your style</div>
            <div className="lp-ct-c lp-ct-them">No contact card</div>
            <div className="lp-ct-c lp-ct-us"><strong>One-tap Save Contact</strong> with vCard</div>
            <div className="lp-ct-c lp-ct-them">Public only</div>
            <div className="lp-ct-c lp-ct-us"><strong>PIN-protected layers</strong> you control</div>
            <div className="lp-ct-c lp-ct-them">No QR code (or paid)</div>
            <div className="lp-ct-c lp-ct-us"><strong>Free QR code</strong> for every profile</div>
            <div className="lp-ct-c lp-ct-them">Copy-paste a URL</div>
            <div className="lp-ct-c lp-ct-us"><strong>Link, QR code,</strong> or NFC ring tap</div>
          </div>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <div className="lp-section-alt" id="how">
          <section className="lp-how">
            <div className="lp-how-header">
              <p className="lp-label">How it works</p>
              <h2 className="lp-headline">Five minutes. Seriously.</h2>
            </div>
            <div className="lp-how-grid">
              <div className="lp-how-card">
                <div className="lp-how-num">1</div>
                <h3>Build your page</h3>
                <p>Name, bio, links, a template, and your colors. Add content sections about what you do. Hit publish.</p>
              </div>
              <div className="lp-how-card">
                <div className="lp-how-num">2</div>
                <h3>Share it everywhere</h3>
                <p>Grab your QR code. Drop your link in your Instagram bio. Print it on a card. Or upgrade to an NFC ring and just tap.</p>
              </div>
              <div className="lp-how-card">
                <div className="lp-how-num">3</div>
                <h3>Make it yours</h3>
                <p>Go premium for a hidden Personal page, a Portfolio, advanced templates, analytics, and an NFC accessory. Or stay free — it{"'"}s still good.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ PERSONAL LAYER ═══════ */}
        <section className="lp-impression">
          <p className="lp-label">The hidden layer</p>
          <h2 className="lp-headline" style={{ marginBottom: '0.75rem' }}>A page <em>behind</em> the page</h2>
          <p className="lp-impression-desc">
            Every Imprynt profile can have a hidden Personal page. It{"'"}s invisible to visitors unless
            you tell them it exists. Share the PIN with someone you trust, and they see the real you:
            your personal number, your private socials, a note just for them. The icon is customizable —
            subtle enough to miss, obvious enough to find when you know where to look.
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
          <p className="lp-imp-premium">Premium feature</p>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ USE CASES ═══════ */}
        <section className="lp-cases">
          <div className="lp-cases-header">
            <p className="lp-label">Built for people who show up</p>
            <h2 className="lp-headline">For conferences, classrooms, open houses,<br />and everything in between</h2>
            <p className="lp-cases-sub">If you meet people, Imprynt works for you.</p>
          </div>
          <div className="lp-cases-grid">
            <div className="lp-case-card">
              <div className="lp-case-who">Students + Job Seekers</div>
              <div className="lp-case-quote">{"\u201C"}I put my GitHub, resume, and portfolio on one page. Recruiters tap my ring and they{"'"}ve already seen my work.{"\u201D"}</div>
              <p className="lp-case-desc">Projects, resume link, and LinkedIn on your free page. Portfolio and references behind a PIN when you{"'"}re ready.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Projects</span>
                <span className="lp-case-tag">Resume</span>
                <span className="lp-case-tag">GitHub</span>
              </div>
            </div>
            <div className="lp-case-card">
              <div className="lp-case-who">Creatives + Artists</div>
              <div className="lp-case-quote">{"\u201C"}My work speaks for itself. Now it literally does.{"\u201D"}</div>
              <p className="lp-case-desc">Portfolio front and center. Behind-the-scenes work gated for clients. Social links everywhere. Works for designers, photographers, illustrators, anyone with a visual practice.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Portfolio</span>
                <span className="lp-case-tag">Instagram</span>
                <span className="lp-case-tag">Custom links</span>
              </div>
            </div>
            <div className="lp-case-card">
              <div className="lp-case-who">Real Estate</div>
              <div className="lp-case-quote">{"\u201C"}They tapped my ring and saw my listings before I finished my pitch.{"\u201D"}</div>
              <p className="lp-case-desc">Active listings on your public page. Sold history and investor decks behind a PIN. Contact info that stays current.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Listings</span>
                <span className="lp-case-tag">Status badges</span>
                <span className="lp-case-tag">Custom fields</span>
              </div>
            </div>
            <div className="lp-case-card">
              <div className="lp-case-who">Founders + Startups</div>
              <div className="lp-case-quote">{"\u201C"}One tap and they had my deck, my bio, and a Calendly link.{"\u201D"}</div>
              <p className="lp-case-desc">Your story and traction up front. Pitch deck and financials behind a portfolio PIN. Personal number in your hidden page.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Pitch deck</span>
                <span className="lp-case-tag">Stats</span>
                <span className="lp-case-tag">Personal</span>
              </div>
            </div>
            <div className="lp-case-card">
              <div className="lp-case-who">DJs + Musicians</div>
              <div className="lp-case-quote">{"\u201C"}I share my Spotify, my booking link, and my socials in one tap. No more Instagram DM chains.{"\u201D"}</div>
              <p className="lp-case-desc">Streaming links, booking calendar, and upcoming shows on your page. Press kit and rider behind a PIN.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Spotify</span>
                <span className="lp-case-tag">Booking</span>
                <span className="lp-case-tag">Streaming</span>
              </div>
            </div>
            <div className="lp-case-card">
              <div className="lp-case-who">Sales + Consulting</div>
              <div className="lp-case-quote">{"\u201C"}No more {"\u2018"}let me find my card.{"\u2019"} I tap their phone and keep talking.{"\u201D"}</div>
              <p className="lp-case-desc">Professional profile with booking link front and center. Case studies and pricing in the portfolio. Conversation keeps moving.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Booking</span>
                <span className="lp-case-tag">Services</span>
                <span className="lp-case-tag">vCard</span>
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
              <h2 className="lp-headline">Share with a tap</h2>
              <p className="lp-products-sub">NFC accessories that work with any phone. No app needed on their end. Available with Premium.</p>
            </div>
            <div className="lp-products-grid">
              <div className="lp-prod-card">
                <div className="lp-prod-icon lp-prod-icon-ring" />
                <div className="lp-prod-name">Sygnet</div>
                <div className="lp-prod-latin">signum — seal, mark</div>
                <p className="lp-prod-desc">Ceramic NFC ring. Tap any phone, your page opens instantly. Sizes 6–12.</p>
                <div className="lp-prod-price">Pricing at launch</div>
              </div>
              <div className="lp-prod-card">
                <div className="lp-prod-icon lp-prod-icon-band" />
                <div className="lp-prod-name">Armilla</div>
                <div className="lp-prod-latin">armilla — honor bracelet</div>
                <p className="lp-prod-desc">Adjustable silicone NFC wristband. Lightweight, durable, waterproof. One size.</p>
                <div className="lp-prod-price">Pricing at launch</div>
              </div>
            </div>
            <p className="lp-products-note">Don{"'"}t need hardware? No problem. Your free page works with a link or QR code.</p>
          </section>
        </div>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ PRICING ═══════ */}
        <section className="lp-pricing" id="pricing">
          <div className="lp-pricing-header">
            <p className="lp-label">Pricing</p>
            <h2 className="lp-headline">Start free. Grow when you{"'"}re ready.</h2>
            <p className="lp-pricing-sub">No trials, no bait-and-switch. The free plan is a real product.</p>
          </div>
          <div className="lp-pricing-grid">
            <div className="lp-pr lp-pr-free">
              <div className="lp-pr-tier">Free</div>
              <div className="lp-pr-price">$0</div>
              <div className="lp-pr-note">Free forever</div>
              <div className="lp-pr-list">
                <div className="lp-pr-item"><span className="d">●</span> Full profile page</div>
                <div className="lp-pr-item"><span className="d">●</span> 4 templates with color customization</div>
                <div className="lp-pr-item"><span className="d">●</span> Unlimited social + contact links</div>
                <div className="lp-pr-item"><span className="d">●</span> QR code (download, print, screenshot)</div>
                <div className="lp-pr-item"><span className="d">●</span> Save Contact button (vCard)</div>
                <div className="lp-pr-item"><span className="d">●</span> 2 content sections</div>
                <div className="lp-pr-item"><span className="d">●</span> Mobile-first, loads fast</div>
                <div className="lp-pr-item"><span className="d">●</span> {"\u201C"}Powered by Imprynt{"\u201D"} badge</div>
              </div>
              <WaitlistButton className="lp-pr-btn lp-pr-btn-free">Build your page free</WaitlistButton>
            </div>
            <div className="lp-pr lp-pr-prem">
              <div className="lp-pr-badge">Early Access</div>
              <div className="lp-pr-tier">Premium</div>
              <div className="lp-pr-price">Coming soon</div>
              <div className="lp-pr-note">Early testers get access free</div>
              <div className="lp-pr-list">
                <div className="lp-pr-item"><span className="d">●</span> Everything in Free, plus:</div>
                <div className="lp-pr-item"><span className="d">●</span> All 10 templates + full customization</div>
                <div className="lp-pr-item"><span className="d">●</span> Unlimited content sections</div>
                <div className="lp-pr-item"><span className="d">●</span> Personal page (hidden layer with PIN)</div>
                <div className="lp-pr-item"><span className="d">●</span> Portfolio page (visible or PIN-gated)</div>
                <div className="lp-pr-item"><span className="d">●</span> Advanced photo styling (shapes, animations)</div>
                <div className="lp-pr-item"><span className="d">●</span> Analytics (views, clicks, sources)</div>
                <div className="lp-pr-item"><span className="d">●</span> No ads, no watermark</div>
                <div className="lp-pr-item"><span className="d">●</span> NFC accessories available (ring or band)</div>
              </div>
              <WaitlistButton className="lp-pr-btn lp-pr-btn-prem">Join waitlist</WaitlistButton>
            </div>
          </div>
          <p className="lp-pricing-note">
            NFC accessories available separately or bundled with Premium. Pricing details at launch.
          </p>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="lp-final">
          <h2 className="lp-final-headline">Your next introduction starts here.</h2>
          <p className="lp-final-sub">Build your page in five minutes. Share it with a link, a QR code, or a tap.</p>
          <WaitlistButton className="lp-btn-primary">Build your page free</WaitlistButton>
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
