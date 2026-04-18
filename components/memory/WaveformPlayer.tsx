'use client'

import * as React from 'react'
import WaveSurfer from '@wavesurfer/react'
import { cn } from '@/lib/utils'

interface WaveformPlayerProps {
  url: string
  title?: string
  onClose?: () => void
  className?: string
}

// Pre-compute skeleton heights once at module level to avoid impure Math.random() during render
const SKELETON_HEIGHTS = Array.from({ length: 50 }, () => 20 + Math.random() * 60)

export function WaveformPlayer({ url, title, onClose, className }: WaveformPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleTimeupdate = (ws: unknown) => {
    if (ws && typeof ws === 'object' && 'getCurrentTime' in ws) {
      const wsObj = ws as { getCurrentTime: () => number }
      setCurrentTime(wsObj.getCurrentTime())
    }
  }

  const handleReady = (ws: unknown) => {
    setIsLoading(false)
    if (ws && typeof ws === 'object' && 'getDuration' in ws) {
      const wsObj = ws as { getDuration: () => number }
      setDuration(wsObj.getDuration())
    }
  }

  const handleSeek = (relativePosition: number) => {
    setCurrentTime(relativePosition * duration)
  }

  const togglePlay = () => {
    if (isPlaying) {
      // WaveSurfer handles pause via the instance
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
    }
  }

  return (
    <div className={cn('rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 p-4', className)}>
      {/* Title */}
      {title && (
        <p className="mb-3 text-center text-sm text-stone-600 truncate">{title}</p>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mb-4 flex h-16 items-end justify-center gap-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="w-1 animate-pulse rounded-full bg-stone-300"
              style={{ height: `${SKELETON_HEIGHTS[i]}%` }}
            />
          ))}
        </div>
      )}

      {/* Waveform */}
      <div className="mb-4 rounded-lg bg-stone-50 overflow-hidden">
        <WaveSurfer
          url={url}
          waveColor="#d97706"
          progressColor="#b45309"
          height={64}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeupdate={handleTimeupdate}
          onReady={handleReady}
          // @ts-expect-error - onSeek prop not in types but used by wavesurfer
          onSeek={handleSeek}
          options={{
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            cursorWidth: 0,
            backend: 'WebAudio',
            mediaControls: false,
            interact: true,
          }}
        />
      </div>

      {/* Time display */}
      <div className="mb-3 flex items-center justify-between text-xs text-stone-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {/* Rewind 10s */}
        <button
          onClick={() => {
            setCurrentTime(Math.max(0, currentTime - 10))
          }}
          className="text-stone-500 hover:text-amber-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            <text x="9" y="15" fontSize="6" fill="currentColor">10</text>
          </svg>
        </button>

        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-md transition-transform hover:scale-105 disabled:opacity-50"
        >
          {isPlaying ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Forward 10s */}
        <button
          onClick={() => {
            setCurrentTime(Math.min(duration, currentTime + 10))
          }}
          className="text-stone-500 hover:text-amber-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
            <text x="9" y="15" fontSize="6" fill="currentColor">10</text>
          </svg>
        </button>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
