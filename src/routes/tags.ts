import { Router } from 'express';
import { createTag, getTags, deleteTag } from '../controllers/tag.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createTag);
router.get('/', getTags);
router.delete('/:id', authMiddleware, deleteTag);

export default router; 