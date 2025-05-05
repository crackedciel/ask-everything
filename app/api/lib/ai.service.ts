// lib/services/ai-service.ts
import { createGroq } from '@ai-sdk/groq';
import { generateText, Message } from 'ai';

// Constants from your code
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1500;

interface GenerationConfig {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export class AiService {
  private groqClient;

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    this.groqClient = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateResponse(messages: Message[]) {
    const requestId = this.generateRequestId();
    console.log(`AI Request [${requestId}] - Processing ${messages.length} messages`);
    console.log(`AI Request [${requestId}] - Messages:`, messages);

    try {
      const config: GenerationConfig = {
        model: GROQ_MODEL,
        messages: messages,
        temperature: DEFAULT_TEMPERATURE,
        maxTokens: DEFAULT_MAX_TOKENS,
        frequencyPenalty: 0,
        presencePenalty: 0,
      };

      const startTime = Date.now();
      const result = await generateText({
        model: this.groqClient.languageModel(config.model),
        messages: config.messages,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        frequencyPenalty: config.frequencyPenalty,
        presencePenalty: config.presencePenalty,
      });

      const duration = Date.now() - startTime;
      console.log(`AI Response [${requestId}] completed in ${duration}ms`);

      return {
        text: result.text,
        finishReason: result.finishReason,
        usage: result.usage,
      };
    } catch (error) {
      console.error(`AI Error [${requestId}]:`, error);
      throw error;
    }
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(7);
  }
}