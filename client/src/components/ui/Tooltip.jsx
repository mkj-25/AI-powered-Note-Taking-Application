import React, { useState, useRef, useEffect } from 'react';

function Tooltip({ children, content, placement = 'top', delay = 300 }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    if (!visible || !targetRef.current || !tooltipRef.current) return;
    const tr = targetRef.current.getBoundingClientRect();
    const tt = tooltipRef.current;
    const gap = 6;

    let top = 0, left = 0;
    if (placement === 'top') {
      top = tr.top - tt.offsetHeight - gap + window.scrollY;
      left = tr.left + tr.width / 2 - tt.offsetWidth / 2 + window.scrollX;
    } else if (placement === 'bottom') {
      top = tr.bottom + gap + window.scrollY;
      left = tr.left + tr.width / 2 - tt.offsetWidth / 2 + window.scrollX;
    } else if (placement === 'left') {
      top = tr.top + tr.height / 2 - tt.offsetHeight / 2 + window.scrollY;
      left = tr.left - tt.offsetWidth - gap + window.scrollX;
    } else if (placement === 'right') {
      top = tr.top + tr.height / 2 - tt.offsetHeight / 2 + window.scrollY;
      left = tr.right + gap + window.scrollX;
    }
    setPos({ top, left });
  }, [visible, placement]);

  return (
    <>
      <span
        ref={targetRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </span>
      {visible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            fontSize: '11px',
            fontWeight: 500,
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

export default Tooltip;
