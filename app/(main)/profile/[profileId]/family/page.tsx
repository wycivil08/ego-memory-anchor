import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getProfileById } from '@/lib/actions/profile'
import { getFamilyMembers, isProfileOwner } from '@/lib/actions/family'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { FamilyPageClient } from './FamilyPageClient'

interface FamilyPageProps {
  params: Promise<{ profileId: string }>
}

// Loading skeleton
function FamilyLoading() {
  return (
    <div className="min-h-screen">
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
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-2 mb-6">
            <div className="h-8 w-48 rounded bg-stone-200 animate-pulse" />
            <div className="h-4 w-96 rounded bg-stone-200 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-stone-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-stone-100" />
                    <div className="h-3 w-48 rounded bg-stone-100" />
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

export default async function FamilyPage({ params }: FamilyPageProps) {
  const { profileId } = await params

  // Fetch profile and family data in parallel
  const [profile, members, owner] = await Promise.all([
    getProfileById(profileId),
    getFamilyMembers(profileId),
    isProfileOwner(profileId),
  ])

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header (readonly) */}
      <ProfileHeader profile={profile} />

      {/* Family Section - Client component for interactivity */}
      <Suspense fallback={<FamilyLoading />}>
        <FamilyPageClient
          profile={profile}
          members={members}
          isOwner={owner}
          profileId={profileId}
        />
      </Suspense>
    </div>
  )
}
