import React from 'react';
import { THEMES } from '@/lib/themes';
import type { CustomThemeData } from '@/lib/themes';

// ── Contact Field Definitions ─────────────────────────

export const CONTACT_FIELD_DEFS = [
  { type: 'phone_cell', label: 'Cell Phone', placeholder: '+1 (555) 000-0000', inputType: 'tel' },
  { type: 'phone_work', label: 'Work Phone', placeholder: '+1 (555) 000-0000', inputType: 'tel' },
  { type: 'phone_personal', label: 'Personal Phone', placeholder: '+1 (555) 000-0000', inputType: 'tel' },
  { type: 'email_work', label: 'Work Email', placeholder: 'you@company.com', inputType: 'email' },
  { type: 'email_personal', label: 'Personal Email', placeholder: 'you@gmail.com', inputType: 'email' },
  { type: 'address_work', label: 'Work Address', placeholder: '123 Main St, City, State', inputType: 'text' },
  { type: 'address_home', label: 'Home Address', placeholder: '456 Oak Ave, City, State', inputType: 'text' },
  { type: 'birthday', label: 'Birthday', placeholder: '', inputType: 'date' },
  { type: 'pronouns', label: 'Pronouns', placeholder: 'e.g. he/him, she/her, they/them', inputType: 'text' },
  { type: 'name_suffix', label: 'Name Suffix', placeholder: 'e.g. Jr., MD, PhD, Esq.', inputType: 'text' },
];

// ── Link Type Definitions ─────────────────────────────

export const LINK_TYPES = [
  { type: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname', icon: '💼' },
  { type: 'website', label: 'Website', placeholder: 'https://yoursite.com', icon: '🌐' },
  { type: 'email', label: 'Email', placeholder: 'you@example.com', icon: '✉️' },
  { type: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', icon: '📱' },
  { type: 'booking', label: 'Booking', placeholder: 'https://calendly.com/you', icon: '📅' },
  { type: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/handle', icon: '📷' },
  { type: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/handle', icon: '𝕏' },
  { type: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: '⌨️' },
  { type: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/page', icon: 'f' },
  { type: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@handle', icon: '🎵' },
  { type: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel', icon: '▶️' },
  { type: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...', icon: '🎧' },
  { type: 'custom', label: 'Custom', placeholder: 'https://...', icon: '🔗' },
  { type: 'vcard', label: 'vCard', placeholder: 'Download contact card', icon: '📇' },
];

// ── Color Presets ─────────────────────────────────────

export const COLOR_PRESETS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#6366F1', '#000000', '#6B7280',
];

export const TEMPLATE_LIST = Object.values(THEMES);

// ── Shared Styles ─────────────────────────────────────

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5625rem 0.75rem',
  border: '1px solid var(--border-light, #283042)',
  borderRadius: '0.5rem',
  fontSize: '0.9375rem',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
  backgroundColor: 'var(--bg, #0c1017)',
  color: 'var(--text, #eceef2)',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  marginBottom: '0.3125rem',
  color: 'var(--text-mid, #a8adb8)',
};

export const sectionStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface, #161c28)',
  borderRadius: '1rem',
  border: '1px solid var(--border, #1e2535)',
  padding: '1.5rem',
  marginBottom: '1.25rem',
};

export const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  marginBottom: '1rem',
  color: 'var(--text, #eceef2)',
};

export const saveBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  backgroundColor: 'var(--accent, #e8a849)',
  color: 'var(--bg, #0c1017)',
  border: 'none',
  borderRadius: '2rem',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

// ── Shared Types ──────────────────────────────────────

export interface LinkItem {
  id?: string;
  linkType: string;
  label: string;
  url: string;
  displayOrder: number;
  showBusiness: boolean;
  showPersonal: boolean;
  showShowcase: boolean;
  buttonColor?: string | null;
}

export interface ProfileData {
  user: { firstName: string; lastName: string; plan: string };
  profile: {
    id: string;
    slug: string;
    redirectId: string;
    title: string;
    company: string;
    tagline: string;
    bioHeading: string;
    bio: string;
    photoUrl: string;
    template: string;
    primaryColor: string;
    accentColor: string;
    fontPair: string;
    isPublished: boolean;
    statusTags: string[];
    statusTagColor: string | null;
    allowSharing: boolean;
    allowFeedback: boolean;
    photoShape: string;
    photoRadius: number | null;
    photoSize: string;
    photoPositionX: number;
    photoPositionY: number;
    photoAnimation: string;
    photoAlign: string;
    vcardPinEnabled: boolean;
    showQrButton: boolean;
    linkDisplay: string;
    customTheme: CustomThemeData | null;
    coverUrl: string | null;
    coverPositionY: number;
    coverOpacity: number;
    bgImageUrl: string | null;
    bgImageOpacity: number;
    bgImagePositionY: number;
    photoZoom: number;
    coverPositionX: number;
    coverZoom: number;
    bgImagePositionX: number;
    bgImageZoom: number;
    linkSize: string;
    linkShape: string;
    linkButtonColor: string | null;
  };
  links: LinkItem[];
}
