/**
 * Core type definitions for the Multi-Persona Brainstorm Council
 */

export interface Persona {
  id: string;
  name: string;
  system_prompt: string;
  speaking_style: string;
  temperature: number;
  model?: string;
  avatar: string;
  metadata?: Record<string, any>;
  is_builtin?: boolean;
  is_active?: boolean;
}

export interface PersonaResponse {
  id: string;
  name: string;
  response: string;
  timestamp?: number;
}

export interface ModeratorSummary {
  agreements: string[];
  contradictions: string[];
  key_insights: string[];
  unified_recommendation: string;
  full_text: string;
}

export interface DebateSession {
  id: string;
  timestamp: number;
  question: string;
  persona_responses: PersonaResponse[];
  moderator_summary: ModeratorSummary;
  active_personas: string[]; // persona IDs
  metadata?: Record<string, any>;
}

export interface DebateOutput {
  personas: PersonaResponse[];
  moderator_summary: string;
}

export interface WALStorage {
  list(prefix?: string): Promise<string[]>;
  get<T>(key: string): Promise<T | null>;
  put<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
