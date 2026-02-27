'use client';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { inputStyle, CONTACT_FIELD_DEFS } from './constants';

// ── Exported Types ───────────────────────────────────

export interface ContactCardState {
  contactFields: Record<string, { value: string; showBusiness: boolean; showPersonal: boolean }>;
  customFields: { tempId: string; label: string; value: string; showBusiness: boolean; showPersonal: boolean }[];
  saveButtonStyle?: string;
  saveButtonColor?: string | null;
}

export interface ContactCardSectionProps {
  initial: ContactCardState;
  onChange: (state: ContactCardState) => void;
  onError: (msg: string) => void;
}

export interface ContactCardSectionRef {
  save: () => Promise<void>;
  getState: () => ContactCardState;
}

// ── Component ────────────────────────────────────────

const ContactCardSection = forwardRef<ContactCardSectionRef, ContactCardSectionProps>(
  function ContactCardSection({ initial, onChange, onError }, ref) {
    // ── Internal State ─────────────────────────────────
    const [contactFields, setContactFields] = useState<
      Record<string, { value: string; showBusiness: boolean; showPersonal: boolean }>
    >(
      initial.contactFields && Object.keys(initial.contactFields).length > 0
        ? initial.contactFields
        : Object.fromEntries(
            CONTACT_FIELD_DEFS.map(def => [
              def.type,
              { value: '', showBusiness: true, showPersonal: true },
            ]),
          ),
    );

    const [customFields, setCustomFields] = useState<
      { tempId: string; label: string; value: string; showBusiness: boolean; showPersonal: boolean }[]
    >(initial.customFields || []);

    const [saveButtonStyle, setSaveButtonStyle] = useState(initial.saveButtonStyle || 'auto');
    const [saveButtonColor, setSaveButtonColor] = useState(initial.saveButtonColor || '');

    const [contactSaving, setContactSaving] = useState(false);
    const [contactSaved, setContactSaved] = useState(false);

    // ── Imperative Handle ──────────────────────────────
    const getState = (): ContactCardState => ({
      contactFields,
      customFields,
      saveButtonStyle,
      saveButtonColor: saveButtonColor || null,
    });

    useImperativeHandle(ref, () => ({
      getState,
      save: async () => {
        const standardPayload = CONTACT_FIELD_DEFS
          .filter(def => contactFields[def.type]?.value?.trim())
          .map((def, i) => ({
            fieldType: def.type,
            fieldValue: contactFields[def.type].value,
            showBusiness: contactFields[def.type].showBusiness,
            showPersonal: contactFields[def.type].showPersonal,
            displayOrder: i,
          }));

        const customPayload = customFields
          .filter(f => f.label.trim() && f.value.trim())
          .map((f, i) => ({
            fieldType: 'custom',
            customLabel: f.label,
            fieldValue: f.value,
            showBusiness: f.showBusiness,
            showPersonal: f.showPersonal,
            displayOrder: standardPayload.length + i,
          }));

        const payload = [...standardPayload, ...customPayload];
        const [contactRes, profileRes] = await Promise.all([
          fetch('/api/account/contact-fields', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: payload }),
          }),
          fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section: 'appearance', saveButtonStyle, saveButtonColor: saveButtonColor || null }),
          }),
        ]);
        if (!contactRes.ok) throw new Error('Failed to save contact fields');
        if (!profileRes.ok) throw new Error('Failed to save button style');
      },
    }));

    // ── Data Loading ───────────────────────────────────
    useEffect(() => {
      fetch('/api/account/contact-fields')
        .then(r => r.json())
        .then((cf: { fields?: { fieldType: string; fieldValue: string; customLabel?: string | null; showBusiness: boolean; showPersonal: boolean }[] }) => {
          if (cf.fields) {
            const standard = cf.fields.filter(f => f.fieldType !== 'custom');
            const custom = cf.fields.filter(f => f.fieldType === 'custom');
            setContactFields(prev => {
              const next = { ...prev };
              for (const f of standard) {
                next[f.fieldType] = { value: f.fieldValue || '', showBusiness: f.showBusiness ?? true, showPersonal: f.showPersonal ?? true };
              }
              return next;
            });
            setCustomFields(custom.map((f, i) => ({
              tempId: `existing-${i}`,
              label: f.customLabel || '',
              value: f.fieldValue || '',
              showBusiness: f.showBusiness ?? true,
              showPersonal: f.showPersonal ?? true,
            })));
          }
        })
        .catch(() => { /* silent */ });
    }, []);

    // ── onChange propagation ────────────────────────────
    useEffect(() => {
      onChange(getState());
    }, [contactFields, customFields, saveButtonStyle, saveButtonColor]);

    // ── Toggle button base style ───────────────────────
    const toggleBtnBase: React.CSSProperties = {
      fontSize: '0.625rem',
      fontWeight: 600,
      padding: '0.2rem 0.5rem',
      borderRadius: '9999px',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    };

    // ── JSX ────────────────────────────────────────────
    return (
      <>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 1rem' }}>
          These fields are included when visitors save your contact. Toggle visibility for Business and Personal vCards.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {CONTACT_FIELD_DEFS.map(def => {
            const field = contactFields[def.type];
            const hasValue = field?.value?.trim();
            return (
              <div key={def.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-mid, #a8adb8)' }}>{def.label}</label>
                  {hasValue && (
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button type="button" onClick={() => setContactFields(prev => ({ ...prev, [def.type]: { ...prev[def.type], showBusiness: !prev[def.type].showBusiness } }))}
                        style={{ ...toggleBtnBase, backgroundColor: field.showBusiness ? 'rgba(59, 130, 246, 0.15)' : 'var(--border, #1e2535)', color: field.showBusiness ? '#60a5fa' : 'var(--text-muted, #5d6370)' }}>
                        BIZ
                      </button>
                      <button type="button" onClick={() => setContactFields(prev => ({ ...prev, [def.type]: { ...prev[def.type], showPersonal: !prev[def.type].showPersonal } }))}
                        style={{ ...toggleBtnBase, backgroundColor: field.showPersonal ? 'rgba(236, 72, 153, 0.15)' : 'var(--border, #1e2535)', color: field.showPersonal ? '#f472b6' : 'var(--text-muted, #5d6370)' }}>
                        PERSONAL
                      </button>
                    </div>
                  )}
                </div>
                <input type={def.inputType} placeholder={def.placeholder} value={field?.value || ''}
                  onChange={e => setContactFields(prev => ({ ...prev, [def.type]: { ...prev[def.type], value: e.target.value } }))}
                  style={inputStyle}
                />
              </div>
            );
          })}

          {/* Custom fields */}
          {customFields.map((cf, idx) => (
            <div key={cf.tempId} style={{ borderTop: '1px solid var(--border, #1e2535)', paddingTop: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <input
                  type="text"
                  placeholder="Field label (e.g. Office, Fax)"
                  value={cf.label}
                  onChange={e => setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, label: e.target.value } : f))}
                  style={{ ...inputStyle, flex: 1, fontSize: '0.8125rem', marginBottom: 0, fontWeight: 500 }}
                />
                <div style={{ display: 'flex', gap: '0.375rem', marginLeft: '0.5rem' }}>
                  <button type="button" onClick={() => setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, showBusiness: !f.showBusiness } : f))}
                    style={{ ...toggleBtnBase, backgroundColor: cf.showBusiness ? 'rgba(59, 130, 246, 0.15)' : 'var(--border, #1e2535)', color: cf.showBusiness ? '#60a5fa' : 'var(--text-muted, #5d6370)' }}>
                    BIZ
                  </button>
                  <button type="button" onClick={() => setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, showPersonal: !f.showPersonal } : f))}
                    style={{ ...toggleBtnBase, backgroundColor: cf.showPersonal ? 'rgba(236, 72, 153, 0.15)' : 'var(--border, #1e2535)', color: cf.showPersonal ? '#f472b6' : 'var(--text-muted, #5d6370)' }}>
                    PERSONAL
                  </button>
                  <button type="button" onClick={() => setCustomFields(prev => prev.filter((_, i) => i !== idx))}
                    style={{ ...toggleBtnBase, backgroundColor: 'var(--border, #1e2535)', color: 'var(--text-muted, #5d6370)' }}>
                    ✕
                  </button>
                </div>
              </div>
              <input type="text" placeholder="Value" value={cf.value}
                onChange={e => setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f))}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCustomFields(prev => [...prev, { tempId: `new-${Date.now()}`, label: '', value: '', showBusiness: true, showPersonal: true }])}
          style={{ marginTop: '0.875rem', fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', background: 'none', border: '1px dashed var(--border-light, #283042)', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
        >
          + Add custom field
        </button>

        {/* ── Save Button Style ─────────────────────────── */}
        <div style={{ borderTop: '1px solid var(--border, #1e2535)', marginTop: '1.25rem', paddingTop: '1rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-mid, #a8adb8)', display: 'block', marginBottom: '0.375rem' }}>Save button style</label>
          <select
            value={saveButtonStyle}
            onChange={e => setSaveButtonStyle(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="auto">Auto (matches template)</option>
            <option value="accent">Accent color</option>
            <option value="inverted">Inverted</option>
            <option value="custom">Custom color</option>
          </select>
          {saveButtonStyle === 'custom' && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)' }}>Color</label>
              <input
                type="color"
                value={saveButtonColor || '#e8a849'}
                onChange={e => setSaveButtonColor(e.target.value)}
                style={{ width: 32, height: 32, border: '1px solid var(--border, #1e2535)', borderRadius: '0.375rem', padding: 0, cursor: 'pointer', background: 'none' }}
              />
            </div>
          )}
        </div>
      </>
    );
  },
);

export default ContactCardSection;
