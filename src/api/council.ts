/**
 * Council API - Main programmatic interface for the Multi-Persona Council
 */

import { Persona, DebateOutput, DebateSession } from '../types.js';
import { PersonaManager } from '../personas/manager.js';
import { DebateEngine } from '../engine/debate.js';

export class CouncilAPI {
  private personaManager: PersonaManager;
  private debateEngine: DebateEngine;

  constructor() {
    this.personaManager = new PersonaManager();
    this.debateEngine = new DebateEngine();
  }

  /**
   * Ask the council a question and get a debate
   */
  async ask(
    question: string,
    options?: {
      personaIds?: string[];
      context?: string;
      saveToHistory?: boolean;
    }
  ): Promise<DebateOutput> {
    return await this.debateEngine.runDebate(question, options);
  }

  /**
   * Persona Management
   */
  async listPersonas(): Promise<Persona[]> {
    return await this.personaManager.getAllPersonas();
  }

  async listActivePersonas(): Promise<Persona[]> {
    return await this.personaManager.getActivePersonas();
  }

  async getPersona(id: string): Promise<Persona | null> {
    return await this.personaManager.getPersona(id);
  }

  async createPersona(persona: Omit<Persona, 'is_builtin'>): Promise<Persona> {
    return await this.personaManager.createPersona(persona);
  }

  async updatePersona(id: string, updates: Partial<Omit<Persona, 'id' | 'is_builtin'>>): Promise<Persona> {
    return await this.personaManager.updatePersona(id, updates);
  }

  async deletePersona(id: string): Promise<void> {
    return await this.personaManager.deletePersona(id);
  }

  async activatePersona(id: string): Promise<void> {
    return await this.personaManager.activatePersona(id);
  }

  async deactivatePersona(id: string): Promise<void> {
    return await this.personaManager.deactivatePersona(id);
  }

  /**
   * Debate History Management
   */
  async getDebateHistory(limit?: number): Promise<DebateSession[]> {
    return await this.debateEngine.getDebateHistory(limit);
  }

  async getDebateSession(id: string): Promise<DebateSession | null> {
    return await this.debateEngine.getDebateSession(id);
  }

  async deleteDebateSession(id: string): Promise<void> {
    return await this.debateEngine.deleteDebateSession(id);
  }

  async clearDebateHistory(): Promise<void> {
    return await this.debateEngine.clearDebateHistory();
  }
}

// Export singleton instance
export const council = new CouncilAPI();
