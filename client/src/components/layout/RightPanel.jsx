import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useUIStore from '../../stores/useUIStore';
import AIChatPanel from '../ai/AIChatPanel';

function RightPanel() {
  const { rightPanelOpen, setRightPanelOpen } = useUIStore();

  return (
    <AnimatePresence>
      {rightPanelOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{
            height: '100%',
            borderLeft: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {/* Close button — absolute top-right */}
          <button
            id="right-panel-close"
            onClick={() => setRightPanelOpen(false)}
            title="Close AI panel"
            style={{
              position: 'absolute', top: '10px', right: '12px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '26px', height: '26px',
              borderRadius: 'var(--radius-sm)', transition: 'all 0.12s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={14} />
          </button>

          {/* Dashboard the full AIChatPanel */}
          <AIChatPanel />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default RightPanel;
