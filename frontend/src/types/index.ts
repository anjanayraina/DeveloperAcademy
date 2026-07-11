// ─── Shared TypeScript types for Developer Academy ────────────────────────────

export interface LevelProgress {
  level_id: number;
  title: string;
  completed_lessons: number;
  total_lessons: number;
  is_unlocked: boolean;
  completed_at: string | null;
}

export interface UserProgress {
  user_id: string;
  xp: number;
  streak_days: number;
  current_level: number;
  overall_pct: number;
  levels: LevelProgress[];
  last_active: string | null;
}

export interface ProgressUpdate {
  level_id: number;
  completed_lessons: number;
  xp_gained: number;
}

export interface TemplateMetadata {
  id: string;
  title: string;
  description: string;
  language: string;
  level_id: number;
  tags: string[];
}

export interface CodeTemplate extends TemplateMetadata {
  code: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export type NavPage = 'roadmap' | 'dashboard' | 'mentor';

export const LEVEL_COLORS: Record<number, string> = {
  1: '#7c3aed',
  2: '#2563eb',
  3: '#0891b2',
  4: '#059669',
  5: '#d97706',
  6: '#dc2626',
};

export const LEVEL_ICONS: Record<number, string> = {
  1: '⛓️',
  2: '👛',
  3: '📜',
  4: '💎',
  5: '🏛️',
  6: '🔮',
};
