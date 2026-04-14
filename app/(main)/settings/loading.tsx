export default function SettingsLoading() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-32 rounded bg-stone-200 animate-pulse" />
        <div className="mt-2 h-4 w-48 rounded bg-stone-200 animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-6 max-w-2xl">
        {/* Password section skeleton */}
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="h-6 w-24 rounded bg-stone-200 animate-pulse mb-2" />
          <div className="h-4 w-36 rounded bg-stone-200 animate-pulse mb-6" />
          <div className="space-y-4">
            <div className="h-10 w-full rounded-md bg-stone-200 animate-pulse" />
            <div className="h-10 w-full rounded-md bg-stone-200 animate-pulse" />
            <div className="h-10 w-full rounded-md bg-stone-200 animate-pulse" />
            <div className="h-10 w-24 rounded-md bg-stone-200 animate-pulse" />
          </div>
        </div>

        {/* Export section skeleton */}
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="h-6 w-24 rounded bg-stone-200 animate-pulse mb-2" />
          <div className="h-4 w-48 rounded bg-stone-200 animate-pulse mb-6" />
          <div className="h-4 w-full rounded bg-stone-200 animate-pulse mb-4" />
          <div className="h-4 w-3/4 rounded bg-stone-200 animate-pulse" />
        </div>

        {/* Help section skeleton */}
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="h-6 w-24 rounded bg-stone-200 animate-pulse mb-2" />
          <div className="h-4 w-36 rounded bg-stone-200 animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-stone-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-stone-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-stone-200 animate-pulse" />
          </div>
        </div>

        {/* Danger zone skeleton */}
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <div className="h-6 w-24 rounded bg-stone-200 animate-pulse mb-2" />
          <div className="h-4 w-48 rounded bg-stone-200 animate-pulse mb-6" />
          <div className="h-4 w-full rounded bg-stone-200 animate-pulse mb-4" />
          <div className="h-4 w-full rounded bg-stone-200 animate-pulse mb-4" />
          <div className="h-4 w-3/4 rounded bg-stone-200 animate-pulse mb-4" />
          <div className="h-4 w-full rounded bg-stone-200 animate-pulse mb-4" />
          <div className="h-10 w-32 rounded-md bg-stone-200 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
