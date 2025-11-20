export enum MoodLevel {
  TERRIBLE = 1,
  BAD = 2,
  NEUTRAL = 3,
  GOOD = 4,
  AMAZING = 5,
}

export interface Activity {
  id: string;
  icon: string;
  label: string;
}

export interface Goal {
  id: string;
  text: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO Date String
  mood: MoodLevel;
  activities: string[]; // Array of Activity IDs
  completedGoalIds?: string[]; // Array of Goal IDs completed
  note: string;
}

export type ViewState = 'dashboard' | 'entry' | 'stats' | 'goals' | 'settings';