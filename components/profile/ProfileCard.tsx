import Link from 'next/link'
import type { ProfileWithMemoryCount } from '@/lib/types'
import { RELATIONSHIP_LABELS } from '@/lib/types'

interface ProfileCardProps {
  profile: ProfileWithMemoryCount
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const {
    id,
    name,
    avatar_path,
    relationship,
    birth_date,
    death_date,
    description,
    memory_count,
  } = profile

  const relationshipLabel = RELATIONSHIP_LABELS[relationship] || relationship

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
    const birth = birth_date ? formatDate(birth_date) : null
    const death = death_date ? formatDate(death_date) : null

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
  const avatarUrl = avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${avatar_path}`
    : null

  return (
    <Link
      href={`/profile/${id}`}
      className="group block rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-150 hover:border-stone-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${name}的头像`}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-stone-100"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xl font-medium ring-2 ring-stone-100">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Name and relationship */}
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-stone-800 truncate">
              {name}
            </h3>
            <span className="flex-shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
              {relationshipLabel}
            </span>
          </div>

          {/* Date range */}
          {formatDateRange() && (
            <p className="mt-1 text-sm text-stone-500">
              {formatDateRange()}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="mt-2 text-sm text-stone-600 line-clamp-2">
              {description}
            </p>
          )}

          {/* Memory count */}
          <div className="mt-3 flex items-center gap-1 text-sm text-stone-400">
            <svg
              className="h-4 w-4"
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
            <span>
              {memory_count} {memory_count === 1 ? '条记忆' : '条记忆'}
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="flex-shrink-0 self-center text-stone-300 transition-colors group-hover:text-stone-400">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
}
