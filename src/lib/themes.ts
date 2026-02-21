// Template theme definitions — 10 templates (4 free, 6 premium)
// Templates are STYLING presets. All profiles share the same component tree.
// Templates change visual presentation through CSS variables + data-attribute modifiers.

export interface TemplateTheme {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'premium';
  fonts: {
    heading: string;
    body: string;
    googleImport: string; // e.g. 'family=Inter:wght@400;600' — empty string for system fonts
  };
  colors: {
    bg: string;
    bgAlt: string;
    surface: string;
    surface2: string;
    text: string;
    textMid: string;
    textMuted: string;
    accent: string;
    accentSoft: string;
    accentBorder: string;
    accentHover: string;
    border: string;
    borderHover: string;
  };
  modifiers: {
    photoShape: 'circle' | 'rounded';
    linkStyle: 'pills' | 'stacked' | 'full-width-pills';
    buttonStyle: 'pill' | 'rounded' | 'sharp';
    cardStyle: 'bordered' | 'shadowed' | 'flat';
    statStyle: 'inline' | 'boxed';
    radiusBase: string;
    radiusLg: string;
    spacingDensity: 'compact' | 'comfortable' | 'spacious';
  };
  effects?: {
    radialGlow?: boolean;
    pulseDot?: boolean;
    heroCardWrap?: boolean;
    heroRule?: boolean;
    heroTagline?: boolean;
  };
  extraVars?: Record<string, string>;
}

// ─── Free Templates (4) ──────────────────────────────────────

const clean: TemplateTheme = {
  id: 'clean',
  name: 'Clean',
  description: 'Minimal and modern',
  tier: 'free',
  fonts: {
    heading: "'Inter', system-ui, -apple-system, sans-serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
    googleImport: 'family=Inter:wght@300;400;500;600;700',
  },
  colors: {
    bg: '#ffffff',
    bgAlt: '#f8f9fa',
    surface: '#f1f3f5',
    surface2: '#e9ecef',
    text: '#1a1a2e',
    textMid: '#495057',
    textMuted: '#868e96',
    accent: '#3B82F6',
    accentSoft: 'rgba(59, 130, 246, 0.07)',
    accentBorder: 'rgba(59, 130, 246, 0.18)',
    accentHover: '#2563eb',
    border: '#e9ecef',
    borderHover: '#dee2e6',
  },
  modifiers: {
    photoShape: 'circle',
    linkStyle: 'pills',
    buttonStyle: 'pill',
    cardStyle: 'bordered',
    statStyle: 'boxed',
    radiusBase: '0.625rem',
    radiusLg: '0.875rem',
    spacingDensity: 'comfortable',
  },
};

const warm: TemplateTheme = {
  id: 'warm',
  name: 'Warm',
  description: 'Friendly and inviting',
  tier: 'free',
  fonts: {
    heading: "'Outfit', system-ui, sans-serif",
    body: "'Outfit', system-ui, sans-serif",
    googleImport: 'family=Outfit:wght@300;400;500;600;700',
  },
  colors: {
    bg: '#f7f5f2',
    bgAlt: '#f0ece7',
    surface: '#ffffff',
    surface2: '#e8e2da',
    text: '#2c2520',
    textMid: '#6b6058',
    textMuted: '#a09488',
    accent: '#c2703e',
    accentSoft: 'rgba(194, 112, 62, 0.07)',
    accentBorder: 'rgba(194, 112, 62, 0.18)',
    accentHover: '#b06435',
    border: '#e2dbd2',
    borderHover: '#d4cbc0',
  },
  modifiers: {
    photoShape: 'circle',
    linkStyle: 'pills',
    buttonStyle: 'pill',
    cardStyle: 'shadowed',
    statStyle: 'boxed',
    radiusBase: '1rem',
    radiusLg: '1.25rem',
    spacingDensity: 'spacious',
  },
};

const classic: TemplateTheme = {
  id: 'classic',
  name: 'Classic',
  description: 'Timeless and professional',
  tier: 'free',
  fonts: {
    heading: "Georgia, 'Times New Roman', serif",
    body: "Georgia, 'Times New Roman', serif",
    googleImport: '',
  },
  colors: {
    bg: '#faf9f7',
    bgAlt: '#f3f1ed',
    surface: '#ffffff',
    surface2: '#eae7e1',
    text: '#1a1a2e',
    textMid: '#4a4a5e',
    textMuted: '#8a8a9e',
    accent: '#1e3a5f',
    accentSoft: 'rgba(30, 58, 95, 0.05)',
    accentBorder: 'rgba(30, 58, 95, 0.15)',
    accentHover: '#162d4a',
    border: '#ddd9d2',
    borderHover: '#ccc8c0',
  },
  modifiers: {
    photoShape: 'circle',
    linkStyle: 'stacked',
    buttonStyle: 'rounded',
    cardStyle: 'bordered',
    statStyle: 'inline',
    radiusBase: '0.375rem',
    radiusLg: '0.5rem',
    spacingDensity: 'comfortable',
  },
  effects: {
    heroRule: true,
  },
};

const soft: TemplateTheme = {
  id: 'soft',
  name: 'Soft',
  description: 'Gentle and approachable',
  tier: 'free',
  fonts: {
    heading: "'DM Sans', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    googleImport: 'family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400',
  },
  colors: {
    bg: '#f4f4f5',
    bgAlt: '#ecedef',
    surface: '#ffffff',
    surface2: '#e4e5e8',
    text: '#1a1c20',
    textMid: '#55585f',
    textMuted: '#8e9199',
    accent: '#5b8a72',
    accentSoft: 'rgba(91, 138, 114, 0.06)',
    accentBorder: 'rgba(91, 138, 114, 0.16)',
    accentHover: '#4d7862',
    border: '#dcdee2',
    borderHover: '#cdd0d4',
  },
  modifiers: {
    photoShape: 'circle',
    linkStyle: 'pills',
    buttonStyle: 'pill',
    cardStyle: 'bordered',
    statStyle: 'boxed',
    radiusBase: '0.875rem',
    radiusLg: '1.125rem',
    spacingDensity: 'comfortable',
  },
  effects: {
    heroCardWrap: true,
  },
};

// ─── Premium Templates (6) ───────────────────────────────────

const midnight: TemplateTheme = {
  id: 'midnight',
  name: 'Midnight',
  description: 'Electric dark mode',
  tier: 'premium',
  fonts: {
    heading: "'Newsreader', Georgia, serif",
    body: "'Instrument Sans', system-ui, sans-serif",
    googleImport: 'family=Instrument+Sans:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400',
  },
  colors: {
    bg: '#0a0a0a',
    bgAlt: '#101010',
    surface: '#141414',
    surface2: '#1a1a1a',
    text: '#ebebeb',
    textMid: '#a0a0a0',
    textMuted: '#5a5a5a',
    accent: '#c8ff00',
    accentSoft: 'rgba(200, 255, 0, 0.06)',
    accentBorder: 'rgba(200, 255, 0, 0.12)',
    accentHover: '#b5e600',
    border: '#1e1e1e',
    borderHover: '#2a2a2a',
  },
  modifiers: {
    photoShape: 'circle',
    linkStyle: 'pills',
    buttonStyle: 'rounded',
    cardStyle: 'flat',
    statStyle: 'inline',
    radiusBase: '0.625rem',
    radiusLg: '0.875rem',
    spacingDensity: 'comfortable',
  },
  effects: {
    radialGlow: true,
    pulseDot: true,
  },
};

const editorial: TemplateTheme = {
  id: 'editorial',
  name: 'Editorial',
  description: 'Refined and literary',
  tier: 'premium',
  fonts: {
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    googleImport: 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600',
  },
  colors: {
    bg: '#f6f3ef',
    bgAlt: '#efeae3',
    surface: '#ffffff',
    surface2: '#ebe5dc',
    text: '#1a1714',
    textMid: '#5c554a',
    textMuted: '#8a8279',
    accent: '#b8860b',
    accentSoft: 'rgba(184, 134, 11, 0.06)',
    accentBorder: 'rgba(184, 134, 11, 0.18)',
    accentHover: '#a0750a',
    border: '#e2dbd2',
    borderHover: '#d4cbc0',
  },
  modifiers: {
    photoShape: 'circle',
    linkStyle: 'stacked',
    buttonStyle: 'pill',
    cardStyle: 'bordered',
    statStyle: 'inline',
    radiusBase: '0.5rem',
    radiusLg: '0.75rem',
    spacingDensity: 'spacious',
  },
  effects: {
    heroRule: true,
  },
};

const noir: TemplateTheme = {
  id: 'noir',
  name: 'Noir',
  description: 'Sophisticated dark elegance',
  tier: 'premium',
  fonts: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    googleImport: 'family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400',
  },
  colors: {
    bg: '#111111',
    bgAlt: '#161616',
    surface: '#1a1a1a',
    surface2: '#222222',
    text: '#f5f0e8',
    textMid: '#b5ada2',
    textMuted: '#706b63',
    accent: '#f5f0e8',
    accentSoft: 'rgba(245, 240, 232, 0.05)',
    accentBorder: 'rgba(245, 240, 232, 0.12)',
    accentHover: '#ffffff',
    border: '#2a2a2a',
    borderHover: '#383838',
  },
  modifiers: {
    photoShape: 'rounded',
    linkStyle: 'pills',
    buttonStyle: 'pill',
    cardStyle: 'flat',
    statStyle: 'inline',
    radiusBase: '0.625rem',
    radiusLg: '0.875rem',
    spacingDensity: 'spacious',
  },
  effects: {
    radialGlow: true,
    heroTagline: true,
  },
  extraVars: {
    '--warm': '#c49a6c',
    '--warm-soft': 'rgba(196, 154, 108, 0.08)',
  },
};

const signal: TemplateTheme = {
  id: 'signal',
  name: 'Signal',
  description: 'Bold and structured',
  tier: 'premium',
  fonts: {
    heading: "'Instrument Sans', system-ui, sans-serif",
    body: "'Instrument Sans', system-ui, sans-serif",
    googleImport: 'family=Instrument+Sans:wght@400;500;600;700',
  },
  colors: {
    bg: '#ffffff',
    bgAlt: '#fafafa',
    surface: '#f5f5f5',
    surface2: '#eeeeee',
    text: '#0a0a0a',
    textMid: '#525252',
    textMuted: '#a3a3a3',
    accent: '#e8553d',
    accentSoft: 'rgba(232, 85, 61, 0.06)',
    accentBorder: 'rgba(232, 85, 61, 0.18)',
    accentHover: '#d94a33',
    border: '#e5e5e5',
    borderHover: '#d4d4d4',
  },
  modifiers: {
    photoShape: 'rounded',
    linkStyle: 'full-width-pills',
    buttonStyle: 'sharp',
    cardStyle: 'bordered',
    statStyle: 'boxed',
    radiusBase: '0.75rem',
    radiusLg: '1rem',
    spacingDensity: 'comfortable',
  },
  extraVars: {
    '--border-width': '2px',
  },
};

const studio: TemplateTheme = {
  id: 'studio',
  name: 'Studio',
  description: 'Creative and technical',
  tier: 'premium',
  fonts: {
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'Space Grotesk', system-ui, sans-serif",
    googleImport: 'family=Space+Grotesk:wght@300;400;500;600;700',
  },
  colors: {
    bg: '#0c0c0e',
    bgAlt: '#111114',
    surface: '#16161a',
    surface2: '#1c1c22',
    text: '#ececf0',
    textMid: '#a0a0b0',
    textMuted: '#5a5a6e',
    accent: '#8b9cf7',
    accentSoft: 'rgba(139, 156, 247, 0.07)',
    accentBorder: 'rgba(139, 156, 247, 0.15)',
    accentHover: '#7b8ce7',
    border: '#1e1e28',
    borderHover: '#2a2a38',
  },
  modifiers: {
    photoShape: 'rounded',
    linkStyle: 'pills',
    buttonStyle: 'rounded',
    cardStyle: 'bordered',
    statStyle: 'boxed',
    radiusBase: '0.75rem',
    radiusLg: '1rem',
    spacingDensity: 'comfortable',
  },
  effects: {
    radialGlow: true,
  },
  extraVars: {
    '--gradient-cta': 'linear-gradient(135deg, #8b9cf7, #b78cf7)',
  },
};

const dusk: TemplateTheme = {
  id: 'dusk',
  name: 'Dusk',
  description: 'Warm golden dark',
  tier: 'premium',
  fonts: {
    heading: "'Instrument Serif', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    googleImport: 'family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700',
  },
  colors: {
    bg: '#0c1017',
    bgAlt: '#101520',
    surface: '#161c28',
    surface2: '#1b2233',
    text: '#eceef2',
    textMid: '#a8adb8',
    textMuted: '#5d6370',
    accent: '#e8a849',
    accentSoft: 'rgba(232, 168, 73, 0.06)',
    accentBorder: 'rgba(232, 168, 73, 0.16)',
    accentHover: '#f0b85e',
    border: '#1e2535',
    borderHover: '#283042',
  },
  modifiers: {
    photoShape: 'circle',
    linkStyle: 'pills',
    buttonStyle: 'pill',
    cardStyle: 'flat',
    statStyle: 'inline',
    radiusBase: '0.625rem',
    radiusLg: '0.875rem',
    spacingDensity: 'spacious',
  },
  effects: {
    radialGlow: true,
    heroTagline: true,
  },
};

// ─── Theme Registry ──────────────────────────────────────────

export const THEMES: Record<string, TemplateTheme> = {
  clean, warm, classic, soft,
  midnight, editorial, noir, signal, studio, dusk,
};

export const FREE_TEMPLATES = ['clean', 'warm', 'classic', 'soft'] as const;
export const PREMIUM_TEMPLATES = ['midnight', 'editorial', 'noir', 'signal', 'studio', 'dusk', 'custom'] as const;
export const ALL_TEMPLATES = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES] as const;

// ─── Custom Theme ─────────────────────────────────────────────

/** Shape of the JSONB stored in profiles.custom_theme when template = 'custom' */
export interface CustomThemeData {
  // Colors (13 vars)
  bg?: string;
  bgAlt?: string;
  surface?: string;
  surface2?: string;
  text?: string;
  textMid?: string;
  textMuted?: string;
  accent?: string;
  accentSoft?: string;
  accentBorder?: string;
  accentHover?: string;
  border?: string;
  borderHover?: string;
  // Layout modifiers
  photoShape?: 'circle' | 'rounded';
  linkStyle?: 'pills' | 'stacked' | 'full-width-pills';
  buttonStyle?: 'pill' | 'rounded' | 'sharp';
  radiusBase?: string;
}

/** Build a TemplateTheme from custom JSONB data, falling back to 'clean' defaults */
export function getCustomTheme(data: CustomThemeData | null | undefined): TemplateTheme {
  const base = THEMES.clean;
  const d = data || {};
  return {
    id: 'custom',
    name: 'Custom',
    description: 'Your custom theme',
    tier: 'premium',
    fonts: base.fonts,
    colors: {
      bg:           d.bg           || base.colors.bg,
      bgAlt:        d.bgAlt        || base.colors.bgAlt,
      surface:      d.surface      || base.colors.surface,
      surface2:     d.surface2     || base.colors.surface2,
      text:         d.text         || base.colors.text,
      textMid:      d.textMid      || base.colors.textMid,
      textMuted:    d.textMuted    || base.colors.textMuted,
      accent:       d.accent       || base.colors.accent,
      accentSoft:   d.accentSoft   || base.colors.accentSoft,
      accentBorder: d.accentBorder || base.colors.accentBorder,
      accentHover:  d.accentHover  || base.colors.accentHover,
      border:       d.border       || base.colors.border,
      borderHover:  d.borderHover  || base.colors.borderHover,
    },
    modifiers: {
      photoShape:     d.photoShape    || base.modifiers.photoShape,
      linkStyle:      d.linkStyle     || base.modifiers.linkStyle,
      buttonStyle:    d.buttonStyle   || base.modifiers.buttonStyle,
      cardStyle:      base.modifiers.cardStyle,
      statStyle:      base.modifiers.statStyle,
      radiusBase:     d.radiusBase    || base.modifiers.radiusBase,
      radiusLg:       base.modifiers.radiusLg,
      spacingDensity: base.modifiers.spacingDensity,
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────

export function getTheme(templateId: string): TemplateTheme {
  if (templateId === 'custom') return getCustomTheme(null);
  return THEMES[templateId] || THEMES.clean;
}

export function isValidTemplate(templateId: string): boolean {
  return templateId === 'custom' || templateId in THEMES;
}

export function isFreeTier(templateId: string): boolean {
  return (FREE_TEMPLATES as readonly string[]).includes(templateId);
}

/** Convert theme colors to a CSS custom-property string for inline style injection */
export function getThemeCSSVars(theme: TemplateTheme): string {
  const { colors, modifiers, fonts, extraVars } = theme;
  const vars = [
    `--bg: ${colors.bg}`,
    `--bg-alt: ${colors.bgAlt}`,
    `--surface: ${colors.surface}`,
    `--surface-2: ${colors.surface2}`,
    `--text: ${colors.text}`,
    `--text-mid: ${colors.textMid}`,
    `--text-muted: ${colors.textMuted}`,
    `--accent: ${colors.accent}`,
    `--accent-soft: ${colors.accentSoft}`,
    `--accent-border: ${colors.accentBorder}`,
    `--accent-hover: ${colors.accentHover}`,
    `--border: ${colors.border}`,
    `--border-hover: ${colors.borderHover}`,
    `--radius: ${modifiers.radiusBase}`,
    `--radius-lg: ${modifiers.radiusLg}`,
    `--font-heading: ${fonts.heading}`,
    `--font-body: ${fonts.body}`,
  ];

  if (extraVars) {
    for (const [key, value] of Object.entries(extraVars)) {
      vars.push(`${key}: ${value}`);
    }
  }

  return vars.join('; ');
}

/** Get the Google Fonts <link> URL for a template (empty string if none needed) */
export function getGoogleFontsUrl(theme: TemplateTheme): string {
  if (!theme.fonts.googleImport) return '';
  return `https://fonts.googleapis.com/css2?${theme.fonts.googleImport}&display=swap`;
}

/** Get data-attributes for the profile container element */
export function getTemplateDataAttrs(theme: TemplateTheme): Record<string, string> {
  return {
    'data-template': theme.id,
    'data-photo': theme.modifiers.photoShape,
    'data-links': theme.modifiers.linkStyle,
    'data-buttons': theme.modifiers.buttonStyle,
    'data-cards': theme.modifiers.cardStyle,
    'data-stats': theme.modifiers.statStyle,
  };
}

/**
 * Generate CSS variable overrides for a user-supplied accent hex color.
 * Derives soft/border/hover variants automatically from the hex value.
 */
export function getAccentOverrideVars(hex: string): Record<string, string> {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Darken by ~10 % for hover
  const darken = (n: number) => Math.max(0, Math.round(n * 0.88));
  const hover = `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
  return {
    '--accent': hex,
    '--accent-soft': `rgba(${r}, ${g}, ${b}, 0.07)`,
    '--accent-border': `rgba(${r}, ${g}, ${b}, 0.18)`,
    '--accent-hover': hover,
  };
}

/** Check if a template is dark (for meta theme-color, etc.) */
export function isDarkTemplate(templateId: string): boolean {
  const darkIds = ['midnight', 'noir', 'studio', 'dusk'];
  return darkIds.includes(templateId);
}

// Link type icons — inline SVG strings, renderable via dangerouslySetInnerHTML
export const LINK_ICONS: Record<string, string> = {
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
  booking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  custom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
  vcard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="11" r="2.5"/><path d="M14 10h4M14 14h4M5 18c0-2 1.5-3 3-3s3 1 3 3"/></svg>',
};
