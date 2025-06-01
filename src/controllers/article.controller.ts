import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Article } from '../entities/Article';
import { Tag } from '../entities/Tag';
import { SavedArticle } from '../entities/SavedArticle';
import { OpenRouterService } from '../services/openrouter.service';
import { IOpenAIService } from '../interfaces/openai.interface';
import axios from 'axios';
import * as cheerio from 'cheerio';

const getArticleRepository = () => AppDataSource.getRepository(Article);
const getTagRepository = () => AppDataSource.getRepository(Tag);
const getSavedArticleRepository = () => AppDataSource.getRepository(SavedArticle);
const aiService: IOpenAIService = new OpenRouterService();

async function extractContentFromUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Usuń niepotrzebne elementy
    $('script, style, nav, footer, header, aside, .ads, .comments, .social-share').remove();
    
    // Pobierz tytuł
    const title = $('title').text().trim();
    
    // Pobierz główną treść
    const mainContent = $('article, .article, .post, .content, main, .main')
      .text()
      .trim()
      .replace(/\s+/g, ' ');
    
    // Jeśli nie znaleziono głównej treści, pobierz cały tekst z body
    const content = mainContent || $('body').text().trim().replace(/\s+/g, ' ');
    
    return `Title: ${title}\n\nContent: ${content}`;
  } catch (error) {
    console.error('Error extracting content from URL:', error);
    throw new Error('Failed to extract content from URL');
  }
}

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
 *                 description: Content of the article to analyze (optional if URL is provided)
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
    const articleRepository = getArticleRepository();
    const tagRepository = getTagRepository();

    let articleContent = content;
    let articleTitle = 'Untitled';

    if (url) {
      try {
        const extractedContent = await extractContentFromUrl(url);
        const [title, ...contentParts] = extractedContent.split('\n\n');
        articleTitle = title.replace('Title: ', '');
        articleContent = contentParts.join('\n\n').replace('Content: ', '');
      } catch (error) {
        console.error('Error extracting content from URL:', error);
        return res.status(400).json({ message: 'Failed to extract content from URL' });
      }
    }

    if (!articleContent) {
      return res.status(400).json({ message: 'No content provided and could not extract from URL' });
    }

    // Generate summary and analyze sentiment using AI service
    const [summary, sentiment] = await Promise.all([
      aiService.generateSummary(articleContent),
      aiService.analyzeSentiment(articleContent)
    ]);

    // Create article
    const article = articleRepository.create({
      title: articleTitle,
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
    const articleRepository = getArticleRepository();

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
    const savedArticleRepository = getSavedArticleRepository();

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
    const savedArticleRepository = getSavedArticleRepository();

    const savedArticles = await savedArticleRepository.find({
      where: { user: { id: userId } },
      relations: ['article', 'article.tags']
    });

    res.json(savedArticles.map(saved => saved.article));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving saved articles' });
  }
}; 