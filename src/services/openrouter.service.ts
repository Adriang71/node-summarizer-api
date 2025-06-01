import { IOpenAIService } from '../interfaces/openai.interface';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

console.log('OPENROUTER_API_KEY available:', !!OPENROUTER_API_KEY);
console.log('OPENROUTER_API_KEY length:', OPENROUTER_API_KEY?.length);

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterService implements IOpenAIService {
  private async makeRequest(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Node Summarizer API'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3-8b-instruct',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.statusText}. Details: ${errorText}`);
      }

      const data = await response.json() as OpenRouterResponse;
      return data.choices[0].message.content || '';
    } catch (error) {
      console.error('Error making request to OpenRouter:', error);
      throw error;
    }
  }

  async generateSummary(content: string): Promise<string> {
    try {
      return await this.makeRequest(
        content,
        'You are an expert in summarizing texts. Create a concise summary of the following text. Focus on the main points and key information.'
      );
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async analyzeSentiment(content: string): Promise<string> {
    try {
      const response = await this.makeRequest(
        content,
        'Analyze the sentiment of the following text and return exactly one word: positive, neutral, or negative. Be precise and concise.'
      );
      
      const sentiment = response.toLowerCase().trim();
      if (!['positive', 'neutral', 'negative'].includes(sentiment)) {
        return 'neutral';
      }
      
      return sentiment;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 'neutral';
    }
  }
} 