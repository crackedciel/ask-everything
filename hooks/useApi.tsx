'use client';

import { AIResponse, Message } from '@/app/api/types/ai';
import { useState, useCallback } from 'react';

interface UseApiState {
  isLoading: boolean;
  error: string | null;
  response: AIResponse | null;
}

interface UseApiReturn extends UseApiState {
  sendMessage: (messages: Message[]) => Promise<void>;
  reset: () => void;
}

export const useApi = (): UseApiReturn => {
  const [state, setState] = useState<UseApiState>({
    isLoading: false,
    error: null,
    response: null,
  });

  const sendMessage = useCallback(async (messages: Message[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data: AIResponse = await response.json();
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        response: data,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        response: null,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      response: null,
    });
  }, []);

  return {
    ...state,
    sendMessage,
    reset,
  };
};