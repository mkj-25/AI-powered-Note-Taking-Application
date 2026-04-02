import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SLASH_COMMANDS } from '../../utils/constants';

function SlashCommand({ visible, position, onSelect, onClose, query = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);

  const filtered = SLASH_COMMANDS.filter(
    (cmd) =>
      query === '' ||
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // Reset index when query changes
  useEffect(() => { setActiveIndex(0); }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIndex]) onSelect(filtered[activeIndex].type);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible, activeIndex, filtered, onSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex];
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {visible && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            width: '260px',
            maxHeight: '320px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflowY: 'auto',
            padding: '6px',
          }}
        >
          <p style={{
            fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            padding: '4px 8px 6px',
          }}>
            BLOCKS
          </p>
          <div ref={listRef}>
            {filtered.map((cmd, i) => (
              <button
                key={cmd.type}
                onClick={() => onSelect(cmd.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  background: i === activeIndex ? 'var(--accent-light)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: i === activeIndex ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.1s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span style={{
                  width: '30px', height: '30px',
                  background: i === activeIndex ? 'var(--accent-light)' : 'var(--bg-hover)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 600, flexShrink: 0,
                  color: i === activeIndex ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {cmd.icon}
                </span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{cmd.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cmd.description}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SlashCommand;
