import { Router } from 'express';
import multer from 'multer';
import {
  chat, aiAction, voiceToText, imageToText,
  summarize, improve, generateQuestions, search,
  getChatHistory, getChatById,
} from '../controllers/aiController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// In-memory storage for uploaded files (buffers passed to services)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav',
      'audio/ogg', 'audio/x-m4a', 'audio/flac', 'audio/webm;codecs=opus',
      'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/tiff',
    ];
    // Accept audio/* and image/* broadly
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
});

// All AI routes require authentication
router.use(authMiddleware);

// ── Chat & Actions ────────────────────────────────────────────────────────────
router.post('/chat', chat);
router.post('/action', aiAction);

// ── Shortcut endpoints (used by frontend aiService) ───────────────────────────
router.post('/summarize', summarize);
router.post('/improve', improve);
router.post('/generate-questions', generateQuestions);
router.post('/search', search);

// ── File upload endpoints ─────────────────────────────────────────────────────
router.post('/transcribe', upload.single('audio'), voiceToText);
router.post('/voice', upload.single('audio'), voiceToText);     // alias
router.post('/ocr', upload.single('image'), imageToText);

// ── Chat history ──────────────────────────────────────────────────────────────
router.get('/chats', getChatHistory);
router.get('/chats/:id', getChatById);

export default router;
