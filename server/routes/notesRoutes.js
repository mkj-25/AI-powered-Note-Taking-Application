import { Router } from 'express';
import { getNotes, getNote, createNote, updateNote, deleteNote, togglePin, toggleFavorite } from '../controllers/notesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/pin', togglePin);
router.post('/:id/favorite', toggleFavorite);

export default router;
