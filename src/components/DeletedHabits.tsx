import { useState } from 'react';
import type { Habit } from '../domain/habits/habit.types';
import { getCompletionRate } from '../domain/habits/habit.logic';
import { getColorConfig } from '../utils/colors';

interface DeletedHabitsProps {
  habits: Habit[];
  onRestore: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
  onClose: () => void;
}

export function DeletedHabits({ habits, onRestore, onPermanentlyDelete, onClose }: DeletedHabitsProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-6 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Deleted Habits</h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              {habits.length === 0 ? 'Nothing here. Your habits are safe.' : 'Restore or permanently remove habits.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {habits.length === 0 ? (
            <div className="text-center py-12 text-stone-400 dark:text-stone-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p className="text-sm">The bin is empty. Nothing to see here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => {
                const color = getColorConfig(habit.color);
                const rate = getCompletionRate(habit);
                const isConfirming = confirmId === habit.id;

                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800"
                  >
                    <div className="w-3 h-3 rounded-full shrink-0 opacity-50" style={{ backgroundColor: color.bg }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
                        {habit.name}
                      </div>
                      <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                        {habit.totalCompletions} days completed &middot; {rate}% success &middot; best streak {habit.longestStreak}
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => { onPermanentlyDelete(habit.id); setConfirmId(null); }}
                          className="px-2.5 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2.5 py-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => onRestore(habit.id)}
                          className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => setConfirmId(habit.id)}
                          className="px-2.5 py-1.5 text-xs text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"
                          title="Permanently delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
