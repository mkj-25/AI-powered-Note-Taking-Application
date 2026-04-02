import React from 'react';

function Card({
  children,
  onClick,
  active = false,
  hoverable = true,
  padding = '16px',
  style = {},
  className = '',
}) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: active ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
        border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: active ? 'var(--shadow-glow)' : 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!hoverable || !onClick) return;
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        if (!hoverable || !onClick) return;
        e.currentTarget.style.background = active ? 'var(--bg-elevated)' : 'var(--bg-secondary)';
        e.currentTarget.style.borderColor = active ? 'var(--accent-border)' : 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </div>
  );
}

export default Card;
