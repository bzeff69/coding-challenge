import { useState } from 'react';
import { useHabits } from './hooks/useHabits';
import { useTheme } from './hooks/useTheme';
import { HabitCard } from './components/HabitCard';
import { HabitForm } from './components/HabitForm';
import { EmptyState } from './components/EmptyState';
import { Dashboard } from './components/Dashboard';
import { DeletedHabits } from './components/DeletedHabits';
import type { Habit } from './domain/habits/habit.types';

function App() {
  const {
    habits,
    deletedHabits,
    messages,
    addHabit,
    editHabit,
    deleteHabit,
    restoreHabit,
    permanentlyDeleteHabit,
    increment,
    undo,
    setDayCount,
    getTodayCount,
    loading,
  } = useHabits();

  const { theme, toggle } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showDeletedHabits, setShowDeletedHabits] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = (name: string, target: number, color?: string) => {
    addHabit(name, target, color);
    setShowForm(false);
  };

  const handleEdit = (name: string, target: number, color?: string) => {
    if (editingHabit) {
      editHabit(editingHabit.id, name, target, color);
      setEditingHabit(null);
    }
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="w-9 h-9 shrink-0 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="flame-outer" x1="24" y1="46" x2="24" y2="2" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f59e0b" />
                  <stop offset="0.4" stopColor="#ef4444" />
                  <stop offset="0.75" stopColor="#ec4899" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="flame-inner" x1="24" y1="42" x2="24" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fbbf24" />
                  <stop offset="0.5" stopColor="#fb923c" />
                  <stop offset="1" stopColor="#ef4444" />
                </linearGradient>
                <linearGradient id="flame-core" x1="24" y1="40" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fef3c7" />
                  <stop offset="1" stopColor="#fbbf24" />
                </linearGradient>
                <filter id="flame-glow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {/* Outer flame */}
              <path d="M24 2C24 2 12 14 12 28c0 7.2 5.4 13 12 13s12-5.8 12-13c0-5.5-3-10-6-13.5 0.5 4-2 7.5-5 8.5-2.5 0.8-4.5-0.5-5-3C19.5 17 24 8 24 2z" fill="url(#flame-outer)" filter="url(#flame-glow)" />
              {/* Inner flame — offset right for dynamic feel */}
              <path d="M25 16c0 0-6 7-6 15.5c0 4.5 3 7.5 6 7.5s5.5-3 5.5-7c0-3-1.5-5.5-3-7 0.3 2-1 4-2.5 4.2-1.2 0.2-2.2-0.8-2.3-2.2-0.2-2.5 2.3-7 2.3-11z" fill="url(#flame-inner)" />
              {/* Core — bright center */}
              <path d="M24.5 28c-1.2 0-3 1.8-3 5s1.8 5 3 5 2.8-1.8 2.8-5-1.6-5-2.8-5z" fill="url(#flame-core)" opacity="0.9" />
              {/* Spark accents */}
              <circle cx="18" cy="18" r="1" fill="#fbbf24" opacity="0.7" />
              <circle cx="30" cy="14" r="0.7" fill="#f472b6" opacity="0.6" />
              <circle cx="16" cy="25" r="0.5" fill="#fbbf24" opacity="0.5" />
            </svg>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                Streak
              </h1>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Track habits. Get judged.
              </p>
            </div>
          </div>
          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {deletedHabits.length > 0 && (
              <button
                onClick={() => setShowDeletedHabits(true)}
                className="p-2 rounded-lg text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Deleted habits"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {habits.length > 0 && (
              <button
                onClick={() => setShowDashboard(true)}
                className="p-2 rounded-lg text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Dashboard"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            )}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            {habits.length > 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors font-medium"
              >
                + Add Habit
              </button>
            )}
          </div>

          {/* Mobile menu */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-1 overflow-hidden">
                  {habits.length > 0 && (
                    <button
                      onClick={() => { setShowForm(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Habit
                    </button>
                  )}
                  {habits.length > 0 && (
                    <button
                      onClick={() => { setShowDashboard(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </button>
                  )}
                  {deletedHabits.length > 0 && (
                    <button
                      onClick={() => { setShowDeletedHabits(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Deleted Habits
                    </button>
                  )}
                  <button
                    onClick={() => { toggle(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    {theme === 'light' ? (
                      <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16 text-stone-400 dark:text-stone-500 text-sm">Loading...</div>
        ) : habits.length === 0 ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayCount={getTodayCount(habit)}
                message={messages[habit.id]}
                collapsed={!!collapsed[habit.id]}
                onToggleCollapse={() => toggleCollapse(habit.id)}
                onIncrement={() => increment(habit.id)}
                onUndo={() => undo(habit.id)}
                onEdit={() => openEdit(habit)}
                onDelete={() => deleteHabit(habit.id)}
                onSetDayCount={(date, count) => setDayCount(habit.id, date, count)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add form modal */}
      {showForm && (
        <HabitForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit form modal */}
      {editingHabit && (
        <HabitForm
          onSubmit={handleEdit}
          onCancel={() => setEditingHabit(null)}
          editingHabit={editingHabit}
        />
      )}

      {/* Dashboard */}
      {showDashboard && (
        <Dashboard
          habits={habits}
          deletedHabits={deletedHabits}
          onClose={() => setShowDashboard(false)}
        />
      )}

      {/* Deleted habits */}
      {showDeletedHabits && (
        <DeletedHabits
          habits={deletedHabits}
          onRestore={restoreHabit}
          onPermanentlyDelete={permanentlyDeleteHabit}
          onClose={() => setShowDeletedHabits(false)}
        />
      )}
    </div>
  );
}

export default App;
