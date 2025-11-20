/**
 * Front-End Orchestrator
 * Transforms backend debate output into UI-ready animated visuals
 */

import { DebateOutput, PersonaResponse } from '../types.js';
import { getBuiltinPersona } from '../personas/builtin.js';
import { PersonaManager } from '../personas/manager.js';
import {
  UIReadyOutput,
  PersonaVisual,
  ModeratorVisual,
  AnimationType,
  PositionType,
  EmotionTone,
  ModeratorAnimationType
} from './types.js';

/**
 * Persona ID to emotion tone mapping
 */
const PERSONA_EMOTION_MAP: Record<string, EmotionTone> = {
  'skeptic': 'cautious',
  'optimist': 'enthusiastic',
  'pragmatist': 'balanced',
  'creative': 'creative',
  'analyst': 'analytical',
  'ethicist': 'concerned'
};

/**
 * Persona ID to animation type mapping
 */
const PERSONA_ANIMATION_MAP: Record<string, AnimationType> = {
  'skeptic': 'fade_in',
  'optimist': 'bounce',
  'pragmatist': 'slide_left',
  'creative': 'pop',
  'analyst': 'drift',
  'ethicist': 'pulse'
};

/**
 * Persona ID to color theme mapping
 */
const PERSONA_COLOR_MAP: Record<string, string> = {
  'skeptic': '#FF6B6B',      // Red
  'optimist': '#FFD93D',     // Yellow
  'pragmatist': '#6BCB77',   // Green
  'creative': '#C77DFF',     // Purple
  'analyst': '#4D96FF',      // Blue
  'ethicist': '#FF8C42'      // Orange
};

export class FrontEndOrchestrator {
  private personaManager: PersonaManager;

  constructor() {
    this.personaManager = new PersonaManager();
  }

  /**
   * Transform backend debate output into UI-ready format
   */
  async orchestrate(debateOutput: DebateOutput): Promise<UIReadyOutput> {
    const personaCount = debateOutput.personas.length;

    // Generate persona visuals
    const personaVisuals = await this.generatePersonaVisuals(
      debateOutput.personas,
      personaCount
    );

    // Generate moderator visual
    const moderatorVisual = this.generateModeratorVisual(
      debateOutput.moderator_summary
    );

    // Calculate total animation duration
    const totalDuration = this.calculateTotalDuration(personaVisuals, moderatorVisual);

    // Determine layout strategy
    const layoutStrategy = this.determineLayoutStrategy(personaCount);

    return {
      persona_visuals: personaVisuals,
      moderator_visual: moderatorVisual,
      total_duration_estimate: totalDuration,
      scene_metadata: {
        persona_count: personaCount,
        layout_strategy: layoutStrategy
      }
    };
  }

  /**
   * Generate visual configuration for each persona
   */
  private async generatePersonaVisuals(
    personas: PersonaResponse[],
    totalCount: number
  ): Promise<PersonaVisual[]> {
    const visuals: PersonaVisual[] = [];

    // Get positions based on count
    const positions = this.calculatePositions(totalCount);

    for (let i = 0; i < personas.length; i++) {
      const persona = personas[i];

      // Try to get persona details for avatar
      const personaDetails = await this.personaManager.getPersona(persona.id);
      const avatar = personaDetails?.avatar || '💬';

      const visual: PersonaVisual = {
        id: persona.id,
        name: persona.name,
        avatar: avatar,
        text: persona.response,
        animation: this.getAnimation(persona.id),
        position: positions[i],
        typing_speed: this.calculateTypingSpeed(persona.response),
        delay_before_start: this.calculateDelay(i, totalCount),
        emotion_tone: this.getEmotionTone(persona.id),
        color: this.getColor(persona.id),
        order: i
      };

      visuals.push(visual);
    }

    return visuals;
  }

  /**
   * Generate visual configuration for moderator
   */
  private generateModeratorVisual(summaryText: string): ModeratorVisual {
    return {
      text: summaryText,
      animation: 'center_glow',
      typing_speed: 8, // Slightly faster for moderator
      delay_before_start: 2000 // Wait 2s after last persona
    };
  }

  /**
   * Calculate positions in a circle or grid pattern
   */
  private calculatePositions(count: number): PositionType[] {
    if (count === 1) return ['center'];
    if (count === 2) return ['left', 'right'];
    if (count === 3) return ['top_center', 'bottom_left', 'bottom_right'];
    if (count === 4) return ['top_left', 'top_right', 'bottom_left', 'bottom_right'];
    if (count === 5) return ['top_center', 'left', 'right', 'bottom_left', 'bottom_right'];
    if (count === 6) return ['top_left', 'top_center', 'top_right', 'bottom_left', 'bottom_center', 'bottom_right'];

    // For more than 6, cycle through positions
    const basePositions: PositionType[] = [
      'top_left', 'top_center', 'top_right',
      'left', 'right',
      'bottom_left', 'bottom_center', 'bottom_right'
    ];

    const positions: PositionType[] = [];
    for (let i = 0; i < count; i++) {
      positions.push(basePositions[i % basePositions.length]);
    }

    return positions;
  }

  /**
   * Get animation type for persona
   */
  private getAnimation(personaId: string): AnimationType {
    return PERSONA_ANIMATION_MAP[personaId] || 'fade_in';
  }

  /**
   * Get emotion tone for persona
   */
  private getEmotionTone(personaId: string): EmotionTone {
    return PERSONA_EMOTION_MAP[personaId] || 'balanced';
  }

  /**
   * Get color for persona
   */
  private getColor(personaId: string): string {
    return PERSONA_COLOR_MAP[personaId] || '#6C757D';
  }

  /**
   * Calculate typing speed based on text length and emotion
   */
  private calculateTypingSpeed(text: string): number {
    const baseSpeed = 15; // ms per character
    const length = text.length;

    // Adjust speed based on length - longer texts type slightly faster
    if (length < 200) return baseSpeed;
    if (length < 500) return baseSpeed - 2;
    return baseSpeed - 5;
  }

  /**
   * Calculate staggered delay for persona entrance
   */
  private calculateDelay(index: number, total: number): number {
    // Base delay increases with each persona
    const baseDelay = 500; // ms
    const increment = 800; // ms between each persona

    return baseDelay + (index * increment);
  }

  /**
   * Calculate total animation duration
   */
  private calculateTotalDuration(
    personas: PersonaVisual[],
    moderator: ModeratorVisual
  ): number {
    let maxPersonaDuration = 0;

    for (const persona of personas) {
      const textDuration = persona.text.length * persona.typing_speed;
      const totalPersonaDuration = persona.delay_before_start + textDuration;
      maxPersonaDuration = Math.max(maxPersonaDuration, totalPersonaDuration);
    }

    const moderatorDuration =
      maxPersonaDuration +
      moderator.delay_before_start +
      (moderator.text.length * moderator.typing_speed);

    return moderatorDuration;
  }

  /**
   * Determine layout strategy based on persona count
   */
  private determineLayoutStrategy(count: number): 'circle' | 'grid' | 'linear' | 'scattered' {
    if (count <= 2) return 'linear';
    if (count <= 4) return 'grid';
    if (count <= 6) return 'circle';
    return 'scattered';
  }
}

// Export singleton instance
export const frontEndOrchestrator = new FrontEndOrchestrator();
