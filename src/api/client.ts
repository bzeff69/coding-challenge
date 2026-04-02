import type { Habit } from '../domain/habits/habit.types';

export interface StateResponse {
  habits: Habit[];
  deletedHabits: Habit[];
  missedHabitIds: string[];
}

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const api = {
  getState: () =>
    request<StateResponse>('/state'),

  addHabit: (name: string, dailyTarget: number, color?: string) =>
    request<StateResponse>('/habits', {
      method: 'POST',
      body: JSON.stringify({ name, dailyTarget, color }),
    }),

  editHabit: (id: string, name: string, dailyTarget: number, color?: string) =>
    request<StateResponse>(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, dailyTarget, color }),
    }),

  deleteHabit: (id: string) =>
    request<StateResponse>(`/habits/${id}`, { method: 'DELETE' }),

  increment: (id: string) =>
    request<StateResponse>(`/habits/${id}/increment`, { method: 'POST' }),

  undo: (id: string) =>
    request<StateResponse>(`/habits/${id}/undo`, { method: 'POST' }),

  setDayCount: (id: string, date: string, count: number) =>
    request<StateResponse>(`/habits/${id}/days/${date}`, {
      method: 'PUT',
      body: JSON.stringify({ count }),
    }),

  restoreHabit: (id: string) =>
    request<StateResponse>(`/habits/${id}/restore`, { method: 'POST' }),

  permanentlyDeleteHabit: (id: string) =>
    request<StateResponse>(`/habits/${id}/permanent`, { method: 'DELETE' }),
};
