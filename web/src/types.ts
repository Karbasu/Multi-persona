/**
 * Frontend Types - mirrors backend types
 */

export interface PersonaVisual {
  id: string;
  name: string;
  avatar: string;
  text: string;
  animation: string;
  position: string;
  typing_speed: number;
  delay_before_start: number;
  emotion_tone: string;
  color?: string;
  order: number;
}

export interface ModeratorVisual {
  text: string;
  animation: string;
  typing_speed: number;
  delay_before_start: number;
}

export interface UIReadyOutput {
  persona_visuals: PersonaVisual[];
  moderator_visual: ModeratorVisual;
  total_duration_estimate: number;
  scene_metadata: {
    persona_count: number;
    layout_strategy: string;
  };
}

export interface Persona {
  id: string;
  name: string;
  avatar: string;
  system_prompt?: string;
  speaking_style?: string;
  temperature?: number;
  is_active?: boolean;
  is_builtin?: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
