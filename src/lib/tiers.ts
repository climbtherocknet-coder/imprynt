// Content block and link tier limits by plan

export const TIER_LIMITS = {
  free: {
    maxPods: 2,
    allowedPodTypes: ['text', 'text_image', 'cta', 'link_preview'],
    maxLinks: 5,
    resumeLink: true,
  },
  paid: {
    maxPods: 10,
    allowedPodTypes: ['text', 'text_image', 'stats', 'cta', 'link_preview', 'project', 'listing', 'event', 'music'],
    maxLinks: 50,
    resumeLink: true,
  },
} as const;
