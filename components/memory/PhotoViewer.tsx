'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ExifData {
  dateTaken?: string
  device?: string
  make?: string
  model?: string
  [key: string]: unknown
}

interface PhotoViewerProps {
  src: string
  alt?: string
  isOpen: boolean
  onClose: () => void
  exifData?: ExifData | null
  className?: string
}

interface ZoomState {
  scale: number
  translateX: number
  translateY: number
}

export function PhotoViewer({ src, alt = '', isOpen, onClose, exifData, className }: PhotoViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [showExif, setShowExif] = React.useState(false)
  const [zoom, setZoom] = React.useState<ZoomState>({ scale: 1, translateX: 0, translateY: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isDragging = React.useRef(false)
  const lastPos = React.useRef({ x: 0, y: 0 })

  // Reset zoom when opening new photo
  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setZoom({ scale: 1, translateX: 0, translateY: 0 })
    }
  }, [isOpen, src])

  // Handle wheel zoom (desktop)
  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => {
      const newScale = Math.min(Math.max(prev.scale * delta, 0.5), 5)
      return { ...prev, scale: newScale }
    })
  }, [])

  // Handle pinch zoom (mobile)
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      lastPos.current = { x: distance, y: 0 }
    } else if (e.touches.length === 1 && zoom.scale > 1) {
      isDragging.current = true
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }, [zoom.scale])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const delta = distance / lastPos.current.x
      lastPos.current = { x: distance, y: 0 }
      setZoom(prev => {
        const newScale = Math.min(Math.max(prev.scale * delta, 0.5), 5)
        return { ...prev, scale: newScale }
      })
    } else if (e.touches.length === 1 && isDragging.current && zoom.scale > 1) {
      const dx = e.touches[0].clientX - lastPos.current.x
      const dy = e.touches[0].clientY - lastPos.current.y
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      setZoom(prev => ({
        ...prev,
        translateX: prev.translateX + dx,
        translateY: prev.translateY + dy,
      }))
    }
  }, [zoom.scale])

  const handleTouchEnd = React.useCallback(() => {
    isDragging.current = false
  }, [])

  // Handle mouse drag (desktop)
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (zoom.scale > 1) {
      isDragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }, [zoom.scale])

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (isDragging.current && zoom.scale > 1) {
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      lastPos.current = { x: e.clientX, y: e.clientY }
      setZoom(prev => ({
        ...prev,
        translateX: prev.translateX + dx,
        translateY: prev.translateY + dy,
      }))
    }
  }, [zoom.scale])

  const handleMouseUp = React.useCallback(() => {
    isDragging.current = false
  }, [])

  // Handle double-click to zoom
  const handleDoubleClick = React.useCallback(() => {
    setZoom(prev => ({
      scale: prev.scale > 1 ? 1 : 2,
      translateX: 0,
      translateY: 0,
    }))
  }, [])

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const formatExifDate = (dateStr: string | undefined): string => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN')
    } catch {
      return dateStr
    }
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/90',
        className
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="关闭"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* EXIF toggle button */}
      {exifData && (
        <button
          onClick={() => setShowExif(!showExif)}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="显示照片信息"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        )}

        <img
          src={src}
          alt={alt}
          className={cn(
            'max-h-full max-w-full object-contain transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            transform: `scale(${zoom.scale}) translate(${zoom.translateX / zoom.scale}px, ${zoom.translateY / zoom.scale}px)`,
          }}
          onLoad={() => setIsLoading(false)}
          draggable={false}
        />
      </div>

      {/* EXIF panel */}
      {showExif && exifData && (
        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
          <h3 className="mb-2 text-sm font-medium">照片信息</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {exifData.dateTaken && (
              <div>
                <span className="text-white/60">拍摄时间</span>
                <p>{formatExifDate(exifData.dateTaken)}</p>
              </div>
            )}
            {exifData.device && (
              <div>
                <span className="text-white/60">设备</span>
                <p>{exifData.device}</p>
              </div>
            )}
            {exifData.make && (
              <div>
                <span className="text-white/60">品牌</span>
                <p>{exifData.make}</p>
              </div>
            )}
            {exifData.model && (
              <div>
                <span className="text-white/60">型号</span>
                <p>{exifData.model}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zoom indicator */}
      {zoom.scale !== 1 && (
        <div className="absolute bottom-4 right-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {Math.round(zoom.scale * 100)}%
        </div>
      )}
    </div>
  )
}
