import { useState, useCallback } from 'react';
import type { Habit, DateString } from '../domain/habits/habit.types';
import type { HabitMessage } from '../hooks/useHabits';
import { HistoryStrip } from './HistoryStrip';
import { StatsPanel } from './StatsPanel';
import { MessageBanner } from './MessageBanner';
import { FullHistory } from './FullHistory';
import { Confetti } from './Confetti';
import { getColorConfig } from '../utils/colors';

interface HabitCardProps {
  habit: Habit;
  todayCount: number;
  message?: HabitMessage;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onIncrement: () => void;
  onUndo: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetDayCount: (date: DateString, count: number) => void;
}

export function HabitCard({
  habit,
  todayCount,
  message,
  collapsed,
  onToggleCollapse,
  onIncrement,
  onUndo,
  onEdit,
  onDelete,
  onSetDayCount,
}: HabitCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const isComplete = todayCount >= habit.dailyTarget;

  const handleIncrement = useCallback(() => {
    const willComplete = todayCount + 1 >= habit.dailyTarget;
    onIncrement();
    if (willComplete && !isComplete) {
      setShowConfetti(true);
    }
  }, [todayCount, habit.dailyTarget, isComplete, onIncrement]);
  const progress = Math.min((todayCount / habit.dailyTarget) * 100, 100);
  const color = getColorConfig(habit.color);

  if (collapsed) {
    return (
      <div
        className={`bg-white dark:bg-stone-900 rounded-xl border p-3 transition-all cursor-pointer hover:border-stone-300 dark:hover:border-stone-600 ${isComplete ? 'border-emerald-400 dark:border-emerald-600' : 'border-stone-200 dark:border-stone-700'}`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color.bg }} />
          <h3 className="font-medium text-stone-900 dark:text-stone-50 text-sm truncate flex-1">
            {habit.name}
          </h3>
          <span className={`text-sm font-bold tabular-nums ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-600 dark:text-stone-300'}`}>
            {todayCount}/{habit.dailyTarget}
          </span>
          <div className="w-16 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden shrink-0">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: isComplete ? '#10b981' : color.bg }}
            />
          </div>
          {isComplete && (
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white dark:bg-stone-900 rounded-xl border p-5 transition-all ${isComplete ? 'border-emerald-400 dark:border-emerald-600 animate-glow-pulse' : 'border-stone-200 dark:border-stone-700'}`}>
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color.bg }} />
          <div className="min-w-0">
            <h3 className="font-semibold text-stone-900 dark:text-stone-50 text-lg truncate">
              {habit.name}
            </h3>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {habit.dailyTarget}x daily
            </span>
          </div>
        </div>
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors rounded-md hover:bg-stone-100 dark:hover:bg-stone-800"
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors rounded-md hover:bg-stone-100 dark:hover:bg-stone-800"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 text-stone-400 hover:text-red-500 transition-colors rounded-md hover:bg-stone-100 dark:hover:bg-stone-800"
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
                className="px-2 py-1 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
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
          <span className={`text-2xl font-bold tabular-nums ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-50'}`}>
            {todayCount} / {habit.dailyTarget}
          </span>
          {isComplete && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Done
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: isComplete ? '#10b981' : color.bg,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleIncrement}
          disabled={isComplete}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
            isComplete
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
              : 'text-white active:opacity-80'
          }`}
          style={!isComplete ? { backgroundColor: color.bg } : undefined}
          onMouseEnter={(e) => { if (!isComplete) e.currentTarget.style.backgroundColor = color.bgHover; }}
          onMouseLeave={(e) => { if (!isComplete) e.currentTarget.style.backgroundColor = color.bg; }}
        >
          {isComplete ? 'Completed' : todayCount === 0 ? 'Start' : '+1'}
        </button>
        <button
          onClick={onUndo}
          disabled={todayCount === 0}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            todayCount === 0
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300'
          }`}
        >
          Undo
        </button>
      </div>

      {/* Message */}
      <MessageBanner message={message} />

      {/* History strip */}
      <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
        <HistoryStrip
          habit={habit}
          onSetDayCount={onSetDayCount}
          onShowFullHistory={() => setShowFullHistory(true)}
        />
      </div>

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
        <StatsPanel habit={habit} />
      </div>

      {/* Full history modal */}
      {showFullHistory && (
        <FullHistory
          habit={habit}
          onSetDayCount={onSetDayCount}
          onClose={() => setShowFullHistory(false)}
        />
      )}
    </div>
  );
}
