/**
 * Multi-Persona Brainstorm Council
 * Main entry point and exports
 */

// Main API
export { council, CouncilAPI } from './api/council.js';

// Core types
export type {
  Persona,
  PersonaResponse,
  ModeratorSummary,
  DebateSession,
  DebateOutput,
  WALStorage
} from './types.js';

// Managers and engines
export { personaManager, PersonaManager } from './personas/manager.js';
export { debateEngine, DebateEngine } from './engine/debate.js';
export { aiClient, AIClient } from './engine/ai-client.js';

// Storage
export { wal, FileBasedWAL } from './storage/wal.js';

// Built-in personas
export {
  BUILTIN_PERSONAS,
  getBuiltinPersonas,
  getActiveBuiltinPersonas,
  getBuiltinPersona
} from './personas/builtin.js';

// For CLI usage
import './cli.js';
