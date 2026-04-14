export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-gradient-to-b from-amber-50 to-stone-50 border-b border-stone-200">
        <div className="p-6 lg:p-8 animate-pulse">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="h-24 w-24 rounded-full bg-stone-200" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 rounded bg-stone-200" />
              <div className="h-4 w-64 rounded bg-stone-200" />
              <div className="h-4 w-32 rounded bg-stone-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-8">
        <div className="space-y-4">
          <div className="h-8 w-32 rounded bg-stone-200" />
          <div className="h-12 w-full rounded-lg bg-stone-200" />
        </div>

        <div className="space-y-4">
          <div className="h-6 w-48 rounded bg-stone-200" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full rounded-lg bg-stone-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
