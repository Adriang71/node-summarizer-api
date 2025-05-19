export interface IOpenAIService {
  generateSummary(content: string): Promise<string>;
  analyzeSentiment(content: string): Promise<string>;
} 