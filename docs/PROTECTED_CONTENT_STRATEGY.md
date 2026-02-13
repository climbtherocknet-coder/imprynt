# Imprynt - Protected Content & Tiering Strategy

## Core Principle

Imprynt is not a website builder. It's a **multi-layered identity sharing tool**. The value is in the tap, the control, and the selective reveal. Every feature should serve the networking moment: someone just tapped your ring, they're looking at their phone, you have 30 seconds.

## What Receivers Actually Do (Priority Order)

1. Understand who you are (name, title, company, photo) -- 3 seconds
2. Save your contact info (vCard download) -- 5 seconds
3. Tap a link they care about (LinkedIn, website, calendar) -- 10 seconds
4. See something deeper IF you choose to show them -- 15+ seconds

Steps 1-3 must be instant, beautiful, and frictionless. Step 4 is the differentiator.

## Tier Structure

### Free Tier ("Starter")
- Public profile: hero (photo, name, title, tagline), bio (500 chars), links
- "Powered by Imprynt" watermark
- 2 template themes
- Primary color customization only
- No protected content of any kind
- No analytics
- No NFC accessory
- Shareable via link or QR

### Paid Tier ("Premium")
- Public profile: full customization (all themes, colors, fonts)
- No watermark
- 1 Easter Egg page (hidden, personal layer)
- 1 Showcase page (visible protected link, professional layer)
- Basic analytics (views, last viewed, link clicks)
- NFC accessory included
- vCard download for receivers

### Future Tier ("Pro" - evaluate after launch)
- Multiple Easter Egg pages (different PINs for different people)
- Multiple Showcase pages (different audiences)
- Enhanced analytics (geographic, referral source, most-clicked)
- LinkedIn import
- Custom domain
- API access

## The Two Protected Page Types (Renamed for Clarity)

### Easter Egg (Hidden Personal Layer)

**What it is:** Hidden content that only exists if you tell someone about it.

**How it works:**
- No visible indication on the public profile
- Subtle interactive element (small icon, hidden tap zone) for discovery
- Visitor needs the PIN to access
- User tells someone: "tap the corner and enter 4521"

**What goes here:**
- Personal phone number
- Personal email
- Personal social media (Instagram, TikTok, Spotify, etc.)
- Personal message ("Hey, glad we connected!")
- Whatever the user wants, it's their personal layer

**Why it matters:**
- Creates an intimate "inner circle" feeling
- People WILL talk about this feature ("you gotta see this")
- Drives word of mouth
- Actually protects personal info (can't be scraped, can't be found without the PIN)

### Showcase (Visible Protected Link)

**What it is:** A labeled button on the public profile that signals "there's more here" but requires a PIN.

**How it works:**
- Visible button on the profile (user names it: "Projects", "Portfolio", "Listings", "Case Studies")
- Anyone can see the button exists
- Tapping it prompts for a PIN
- User shares the PIN selectively: "check out my projects, PIN is 7890"

**What goes here:**
- Project portfolio items (title, description, image/link, date)
- Current listings (real estate, services)
- Case studies or work samples
- Investor deck or pitch materials
- Any curated professional showcase

**Why it matters:**
- Signals depth and competence without oversharing
- Creates a reason for follow-up conversation ("let me show you something")
- Gated access means you control the audience
- Professional content stays professional (separate from personal easter egg)

### The PIN System (Unchanged)

- Single PIN entry field on the profile
- System checks entered PIN against all active PINs for that profile
- Routes to the matching page (no menu, no hints about what's available)
- 4-6 digit PINs
- 5 failed attempts = 15 minute lockout
- PIN stored as salted hash

## Showcase Page Content Model

Instead of free-form blocks, the Showcase page has a structured format:

```
Showcase Page
├── Page title (user-defined, e.g. "Current Projects")
├── Page description (optional, ~300 chars)
├── Showcase Items (ordered list)
│   ├── Item 1
│   │   ├── Title: "M&A Integration Playbook"
│   │   ├── Description: "Designed a repeatable integration framework..."
│   │   ├── Image URL (optional)
│   │   ├── Link URL (optional, e.g. to a case study or live project)
│   │   ├── Tags (optional, e.g. "M&A", "Strategy")
│   │   └── Date (optional)
│   ├── Item 2
│   │   └── ...
│   └── Item N
└── Links (optional, same link model as public profile)
```

This is simple enough to fill out in 5 minutes but rich enough to showcase real work. Not a page builder. A structured portfolio.

### Database: showcase_items table

```sql
CREATE TABLE showcase_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protected_page_id UUID NOT NULL REFERENCES protected_pages(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    image_url       VARCHAR(500),
    link_url        VARCHAR(500),
    tags            VARCHAR(200),     -- comma-separated for V1, normalize later if needed
    item_date       DATE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_showcase_items_page ON showcase_items(protected_page_id);
```

## Public Profile Content Model (Simplified)

Instead of the full block builder, V1 profiles have a fixed structure with customizable content:

```
Public Profile Page
├── Hero Section (always present)
│   ├── Photo
│   ├── Name
│   ├── Title + Company
│   ├── Tagline (~100 chars, optional)
│   └── Contact icon row (configurable subset of links)
├── Bio Section (optional)
│   ├── Heading (optional)
│   └── Body text (up to 1000 chars, supports line breaks)
├── Links Section
│   └── Link buttons (ordered list, styled by template)
├── Showcase Button (if paid + showcase page active)
│   └── "[User-defined label]" -> PIN prompt
├── Easter Egg Element (if paid + easter egg active)
│   └── Subtle hidden element -> PIN prompt
└── Footer
    ├── "Save Contact" vCard button
    └── "Powered by Imprynt" (free tier only)
```

This is opinionated. Every profile has the same structure: hero, bio, links, footer. Templates change how it looks, not what sections exist. Users customize content, not layout.

**Why this is better than a block builder for V1:**
- Faster to build (weeks, not months)
- Faster for users to set up (fill in fields, not arrange blocks)
- Consistent quality (bad layouts are impossible)
- Mobile-optimized by default (no layout decisions that break on small screens)
- Profile pages load faster (predictable structure = optimized rendering)
- Focus stays on the NETWORKING features, not the page building

**When to add the block builder:**
- V2 or V3, after you have real users telling you "I need more sections"
- Gate it behind a Pro tier as a premium feature
- By then you'll know which block types people actually want

## LinkedIn Integration (V2)

When LinkedIn sync comes, it feeds INTO the existing structures:
- Pull name, title, company, bio, photo -> populate profile fields
- Pull projects/experience -> populate showcase items
- One-time import with manual review before publishing
- Optional periodic sync (user-triggered, not automatic)

LinkedIn's API is restrictive. Evaluate feasibility before committing.
Alternative: "Paste your LinkedIn URL and we'll extract what we can" via scraping (legally gray but many services do it).

## What We're NOT Building

- A website builder (Squarespace, Wix, Carrd)
- A CMS (WordPress, Notion)
- A full CRM (that's V2, and it's a contact rolodex, not Salesforce)
- A social network (no feeds, no followers, no likes)
- An app (V2, and only for dashboard access + NFC programming)

## Revised Feature Priority for V1

1. Public profile with fixed structure (hero, bio, links) + template themes
2. Easter Egg page (hidden, PIN-protected personal layer)
3. Showcase page (visible, PIN-protected project portfolio)
4. Showcase items CRUD (add/edit/remove portfolio items)
5. vCard generation
6. Basic analytics
7. Stripe integration
8. Template switching and color/font customization

Items 1-3 are the core product. Everything else layers on top.
