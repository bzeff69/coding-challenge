export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">~</div>
      <h2 className="text-xl font-medium text-stone-700 dark:text-stone-300 mb-2">
        No habits yet. Chaos remains undefeated.
      </h2>
      <p className="text-stone-500 mb-6 max-w-sm">
        Start tracking something. Anything. Even &quot;drink water&quot; counts as ambition around here.
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium"
      >
        Add your first habit
      </button>
    </div>
  );
}
