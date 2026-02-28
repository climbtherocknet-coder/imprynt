'use client';
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import ImageCropper from '@/components/ui/ImageCropper';
import CoverPreview from '@/components/ui/CoverPreview';
import GalleryPicker from '@/components/ui/GalleryPicker';
import { labelStyle, sectionTitleStyle } from './constants';

// ── Exported Types ───────────────────────────────────────

export interface VisualsState {
  photoUrl: string;
  photoShape: string;
  photoRadius: number;
  photoSize: string;
  photoPositionX: number;
  photoPositionY: number;
  photoZoom: number;
  photoAnimation: string;
  photoAlign: string;
  coverUrl: string;
  coverPositionX: number;
  coverPositionY: number;
  coverOpacity: number;
  coverZoom: number;
  bgImageUrl: string;
  bgImagePositionX: number;
  bgImagePositionY: number;
  bgImageOpacity: number;
  bgImageZoom: number;
}

export interface VisualsSectionProps {
  initial: VisualsState;
  isPaid: boolean;
  onChange: (state: VisualsState) => void;
  onError: (msg: string) => void;
  heroPreview?: {
    firstName?: string;
    lastName?: string;
    title?: string;
    company?: string;
    statusTags?: string[];
  };
}

export interface VisualsSectionRef {
  save: () => Promise<void>;
  getState: () => VisualsState;
}

// ── Local section style ──────────────────────────────────

const sectionStyleLocal: React.CSSProperties = {
  backgroundColor: 'var(--surface, #161c28)',
  borderRadius: '1rem',
  border: '1px solid var(--border, #1e2535)',
  padding: '1.5rem',
  marginBottom: '1.25rem',
};

// ── Component ────────────────────────────────────────────

const VisualsSection = forwardRef<VisualsSectionRef, VisualsSectionProps>(
  ({ initial, isPaid, onChange, onError, heroPreview }, ref) => {
    // ── VisualsState fields ──
    const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
    const [photoShape, setPhotoShape] = useState(initial.photoShape);
    const [photoRadius, setPhotoRadius] = useState(initial.photoRadius);
    const [photoSize, setPhotoSize] = useState(initial.photoSize);
    const [photoPositionX, setPhotoPositionX] = useState(initial.photoPositionX);
    const [photoPositionY, setPhotoPositionY] = useState(initial.photoPositionY);
    const [photoZoom, setPhotoZoom] = useState(initial.photoZoom);
    const [photoAnimation, setPhotoAnimation] = useState(initial.photoAnimation);
    const [photoAlign, setPhotoAlign] = useState(initial.photoAlign);
    const [coverUrl, setCoverUrl] = useState(initial.coverUrl);
    const [coverPositionX, setCoverPositionX] = useState(initial.coverPositionX);
    const [coverPositionY, setCoverPositionY] = useState(initial.coverPositionY);
    const [coverOpacity, setCoverOpacity] = useState(initial.coverOpacity);
    const [coverZoom, setCoverZoom] = useState(initial.coverZoom);
    const [bgImageUrl, setBgImageUrl] = useState(initial.bgImageUrl);
    const [bgImagePositionX, setBgImagePositionX] = useState(initial.bgImagePositionX);
    const [bgImagePositionY, setBgImagePositionY] = useState(initial.bgImagePositionY);
    const [bgImageOpacity, setBgImageOpacity] = useState(initial.bgImageOpacity);
    const [bgImageZoom, setBgImageZoom] = useState(initial.bgImageZoom);

    // ── Internal-only state ──
    const [uploading, setUploading] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const [bgImageUploading, setBgImageUploading] = useState(false);
    const [showPhotoSettings, setShowPhotoSettings] = useState(false);
    const [showShapeSlider, setShowShapeSlider] = useState(false);
    const [showGallery, setShowGallery] = useState<'cover' | 'background' | null>(null);

    // ── File input refs ──
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverFileInputRef = useRef<HTMLInputElement>(null);
    const bgImageFileInputRef = useRef<HTMLInputElement>(null);

    // ── getState helper ──
    const getState = (): VisualsState => ({
      photoUrl,
      photoShape,
      photoRadius,
      photoSize,
      photoPositionX,
      photoPositionY,
      photoZoom,
      photoAnimation,
      photoAlign,
      coverUrl,
      coverPositionX,
      coverPositionY,
      coverOpacity,
      coverZoom,
      bgImageUrl,
      bgImagePositionX,
      bgImagePositionY,
      bgImageOpacity,
      bgImageZoom,
    });

    // ── onChange effect ──
    useEffect(() => {
      onChange(getState());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      photoUrl, photoShape, photoRadius, photoSize,
      photoPositionX, photoPositionY, photoZoom,
      photoAnimation, photoAlign,
      coverUrl, coverPositionX, coverPositionY, coverOpacity, coverZoom,
      bgImageUrl, bgImagePositionX, bgImagePositionY, bgImageOpacity, bgImageZoom,
    ]);

    // ── Upload handlers ──
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('photo', file);
        const res = await fetch('/api/upload/photo', { method: 'POST', body: fd });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Upload failed');
        }
        const data = await res.json();
        setPhotoUrl(data.photoUrl);
      } catch (err: any) {
        onError(err.message || 'Upload failed');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setCoverUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload/file', { method: 'POST', body: fd });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Upload failed');
        }
        const data = await res.json();
        setCoverUrl(data.url);
      } catch (err: any) {
        onError(err.message || 'Upload failed');
      } finally {
        setCoverUploading(false);
        if (coverFileInputRef.current) coverFileInputRef.current.value = '';
      }
    };

    const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setBgImageUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload/file', { method: 'POST', body: fd });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Upload failed');
        }
        const data = await res.json();
        setBgImageUrl(data.url);
      } catch (err: any) {
        onError(err.message || 'Upload failed');
      } finally {
        setBgImageUploading(false);
        if (bgImageFileInputRef.current) bgImageFileInputRef.current.value = '';
      }
    };

    // ── Imperative handle ──
    useImperativeHandle(ref, () => ({
      save: async () => {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'profile',
            photoShape,
            photoRadius: photoShape === 'custom' ? photoRadius : null,
            photoSize,
            photoPositionX,
            photoPositionY,
            photoZoom,
            photoAnimation,
            photoAlign,
            coverUrl: coverUrl || null,
            coverPositionX,
            coverPositionY,
            coverOpacity,
            coverZoom,
            bgImageUrl: bgImageUrl || null,
            bgImagePositionX,
            bgImagePositionY,
            bgImageOpacity,
            bgImageZoom,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to save');
        }
      },
      getState,
    }));

    // ── JSX ──
    return (
      <div style={sectionStyleLocal}>
        <h3 style={sectionTitleStyle}>Visuals</h3>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleCoverUpload}
          style={{ display: 'none' }}
        />
        <input
          ref={bgImageFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleBgImageUpload}
          style={{ display: 'none' }}
        />

        {/* ── Profile Photo ── */}
        <label style={{ ...labelStyle, fontSize: '0.8125rem' }}>Profile Photo</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: 'var(--border, #1e2535)',
              border: '1px solid var(--border-light, #283042)',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              color: 'var(--text, #eceef2)',
            }}
          >
            {uploading ? 'Uploading...' : photoUrl ? 'Replace' : 'Upload photo'}
          </button>
          {photoUrl && (
            <button
              onClick={() => setPhotoUrl('')}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-light, #283042)',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: 'var(--text-muted, #5d6370)',
              }}
            >
              Remove
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.75rem' }}>
          JPEG, PNG, or WebP. Max 10MB.
        </p>

        {photoUrl && (
          <ImageCropper
            src={photoUrl}
            frameShape="circle"
            positionX={photoPositionX}
            positionY={photoPositionY}
            zoom={photoZoom}
            onPositionChange={(x, y) => { setPhotoPositionX(x); setPhotoPositionY(y); }}
            onZoomChange={setPhotoZoom}
            photoShape={photoShape}
            photoRadius={photoRadius}
          />
        )}

        {/* ── Photo Settings (collapsible) ── */}
        <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg, #0c1017)', borderRadius: '0.75rem', border: '1px solid var(--border, #1e2535)' }}>
          <div
            onClick={() => setShowPhotoSettings(!showPhotoSettings)}
            className="collapsible-header"
          >
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', transition: 'transform 0.2s', transform: showPhotoSettings ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
            <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Photo Settings</label>
            {!isPaid && (
              <span style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.05em', backgroundColor: 'var(--border-light, #283042)', color: 'var(--text-muted, #5d6370)', padding: '1px 4px', borderRadius: '3px', lineHeight: 1.4 }}>PRO</span>
            )}
          </div>

          {showPhotoSettings && (<>
          {/* Size picker */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Size</label>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {([
                { id: 'small', label: 'S', iconSize: 12 },
                { id: 'medium', label: 'M', iconSize: 16 },
                { id: 'large', label: 'L', iconSize: 20 },
              ] as const).map(s => (
                <button
                  key={s.id}
                  onClick={() => setPhotoSize(s.id)}
                  style={{
                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '0.375rem',
                    border: photoSize === s.id ? '2px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                    backgroundColor: 'var(--surface, #161c28)', cursor: 'pointer', padding: 0,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ width: s.iconSize, height: s.iconSize, borderRadius: '50%', backgroundColor: photoSize === s.id ? 'var(--accent, #e8a849)' : 'var(--text-muted, #5d6370)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Shape picker */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Shape</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
              {([
                { id: 'circle', label: 'Circle', free: true, render: <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--accent, #e8a849)' }} /> },
                { id: 'rounded', label: 'Rounded', free: false, render: <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: 'var(--accent, #e8a849)' }} /> },
                { id: 'soft', label: 'Soft', free: false, render: <div style={{ width: 22, height: 22, borderRadius: 3, backgroundColor: 'var(--accent, #e8a849)' }} /> },
                { id: 'square', label: 'Square', free: true, render: <div style={{ width: 22, height: 22, borderRadius: 0, backgroundColor: 'var(--accent, #e8a849)' }} /> },
                { id: 'hexagon', label: 'Hexagon', free: false, render: <div style={{ width: 22, height: 22, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', backgroundColor: 'var(--accent, #e8a849)' }} /> },
                { id: 'diamond', label: 'Diamond', free: false, render: <div style={{ width: 22, height: 22, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', backgroundColor: 'var(--accent, #e8a849)' }} /> },
              ] as const).map(shape => {
                const isSelected = photoShape === shape.id;
                const isLocked = !isPaid && !shape.free;
                return (
                  <button
                    key={shape.id}
                    onClick={() => {
                      if (isLocked) return;
                      setPhotoShape(shape.id);
                      const map: Record<string, number> = { circle: 50, rounded: 32, soft: 16, square: 0 };
                      if (map[shape.id] !== undefined) setPhotoRadius(map[shape.id]);
                      if (shape.id === 'hexagon' || shape.id === 'diamond') setShowShapeSlider(false);
                    }}
                    title={isLocked ? `${shape.label} (Premium)` : shape.label}
                    style={{
                      width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '0.375rem', position: 'relative',
                      border: isSelected ? '2px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                      backgroundColor: 'var(--surface, #161c28)',
                      cursor: isLocked ? 'not-allowed' : 'pointer', padding: 0,
                      opacity: isLocked ? 0.45 : 1,
                      transition: 'border-color 0.15s, opacity 0.15s',
                    }}
                  >
                    {shape.render}
                    {isLocked && (
                      <span style={{ position: 'absolute', top: -4, right: -4, fontSize: '0.4375rem', fontWeight: 700, backgroundColor: 'var(--border-light, #283042)', color: 'var(--text-muted, #5d6370)', padding: '0px 3px', borderRadius: '2px', lineHeight: 1.4 }}>PRO</span>
                    )}
                  </button>
                );
              })}
              {!['hexagon', 'diamond'].includes(photoShape) && (
                <button
                  onClick={() => { if (!isPaid) return; setShowShapeSlider(!showShapeSlider); }}
                  style={{
                    background: 'none', border: 'none', fontFamily: 'inherit',
                    fontSize: '0.6875rem', padding: '0 0.25rem',
                    cursor: isPaid ? 'pointer' : 'not-allowed',
                    color: isPaid ? 'var(--text-muted, #5d6370)' : 'var(--border-light, #283042)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { if (isPaid) e.currentTarget.style.color = 'var(--accent, #e8a849)'; }}
                  onMouseLeave={e => { if (isPaid) e.currentTarget.style.color = 'var(--text-muted, #5d6370)'; }}
                >
                  {showShapeSlider ? 'Hide' : 'Custom'}
                </button>
              )}
            </div>
            {showShapeSlider && !['hexagon', 'diamond'].includes(photoShape) && isPaid && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input
                  type="range" min={0} max={50} value={photoRadius}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setPhotoRadius(val);
                    if (val === 50) setPhotoShape('circle');
                    else if (val === 32) setPhotoShape('rounded');
                    else if (val === 16) setPhotoShape('soft');
                    else if (val === 0) setPhotoShape('square');
                    else setPhotoShape('custom');
                  }}
                  style={{ flex: 1, accentColor: 'var(--accent, #e8a849)' }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-mid, #a8adb8)', minWidth: 28, textAlign: 'right' }}>{photoRadius}%</span>
              </div>
            )}
          </div>

          {/* Animation picker */}
          <div>
            <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Animation</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {([
                { id: 'none', label: 'None', free: true },
                { id: 'fade', label: 'Fade', free: false },
                { id: 'slide-left', label: '\u2190', free: false },
                { id: 'slide-right', label: '\u2192', free: false },
                { id: 'scale', label: 'Scale', free: false },
                { id: 'pop', label: 'Pop', free: false },
              ] as const).map(anim => {
                const isSelected = photoAnimation === anim.id;
                const isLocked = !isPaid && !anim.free;
                return (
                  <button
                    key={anim.id}
                    onClick={() => {
                      if (isLocked) return;
                      setPhotoAnimation(anim.id);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 500,
                      border: isSelected ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                      backgroundColor: isSelected ? 'rgba(232, 168, 73, 0.1)' : 'var(--surface, #161c28)',
                      color: isSelected ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                      cursor: isLocked ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                      opacity: isLocked ? 0.45 : 1, position: 'relative',
                      transition: 'all 0.15s',
                    }}
                  >
                    {anim.label}
                    {isLocked && (
                      <span style={{ fontSize: '0.4375rem', fontWeight: 700, marginLeft: '0.25rem', color: 'var(--text-muted, #5d6370)' }}>PRO</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo alignment — 3 buttons */}
          <div>
            <label style={{ ...labelStyle, fontSize: '0.6875rem', marginBottom: '0.375rem' }}>Photo Alignment</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {([['left', 'Left', 'M4 6h6M4 10h8M4 14h6M4 18h4'], ['center', 'Center', 'M4 6h16M6 10h12M4 14h16M6 18h12'], ['right', 'Right', 'M14 6h6M12 10h8M14 14h6M16 18h4']] as [string, string, string][]).map(([val, label, iconPath]) => {
                const isActive = photoAlign === val;
                return (
                  <button
                    key={val}
                    onClick={() => setPhotoAlign(val)}
                    style={{
                      flex: 1,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                      padding: '0.5rem 0.25rem',
                      borderRadius: '0.5rem',
                      border: isActive ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                      backgroundColor: isActive ? 'rgba(232, 168, 73, 0.08)' : 'var(--surface, #161c28)',
                      color: isActive ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d={iconPath} />
                    </svg>
                    <span style={{ fontSize: '0.625rem', fontWeight: 600 }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          </>)}
        </div>

        <div style={{ borderTop: '1px solid var(--border, #1e2535)', margin: '1.25rem 0' }} />

        {/* ── Cover Photo ── */}
        <CollapsibleSection title="Cover Photo" flat defaultOpen={!!coverUrl}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => coverFileInputRef.current?.click()}
              disabled={!isPaid || coverUploading}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--border, #1e2535)',
                border: '1px solid var(--border-light, #283042)',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: !isPaid || coverUploading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                color: isPaid ? 'var(--text, #eceef2)' : 'var(--text-muted, #5d6370)',
                opacity: isPaid ? 1 : 0.6,
              }}
            >
              {coverUploading ? 'Uploading...' : coverUrl ? 'Replace' : 'Upload'}
            </button>
            {coverUrl && (
              <button
                onClick={() => setCoverUrl('')}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: 'var(--text-muted, #5d6370)',
                }}
              >
                Remove
              </button>
            )}
            <button
              onClick={() => setShowGallery('cover')}
              disabled={!isPaid}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-light, #283042)',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: isPaid ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                color: isPaid ? 'var(--text-mid, #a8adb8)' : 'var(--text-muted, #5d6370)',
                opacity: isPaid ? 1 : 0.6,
              }}
            >
              Browse Gallery
            </button>
          </div>
          {coverUrl && (
            <CoverPreview
              src={coverUrl}
              positionX={coverPositionX}
              positionY={coverPositionY}
              zoom={coverZoom}
              opacity={coverOpacity}
              onPositionChange={(x, y) => { setCoverPositionX(x); setCoverPositionY(y); }}
              onZoomChange={setCoverZoom}
              photoUrl={photoUrl}
              firstName={heroPreview?.firstName}
              lastName={heroPreview?.lastName}
              title={heroPreview?.title}
              company={heroPreview?.company}
              statusTags={heroPreview?.statusTags}
            />
          )}
          {coverUrl && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ ...labelStyle, fontSize: '0.6875rem', marginBottom: 0 }}>Opacity</label>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)' }}>{coverOpacity}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', whiteSpace: 'nowrap' }}>Subtle</span>
                <input type="range" min={10} max={100} value={coverOpacity} onChange={e => setCoverOpacity(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--accent, #e8a849)' }} />
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', whiteSpace: 'nowrap' }}>Bold</span>
              </div>
            </div>
          )}
        </CollapsibleSection>

        <div style={{ borderTop: '1px solid var(--border, #1e2535)', margin: '1.25rem 0' }} />

        {/* ── Background Photo ── */}
        <CollapsibleSection title="Background Photo" flat defaultOpen={!!bgImageUrl}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => bgImageFileInputRef.current?.click()}
              disabled={!isPaid || bgImageUploading}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--border, #1e2535)',
                border: '1px solid var(--border-light, #283042)',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: !isPaid || bgImageUploading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                color: isPaid ? 'var(--text, #eceef2)' : 'var(--text-muted, #5d6370)',
                opacity: isPaid ? 1 : 0.6,
              }}
            >
              {bgImageUploading ? 'Uploading...' : bgImageUrl ? 'Replace' : 'Upload'}
            </button>
            {bgImageUrl && (
              <button
                onClick={() => setBgImageUrl('')}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: 'var(--text-muted, #5d6370)',
                }}
              >
                Remove
              </button>
            )}
            <button
              onClick={() => setShowGallery('background')}
              disabled={!isPaid}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-light, #283042)',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: isPaid ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                color: isPaid ? 'var(--text-mid, #a8adb8)' : 'var(--text-muted, #5d6370)',
                opacity: isPaid ? 1 : 0.6,
              }}
            >
              Browse Gallery
            </button>
          </div>
          {bgImageUrl && (
            <ImageCropper
              src={bgImageUrl}
              frameShape="portrait"
              positionX={bgImagePositionX}
              positionY={bgImagePositionY}
              zoom={bgImageZoom}
              onPositionChange={(x, y) => { setBgImagePositionX(x); setBgImagePositionY(y); }}
              onZoomChange={setBgImageZoom}
            />
          )}
          {bgImageUrl && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ ...labelStyle, fontSize: '0.6875rem', marginBottom: 0 }}>Visibility</label>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)' }}>{bgImageOpacity}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', whiteSpace: 'nowrap' }}>Subtle</span>
                <input type="range" min={5} max={100} value={bgImageOpacity} onChange={e => setBgImageOpacity(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--accent, #e8a849)' }} />
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', whiteSpace: 'nowrap' }}>Bold</span>
              </div>
            </div>
          )}
        </CollapsibleSection>

        {/* Gallery picker modal */}
        {showGallery && (
          <GalleryPicker
            category={showGallery}
            onSelect={(url) => {
              if (showGallery === 'cover') setCoverUrl(url);
              else setBgImageUrl(url);
              setShowGallery(null);
            }}
            onClose={() => setShowGallery(null)}
          />
        )}
      </div>
    );
  }
);

VisualsSection.displayName = 'VisualsSection';

export default VisualsSection;
