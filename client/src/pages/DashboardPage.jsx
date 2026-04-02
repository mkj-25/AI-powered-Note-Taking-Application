import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Star, Clock, Plus, TrendingUp,
  Sparkles, ArrowRight, FolderOpen, Zap, BookOpen,
  Lock, Share2, Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useNoteStore from '../stores/useNoteStore';
import useWorkspaceStore from '../stores/useWorkspaceStore';
import useAuthStore from '../stores/useAuthStore';
import useUIStore from '../stores/useUIStore';
import { SkeletonCard } from '../components/ui/Loader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

// ── Helpers ─────────────────────────────────────────────────────────────────
function relativeTime(date) {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── NoteCard ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onClick }) {
  const preview = (note.blocks || note.content || [])
    .find((b) => b.content?.trim())
    ?.content?.slice(0, 90) || '';

  return (
    <Card hoverable onClick={onClick} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>{note.icon || '📄'}</span>
          <span style={{
            fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>
            {note.title || 'Untitled'}
          </span>
          {note.isFavorite && <Star size={11} style={{ color: 'var(--orange)', flexShrink: 0 }} />}
          {note.isShared && <Share2 size={11} style={{ color: 'var(--blue)', flexShrink: 0 }} />}
        </div>
        {preview && (
          <p style={{
            fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {preview}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {relativeTime(note.updatedAt)}
          </span>
          {note.tags?.length > 0 && (
            <Badge color="purple" size="xs">{note.tags[0]}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Recent', icon: Clock },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'private',   label: 'Private',   icon: Lock },
  { id: 'shared',    label: 'Shared',    icon: Share2 },
  { id: 'ai',        label: 'AI Notes',  icon: Sparkles },
];

// ── Streak Badge ─────────────────────────────────────────────────────────────
function StreakBadge({ streak, longest }) {
  if (!streak) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))',
        border: '1px solid rgba(245,158,11,0.35)',
        borderRadius: 'var(--radius-full)',
        padding: '5px 14px',
        fontSize: '13px', fontWeight: 600,
        color: 'var(--orange)',
      }}
    >
      <Flame size={14} style={{ color: '#F97316' }} />
      <span>{streak} Day Streak</span>
      {longest > streak && (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
          &nbsp;(best: {longest})
        </span>
      )}
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    notes, isLoading: notesLoading,
    createNote, setActiveNote, fetchAllNotes,
  } = useNoteStore();
  const { workspaces, activeWorkspace, createWorkspace, setActiveWorkspace, isLoading: wsLoading } = useWorkspaceStore();
  const { toggleRightPanel, activeSection, setActiveSection } = useUIStore();

  const [wsModal, setWsModal] = useState(false);
  const [wsForm, setWsForm] = useState({ name: '', description: '' });
  const [wsCreating, setWsCreating] = useState(false);

  // Fetch all notes when dashboard loads (cross-workspace for tab filtering)
  useEffect(() => {
    fetchAllNotes();
  }, []);

  // ── Tab-based note filtering ─────────────────────────────────────────────
  const getFilteredNotes = () => {
    switch (activeSection) {
      case 'favorites':
        return notes.filter((n) => n.isFavorite);
      case 'private':
        // Personal workspace notes (not shared)
        return notes.filter((n) => !n.isShared);
      case 'shared':
        return notes.filter((n) => n.isShared);
      case 'ai':
        // AI notes: notes with 'ai' tag OR generated via AI (check tag)
        return notes.filter((n) =>
          n.tags?.some((t) => ['ai', 'ai-generated', 'AI'].includes(t)) || n.isAI
        );
      case 'dashboard':
      default:
        return [...notes]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 6);
    }
  };

  const displayedNotes = getFilteredNotes();
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);
  const favorites = notes.filter((n) => n.isFavorite).slice(0, 5);

  const handleOpenNote = (note) => {
    const ws = workspaces.find((w) => w._id === (note.workspaceId?._id || note.workspaceId));
    if (ws) setActiveWorkspace(ws);
    setActiveNote(note);
    navigate(`/workspace/${note.workspaceId?._id || note.workspaceId}`);
  };

  const handleCreateNote = async () => {
    if (!activeWorkspace) return toast.error('Select a workspace first');
    const note = await createNote(activeWorkspace._id);
    if (note) {
      toast.success('Note created');
      navigate(`/workspace/${activeWorkspace._id}`);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!wsForm.name.trim()) return;
    setWsCreating(true);
    try {
      const ws = await createWorkspace(wsForm.name, wsForm.description);
      toast.success('Workspace created!');
      setWsModal(false);
      setWsForm({ name: '', description: '' });
      if (ws) navigate(`/workspace/${ws._id}`);
    } catch {
      toast.error('Failed to create workspace');
    } finally {
      setWsCreating(false);
    }
  };

  const stats = [
    { icon: FileText, label: 'Total Notes', value: notes.length, color: 'var(--accent)', bg: 'var(--accent-light)' },
    { icon: Star, label: 'Favorites', value: favorites.length, color: 'var(--orange)', bg: 'var(--orange-light)' },
    { icon: FolderOpen, label: 'Workspaces', value: workspaces.length, color: 'var(--green)', bg: 'var(--green-light)' },
    { icon: TrendingUp, label: 'This Week', value: notes.filter(n => Date.now() - new Date(n.createdAt) < 7 * 86400000).length, color: 'var(--blue)', bg: 'var(--blue-light)' },
  ];

  const streak = user?.currentStreak || 0;
  const longest = user?.longestStreak || 0;

  // Tab-specific empty state messages
  const emptyMessages = {
    dashboard: { emoji: '📝', title: 'No notes yet', sub: 'Create your first note to get started' },
    favorites: { emoji: '⭐', title: 'No favorites yet', sub: 'Star a note to see it here' },
    private: { emoji: '🔒', title: 'No private notes', sub: 'Notes not marked as shared appear here' },
    shared: { emoji: '🤝', title: 'No shared notes', sub: 'Share a note with collaborators to see it here' },
    ai: { emoji: '🤖', title: 'No AI notes yet', sub: 'Tag a note with "ai" or generate one with the AI assistant' },
  };
  const empty = emptyMessages[activeSection] || emptyMessages.dashboard;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {timeGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <StreakBadge streak={streak} longest={longest} />
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
          Your second brain is ready — {notes.length} note{notes.length !== 1 ? 's' : ''} across {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: '14px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
              background: s.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <s.icon size={17} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}
      >
        <Button id="dash-new-note" onClick={handleCreateNote} icon={Plus}>New Note</Button>
        <Button id="dash-new-ws" variant="outline" onClick={() => setWsModal(true)} icon={FolderOpen}>New Workspace</Button>
        <Button variant="ghost" icon={Sparkles} onClick={toggleRightPanel}>Ask AI</Button>
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0' }}
      >
        {TABS.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveSection(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px',
                background: 'transparent', border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
                marginBottom: '-1px',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* Notes grid */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.18 }}>
          {notesLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayedNotes.length === 0 ? (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-lg)', padding: '40px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{empty.emoji}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                {empty.title}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                {empty.sub}
              </p>
              {activeSection === 'dashboard' && (
                <Button onClick={handleCreateNote} icon={Plus}>Create Note</Button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {displayedNotes.map((note) => (
                <NoteCard key={note._id} note={note} onClick={() => handleOpenNote(note)} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Favorites sidebar widget */}
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Star size={13} style={{ color: 'var(--orange)' }} /> Favorites
            </h2>
            {favorites.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '2px 0' }}>
                Star a note to pin it here.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {favorites.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleOpenNote(n)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      transition: 'border-color 0.15s, background 0.15s', width: '100%',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                  >
                    <span style={{ fontSize: '14px' }}>{n.icon || '📄'}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.title || 'Untitled'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Workspaces */}
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <FolderOpen size={13} style={{ color: 'var(--green)' }} /> Workspaces
            </h2>
            {wsLoading ? (
              <SkeletonCard />
            ) : workspaces.length === 0 ? (
              <Button variant="outline" onClick={() => setWsModal(true)} icon={Plus} style={{ width: '100%' }}>
                Create workspace
              </Button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {workspaces.slice(0, 5).map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => { setActiveWorkspace(ws); navigate(`/workspace/${ws._id}`); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', fontFamily: 'inherit',
                      background: activeWorkspace?._id === ws._id ? 'var(--accent-light)' : 'var(--bg-secondary)',
                      border: `1px solid ${activeWorkspace?._id === ws._id ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)', cursor: 'pointer', width: '100%', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                      background: 'var(--accent-light)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 700, color: 'var(--accent)',
                    }}>
                      {ws.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {ws.name}
                    </span>
                    <Badge color="purple" size="xs">{ws.type}</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Tip card */}
          <div style={{
            background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-lg)', padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={13} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>AI Tip</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              Use <kbd style={{ background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: '4px', fontSize: '11px', border: '1px solid var(--border-default)', fontFamily: 'inherit' }}>
                /
              </kbd> in the editor to insert headings, code blocks, and more.
            </p>
            <Button variant="ghost" size="sm" icon={Sparkles} onClick={toggleRightPanel} style={{ fontSize: '12px', padding: '4px 10px' }}>
              Open AI Chat
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={wsModal}
        onClose={() => setWsModal(false)}
        title="New Workspace"
        footer={
          <>
            <Button variant="ghost" onClick={() => setWsModal(false)}>Cancel</Button>
            <Button loading={wsCreating} onClick={handleCreateWorkspace} icon={Plus}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Name"
            placeholder="e.g. Research, Personal, Work"
            value={wsForm.name}
            onChange={(e) => setWsForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Description (optional)"
            placeholder="What is this workspace for?"
            value={wsForm.description}
            onChange={(e) => setWsForm((f) => ({ ...f, description: e.target.value }))}
          />
        </form>
      </Modal>
    </div>
  );
}

export default DashboardPage;
