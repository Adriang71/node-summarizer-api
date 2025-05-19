import { Router } from 'express';
import { analyzeArticle, saveArticle, getSavedArticles } from '../controllers/article.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/analyze', authMiddleware, analyzeArticle);
router.post('/:articleId/save', authMiddleware, saveArticle);
router.get('/saved', authMiddleware, getSavedArticles);

export default router; 