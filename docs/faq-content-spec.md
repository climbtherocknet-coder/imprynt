# FAQ & Trust Page — Content Spec

**Purpose:** Public-facing page at trysygnet.com/faq that builds trust, answers common questions, and demonstrates how user data is protected. This is a conversion tool, not a legal document. Written in plain language, not legalese.

**Route:** `/faq` (new page)
**Style:** Same dark theme as legal pages (legal.css), or could be a standalone design

---

## Page Structure

### Header
"Your questions, answered honestly."
Subhead: "We built Imprynt with privacy as a foundation, not an afterthought. Here's how it works."

---

## Section 1: How Imprynt Works

**Q: What is Imprynt?**
Imprynt is a secure digital identity platform. You create a professional profile page and share it instantly via an NFC ring, bracelet, or link. Tap your ring to someone's phone, and your profile opens in their browser. No app required for the person receiving it.

**Q: Do people need to download an app to see my profile?**
No. Your profile opens in any mobile browser. The person you're sharing with doesn't need an account, an app, or any special software. They tap your ring (or click your link), and your page loads.

**Q: What's the difference between free and premium?**
Free gets you a profile page with 2 content blocks, 4 templates, and sharing via link or QR code. Premium unlocks all 10 templates, 6 content blocks, PIN-protected pages, analytics, document uploads, and an NFC accessory (ring or bracelet) shipped to you.

**Q: What's an "Impression" page?**
It's a hidden, PIN-protected layer of your profile. You decide what goes on it (personal contact info, portfolio, whatever) and who gets the PIN. Someone would need to know it exists and have the code to access it. Think of it as the back of your business card, but selective.

---

## Section 2: Privacy & Security (The Trust Section)

### "How We Protect Your Data"

**Q: Is my contact information visible to everyone?**
Only what you choose to make visible. Your public profile shows the links and info you configure. Contact details (phone, email, address) are rendered through JavaScript, not embedded in the page HTML, which prevents automated scraping. PIN-protected content is only accessible with the correct code.

**Q: Can search engines find my profile?**
No. Every profile page includes `noindex` and `nofollow` directives that tell search engines not to index or follow links on the page. We also block crawlers via `robots.txt`. Your profile is designed to be shared intentionally, not discovered by accident.

**Q: What about my profile URL — does it use my real name?**
No. Profile URLs use randomized slugs (e.g., trysygnet.com/x7k9m2), not your name. If you're a premium user, you can rotate your URL at any time, which immediately invalidates the old one.

**Q: How is my PIN-protected content secured?**
PINs are stored as salted hashes (the same technique used for passwords). We never store your PIN in readable form. Protected page content is encrypted at rest in our database. If someone tries to guess a PIN, they're locked out after 5 failed attempts for 15 minutes.

**Q: What happens to my data if I delete my account?**
Everything is permanently deleted. Your profile, content blocks, links, protected pages, analytics, and any uploaded documents are removed from our systems within 30 days of account deletion. We don't keep shadow copies or "anonymized" versions.

**Q: Do you sell my data?**
No. We will never sell, rent, license, or share your personal data with third parties for their own purposes. This is a core company commitment, not just a legal obligation. Our revenue comes from subscriptions and accessories, not from monetizing your information.

**Q: Do you use tracking cookies or analytics scripts?**
No third-party tracking. No Google Analytics. No Facebook Pixel. No advertising cookies. We use a single session cookie to keep you logged in. That's it. We built our own simple analytics (page views, timestamps) that respect visitor privacy.

**Q: Where is my data stored?**
Your data is hosted on Hetzner servers in Europe, with Cloudflare providing DNS and DDoS protection. Payments are processed by Stripe (PCI-compliant). We never see or store your credit card details.

---

## Section 3: NFC & Accessories

**Q: How does the NFC ring work?**
The ring contains a small NFC chip programmed with your unique profile URL. When you hold it near someone's phone (within 1-3cm), their browser opens your profile page automatically. It works with any modern iPhone or Android phone. No pairing, no Bluetooth, no battery.

**Q: What if I lose my ring?**
Your ring points to your profile through a redirect URL. If you lose it, your profile is still safe because it's password-protected behind your account. You can also rotate your profile URL from the dashboard, which makes the lost ring point to a dead link.

**Q: Does the ring need to be charged?**
No. NFC is passive technology. There's no battery. The ring is powered by the electromagnetic field from the phone during the tap. It works indefinitely.

**Q: Can someone clone my ring?**
The NFC chip contains a URL, not your personal data. Someone could theoretically read the URL, but that would just show them your public profile, which is the same thing you'd show them intentionally. Your PIN-protected content remains locked regardless.

---

## Section 4: Account & Billing

**Q: Can I try it for free?**
Yes. The free tier gives you a full profile page, 2 content blocks, and 4 templates. You can share it via link or QR code. No credit card required to sign up.

**Q: What if I cancel my premium subscription?**
Your profile reverts to the free tier. Your content is preserved but premium features (extra templates, content blocks, protected pages, analytics) are disabled until you resubscribe. Nothing is deleted.

**Q: Can I change my plan?**
Yes. You can switch between monthly and annual billing, or downgrade to free, at any time from your dashboard. Changes take effect at the end of your current billing cycle.

---

## Section 5: Technical / Advanced

**Q: What data is in my vCard when someone saves my contact?**
The vCard includes your name, title, company, and whichever contact fields you've enabled for your business card (phone, email, address, etc.). You control exactly which fields are included from your dashboard. The vCard is generated on demand, so if you update your info, the next person who saves your contact gets the latest version.

**Q: Can I use Imprynt without an NFC accessory?**
Yes. Free and premium users can share their profile via direct link or QR code. The NFC ring, bracelet, or fingertip are delivery mechanisms that make sharing faster and cooler, but they're optional.

**Q: Is the platform open source?**
Not currently. We may open-source specific components in the future.

---

## Design Notes for Implementation

- Accordion-style (click to expand) or all-visible with jump links
- Each section gets a visual divider and icon
- The privacy/security section should feel prominent, maybe with a subtle shield or lock icon
- Consider a "Trust badges" strip: "No tracking", "Encrypted at rest", "No data sales", "HTTPS everywhere"
- Link to full Privacy Policy and Terms of Service at the bottom
- Mobile-friendly, same responsive approach as legal pages
- Possibly add a "Still have questions? Contact us" footer with an email link

---

## Trust Badges (Sidebar or Header Strip)

Visual indicators to reinforce the privacy message:

1. 🔒 **Encrypted** — Protected content encrypted at rest
2. 🚫 **No Tracking** — Zero third-party analytics or ad pixels
3. 🛡️ **No Data Sales** — Your data is never sold or shared
4. 🔗 **HTTPS Everywhere** — All connections encrypted in transit
5. 🕵️ **Anti-Scraping** — Client-rendered content, no-index, obfuscated URLs
6. 🗑️ **Full Deletion** — Delete your account, we delete everything
