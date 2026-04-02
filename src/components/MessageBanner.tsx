import { useState, useEffect, useRef } from 'react';
import type { HabitMessage } from '../hooks/useHabits';

export function MessageBanner({ message }: { message?: HabitMessage }) {
  const [flash, setFlash] = useState(false);
  const prevTimestamp = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!message || message.timestamp === prevTimestamp.current) return;
    prevTimestamp.current = message.timestamp;
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 2500);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      className={`text-sm font-medium italic min-h-[1.5rem] rounded-lg px-3 py-1.5 transition-all duration-700 ${
        flash
          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
          : 'bg-transparent text-stone-500 dark:text-stone-400'
      }`}
    >
      {message.text}
    </div>
  );
}
