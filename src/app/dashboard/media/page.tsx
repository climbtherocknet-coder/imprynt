'use client';

import MediaManager from '@/components/dashboard/MediaManager';

export default function MediaPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text, #eceef2)', marginBottom: '0.5rem' }}>
        My Media
      </h1>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '1.5rem' }}>
        All images and audio files across your profile, pods, and pages. Upload, manage, and delete files here.
      </p>
      <MediaManager />
    </div>
  );
}
