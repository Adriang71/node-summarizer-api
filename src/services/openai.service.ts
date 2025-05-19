import { OpenAI } from 'openai';
import { IOpenAIService } from '../interfaces/openai.interface';

export class OpenAIService implements IOpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateSummary(content: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in summarizing texts. Create a concise summary of the following text."
          },
          {
            role: "user",
            content: content
          }
        ],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async analyzeSentiment(content: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment of the following text and return one of the values: positive, neutral, negative."
          },
          {
            role: "user",
            content: content
          }
        ],
      });

      return response.choices[0].message.content || 'neutral';
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }
} 