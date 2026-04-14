'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MEMORY_TYPE_LABELS, formatMemoryDate, truncateText, getMemoryContributor, type Memory } from '@/lib/utils/timeline'

interface TimelineItemProps {
  memory: Memory
  profileId: string
  className?: string
}

// Memory type icons as inline SVGs
function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function AudioIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function TextIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-6 w-6', className)} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function WaveformIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-8 w-8', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

// SourceBadge component
function SourceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600 ring-1 ring-amber-100">
      {label}
    </span>
  )
}

// Memory type badge with inline icon rendering
function TypeBadge({ type }: { type: Memory['type'] }) {
  const label = MEMORY_TYPE_LABELS[type]

  return (
    <span className="inline-flex items-center gap-1 text-xs text-stone-500">
      {type === 'photo' && <PhotoIcon className="h-3 w-3" />}
      {type === 'video' && <VideoIcon className="h-3 w-3" />}
      {type === 'audio' && <AudioIcon className="h-3 w-3" />}
      {type === 'text' && <TextIcon className="h-3 w-3" />}
      {type === 'document' && <DocumentIcon className="h-3 w-3" />}
      {label}
    </span>
  )
}

// Contributor avatar
function ContributorAvatar({ memory }: { memory: Memory }) {
  const contributor = getMemoryContributor(memory)

  if (!contributor) return null

  return (
    <div className="relative h-5 w-5 flex-shrink-0">
      {contributor.avatarUrl ? (
        <img
          src={contributor.avatarUrl}
          alt={contributor.displayName}
          className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
        />
      ) : (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-[10px] text-stone-500 ring-1 ring-white">
          {contributor.displayName.charAt(0)}
        </div>
      )}
    </div>
  )
}

// Photo/Video preview
function MediaPreview({ memory }: { memory: Memory }) {
  const thumbnailUrl = memory.thumbnail_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${memory.thumbnail_path}`
    : memory.file_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${memory.file_path}`
      : null

  if (!thumbnailUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-stone-100">
        <PhotoIcon className="h-8 w-8 text-stone-300" />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-stone-100">
      <img
        src={thumbnailUrl}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {memory.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm">
            <PlayIcon />
          </div>
        </div>
      )}
    </div>
  )
}

// Audio preview
function AudioPreview({ memory }: { memory: Memory }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-stone-100 to-stone-50 p-4">
      <div className="mb-2 flex items-center justify-center">
        <WaveformIcon className="h-10 w-10 text-amber-500" />
      </div>
      <div className="text-xs text-stone-400">
        {memory.file_size ? `${Math.round(memory.file_size / 1024)} KB` : '语音'}
      </div>
    </div>
  )
}

// Text preview
function TextPreview({ memory }: { memory: Memory }) {
  const text = memory.content || ''
  const truncated = truncateText(text, 100)

  return (
    <div className="h-full w-full rounded-lg bg-gradient-to-br from-stone-50 to-white p-4">
      <p className="line-clamp-4 text-sm text-stone-600">
        {truncated}
      </p>
    </div>
  )
}

// Document preview
function DocumentPreview({ memory }: { memory: Memory }) {
  const filename = memory.file_path?.split('/').pop() || '文档'

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-stone-100 to-stone-50 p-4">
      <DocumentIcon className="mb-2 h-10 w-10 text-stone-400" />
      <span className="truncate text-xs text-stone-500">{filename}</span>
    </div>
  )
}

export function TimelineItem({ memory, profileId, className }: TimelineItemProps) {
  const href = `/profile/${profileId}/memory/${memory.id}`
  const dateLabel = formatMemoryDate(memory.memory_date, memory.memory_date_precision)
  const hasAnnotation = !!memory.annotation
  const annotationPreview = memory.annotation ? truncateText(memory.annotation, 50) : null

  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-all duration-150 hover:border-stone-300 hover:shadow-md',
        className
      )}
    >
      {/* Preview area */}
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-stone-50">
        {memory.type === 'photo' && <MediaPreview memory={memory} />}
        {memory.type === 'video' && <MediaPreview memory={memory} />}
        {memory.type === 'audio' && <AudioPreview memory={memory} />}
        {memory.type === 'text' && <TextPreview memory={memory} />}
        {memory.type === 'document' && <DocumentPreview memory={memory} />}
      </div>

      {/* Meta info */}
      <div className="space-y-2">
        {/* Date and badges row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">{dateLabel}</span>
            <TypeBadge type={memory.type} />
          </div>
          <SourceBadge label={memory.source_label} />
        </div>

        {/* Annotation preview if exists */}
        {hasAnnotation && annotationPreview && (
          <p className="line-clamp-2 text-xs text-stone-500 italic">
            &ldquo;{annotationPreview}&rdquo;
          </p>
        )}

        {/* Contributor */}
        <div className="flex items-center justify-end">
          <ContributorAvatar memory={memory} />
        </div>
      </div>
    </Link>
  )
}
