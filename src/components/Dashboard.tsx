import { useState } from 'react';
import type { Habit } from '../domain/habits/habit.types';
import { getCompletionRate } from '../domain/habits/habit.logic';
import { getColorConfig } from '../utils/colors';
import { getLastNDates, getTodayDateString, getDayLabel } from '../utils/dates';

interface DashboardProps {
  habits: Habit[];
  deletedHabits: Habit[];
  onClose: () => void;
}

function getHabitStats(habit: Habit) {
  const records = Object.values(habit.dayRecords);
  const totalActions = records.reduce((sum, r) => sum + r.count, 0);
  return {
    totalActions,
    trackedDays: records.length,
    completedDays: habit.totalCompletions,
    rate: getCompletionRate(habit),
  };
}

export function Dashboard({ habits, deletedHabits, onClose }: DashboardProps) {
  const [showDeleted, setShowDeleted] = useState(false);
  const today = getTodayDateString();
  const last30 = getLastNDates(today, 30);

  const allHabits = showDeleted ? [...habits, ...deletedHabits] : habits;
  const activeHabits = habits;

  // Aggregate stats
  const totalCompletions = allHabits.reduce((s, h) => s + h.totalCompletions, 0);
  const totalActions = allHabits.reduce((s, h) => {
    return s + Object.values(h.dayRecords).reduce((a, r) => a + r.count, 0);
  }, 0);
  const bestStreak = allHabits.reduce((s, h) => Math.max(s, h.longestStreak), 0);
  const avgRate = allHabits.length > 0
    ? Math.round(allHabits.reduce((s, h) => s + getCompletionRate(h), 0) / allHabits.length)
    : 0;

  // Today's overview
  const todayCompleted = activeHabits.filter(h => {
    const rec = h.dayRecords[today];
    return rec && rec.completed;
  }).length;

  // 30-day heatmap data
  const heatmapData = last30.map(date => {
    let completed = 0;
    let total = allHabits.length;
    for (const h of allHabits) {
      const rec = h.dayRecords[date];
      if (rec && rec.completed) completed++;
    }
    return { date, completed, total, ratio: total > 0 ? completed / total : 0 };
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
              Dashboard
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-stone-400 dark:text-stone-500 mb-4">
            Your habit tracking overview
          </p>

          {/* Deleted toggle */}
          {deletedHabits.length > 0 && (
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors font-medium mb-4 ${showDeleted ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'}`}
            >
              {showDeleted ? `Hiding ${deletedHabits.length} deleted` : `Show ${deletedHabits.length} deleted`}
            </button>
          )}
        </div>

        {/* Top stats */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Today" value={`${todayCompleted}/${activeHabits.length}`} sub="habits done" gradient="from-emerald-500 to-teal-600" />
            <StatCard label="Total Completions" value={String(totalCompletions)} sub="days completed" gradient="from-indigo-500 to-violet-600" />
            <StatCard label="Best Streak" value={String(bestStreak)} sub="consecutive days" gradient="from-amber-500 to-orange-600" />
            <StatCard label="Avg Success" value={`${avgRate}%`} sub="completion rate" gradient="from-rose-500 to-pink-600" />
          </div>
        </div>

        {/* 30-day heatmap */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Last 30 Days
          </h3>
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4">
            <div className="flex gap-[3px] flex-wrap">
              {heatmapData.map(({ date, ratio }) => (
                <div
                  key={date}
                  className="w-[18px] h-[18px] rounded-sm transition-colors"
                  style={{
                    backgroundColor: ratio === 0
                      ? 'var(--heat-empty)'
                      : ratio < 0.5
                      ? 'var(--heat-low)'
                      : ratio < 1
                      ? 'var(--heat-mid)'
                      : 'var(--heat-full)',
                  }}
                  title={`${getDayLabel(date)} ${date}: ${Math.round(ratio * 100)}% complete`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400 dark:text-stone-500">
              <span>Less</span>
              <div className="flex gap-[2px]">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heat-empty)' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heat-low)' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heat-mid)' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heat-full)' }} />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Activity counter */}
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 rounded-xl p-4 text-center">
            <div className="text-4xl font-black text-stone-900 dark:text-stone-50 tabular-nums">
              {totalActions.toLocaleString()}
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              total actions tracked
            </div>
          </div>
        </div>

        {/* Per-habit breakdown */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Per Habit
          </h3>
          <div className="space-y-2">
            {allHabits.map((habit) => {
              const stats = getHabitStats(habit);
              const color = getColorConfig(habit.color);
              const isDeleted = deletedHabits.some(d => d.id === habit.id);

              return (
                <div
                  key={habit.id}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 ${isDeleted ? 'opacity-50' : ''}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color.bg }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {habit.name}
                      </span>
                      {isDeleted && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 shrink-0">
                          deleted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${stats.rate}%`, backgroundColor: color.bg }}
                        />
                      </div>
                      <span className="text-xs text-stone-400 dark:text-stone-500 tabular-nums shrink-0 w-8 text-right">
                        {stats.rate}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {stats.completedDays}
                    </div>
                    <div className="text-[10px] text-stone-400 dark:text-stone-500">days</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {habit.longestStreak}
                    </div>
                    <div className="text-[10px] text-stone-400 dark:text-stone-500">best</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, gradient }: { label: string; value: string; sub: string; gradient: string }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-3 text-white`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80 font-medium">{label}</div>
      <div className="text-2xl font-black mt-1 tabular-nums">{value}</div>
      <div className="text-[11px] opacity-70 mt-0.5">{sub}</div>
    </div>
  );
}
