import { useState, useCallback, useEffect } from 'react';
import type { Habit, AppState } from '../domain/habits/habit.types';
import {
  createHabit,
  incrementHabit,
  undoHabit,
  setDayCount as setDayCountLogic,
  processMissedDays,
  recalculateHabitStats,
} from '../domain/habits/habit.logic';
import { getMessage } from '../domain/habits/habit.messages';
import { loadState, saveState } from '../domain/habits/habit.storage';
import { getTodayDateString } from '../utils/dates';

export interface HabitMessage {
  habitId: string;
  text: string;
  timestamp: number;
}

export function useHabits() {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadState();
    const today = getTodayDateString();

    // Process missed days on load
    for (const habit of loaded.habits) {
      processMissedDays(habit, today);
      recalculateHabitStats(habit, today);
    }
    loaded.lastOpenedDate = today;

    return loaded;
  });

  const [messages, setMessages] = useState<Record<string, HabitMessage>>({});
  const [missedHabits, setMissedHabits] = useState<Set<string>>(new Set());

  // Detect missed days on initial load
  useEffect(() => {
    const loaded = loadState();
    const today = getTodayDateString();
    const missed = new Set<string>();

    for (const habit of loaded.habits) {
      const hadMissed = processMissedDays(habit, today);
      if (hadMissed) {
        missed.add(habit.id);
      }
    }

    if (missed.size > 0) {
      setMissedHabits(missed);
      const newMessages: Record<string, HabitMessage> = {};
      for (const id of missed) {
        const habit = loaded.habits.find((h) => h.id === id);
        if (habit) {
          newMessages[id] = {
            habitId: id,
            text: getMessage({
              category: 'missed',
              count: 0,
              dailyTarget: habit.dailyTarget,
              currentStreak: 0,
              habitName: habit.name,
            }),
            timestamp: Date.now(),
          };
        }
      }
      setMessages(newMessages);
    }
  }, []);

  // Save whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const setMessage = useCallback((habitId: string, text: string) => {
    setMessages((prev) => ({
      ...prev,
      [habitId]: { habitId, text, timestamp: Date.now() },
    }));
  }, []);

  const addHabit = useCallback((name: string, dailyTarget: number, color?: string) => {
    const habit = createHabit(name, dailyTarget, color);
    setState((prev) => ({
      ...prev,
      habits: [...prev.habits, habit],
    }));
  }, []);

  const editHabit = useCallback(
    (id: string, name: string, dailyTarget: number, color?: string) => {
      const today = getTodayDateString();
      setState((prev) => ({
        ...prev,
        habits: prev.habits.map((h) => {
          if (h.id !== id) return h;
          const updated = {
            ...h,
            name,
            dailyTarget: Math.max(1, Math.min(10, dailyTarget)),
            color,
            dayRecords: { ...h.dayRecords },
          };
          // Recalculate completion status for all records with new target
          for (const key of Object.keys(updated.dayRecords)) {
            const rec = { ...updated.dayRecords[key] };
            rec.completed = rec.count >= updated.dailyTarget;
            updated.dayRecords[key] = rec;
          }
          recalculateHabitStats(updated, today);
          return updated;
        }),
      }));
    },
    []
  );

  const deleteHabit = useCallback((id: string) => {
    setState((prev) => {
      const habit = prev.habits.find((h) => h.id === id);
      const deleted = prev.deletedHabits ?? [];
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== id),
        deletedHabits: habit ? [...deleted, habit] : deleted,
      };
    });
    setMessages((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const increment = useCallback(
    (id: string) => {
      const today = getTodayDateString();
      setState((prev) => {
        const habits = prev.habits.map((h) => {
          if (h.id !== id) return h;
          const clone: Habit = {
            ...h,
            dayRecords: { ...h.dayRecords },
          };
          // Deep clone current day record if exists
          if (clone.dayRecords[today]) {
            clone.dayRecords[today] = { ...clone.dayRecords[today] };
          }
          const result = incrementHabit(clone, today);

          const category = result.wasCompleted ? 'complete' : 'progress';
          setMessage(
            id,
            getMessage({
              category,
              count: result.newCount,
              dailyTarget: result.dailyTarget,
              currentStreak: clone.currentStreak,
              habitName: clone.name,
            })
          );

          return clone;
        });
        return { ...prev, habits };
      });
    },
    [setMessage]
  );

  const undo = useCallback(
    (id: string) => {
      const today = getTodayDateString();
      setState((prev) => {
        const habits = prev.habits.map((h) => {
          if (h.id !== id) return h;
          const clone: Habit = {
            ...h,
            dayRecords: { ...h.dayRecords },
          };
          if (clone.dayRecords[today]) {
            clone.dayRecords[today] = { ...clone.dayRecords[today] };
          }
          const result = undoHabit(clone, today);

          setMessage(
            id,
            getMessage({
              category: 'undo',
              count: result.newCount,
              dailyTarget: result.dailyTarget,
              currentStreak: clone.currentStreak,
              habitName: clone.name,
            })
          );

          return clone;
        });
        return { ...prev, habits };
      });
    },
    [setMessage]
  );

  const setDayCount = useCallback(
    (id: string, date: string, count: number) => {
      const today = getTodayDateString();
      setState((prev) => {
        const habits = prev.habits.map((h) => {
          if (h.id !== id) return h;
          const clone: Habit = { ...h, dayRecords: { ...h.dayRecords } };
          if (clone.dayRecords[date]) {
            clone.dayRecords[date] = { ...clone.dayRecords[date] };
          }
          setDayCountLogic(clone, date, count, today);
          return clone;
        });
        return { ...prev, habits };
      });
    },
    []
  );

  const restoreHabit = useCallback((id: string) => {
    setState((prev) => {
      const deleted = prev.deletedHabits ?? [];
      const habit = deleted.find((h) => h.id === id);
      if (!habit) return prev;
      return {
        ...prev,
        habits: [...prev.habits, habit],
        deletedHabits: deleted.filter((h) => h.id !== id),
      };
    });
  }, []);

  const permanentlyDeleteHabit = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      deletedHabits: (prev.deletedHabits ?? []).filter((h) => h.id !== id),
    }));
  }, []);

  const getTodayCount = useCallback(
    (habit: Habit): number => {
      const today = getTodayDateString();
      return habit.dayRecords[today]?.count ?? 0;
    },
    []
  );

  return {
    habits: state.habits,
    deletedHabits: state.deletedHabits ?? [],
    messages,
    missedHabits,
    addHabit,
    editHabit,
    deleteHabit,
    restoreHabit,
    permanentlyDeleteHabit,
    increment,
    undo,
    setDayCount,
    getTodayCount,
  };
}
