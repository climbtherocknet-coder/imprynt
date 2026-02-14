'use client';

import { useMemo } from 'react';
import {
  validatePassword,
  passwordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
} from '@/lib/password-validation';

interface Props {
  password: string;
  /** Show individual rule checklist. Default: true */
  showRules?: boolean;
}

export default function PasswordStrengthMeter({ password, showRules = true }: Props) {
  const check = useMemo(() => validatePassword(password), [password]);
  const strength = useMemo(() => passwordStrength(password), [password]);

  if (!password) return null;

  const label = STRENGTH_LABELS[strength];
  const color = STRENGTH_COLORS[strength];

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Bar */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.375rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= strength ? color : 'var(--border, #1e2535)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>

      {/* Label */}
      <p style={{ fontSize: '0.75rem', color, margin: 0, fontWeight: 600 }}>{label}</p>

      {/* Rule checklist */}
      {showRules && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
          {([
            ['minLength', '10+ characters'],
            ['uppercase', 'Uppercase letter'],
            ['lowercase', 'Lowercase letter'],
            ['digit', 'Number'],
            ['special', 'Special character'],
          ] as const).map(([key, text]) => (
            <li
              key={key}
              style={{
                fontSize: '0.75rem',
                color: check.rules[key] ? '#22c55e' : 'var(--text-muted, #5d6370)',
                margin: '0.125rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <span style={{ width: 14, textAlign: 'center' }}>
                {check.rules[key] ? '\u2713' : '\u2022'}
              </span>
              {text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
