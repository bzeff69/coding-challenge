import type { HabitMessage } from '../hooks/useHabits';

export function MessageBanner({ message }: { message?: HabitMessage }) {
  if (!message) return null;

  return (
    <div className="text-sm text-stone-500 dark:text-stone-400 italic min-h-[1.5rem] transition-all">
      {message.text}
    </div>
  );
}
