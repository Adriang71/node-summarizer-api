import { Request, Response } from 'express';
import { NewsService } from '../services/news.service';

const newsService = new NewsService();

/**
 * @swagger
 * /api/news/sources:
 *   post:
 *     summary: Add a new news source
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - source_url
 *               - source_name
 *               - source_type
 *             properties:
 *               source_url:
 *                 type: string
 *               source_name:
 *                 type: string
 *               source_type:
 *                 type: string
 *                 enum: [rss, scraping]
 *     responses:
 *       201:
 *         description: Source added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export const addSource = async (req: Request, res: Response) => {
  try {
    const { source_url, source_name, source_type } = req.body;
    const userId = (req as any).user.id;

    const source = await newsService.addUserSource(userId, source_url, source_name, source_type);
    res.status(201).json(source);
  } catch (error) {
    res.status(500).json({ message: 'Error adding source' });
  }
};

/**
 * @swagger
 * /api/news/sources:
 *   get:
 *     summary: Get user's news sources
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of news sources
 *       500:
 *         description: Server error
 */
export const getSources = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const sources = await newsService.getUserSources(userId);
    res.json(sources);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sources' });
  }
};

/**
 * @swagger
 * /api/news/sources/{id}:
 *   delete:
 *     summary: Delete a news source
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Source deleted successfully
 *       404:
 *         description: Source not found
 *       500:
 *         description: Server error
 */
export const deleteSource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await newsService.deleteUserSource(userId, id);
    res.json({ message: 'Source deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Source not found') {
      return res.status(404).json({ message: 'Source not found' });
    }
    res.status(500).json({ message: 'Error deleting source' });
  }
};

/**
 * @swagger
 * /api/news/summaries:
 *   get:
 *     summary: Get user's news summaries
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of news summaries
 *       500:
 *         description: Server error
 */
export const getSummaries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const summaries = await newsService.getUserSummaries(userId);
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving summaries' });
  }
}; 