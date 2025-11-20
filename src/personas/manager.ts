/**
 * Persona Manager - handles CRUD operations for personas
 */

import { Persona } from '../types.js';
import { WALStorage } from '../types.js';
import { wal } from '../storage/wal.js';
import { getBuiltinPersonas, getActiveBuiltinPersonas } from './builtin.js';

const PERSONA_PREFIX = 'persona::';

export class PersonaManager {
  private storage: WALStorage;

  constructor(storage?: WALStorage) {
    this.storage = storage || wal;
  }

  /**
   * Get all personas (built-in + custom)
   */
  async getAllPersonas(): Promise<Persona[]> {
    const builtins = getBuiltinPersonas();
    const customKeys = await this.storage.list(PERSONA_PREFIX);
    const customs: Persona[] = [];

    for (const key of customKeys) {
      const persona = await this.storage.get<Persona>(key);
      if (persona) {
        customs.push(persona);
      }
    }

    return [...builtins, ...customs];
  }

  /**
   * Get all active personas (built-in + custom)
   */
  async getActivePersonas(): Promise<Persona[]> {
    const all = await this.getAllPersonas();
    return all.filter(p => p.is_active !== false); // Active by default
  }

  /**
   * Get a persona by ID (checks both built-in and custom)
   */
  async getPersona(id: string): Promise<Persona | null> {
    // Check built-ins first
    const builtins = getBuiltinPersonas();
    const builtin = builtins.find(p => p.id === id);
    if (builtin) {
      return builtin;
    }

    // Check custom personas
    const key = this.getPersonaKey(id);
    return await this.storage.get<Persona>(key);
  }

  /**
   * Create a new custom persona
   */
  async createPersona(persona: Omit<Persona, 'is_builtin'>): Promise<Persona> {
    const fullPersona: Persona = {
      ...persona,
      is_builtin: false,
      is_active: persona.is_active ?? true
    };

    // Check if ID already exists
    const existing = await this.getPersona(fullPersona.id);
    if (existing) {
      throw new Error(`Persona with ID '${fullPersona.id}' already exists`);
    }

    const key = this.getPersonaKey(fullPersona.id);
    await this.storage.put(key, fullPersona);

    return fullPersona;
  }

  /**
   * Update an existing custom persona
   */
  async updatePersona(id: string, updates: Partial<Omit<Persona, 'id' | 'is_builtin'>>): Promise<Persona> {
    const existing = await this.getPersona(id);

    if (!existing) {
      throw new Error(`Persona with ID '${id}' not found`);
    }

    if (existing.is_builtin) {
      throw new Error(`Cannot update built-in persona '${id}'`);
    }

    const updated: Persona = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      is_builtin: false
    };

    const key = this.getPersonaKey(id);
    await this.storage.put(key, updated);

    return updated;
  }

  /**
   * Delete a custom persona
   */
  async deletePersona(id: string): Promise<void> {
    const existing = await this.getPersona(id);

    if (!existing) {
      throw new Error(`Persona with ID '${id}' not found`);
    }

    if (existing.is_builtin) {
      throw new Error(`Cannot delete built-in persona '${id}'`);
    }

    const key = this.getPersonaKey(id);
    await this.storage.delete(key);
  }

  /**
   * Activate a persona
   */
  async activatePersona(id: string): Promise<void> {
    const persona = await this.getPersona(id);

    if (!persona) {
      throw new Error(`Persona with ID '${id}' not found`);
    }

    if (persona.is_builtin) {
      // Built-in personas can't be modified in storage
      // In a real implementation, you might store overrides
      throw new Error(`Cannot modify built-in persona activation state directly`);
    }

    await this.updatePersona(id, { is_active: true });
  }

  /**
   * Deactivate a persona
   */
  async deactivatePersona(id: string): Promise<void> {
    const persona = await this.getPersona(id);

    if (!persona) {
      throw new Error(`Persona with ID '${id}' not found`);
    }

    if (persona.is_builtin) {
      throw new Error(`Cannot modify built-in persona activation state directly`);
    }

    await this.updatePersona(id, { is_active: false });
  }

  /**
   * List all custom personas
   */
  async getCustomPersonas(): Promise<Persona[]> {
    const customKeys = await this.storage.list(PERSONA_PREFIX);
    const customs: Persona[] = [];

    for (const key of customKeys) {
      const persona = await this.storage.get<Persona>(key);
      if (persona) {
        customs.push(persona);
      }
    }

    return customs;
  }

  /**
   * Get persona storage key
   */
  private getPersonaKey(id: string): string {
    return `${PERSONA_PREFIX}${id}`;
  }
}

// Export singleton instance
export const personaManager = new PersonaManager();
