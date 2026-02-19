'use client';

import { useState, useRef, useEffect } from 'react';

interface SaveContactButtonProps {
  profileId: string;
  pinProtected: boolean;
  iconOnly?: boolean;
}

export default function SaveContactButton({ profileId, pinProtected, iconOnly = false }: SaveContactButtonProps) {
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showPinPrompt && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showPinPrompt]);

  useEffect(() => {
    if (!showPinPrompt) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPinPrompt(false);
        setPin('');
        setError('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPinPrompt]);

  const handleDownload = async () => {
    if (!pin.trim()) { setError('Enter PIN'); return; }
    setError('');
    setDownloading(true);
    try {
      const res = await fetch(`/api/vcard/${profileId}?pin=${encodeURIComponent(pin.trim())}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Invalid PIN');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contact.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowPinPrompt(false);
      setPin('');
    } catch {
      setError('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (!pinProtected) {
    return (
      <div className="save-row fade-in d4">
        <a href={`/api/vcard/${profileId}`} className={iconOnly ? 'link-icon-btn' : 'save-btn'}>
          {iconOnly ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          ) : '↓ Save Contact'}
        </a>
      </div>
    );
  }

  return (
    <div className="save-row fade-in d4" style={{ position: 'relative' }}>
      <button
        className={iconOnly ? 'link-icon-btn' : 'save-btn'}
        onClick={() => setShowPinPrompt(!showPinPrompt)}
        style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit', width: iconOnly ? 'auto' : '100%' }}
      >
        {iconOnly ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        ) : '↓ Save Contact'}
      </button>

      {showPinPrompt && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '0.5rem',
            padding: '1rem',
            backgroundColor: 'var(--surface, #161c28)',
            border: '1px solid var(--border, #1e2535)',
            borderRadius: '0.75rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 100,
            minWidth: 220,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-mid, #a8adb8)', margin: '0 0 0.5rem' }}>
            Enter PIN to download contact
          </p>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleDownload(); }}
              placeholder="PIN"
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: `1px solid ${error ? '#ef4444' : 'var(--border-light, #283042)'}`,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'var(--bg, #0c1017)',
                color: 'var(--text, #eceef2)',
                fontFamily: 'inherit',
                textAlign: 'center',
                letterSpacing: '0.15em',
              }}
            />
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--accent, #e8a849)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: downloading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: downloading ? 0.6 : 1,
              }}
            >
              {downloading ? '...' : '↓'}
            </button>
          </div>
          {error && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0.375rem 0 0' }}>{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
