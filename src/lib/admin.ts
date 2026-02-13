/**
 * Admin access control via ADMIN_EMAILS env var.
 * Comma-separated list of email addresses.
 * Example: ADMIN_EMAILS=tim@example.com,partner@example.com
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}
