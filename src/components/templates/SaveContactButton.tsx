'use client';

import { useState, useRef, useEffect } from 'react';

const VCARD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="11" r="2.5"/><path d="M14 10h4M14 14h4M5 18c0-2 1.5-3 3-3s3 1 3 3"/></svg>';

interface SaveContactButtonProps {
  profileId: string;
  pinProtected: boolean;
  iconOnly?: boolean;
  inline?: boolean;
}

export default function SaveContactButton({ profileId, pinProtected, iconOnly = false, inline = false }: SaveContactButtonProps) {
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

  const iconBtn = (
    <span className="icon" dangerouslySetInnerHTML={{ __html: VCARD_ICON }} />
  );

  const pinPopover = showPinPrompt && (
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
  );

  if (!pinProtected) {
    if (inline) {
      return (
        <a href={`/api/vcard/${profileId}`} className="link-icon-btn save-icon-btn" title="Save Contact" aria-label="Save Contact">
          {iconBtn}
        </a>
      );
    }
    return (
      <div className="save-row fade-in d4">
        <a href={`/api/vcard/${profileId}`} className={iconOnly ? 'link-icon-btn save-icon-btn' : 'save-btn'}>
          {iconOnly ? iconBtn : '↓ Save Contact'}
        </a>
      </div>
    );
  }

  if (inline) {
    return (
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <button
          className="link-icon-btn save-icon-btn"
          onClick={() => setShowPinPrompt(!showPinPrompt)}
          title="Save Contact"
          aria-label="Save Contact"
        >
          {iconBtn}
        </button>
        {pinPopover}
      </span>
    );
  }

  return (
    <div className="save-row fade-in d4" style={{ position: 'relative' }}>
      <button
        className={iconOnly ? 'link-icon-btn save-icon-btn' : 'save-btn'}
        onClick={() => setShowPinPrompt(!showPinPrompt)}
        style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit', width: iconOnly ? 'auto' : '100%' }}
      >
        {iconOnly ? iconBtn : '↓ Save Contact'}
      </button>
      {pinPopover}
    </div>
  );
}
