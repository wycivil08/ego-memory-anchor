import Link from 'next/link'
import { MoreVertical, Image as ImageIcon, Film, Mic } from 'lucide-react'
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
    cover_photo_path,
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
    return date.getFullYear().toString()
  }

  const birthYear = formatDate(birth_date)
  const deathYear = formatDate(death_date)
  const dateRange = (birthYear && deathYear) ? `${birthYear} — ${deathYear}` : (birthYear ? `出生于 ${birthYear}` : (deathYear ? `${deathYear} 去世` : ''))

  // Get photo URLs
  const avatarUrl = avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${avatar_path}`
    : null
  
  // Use cover photo if available, fallback to avatar, or placeholder
  const displayImageUrl = cover_photo_path 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${cover_photo_path}`
    : avatarUrl

  return (
    <Link href={`/profile/${id}`}>
      <div className="group bg-white rounded-xl p-1 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/5 cursor-pointer flex flex-col h-full border border-stone-100">
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-t-lg bg-stone-100">
          {displayImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={displayImageUrl}
              alt={`${name}的照片`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-stone-300">
              {name.charAt(0)}
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <span className="text-xs uppercase tracking-widest bg-amber-700/80 px-2 py-0.5 rounded backdrop-blur-sm">已守护</span>
          </div>
        </div>
        
        <div className="p-6 space-y-4 flex-grow bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-stone-900">{relationshipLabel}·{name}</h3>
              {dateRange && <p className="text-stone-400 text-sm font-medium">{dateRange}</p>}
            </div>
            <MoreVertical className="w-5 h-5 text-stone-300 group-hover:text-amber-700 transition-colors" />
          </div>
          
          <div className="flex items-center gap-6 text-stone-600 border-y border-stone-50 py-4">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-[18px] h-[18px] text-stone-400" />
              <span className="text-sm font-medium">{memory_count}</span>
            </div>
            {/* Mocked break down counts since DB currently only has 1 count */}
            <div className="flex items-center gap-1.5 opacity-50 relative group/tooltip">
              <Film className="w-[18px] h-[18px] text-stone-400" />
              <span className="text-sm font-medium">0</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-50">
              <Mic className="w-[18px] h-[18px] text-stone-400" />
              <span className="text-sm font-medium">0</span>
            </div>
          </div>
          
          {description && (
             <p className="text-sm text-stone-500 line-clamp-2 pb-2">
               {description}
             </p>
          )}

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-amber-700">我</div>
            </div>
            <span className="text-xs text-stone-400 font-medium ml-1">独立守护</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
