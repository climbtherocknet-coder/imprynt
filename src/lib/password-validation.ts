/**
 * Password policy and strength evaluation.
 *
 * Policy (enforced server-side + reflected client-side):
 *  - Minimum 10 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 *  - At least one special character (!@#$%^&*…)
 *
 * Strength meter (client-side visual only):
 *  0 = empty  |  1 = weak  |  2 = fair  |  3 = good  |  4 = strong
 */

export interface PasswordCheck {
  /** Whether the password meets all policy requirements */
  valid: boolean;
  /** Individual rule results */
  rules: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    digit: boolean;
    special: boolean;
  };
  /** Aggregated error messages for any failed rules */
  errors: string[];
}

const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

export function validatePassword(password: string): PasswordCheck {
  const rules = {
    minLength: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: SPECIAL_CHARS.test(password),
  };

  const errors: string[] = [];
  if (!rules.minLength) errors.push('At least 10 characters');
  if (!rules.uppercase) errors.push('At least one uppercase letter');
  if (!rules.lowercase) errors.push('At least one lowercase letter');
  if (!rules.digit) errors.push('At least one number');
  if (!rules.special) errors.push('At least one special character');

  return {
    valid: errors.length === 0,
    rules,
    errors,
  };
}

/**
 * Returns a 0-4 strength score for the visual meter.
 * Each satisfied rule category adds 1 point (length counts double when >= 14).
 */
export function passwordStrength(password: string): number {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (SPECIAL_CHARS.test(password)) score++;

  // Clamp to 4
  return Math.min(score, 4);
}

export const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;
export const STRENGTH_COLORS = ['', '#f87171', '#f59e0b', '#e8a849', '#22c55e'] as const;
