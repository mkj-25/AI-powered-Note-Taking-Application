import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Trash2, RotateCcw, Copy, ChevronDown,
  Mic, StopCircle, Loader2, Bot, User, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as aiService from '../../services/aiService';
import useNoteStore from '../../stores/useNoteStore';
import useAuthStore from '../../stores/useAuthStore';
import VoiceRecorder from './VoiceRecorder';

const QUICK_ACTIONS = [
  { id: 'summarize', label: '📝 Summarize note', prompt: 'Summarize my current note in bullet points.' },
  { id: 'key-points', label: '🎯 Key takeaways', prompt: 'What are the 5 most important takeaways from this note?' },
  { id: 'improve', label: '✨ Improve writing', prompt: 'Improve the clarity and flow of my note. Keep the ideas intact.' },
  { id: 'questions', label: '🧠 Study questions', prompt: 'Generate 5 study questions to test understanding of this note.' },
  { id: 'explain', label: '💡 Explain concepts', prompt: 'Explain the key concepts in this note in simple terms.' },
  { id: 'action-items', label: '✅ Action items', prompt: 'Extract all actionable tasks from this note.' },
];

function MessageBubble({ msg, onCopy }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: '4px',
      }}
    >
      {/* Avatar row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}>
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%',
          background: isUser ? 'var(--accent)' : 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isUser
            ? <User size={10} color="#fff" />
            : <Sparkles size={10} color="var(--accent)" />
          }
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {isUser ? 'You' : 'Notra AI'}
        </span>
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '88%',
        padding: '10px 13px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser
          ? 'linear-gradient(135deg, var(--accent), #A78BFA)'
          : 'var(--bg-elevated)',
        border: isUser ? 'none' : '1px solid var(--border-default)',
        color: isUser ? '#fff' : 'var(--text-primary)',
        fontSize: '13px',
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        position: 'relative',
        group: true,
      }}>
        {msg.content}

        {/* Copy button for AI messages */}
        {!isUser && (
          <button
            onClick={() => onCopy(msg.content)}
            title="Copy"
            style={{
              position: 'absolute', top: '6px', right: '6px',
              background: 'var(--bg-hover)', border: 'none',
              borderRadius: '4px', padding: '3px 5px',
              cursor: 'pointer', color: 'var(--text-muted)',
              opacity: 0, transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
          >
            <Copy size={10} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Sparkles size={10} color="var(--accent)" />
      </div>
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: '14px 14px 14px 4px',
        display: 'flex', gap: '4px', alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--accent)',
            animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function AIChatPanel() {
  const { activeNote } = useNoteStore();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm **Notra AI** — your intelligent note companion 🧠\n\nI can summarize notes, extract key insights, generate study questions, improve your writing, and much more.\n\nSelect a quick action below or ask me anything!",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVoice, setShowVoice] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  // Keep a ref to the latest state to avoid stale closures in sendMessage
  const messagesRef = useRef(messages);
  const loadingRef = useRef(loading);
  const activeNoteRef = useRef(activeNote);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { activeNoteRef.current = activeNote; }, [activeNote]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // sendMessage — stable callback that always reads latest state via refs
  const sendMessage = useCallback(async (overrideText) => {
    const trimmed = (overrideText !== undefined ? overrideText : textareaRef.current?.value || '').trim();
    if (!trimmed || loadingRef.current) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.value = '';
    setLoading(true);

    try {
      // Exclude the initial welcome message (index 0 assistant msg) from history sent to AI
      const currentMessages = messagesRef.current;
      const historyStart = currentMessages[0]?.role === 'assistant' && currentMessages.length === 1 ? 1 : 0;
      const history = currentMessages.slice(historyStart).map((m) => ({ role: m.role, content: m.content }));
      const res = await aiService.chat(trimmed, history, activeNoteRef.current?._id);
      const reply = res.reply || res.response || 'No response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const status = err.response?.status;
      let errMsg = '⚠️ Something went wrong. Please try again.';
      if (status === 429) errMsg = '⚠️ Rate limit reached. Please wait a moment and try again.';
      else if (status === 401) errMsg = '⚠️ Authentication error. Please reload the page.';
      else if (status === 500) errMsg = '⚠️ AI service error. The server encountered an issue.';
      else if (!navigator.onLine) errMsg = '⚠️ No internet connection.';
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  }, []); // stable — reads state via refs

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(); // will read value from textareaRef
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared! What would you like to explore next?',
    }]);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleVoiceTranscription = (text) => {
    setShowVoice(false);
    setInput((prev) => prev + (prev ? ' ' : '') + text);
    textareaRef.current?.focus();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: '10px',
        flexShrink: 0,
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '9px',
          background: 'linear-gradient(135deg, var(--accent), #A78BFA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={15} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Notra AI
          </div>
          <div style={{ fontSize: '10px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: 'var(--green)',
              boxShadow: '0 0 6px var(--green)',
            }} />
            Active
          </div>
        </div>
        <button
          id="ai-panel-clear"
          onClick={clearChat}
          title="Clear chat"
          style={iconBtnStyle}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Quick Actions — shown when conversation just started */}
      <AnimatePresence>
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}
          >
            <p style={{
              fontSize: '10px', fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '8px',
            }}>
              Quick actions
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => sendMessage(a.prompt)}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '7px 9px',
                    color: 'var(--text-secondary)',
                    fontSize: '11px',
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'all 0.12s',
                    lineHeight: 1.3,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent-light)';
                    e.currentTarget.style.borderColor = 'var(--accent-border)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note context badge */}
      {activeNote && (
        <div style={{
          margin: '8px 16px 0',
          padding: '5px 10px',
          background: 'var(--accent-light)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '11px', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', gap: '6px',
          flexShrink: 0,
        }}>
          <Zap size={11} />
          Context: <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeNote.title || 'Untitled'}
          </strong>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} onCopy={handleCopy} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Voice recorder */}
      <AnimatePresence>
        {showVoice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: '0 16px 12px', flexShrink: 0 }}
          >
            <VoiceRecorder onTranscription={handleVoiceTranscription} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div style={{
        padding: '10px 16px 14px',
        borderTop: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '8px 10px',
          alignItems: 'flex-end',
          transition: 'border-color 0.15s',
        }}
          onFocusCapture={(e) => e.currentTarget.style.borderColor = 'var(--accent-border)'}
          onBlurCapture={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
        >
          {/* Voice toggle */}
          <button
            id="ai-voice-toggle"
            onClick={() => setShowVoice((v) => !v)}
            title="Voice input"
            style={{
              ...iconBtnStyle,
              color: showVoice ? 'var(--accent)' : 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            <Mic size={14} />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your notes…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '13px', resize: 'none',
              fontFamily: 'inherit', lineHeight: 1.5,
              overflowY: 'auto', minHeight: '20px',
            }}
          />

          <button
            id="ai-chat-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, var(--accent), #A78BFA)'
                : 'var(--bg-elevated)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: input.trim() && !loading ? '#fff' : 'var(--text-muted)',
              width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              flexShrink: 0, transition: 'all 0.15s',
            }}
          >
            {loading
              ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={13} />
            }
          </button>
        </div>

        <p style={{
          fontSize: '10px', color: 'var(--text-muted)',
          textAlign: 'center', marginTop: '6px',
        }}>
          ↵ to send · Shift+↵ for new line
        </p>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  width: '26px', height: '26px',
  borderRadius: 'var(--radius-sm)', transition: 'all 0.12s', padding: 0,
};

export default AIChatPanel;
