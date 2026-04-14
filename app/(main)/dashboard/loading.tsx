export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded bg-stone-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-stone-200" />
        </div>
        <div className="h-10 w-48 animate-pulse rounded-xl bg-stone-200" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-stone-200 bg-white p-4"
          >
            <div className="aspect-[4/3] rounded-lg bg-stone-100" />
            <div className="mt-4 h-5 w-32 rounded bg-stone-100" />
            <div className="mt-2 h-4 w-24 rounded bg-stone-100" />
            <div className="mt-3 h-3 w-full rounded bg-stone-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
