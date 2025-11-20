/**
 * API Client for Multi-Persona Council
 */

import axios from 'axios';
import { Persona, UIReadyOutput, APIResponse } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export const api = {
  /**
   * Start a new debate
   */
  async startDebate(question: string, personaIds?: string[]) {
    const response = await axios.post<APIResponse<{
      debate: any;
      ui: UIReadyOutput;
    }>>(`${API_BASE}/api/debates`, {
      question,
      personaIds,
      saveToHistory: true
    });
    return response.data;
  },

  /**
   * Get all personas
   */
  async getPersonas(activeOnly = false) {
    const response = await axios.get<APIResponse<Persona[]>>(
      `${API_BASE}/api/personas`,
      { params: { active: activeOnly } }
    );
    return response.data;
  },

  /**
   * Get debate history
   */
  async getDebateHistory(limit?: number) {
    const response = await axios.get<APIResponse<any[]>>(
      `${API_BASE}/api/debates/history`,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Health check
   */
  async healthCheck() {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  }
};
