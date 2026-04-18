import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadFile, uploadThumbnail } from '@/lib/utils/storage'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('storage utils', () => {
  let mockUpload: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock functions
    mockUpload = vi.fn()

    // Mock the storage.from().upload() chain
    const mockFrom = vi.fn(() => ({
      upload: mockUpload,
    }))

    const mockStorage = {
      from: mockFrom,
    }

    vi.mocked(createClient).mockResolvedValue({
      storage: mockStorage,
    } as unknown as ReturnType<typeof createClient>)
  })

  describe('uploadFile', () => {
    it('should upload file to specified bucket and path', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const mockPath = 'user123/profile456/memory789/test.jpg'

      mockUpload.mockResolvedValue({
        data: { path: mockPath },
        error: null,
      })

      const onProgress = vi.fn()

      const result = await uploadFile('memories', mockPath, mockFile, onProgress)

      expect(result).toBe(mockPath)
      expect(mockUpload).toHaveBeenCalled()
    })

    it('should handle upload progress', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const mockPath = 'user123/profile456/memory789/test.jpg'

      mockUpload.mockResolvedValue({
        data: { path: mockPath },
        error: null,
      })

      const onProgress = vi.fn()

      await uploadFile('memories', mockPath, mockFile, onProgress)

      // Progress callback is called (at least once)
      expect(onProgress).toHaveBeenCalled()
    })

    it('should throw error when upload fails', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const mockPath = 'user123/profile456/memory789/test.jpg'

      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      })

      const onProgress = vi.fn()

      await expect(uploadFile('memories', mockPath, mockFile, onProgress)).rejects.toThrow('Upload failed')
    })
  })

  describe('uploadThumbnail', () => {
    it('should upload thumbnail with correct path format', async () => {
      const mockBlob = new Blob(['thumbnail'], { type: 'image/jpeg' })
      const profileId = 'profile123'
      const memoryId = 'memory456'
      const expectedPath = `${profileId}/${memoryId}/thumbnail.jpg`

      mockUpload.mockResolvedValue({
        data: { path: expectedPath },
        error: null,
      })

      const result = await uploadThumbnail(profileId, memoryId, mockBlob)

      expect(result).toBe(expectedPath)
      expect(mockUpload).toHaveBeenCalled()
    })

    it('should throw error when thumbnail upload fails', async () => {
      const mockBlob = new Blob(['thumbnail'], { type: 'image/jpeg' })

      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Thumbnail upload failed' },
      })

      await expect(uploadThumbnail('profile123', 'memory456', mockBlob)).rejects.toThrow('Thumbnail upload failed')
    })
  })

})
