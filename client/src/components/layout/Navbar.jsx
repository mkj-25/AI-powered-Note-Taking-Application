import React from 'react';
import { Search, Bell, Settings, Sparkles, Keyboard, PanelRight } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import useUIStore from '../../stores/useUIStore';
import useNoteStore from '../../stores/useNoteStore';
import Tooltip from '../ui/Tooltip';

function Navbar() {
  const { user } = useAuthStore();
  const { toggleRightPanel, rightPanelOpen, setSearchOpen, setCommandPaletteOpen } = useUIStore();
  const { activeNote, isSaving } = useNoteStore();

  return (
    <header style={{
      height: '48px',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px',
      background: 'var(--bg-primary)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Breadcrumb / Note title */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {activeNote ? (
          <>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {activeNote.workspaceId?.name || 'My Workspace'}
            </span>
            <span style={{ color: 'var(--border-strong)', fontSize: '12px' }}>/</span>
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '300px',
            }}>
              {activeNote.title || 'Untitled'}
            </span>
            {isSaving && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                Saving…
              </span>
            )}
          </>
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Notra</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Search */}
        <Tooltip content="Quick search  ⌘K" placement="bottom">
          <button
            id="navbar-search"
            onClick={() => setSearchOpen(true)}
            style={navBtnStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            <Search size={15} />
          </button>
        </Tooltip>

        {/* AI Panel */}
        <Tooltip content="AI Assistant" placement="bottom">
          <button
            id="navbar-ai"
            onClick={toggleRightPanel}
            style={{
              ...navBtnStyle,
              background: rightPanelOpen ? 'var(--accent-light)' : 'transparent',
              color: rightPanelOpen ? 'var(--accent)' : 'var(--text-muted)',
            }}
            onMouseEnter={(e) => !rightPanelOpen && (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => !rightPanelOpen && (e.currentTarget.style.background = 'transparent')}
          >
            <Sparkles size={15} />
          </button>
        </Tooltip>

        {/* Right panel toggle */}
        <Tooltip content="Toggle panel" placement="bottom">
          <button
            id="navbar-panel"
            onClick={toggleRightPanel}
            style={navBtnStyle}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            <PanelRight size={15} />
          </button>
        </Tooltip>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Avatar */}
        <div
          id="navbar-avatar"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--accent-light)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--accent)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}

const navBtnStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '30px',
  height: '30px',
  borderRadius: 'var(--radius-sm)',
  transition: 'all 0.15s ease',
  flexShrink: 0,
};

const hoverIn = (e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; };
const hoverOut = (e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; };

export default Navbar;
