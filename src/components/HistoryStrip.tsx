import { useState } from 'react';
import type { Habit, DateString } from '../domain/habits/habit.types';
import { getLastNDates, getTodayDateString, getDayLabel, offsetDateString, formatShortDate } from '../utils/dates';
import { getDayStatus, type DayStatus } from '../domain/habits/habit.logic';
import { getColorConfig } from '../utils/colors';

const baseStyles: Record<DayStatus, string> = {
  complete: 'bg-emerald-500 text-white',
  'in-progress': 'text-white',
  missed: 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500',
  'today-empty': 'border-2 border-dashed border-stone-300 dark:border-stone-600 text-stone-400 dark:text-stone-500',
};

interface HistoryStripProps {
  habit: Habit;
  onSetDayCount: (date: DateString, count: number) => void;
  onShowFullHistory: () => void;
}

export function HistoryStrip({ habit, onSetDayCount, onShowFullHistory }: HistoryStripProps) {
  const today = getTodayDateString();
  const [weekOffset, setWeekOffset] = useState(0);
  const [editingDate, setEditingDate] = useState<DateString | null>(null);

  const endDate = offsetDateString(today, weekOffset * 7);
  const dates = getLastNDates(endDate, 7);
  const color = getColorConfig(habit.color);
  const isCurrentWeek = weekOffset === 0;

  const rangeStart = formatShortDate(dates[0]);
  const rangeEnd = formatShortDate(dates[dates.length - 1]);

  const handleDayClick = (date: DateString) => {
    if (editingDate === date) {
      setEditingDate(null);
    } else {
      setEditingDate(date);
    }
  };

  const currentCount = (date: DateString) => habit.dayRecords[date]?.count ?? 0;

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded transition-colors"
          title="Previous week"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
          {rangeStart} — {rangeEnd}
        </span>
        <div className="flex items-center gap-1">
          {!isCurrentWeek && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[10px] px-1.5 py-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
            disabled={isCurrentWeek}
            className={`p-1 rounded transition-colors ${isCurrentWeek ? 'text-stone-200 dark:text-stone-700 cursor-not-allowed' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
            title="Next week"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day cells */}
      <div className="flex gap-1.5">
        {dates.map((date) => {
          const status = getDayStatus(habit, date, today);
          const label = getDayLabel(date);
          const isToday = date === today && isCurrentWeek;
          const isFuture = date > today;

          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-medium">
                {isToday ? 'Today' : label}
              </span>
              <button
                onClick={() => !isFuture && handleDayClick(date)}
                disabled={isFuture}
                className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-all ${baseStyles[status]} ${!isFuture ? 'cursor-pointer hover:ring-2 hover:ring-stone-300 dark:hover:ring-stone-600' : 'opacity-30 cursor-not-allowed'} ${editingDate === date ? 'ring-2 ring-stone-400 dark:ring-stone-500' : ''}`}
                style={status === 'in-progress' ? { backgroundColor: color.bg } : undefined}
                title={`${date}: ${status}`}
              >
                {status === 'complete' && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {status === 'in-progress' && '~'}
                {status === 'missed' && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {status === 'today-empty' && '-'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Inline day editor */}
      {editingDate && (
        <div className="mt-2 flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <span className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
            {formatShortDate(editingDate)}:
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: habit.dailyTarget + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  onSetDayCount(editingDate, i);
                  setEditingDate(null);
                }}
                className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${
                  currentCount(editingDate) === i
                    ? 'text-white ring-2 ring-offset-1 ring-offset-stone-50 dark:ring-offset-stone-800'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
                }`}
                style={
                  currentCount(editingDate) === i
                    ? { backgroundColor: i >= habit.dailyTarget ? '#10b981' : i > 0 ? color.bg : undefined, ringColor: i > 0 ? color.bg : undefined }
                    : undefined
                }
              >
                {i}
              </button>
            ))}
          </div>
          <button
            onClick={() => setEditingDate(null)}
            className="ml-auto text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          >
            Close
          </button>
        </div>
      )}

      {/* Full history link */}
      <button
        onClick={onShowFullHistory}
        className="mt-2 text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
      >
        View full history
      </button>
    </div>
  );
}
