import { useState, useEffect } from 'react';
import type { Habit } from '../domain/habits/habit.types';
import { COLOR_KEYS, HABIT_COLORS, type HabitColor } from '../utils/colors';

interface HabitFormProps {
  onSubmit: (name: string, dailyTarget: number, color?: string) => void;
  onCancel: () => void;
  editingHabit?: Habit | null;
}

export function HabitForm({ onSubmit, onCancel, editingHabit }: HabitFormProps) {
  const [name, setName] = useState(editingHabit?.name ?? '');
  const [target, setTarget] = useState(editingHabit?.dailyTarget ?? 1);
  const [color, setColor] = useState<HabitColor>((editingHabit?.color as HabitColor) ?? 'indigo');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setTarget(editingHabit.dailyTarget);
      setColor((editingHabit.color as HabitColor) ?? 'indigo');
    }
  }, [editingHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required.');
      return;
    }
    if (target < 1 || target > 10) {
      setError('Daily target must be between 1 and 10.');
      return;
    }
    onSubmit(trimmed, target, color);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-stone-900 rounded-xl shadow-xl p-6 w-full max-w-md"
      >
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-4">
          {editingHabit ? 'Edit Habit' : 'New Habit'}
        </h2>

        <label className="block mb-1 text-sm font-medium text-stone-600 dark:text-stone-400">
          Habit name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="e.g. Drink water"
          autoFocus
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg mb-4 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-stone-400 dark:placeholder:text-stone-500"
        />

        <label className="block mb-1 text-sm font-medium text-stone-600 dark:text-stone-400">
          Daily target
        </label>
        <input
          type="number"
          value={target}
          onChange={(e) => {
            setTarget(Math.max(1, Math.min(10, Number(e.target.value) || 1)));
            setError('');
          }}
          min={1}
          max={10}
          className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg mb-4 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <label className="block mb-1.5 text-sm font-medium text-stone-600 dark:text-stone-400">
          Color
        </label>
        <div className="flex gap-2 mb-4 flex-wrap">
          {COLOR_KEYS.map((key) => {
            const cfg = HABIT_COLORS[key];
            const selected = color === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setColor(key)}
                className={`w-8 h-8 rounded-full transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-stone-900' : 'hover:scale-110'}`}
                style={{
                  backgroundColor: cfg.swatch,
                  ringColor: selected ? cfg.swatch : undefined,
                }}
                title={cfg.name}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-white rounded-lg transition-colors font-medium"
            style={{ backgroundColor: HABIT_COLORS[color].bg }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = HABIT_COLORS[color].bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = HABIT_COLORS[color].bg)}
          >
            {editingHabit ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
