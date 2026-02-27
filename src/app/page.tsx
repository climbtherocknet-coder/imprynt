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
            <a href="#pricing" className="lp-nav-link hide-m">Pricing</a>
            <Link href="/demo" className="lp-nav-link hide-m">Demo</Link>
            <Link href="/faq" className="lp-nav-link hide-m">FAQ</Link>
            <ThemeToggle />
            <Link href="/login" className="lp-nav-link hide-m">Sign in</Link>
            <WaitlistButton className="lp-nav-cta hide-m">Join waitlist</WaitlistButton>
            <MobileNav />
          </div>
        </nav>

        {/* ═══════ HERO ═══════ */}
        <section className="lp-hero">
          <div className="lp-hero-content">
            <div className="lp-hero-eyebrow">Meet better.</div>
            <h1 className="lp-hero-headline">
              One tap.<br /><em>They{"'"}ve got your whole page.</em>
            </h1>
            <p className="lp-hero-sub">
              Build a page that actually represents you — your work, your links, your story.
              Share it with a link, a QR code, or a tap of your ring.
              Free to start. No app required.
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
                <p>Add your info, pick a template, drop in your links. Hit publish. That{"'"}s it.</p>
              </div>
              <div className="lp-how-card">
                <div className="lp-how-num">2</div>
                <h3>Share however you meet people</h3>
                <p>Grab your QR code, drop your link in your bio, print it on a card, or tap your ring. One page, every situation.</p>
              </div>
              <div className="lp-how-card">
                <div className="lp-how-num">3</div>
                <h3>Stay in control</h3>
                <p>Update your info anytime. Add a hidden personal page for people you trust. Go premium when you{"'"}re ready, or don{"'"}t. The free plan is real.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ VALUE PROPS ═══════ */}
        <section className="lp-free-showcase">
          <p className="lp-label">What you get</p>
          <h2 className="lp-headline">Everything that matters.<br />Nothing that doesn{"'"}t.</h2>
          <div className="lp-free-grid">
            <div className="lp-free-card">
              <h3>A page that works as hard as you do</h3>
              <p>Your name, your work, your links, your story — all in one place. Not a list of links. A real page with content, photos, and personality.</p>
            </div>
            <div className="lp-free-card">
              <h3>They tap Save and you{"'"}re in their phone</h3>
              <p>No spelling your name. No fumbling for a card. No {"\u201C"}I{"'"}ll find you on LinkedIn.{"\u201D"} One button, straight to their contacts.</p>
            </div>
            <div className="lp-free-card">
              <h3>Share it however you want</h3>
              <p>Link in your bio. QR code on your card. Tap with an NFC ring at a conference. Your page works everywhere — no app required on their end.</p>
            </div>
            <div className="lp-free-card">
              <h3>Your page, your rules</h3>
              <p>Choose what{"'"}s public. Hide what{"'"}s personal. Take it offline when you want. You decide who sees what.</p>
            </div>
          </div>
          <WaitlistButton className="lp-btn-primary">Build your page free</WaitlistButton>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ PERSONAL LAYER ═══════ */}
        <section className="lp-impression">
          <p className="lp-label">The hidden layer</p>
          <h2 className="lp-headline" style={{ marginBottom: '0.75rem' }}>A page <em>behind</em> the page</h2>
          <p className="lp-impression-desc">
            Your public profile is for everyone. But some things aren{"'"}t for everyone.
          </p>
          <p className="lp-impression-desc">
            Add a hidden Personal page behind a PIN. Your real number, your private socials,
            a note just for them. The icon sits on your profile — subtle enough to miss,
            obvious enough to find when you know where to look.
          </p>
          <p className="lp-impression-desc">
            You decide who gets the PIN. Everyone else just sees your public page.
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
            <h2 className="lp-headline">If you meet people, this is for you.</h2>
          </div>
          <div className="lp-cases-grid">
            <div className="lp-case-card">
              <div className="lp-case-who">Creatives + Artists</div>
              <div className="lp-case-quote">{"\u201C"}My work speaks for itself. Now it literally does.{"\u201D"}</div>
              <p className="lp-case-desc">Portfolio front and center. Social links everywhere. Behind-the-scenes work gated for clients. Works for photographers, designers, illustrators — anyone with a visual practice.</p>
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
              <div className="lp-case-who">Sales + Consulting</div>
              <div className="lp-case-quote">{"\u201C"}No more {"\u2018"}let me find my card.{"\u2019"} I tap their phone and keep talking.{"\u201D"}</div>
              <p className="lp-case-desc">Professional profile with booking link front and center. Case studies and pricing in the portfolio. The conversation keeps moving.</p>
              <div className="lp-case-tags">
                <span className="lp-case-tag">Booking</span>
                <span className="lp-case-tag">Services</span>
                <span className="lp-case-tag">vCard</span>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ PRICING ═══════ */}
        <section className="lp-pricing" id="pricing">
          <div className="lp-pricing-header">
            <p className="lp-label">Pricing</p>
            <h2 className="lp-headline">Start free. Upgrade when you feel it.</h2>
            <p className="lp-pricing-sub">The free plan isn{"'"}t a demo. It{"'"}s a real product.</p>
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
                <div className="lp-pr-item"><span className="d">●</span> Imprynt badge (small, tasteful)</div>
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
            NFC accessories available separately with Premium. Pricing at launch.
          </p>
        </section>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ NFC ACCESSORIES ═══════ */}
        <div className="lp-section-alt">
          <section className="lp-products">
            <div className="lp-products-header">
              <p className="lp-label">The accessories</p>
              <h2 className="lp-headline">Share with a tap</h2>
              <p className="lp-products-sub">NFC accessories that work with any phone. No app needed on their end.</p>
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
            <p className="lp-products-note">No ring? No problem. Your page works with a link or QR code. The hardware is a bonus, not a requirement.</p>
          </section>
        </div>

        <div className="lp-divider"><hr /></div>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="lp-final">
          <h2 className="lp-final-headline">Your next introduction starts here.</h2>
          <p className="lp-final-sub">Build your page in five minutes. Share it however you meet people.</p>
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
            <Link href="/faq" className="lp-footer-link">FAQ</Link>
            <a href="mailto:hello@imprynt.io" className="lp-footer-link">hello@imprynt.io</a>
          </div>
        </footer>
      </div>
    </WaitlistProvider>
  );
}
