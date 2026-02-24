import { isAdmin } from './admin';

export type AccessLevel = 'admin' | 'advisory' | 'none';

export function getAccessLevel(email: string | null | undefined, plan: string | null | undefined): AccessLevel {
  if (isAdmin(email)) return 'admin';
  if (plan === 'advisory') return 'advisory';
  return 'none';
}
