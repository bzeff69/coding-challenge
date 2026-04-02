import type { AppState } from './habit.types';

const STORAGE_KEY = 'streak-habit-tracker';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { habits: [] };
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.habits)) {
      return parsed as AppState;
    }
    return { habits: [] };
  } catch {
    return { habits: [] };
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — silent fail
  }
}
