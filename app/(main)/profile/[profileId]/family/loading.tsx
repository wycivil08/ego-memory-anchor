export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="bg-gradient-to-b from-amber-50 to-stone-50 border-b border-stone-200">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="h-24 w-24 rounded-full bg-stone-200 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 rounded bg-stone-200 animate-pulse" />
              <div className="h-4 w-64 rounded bg-stone-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Page header skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-stone-200 animate-pulse" />
            <div className="h-4 w-96 rounded bg-stone-200 animate-pulse" />
          </div>

          {/* Member list skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-stone-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-stone-100 animate-pulse" />
                    <div className="h-3 w-48 rounded bg-stone-100 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
