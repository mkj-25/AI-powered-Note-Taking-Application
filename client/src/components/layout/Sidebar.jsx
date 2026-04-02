import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Star, Lock, Share2, Sparkles,
  Plus, ChevronDown, ChevronRight, FileText, MoreHorizontal,
  Trash2, FolderPlus, LogOut,
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import useWorkspaceStore from '../../stores/useWorkspaceStore';
import useNoteStore from '../../stores/useNoteStore';
import useUIStore from '../../stores/useUIStore';
import { SIDEBAR_SECTIONS } from '../../utils/constants';
import Tooltip from '../ui/Tooltip';

const iconMap = { LayoutDashboard, Star, Lock, Share2, Sparkles };

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace } = useWorkspaceStore();
  const { notes, activeNote, setActiveNote, createNote, deleteNote } = useNoteStore();
  const { sidebarOpen, activeSection, setActiveSection, openModal } = useUIStore();
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [hoveredNote, setHoveredNote] = useState(null);

  const handleNewNote = async () => {
    if (!activeWorkspace) return;
    await createNote(activeWorkspace._id);
  };

  // Navigate to dashboard and set the section tab
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    navigate('/dashboard');
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{
            height: '100%',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <div style={{
              width: '26px', height: '26px',
              background: 'linear-gradient(135deg, var(--accent), #A78BFA)',
              borderRadius: '7px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#fff',
            }}>N</div>
            <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px' }} className="gradient-text">
              Notra
            </span>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
            {/* Main nav sections */}
            <div style={{ marginBottom: '16px' }}>
              {SIDEBAR_SECTIONS.map((section) => {
                const Icon = iconMap[section.icon] || LayoutDashboard;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    id={`sidebar-${section.id}`}
                    onClick={() => handleSectionClick(section.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      width: '100%',
                      padding: '7px 10px',
                      background: isActive ? 'var(--accent-light)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: isActive ? 500 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon size={14} />
                    {section.label}
                  </button>
                );
              })}
            </div>

            {/* Workspaces */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '4px 10px', marginBottom: '4px',
              }}>
                <button
                  onClick={() => setWorkspaceExpanded((p) => !p)}
                  style={{ ...labelBtnStyle }}
                >
                  {workspaceExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <span>Workspaces</span>
                </button>
                <Tooltip content="New workspace" placement="right">
                  <button
                    id="sidebar-new-workspace"
                    onClick={() => openModal('createWorkspace')}
                    style={{ ...iconBtnStyle }}
                  >
                    <FolderPlus size={13} />
                  </button>
                </Tooltip>
              </div>

              <AnimatePresence>
                {workspaceExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {workspaces.map((ws) => (
                      <button
                        key={ws._id}
                        onClick={() => { setActiveWorkspace(ws); navigate(`/workspace/${ws._id}`); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '9px',
                          width: '100%', padding: '6px 10px',
                          background: activeWorkspace?._id === ws._id ? 'var(--bg-hover)' : 'transparent',
                          border: 'none', borderRadius: 'var(--radius-md)',
                          color: 'var(--text-secondary)', fontSize: '13px',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = activeWorkspace?._id === ws._id ? 'var(--bg-hover)' : 'transparent')}
                      >
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '4px',
                          background: 'var(--accent-light)', color: 'var(--accent)',
                          fontSize: '9px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {ws.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ws.name}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notes in active workspace */}
            {activeWorkspace && (
              <div style={{ marginTop: '16px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 10px', marginBottom: '4px',
                }}>
                  <span style={{ ...labelStyle }}>Notes</span>
                  <Tooltip content="New note  ⌘N" placement="right">
                    <button
                      id="sidebar-new-note"
                      onClick={handleNewNote}
                      style={{ ...iconBtnStyle }}
                    >
                      <Plus size={13} />
                    </button>
                  </Tooltip>
                </div>

                {notes.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '6px 10px' }}>
                    No notes yet
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note._id}
                      onMouseEnter={() => setHoveredNote(note._id)}
                      onMouseLeave={() => setHoveredNote(null)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        background: activeNote?._id === note._id ? 'var(--accent-light)' : 'transparent',
                        borderRadius: 'var(--radius-md)',
                        transition: 'background 0.12s',
                      }}
                    >
                      <button
                        onClick={() => setActiveNote(note)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '6px 10px', background: 'transparent', border: 'none',
                          color: activeNote?._id === note._id ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                          overflow: 'hidden', fontFamily: 'inherit',
                        }}
                      >
                        <FileText size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {note.title || 'Untitled'}
                        </span>
                        {note.isFavorite && (
                          <Star size={9} style={{ color: 'var(--orange)', flexShrink: 0, marginLeft: 'auto' }} />
                        )}
                      </button>
                      {hoveredNote === note._id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNote(note._id); }}
                          style={{ ...iconBtnStyle, marginRight: '4px', color: 'var(--red)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 8px',
            borderTop: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <button
              id="sidebar-logout"
              onClick={logout}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                width: '100%', padding: '8px 10px',
                background: 'transparent', border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-light)'; e.currentTarget.style.color = 'var(--red)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <LogOut size={14} />
              <span>Sign out</span>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

const labelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const labelBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '5px',
  background: 'transparent', border: 'none',
  color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  cursor: 'pointer', fontFamily: 'inherit',
};

const iconBtnStyle = {
  background: 'transparent', border: 'none',
  color: 'var(--text-muted)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '22px', height: '22px',
  borderRadius: 'var(--radius-sm)', transition: 'all 0.12s',
  padding: 0,
};

export default Sidebar;
