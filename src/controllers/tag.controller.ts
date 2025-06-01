import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Tag } from '../entities/Tag';

const getTagRepository = () => AppDataSource.getRepository(Tag);

/**
 * @swagger
 * /api/tags/popular:
 *   get:
 *     summary: Get popular tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of popular tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       500:
 *         description: Server error
 */
export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const tagRepository = getTagRepository();
    const tags = await tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.articles', 'article')
      .select('tag')
      .addSelect('COUNT(article.id)', 'articleCount')
      .groupBy('tag.id')
      .orderBy('articleCount', 'DESC')
      .limit(10)
      .getMany();

    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving popular tags' });
  }
};

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the tag
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Tag already exists
 *       500:
 *         description: Server error
 */
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const tagRepository = getTagRepository();

    const existingTag = await tagRepository.findOne({ where: { name } });
    if (existingTag) {
      return res.status(400).json({ message: 'Tag already exists' });
    }

    const tag = tagRepository.create({ name });
    await tagRepository.save(tag);

    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tag' });
  }
};

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of all tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       500:
 *         description: Server error
 */
export const getTags = async (req: Request, res: Response) => {
  try {
    const tagRepository = getTagRepository();
    const tags = await tagRepository.find();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tags' });
  }
};

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the tag to delete
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tagRepository = getTagRepository();

    const tag = await tagRepository.findOne({ where: { id } });
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    await tagRepository.remove(tag);

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tag' });
  }
}; 