import type { MemoryType } from '@/lib/types'

// File size limits in bytes
const FILE_SIZE_LIMITS: Record<MemoryType, number> = {
  photo: 50 * 1024 * 1024, // 50MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 100 * 1024 * 1024, // 100MB
  text: 50 * 1024 * 1024, // 50MB (same as document)
  document: 50 * 1024 * 1024, // 50MB
}

// MIME type mappings (exported for use in UploadZone)
export const MIME_TYPE_MAP: Record<MemoryType, string[]> = {
  photo: ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'],
  video: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm'],
  text: ['text/plain'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate a file against type and size constraints.
 */
export function validateFile(file: File, type: MemoryType): ValidationResult {
  const allowedMimeTypes = MIME_TYPE_MAP[type]
  const maxSize = FILE_SIZE_LIMITS[type]

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedMimeTypes.join(', ')}`,
    }
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024)
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Determine memory type from file MIME type.
 */
export function getMemoryType(file: File): MemoryType {
  const mimeType = file.type

  if (mimeType.startsWith('image/')) return 'photo'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'text/plain') return 'text'

  // Default to document for PDF, Word, etc.
  return 'document'
}

/**
 * Format bytes into human-readable file size.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    return `${kb.toFixed(1)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}
