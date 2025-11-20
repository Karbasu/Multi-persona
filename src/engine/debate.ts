/**
 * Debate Engine - orchestrates the multi-persona debate process
 */

import { Persona, PersonaResponse, ModeratorSummary, DebateSession, DebateOutput } from '../types.js';
import { PersonaManager, personaManager } from '../personas/manager.js';
import { AIClient, aiClient } from './ai-client.js';
import { wal } from '../storage/wal.js';

const DEBATE_PREFIX = 'debate::';

export class DebateEngine {
  private personaManager: PersonaManager;
  private aiClient: AIClient;

  constructor(
    personaManager?: PersonaManager,
    aiClient?: AIClient
  ) {
    this.personaManager = personaManager || new PersonaManager();
    this.aiClient = aiClient || new AIClient();
  }

  /**
   * Run a complete debate session
   */
  async runDebate(
    question: string,
    options?: {
      personaIds?: string[];
      context?: string;
      saveToHistory?: boolean;
    }
  ): Promise<DebateOutput> {
    const { personaIds, context, saveToHistory = true } = options || {};

    console.log(`🎭 Starting debate on: "${question}"\n`);

    // Load active personas
    let personas: Persona[];
    if (personaIds && personaIds.length > 0) {
      personas = await this.loadSpecificPersonas(personaIds);
    } else {
      personas = await this.personaManager.getActivePersonas();
    }

    if (personas.length === 0) {
      throw new Error('No active personas available for debate');
    }

    console.log(`📋 ${personas.length} personas participating:\n${personas.map(p => `   ${p.avatar} ${p.name}`).join('\n')}\n`);

    // Collect responses from each persona
    const personaResponses: PersonaResponse[] = [];
    const responsesWithPersona: Array<{ persona: Persona; response: string }> = [];

    for (const persona of personas) {
      console.log(`💬 ${persona.avatar} ${persona.name} is speaking...`);

      const aiResponse = await this.aiClient.generatePersonaResponse(
        persona,
        question,
        context
      );

      const response: PersonaResponse = {
        id: persona.id,
        name: persona.name,
        response: aiResponse.content,
        timestamp: Date.now()
      };

      personaResponses.push(response);
      responsesWithPersona.push({
        persona,
        response: aiResponse.content
      });

      console.log(`   ✓ Response received\n`);
    }

    // Generate moderator synthesis
    console.log(`🎯 Moderator is synthesizing perspectives...`);

    const moderatorAIResponse = await this.aiClient.generateModeratorSynthesis(
      question,
      responsesWithPersona
    );

    const moderatorSummary = this.parseModeratorResponse(moderatorAIResponse.content);

    console.log(`   ✓ Synthesis complete\n`);

    // Save to history if requested
    if (saveToHistory) {
      await this.saveDebateToHistory(
        question,
        personaResponses,
        moderatorSummary,
        personas.map(p => p.id)
      );
    }

    return {
      personas: personaResponses,
      moderator_summary: moderatorSummary.full_text
    };
  }

  /**
   * Load specific personas by IDs
   */
  private async loadSpecificPersonas(personaIds: string[]): Promise<Persona[]> {
    const personas: Persona[] = [];

    for (const id of personaIds) {
      const persona = await this.personaManager.getPersona(id);
      if (persona) {
        personas.push(persona);
      } else {
        console.warn(`Warning: Persona '${id}' not found`);
      }
    }

    return personas;
  }

  /**
   * Parse moderator response into structured format
   */
  private parseModeratorResponse(content: string): ModeratorSummary {
    const summary: ModeratorSummary = {
      agreements: [],
      contradictions: [],
      key_insights: [],
      unified_recommendation: '',
      full_text: content
    };

    // Simple parsing - could be enhanced with more sophisticated NLP
    const lines = content.split('\n');
    let currentSection: 'agreements' | 'contradictions' | 'insights' | 'recommendation' | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) continue;

      // Detect section headers
      if (/agreement|consensus|common/i.test(trimmed)) {
        currentSection = 'agreements';
        continue;
      } else if (/contradiction|tension|disagree/i.test(trimmed)) {
        currentSection = 'contradictions';
        continue;
      } else if (/insight|valuable|key|important/i.test(trimmed)) {
        currentSection = 'insights';
        continue;
      } else if (/recommendation|conclusion|summary/i.test(trimmed)) {
        currentSection = 'recommendation';
        continue;
      }

      // Extract bullet points or numbered items
      const bulletMatch = trimmed.match(/^[-•*]\s*(.+)$/) || trimmed.match(/^\d+\.\s*(.+)$/);
      if (bulletMatch && currentSection && currentSection !== 'recommendation') {
        const content = bulletMatch[1];
        if (currentSection === 'agreements') {
          summary.agreements.push(content);
        } else if (currentSection === 'contradictions') {
          summary.contradictions.push(content);
        } else if (currentSection === 'insights') {
          summary.key_insights.push(content);
        }
      } else if (currentSection === 'recommendation') {
        summary.unified_recommendation += trimmed + ' ';
      }
    }

    summary.unified_recommendation = summary.unified_recommendation.trim();

    return summary;
  }

  /**
   * Save debate session to history
   */
  private async saveDebateToHistory(
    question: string,
    personaResponses: PersonaResponse[],
    moderatorSummary: ModeratorSummary,
    activePersonas: string[]
  ): Promise<void> {
    const timestamp = Date.now();
    const id = `${timestamp}`;

    const session: DebateSession = {
      id,
      timestamp,
      question,
      persona_responses: personaResponses,
      moderator_summary: moderatorSummary,
      active_personas: activePersonas
    };

    const key = `${DEBATE_PREFIX}${id}`;
    await wal.put(key, session);

    console.log(`💾 Debate saved to history (ID: ${id})\n`);
  }

  /**
   * Get debate history
   */
  async getDebateHistory(limit?: number): Promise<DebateSession[]> {
    const keys = await wal.list(DEBATE_PREFIX);
    const sessions: DebateSession[] = [];

    for (const key of keys) {
      const session = await wal.get<DebateSession>(key);
      if (session) {
        sessions.push(session);
      }
    }

    // Sort by timestamp (most recent first)
    sessions.sort((a, b) => b.timestamp - a.timestamp);

    if (limit) {
      return sessions.slice(0, limit);
    }

    return sessions;
  }

  /**
   * Get a specific debate session
   */
  async getDebateSession(id: string): Promise<DebateSession | null> {
    const key = `${DEBATE_PREFIX}${id}`;
    return await wal.get<DebateSession>(key);
  }

  /**
   * Delete a debate session
   */
  async deleteDebateSession(id: string): Promise<void> {
    const key = `${DEBATE_PREFIX}${id}`;
    await wal.delete(key);
  }

  /**
   * Clear all debate history
   */
  async clearDebateHistory(): Promise<void> {
    const keys = await wal.list(DEBATE_PREFIX);
    for (const key of keys) {
      await wal.delete(key);
    }
  }
}

// Export singleton instance
export const debateEngine = new DebateEngine();
