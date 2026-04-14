export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
        <div className="space-y-6">
          {/* Back link skeleton */}
          <div className="h-5 w-24 animate-pulse rounded bg-stone-200" />

          {/* Memory detail skeleton */}
          <div className="space-y-4">
            <div className="aspect-[4/3] animate-pulse rounded-xl bg-stone-200" />

            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
            </div>
          </div>

          {/* Annotation skeleton */}
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="h-5 w-20 animate-pulse rounded bg-stone-100" />
            <div className="mt-3 h-24 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      </div>
    </div>
  )
}
