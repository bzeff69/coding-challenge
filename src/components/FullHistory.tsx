import { useState } from 'react';
import type { Habit, DateString } from '../domain/habits/habit.types';
import { getLastNDates, getTodayDateString, getDayLabel, formatShortDate } from '../utils/dates';
import { getDayStatus, type DayStatus } from '../domain/habits/habit.logic';
import { getColorConfig } from '../utils/colors';

const statusStyles: Record<DayStatus, string> = {
  complete: 'bg-emerald-500 text-white',
  'in-progress': 'text-white',
  missed: 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500',
  'today-empty': 'border-2 border-dashed border-stone-300 dark:border-stone-600 text-stone-400 dark:text-stone-500',
};

interface FullHistoryProps {
  habit: Habit;
  onSetDayCount: (date: DateString, count: number) => void;
  onClose: () => void;
}

export function FullHistory({ habit, onSetDayCount, onClose }: FullHistoryProps) {
  const today = getTodayDateString();
  const dates = getLastNDates(today, 90);
  const color = getColorConfig(habit.color);
  const [editingDate, setEditingDate] = useState<DateString | null>(null);

  const currentCount = (date: DateString) => habit.dayRecords[date]?.count ?? 0;

  // Group dates into weeks (rows of 7)
  const weeks: DateString[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              {habit.name} — History
            </h2>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              Last 90 days. Click any day to edit.
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

        {/* Legend */}
        <div className="flex gap-3 mb-3 text-[10px] text-stone-400 dark:text-stone-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Complete</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color.bg }} /> In progress</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-stone-200 dark:bg-stone-700" /> Missed</span>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="mb-1.5">
              <div className="text-[10px] text-stone-400 dark:text-stone-500 mb-0.5 font-medium">
                {formatShortDate(week[0])}
              </div>
              <div className="flex gap-1">
                {week.map((date) => {
                  const status = getDayStatus(habit, date, today);
                  const isFuture = date > today;
                  const isToday = date === today;

                  return (
                    <button
                      key={date}
                      onClick={() => !isFuture && setEditingDate(editingDate === date ? null : date)}
                      disabled={isFuture}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-medium transition-all ${statusStyles[status]} ${!isFuture ? 'cursor-pointer hover:ring-2 hover:ring-stone-300 dark:hover:ring-stone-600' : 'opacity-20 cursor-not-allowed'} ${editingDate === date ? 'ring-2 ring-stone-500' : ''} ${isToday ? 'ring-1 ring-stone-400 dark:ring-stone-500' : ''}`}
                      style={status === 'in-progress' ? { backgroundColor: color.bg } : undefined}
                      title={`${date} — ${getDayLabel(date)}: ${currentCount(date)}/${habit.dailyTarget}`}
                    >
                      {status === 'complete' && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {status === 'in-progress' && currentCount(date)}
                      {status === 'missed' && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {status === 'today-empty' && '-'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Inline editor */}
        {editingDate && (
          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap font-medium">
              {formatShortDate(editingDate)} ({getDayLabel(editingDate)}):
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
                      ? 'text-white ring-2 ring-offset-1 ring-offset-white dark:ring-offset-stone-900'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
                  }`}
                  style={
                    currentCount(editingDate) === i
                      ? { backgroundColor: i >= habit.dailyTarget ? '#10b981' : i > 0 ? color.bg : undefined }
                      : undefined
                  }
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
