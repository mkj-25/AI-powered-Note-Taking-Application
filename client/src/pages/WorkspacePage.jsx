import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileText, Search, Tag, Star, MoreHorizontal,
  Trash2, Pin, PinOff, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useNoteStore from '../stores/useNoteStore';
import useWorkspaceStore from '../stores/useWorkspaceStore';
import NoteEditor from '../components/editor/NoteEditor';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Loader';

function WorkspacePage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspaceStore();
  const {
    notes, activeNote, setActiveNote,
    createNote, fetchNotes, deleteNote, isLoading,
  } = useNoteStore();

  const [search, setSearch] = useState('');
  const [hoveredNote, setHoveredNote] = useState(null);

  // Sync active workspace from URL
  useEffect(() => {
    if (!workspaceId) return;
    const ws = workspaces.find((w) => w._id === workspaceId);
    if (ws && activeWorkspace?._id !== workspaceId) {
      setActiveWorkspace(ws);
    }
  }, [workspaceId, workspaces]);

  useEffect(() => {
    if (workspaceId) fetchNotes(workspaceId);
  }, [workspaceId]);

  const handleNewNote = async () => {
    const wsId = workspaceId || activeWorkspace?._id;
    if (!wsId) return toast.error('No workspace selected');
    const note = await createNote(wsId);
    if (note) {
      setActiveNote(note);
      toast.success('Note created');
    }
  };

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation();
    await deleteNote(noteId);
    toast.success('Note deleted');
  };

  const filteredNotes = notes.filter((n) =>
    !search || n.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: pinned first, then by updatedAt
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const wsName = activeWorkspace?.name || workspaces.find(w => w._id === workspaceId)?.name || 'Workspace';

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* ── Note list panel ─────────────────────────────────────────────────── */}
      <div style={{
        width: '240px', flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-secondary)',
      }}>
        {/* Header */}
        <div style={{
          padding: '10px 12px 8px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
              background: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 700, color: 'var(--accent)',
            }}>
              {wsName[0]?.toUpperCase()}
            </div>
            <span style={{
              fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {wsName}
            </span>
          </div>
          <button
            id="ws-new-note"
            onClick={handleNewNote}
            title="New note"
            style={iconBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: '5px 9px',
          }}>
            <Search size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Note list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} style={{ marginBottom: '6px' }}>
                <SkeletonCard />
              </div>
            ))
          ) : sortedNotes.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center' }}>
              <FileText size={22} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {search ? 'No notes match your search' : 'No notes yet'}
              </p>
              {!search && (
                <Button onClick={handleNewNote} icon={Plus} size="sm">New note</Button>
              )}
            </div>
          ) : (
            sortedNotes.map((note) => {
              const isActive = activeNote?._id === note._id;
              return (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  onMouseEnter={() => setHoveredNote(note._id)}
                  onMouseLeave={() => setHoveredNote(null)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    borderRadius: 'var(--radius-md)', marginBottom: '2px',
                    background: isActive ? 'var(--accent-light)' : 'transparent',
                    transition: 'background 0.12s',
                  }}
                >
                  <button
                    onClick={() => setActiveNote(note)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'flex-start', gap: '8px',
                      padding: '8px 10px', background: 'transparent', border: 'none',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      minWidth: 0,
                    }}
                    onMouseEnter={(e) => !isActive && (e.currentTarget.parentElement.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => !isActive && (e.currentTarget.parentElement.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: '13px', marginTop: '1px', flexShrink: 0 }}>
                      {note.icon || '📄'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '12px', fontWeight: 500,
                        color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {note.title || 'Untitled'}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>

                  {/* Note actions (on hover) */}
                  <AnimatePresence>
                    {hoveredNote === note._id && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', gap: '2px', paddingRight: '6px', flexShrink: 0 }}
                      >
                        {note.isFavorite && (
                          <Star size={10} style={{ color: 'var(--orange)', margin: '6px 2px' }} />
                        )}
                        <button
                          onClick={(e) => handleDeleteNote(e, note._id)}
                          title="Delete note"
                          style={{ ...iconBtnStyle, width: '20px', height: '20px' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-light)'; e.currentTarget.style.color = 'var(--red)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer note count */}
        {notes.length > 0 && (
          <div style={{
            padding: '6px 12px', borderTop: '1px solid var(--border-subtle)',
            fontSize: '10px', color: 'var(--text-muted)',
          }}>
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ── Editor ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <NoteEditor />
      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '24px', height: '24px', borderRadius: 'var(--radius-sm)',
  transition: 'all 0.12s', padding: 0, flexShrink: 0,
};

export default WorkspacePage;
