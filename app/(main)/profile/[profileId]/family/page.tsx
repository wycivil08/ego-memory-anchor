import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getProfileById } from '@/lib/actions/profile'
import { getFamilyMembers, isProfileOwner } from '@/lib/actions/family'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { MemberList } from '@/components/family/MemberList'

interface FamilyPageProps {
  params: Promise<{ profileId: string }>
}

// Loading skeleton
function FamilyLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-1 gap-4">
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

      {/* Family Section */}
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-stone-800">家庭成员管理</h1>
            <p className="mt-1 text-sm text-stone-500">
              邀请家人加入，一起守护记忆空间
            </p>
          </div>

          {/* Member List */}
          <Suspense fallback={<FamilyLoading />}>
            <MemberList
              members={members}
              isOwner={owner}
              profileId={profileId}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
