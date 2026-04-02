import { useState, useCallback, useEffect } from 'react';
import type { Habit } from '../domain/habits/habit.types';
import { getMessage } from '../domain/habits/habit.messages';
import { getTodayDateString } from '../utils/dates';
import { api, type StateResponse } from '../api/client';

export interface HabitMessage {
  habitId: string;
  text: string;
  timestamp: number;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [deletedHabits, setDeletedHabits] = useState<Habit[]>([]);
  const [messages, setMessages] = useState<Record<string, HabitMessage>>({});
  const [missedHabits, setMissedHabits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const applyState = useCallback((res: StateResponse) => {
    setHabits(res.habits);
    setDeletedHabits(res.deletedHabits);
  }, []);

  // Load initial state from API
  useEffect(() => {
    api.getState().then((res) => {
      applyState(res);

      if (res.missedHabitIds.length > 0) {
        setMissedHabits(new Set(res.missedHabitIds));
        const newMessages: Record<string, HabitMessage> = {};
        for (const id of res.missedHabitIds) {
          const habit = res.habits.find((h) => h.id === id);
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

      setLoading(false);
    });
  }, [applyState]);

  const setMessage = useCallback((habitId: string, text: string) => {
    setMessages((prev) => ({
      ...prev,
      [habitId]: { habitId, text, timestamp: Date.now() },
    }));
  }, []);

  const addHabit = useCallback(
    (name: string, dailyTarget: number, color?: string) => {
      api.addHabit(name, dailyTarget, color).then(applyState).catch(() => {});
    },
    [applyState]
  );

  const editHabit = useCallback(
    (id: string, name: string, dailyTarget: number, color?: string) => {
      api.editHabit(id, name, dailyTarget, color).then(applyState).catch(() => {});
    },
    [applyState]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      api.deleteHabit(id).then((res) => {
        applyState(res);
        setMessages((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }).catch(() => {});
    },
    [applyState]
  );

  const increment = useCallback(
    (id: string) => {
      api.increment(id).then((res) => {
        applyState(res);
        const today = getTodayDateString();
        const habit = res.habits.find((h) => h.id === id);
        if (habit) {
          const record = habit.dayRecords[today];
          const category = record?.completed ? 'complete' : 'progress';
          setMessage(
            id,
            getMessage({
              category,
              count: record?.count ?? 0,
              dailyTarget: habit.dailyTarget,
              currentStreak: habit.currentStreak,
              habitName: habit.name,
            })
          );
        }
      }).catch(() => {});
    },
    [applyState, setMessage]
  );

  const undo = useCallback(
    (id: string) => {
      api.undo(id).then((res) => {
        applyState(res);
        const today = getTodayDateString();
        const habit = res.habits.find((h) => h.id === id);
        if (habit) {
          const record = habit.dayRecords[today];
          setMessage(
            id,
            getMessage({
              category: 'undo',
              count: record?.count ?? 0,
              dailyTarget: habit.dailyTarget,
              currentStreak: habit.currentStreak,
              habitName: habit.name,
            })
          );
        }
      }).catch(() => {});
    },
    [applyState, setMessage]
  );

  const setDayCount = useCallback(
    (id: string, date: string, count: number) => {
      api.setDayCount(id, date, count).then(applyState).catch(() => {});
    },
    [applyState]
  );

  const restoreHabit = useCallback(
    (id: string) => {
      api.restoreHabit(id).then(applyState).catch(() => {});
    },
    [applyState]
  );

  const permanentlyDeleteHabit = useCallback(
    (id: string) => {
      api.permanentlyDeleteHabit(id).then(applyState).catch(() => {});
    },
    [applyState]
  );

  const getTodayCount = useCallback(
    (habit: Habit): number => {
      const today = getTodayDateString();
      return habit.dayRecords[today]?.count ?? 0;
    },
    []
  );

  return {
    habits,
    deletedHabits,
    messages,
    missedHabits,
    loading,
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
