export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">
        {/* Card skeleton */}
        <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          {/* Header */}
          <div className="pb-6">
            <div className="mx-auto h-8 w-32 rounded bg-stone-200" />
            <div className="mt-3 mx-auto h-4 w-40 rounded bg-stone-200" />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="h-4 w-12 rounded bg-stone-200" />
              <div className="h-10 w-full rounded-lg bg-stone-200" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-16 rounded bg-stone-200" />
              <div className="h-10 w-full rounded-lg bg-stone-200" />
            </div>
            <div className="mt-6 h-10 w-full rounded-lg bg-stone-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
