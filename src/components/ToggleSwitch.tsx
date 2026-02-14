'use client';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export default function ToggleSwitch({ checked, onChange, label, description, disabled }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        style={{
          position: 'relative',
          width: 36,
          height: 20,
          borderRadius: 10,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: checked ? '#e8a849' : '#283042',
          transition: 'background-color 0.2s',
          padding: 0,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: '#fff',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </button>
      <div>
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: checked ? '#eceef2' : '#a8adb8',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
        }}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </span>
        {description && (
          <p style={{ fontSize: '0.75rem', color: '#5d6370', margin: '0.125rem 0 0' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
