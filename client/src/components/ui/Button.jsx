import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    hoverBg: 'var(--accent-hover)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
    hoverBg: 'var(--bg-hover)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-strong)',
    hoverBg: 'var(--bg-hover)',
  },
  danger: {
    background: 'var(--red-light)',
    color: 'var(--red)',
    border: '1px solid rgba(239,68,68,0.3)',
    hoverBg: 'rgba(239,68,68,0.25)',
  },
};

const sizes = {
  sm: { padding: '5px 12px', fontSize: '12px', height: '30px' },
  md: { padding: '8px 16px', fontSize: '13px', height: '36px' },
  lg: { padding: '10px 20px', fontSize: '14px', height: '42px' },
  icon: { padding: '0', fontSize: '14px', height: '32px', width: '32px' },
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: 'var(--radius-md)',
        fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...v,
        ...s,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = v.hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = v.background;
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {size !== 'icon' && children}
      {IconRight && !loading && <IconRight size={14} />}
    </button>
  );
}

export default Button;
