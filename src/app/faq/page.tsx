'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WaitlistProvider, WaitlistButton } from '@/components/WaitlistCTA';
import '@/styles/legal.css';
import '@/styles/faq.css';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  label: string;
  items: FaqItem[];
}

const FAQ_DATA: FaqGroup[] = [
  {
    label: 'About Imprynt',
    items: [
      {
        q: 'What is Imprynt?',
        a: 'Imprynt is a digital identity platform that gives you a single, shareable page for everything about you: contact info, social links, portfolio, booking links, payment methods, whatever you need. Think of it as a modern business card that actually works. Share it with a link, a QR code, or a tap of an NFC ring.',
      },
      {
        q: 'How is this different from Linktree or other link-in-bio tools?',
        a: 'Most link-in-bio tools give you a list of links. Imprynt gives you a full profile page with real customization: 10 templates, custom themes, content sections for text, images, stats, events, music, and listings. Plus features they don\'t have: a hidden personal layer (your "Impression") behind a PIN, portfolio pages, vCard downloads so people actually save your contact, and NFC accessories for in-person sharing.',
      },
      {
        q: 'Is Imprynt free?',
        a: 'Yes. The free plan is a real product, not a teaser. You get a full profile page, 4 templates with color customization, unlimited links, QR code sharing, vCard downloads, and 2 content sections. No time limit, no credit card required. Premium adds more templates, unlimited content sections, protected pages, analytics, and NFC accessory support.',
      },
      {
        q: 'Who is Imprynt for?',
        a: 'Anyone who shares who they are with other people. That includes professionals (realtors, lawyers, consultants), creatives (photographers, DJs, designers), service providers (trainers, coaches, handymen), and really anyone who wants a better way to share their contact info and online presence.',
      },
    ],
  },
  {
    label: 'Getting Started',
    items: [
      {
        q: 'How do I create my page?',
        a: 'Sign up with your email, then follow the setup wizard. It walks you through adding your info, choosing a template, adding links, and customizing your look. Most people finish in 5 minutes.',
      },
      {
        q: 'Do I need to download an app?',
        a: 'No. Imprynt is entirely web-based. You build and manage your page from any browser. When someone visits your page, they don\'t need an app either. It just works.',
      },
      {
        q: 'Can I change my page after I set it up?',
        a: 'Yes. You can edit everything from your dashboard at any time: your info, links, template, photos, content sections, even your URL. Changes go live immediately.',
      },
    ],
  },
  {
    label: 'Features & Plans',
    items: [
      {
        q: 'What\'s an "Impression" page?',
        a: 'It\'s a hidden personal layer behind your public profile. You set a PIN, and only people you share it with can access it. Think of it as the back of your business card, but for personal stuff: your real social accounts, personal photos, a note that says "nice to meet you." It\'s completely optional.',
      },
      {
        q: 'What content can I add to my page?',
        a: 'Text sections, image sections with text, stat blocks, event listings with dates and RSVP links, music with audio players, real estate listings, project showcases, call-to-action buttons, and link previews. More types coming soon.',
      },
      {
        q: 'What templates are available?',
        a: '10 templates ranging from minimal (Clean, Soft) to bold (Noir, Midnight, Signal). 4 are free, 6 are premium. Every template supports custom accent colors. Premium users can build fully custom themes with 13 color variables and layout controls.',
      },
      {
        q: 'Can people save my contact info to their phone?',
        a: 'Yes. Every profile has a "Save Contact" button that generates a vCard file. When someone taps it, your name, phone, email, company, and title get added directly to their phone contacts. Premium users can PIN-protect the vCard for their Impression page.',
      },
    ],
  },
  {
    label: 'NFC Accessories',
    items: [
      {
        q: 'What is NFC and how does it work?',
        a: 'NFC (Near Field Communication) is the same technology that powers tap-to-pay. Our accessories contain a small chip. When someone holds their phone near it, your Imprynt page opens automatically in their browser. No app needed on their end. Works with both iPhone (XS and newer) and Android.',
      },
      {
        q: 'What NFC products do you offer?',
        a: 'Currently: the Sygnet (ceramic ring) and the Armilla (silicone wristband). Both are durable, waterproof, and don\'t need batteries or charging. We\'re exploring other form factors like metal cards and challenge coins.',
      },
      {
        q: 'Do I need an NFC ring to use Imprynt?',
        a: 'No. NFC accessories are optional and only available with Premium. Free users share via link and QR code, which works great. The ring is for people who want the "tap and share" experience at events, meetings, or anywhere in person.',
      },
    ],
  },
  {
    label: 'Privacy & Security',
    items: [
      {
        q: 'Who can see my profile?',
        a: 'Your public profile is visible to anyone with the link or QR code. Your Impression (hidden page) is only accessible to people who know the PIN. You control what goes on each layer. You can also take your entire profile offline at any time with the On Air toggle.',
      },
      {
        q: 'Do you sell my data?',
        a: 'No. We don\'t sell, share, or monetize your personal data. Your profile information is used to display your page and nothing else. See our Privacy Policy for the full details.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. You can delete your account at any time from your dashboard settings. This permanently removes all your data, including your profile, links, content, and analytics. It\'s irreversible and we don\'t keep backups of deleted accounts.',
      },
      {
        q: 'Is my connection/PIN secure?',
        a: 'Your profile is served over HTTPS. PINs are hashed with bcrypt (the same algorithm banks use). Failed PIN attempts are rate-limited to prevent brute force. We never store PINs in plain text.',
      },
    ],
  },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`faq-chevron${open ? ' open' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="faq-section">
      {groups.map((group, gi) => (
        <div key={gi}>
          <div className="faq-group-label">{group.label}</div>
          {group.items.map((item, qi) => {
            const key = `${gi}-${qi}`;
            const isOpen = openItems.has(key);
            return (
              <div className="faq-item" key={key}>
                <button className="faq-question" onClick={() => toggle(key)}>
                  <span>{item.q}</span>
                  <Chevron open={isOpen} />
                </button>
                <div className={`faq-answer${isOpen ? ' open' : ''}`}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function FaqPage() {
  return (
    <WaitlistProvider>
      <div className="legal-page">
        <nav className="legal-nav">
          <Link href="/" className="legal-nav-logo">
            <span className="legal-nav-mark" />
            <span className="legal-nav-text">Imprynt</span>
          </Link>
        </nav>

        <div className="faq-hero">
          <h1 className="faq-headline">How Imprynt works</h1>
          <p className="faq-sub">
            Everything you need to know about building and sharing your digital identity.
          </p>
        </div>

        <FaqAccordion groups={FAQ_DATA} />

        <div className="faq-trust">
          <h2 className="faq-trust-headline">Why people trust Imprynt</h2>
          <div className="faq-trust-grid">
            <div className="faq-trust-card">
              <h4>Built by real people</h4>
              <p>Imprynt LLC, est. 2026. A small team that cares about the product.</p>
            </div>
            <div className="faq-trust-card">
              <h4>Your data stays yours</h4>
              <p>We don&apos;t sell data. Delete anytime. Full control over your information.</p>
            </div>
            <div className="faq-trust-card">
              <h4>No ads, ever</h4>
              <p>No tracking pixels. No sponsored content. A clean experience for you and your visitors.</p>
            </div>
            <div className="faq-trust-card">
              <h4>Works everywhere</h4>
              <p>Any phone, any browser. No app required. iPhone and Android.</p>
            </div>
            <div className="faq-trust-card">
              <h4>Secure by default</h4>
              <p>HTTPS, bcrypt PINs, rate limiting. You control who sees what.</p>
            </div>
          </div>
        </div>

        <div className="faq-cta">
          <h2>Ready to make your impression?</h2>
          <p>Build your page in five minutes. Free forever.</p>
          <WaitlistButton className="faq-cta-btn">
            Build your page free
          </WaitlistButton>
        </div>

        <footer className="faq-footer">
          <div className="faq-footer-left">
            <span className="faq-footer-mark" />
            <span>&copy; 2026 Imprynt LLC</span>
          </div>
          <div className="faq-footer-links">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="mailto:hello@imprynt.io">hello@imprynt.io</a>
          </div>
        </footer>
      </div>
    </WaitlistProvider>
  );
}
