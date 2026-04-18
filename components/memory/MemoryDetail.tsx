'use client'

import { Button } from '@/components/ui/button'
import { SourceBadge } from './SourceBadge'
import { SinglePhotoViewer } from './PhotoViewer'
import { WaveformPlayer } from './WaveformPlayer'
import { formatMemoryDate, MEMORY_TYPE_LABELS, type Memory } from '@/lib/utils/timeline'
import { getMemoryFileUrl } from '@/lib/utils/storage-urls'

interface MemoryDetailProps {
  memory: Memory
  contributorName?: string
  contributorAvatar?: string | null
  onDelete?: () => void
  canDelete?: boolean
  className?: string
}

// Video player with controls
function VideoPlayer({ src }: { src: string }) {
  return (
    <video
      src={src}
      controls
      className="max-h-[70vh] w-full rounded-lg bg-black"
      poster={undefined}
    >
      您的浏览器不支持视频播放
    </video>
  )
}

// Audio player with waveform visualization using wavesurfer.js

// Text viewer for text memories
function TextViewer({ content }: { content: string }) {
  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-stone-50 to-white p-6">
      <div className="whitespace-pre-wrap text-base leading-relaxed text-stone-700">
        {content}
      </div>
    </div>
  )
}

// Document viewer (simplified - just shows file info)
function DocumentViewer({ filePath, fileName }: { filePath: string; fileName?: string | null }) {
  const filename = fileName || filePath.split('/').pop() || '文档'

  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 p-6">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="h-16 w-16 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <div className="text-center">
          <p className="font-medium text-stone-700">{filename}</p>
          <a
            href={filePath}
            download={filename}
            className="mt-2 inline-block text-sm text-amber-600 hover:text-amber-700"
          >
            下载文件
          </a>
        </div>
      </div>
    </div>
  )
}

export function MemoryDetail({
  memory,
  contributorName,
  contributorAvatar,
  onDelete,
  canDelete,
  className,
}: MemoryDetailProps) {
  // Get file URL - use centralized utility to prevent URL construction bugs
  const fileUrl = memory.file_path ? getMemoryFileUrl(memory.file_path) : null

  // Get thumbnail URL - use centralized utility
  const thumbnailUrl = memory.thumbnail_path ? getMemoryFileUrl(memory.thumbnail_path) : null

  // Use thumbnail for display if available, otherwise use file
  const displayUrl = thumbnailUrl || fileUrl

  const dateLabel = formatMemoryDate(memory.memory_date, memory.memory_date_precision)
  const typeLabel = MEMORY_TYPE_LABELS[memory.type]

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Media display area */}
      <div className="rounded-xl bg-stone-100 overflow-hidden">
        {memory.type === 'photo' && displayUrl && (
          <SinglePhotoViewer src={displayUrl} alt={memory.content || '照片'} sourceLabel={memory.source_label || undefined} />
        )}

        {memory.type === 'video' && displayUrl && (
          <VideoPlayer src={displayUrl} />
        )}

        {memory.type === 'audio' && fileUrl && (
          <WaveformPlayer url={fileUrl} />
        )}

        {memory.type === 'text' && memory.content && (
          <TextViewer content={memory.content} />
        )}

        {memory.type === 'document' && fileUrl && (
          <DocumentViewer filePath={fileUrl} fileName={memory.file_name} />
        )}

        {!displayUrl && memory.type === 'photo' && (
          <div className="flex h-64 w-full items-center justify-center bg-stone-100">
            <svg
              className="h-16 w-16 text-stone-300"
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
        )}
      </div>

      {/* Memory metadata */}
      <div className="px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-stone-500">{dateLabel}</span>
          <span className="text-stone-300">·</span>
          <span className="text-sm text-stone-500">{typeLabel}</span>
          <span className="text-stone-300">·</span>
          <SourceBadge label={memory.source_label} />
        </div>

        {/* File size for media */}
        {memory.file_size && memory.type !== 'text' && (
          <p className="mt-1 text-xs text-stone-400">
            {Math.round(memory.file_size / 1024)} KB
          </p>
        )}

        {/* Contributor */}
        {(contributorName || contributorAvatar) && (
          <div className="mt-2 flex items-center gap-2">
            {contributorAvatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={contributorAvatar}
                alt={contributorName}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-stone-200"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-xs text-stone-500 ring-1 ring-stone-200">
                {contributorName?.charAt(0) || '家'}
              </div>
            )}
            <span className="text-xs text-stone-500">{contributorName || '家人'}</span>
          </div>
        )}
      </div>

      {/* Delete button */}
      {canDelete && onDelete && (
        <div className="flex justify-end border-t border-stone-200 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            删除记忆
          </Button>
        </div>
      )}
    </div>
  )
}
