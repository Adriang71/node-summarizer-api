import Parser from 'rss-parser';
import { OpenRouterService } from './openrouter.service';
import { AppDataSource } from '../index';
import { UserSource } from '../entities/UserSource';
import { ScheduledSummary } from '../entities/ScheduledSummary';
import { User } from '../entities/User';

const parser = new Parser();
const aiService = new OpenRouterService();

export class NewsService {
  private getUserSourceRepository = () => AppDataSource.getRepository(UserSource);
  private getScheduledSummaryRepository = () => AppDataSource.getRepository(ScheduledSummary);
  private getUserRepository = () => AppDataSource.getRepository(User);

  async addUserSource(userId: string, sourceUrl: string, sourceName: string, sourceType: string): Promise<UserSource> {
    const userRepository = this.getUserRepository();
    const userSourceRepository = this.getUserSourceRepository();
    
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const source = userSourceRepository.create({
      user,
      source_url: sourceUrl,
      source_name: sourceName,
      source_type: sourceType,
      enabled: true
    });

    return await userSourceRepository.save(source);
  }

  async getUserSources(userId: string): Promise<UserSource[]> {
    const userSourceRepository = this.getUserSourceRepository();
    return await userSourceRepository.find({
      where: { user: { id: userId } }
    });
  }

  async deleteUserSource(userId: string, sourceId: string): Promise<void> {
    const userSourceRepository = this.getUserSourceRepository();
    const source = await userSourceRepository.findOne({
      where: { id: sourceId, user: { id: userId } }
    });

    if (!source) {
      throw new Error('Source not found');
    }

    await userSourceRepository.remove(source);
  }

  async fetchAndProcessNews(): Promise<void> {
    const userRepository = this.getUserRepository();
    const users = await userRepository.find({
      relations: ['sources']
    });

    for (const user of users) {
      for (const source of user.sources) {
        if (!source.enabled) continue;

        try {
          const articles = await this.fetchArticles(source);
          for (const article of articles.slice(0, 3)) {
            await this.processArticle(user, article, source.source_name);
          }
        } catch (error) {
          console.error(`Error processing source ${source.source_url}:`, error);
        }
      }
    }
  }

  private async fetchArticles(source: UserSource): Promise<any[]> {
    if (source.source_type === 'rss') {
      const feed = await parser.parseURL(source.source_url);
      return feed.items.map(item => ({
        title: item.title,
        url: item.link,
        content: item.content || item.contentSnippet
      }));
    }
    // TODO: Implement web scraping for non-RSS sources
    return [];
  }

  private async processArticle(user: User, article: any, sourceName: string): Promise<void> {
    try {
      const [summary, sentiment] = await Promise.all([
        aiService.generateSummary(article.content),
        aiService.analyzeSentiment(article.content)
      ]);

      const scheduledSummary = this.getScheduledSummaryRepository().create({
        user,
        article_title: article.title,
        article_url: article.url,
        summary,
        sentiment,
        source_name: sourceName
      });

      await this.getScheduledSummaryRepository().save(scheduledSummary);
    } catch (error) {
      console.error(`Error processing article ${article.url}:`, error);
    }
  }

  async getUserSummaries(userId: string): Promise<ScheduledSummary[]> {
    const scheduledSummaryRepository = this.getScheduledSummaryRepository();
    return await scheduledSummaryRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' }
    });
  }
} 