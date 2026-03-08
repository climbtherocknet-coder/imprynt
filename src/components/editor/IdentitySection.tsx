'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { inputStyle, labelStyle, sectionStyle } from './constants';

// ── Types ──────────────────────────────────────────────

export interface IdentityState {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  tagline: string;
  useCompanyAsDisplay?: boolean;
}

export interface IdentitySectionProps {
  initial: IdentityState;
  onChange: (state: IdentityState) => void;
  onError: (msg: string) => void;
}

export interface IdentitySectionRef {
  save: () => Promise<void>;
  getState: () => IdentityState;
}

// ── Component ──────────────────────────────────────────

const IdentitySection = forwardRef<IdentitySectionRef, IdentitySectionProps>(
  ({ initial, onChange, onError }, ref) => {
    const [firstName, setFirstName] = useState(initial.firstName);
    const [lastName, setLastName] = useState(initial.lastName);
    const [title, setTitle] = useState(initial.title);
    const [company, setCompany] = useState(initial.company);
    const [tagline, setTagline] = useState(initial.tagline);
    const [useCompanyAsDisplay, setUseCompanyAsDisplay] = useState(initial.useCompanyAsDisplay || false);

    const getState = (): IdentityState => ({ firstName, lastName, title, company, tagline, useCompanyAsDisplay });

    // Notify parent of changes
    useEffect(() => {
      onChange(getState());
    }, [firstName, lastName, title, company, tagline, useCompanyAsDisplay]); // eslint-disable-line react-hooks/exhaustive-deps

    // Expose save + getState to parent
    useImperativeHandle(ref, () => ({
      save: async () => {
        try {
          const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              section: 'identity',
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              title: title.trim(),
              company: company.trim(),
              tagline: tagline.trim(),
              useCompanyAsDisplay,
            }),
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || 'Failed to save');
          }
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Failed to save');
          throw err;
        }
      },
      getState,
    }), [firstName, lastName, title, company, tagline, useCompanyAsDisplay, onError]);

    return (
      <div style={{ ...sectionStyle, marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>First name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Required" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Last name</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Optional" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Product Designer" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Company</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc." style={inputStyle} />
          </div>
        </div>
        {company && company.trim().length > 0 && (
          <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.8125rem', color: 'var(--text-mid, #a8adb8)', cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={useCompanyAsDisplay}
                onChange={e => setUseCompanyAsDisplay(e.target.checked)}
              />
              Use &ldquo;{company.trim()}&rdquo; as my display name
            </label>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
              Your company or band name will appear instead of your personal name on your profile
            </p>
          </div>
        )}
        <div style={{ marginTop: '0.75rem' }}>
          <label style={labelStyle}>
            Tagline
            <span style={{ fontWeight: 400, color: 'var(--text-muted, #5d6370)', marginLeft: '0.5rem' }}>{tagline.length}/100</span>
          </label>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value.slice(0, 100))}
            placeholder="A short headline that appears under your name"
            style={inputStyle}
          />
        </div>
      </div>
    );
  }
);

IdentitySection.displayName = 'IdentitySection';
export default IdentitySection;
