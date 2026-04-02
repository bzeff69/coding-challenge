import { useState, useEffect } from 'react';
import type { Habit } from '../domain/habits/habit.types';

interface HabitFormProps {
  onSubmit: (name: string, dailyTarget: number) => void;
  onCancel: () => void;
  editingHabit?: Habit | null;
}

export function HabitForm({ onSubmit, onCancel, editingHabit }: HabitFormProps) {
  const [name, setName] = useState(editingHabit?.name ?? '');
  const [target, setTarget] = useState(editingHabit?.dailyTarget ?? 1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setTarget(editingHabit.dailyTarget);
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
    onSubmit(trimmed, target);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
      >
        <h2 className="text-lg font-semibold text-stone-900 mb-4">
          {editingHabit ? 'Edit Habit' : 'New Habit'}
        </h2>

        <label className="block mb-1 text-sm font-medium text-stone-600">
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
          className="w-full px-3 py-2 border border-stone-300 rounded-lg mb-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
        />

        <label className="block mb-1 text-sm font-medium text-stone-600">
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
          className="w-full px-3 py-2 border border-stone-300 rounded-lg mb-4 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium"
          >
            {editingHabit ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
