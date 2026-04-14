import Link from 'next/link'
import { getProfiles } from '@/lib/actions/profile'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const profiles = await getProfiles()

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-stone-800">我的记忆空间</h1>
          <p className="mt-1 text-sm text-stone-500">
            在这里守护关于 TA 的真实记忆
          </p>
        </div>
        <Link href="/profile/new">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors duration-150">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            创建新的记忆空间
          </Button>
        </Link>
      </div>

      {/* Content */}
      {profiles.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
            <svg
              className="h-8 w-8 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-stone-700">
            还没有记忆空间
          </h2>
          <p className="mt-1 max-w-sm text-sm text-stone-500">
            为 TA创建一个记忆空间，守护那些珍贵的真实记忆
          </p>
          <Link href="/profile/new" className="mt-6">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors duration-150">
              为 TA 创建第一个记忆空间
            </Button>
          </Link>
        </div>
      ) : (
        /* Profile Grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  )
}
