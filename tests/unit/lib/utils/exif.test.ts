import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractExifDate, extractExifData } from '@/lib/utils/exif'

// Mock exifr module
vi.mock('exifr', () => ({
  default: {
    parse: vi.fn(),
  },
}))

import exifr from 'exifr'

describe('exif utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('extractExifDate', () => {
    it('should return Date when EXIF date is present', async () => {
      const mockDate = new Date('2024-03-15T10:30:00')
      vi.mocked(exifr.parse).mockResolvedValue({ DateTimeOriginal: mockDate })

      const file = new File([], 'test.jpg', { type: 'image/jpeg' })
      const result = await extractExifDate(file)

      expect(result).toEqual(mockDate)
      expect(exifr.parse).toHaveBeenCalledWith(file, { pick: ['DateTimeOriginal'] })
    })

    it('should return null when file has no EXIF data', async () => {
      vi.mocked(exifr.parse).mockResolvedValue(null)

      const file = new File([], 'test.jpg', { type: 'image/jpeg' })
      const result = await extractExifDate(file)

      expect(result).toBeNull()
    })

    it('should return null when EXIF throws an error', async () => {
      vi.mocked(exifr.parse).mockRejectedValue(new Error('Parse error'))

      const file = new File([], 'test.jpg', { type: 'image/jpeg' })
      const result = await extractExifDate(file)

      expect(result).toBeNull()
    })

    it('should return null when DateTimeOriginal is missing', async () => {
      vi.mocked(exifr.parse).mockResolvedValue({ Make: 'Canon' })

      const file = new File([], 'test.jpg', { type: 'image/jpeg' })
      const result = await extractExifDate(file)

      expect(result).toBeNull()
    })

    it('should handle HEIC files', async () => {
      const mockDate = new Date('2024-06-20T14:00:00')
      vi.mocked(exifr.parse).mockResolvedValue({ DateTimeOriginal: mockDate })

      const file = new File([], 'test.heic', { type: 'image/heic' })
      const result = await extractExifDate(file)

      expect(result).toEqual(mockDate)
    })

    it('should handle PNG files', async () => {
      const mockDate = new Date('2024-01-01T00:00:00')
      vi.mocked(exifr.parse).mockResolvedValue({ DateTimeOriginal: mockDate })

      const file = new File([], 'test.png', { type: 'image/png' })
      const result = await extractExifDate(file)

      expect(result).toEqual(mockDate)
    })
  })

  describe('extractExifData', () => {
    it('should return full EXIF data record', async () => {
      const mockExif = {
        DateTimeOriginal: new Date('2024-03-15T10:30:00'),
        Make: 'Canon',
        Model: 'EOS R5',
        GPSLatitude: 35.6762,
        GPSLongitude: 139.6503,
      }
      vi.mocked(exifr.parse).mockResolvedValue(mockExif)

      const file = new File([], 'test.jpg', { type: 'image/jpeg' })
      const result = await extractExifData(file)

      expect(result).toEqual(mockExif)
    })

    it('should return empty object when no EXIF data', async () => {
      vi.mocked(exifr.parse).mockResolvedValue(null)

      const file = new File([], 'test.jpg', { type: 'image/jpeg' })
      const result = await extractExifData(file)

      expect(result).toEqual({})
    })

    it('should return empty object when EXIF throws an error', async () => {
      vi.mocked(exifr.parse).mockRejectedValue(new Error('Parse error'))

      const file = new File([], 'test.jpg', { type: 'image/jpeg' })
      const result = await extractExifData(file)

      expect(result).toEqual({})
    })

    it('should return empty object for text files without EXIF', async () => {
      vi.mocked(exifr.parse).mockResolvedValue(null)

      const file = new File(['some text content'], 'readme.txt', { type: 'text/plain' })
      const result = await extractExifData(file)

      expect(result).toEqual({})
    })
  })
})
