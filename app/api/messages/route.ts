// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AiService } from '../lib/ai.service';

// Global AI service instance
const aiService = new AiService();

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Process messages with AI
    const response = await aiService.generateResponse(messages);

    return NextResponse.json({
      content: response.text,
      finishReason: response.finishReason,
      usage: response.usage,
    });
    
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}