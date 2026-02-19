'use client';

import { useState } from 'react';
import '@/styles/dashboard.css';

interface ContactField {
  fieldType: string;
  fieldValue: string;
  showBusiness: boolean;
  showPersonal: boolean;
}

interface ContactEditorProps {
  contactFields: ContactField[];
}

const CONTACT_FIELD_DEFS = [
  { type: 'company', label: 'Company Name', placeholder: 'Acme Corp', inputType: 'text' },
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

const sectionStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface, #161c28)',
  borderRadius: '1rem',
  border: '1px solid var(--border, #1e2535)',
  padding: '1.5rem',
  marginBottom: '1.25rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border-light, #283042)',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  backgroundColor: 'var(--bg, #0c1017)',
  color: 'var(--text, #eceef2)',
  boxSizing: 'border-box',
  outline: 'none',
};

export default function ContactEditor({ contactFields: initialContactFields }: ContactEditorProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [fields, setFields] = useState<Record<string, { value: string; showBusiness: boolean; showPersonal: boolean }>>(() => {
    const map: Record<string, { value: string; showBusiness: boolean; showPersonal: boolean }> = {};
    for (const def of CONTACT_FIELD_DEFS) {
      const existing = initialContactFields.find(f => f.fieldType === def.type);
      map[def.type] = {
        value: existing?.fieldValue || '',
        showBusiness: existing?.showBusiness ?? true,
        showPersonal: existing?.showPersonal ?? true,
      };
    }
    return map;
  });

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const payload = CONTACT_FIELD_DEFS
        .filter(def => fields[def.type]?.value?.trim())
        .map((def, i) => ({
          fieldType: def.type,
          fieldValue: fields[def.type].value,
          showBusiness: fields[def.type].showBusiness,
          showPersonal: fields[def.type].showPersonal,
          displayOrder: i,
        }));

      const res = await fetch('/api/account/contact-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: payload }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact info');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dash-page">
      <header className="dash-header" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="dash-logo">
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Imprynt</span>
          </a>
          <span style={{ color: 'var(--text-muted, #5d6370)', margin: '0 0.5rem' }}>/</span>
          <span style={{ color: 'var(--text-mid, #a8adb8)', fontSize: '0.875rem' }}>Contact Card</span>
        </div>
        <a href="/dashboard" style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #e8a849)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #5d6370)')}>
          &#8592; Dashboard
        </a>
      </header>

      <main className="dash-main" style={{ maxWidth: 640 }}>
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text, #eceef2)' }}>Contact Information</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 1rem' }}>
            These fields are included in your vCards. Toggle each field on or off for Business and/or Personal.
          </p>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {CONTACT_FIELD_DEFS.map(def => {
              const field = fields[def.type];
              const hasValue = field?.value?.trim();
              return (
                <div key={def.type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-mid, #a8adb8)' }}>
                      {def.label}
                    </label>
                    {hasValue && (
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setFields(prev => ({
                              ...prev,
                              [def.type]: { ...prev[def.type], showBusiness: !prev[def.type].showBusiness },
                            }));
                          }}
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            backgroundColor: field.showBusiness ? 'rgba(59, 130, 246, 0.15)' : 'var(--border, #1e2535)',
                            color: field.showBusiness ? '#60a5fa' : 'var(--text-muted, #5d6370)',
                            opacity: field.showBusiness ? 1 : 0.7,
                          }}
                        >
                          BIZ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFields(prev => ({
                              ...prev,
                              [def.type]: { ...prev[def.type], showPersonal: !prev[def.type].showPersonal },
                            }));
                          }}
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            backgroundColor: field.showPersonal ? 'rgba(236, 72, 153, 0.15)' : 'var(--border, #1e2535)',
                            color: field.showPersonal ? '#f472b6' : 'var(--text-muted, #5d6370)',
                            opacity: field.showPersonal ? 1 : 0.7,
                          }}
                        >
                          PERSONAL
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type={def.inputType}
                    placeholder={def.placeholder}
                    value={field?.value || ''}
                    onChange={e => {
                      setFields(prev => ({
                        ...prev,
                        [def.type]: { ...prev[def.type], value: e.target.value },
                      }));
                    }}
                    style={inputStyle}
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="dash-btn"
            style={{
              marginTop: '1.25rem',
              width: 'auto',
              padding: '0.625rem 1.25rem',
              backgroundColor: saved ? '#059669' : undefined,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Contact Info'}
          </button>
        </div>
      </main>
    </div>
  );
}
