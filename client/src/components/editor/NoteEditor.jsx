import React, { useState, useEffect, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { Star, StarOff, MoreHorizontal, Tag, Download } from 'lucide-react';
import EditorBlock from './EditorBlock';
import SlashCommand from './SlashCommand';
import useNoteStore from '../../stores/useNoteStore';
import useSocket from '../../hooks/useSocket';
import useDebounce from '../../hooks/useDebounce';
import { NOTE_TYPES } from '../../utils/constants';
import Dropdown from '../ui/Dropdown';
import Button from '../ui/Button';

const makeBlock = (type = NOTE_TYPES.TEXT, content = '') => ({
  id: nanoid(),
  type,
  content,
  checked: false,
});

function NoteEditor() {
  const { activeNote, updateNote, updateActiveNoteLocally, toggleFavorite } = useNoteStore();
  const { joinRoom, leaveRoom, sendChange, onNoteChange } = useSocket();

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([makeBlock()]);
  const [newBlockIndex, setNewBlockIndex] = useState(null);

  // Slash command state
  const [slashVisible, setSlashVisible] = useState(false);
  const [slashPos, setSlashPos] = useState({ x: 0, y: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [slashBlockIndex, setSlashBlockIndex] = useState(null);

  const titleRef = useRef(null);
  const editorRef = useRef(null);
  const lastNoteIdRef = useRef(null);
  // Flag: true when we just sent a socket change — don't apply our own echo
  const isLocalChangeRef = useRef(false);

  // ── Sync from active note (reset when note changes) ──────────────────────
  useEffect(() => {
    if (!activeNote) return;
    if (lastNoteIdRef.current === activeNote._id) return; // same note
    lastNoteIdRef.current = activeNote._id;
    setTitle(activeNote.title || '');
    const initialBlocks = activeNote.blocks?.length > 0
      ? activeNote.blocks
      : [makeBlock()];
    setBlocks(initialBlocks);
    setSlashVisible(false);
    // Focus title on new note open
    setTimeout(() => titleRef.current?.focus(), 60);
  }, [activeNote?._id]);

  // ── Real-time collaboration ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeNote?._id) return;
    joinRoom(activeNote._id);

    const unsub = onNoteChange(({ changes: remoteBlocks }) => {
      // Don't apply our own echoed change
      if (isLocalChangeRef.current) return;
      if (Array.isArray(remoteBlocks)) {
        setBlocks(remoteBlocks);
      }
    });

    return () => {
      leaveRoom(activeNote._id);
      unsub?.();
    };
  }, [activeNote?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save (debounced) ─────────────────────────────────────────────────
  const debouncedBlocks = useDebounce(blocks, 1200);
  const debouncedTitle = useDebounce(title, 800);

  useEffect(() => {
    if (!activeNote?._id) return;
    updateNote(activeNote._id, { title: debouncedTitle, blocks: debouncedBlocks });

    // Emit to collaborators
    isLocalChangeRef.current = true;
    sendChange(activeNote._id, debouncedBlocks);
    // Reset flag after a tick so we don't block incoming remote changes
    setTimeout(() => { isLocalChangeRef.current = false; }, 300);
  }, [debouncedTitle, debouncedBlocks]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Block operations ──────────────────────────────────────────────────────

  const updateBlock = useCallback((index, updated) => {
    setBlocks((prev) => {
      const content = updated.content || '';

      // Detect slash command trigger
      const slashIdx = content.lastIndexOf('/');
      if (slashIdx !== -1 && slashIdx === content.length - 1 || (slashIdx !== -1 && !content.slice(slashIdx + 1).includes(' '))) {
        try {
          const sel = window.getSelection();
          if (sel?.rangeCount > 0) {
            const rect = sel.getRangeAt(0).getBoundingClientRect();
            if (rect.width !== 0 || rect.height !== 0) {
              setSlashPos({ x: rect.left, y: rect.bottom + 4 });
              setSlashQuery(content.slice(slashIdx + 1));
              setSlashBlockIndex(index);
              setSlashVisible(true);
            }
          }
        } catch (_) {}
      } else if (!content.includes('/')) {
        setSlashVisible(false);
      }

      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const deleteBlock = useCallback((index) => {
    setBlocks((prev) => {
      if (prev.length === 1) return [makeBlock()];
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // addBlockBelow: propagate type for lists (bullet, todo)
  const addBlockBelow = useCallback((index) => {
    setBlocks((prev) => {
      const currentType = prev[index]?.type;
      const propagatedTypes = [NOTE_TYPES.BULLET, NOTE_TYPES.TODO];
      const newType = propagatedTypes.includes(currentType) ? currentType : NOTE_TYPES.TEXT;
      const newBlock = makeBlock(newType);
      const next = [...prev];
      next.splice(index + 1, 0, newBlock);
      setNewBlockIndex(index + 1);
      return next;
    });
  }, []);

  // Clear auto-focus sentinel
  useEffect(() => {
    if (newBlockIndex !== null) {
      const timer = setTimeout(() => setNewBlockIndex(null), 100);
      return () => clearTimeout(timer);
    }
  }, [newBlockIndex]);

  const handleSlashSelect = (type) => {
    setSlashVisible(false);
    setBlocks((prev) => {
      const next = [...prev];
      if (slashBlockIndex !== null && next[slashBlockIndex]) {
        const block = next[slashBlockIndex];
        const slashIdx = (block.content || '').lastIndexOf('/');
        next[slashBlockIndex] = {
          ...block,
          content: slashIdx >= 0 ? block.content.slice(0, slashIdx) : block.content,
          type,
        };
      }
      return next;
    });
  };

  const handleBlockKeyDown = useCallback((e, index) => {
    // Enter → new block below (list types propagate)
    if (e.key === 'Enter' && !e.shiftKey && blocks[index]?.type !== NOTE_TYPES.CODE) {
      e.preventDefault();
      addBlockBelow(index);
      setSlashVisible(false);
      return;
    }

    // Backspace on empty bullet/todo → convert to text
    if (e.key === 'Backspace') {
      const el = e.currentTarget;
      const text = (el?.innerText || '').trim();
      if (text === '') {
        const t = blocks[index]?.type;
        if (t === NOTE_TYPES.BULLET || t === NOTE_TYPES.TODO) {
          e.preventDefault();
          setBlocks((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], type: NOTE_TYPES.TEXT };
            return next;
          });
        } else if (blocks.length > 1) {
          e.preventDefault();
          deleteBlock(index);
        }
      }
    }
  }, [blocks, addBlockBelow, deleteBlock]);

  // ── Title ─────────────────────────────────────────────────────────────────
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus first editor block
      editorRef.current?.querySelector('[contenteditable]')?.focus();
    }
  };

  // ── Favorite ──────────────────────────────────────────────────────────────
  const handleToggleFavorite = async () => {
    if (!activeNote) return;
    const newVal = !activeNote.isFavorite;
    // Optimistic update first for instant UI feedback
    updateActiveNoteLocally({ isFavorite: newVal });
    try {
      await toggleFavorite(activeNote._id);
      toast.success(newVal ? '⭐ Added to favorites' : 'Removed from favorites');
    } catch {
      // Rollback on error
      updateActiveNoteLocally({ isFavorite: !newVal });
      toast.error('Failed to update favorite');
    }
  };

  // ── Export Markdown ───────────────────────────────────────────────────────
  function exportMarkdown() {
    const md = blocks.map((b) => {
      if (b.type === 'h1') return `# ${b.content}`;
      if (b.type === 'h2') return `## ${b.content}`;
      if (b.type === 'h3') return `### ${b.content}`;
      if (b.type === 'bullet') return `- ${b.content}`;
      if (b.type === 'todo') return `- [${b.checked ? 'x' : ' '}] ${b.content}`;
      if (b.type === 'code') return `\`\`\`\n${b.content}\n\`\`\``;
      if (b.type === 'quote') return `> ${b.content}`;
      if (b.type === 'divider') return '---';
      return b.content;
    }).join('\n\n');
    const blob = new Blob([`# ${title}\n\n${md}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'note'}.md`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as Markdown');
  }

  const moreMenuItems = [
    { label: 'Add tag', icon: Tag, onClick: () => {} },
    { label: 'Export as Markdown', icon: Download, onClick: exportMarkdown },
    { divider: true },
    { label: 'Delete note', icon: () => <span style={{ fontSize: '13px' }}>🗑</span>, danger: true, onClick: () => {} },
  ];

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!activeNote) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', gap: '12px',
      }}>
        <div style={{ fontSize: '40px' }}>📝</div>
        <p style={{ fontSize: '15px', fontWeight: 500 }}>Select a note to start editing</p>
        <p style={{ fontSize: '13px' }}>or create a new one from the sidebar</p>
      </div>
    );
  }

  // ── Editor render ─────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '8px 48px 0',
        gap: '6px',
        flexShrink: 0,
      }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          icon={activeNote.isFavorite ? Star : StarOff}
          style={{ color: activeNote.isFavorite ? 'var(--orange)' : 'var(--text-muted)', width: '30px', height: '30px' }}
        />
        <Dropdown
          trigger={
            <Button variant="ghost" size="icon" icon={MoreHorizontal}
              style={{ width: '30px', height: '30px', color: 'var(--text-muted)' }}
            />
          }
          items={moreMenuItems}
          placement="bottom-right"
        />
      </div>

      {/* Scrollable editor area */}
      <div
        ref={editorRef}
        style={{
          flex: 1, overflowY: 'auto',
          padding: '32px 48px 80px',
          maxWidth: '760px', width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Title */}
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none',
            fontSize: '2.2em', fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: '24px', lineHeight: 1.2,
            fontFamily: 'inherit',
          }}
        />

        {/* Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '52px' }}>
          {blocks.map((block, i) => (
            <EditorBlock
              key={block.id}
              block={block}
              index={i}
              onChange={updateBlock}
              onDelete={deleteBlock}
              onAddBelow={addBlockBelow}
              onKeyDown={handleBlockKeyDown}
              autoFocus={i === newBlockIndex}
            />
          ))}
        </div>

        {/* Empty hint */}
        {blocks.length === 1 && !blocks[0].content && (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', paddingLeft: '52px', marginTop: '4px' }}>
            Type <kbd style={{ fontFamily: 'inherit', background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--border-default)' }}>/</kbd> for commands, or just start writing…
          </p>
        )}
      </div>

      {/* Slash command popup */}
      <SlashCommand
        visible={slashVisible}
        position={slashPos}
        query={slashQuery}
        onSelect={handleSlashSelect}
        onClose={() => setSlashVisible(false)}
      />
    </div>
  );
}

export default NoteEditor;
