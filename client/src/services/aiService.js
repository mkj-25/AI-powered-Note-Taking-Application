import api from './api';

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chat = async (message, history = [], noteId = null) => {
  const res = await api.post('/ai/chat', { message, history, noteId });
  return res.data; // { reply, response } — both present for compatibility
};

// ── Summarize ─────────────────────────────────────────────────────────────────
export const summarize = async (noteId) => {
  const res = await api.post('/ai/summarize', { noteId });
  return res.data; // { summary }
};

// ── Improve writing ───────────────────────────────────────────────────────────
export const improve = async (text) => {
  const res = await api.post('/ai/improve', { text });
  return res.data; // { result }
};

// ── Generate study questions ──────────────────────────────────────────────────
export const generateQuestions = async (noteId) => {
  const res = await api.post('/ai/generate-questions', { noteId });
  return res.data; // { questions }
};

// ── AI action (summarize/explain/bullet_points etc.) ─────────────────────────
export const aiAction = async (action, content) => {
  const res = await api.post('/ai/action', { action, content });
  return res.data; // { result }
};

// ── Voice → text (Whisper) ────────────────────────────────────────────────────
export const transcribeVoice = async (formData) => {
  const res = await api.post('/ai/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { text }
};

// ── OCR (image → text) ────────────────────────────────────────────────────────
export const imageOCR = async (formData) => {
  const res = await api.post('/ai/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { text, rawText }
};

// ── Semantic search ───────────────────────────────────────────────────────────
export const semanticSearch = async (query) => {
  const res = await api.post('/ai/search', { query });
  return res.data; // { results }
};

// ── Chat history ──────────────────────────────────────────────────────────────
export const getChatHistory = async () => {
  const res = await api.get('/ai/chats');
  return res.data; // { chats }
};

export const getChatById = async (id) => {
  const res = await api.get(`/ai/chats/${id}`);
  return res.data; // { chat }
};
