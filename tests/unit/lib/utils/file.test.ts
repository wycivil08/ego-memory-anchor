import { describe, it, expect } from 'vitest'
import { validateFile, getMemoryType, formatFileSize } from '@/lib/utils/file'
import type { MemoryType } from '@/lib/types'

describe('file utils', () => {
  describe('validateFile', () => {
    it('should accept valid JPEG photo', () => {
      const file = new File([], 'photo.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }) // 5MB
      const result = validateFile(file, 'photo')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid PNG photo', () => {
      const file = new File([], 'photo.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }) // 3MB
      const result = validateFile(file, 'photo')
      expect(result.valid).toBe(true)
    })

    it('should accept valid HEIC photo', () => {
      const file = new File([], 'photo.heic', { type: 'image/heic' })
      Object.defineProperty(file, 'size', { value: 4 * 1024 * 1024 }) // 4MB
      const result = validateFile(file, 'photo')
      expect(result.valid).toBe(true)
    })

    it('should reject photo exceeding 50MB', () => {
      const file = new File([], 'photo.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 51 * 1024 * 1024 }) // 51MB
      const result = validateFile(file, 'photo')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('50MB')
    })

    it('should reject invalid mime type for photo', () => {
      const file = new File([], 'doc.pdf', { type: 'application/pdf' })
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB
      const result = validateFile(file, 'photo')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('image/jpeg')
    })

    it('should accept valid MP4 video', () => {
      const file = new File([], 'video.mp4', { type: 'video/mp4' })
      Object.defineProperty(file, 'size', { value: 100 * 1024 * 1024 }) // 100MB
      const result = validateFile(file, 'video')
      expect(result.valid).toBe(true)
    })

    it('should accept valid MOV video', () => {
      const file = new File([], 'video.mov', { type: 'video/quicktime' })
      Object.defineProperty(file, 'size', { value: 200 * 1024 * 1024 }) // 200MB
      const result = validateFile(file, 'video')
      expect(result.valid).toBe(true)
    })

    it('should reject video exceeding 500MB', () => {
      const file = new File([], 'video.mp4', { type: 'video/mp4' })
      Object.defineProperty(file, 'size', { value: 501 * 1024 * 1024 }) // 501MB
      const result = validateFile(file, 'video')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('500MB')
    })

    it('should accept valid MP3 audio', () => {
      const file = new File([], 'audio.mp3', { type: 'audio/mpeg' })
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }) // 10MB
      const result = validateFile(file, 'audio')
      expect(result.valid).toBe(true)
    })

    it('should accept valid M4A audio', () => {
      const file = new File([], 'audio.m4a', { type: 'audio/mp4' })
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 }) // 15MB
      const result = validateFile(file, 'audio')
      expect(result.valid).toBe(true)
    })

    it('should accept valid WAV audio', () => {
      const file = new File([], 'audio.wav', { type: 'audio/wav' })
      Object.defineProperty(file, 'size', { value: 50 * 1024 * 1024 }) // 50MB
      const result = validateFile(file, 'audio')
      expect(result.valid).toBe(true)
    })

    it('should reject audio exceeding 100MB', () => {
      const file = new File([], 'audio.mp3', { type: 'audio/mpeg' })
      Object.defineProperty(file, 'size', { value: 101 * 1024 * 1024 }) // 101MB
      const result = validateFile(file, 'audio')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('100MB')
    })

    it('should accept valid PDF document', () => {
      const file = new File([], 'doc.pdf', { type: 'application/pdf' })
      Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 }) // 20MB
      const result = validateFile(file, 'document')
      expect(result.valid).toBe(true)
    })

    it('should accept text/plain as text type', () => {
      const file = new File([], 'notes.txt', { type: 'text/plain' })
      Object.defineProperty(file, 'size', { value: 100 * 1024 }) // 100KB
      const result = validateFile(file, 'text')
      expect(result.valid).toBe(true)
    })

    it('should reject document exceeding 50MB', () => {
      const file = new File([], 'doc.pdf', { type: 'application/pdf' })
      Object.defineProperty(file, 'size', { value: 51 * 1024 * 1024 }) // 51MB
      const result = validateFile(file, 'document')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('50MB')
    })
  })

  describe('getMemoryType', () => {
    it('should return photo for image/jpeg', () => {
      const file = new File([], 'test.jpg', { type: 'image/jpeg' })
      expect(getMemoryType(file)).toBe('photo')
    })

    it('should return photo for image/png', () => {
      const file = new File([], 'test.png', { type: 'image/png' })
      expect(getMemoryType(file)).toBe('photo')
    })

    it('should return photo for image/heic', () => {
      const file = new File([], 'test.heic', { type: 'image/heic' })
      expect(getMemoryType(file)).toBe('photo')
    })

    it('should return video for video/mp4', () => {
      const file = new File([], 'test.mp4', { type: 'video/mp4' })
      expect(getMemoryType(file)).toBe('video')
    })

    it('should return video for video/quicktime', () => {
      const file = new File([], 'test.mov', { type: 'video/quicktime' })
      expect(getMemoryType(file)).toBe('video')
    })

    it('should return audio for audio/mpeg', () => {
      const file = new File([], 'test.mp3', { type: 'audio/mpeg' })
      expect(getMemoryType(file)).toBe('audio')
    })

    it('should return audio for audio/mp4', () => {
      const file = new File([], 'test.m4a', { type: 'audio/mp4' })
      expect(getMemoryType(file)).toBe('audio')
    })

    it('should return audio for audio/wav', () => {
      const file = new File([], 'test.wav', { type: 'audio/wav' })
      expect(getMemoryType(file)).toBe('audio')
    })

    it('should return text for text/plain', () => {
      const file = new File([], 'test.txt', { type: 'text/plain' })
      expect(getMemoryType(file)).toBe('text')
    })

    it('should return document for application/pdf', () => {
      const file = new File([], 'test.pdf', { type: 'application/pdf' })
      expect(getMemoryType(file)).toBe('document')
    })

    it('should return document for application/msword', () => {
      const file = new File([], 'test.doc', { type: 'application/msword' })
      expect(getMemoryType(file)).toBe('document')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes to B', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should format exactly 1KB', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
    })

    it('should format KB', () => {
      expect(formatFileSize(5120)).toBe('5.0 KB')
    })

    it('should format 1MB', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB')
    })

    it('should format MB', () => {
      expect(formatFileSize(52428800)).toBe('50.0 MB')
    })

    it('should format GB', () => {
      expect(formatFileSize(2147483648)).toBe('2.0 GB')
    })

    it('should handle decimal MB', () => {
      expect(formatFileSize(1572864)).toBe('1.5 MB')
    })
  })
})
