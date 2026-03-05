'use client';

import { useEffect } from 'react';

interface ContactLinksLoaderProps {
  profileId: string;
  pageToken: string;
  linkIds: string[];
}

export default function ContactLinksLoader({ profileId, pageToken, linkIds }: ContactLinksLoaderProps) {
  useEffect(() => {
    if (linkIds.length === 0) return;

    fetch(`/api/public/contacts/${profileId}`, {
      headers: { 'x-page-token': pageToken },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.links) return;
        for (const link of data.links) {
          // Find all anchor elements that link to this contact link's placeholder
          const anchors = document.querySelectorAll(`a[data-link-id="${link.id}"]`);
          anchors.forEach(anchor => {
            const href = link.link_type === 'email'
              ? `mailto:${link.url}`
              : link.link_type === 'phone'
                ? `tel:${link.url}`
                : link.url;
            anchor.setAttribute('href', href);
          });
        }
      })
      .catch(() => {});
  }, [profileId, pageToken, linkIds]);

  return null;
}
