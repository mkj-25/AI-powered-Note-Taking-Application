import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Dropdown({ trigger, items = [], placement = 'bottom-left', width = '180px' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const placementStyle = placement === 'bottom-right'
    ? { top: 'calc(100% + 6px)', right: 0 }
    : { top: 'calc(100% + 6px)', left: 0 };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <div onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              ...placementStyle,
              width,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 500,
              padding: '6px',
              overflow: 'hidden',
            }}
          >
            {items.map((item, i) => {
              if (item.divider) {
                return (
                  <div key={i} style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                );
              }
              return (
                <button
                  key={i}
                  disabled={item.disabled}
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: item.danger ? 'var(--red)' : 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    opacity: item.disabled ? 0.4 : 1,
                    textAlign: 'left',
                    transition: 'background 0.1s, color 0.1s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                      e.currentTarget.style.color = item.danger ? 'var(--red)' : 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = item.danger ? 'var(--red)' : 'var(--text-secondary)';
                  }}
                >
                  {item.icon && <item.icon size={14} />}
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.shortcut && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dropdown;
