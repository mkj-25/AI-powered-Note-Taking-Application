import React, { useState, useEffect, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { Star, StarOff, MoreHorizontal, Sparkles, Tag, Download } from 'lucide-react';
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
  // track last note id so we can reset
  const lastNoteIdRef = useRef(null);

  // Sync from active note (reset when note changes)
  useEffect(() => {
    if (!activeNote) return;
    if (lastNoteIdRef.current === activeNote._id) return; // same note, don't reset
    lastNoteIdRef.current = activeNote._id;
    setTitle(activeNote.title || '');
    setBlocks(
      activeNote.blocks?.length > 0
        ? activeNote.blocks
        : [makeBlock()]
    );
    // Reset slash command state
    setSlashVisible(false);
  }, [activeNote?._id]);

  // Real-time collaboration
  useEffect(() => {
    if (!activeNote?._id) return;
    joinRoom(activeNote._id);
    const unsub = onNoteChange(({ changes: remoteBlocks }) => {
      if (Array.isArray(remoteBlocks)) setBlocks(remoteBlocks);
    });
    return () => {
      leaveRoom(activeNote._id);
      unsub?.();
    };
  }, [activeNote?._id]);

  // Auto-save — debounced
  const debouncedBlocks = useDebounce(blocks, 1200);
  const debouncedTitle = useDebounce(title, 800);

  const saveRef = useRef({ title, blocks });
  useEffect(() => {
    saveRef.current = { title, blocks };
  }, [title, blocks]);

  useEffect(() => {
    if (!activeNote?._id) return;
    updateNote(activeNote._id, { title: debouncedTitle, blocks: debouncedBlocks });
    sendChange(activeNote._id, debouncedBlocks);
  }, [debouncedTitle, debouncedBlocks]);

  // ---- Block operations ----
  const updateBlock = useCallback((index, updated) => {
    setBlocks((prev) => {
      const next = [...prev];

      // Detect slash command
      const content = updated.content || '';
      const slashIdx = content.lastIndexOf('/');
      if (slashIdx !== -1) {
        const query = content.slice(slashIdx + 1);
        const rect = window.getSelection()?.getRangeAt(0)?.getBoundingClientRect?.();
        if (rect) {
          setSlashPos({ x: rect.left, y: rect.bottom + 4 });
          setSlashQuery(query);
          setSlashBlockIndex(index);
          setSlashVisible(true);
        }
      } else {
        setSlashVisible(false);
      }

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

  // addBlockBelow: if current block is bullet, new block is also bullet
  const addBlockBelow = useCallback((index, inheritType = true) => {
    const currentType = blocks[index]?.type;
    // List-like blocks propagate their type; others create plain text
    const propagatedTypes = [NOTE_TYPES.BULLET, NOTE_TYPES.TODO];
    const newType = (inheritType && propagatedTypes.includes(currentType))
      ? currentType
      : NOTE_TYPES.TEXT;
    const newBlock = makeBlock(newType);
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, newBlock);
      return next;
    });
    setNewBlockIndex(index + 1);
  }, [blocks]);

  // After adding block, clear auto-focus sentinel
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
      if (slashBlockIndex !== null) {
        const block = next[slashBlockIndex];
        // Remove the /query from content
        const slashIdx = (block.content || '').lastIndexOf('/');
        next[slashBlockIndex] = { ...block, content: block.content.slice(0, slashIdx), type };
      }
      return next;
    });
  };

  const handleBlockKeyDown = useCallback((e, index, el) => {
    // Enter → new block below (same type for bullets/todos)
    if (e.key === 'Enter' && !e.shiftKey && blocks[index]?.type !== NOTE_TYPES.CODE) {
      e.preventDefault();
      addBlockBelow(index, true);
      setSlashVisible(false);
    }
    // Backspace on empty bullet → convert back to text, not delete
    if (e.key === 'Backspace' && (el?.innerText || '').trim() === '') {
      if (blocks[index]?.type === NOTE_TYPES.BULLET || blocks[index]?.type === NOTE_TYPES.TODO) {
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
  }, [blocks, addBlockBelow, deleteBlock]);

  // ---- Title ----
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editorRef.current?.querySelector('[contenteditable]')?.focus();
    }
  };

  const handleToggleFavorite = async () => {
    if (!activeNote) return;
    const newVal = !activeNote.isFavorite;
    // Optimistic update
    updateActiveNoteLocally({ isFavorite: newVal });
    // Persist
    await toggleFavorite(activeNote._id);
    toast.success(newVal ? 'Added to favorites' : 'Removed from favorites');
  };

  const moreMenuItems = [
    { label: 'Add tag', icon: Tag, onClick: () => {} },
    { label: 'Export as Markdown', icon: Download, onClick: exportMarkdown },
    { divider: true },
    { label: 'Delete note', icon: () => <span style={{ fontSize: '13px' }}>🗑</span>, danger: true, onClick: () => {} },
  ];

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
