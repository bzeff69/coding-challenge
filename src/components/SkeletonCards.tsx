export function SkeletonCards() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-3 h-3 rounded-full skeleton-shimmer" />
            <div className="h-5 w-32 rounded-md skeleton-shimmer" />
          </div>
          {/* Count */}
          <div className="mb-3">
            <div className="h-7 w-16 rounded-md skeleton-shimmer mb-2" />
            <div className="h-2 w-full rounded-full skeleton-shimmer" />
          </div>
          {/* Buttons */}
          <div className="flex gap-2 mb-3">
            <div className="h-10 flex-1 rounded-lg skeleton-shimmer" />
            <div className="h-10 w-16 rounded-lg skeleton-shimmer" />
          </div>
          {/* History */}
          <div className="flex gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <div key={d} className="w-8 h-8 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
