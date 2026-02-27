/**
 * Build the best sharing URL for a profile's redirect ID.
 * Uses the short domain if configured, falls back to /go/ path on main domain.
 */
export function getShareUrl(redirectId: string, origin?: string): string {
  const shortDomain = process.env.NEXT_PUBLIC_SHORT_DOMAIN || '';
  if (shortDomain) {
    return `https://${shortDomain}/${redirectId}`;
  }
  // Fallback: use /go/ on the main domain
  return `${origin || ''}/go/${redirectId}`;
}

/**
 * Build the full profile page URL from a slug.
 */
export function getProfileUrl(slug: string, origin?: string): string {
  return `${origin || ''}/${slug}`;
}

/**
 * Strip protocol prefix for cleaner URL display.
 * Copy operations should still use the full URL.
 */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '');
}
