import type { Habit } from '../domain/habits/habit.types';

export interface StateResponse {
  habits: Habit[];
  deletedHabits: Habit[];
  missedHabitIds: string[];
}

export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null) as { message?: string } | null;
    throw new ApiRequestError(payload?.message ?? `API ${res.status}`, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  getSession: () => request<AuthResponse>('/auth/session'),

  register: (username: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  getState: () => request<StateResponse>('/state'),

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
