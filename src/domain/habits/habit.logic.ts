import type { Habit, HabitDayRecord, DateString } from './habit.types';
import { getYesterdayDateString, getNextDateString } from '../../utils/dates';

export function createHabit(name: string, dailyTarget: number): Habit {
  return {
    id: crypto.randomUUID(),
    name,
    dailyTarget: Math.max(1, Math.min(10, dailyTarget)),
    createdAt: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    dayRecords: {},
  };
}

function ensureDayRecord(habit: Habit, date: DateString): HabitDayRecord {
  if (!habit.dayRecords[date]) {
    habit.dayRecords[date] = {
      date,
      count: 0,
      completed: false,
    };
  }
  return habit.dayRecords[date];
}

function isHabitCompleteOnDate(habit: Habit, date: DateString): boolean {
  const record = habit.dayRecords[date];
  return !!record && record.completed;
}

export function processMissedDays(habit: Habit, today: DateString): boolean {
  if (!habit.lastEvaluatedDate) {
    habit.lastEvaluatedDate = today;
    return false;
  }

  if (habit.lastEvaluatedDate === today) {
    return false;
  }

  let date = getNextDateString(habit.lastEvaluatedDate);
  let missedAnyDay = false;

  while (date < today) {
    const record = habit.dayRecords[date];
    if (!record || !record.completed) {
      missedAnyDay = true;
    }
    date = getNextDateString(date);
  }

  if (missedAnyDay) {
    habit.currentStreak = 0;
  }

  habit.lastEvaluatedDate = today;
  return missedAnyDay;
}

function recalculateTotalCompletions(habit: Habit): void {
  let total = 0;
  for (const record of Object.values(habit.dayRecords)) {
    if (record.completed) {
      total += 1;
    }
  }
  habit.totalCompletions = total;
}

function recalculateCurrentStreak(habit: Habit, today: DateString): void {
  let streak = 0;
  let anchorDate = today;

  if (!isHabitCompleteOnDate(habit, today)) {
    anchorDate = getYesterdayDateString(today);
  }

  while (isHabitCompleteOnDate(habit, anchorDate)) {
    streak += 1;
    anchorDate = getYesterdayDateString(anchorDate);
  }

  habit.currentStreak = streak;
}

function recalculateLongestStreak(habit: Habit): void {
  const dates = Object.keys(habit.dayRecords).sort();

  let longest = 0;
  let running = 0;
  let previousCompletedDate: string | undefined;

  for (const date of dates) {
    const record = habit.dayRecords[date];

    if (!record.completed) {
      running = 0;
      previousCompletedDate = undefined;
      continue;
    }

    if (
      previousCompletedDate &&
      date === getNextDateString(previousCompletedDate)
    ) {
      running += 1;
    } else {
      running = 1;
    }

    if (running > longest) {
      longest = running;
    }

    previousCompletedDate = date;
  }

  habit.longestStreak = longest;
}

export function recalculateHabitStats(habit: Habit, today: DateString): void {
  recalculateTotalCompletions(habit);
  recalculateCurrentStreak(habit, today);
  recalculateLongestStreak(habit);
}

export type IncrementResult = {
  wasCompleted: boolean;
  newCount: number;
  dailyTarget: number;
};

export function incrementHabit(habit: Habit, today: DateString): IncrementResult {
  processMissedDays(habit, today);

  const record = ensureDayRecord(habit, today);

  if (record.count < habit.dailyTarget) {
    record.count += 1;
  }

  record.completed = record.count >= habit.dailyTarget;

  recalculateHabitStats(habit, today);

  return {
    wasCompleted: record.completed,
    newCount: record.count,
    dailyTarget: habit.dailyTarget,
  };
}

export type UndoResult = {
  wasCompleted: boolean;
  lostCompletion: boolean;
  newCount: number;
  dailyTarget: number;
};

export function undoHabit(habit: Habit, today: DateString): UndoResult {
  processMissedDays(habit, today);

  const record = ensureDayRecord(habit, today);
  const wasCompletedBefore = record.completed;

  if (record.count > 0) {
    record.count -= 1;
  }

  record.completed = record.count >= habit.dailyTarget;

  recalculateHabitStats(habit, today);

  return {
    wasCompleted: record.completed,
    lostCompletion: wasCompletedBefore && !record.completed,
    newCount: record.count,
    dailyTarget: habit.dailyTarget,
  };
}

export function getCompletionRate(habit: Habit): number {
  const records = Object.values(habit.dayRecords);
  if (records.length === 0) return 0;
  const completed = records.filter((r) => r.completed).length;
  return Math.round((completed / records.length) * 100);
}

export type DayStatus = 'complete' | 'in-progress' | 'missed' | 'today-empty';

export function getDayStatus(
  habit: Habit,
  date: DateString,
  today: DateString
): DayStatus {
  const record = habit.dayRecords[date];

  if (record && record.completed) return 'complete';
  if (date === today && record && record.count > 0) return 'in-progress';
  if (date === today) return 'today-empty';
  return 'missed';
}
