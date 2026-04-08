import React, { useRef, useEffect, useState } from 'react';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { NOTE_TYPES } from '../../utils/constants';

/**
 * EditorBlock — contentEditable block for the Notra editor.
 *
 * TYPING BUG FIX:
 * We NEVER write back to the DOM during user input. The pattern is:
 *   1. On block identity change (new note / new block): set innerHTML once
 *   2. On external (socket) change when NOT focused: update innerHTML
 *   3. While user types: only READ innerText and push up via onChange
 * This prevents React from resetting cursor position (the "typing backwards" bug).
 */
function EditorBlock({ block, index, onChange, onDelete, onAddBelow, onKeyDown, autoFocus }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const isFocusedRef = useRef(false);
  const lastBlockIdRef = useRef(null);

  // ── Init innerHTML only when block identity changes ───────────────────────
  useEffect(() => {
    if (!ref.current) return;
    if (lastBlockIdRef.current !== block.id) {
      ref.current.innerHTML = block.content || '';
      lastBlockIdRef.current = block.id;
    }
  }, [block.id]);

  // ── Sync content when changed externally (socket) but user isn't typing ──
  useEffect(() => {
    if (!ref.current || isFocusedRef.current) return;
    const cur = ref.current.innerHTML;
    if (cur !== (block.content || '')) {
      ref.current.innerHTML = block.content || '';
    }
  }, [block.content]);

  // ── Auto-focus on new block ───────────────────────────────────────────────
  useEffect(() => {
    if (!autoFocus || !ref.current) return;
    ref.current.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false); // cursor at end
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (_) {}
  }, [autoFocus]);

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleInput = () => {
    // Read from DOM — do NOT write back (causes cursor reset / "typing backwards")
    const text = ref.current?.innerText ?? '';
    onChange(index, { ...block, content: text });
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    // Final sync on blur for consistency
    const text = ref.current?.innerText ?? '';
    onChange(index, { ...block, content: text });
  };

  const handleKeyDown = (e) => {
    // Pass event and index to parent — parent owns block-level logic
    onKeyDown(e, index);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    // Paste as plain text to avoid injecting HTML
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // ── Shared contentEditable props ──────────────────────────────────────────
  const editableProps = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onPaste: handlePaste,
  };

  const blockStyle = getBlockStyle(block.type);

  // ── Todo ──────────────────────────────────────────────────────────────────
  if (block.type === NOTE_TYPES.TODO) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', position: 'relative', padding: '2px 0' }}
      >
        <BlockControls hovered={hovered} onDelete={() => onDelete(index)} onAdd={() => onAddBelow(index)} />
        <input
          type="checkbox"
          checked={block.checked || false}
          onChange={(e) => onChange(index, { ...block, checked: e.target.checked })}
          style={{ marginTop: '4px', accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}
        />
        <div
          ref={ref}
          {...editableProps}
          style={{
            flex: 1, outline: 'none', fontSize: '14px', lineHeight: '1.7',
            color: block.checked ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: block.checked ? 'line-through' : 'none',
            fontFamily: 'inherit', minHeight: '24px',
          }}
        />
      </div>
    );
  }

  // ── Divider ───────────────────────────────────────────────────────────────
  if (block.type === NOTE_TYPES.DIVIDER) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: 'relative', padding: '8px 0' }}
      >
        <BlockControls hovered={hovered} onDelete={() => onDelete(index)} onAdd={() => onAddBelow(index)} />
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-default)' }} />
      </div>
    );
  }

  // ── Callout ───────────────────────────────────────────────────────────────
  if (block.type === NOTE_TYPES.CALLOUT) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-md)', padding: '10px 14px',
          position: 'relative',
        }}
      >
        <BlockControls hovered={hovered} onDelete={() => onDelete(index)} onAdd={() => onAddBelow(index)} />
        <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
        <div
          ref={ref}
          {...editableProps}
          style={{ flex: 1, outline: 'none', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-primary)', fontFamily: 'inherit', minHeight: '24px' }}
        />
      </div>
    );
  }

  // ── Code block ────────────────────────────────────────────────────────────
  if (block.type === NOTE_TYPES.CODE) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', position: 'relative',
        }}
      >
        <BlockControls hovered={hovered} onDelete={() => onDelete(index)} onAdd={() => onAddBelow(index)} />
        <div
          ref={ref}
          {...editableProps}
          style={{
            outline: 'none', padding: '14px 16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px', lineHeight: '1.6',
            color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
            minHeight: '48px',
          }}
        />
      </div>
    );
  }

  // ── Quote ─────────────────────────────────────────────────────────────────
  if (block.type === NOTE_TYPES.QUOTE) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '14px', position: 'relative' }}
      >
        <BlockControls hovered={hovered} onDelete={() => onDelete(index)} onAdd={() => onAddBelow(index)} />
        <div
          ref={ref}
          {...editableProps}
          style={{ outline: 'none', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'inherit', minHeight: '24px' }}
        />
      </div>
    );
  }

  // ── Default: text, h1, h2, h3, bullet ────────────────────────────────────
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', padding: '1px 0', display: 'flex', alignItems: 'flex-start', gap: '8px' }}
    >
      <BlockControls hovered={hovered} onDelete={() => onDelete(index)} onAdd={() => onAddBelow(index)} />
      {block.type === NOTE_TYPES.BULLET && (
        <span style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: '1.5', marginTop: '1px', flexShrink: 0 }}>•</span>
      )}
      <div
        ref={ref}
        {...editableProps}
        data-placeholder={getPlaceholder(block.type)}
        style={{
          flex: 1,
          outline: 'none',
          fontFamily: 'inherit',
          minHeight: '24px',
          ...blockStyle,
        }}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BlockControls({ hovered, onDelete, onAdd }) {
  return (
    <div style={{
      position: 'absolute', left: '-52px', top: '4px',
      display: 'flex', gap: '2px',
      opacity: hovered ? 1 : 0,
      transition: 'opacity 0.15s',
      pointerEvents: hovered ? 'auto' : 'none',
    }}>
      <button
        onClick={onAdd}
        title="Add block"
        style={ctrlBtn}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-active)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Plus size={12} />
      </button>
      <button
        onClick={onDelete}
        title="Delete block"
        style={ctrlBtn}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-light)'; e.currentTarget.style.color = 'var(--red)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

function getBlockStyle(type) {
  switch (type) {
    case NOTE_TYPES.HEADING1:
    case 'h1': return { fontSize: '2em', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.3' };
    case NOTE_TYPES.HEADING2:
    case 'h2': return { fontSize: '1.5em', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4' };
    case NOTE_TYPES.HEADING3:
    case 'h3': return { fontSize: '1.2em', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.5' };
    case NOTE_TYPES.BULLET:
    case 'bullet': return { fontSize: '14px', lineHeight: '1.7', color: 'var(--text-primary)' };
    default: return { fontSize: '14px', lineHeight: '1.7', color: 'var(--text-primary)' };
  }
}

function getPlaceholder(type) {
  switch (type) {
    case NOTE_TYPES.HEADING1:
    case 'h1': return 'Heading 1';
    case NOTE_TYPES.HEADING2:
    case 'h2': return 'Heading 2';
    case NOTE_TYPES.HEADING3:
    case 'h3': return 'Heading 3';
    case NOTE_TYPES.BULLET:
    case 'bullet': return 'List item';
    case NOTE_TYPES.TODO:
    case 'todo': return 'To-do item';
    case NOTE_TYPES.CODE:
    case 'code': return 'Code...';
    case NOTE_TYPES.QUOTE:
    case 'quote': return 'Quote...';
    default: return "Type '/' for commands";
  }
}

const ctrlBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '22px', height: '22px', borderRadius: 'var(--radius-sm)',
  transition: 'all 0.12s', padding: 0,
};

export default EditorBlock;
