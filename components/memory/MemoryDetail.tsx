'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SourceBadge } from './SourceBadge'
import { formatMemoryDate, MEMORY_TYPE_LABELS, type Memory } from '@/lib/utils/timeline'

interface MemoryDetailProps {
  memory: Memory
  contributorName?: string
  contributorAvatar?: string | null
  onDelete?: () => void
  canDelete?: boolean
  className?: string
}

// Photo viewer with zoom capability
function PhotoViewer({ src, alt }: { src: string; alt?: string }) {
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <div
      className={`relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
      onClick={() => setIsZoomed(!isZoomed)}
    >
      <img
        src={src}
        alt={alt || '照片'}
        className={`max-h-[70vh] w-full object-contain transition-transform duration-200 ${
          isZoomed ? 'scale-150' : ''
        }`}
      />
    </div>
  )
}

// Video player with controls
function VideoPlayer({ src, mimeType }: { src: string; mimeType?: string }) {
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

// Audio player with waveform visualization (simplified)
function AudioPlayer({ src, duration }: { src: string; duration?: number | null }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 p-6">
      {/* Waveform visualization (simplified) */}
      <div className="mb-4 flex h-16 items-center justify-center gap-1">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-amber-400 transition-all duration-150"
            style={{
              height: `${Math.random() * 100}%`,
              opacity: i / 40 < currentTime / (audioDuration || 1) ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      {/* Audio element (hidden) */}
      <audio
        src={src}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={(e) => setAudioDuration((e.target as HTMLAudioElement).duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-stone-300 bg-white hover:bg-stone-50"
          onClick={() => {
            const audio = document.querySelector('audio') as HTMLAudioElement
            if (audio) {
              audio.currentTime = Math.max(0, audio.currentTime - 10)
            }
          }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-stone-300 bg-white hover:bg-stone-50"
          onClick={() => {
            const audio = document.querySelector('audio') as HTMLAudioElement
            if (audio) {
              if (isPlaying) {
                audio.pause()
              } else {
                audio.play()
              }
            }
          }}
        >
          {isPlaying ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-stone-300 bg-white hover:bg-stone-50"
          onClick={() => {
            const audio = document.querySelector('audio') as HTMLAudioElement
            if (audio) {
              audio.currentTime = Math.min(audioDuration, audio.currentTime + 10)
            }
          }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </Button>
      </div>

      {/* Time display */}
      <div className="mt-4 flex justify-center text-sm text-stone-500">
        {formatTime(currentTime)} / {formatTime(audioDuration)}
      </div>
    </div>
  )
}

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
  // Get file URL
  const fileUrl = memory.file_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${memory.file_path}`
    : null

  // Get thumbnail URL
  const thumbnailUrl = memory.thumbnail_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${memory.thumbnail_path}`
    : null

  // Use thumbnail for display if available, otherwise use file
  const displayUrl = thumbnailUrl || fileUrl

  const dateLabel = formatMemoryDate(memory.memory_date, memory.memory_date_precision)
  const typeLabel = MEMORY_TYPE_LABELS[memory.type]

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Media display area */}
      <div className="rounded-xl bg-stone-100 overflow-hidden">
        {memory.type === 'photo' && displayUrl && (
          <PhotoViewer src={displayUrl} alt={memory.content || '照片'} />
        )}

        {memory.type === 'video' && displayUrl && (
          <VideoPlayer src={displayUrl} mimeType={memory.mime_type || undefined} />
        )}

        {memory.type === 'audio' && fileUrl && (
          <AudioPlayer src={fileUrl} duration={memory.duration_seconds} />
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
