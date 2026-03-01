'use client';

import { useState, useEffect, useCallback } from 'react';
import SaveContactButton from '@/components/templates/SaveContactButton';
import '@/styles/profile.css';

interface ExpandablePhotoProps {
  photoUrl: string;
  fullName: string;
  customPhotoStyle?: React.CSSProperties;
  positionStyle?: React.CSSProperties;
  initials: string;
  title?: string;
  company?: string;
  profileId: string;
  vcardPinEnabled?: boolean;
}

export default function ExpandablePhoto({
  photoUrl,
  fullName,
  customPhotoStyle,
  positionStyle: _positionStyle,
  initials,
  title,
  company,
  profileId,
  vcardPinEnabled,
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
          <div className="photo-lightbox-card" onClick={e => e.stopPropagation()}>
            <button
              className="photo-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <img
              src={photoUrl}
              alt={fullName}
              className="photo-lightbox-img"
            />

            <h3 className="photo-lightbox-name">{fullName}</h3>
            {(title || company) && (
              <p className="photo-lightbox-info">
                {title}{title && company ? ' · ' : ''}{company}
              </p>
            )}

            <SaveContactButton
              profileId={profileId}
              pinProtected={vcardPinEnabled || false}
              iconOnly={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
