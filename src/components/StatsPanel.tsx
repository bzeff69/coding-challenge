import type { Habit } from '../domain/habits/habit.types';
import { getCompletionRate } from '../domain/habits/habit.logic';

export function StatsPanel({ habit }: { habit: Habit }) {
  const rate = getCompletionRate(habit);

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div>
        <div className="text-lg font-bold text-stone-900">{habit.currentStreak}</div>
        <div className="text-[10px] text-stone-400 uppercase tracking-wide">Streak</div>
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">{habit.longestStreak}</div>
        <div className="text-[10px] text-stone-400 uppercase tracking-wide">Best</div>
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">{habit.totalCompletions}</div>
        <div className="text-[10px] text-stone-400 uppercase tracking-wide">Total</div>
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">{rate}%</div>
        <div className="text-[10px] text-stone-400 uppercase tracking-wide">Rate</div>
      </div>
    </div>
  );
}
