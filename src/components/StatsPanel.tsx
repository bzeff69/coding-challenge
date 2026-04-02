import type { Habit } from '../domain/habits/habit.types';
import { getCompletionRate } from '../domain/habits/habit.logic';

export function StatsPanel({ habit }: { habit: Habit }) {
  const rate = getCompletionRate(habit);
  const totalTracked = Object.keys(habit.dayRecords).length;

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div>
        <div className="text-lg font-bold text-stone-900 dark:text-stone-50">{habit.currentStreak}</div>
        <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">Streak</div>
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900 dark:text-stone-50">{habit.longestStreak}</div>
        <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">Best</div>
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900 dark:text-stone-50">{habit.totalCompletions}</div>
        <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">Completed</div>
      </div>
      <div title={`${habit.totalCompletions} of ${totalTracked} tracked days completed`}>
        <div className="text-lg font-bold text-stone-900 dark:text-stone-50">{rate}%</div>
        <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide">Success</div>
      </div>
    </div>
  );
}
