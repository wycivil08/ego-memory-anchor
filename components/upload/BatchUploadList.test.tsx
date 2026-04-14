import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BatchUploadList } from './BatchUploadList'
import type { UploadProgressItem } from './UploadProgress'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock formatFileSize
vi.mock('@/lib/utils/file', () => ({
  formatFileSize: vi.fn((bytes: number) => `${(bytes / 1024).toFixed(1)} KB`),
}))

describe('BatchUploadList', () => {
  const createMockItem = (overrides: Partial<UploadProgressItem> = {}): UploadProgressItem => ({
    id: '1',
    file: new File(['content'], 'test.jpg', { type: 'image/jpeg' }),
    memoryType: 'photo',
    status: 'waiting',
    progress: 0,
    ...overrides,
  })

  describe('rendering', () => {
    it('should return null when items is empty', () => {
      const { container } = render(
        <BatchUploadList items={[]} profileId="profile-1" />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render header with count', () => {
      const items = [
        createMockItem({ id: '1', status: 'uploading', progress: 50 }),
        createMockItem({ id: '2', status: 'done' }),
      ]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      expect(screen.getByText('上传列表')).toBeInTheDocument()
      expect(screen.getByText('正在上传 1 个文件...')).toBeInTheDocument()
    })

    it('should render all items', () => {
      const items = [
        createMockItem({ id: '1' }),
        createMockItem({ id: '2' }),
        createMockItem({ id: '3' }),
      ]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })
  })

  describe('status display', () => {
    it('should show waiting status', () => {
      const items = [createMockItem({ id: '1', status: 'waiting' })]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      expect(screen.getByText('等待上传')).toBeInTheDocument()
    })

    it('should show uploading status with progress', () => {
      const items = [createMockItem({ id: '1', status: 'uploading', progress: 45 })]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      expect(screen.getByText('上传中 45%')).toBeInTheDocument()
    })

    it('should show processing status', () => {
      const items = [createMockItem({ id: '1', status: 'processing' })]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      expect(screen.getByText('处理中...')).toBeInTheDocument()
    })

    it('should show done status', () => {
      const items = [createMockItem({ id: '1', status: 'done' })]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      expect(screen.getByText('已完成')).toBeInTheDocument()
    })

    it('should show error status with message', () => {
      const items = [
        createMockItem({
          id: '1',
          status: 'error',
          error: '网络错误，请重试',
        }),
      ]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      expect(screen.getByText('上传失败')).toBeInTheDocument()
      expect(screen.getByText('网络错误，请重试')).toBeInTheDocument()
    })

    it('should show retry button for error items', () => {
      const onRetry = vi.fn()
      const items = [createMockItem({ id: '1', status: 'error' })]

      render(<BatchUploadList items={items} profileId="profile-1" onRetry={onRetry} />)

      expect(screen.getByText('重试')).toBeInTheDocument()
    })
  })

  describe('completion state', () => {
    it('should show completion message when all done', () => {
      const items = [
        createMockItem({ id: '1', status: 'done' }),
        createMockItem({ id: '2', status: 'done' }),
      ]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      expect(screen.getByText('2 条记忆已保存')).toBeInTheDocument()
      expect(screen.getByText('前往时间线查看')).toBeInTheDocument()
    })

    it('should have correct link to profile timeline', () => {
      const items = [createMockItem({ id: '1', status: 'done' })]

      render(<BatchUploadList items={items} profileId="profile-123" />)

      const link = screen.getByText('前往时间线查看')
      expect(link.getAttribute('href')).toBe('/profile/profile-123')
    })
  })

  describe('error summary', () => {
    it('should show error summary when there are errors', () => {
      const items = [
        createMockItem({ id: '1', status: 'done' }),
        createMockItem({ id: '2', status: 'error' }),
      ]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      expect(screen.getByText('部分文件上传失败')).toBeInTheDocument()
    })

    it('should not show error summary when all done', () => {
      const items = [
        createMockItem({ id: '1', status: 'done' }),
        createMockItem({ id: '2', status: 'error' }),
      ]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      // Error summary should not show when allDone is true
      expect(screen.queryByText('部分文件上传失败')).not.toBeInTheDocument()
    })
  })

  describe('overall progress', () => {
    it('should show overall progress bar when not all done', () => {
      const items = [
        createMockItem({ id: '1', status: 'uploading', progress: 50 }),
        createMockItem({ id: '2', status: 'done' }),
      ]

      render(<BatchUploadList items={items} profileId="profile-1" />)

      // Should show "1 / 2 已完成"
      expect(screen.getByText('1 / 2 已完成')).toBeInTheDocument()
    })
  })
})
