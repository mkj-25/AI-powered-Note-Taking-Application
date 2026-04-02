import { getAIResponse, getAIAction } from '../services/openaiService.js';
import { generateEmbedding, semanticSearch } from '../services/embeddingService.js';
import { extractTextFromImage } from '../services/ocrService.js';
import { transcribeAudio } from '../services/voiceService.js';
import ChatHistory from '../models/ChatHistory.js';
import Note from '../models/Note.js';
import logger from '../utils/logger.js';

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chat = async (req, res, next) => {
  try {
    const { message, history = [], noteId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    let noteContext = '';
    if (noteId) {
      const note = await Note.findById(noteId);
      if (note) {
        const textContent = (note.content || [])
          .map((b) => b.content || '')
          .filter(Boolean)
          .join('\n')
          .substring(0, 1500);
        noteContext = `\n\nCurrent note — "${note.title}":\n${textContent}`;
      }
    }

    // Optional semantic search for additional context
    let ragContext = '';
    try {
      const results = await semanticSearch(message, req.user._id, 3);
      if (results.length > 0) {
        ragContext = '\n\nRelated notes:\n' +
          results
            .map((n) => `• ${n.title}: ${(n.content || []).map((b) => b.content).join(' ').substring(0, 120)}`)
            .join('\n');
      }
    } catch (_) { /* semantic search is optional */ }

    const systemPrompt =
      `You are Notra AI, an intelligent assistant built into a note-taking app. ` +
      `Be concise, clear, and helpful. Use markdown formatting when it improves readability.` +
      noteContext +
      ragContext;

    // Build messages array for multi-turn conversation (includes note + RAG context)
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // keep last 10 turns
      { role: 'user', content: message },
    ];

    // Pass the fully-enriched messages array — NOT raw history which lacks context
    const reply = await getAIResponse(message, systemPrompt, history.slice(-10));

    // Persist to DB asynchronously (don't block response)
    ChatHistory.create({
      userId: req.user._id,
      title: message.substring(0, 60),
      noteContext: noteId || null,
      messages: [
        ...history.slice(-10),
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ],
    }).catch((e) => logger.warn('ChatHistory save failed:', e.message));

    res.json({ reply, response: reply }); // both fields for compatibility
  } catch (error) {
    next(error);
  }
};

// ─── AI Action (summarize, improve, etc.) ────────────────────────────────────
export const aiAction = async (req, res, next) => {
  try {
    const { action, content, noteId } = req.body;

    let text = content;
    if (!text && noteId) {
      const note = await Note.findOne({ _id: noteId, userId: req.user._id });
      if (note) {
        text = (note.content || []).map((b) => b.content || '').join('\n');
      }
    }

    if (!action || !text?.trim()) {
      return res.status(400).json({ message: 'Action and content (or noteId) are required.' });
    }

    const result = await getAIAction(action, text);
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

// ─── Voice transcription ──────────────────────────────────────────────────────
export const voiceToText = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required.' });
    }
    const text = await transcribeAudio(req.file);
    res.json({ text });
  } catch (error) {
    next(error);
  }
};

// ─── OCR (image → text) ───────────────────────────────────────────────────────
export const imageToText = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const rawText = await extractTextFromImage(req.file);

    let cleanedText = rawText;
    try {
      cleanedText = await getAIAction('clean_ocr', rawText);
    } catch (_) { /* fallback to raw */ }

    res.json({ text: cleanedText, rawText });
  } catch (error) {
    next(error);
  }
};

// ─── Summarize shortcut ───────────────────────────────────────────────────────
export const summarize = async (req, res, next) => {
  try {
    const { noteId } = req.body;
    const note = await Note.findOne({ _id: noteId, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    const content = (note.content || []).map((b) => b.content || '').join('\n');
    const result = await getAIAction('summarize', content);
    res.json({ summary: result });
  } catch (error) {
    next(error);
  }
};

// ─── Improve writing shortcut ─────────────────────────────────────────────────
export const improve = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Text is required.' });
    const result = await getAIAction('fix_grammar', text);
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

// ─── Generate study questions ─────────────────────────────────────────────────
export const generateQuestions = async (req, res, next) => {
  try {
    const { noteId } = req.body;
    const note = await Note.findOne({ _id: noteId, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    const content = (note.content || []).map((b) => b.content || '').join('\n');
    const result = await getAIAction('generate_questions', content);
    res.json({ questions: result });
  } catch (error) {
    next(error);
  }
};

// ─── Semantic search ──────────────────────────────────────────────────────────
export const search = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ message: 'Query is required.' });

    let results = [];
    try {
      results = await semanticSearch(query, req.user._id, 10);
    } catch (_) {
      // Fallback: basic text search
      results = await Note.find({
        userId: req.user._id,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { 'content.content': { $regex: query, $options: 'i' } },
        ],
      }).limit(10).select('title content updatedAt');
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

// ─── Chat history ─────────────────────────────────────────────────────────────
export const getChatHistory = async (req, res, next) => {
  try {
    const chats = await ChatHistory.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('title createdAt updatedAt');
    res.json({ chats });
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (req, res, next) => {
  try {
    const chatDoc = await ChatHistory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chatDoc) return res.status(404).json({ message: 'Chat not found.' });
    res.json({ chat: chatDoc });
  } catch (error) {
    next(error);
  }
};
