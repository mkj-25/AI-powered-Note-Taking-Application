import React from 'react';
import { Loader2 } from 'lucide-react';

function Loader({ size = 20, text, fullScreen = false, style = {} }) {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', ...style }}>
      <Loader2
        size={size}
        style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }}
      />
      {text && (
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{text}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}>
        {content}
      </div>
    );
  }

  return content;
}

export function SkeletonLine({ width = '100%', height = '14px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 'var(--radius-sm)', ...style }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <SkeletonLine width="60%" height="16px" />
      <SkeletonLine width="90%" />
      <SkeletonLine width="75%" />
      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
        <SkeletonLine width="50px" height="20px" style={{ borderRadius: '99px' }} />
        <SkeletonLine width="60px" height="20px" style={{ borderRadius: '99px' }} />
      </div>
    </div>
  );
}

export default Loader;
