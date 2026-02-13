# Imprynt Profile Builder - Block-Based Page System

## The Problem

The current profile model is a flat record: name, title, bio (200 chars), photo, links. That produces a nice contact card, but not a rich profile page. Users like Tim's WordPress page (me.tdkconsultingllc.com) have hero sections, multi-paragraph bios, capability lists, image sections, testimonials, and narrative blocks. We need to support that level of richness while keeping the editing experience dead simple.

## The Solution: Block-Based Content

Every profile page is a **stack of content blocks**, each with a type, configuration, and display order. Users drag blocks to reorder them, edit inline with a live preview, and add/remove blocks from a palette. Think Notion meets Carrd meets Linktree, but for identity pages.

## Block Types (V1)

### 1. Hero Block
The top of every profile. Always present, can't be removed (but can be customized).
- Profile photo (circular or square crop option)
- Name (from user record)
- Title and company
- Short tagline/headline (optional, ~100 chars)
- Contact icon row (subset of links rendered as icons: LinkedIn, email, phone, calendar, website)
- Background: solid color, gradient, or uploaded image

### 2. Bio / Text Block
Rich text content section. Can be used multiple times.
- Heading (optional, e.g. "About Me", "What I Do", "How I Engage")
- Body text (rich text: bold, italic, line breaks, bullet lists)
- Character limit: 2000 per block
- Alignment options: left, center

### 3. Links Block
A group of link buttons (the current link model, but as a positionable block).
- Renders as styled buttons (full-width or compact grid)
- Can include any link types from the existing schema
- Layout option: stacked (vertical) or grid (2 columns)
- Can appear multiple times on the page (e.g. links at top AND bottom)

### 4. Skills / Capabilities Block
Structured list with optional grouping (maps to "Strategic Capabilities" on Tim's page).
- Title (e.g. "Strategic Capabilities")
- Groups, each with:
  - Group heading (e.g. "M&A & Integration Strategy")
  - List of items (bullet points)
- Or flat list mode (no groups, just bullets)

### 5. Cards Block
Grid of feature/service cards (maps to "What I Do" sections).
- Title (optional section heading)
- 2-4 cards, each with:
  - Card title (e.g. "Leadership & Integration")
  - Card description (~300 chars)
  - Optional icon or emoji
- Layout: 2-column or 3-column grid

### 6. Image Block
Full-width or contained image with optional caption.
- Image upload or URL
- Caption text (optional)
- Alt text for accessibility
- Display mode: full-width, contained (max-width), or side-by-side with text

### 7. Divider Block
Visual separator between sections.
- Style: line, space, or decorative
- Configurable spacing

### 8. Contact / CTA Block
Call-to-action section, typically near the bottom.
- Heading (e.g. "Get in Touch", "Let's Connect")
- Optional body text
- Contact icon row (same as hero, but can be placed anywhere)
- Optional "Save Contact" vCard button

## V1.5 Block Types (Future)
- **Testimonial Block** - Quote with attribution
- **Embed Block** - YouTube, Spotify, SoundCloud, Twitter embeds
- **Gallery Block** - Image grid/carousel
- **Timeline Block** - Career history or project timeline
- **Metric/Stats Block** - "20+ integrations led" style stat callouts
- **PDF/Download Block** - Attach files (resume, deck, portfolio)

## Database Changes

### New Table: `profile_blocks`

```sql
CREATE TABLE profile_blocks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    block_type      VARCHAR(30) NOT NULL CHECK (block_type IN (
        'hero', 'text', 'links', 'capabilities', 'cards',
        'image', 'divider', 'contact_cta'
    )),
    display_order   INTEGER NOT NULL DEFAULT 0,
    config          JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profile_blocks_profile ON profile_blocks(profile_id);
CREATE INDEX idx_profile_blocks_order ON profile_blocks(profile_id, display_order);
```

The `config` JSONB column stores block-specific settings. Each block type has its own config schema.

### Config Schemas (JSONB)

**Hero Block:**
```json
{
  "tagline": "M&A Integration Leader | Operational Strategy Advisor",
  "photoShape": "circle",
  "showContactIcons": true,
  "contactLinkIds": ["uuid1", "uuid2", "uuid3"],
  "background": {
    "type": "color",
    "value": "#1a1a2e"
  }
}
```

**Text Block:**
```json
{
  "heading": "What I Do",
  "body": "I help organizations navigate growth and change...",
  "alignment": "left"
}
```

**Links Block:**
```json
{
  "layout": "stacked",
  "linkIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Capabilities Block:**
```json
{
  "title": "Strategic Capabilities",
  "groups": [
    {
      "heading": "M&A & Integration Strategy",
      "items": [
        "Post-acquisition integration leadership",
        "Integration sequencing & synergy realization"
      ]
    }
  ]
}
```

**Cards Block:**
```json
{
  "title": "What I Do",
  "columns": 3,
  "cards": [
    {
      "title": "Leadership & Integration",
      "description": "I lead end-to-end M&A integrations...",
      "icon": "🎯"
    }
  ]
}
```

**Image Block:**
```json
{
  "imageUrl": "/uploads/photo.jpg",
  "caption": "Working together to find innovative solutions",
  "altText": "Team collaboration photo",
  "display": "contained"
}
```

**Divider Block:**
```json
{
  "style": "line",
  "spacing": "medium"
}
```

**Contact CTA Block:**
```json
{
  "heading": "Let's Connect",
  "body": "I typically engage during moments of change...",
  "showContactIcons": true,
  "contactLinkIds": ["uuid1", "uuid2"],
  "showVcard": true
}
```

### Migration Path

The existing flat profile fields (title, company, bio, photo_url) remain for backward compatibility and for the "quick" profile card view (NFC tap preview, search results, etc.). The block system is the full page. On profile creation, auto-generate a default set of blocks:

1. Hero block (pre-populated with user's name, photo, title)
2. Text block (pre-populated with bio)
3. Links block (pre-populated with user's links)
4. Contact CTA block

This gives every user a working page immediately, even before they touch the builder.

## Page Builder UI (Dashboard)

### Editor Layout
- Left panel: live preview of the page (mobile-width frame, scrollable)
- Right panel: block settings for the currently selected block
- Top: block palette (add new blocks via + button with block type picker)
- Drag handles on each block in the preview for reordering

### Interactions
- Click a block in preview to select it and open its settings
- Drag to reorder blocks
- "+" button between blocks to insert a new block at that position
- Delete button on each block (with confirmation)
- Hero block is always first and can't be deleted, only edited

### Live Preview
- Changes reflect immediately in the preview panel
- No separate "preview mode" needed, the editor IS the preview
- Mobile-first preview frame (375px width) with option to toggle to desktop width

### Auto-Save
- Changes save automatically with debounce (1-2 second delay after last edit)
- "Saving..." / "Saved" indicator in the editor header
- Explicit "Publish" button to push changes live (vs. saving as draft)

## Template System Integration

Templates are now **styling presets** rather than layout presets. Each template defines:
- Default background colors/gradients
- Typography (font pair, sizes, weights)
- Accent color palette
- Block styling (border radius, shadow, spacing)
- Button/link styling (pill vs. square, filled vs. outline)

The user's block arrangement is independent of the template. Switching templates changes the visual treatment, not the content or layout. This is the right separation of concerns.

### Template Definitions (stored as code, not DB)

```typescript
interface TemplateTheme {
  id: string;
  name: string;
  pageBackground: string;
  textColor: string;
  headingColor: string;
  accentColor: string;
  fontFamily: string;
  headingFontFamily: string;
  blockBackground: string;
  blockBorderRadius: string;
  blockShadow: string;
  buttonStyle: 'pill' | 'rounded' | 'square';
  buttonVariant: 'filled' | 'outline' | 'ghost';
  spacing: 'compact' | 'comfortable' | 'spacious';
}
```

## Rendering the Public Page

The `[slug]/page.tsx` route fetches the profile + all active blocks ordered by display_order, then renders each block using a component map:

```typescript
const blockComponents = {
  hero: HeroBlock,
  text: TextBlock,
  links: LinksBlock,
  capabilities: CapabilitiesBlock,
  cards: CardsBlock,
  image: ImageBlock,
  divider: DividerBlock,
  contact_cta: ContactCtaBlock,
};
```

Each block component receives its config + the active template theme and renders accordingly. Server-side rendered for fast load, with client-side hydration only for interactive elements (easter egg tap zones, PIN entry).

## What This Enables

Looking at Tim's WordPress page, here's how it maps to blocks:

| WordPress Section | Imprynt Block |
|---|---|
| Logo + Name + Contact Icons | Hero Block |
| Tagline "M&A Integration Leader..." | Hero Block (tagline field) |
| Photo + Bio paragraph | Text Block (with inline image or Image Block + Text Block) |
| "What I Do" with 3 service descriptions | Cards Block (3 columns) |
| TDK Consulting description | Text Block |
| "Strategic Capabilities" with grouped bullets | Capabilities Block |
| Image + "Experience Highlights" bullets | Image Block + Text Block (or Cards block) |
| "How I Engage" narrative | Text Block |
| Bottom contact links | Contact CTA Block |

That's ~8-10 blocks to replicate a full professional landing page. Achievable, customizable, and no WordPress needed.

## Implementation Priority

1. Database migration (add profile_blocks table)
2. Block CRUD API (create, read, update, delete, reorder)
3. Default block generation on profile creation
4. Public page renderer (read blocks, render by type)
5. Editor UI (block selection, settings panels, live preview)
6. Drag-and-drop reorder
7. Template themes (styling presets applied to blocks)
8. Image upload handling
9. Rich text editing for text blocks

Steps 1-4 can ship quickly and produce a working page. Steps 5-9 are the WYSIWYG polish.
