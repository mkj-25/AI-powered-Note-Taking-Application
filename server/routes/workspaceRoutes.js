import { Router } from 'express';
import { getWorkspaces, createWorkspace, getWorkspace, updateWorkspace, addMember } from '../controllers/workspaceController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspace);
router.put('/:id', updateWorkspace);
router.post('/:id/members', addMember);

export default router;
