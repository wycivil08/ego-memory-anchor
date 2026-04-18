'use client'

import * as React from 'react'
import { PhotoProvider, PhotoView as RPVPhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
import { cn } from '@/lib/utils'
import { SourceBadge } from './SourceBadge'

interface PhotoViewerProps {
  photos: Photo[]
  visible?: boolean
  onClose?: () => void
  className?: string
}

interface Photo {
  src: string
  alt?: string
  annotation?: string | null
  sourceLabel?: string
}

/**
 * Gallery photo viewer using react-photo-view.
 * Supports:
 * - Click thumbnail to open fullscreen
 * - Gesture zoom (pinch to zoom)
 * - Swipe navigation between photos
 * - Keyboard navigation
 */
export function PhotoViewer({
  photos,
  visible: _visible = true,
  onClose: _onClose,
  className,
}: PhotoViewerProps) {
// visible and onClose are intentionally unused - kept for API compatibility
void _visible
void _onClose
  return (
    <PhotoProvider>
      <div className={cn('photo-viewer-wrapper', className)}>
        {photos.map((photo, index) => (
          <RPVPhotoView
            key={`${photo.src}-${index}`}
            src={photo.src}
          >
            {/* Hidden thumbnail - actual rendering is controlled externally */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt || photo.annotation || '照片'}
              style={{ display: 'none' }}
            />
          </RPVPhotoView>
        ))}
      </div>
    </PhotoProvider>
  )
}

/**
 * Single photo viewer for displaying one photo with fullscreen capability.
 * The image itself is clickable to open fullscreen viewer.
 */
interface SinglePhotoViewerProps {
  src: string
  alt?: string
  sourceLabel?: string
  className?: string
}

export function SinglePhotoViewer({
  src,
  alt = '',
  sourceLabel,
  className,
}: SinglePhotoViewerProps) {
  return (
    <PhotoProvider>
      <RPVPhotoView src={src}>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={cn(
              'max-h-[70vh] w-full cursor-zoom-in object-contain',
              className
            )}
          />
          {sourceLabel && (
            <div className="absolute bottom-2 right-2">
              <SourceBadge label={sourceLabel} />
            </div>
          )}
        </div>
      </RPVPhotoView>
    </PhotoProvider>
  )
}
