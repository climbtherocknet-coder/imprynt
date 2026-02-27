import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import WaitlistBanner from '@/components/WaitlistBanner';
import { WaitlistProvider, WaitlistButton } from '@/components/WaitlistCTA';
import MobileNav from '@/components/MobileNav';
import HeroPhone from '@/components/HeroPhone';
import HeroPreviewButton from '@/components/HeroPreviewButton';
import ScrollReveal from '@/components/ScrollReveal';
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
            <a href="#how" className="lp-nav-link hide-m">How it works</a>
            <Link href="/explore" className="lp-nav-link hide-m">Explore</Link>
            <a href="#pricing" className="lp-nav-link hide-m">Pricing</a>
            <Link href="/faq" className="lp-nav-link hide-m">FAQ</Link>
            <ThemeToggle />
            <Link href="/login" className="lp-nav-link hide-m">Sign in</Link>
            <WaitlistButton className="lp-nav-cta hide-m">Build yours free</WaitlistButton>
            <MobileNav />
          </div>
        </nav>

        {/* ═══════ HERO ═══════ */}
        <section className="lp-hero">
          <div className="lp-hero-content">
            <div className="lp-hero-eyebrow">For people who give a damn about first impressions.</div>
            <h1 className="lp-hero-headline">
              Make an introduction<br /><em>worth remembering.</em>
            </h1>
            <p className="lp-hero-sub">
              One page with everything that matters. Your work, your links,
              your story. Share it with a tap, a scan, or a link.
            </p>
            <div className="lp-hero-ctas">
              <WaitlistButton className="lp-btn-primary">Build yours free</WaitlistButton>
              <a href="#how" className="lp-btn-ghost">See how it works</a>
            </div>
            <p className="lp-hero-proof">Free forever. No credit card. Five minutes to set up.</p>
            <HeroPreviewButton />
          </div>
          <div className="lp-hero-visual">
            <HeroPhone />
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <ScrollReveal>
          <section className="lp-how" id="how">
            <div className="lp-how-header">
              <p className="lp-label">How it works</p>
              <h2 className="lp-headline">Five minutes. Seriously.</h2>
            </div>
            <div className="lp-how-grid">
              <div className="lp-how-card">
                <div className="lp-how-num">1</div>
                <h3>Build your page</h3>
                <p>Add your info, pick a look, drop in your links. Hit publish.</p>
              </div>
              <div className="lp-how-card">
                <div className="lp-how-num">2</div>
                <h3>Share however you meet people</h3>
                <p>Link in your bio. QR on your card. Tap with a ring. One page, everywhere.</p>
              </div>
              <div className="lp-how-card">
                <div className="lp-how-num">3</div>
                <h3>Stay in control</h3>
                <p>Change anything, anytime. Add a hidden page for your inner circle. Or just keep it simple. Your call.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══════ THE EXPERIENCE (Interactive Demo) ═══════ */}
        <ScrollReveal>
          <section className="lp-demo-section" id="demo">
            <div className="lp-demo-header">
              <p className="lp-label">See for yourself</p>
              <h2 className="lp-headline">This is a real Imprynt profile.</h2>
              <p className="lp-demo-sub">Scroll through it. Everything you see, you can build in five minutes.</p>
            </div>
            <div className="lp-demo-container">
              <div className="lp-demo-phone">
                <iframe
                  src="/demo-ava"
                  title="Imprynt demo profile"
                  className="lp-demo-iframe"
                />
              </div>
            </div>
            <p className="lp-demo-explore">
              <Link href="/explore">Explore more profiles &rarr;</Link>
            </p>
          </section>
        </ScrollReveal>

        {/* ═══════ VALUE BLOCKS ═══════ */}
        <ScrollReveal>
          <section className="lp-value">
            <p className="lp-label">Why Imprynt</p>
            <div className="lp-value-grid">
              <div className="lp-value-card">
                <h3>They remember you</h3>
                <p>Your name, your work, your story. One page they actually save to their phone. Not a card in a drawer. Not a LinkedIn request they forget.</p>
              </div>
              <div className="lp-value-card">
                <h3>You control what they see</h3>
                <p>Your public page is for everyone. Your hidden page is for people who matter. A page behind the page, protected by a PIN you choose to share.</p>
              </div>
              <div className="lp-value-card">
                <h3>It works however you do</h3>
                <p>Drop your link in a bio. Print your QR code. Tap your ring at a conference. No app on their end. It just opens.</p>
              </div>
              <div className="lp-value-card">
                <h3>It looks like you give a damn</h3>
                <p>Ten templates. Custom colors. Content that tells your story, not just lists your links. When someone opens your page, it looks like you put thought into it. Because you did.</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══════ THE HIDDEN LAYER ═══════ */}
        <ScrollReveal>
          <section className="lp-impression">
            <p className="lp-label">The hidden layer</p>
            <h2 className="lp-headline">Not everything is for everyone.</h2>
            <p className="lp-impression-desc">
              Your public page is for the world. But some things are just for the people who earn it.
            </p>
            <p className="lp-impression-desc">
              Add a hidden page behind a PIN. Your real number. Your private socials.
              A note just for them. The icon sits on your profile &mdash; subtle enough to miss,
              obvious enough to find when someone knows to look.
            </p>
            <p className="lp-impression-desc lp-impression-pull">
              Giving someone your PIN is a gesture. It says: you{"'"}re in.
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
        </ScrollReveal>

        {/* ═══════ WHO USES THIS ═══════ */}
        <ScrollReveal>
          <section className="lp-cases">
            <div className="lp-cases-header">
              <p className="lp-label">Built for people who show up</p>
              <h2 className="lp-headline">If you meet people, this is for you.</h2>
            </div>
            <div className="lp-cases-grid">
              <div className="lp-case-card">
                <div className="lp-case-who">Creatives + Artists</div>
                <div className="lp-case-quote">{"\u201C"}My work speaks for itself. Now it literally does.{"\u201D"}</div>
                <p className="lp-case-desc">Portfolio front and center. Social links everywhere. Behind-the-scenes work gated for clients. For photographers, designers, illustrators, anyone with a visual practice.</p>
              </div>
              <div className="lp-case-card">
                <div className="lp-case-who">Real Estate</div>
                <div className="lp-case-quote">{"\u201C"}They tapped my ring and saw my listings before I finished my pitch.{"\u201D"}</div>
                <p className="lp-case-desc">Active listings on your public page. Sold history and investor decks behind a PIN. Contact info that stays current.</p>
              </div>
              <div className="lp-case-card">
                <div className="lp-case-who">Founders + Startups</div>
                <div className="lp-case-quote">{"\u201C"}One tap and they had my deck, my bio, and a Calendly link.{"\u201D"}</div>
                <p className="lp-case-desc">Your story and traction up front. Pitch deck and financials behind a portfolio PIN. Personal number on your hidden page.</p>
              </div>
              <div className="lp-case-card">
                <div className="lp-case-who">Sales + Consulting</div>
                <div className="lp-case-quote">{"\u201C"}No more {"\u2018"}let me find my card.{"\u2019"} I tap their phone and keep talking.{"\u201D"}</div>
                <p className="lp-case-desc">Professional profile with booking link front and center. Case studies and pricing in the portfolio. The conversation keeps moving.</p>
              </div>
            </div>
            <p className="lp-cases-explore">
              <Link href="/explore">Explore demo profiles &rarr;</Link>
            </p>
          </section>
        </ScrollReveal>

        {/* ═══════ WHAT YOU CAN BUILD ═══════ */}
        <ScrollReveal>
          <section className="lp-content-types">
            <div className="lp-content-header">
              <p className="lp-label">Your page, your content</p>
              <h2 className="lp-headline">More than links. Way more.</h2>
            </div>
            <div className="lp-content-grid">
              <div className="lp-content-item">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                </div>
                <span>Text &amp; Bio</span>
              </div>
              <div className="lp-content-item">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <span>Photo Stories</span>
              </div>
              <div className="lp-content-item">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <span>Stats &amp; Metrics</span>
              </div>
              <div className="lp-content-item">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                </div>
                <span>Event Listings</span>
              </div>
              <div className="lp-content-item">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </div>
                <span>Music Player</span>
              </div>
              <div className="lp-content-item">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <span>Real Estate</span>
              </div>
              <div className="lp-content-item">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <span>Link Previews</span>
              </div>
              <div className="lp-content-item">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <span>Call-to-Action</span>
              </div>
              <div className="lp-content-item lp-content-soon">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <span>Testimonials</span>
                <span className="lp-soon-badge">Soon</span>
              </div>
              <div className="lp-content-item lp-content-soon">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
                </div>
                <span>Video Reels</span>
                <span className="lp-soon-badge">Soon</span>
              </div>
              <div className="lp-content-item lp-content-soon">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></svg>
                </div>
                <span>Booking</span>
                <span className="lp-soon-badge">Soon</span>
              </div>
              <div className="lp-content-item lp-content-soon">
                <div className="lp-content-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
                </div>
                <span>Blog Updates</span>
                <span className="lp-soon-badge">Soon</span>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══════ NFC TEASER ═══════ */}
        <ScrollReveal>
          <section className="lp-nfc">
            <div className="lp-nfc-content">
              <p className="lp-label">The accessories</p>
              <h2 className="lp-headline">Share with a tap.</h2>
              <p className="lp-nfc-desc">
                NFC accessories that open your page on any phone.
                No app on their end. Just tap.
              </p>
              <div className="lp-nfc-products">
                <div className="lp-nfc-product">
                  <div className="lp-prod-icon lp-prod-icon-ring" />
                  <div className="lp-prod-name">Sygnet</div>
                  <p className="lp-prod-desc">Ceramic NFC ring. Tap any phone. Sizes 6-12.</p>
                </div>
                <div className="lp-nfc-product">
                  <div className="lp-prod-icon lp-prod-icon-band" />
                  <div className="lp-prod-name">Armilla</div>
                  <p className="lp-prod-desc">Silicone NFC wristband. Lightweight, waterproof.</p>
                </div>
              </div>
              <p className="lp-nfc-note">
                No ring? No problem. Your page works with a link or QR code. The hardware is a bonus.
              </p>
            </div>
            <div className="lp-nfc-visual">
              <img src="/images/ring1.jpg" alt="Imprynt Sygnet NFC rings" className="lp-nfc-photo" />
            </div>
          </section>
        </ScrollReveal>

        {/* ═══════ PRICING ═══════ */}
        <ScrollReveal>
          <section className="lp-pricing" id="pricing">
            <div className="lp-pricing-header">
              <p className="lp-label">Pricing</p>
              <h2 className="lp-headline">Start free. Upgrade when you feel it.</h2>
              <p className="lp-pricing-sub">The free plan isn{"'"}t a demo. It{"'"}s the real thing.</p>
            </div>
            <div className="lp-pricing-grid">
              <div className="lp-pr lp-pr-free">
                <div className="lp-pr-tier">Free</div>
                <div className="lp-pr-price">$0</div>
                <div className="lp-pr-note">Free forever</div>
                <div className="lp-pr-list">
                  <div className="lp-pr-item"><span className="d">&bull;</span> Full profile page</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> 4 templates with color customization</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> Unlimited social + contact links</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> QR code (download, print, screenshot)</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> Save Contact button (vCard)</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> 2 content sections</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> Mobile-first, loads fast</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> Imprynt badge (small, tasteful)</div>
                </div>
                <WaitlistButton className="lp-pr-btn lp-pr-btn-free">Build your page free</WaitlistButton>
              </div>
              <div className="lp-pr lp-pr-prem">
                <div className="lp-pr-badge">Early Access</div>
                <div className="lp-pr-tier">Premium</div>
                <div className="lp-pr-price">Coming soon</div>
                <div className="lp-pr-note">Early testers get access free</div>
                <div className="lp-pr-list">
                  <div className="lp-pr-item"><span className="d">&bull;</span> Everything in Free, plus:</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> All 10 templates + full customization</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> Unlimited content sections</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> Personal page (hidden layer with PIN)</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> Portfolio page (visible or PIN-gated)</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> Advanced photo styling (shapes, animations)</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> Analytics (views, clicks, sources)</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> No ads, no watermark</div>
                  <div className="lp-pr-item"><span className="d">&bull;</span> NFC accessories available (ring or band)</div>
                </div>
                <WaitlistButton className="lp-pr-btn lp-pr-btn-prem">Join waitlist</WaitlistButton>
              </div>
            </div>
            <p className="lp-pricing-note">
              NFC accessories available separately with Premium. Pricing at launch.
            </p>
          </section>
        </ScrollReveal>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="lp-final">
          <h2 className="lp-final-headline">Your next introduction starts here.</h2>
          <p className="lp-final-sub">Build your page in five minutes. Share it however you meet people.</p>
          <WaitlistButton className="lp-btn-primary">Build yours free</WaitlistButton>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="lp-footer">
          <div className="lp-footer-left">
            <span className="lp-footer-mark" />
            &copy; 2026 Imprynt LLC
          </div>
          <div className="lp-footer-links">
            <Link href="/explore" className="lp-footer-link">Explore</Link>
            <Link href="/faq" className="lp-footer-link">FAQ</Link>
            <Link href="/terms" className="lp-footer-link">Terms</Link>
            <Link href="/privacy" className="lp-footer-link">Privacy</Link>
            <a href="mailto:hello@imprynt.io" className="lp-footer-link">hello@imprynt.io</a>
          </div>
        </footer>
      </div>
    </WaitlistProvider>
  );
}
