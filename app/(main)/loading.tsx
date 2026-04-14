export default function MainLoading() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop Sidebar Skeleton - hidden on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-stone-200 bg-white px-6 pb-4">
          {/* Logo area */}
          <div className="flex h-16 items-center">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-stone-200" />
            <div className="ml-3 h-5 w-16 animate-pulse rounded bg-stone-200" />
          </div>
          {/* Nav items */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-1">
              {[1, 2, 3, 4].map((i) => (
                <li key={i}>
                  <div className="group flex items-center gap-x-3 rounded-lg p-2">
                    <div className="h-5 w-5 animate-pulse rounded bg-stone-200" />
                    <div className="h-4 w-20 animate-pulse rounded bg-stone-200" />
                  </div>
                </li>
              ))}
            </ul>
          </nav>
          {/* User section */}
          <div className="flex items-center gap-x-3 p-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Mobile Header Skeleton - hidden on desktop */}
        <div className="lg:hidden">
          <div className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 animate-pulse rounded-lg bg-stone-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-stone-200" />
            </div>
            <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200" />
          </div>
        </div>

        {/* Page content skeleton */}
        <main className="p-4 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {/* Page header skeleton */}
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-48 animate-pulse rounded bg-stone-200" />
                <div className="h-4 w-64 animate-pulse rounded bg-stone-200" />
              </div>
              <div className="h-10 w-32 animate-pulse rounded-xl bg-stone-200" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-6">
              {/* Card skeleton */}
              <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-stone-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
                    <div className="h-3 w-48 animate-pulse rounded bg-stone-200" />
                  </div>
                </div>
              </div>

              {/* Grid skeleton */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
        </main>
      </div>

      {/* Mobile Bottom Nav Skeleton - hidden on desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white lg:hidden">
        <div className="flex h-16 items-center justify-around">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 p-2">
              <div className="h-6 w-6 animate-pulse rounded bg-stone-200" />
              <div className="h-3 w-8 animate-pulse rounded bg-stone-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
