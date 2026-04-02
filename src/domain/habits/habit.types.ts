export type DateString = string; // YYYY-MM-DD

export interface HabitDayRecord {
  date: DateString;
  count: number;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  dailyTarget: number;
  color?: string;
  createdAt: string; // ISO date-time
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  lastEvaluatedDate?: DateString;
  dayRecords: Record<DateString, HabitDayRecord>;
}

export interface AppState {
  habits: Habit[];
  deletedHabits?: Habit[];
  lastOpenedDate?: DateString;
}

export type MessageCategory = 'progress' | 'complete' | 'undo' | 'missed';

export interface MessageContext {
  category: MessageCategory;
  count: number;
  dailyTarget: number;
  currentStreak: number;
  habitName: string;
}
