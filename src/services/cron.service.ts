import cron from 'node-cron';
import { NewsService } from './news.service';

export class CronService {
  private newsService: NewsService;

  constructor() {
    this.newsService = new NewsService();
    this.initializeCronJobs();
  }

  private initializeCronJobs(): void {
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('Running daily news summary job...');
      try {
        await this.newsService.fetchAndProcessNews();
        console.log('Daily news summary job completed successfully');
      } catch (error) {
        console.error('Error in daily news summary job:', error);
      }
    });
  }
} 