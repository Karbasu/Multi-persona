/**
 * AI Client - handles communication with AI providers
 * Supports multiple providers (Anthropic Claude, OpenAI, etc.)
 */

import Anthropic from '@anthropic-ai/sdk';
import { Persona } from '../types.js';

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AIClient {
  private anthropic: Anthropic | null = null;

  constructor() {
    // Initialize Anthropic client if API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  /**
   * Generate a response for a persona
   */
  async generatePersonaResponse(
    persona: Persona,
    question: string,
    context?: string
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(persona, context);
    const userMessage = this.buildUserMessage(question, persona);

    // Use specified model or default
    const model = persona.model || 'claude-sonnet-4-5-20250929';
    const temperature = persona.temperature || 0.7;

    if (!this.anthropic) {
      // Fallback for testing without API key
      return this.generateMockResponse(persona, question);
    }

    try {
      const response = await this.anthropic.messages.create({
        model,
        max_tokens: 2048,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });

      const textContent = response.content.find(c => c.type === 'text');
      const content = textContent && 'text' in textContent ? textContent.text : '';

      return {
        content,
        model: response.model,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      console.error(`Error generating response for ${persona.name}:`, error);
      throw error;
    }
  }

  /**
   * Generate moderator synthesis
   */
  async generateModeratorSynthesis(
    question: string,
    responses: Array<{ persona: Persona; response: string }>
  ): Promise<AIResponse> {
    const systemPrompt = this.buildModeratorSystemPrompt();
    const userMessage = this.buildModeratorUserMessage(question, responses);

    if (!this.anthropic) {
      return this.generateMockModeratorResponse(question, responses);
    }

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 3072,
        temperature: 0.6,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });

      const textContent = response.content.find(c => c.type === 'text');
      const content = textContent && 'text' in textContent ? textContent.text : '';

      return {
        content,
        model: response.model,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('Error generating moderator synthesis:', error);
      throw error;
    }
  }

  /**
   * Build system prompt for persona
   */
  private buildSystemPrompt(persona: Persona, context?: string): string {
    let prompt = persona.system_prompt;

    if (persona.speaking_style) {
      prompt += `\n\nSpeaking style: ${persona.speaking_style}`;
    }

    prompt += `\n\nYou are participating in a multi-persona debate council. Provide your unique perspective on the question.`;
    prompt += `\nKeep your response focused and concise (2-4 paragraphs). Stay in character.`;

    if (context) {
      prompt += `\n\nAdditional context: ${context}`;
    }

    return prompt;
  }

  /**
   * Build user message for persona
   */
  private buildUserMessage(question: string, persona: Persona): string {
    return `Question for the council: ${question}\n\nAs ${persona.name}, what is your perspective on this question?`;
  }

  /**
   * Build system prompt for moderator
   */
  private buildModeratorSystemPrompt(): string {
    return `You are the Moderator of a Multi-Persona Brainstorm Council. Your role is to synthesize the diverse perspectives from multiple personas into a coherent, balanced summary.

Your synthesis should:
1. Identify key agreements across personas
2. Surface important contradictions or tensions
3. Extract the most valuable insights
4. Provide a practical, unified recommendation

Be neutral, clear, and structured. Don't favor any single persona, but weave their insights into a cohesive whole.
Your tone should be professional, thoughtful, and balanced.`;
  }

  /**
   * Build user message for moderator
   */
  private buildModeratorUserMessage(
    question: string,
    responses: Array<{ persona: Persona; response: string }>
  ): string {
    let message = `Original question: ${question}\n\n`;
    message += `Here are the responses from each persona in the council:\n\n`;

    for (const { persona, response } of responses) {
      message += `--- ${persona.name} (${persona.avatar}) ---\n`;
      message += `${response}\n\n`;
    }

    message += `As the Moderator, please synthesize these perspectives into a unified summary that:
1. Lists key agreements
2. Identifies contradictions
3. Highlights the most valuable insights
4. Provides a practical, unified recommendation

Format your response as structured sections.`;

    return message;
  }

  /**
   * Generate mock response for testing
   */
  private generateMockResponse(persona: Persona, question: string): AIResponse {
    return {
      content: `[Mock response from ${persona.name}]\n\nRegarding "${question}", I believe this requires careful consideration from my perspective. As ${persona.name}, I would emphasize the importance of ${persona.name.toLowerCase()} thinking in approaching this challenge.`,
      model: 'mock-model',
      usage: { input_tokens: 100, output_tokens: 50 }
    };
  }

  /**
   * Generate mock moderator response for testing
   */
  private generateMockModeratorResponse(
    question: string,
    responses: Array<{ persona: Persona; response: string }>
  ): AIResponse {
    return {
      content: `[Mock Moderator Synthesis]\n\nThe council has provided ${responses.length} diverse perspectives on: "${question}"\n\nKey themes emerged across the discussion, highlighting both consensus and creative tension. The recommendation is to proceed thoughtfully.`,
      model: 'mock-model',
      usage: { input_tokens: 200, output_tokens: 100 }
    };
  }
}

// Export singleton instance
export const aiClient = new AIClient();
