// Color presets for the "Custom" template
// Each preset provides values for all 13 theme color variables.

export interface CustomThemeColors {
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
}

export interface ColorPreset {
  id: string;
  name: string;
  colors: CustomThemeColors;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    colors: {
      bg: '#0c1017',
      bgAlt: '#111720',
      surface: '#161c28',
      surface2: '#1e2535',
      text: '#eceef2',
      textMid: '#a8adb8',
      textMuted: '#5a6272',
      accent: '#e8a849',
      accentSoft: 'rgba(232, 168, 73, 0.08)',
      accentBorder: 'rgba(232, 168, 73, 0.20)',
      accentHover: '#d4943a',
      border: '#1e2535',
      borderHover: '#283042',
    },
  },
  {
    id: 'snow',
    name: 'Snow',
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
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      bg: '#f7f9f7',
      bgAlt: '#eef3ee',
      surface: '#e4ede4',
      surface2: '#d5e3d5',
      text: '#1a2e1a',
      textMid: '#3d5a3d',
      textMuted: '#7a9a7a',
      accent: '#2d7a3a',
      accentSoft: 'rgba(45, 122, 58, 0.08)',
      accentBorder: 'rgba(45, 122, 58, 0.20)',
      accentHover: '#235e2d',
      border: '#c8dbc8',
      borderHover: '#b0ccb0',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      bg: '#fff8f5',
      bgAlt: '#fff0e8',
      surface: '#ffe4d4',
      surface2: '#ffd4bc',
      text: '#2e1a10',
      textMid: '#7a4030',
      textMuted: '#b87a68',
      accent: '#e8553d',
      accentSoft: 'rgba(232, 85, 61, 0.08)',
      accentBorder: 'rgba(232, 85, 61, 0.20)',
      accentHover: '#d44030',
      border: '#f0c8b8',
      borderHover: '#e8b8a0',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      bg: '#f0f7ff',
      bgAlt: '#e4f0ff',
      surface: '#d4e8ff',
      surface2: '#c0deff',
      text: '#0a1e35',
      textMid: '#2a4a6a',
      textMuted: '#6a90b0',
      accent: '#0072c6',
      accentSoft: 'rgba(0, 114, 198, 0.08)',
      accentBorder: 'rgba(0, 114, 198, 0.20)',
      accentHover: '#005fa8',
      border: '#b8d8f0',
      borderHover: '#a0c8e8',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: {
      bg: '#fff5f7',
      bgAlt: '#ffecf0',
      surface: '#ffd8e0',
      surface2: '#ffc4d0',
      text: '#2e0f18',
      textMid: '#7a3a4a',
      textMuted: '#b87a88',
      accent: '#d63864',
      accentSoft: 'rgba(214, 56, 100, 0.08)',
      accentBorder: 'rgba(214, 56, 100, 0.20)',
      accentHover: '#bf2d58',
      border: '#f0b8c8',
      borderHover: '#e8a0b8',
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    colors: {
      bg: '#f4f6f8',
      bgAlt: '#eaecf0',
      surface: '#dde1e8',
      surface2: '#ced3dc',
      text: '#1a202c',
      textMid: '#4a5568',
      textMuted: '#8898aa',
      accent: '#5a67d8',
      accentSoft: 'rgba(90, 103, 216, 0.08)',
      accentBorder: 'rgba(90, 103, 216, 0.20)',
      accentHover: '#4c56bf',
      border: '#c8cfe0',
      borderHover: '#b8c0d8',
    },
  },
  {
    id: 'espresso',
    name: 'Espresso',
    colors: {
      bg: '#fdf8f5',
      bgAlt: '#f5ede4',
      surface: '#ecddd0',
      surface2: '#e0ccba',
      text: '#2a1808',
      textMid: '#6b4030',
      textMuted: '#a87860',
      accent: '#c2703e',
      accentSoft: 'rgba(194, 112, 62, 0.08)',
      accentBorder: 'rgba(194, 112, 62, 0.20)',
      accentHover: '#a85f32',
      border: '#d8c0a8',
      borderHover: '#cca890',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    colors: {
      bg: '#f0f8ff',
      bgAlt: '#e4f2fc',
      surface: '#d4eaf8',
      surface2: '#c0e0f4',
      text: '#0a1828',
      textMid: '#2a4868',
      textMuted: '#6888a8',
      accent: '#00b4d8',
      accentSoft: 'rgba(0, 180, 216, 0.08)',
      accentBorder: 'rgba(0, 180, 216, 0.20)',
      accentHover: '#009ab8',
      border: '#b0d8f0',
      borderHover: '#98c8e8',
    },
  },
  {
    id: 'noir',
    name: 'Noir',
    colors: {
      bg: '#0a0a0a',
      bgAlt: '#111111',
      surface: '#1a1a1a',
      surface2: '#242424',
      text: '#f0f0f0',
      textMid: '#a0a0a0',
      textMuted: '#606060',
      accent: '#c49a6c',
      accentSoft: 'rgba(196, 154, 108, 0.08)',
      accentBorder: 'rgba(196, 154, 108, 0.20)',
      accentHover: '#b08055',
      border: '#2a2a2a',
      borderHover: '#383838',
    },
  },
];

// Utility: convert hex to rgba
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Utility: darken a hex color by a percentage (0–1 range)
export function darkenHex(hex: string, amount = 0.12): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const darken = (n: number) => Math.max(0, Math.round(n * (1 - amount)));
  return `#${[darken(r), darken(g), darken(b)].map(n => n.toString(16).padStart(2, '0')).join('')}`;
}

// Derive accentSoft, accentBorder, accentHover from a hex accent color
export function deriveAccentVars(hex: string): Pick<CustomThemeColors, 'accentSoft' | 'accentBorder' | 'accentHover'> {
  return {
    accentSoft: hexToRgba(hex, 0.08),
    accentBorder: hexToRgba(hex, 0.20),
    accentHover: darkenHex(hex, 0.12),
  };
}
