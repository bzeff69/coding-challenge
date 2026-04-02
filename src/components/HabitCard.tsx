import { useState } from 'react';
import type { Habit } from '../domain/habits/habit.types';
import type { HabitMessage } from '../hooks/useHabits';
import { HistoryStrip } from './HistoryStrip';
import { StatsPanel } from './StatsPanel';
import { MessageBanner } from './MessageBanner';

interface HabitCardProps {
  habit: Habit;
  todayCount: number;
  message?: HabitMessage;
  onIncrement: () => void;
  onUndo: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function HabitCard({
  habit,
  todayCount,
  message,
  onIncrement,
  onUndo,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const isComplete = todayCount >= habit.dailyTarget;
  const progress = Math.min((todayCount / habit.dailyTarget) * 100, 100);

  return (
    <div className={`bg-white rounded-xl border p-5 transition-all ${isComplete ? 'border-emerald-300 shadow-sm' : 'border-stone-200'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 text-lg truncate">
            {habit.name}
          </h3>
          <span className="text-xs text-stone-400">
            {habit.dailyTarget}x daily
          </span>
        </div>
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors rounded-md hover:bg-stone-100"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 text-stone-400 hover:text-red-500 transition-colors rounded-md hover:bg-stone-100"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={onDelete}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-2 py-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar + count */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-2xl font-bold tabular-nums ${isComplete ? 'text-emerald-600' : 'text-stone-900'}`}>
            {todayCount} / {habit.dailyTarget}
          </span>
          {isComplete && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Done
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-emerald-500' : 'bg-amber-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={onIncrement}
          disabled={isComplete}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
            isComplete
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : 'bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-700'
          }`}
        >
          {isComplete ? 'Completed' : todayCount === 0 ? 'Start' : '+1'}
        </button>
        <button
          onClick={onUndo}
          disabled={todayCount === 0}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            todayCount === 0
              ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 active:bg-stone-300'
          }`}
        >
          Undo
        </button>
      </div>

      {/* Message */}
      <MessageBanner message={message} />

      {/* History strip */}
      <div className="mt-3 pt-3 border-t border-stone-100">
        <HistoryStrip habit={habit} />
      </div>

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-stone-100">
        <StatsPanel habit={habit} />
      </div>
    </div>
  );
}
