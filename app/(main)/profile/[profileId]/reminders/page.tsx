import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProfileById } from '@/lib/actions/profile'
import { getRemindersByProfile } from '@/lib/actions/reminder'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { RemindersClient } from './RemindersClient'

interface RemindersPageProps {
  params: Promise<{ profileId: string }>
}

export default async function RemindersPage({ params }: RemindersPageProps) {
  const { profileId } = await params
  const profile = await getProfileById(profileId)

  if (!profile) {
    notFound()
  }

  const reminders = await getRemindersByProfile(profileId)

  return (
    <div className="min-h-screen bg-stone-50">
      <ProfileHeader profile={profile} />

      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/profile/${profileId}`}
            className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回时间线
          </Link>
          <h1 className="text-2xl font-medium text-stone-800">纪念日提醒</h1>
          <p className="mt-1 text-sm text-stone-500">
            设置重要的纪念日提醒，不让它们被遗忘
          </p>
        </div>

        {/* Reminders Client Component */}
        <RemindersClient profileId={profileId} initialReminders={reminders} />
      </div>
    </div>
  )
}
