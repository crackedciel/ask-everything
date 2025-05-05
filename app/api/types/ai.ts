// types/ai.ts
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }
  
  export interface AIResponse {
    content: string;
    finishReason: string | null;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  }
  
  export interface MessageRequest {
    messages: Message[];
  }