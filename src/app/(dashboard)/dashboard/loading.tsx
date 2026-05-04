export default function Loading() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header skeleton */}
      <div className="h-10 w-64 bg-surface2 rounded-xl animate-pulse" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
            <div className="h-3 w-24 bg-surface2 rounded animate-pulse" />
            <div className="h-8 w-16 bg-surface2 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Featured task */}
      <div className="bg-surface2 rounded-xl border border-border p-8 flex gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-20 bg-border rounded animate-pulse" />
          <div className="h-7 w-80 bg-border rounded animate-pulse" />
          <div className="h-4 w-full max-w-md bg-border rounded animate-pulse" />
        </div>
        <div className="h-12 w-40 bg-border rounded-xl animate-pulse shrink-0" />
      </div>

      {/* Sessions table */}
      <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
        <div className="h-5 w-36 bg-surface2 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-surface2 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
