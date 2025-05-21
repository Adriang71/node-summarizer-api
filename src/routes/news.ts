import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { addSource, getSources, deleteSource, getSummaries } from '../controllers/news.controller';

const router = Router();

// Protected routes
router.use(authMiddleware);

// Source management
router.post('/sources', addSource);
router.get('/sources', getSources);
router.delete('/sources/:id', deleteSource);

// Summaries
router.get('/summaries', getSummaries);

export default router; 