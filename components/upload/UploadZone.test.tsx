import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UploadZone } from './UploadZone'

// Mock the file utilities
vi.mock('@/lib/utils/file', () => ({
  validateFile: vi.fn(),
  getMemoryType: vi.fn(),
  formatFileSize: vi.fn(),
}))

import { validateFile, getMemoryType } from '@/lib/utils/file'

const mockValidateFile = vi.mocked(validateFile)
const mockGetMemoryType = vi.mocked(getMemoryType)

describe('UploadZone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateFile.mockReturnValue({ valid: true })
    mockGetMemoryType.mockImplementation((file: File) => {
      if (file.type.startsWith('image/')) return 'photo'
      if (file.type.startsWith('video/')) return 'video'
      if (file.type.startsWith('audio/')) return 'audio'
      return 'document'
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createMockFile = (name: string, type: string, size: number = 1024): File => {
    return new File(['content'], name, { type })
  }

  describe('rendering', () => {
    it('should render the upload zone', () => {
      render(
        <UploadZone onFilesSelected={vi.fn()} />
      )

      expect(screen.getByText('点击或拖拽文件到这里')).toBeInTheDocument()
      expect(screen.getByText('支持照片、视频、音频、文字和文档')).toBeInTheDocument()
    })

    it('should render file type hints', () => {
      render(
        <UploadZone onFilesSelected={vi.fn()} />
      )

      expect(screen.getByText('照片')).toBeInTheDocument()
      expect(screen.getByText('视频')).toBeInTheDocument()
      expect(screen.getByText('音频')).toBeInTheDocument()
      expect(screen.getByText('文字')).toBeInTheDocument()
      expect(screen.getByText('文档')).toBeInTheDocument()
    })

    it('should show size limits', () => {
      render(
        <UploadZone onFilesSelected={vi.fn()} />
      )

      expect(screen.getByText(/照片最大 50MB/)).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      render(
        <UploadZone onFilesSelected={vi.fn()} disabled={true} />
      )

      const zone = screen.getByRole('button', { name: /上传文件区域/ })
      expect(zone).toHaveClass('cursor-not-allowed')
      expect(zone).toHaveClass('opacity-60')
    })
  })

  describe('click to select', () => {
    it('should call onFilesSelected when files are selected', async () => {
      const onFilesSelected = vi.fn()
      render(
        <UploadZone onFilesSelected={onFilesSelected} />
      )

      const input = screen.getByRole('button', { name: /上传文件区域/ })
      fireEvent.click(input)

      // The actual file input is hidden, so we need to trigger change differently
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('test.jpg', 'image/jpeg')

      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      })

      fireEvent.change(fileInput)

      expect(onFilesSelected).toHaveBeenCalled()
    })

    it('should show error when too many files selected', () => {
      const onFilesSelected = vi.fn()
      render(
        <UploadZone onFilesSelected={onFilesSelected} maxFiles={2} />
      )

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const files = [
        createMockFile('test1.jpg', 'image/jpeg'),
        createMockFile('test2.jpg', 'image/jpeg'),
        createMockFile('test3.jpg', 'image/jpeg'),
      ]

      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      })

      fireEvent.change(input)

      expect(screen.getByText(/最多只能选择 2 个文件/)).toBeInTheDocument()
    })
  })

  describe('drag and drop', () => {
    it('should show dragging state on drag enter', () => {
      render(
        <UploadZone onFilesSelected={vi.fn()} />
      )

      const zone = screen.getByRole('button', { name: /上传文件区域/ })

      fireEvent.dragEnter(zone)

      expect(zone).toHaveClass('border-amber-500', 'bg-amber-50')
    })

    it('should hide dragging state on drag leave', () => {
      render(
        <UploadZone onFilesSelected={vi.fn()} />
      )

      const zone = screen.getByRole('button', { name: /上传文件区域/ })

      fireEvent.dragEnter(zone)
      fireEvent.dragLeave(zone)

      expect(zone).not.toHaveClass('border-amber-500', 'bg-amber-50')
    })

    it('should not process drop when disabled', () => {
      const onFilesSelected = vi.fn()
      render(
        <UploadZone onFilesSelected={onFilesSelected} disabled={true} />
      )

      const zone = screen.getByRole('button', { name: /上传文件区域/ })

      fireEvent.dragEnter(zone)

      expect(zone).not.toHaveClass('border-amber-500', 'bg-amber-50')
    })
  })

  describe('file validation', () => {
    it('should validate files and return invalid files', () => {
      mockValidateFile.mockReturnValueOnce({
        valid: false,
        error: 'File size exceeds 50MB limit',
      })

      const onFilesSelected = vi.fn()
      render(
        <UploadZone onFilesSelected={onFilesSelected} />
      )

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('large.jpg', 'image/jpeg', 100 * 1024 * 1024)

      Object.defineProperty(mockFile, 'size', { value: 100 * 1024 * 1024 })

      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      })

      fireEvent.change(input)

      expect(screen.getByText(/large.jpg.*50MB limit/)).toBeInTheDocument()
    })

    it('should get memory type from file', () => {
      const onFilesSelected = vi.fn()
      render(
        <UploadZone onFilesSelected={onFilesSelected} />
      )

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('video.mp4', 'video/mp4')

      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      })

      fireEvent.change(input)

      expect(mockGetMemoryType).toHaveBeenCalled()
    })
  })

  describe('keyboard navigation', () => {
    it('should be focusable', () => {
      render(
        <UploadZone onFilesSelected={vi.fn()} />
      )

      const zone = screen.getByRole('button', { name: /上传文件区域/ })
      zone.focus()

      expect(document.activeElement).toBe(zone)
    })
  })
})
