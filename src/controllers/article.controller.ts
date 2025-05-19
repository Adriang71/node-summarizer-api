import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Article } from '../entities/Article';
import { Tag } from '../entities/Tag';
import { SavedArticle } from '../entities/SavedArticle';
import { OpenAIService } from '../services/openai.service';
import { IOpenAIService } from '../interfaces/openai.interface';

const articleRepository = AppDataSource.getRepository(Article);
const tagRepository = AppDataSource.getRepository(Tag);
const savedArticleRepository = AppDataSource.getRepository(SavedArticle);
const openAIService: IOpenAIService = new OpenAIService();

/**
 * @swagger
 * /api/articles/analyze:
 *   post:
 *     summary: Analyze article content and generate summary
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL of the article to analyze
 *               content:
 *                 type: string
 *                 description: Content of the article to analyze
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags to associate with the article
 *     responses:
 *       201:
 *         description: Article analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       500:
 *         description: Server error
 */
export const analyzeArticle = async (req: Request, res: Response) => {
  try {
    const { url, content, tags } = req.body;

    // TODO: Implement URL content extraction
    const articleContent = content || '';

    // Generate summary and analyze sentiment using OpenAI service
    const [summary, sentiment] = await Promise.all([
      openAIService.generateSummary(articleContent),
      openAIService.analyzeSentiment(articleContent)
    ]);

    // Create article
    const article = articleRepository.create({
      title: url || 'Untitled',
      content: articleContent,
      summary,
      sentiment,
    });

    await articleRepository.save(article);

    // Add tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        let tag = await tagRepository.findOne({ where: { name: tagName } });
        if (!tag) {
          tag = tagRepository.create({ name: tagName });
          await tagRepository.save(tag);
        }
        article.tags = [...(article.tags || []), tag];
      }
      await articleRepository.save(article);
    }

    res.status(201).json(article);
  } catch (error) {
    console.error('Error analyzing article:', error);
    res.status(500).json({ message: 'Error analyzing article' });
  }
};

/**
 * @swagger
 * /api/articles/{articleId}/summary:
 *   get:
 *     summary: Get article summary
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the article
 *     responses:
 *       200:
 *         description: Article summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
export const getArticleSummary = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;

    const article = await articleRepository.findOne({ where: { id: articleId } });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ summary: article.summary });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving article summary' });
  }
};

/**
 * @swagger
 * /api/articles/{articleId}/save:
 *   post:
 *     summary: Save article for user
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the article to save
 *     responses:
 *       201:
 *         description: Article saved successfully
 *       400:
 *         description: Article already saved
 *       500:
 *         description: Server error
 */
export const saveArticle = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const userId = (req as any).user.id;

    const existingSaved = await savedArticleRepository.findOne({
      where: {
        user: { id: userId },
        article: { id: articleId }
      }
    });

    if (existingSaved) {
      return res.status(400).json({ message: 'Article is already saved' });
    }

    const savedArticle = savedArticleRepository.create({
      user: { id: userId },
      article: { id: articleId }
    });

    await savedArticleRepository.save(savedArticle);
    res.status(201).json({ message: 'Article saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving article' });
  }
};

/**
 * @swagger
 * /api/articles/saved:
 *   get:
 *     summary: Get user's saved articles
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *       500:
 *         description: Server error
 */
export const getSavedArticles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const savedArticles = await savedArticleRepository.find({
      where: { user: { id: userId } },
      relations: ['article', 'article.tags']
    });

    res.json(savedArticles.map(sa => sa.article));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving saved articles' });
  }
}; 