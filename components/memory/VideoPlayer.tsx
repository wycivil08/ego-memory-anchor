'use client'

import * as React from 'react'
import ReactPlayer from 'react-player'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  poster?: string | null
  onClose?: () => void
  className?: string
}

export function VideoPlayer({ src, poster, onClose, className }: VideoPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = React.useRef<any>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Handle fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Handle escape key in fullscreen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const toggleFullscreen = React.useCallback(() => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  // react-player types are outdated - url prop is not in types but exists in actual API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerProps = { url: src, width: '100%', height: '100%', controls: true, playsinline: true, muted: false, loop: false, pip: false, onReady: () => setIsReady(true), onError: (e: React.SyntheticEvent) => console.error('Video playback error:', e), playing: false, disablePictureInPicture: true, controlsList: 'nodownload', poster: poster || undefined } as any

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-stone-900 rounded-xl overflow-hidden',
        className
      )}
    >
      <ReactPlayer
        ref={playerRef}
        {...playerProps}
      />

      {/* Loading indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-stone-400/30 border-t-stone-400" />
        </div>
      )}

      {/* Custom fullscreen button */}
      {isReady && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      )}

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 left-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          aria-label="Close video"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
