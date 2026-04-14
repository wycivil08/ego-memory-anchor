export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-stone-200">
        <div className="p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <div className="h-5 w-24 animate-pulse rounded bg-stone-200" />
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-stone-200" />
            <div className="space-y-2">
              <div className="h-6 w-32 animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-stone-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline skeleton */}
      <div className="p-6 lg:p-8">
        <div className="space-y-4">
          {/* Filters skeleton */}
          <div className="h-12 animate-pulse rounded-xl border border-stone-200 bg-white" />

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-stone-200 bg-white p-3"
              >
                <div className="aspect-[4/3] rounded-lg bg-stone-100" />
                <div className="mt-3 h-4 w-24 rounded bg-stone-100" />
                <div className="mt-2 h-3 w-16 rounded bg-stone-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
