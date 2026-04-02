import { useState } from 'react';
import { useHabits } from './hooks/useHabits';
import { HabitCard } from './components/HabitCard';
import { HabitForm } from './components/HabitForm';
import { EmptyState } from './components/EmptyState';
import type { Habit } from './domain/habits/habit.types';

function App() {
  const {
    habits,
    messages,
    addHabit,
    editHabit,
    deleteHabit,
    increment,
    undo,
    getTodayCount,
  } = useHabits();

  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const handleAdd = (name: string, target: number) => {
    addHabit(name, target);
    setShowForm(false);
  };

  const handleEdit = (name: string, target: number) => {
    if (editingHabit) {
      editHabit(editingHabit.id, name, target);
      setEditingHabit(null);
    }
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Streak
            </h1>
            <p className="text-xs text-stone-400">
              Track habits. Get judged.
            </p>
          </div>
          {habits.length > 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors font-medium"
            >
              + Add Habit
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {habits.length === 0 ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayCount={getTodayCount(habit)}
                message={messages[habit.id]}
                onIncrement={() => increment(habit.id)}
                onUndo={() => undo(habit.id)}
                onEdit={() => openEdit(habit)}
                onDelete={() => deleteHabit(habit.id)}
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
    </div>
  );
}

export default App;
