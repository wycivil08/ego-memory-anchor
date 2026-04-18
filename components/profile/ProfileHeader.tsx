import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ProfileWithMemoryCount } from '@/lib/types'
import { RELATIONSHIP_LABELS } from '@/lib/types'

interface ProfileHeaderProps {
  profile: ProfileWithMemoryCount
  className?: string
}

export function ProfileHeader({ profile, className }: ProfileHeaderProps) {
  const relationshipLabel = RELATIONSHIP_LABELS[profile.relationship] || profile.relationship

  // Format date for display
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format date range
  const formatDateRange = (): string => {
    const birth = profile.birth_date ? formatDate(profile.birth_date) : null
    const death = profile.death_date ? formatDate(profile.death_date) : null

    if (birth && death) {
      return `${birth} — ${death}`
    }
    if (birth) {
      return `出生于 ${birth}`
    }
    if (death) {
      return `${death} 去世`
    }
    return ''
  }

  // Get avatar URL
  const avatarUrl = profile.avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${profile.avatar_path}`
    : null

  // Get cover photo URL
  const coverPhotoUrl = profile.cover_photo_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${profile.cover_photo_path}`
    : null

  // Fallback cover gradient
  const hasCustomCover = !!coverPhotoUrl

  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      {/* Cover Photo Banner */}
      <div className="h-40 lg:h-48 relative">
        {hasCustomCover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPhotoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="h-full bg-gradient-to-b from-amber-100 via-amber-50 to-stone-50" />
        )}
      </div>

      {/* Header Content - positioned to overlap the cover photo */}
      <div className="relative px-6 lg:px-8 -mt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Avatar - positioned to overlap the cover photo */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt={`${profile.name}的头像`}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-3xl font-medium ring-4 ring-white shadow-lg">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 lg:pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-medium text-stone-800">
                {profile.name}
              </h1>
              <span className="rounded-full bg-white/90 px-3 py-1 text-sm text-stone-600 shadow-sm">
                {relationshipLabel}
              </span>
            </div>

            {formatDateRange() && (
              <p className="mt-2 text-sm text-stone-500">
                {formatDateRange()}
              </p>
            )}

            {profile.description && (
              <p className="mt-3 text-stone-600">
                {profile.description}
              </p>
            )}

            <p className="mt-3 text-sm text-stone-400">
              {profile.memory_count} 条记忆
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:pt-4">
            <Link href={`/profile/${profile.id}/upload`}>
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
                上传记忆
              </Button>
            </Link>
            <Link href={`/profile/${profile.id}/family`}>
              <Button
                variant="outline"
                className="border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl"
              >
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                邀请家人
              </Button>
            </Link>
            <Link href={`/profile/${profile.id}/edit`}>
              <Button
                variant="outline"
                className="border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl"
              >
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                编辑档案
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
