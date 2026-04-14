import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getProfileById } from '@/lib/actions/profile'
import { fetchTimelineDataAction, fetchAllMemoriesForTagsAction } from '@/lib/actions/timeline'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { TimelineContainer } from '@/components/timeline/TimelineContainer'
import { TimelineFilters } from '@/components/timeline/TimelineFilters'
import { TimelineEmpty } from '@/components/timeline/TimelineEmpty'

interface ProfilePageProps {
  params: Promise<{ profileId: string }>
}

// Loading skeleton
function TimelineLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-stone-200 bg-white p-3">
            <div className="aspect-[4/3] rounded-lg bg-stone-100" />
            <div className="mt-3 h-4 w-24 rounded bg-stone-100" />
            <div className="mt-2 h-3 w-16 rounded bg-stone-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Timeline content with filters
async function TimelineContent({
  profileId,
  profile,
}: {
  profileId: string
  profile: NonNullable<Awaited<ReturnType<typeof getProfileById>>>
}) {
  // Get all memories (no filters) for tags
  const allMemories = await fetchAllMemoriesForTagsAction(profileId)

  // Extract unique tags
  const tagSet = new Set<string>()
  for (const memory of allMemories) {
    for (const tag of memory.tags) {
      tagSet.add(tag)
    }
  }
  const availableTags = Array.from(tagSet).sort()

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <TimelineFilters availableTags={availableTags} />
      </div>

      {/* Timeline - will be rendered client-side with filters */}
      <TimelineContainer profileId={profileId} profile={profile} />
    </div>
  )
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { profileId } = await params

  const profile = await getProfileById(profileId)

  if (!profile) {
    notFound()
  }

  // Check if profile has any memories
  const hasMemories = profile.memory_count > 0

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Timeline Section */}
      <div className="p-6 lg:p-8">
        {hasMemories ? (
          <Suspense fallback={<TimelineLoading />}>
            <TimelineContent profileId={profileId} profile={profile} />
          </Suspense>
        ) : (
          <TimelineEmpty profileId={profileId} />
        )}
      </div>
    </div>
  )
}
