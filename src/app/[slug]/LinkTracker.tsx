'use client';

import { useEffect } from 'react';

export default function LinkTracker({ profileId, links }: {
  profileId: string;
  links: { id: string; url: string }[];
}) {
  useEffect(() => {
    // Build a URL → linkId map for fast lookup
    const urlToId = new Map<string, string>();
    for (const link of links) {
      urlToId.set(link.url, link.id);
    }

    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      // Check direct URL match or mailto:/tel: stripped match
      const linkId = urlToId.get(href)
        || urlToId.get(href.replace(/^mailto:/, ''))
        || urlToId.get(href.replace(/^tel:/, ''));
      if (!linkId) return;

      const payload = JSON.stringify({ profileId, linkId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/link-click', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/analytics/link-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [profileId, links]);

  return null;
}
