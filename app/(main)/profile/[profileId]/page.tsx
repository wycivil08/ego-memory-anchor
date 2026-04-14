import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProfileById } from '@/lib/actions/profile'
import { RELATIONSHIP_LABELS } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface ProfilePageProps {
  params: Promise<{ profileId: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { profileId } = await params
  const profile = await getProfileById(profileId)

  if (!profile) {
    notFound()
  }

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

  // Get avatar URL or return null for placeholder
  const avatarUrl = profile.avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${profile.avatar_path}`
    : null

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-amber-50 to-stone-50 border-b border-stone-200">
        <div className="p-6 lg:p-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${profile.name}的头像`}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-3xl font-medium ring-4 ring-white shadow-md">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-medium text-stone-800">
                  {profile.name}
                </h1>
                <span className="rounded-full bg-white px-3 py-1 text-sm text-stone-600 shadow-sm">
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
            <div className="flex gap-2">
              <Link href={`/profile/${profileId}/edit`}>
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
                  编辑
                </Button>
              </Link>
              <Link href={`/profile/${profileId}/upload`}>
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
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Placeholder */}
      <div className="p-6 lg:p-8">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-stone-700">
            还没有记忆
          </h2>
          <p className="mt-1 max-w-sm text-sm text-stone-500">
            上传照片、视频、语音或文字，记录关于 TA 的真实记忆
          </p>
          <Link href={`/profile/${profileId}/upload`} className="mt-6">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors duration-150">
              上传第一条记忆
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
