import { useState, useCallback, useEffect } from 'react';
import type { Habit } from '../domain/habits/habit.types';
import { getMessage } from '../domain/habits/habit.messages';
import { getTodayDateString } from '../utils/dates';
import { api, isApiRequestError, type StateResponse } from '../api/client';

export interface HabitMessage {
  habitId: string;
  text: string;
  timestamp: number;
}

export function useHabits(onUnauthorized: () => void) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [deletedHabits, setDeletedHabits] = useState<Habit[]>([]);
  const [messages, setMessages] = useState<Record<string, HabitMessage>>({});
  const [missedHabits, setMissedHabits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const clearState = useCallback(() => {
    setHabits([]);
    setDeletedHabits([]);
    setMessages({});
    setMissedHabits(new Set());
  }, []);

  const applyState = useCallback((res: StateResponse) => {
    setHabits(res.habits);
    setDeletedHabits(res.deletedHabits);
  }, []);

  const handleError = useCallback((error: unknown) => {
    if (isApiRequestError(error) && error.status === 401) {
      clearState();
      onUnauthorized();
    }
  }, [clearState, onUnauthorized]);

  useEffect(() => {
    let active = true;

    api.getState()
      .then((res) => {
        if (!active) return;

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
        } else {
          setMissedHabits(new Set());
          setMessages({});
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        handleError(error);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [applyState, clearState, handleError]);

  const setMessage = useCallback((habitId: string, text: string) => {
    setMessages((prev) => ({
      ...prev,
      [habitId]: { habitId, text, timestamp: Date.now() },
    }));
  }, []);

  const addHabit = useCallback(
    (name: string, dailyTarget: number, color?: string) => {
      api.addHabit(name, dailyTarget, color).then(applyState).catch(handleError);
    },
    [applyState, handleError]
  );

  const editHabit = useCallback(
    (id: string, name: string, dailyTarget: number, color?: string) => {
      api.editHabit(id, name, dailyTarget, color).then(applyState).catch(handleError);
    },
    [applyState, handleError]
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
      }).catch(handleError);
    },
    [applyState, handleError]
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
      }).catch(handleError);
    },
    [applyState, handleError, setMessage]
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
      }).catch(handleError);
    },
    [applyState, handleError, setMessage]
  );

  const setDayCount = useCallback(
    (id: string, date: string, count: number) => {
      api.setDayCount(id, date, count).then(applyState).catch(handleError);
    },
    [applyState, handleError]
  );

  const restoreHabit = useCallback(
    (id: string) => {
      api.restoreHabit(id).then(applyState).catch(handleError);
    },
    [applyState, handleError]
  );

  const permanentlyDeleteHabit = useCallback(
    (id: string) => {
      api.permanentlyDeleteHabit(id).then(applyState).catch(handleError);
    },
    [applyState, handleError]
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
