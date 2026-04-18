'use client'

import * as React from 'react'
import Link from 'next/link'
import type { Memory } from '@/lib/types'
import { getPublicUrl } from '@/lib/utils/url'

interface TodayMemoryProps {
  memories: Memory[]
  profileId: string
}

function formatMonthDay(): string {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  return `${month}月${day}日`
}

function MemoryThumbnail({ memory }: { memory: Memory }) {
  const [imageError, setImageError] = React.useState(false)

  if (memory.type === 'photo' && memory.thumbnail_path && !imageError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={getPublicUrl('memories', memory.thumbnail_path)}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setImageError(true)}
      />
    )
  }

  if (memory.type === 'video') {
    return (
      <div className="flex h-full items-center justify-center bg-stone-100">
        <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  if (memory.type === 'audio') {
    return (
      <div className="flex h-full items-center justify-center bg-stone-100">
        <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
    )
  }

  if (memory.type === 'text') {
    return (
      <div className="flex h-full items-center justify-center bg-amber-50 p-2">
        <p className="line-clamp-3 text-center text-sm text-stone-600">
          {memory.content || ''}
        </p>
      </div>
    )
  }

  // Document type
  return (
    <div className="flex h-full items-center justify-center bg-stone-100">
      <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  )
}

export function TodayMemory({ memories, profileId }: TodayMemoryProps) {
  if (memories.length === 0) {
    return null
  }

  const monthDay = formatMonthDay()
  // displayCount is prepared for future use (e.g., showing "and X more")
  const hasMore = memories.length > 3

  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-amber-800">
            今天的记忆
          </h3>
          <p className="text-xs text-amber-600">
            {monthDay} · {memories.length} 条记忆
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {memories.slice(0, 3).map((memory) => (
          <Link
            key={memory.id}
            href={`/profile/${profileId}/memory/${memory.id}`}
            className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100"
          >
            <MemoryThumbnail memory={memory} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </Link>
        ))}
      </div>

      {hasMore && (
        <Link
          href={`/profile/${profileId}`}
          className="mt-3 block text-center text-sm text-amber-600 hover:text-amber-700 hover:underline"
        >
          查看全部 {memories.length} 条记忆 →
        </Link>
      )}
    </div>
  )
}
