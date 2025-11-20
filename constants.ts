import { Activity, MoodLevel } from './types';

export const MOODS = [
  { level: MoodLevel.AMAZING, emoji: '😄', color: 'bg-green-500', label: 'Amazing' },
  { level: MoodLevel.GOOD, emoji: '😊', color: 'bg-lime-500', label: 'Good' },
  { level: MoodLevel.NEUTRAL, emoji: '😐', color: 'bg-yellow-400', label: 'Neutral' },
  { level: MoodLevel.BAD, emoji: '😕', color: 'bg-orange-500', label: 'Bad' },
  { level: MoodLevel.TERRIBLE, emoji: '😢', color: 'bg-red-500', label: 'Terrible' },
];

export const ACTIVITIES: Activity[] = [
  { id: 'work', icon: 'Briefcase', label: 'Work' },
  { id: 'relax', icon: 'Coffee', label: 'Relax' },
  { id: 'exercise', icon: 'Dumbbell', label: 'Exercise' },
  { id: 'gaming', icon: 'Gamepad2', label: 'Gaming' },
  { id: 'reading', icon: 'BookOpen', label: 'Reading' },
  { id: 'music', icon: 'Music', label: 'Music' },
  { id: 'sleep', icon: 'Moon', label: 'Sleep' },
  { id: 'outdoors', icon: 'Sun', label: 'Outdoors' },
  { id: 'social', icon: 'Users', label: 'Social' },
  { id: 'food', icon: 'Utensils', label: 'Good Meal' },
  { id: 'shopping', icon: 'ShoppingCart', label: 'Shopping' },
  { id: 'movies', icon: 'Tv', label: 'Movies' },
];

export const GEMINI_MODEL = 'gemini-2.5-flash';