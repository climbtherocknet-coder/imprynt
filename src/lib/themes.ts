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
export const PREMIUM_TEMPLATES = ['midnight', 'editorial', 'noir', 'signal', 'studio', 'dusk'] as const;
export const ALL_TEMPLATES = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES] as const;

// ─── Helpers ─────────────────────────────────────────────────

export function getTheme(templateId: string): TemplateTheme {
  return THEMES[templateId] || THEMES.clean;
}

export function isValidTemplate(templateId: string): boolean {
  return templateId in THEMES;
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

/** Check if a template is dark (for meta theme-color, etc.) */
export function isDarkTemplate(templateId: string): boolean {
  const darkIds = ['midnight', 'noir', 'studio', 'dusk'];
  return darkIds.includes(templateId);
}

// Link type icons
export const LINK_ICONS: Record<string, string> = {
  linkedin: 'in',
  website: '~',
  email: '@',
  phone: '#',
  booking: '+',
  instagram: 'ig',
  twitter: 'x',
  facebook: 'f',
  github: 'gh',
  tiktok: 'tt',
  youtube: 'yt',
  custom: '>',
  vcard: 'vc',
};
