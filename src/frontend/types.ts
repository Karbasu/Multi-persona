/**
 * Frontend Orchestrator Type Definitions
 * Structures for UI animation and visual rendering
 */

export type AnimationType =
  | 'fade_in'
  | 'pop'
  | 'drift'
  | 'pulse'
  | 'slide_left'
  | 'slide_right'
  | 'bounce';

export type PositionType =
  | 'left'
  | 'right'
  | 'top_left'
  | 'top_right'
  | 'bottom_left'
  | 'bottom_right'
  | 'center'
  | 'top_center'
  | 'bottom_center';

export type EmotionTone =
  | 'analytical'
  | 'enthusiastic'
  | 'cautious'
  | 'creative'
  | 'balanced'
  | 'concerned'
  | 'hopeful';

export type ModeratorAnimationType =
  | 'center_glow'
  | 'slow_fade'
  | 'anchor_bottom'
  | 'expand_center'
  | 'gentle_pulse';

export interface PersonaVisual {
  id: string;
  name: string;
  avatar: string;
  text: string;
  animation: AnimationType;
  position: PositionType;
  typing_speed: number;        // ms per character
  delay_before_start: number;  // ms delay before animation starts
  emotion_tone: EmotionTone;
  color?: string;              // Optional color theme
  order: number;               // Order of appearance
}

export interface ModeratorVisual {
  text: string;
  animation: ModeratorAnimationType;
  typing_speed: number;
  delay_before_start: number;
  emphasis_sections?: {        // Optional highlighting for key sections
    agreements?: string[];
    contradictions?: string[];
    insights?: string[];
  };
}

export interface UIReadyOutput {
  persona_visuals: PersonaVisual[];
  moderator_visual: ModeratorVisual;
  total_duration_estimate: number; // Total animation time in ms
  scene_metadata: {
    persona_count: number;
    layout_strategy: 'circle' | 'grid' | 'linear' | 'scattered';
    theme?: string;
  };
}
