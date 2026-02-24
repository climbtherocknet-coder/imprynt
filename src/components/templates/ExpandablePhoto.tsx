'use client';

import { useState, useEffect, useCallback } from 'react';
import '@/styles/profile.css';

interface ExpandablePhotoProps {
  photoUrl: string;
  fullName: string;
  customPhotoStyle?: React.CSSProperties;
  positionStyle?: React.CSSProperties;
  initials: string;
}

export default function ExpandablePhoto({
  photoUrl,
  fullName,
  customPhotoStyle,
  positionStyle,
  initials,
}: ExpandablePhotoProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setLightboxOpen(false);
  }, []);

  useEffect(() => {
    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen, handleKeyDown]);

  return (
    <>
      <div className="photo" style={customPhotoStyle}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={fullName}
            className="photo-expandable"
            style={positionStyle}
            onClick={() => setLightboxOpen(true)}
          />
        ) : (
          <div className="photo-inner">
            {initials}
          </div>
        )}
      </div>

      {lightboxOpen && photoUrl && (
        <div className="photo-lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <img src={photoUrl} alt={fullName} />
        </div>
      )}
    </>
  );
}
