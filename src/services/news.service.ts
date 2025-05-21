import Parser from 'rss-parser';
import { OpenAIService } from './openai.service';
import { AppDataSource } from '../index';
import { UserSource } from '../entities/UserSource';
import { ScheduledSummary } from '../entities/ScheduledSummary';
import { User } from '../entities/User';

const parser = new Parser();
const openAIService = new OpenAIService();

export class NewsService {
  private userSourceRepository = AppDataSource.getRepository(UserSource);
  private scheduledSummaryRepository = AppDataSource.getRepository(ScheduledSummary);
  private userRepository = AppDataSource.getRepository(User);

  async addUserSource(userId: string, sourceUrl: string, sourceName: string, sourceType: string): Promise<UserSource> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const source = this.userSourceRepository.create({
      user,
      source_url: sourceUrl,
      source_name: sourceName,
      source_type: sourceType,
      enabled: true
    });

    return await this.userSourceRepository.save(source);
  }

  async getUserSources(userId: string): Promise<UserSource[]> {
    return await this.userSourceRepository.find({
      where: { user: { id: userId } }
    });
  }

  async deleteUserSource(userId: string, sourceId: string): Promise<void> {
    const source = await this.userSourceRepository.findOne({
      where: { id: sourceId, user: { id: userId } }
    });

    if (!source) {
      throw new Error('Source not found');
    }

    await this.userSourceRepository.remove(source);
  }

  async fetchAndProcessNews(): Promise<void> {
    const users = await this.userRepository.find({
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
        openAIService.generateSummary(article.content),
        openAIService.analyzeSentiment(article.content)
      ]);

      const scheduledSummary = this.scheduledSummaryRepository.create({
        user,
        article_title: article.title,
        article_url: article.url,
        summary,
        sentiment,
        source_name: sourceName
      });

      await this.scheduledSummaryRepository.save(scheduledSummary);
    } catch (error) {
      console.error(`Error processing article ${article.url}:`, error);
    }
  }

  async getUserSummaries(userId: string): Promise<ScheduledSummary[]> {
    return await this.scheduledSummaryRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' }
    });
  }
} 