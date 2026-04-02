import type { Habit } from '../domain/habits/habit.types';
import { getLastNDates, getTodayDateString, getDayLabel } from '../utils/dates';
import { getDayStatus } from '../domain/habits/habit.logic';

const statusStyles = {
  complete: 'bg-emerald-500 text-white',
  'in-progress': 'bg-amber-400 text-stone-900',
  missed: 'bg-stone-200 text-stone-400',
  'today-empty': 'border-2 border-dashed border-stone-300 text-stone-400',
};

export function HistoryStrip({ habit }: { habit: Habit }) {
  const today = getTodayDateString();
  const dates = getLastNDates(today, 7);

  return (
    <div className="flex gap-1.5">
      {dates.map((date) => {
        const status = getDayStatus(habit, date, today);
        const label = getDayLabel(date);
        const isToday = date === today;

        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-stone-400 uppercase font-medium">
              {isToday ? 'Today' : label}
            </span>
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium ${statusStyles[status]}`}
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
