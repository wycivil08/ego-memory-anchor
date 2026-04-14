import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryDetail } from './MemoryDetail'
import type { Memory } from '@/lib/types'

// Mock environment variable
const originalEnv = process.env

describe('MemoryDetail', () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const createMockMemory = (overrides: Partial<Memory> = {}): Memory => ({
    id: 'memory-1',
    profile_id: 'profile-1',
    contributor_id: 'user-1',
    type: 'photo',
    file_path: 'memories/user1/profile1/memory1/photo.jpg',
    file_name: 'photo.jpg',
    file_size: 102400,
    mime_type: 'image/jpeg',
    thumbnail_path: null,
    duration_seconds: null,
    content: null,
    memory_date: '2024-01-15',
    memory_date_precision: 'day',
    tags: [],
    annotation: null,
    source_label: '原始记录',
    import_source: 'upload',
    exif_data: null,
    sort_order: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    deleted_at: null,
    ...overrides,
  })

  it('renders photo memory with image', () => {
    const memory = createMockMemory({
      type: 'photo',
      file_path: 'memories/test/photo.jpg',
    })

    render(<MemoryDetail memory={memory} />)

    expect(screen.getByText(/2024年1月15日/)).toBeInTheDocument()
    expect(screen.getByText('照片')).toBeInTheDocument()
    expect(screen.getByText('原始记录')).toBeInTheDocument()
  })

  it('renders video memory with video player', () => {
    const memory = createMockMemory({
      type: 'video',
      file_path: 'memories/test/video.mp4',
      mime_type: 'video/mp4',
    })

    render(<MemoryDetail memory={memory} />)

    expect(screen.getByText('视频')).toBeInTheDocument()
    const videoElement = document.querySelector('video')
    expect(videoElement).toBeInTheDocument()
  })

  it('renders text memory with content', () => {
    const memory = createMockMemory({
      type: 'text',
      content: '这是一段文字记忆的内容',
    })

    render(<MemoryDetail memory={memory} />)

    expect(screen.getByText('这是一段文字记忆的内容')).toBeInTheDocument()
    expect(screen.getByText('文字')).toBeInTheDocument()
  })

  it('renders audio memory with player', () => {
    const memory = createMockMemory({
      type: 'audio',
      file_path: 'memories/test/audio.mp3',
      duration_seconds: 120,
    })

    render(<MemoryDetail memory={memory} />)

    expect(screen.getByText('语音')).toBeInTheDocument()
    expect(screen.getByText(/0:00/)).toBeInTheDocument()
  })

  it('renders document memory with file info', () => {
    const memory = createMockMemory({
      type: 'document',
      file_path: 'memories/test/document.pdf',
      file_name: 'document.pdf',
    })

    render(<MemoryDetail memory={memory} />)

    expect(screen.getByText('文档')).toBeInTheDocument()
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
    expect(screen.getByText('下载文件')).toBeInTheDocument()
  })

  it('displays contributor info when provided', () => {
    const memory = createMockMemory()

    render(
      <MemoryDetail
        memory={memory}
        contributorName="张三"
        contributorAvatar={null}
      />
    )

    expect(screen.getByText('张三')).toBeInTheDocument()
  })

  it('shows delete button when canDelete is true', () => {
    const memory = createMockMemory()
    const onDelete = vi.fn()

    render(
      <MemoryDetail
        memory={memory}
        canDelete={true}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('删除记忆')).toBeInTheDocument()
  })

  it('does not show delete button when canDelete is false', () => {
    const memory = createMockMemory()

    render(
      <MemoryDetail
        memory={memory}
        canDelete={false}
      />
    )

    expect(screen.queryByText('删除记忆')).not.toBeInTheDocument()
  })

  it('displays file size for media files', () => {
    const memory = createMockMemory({
      file_size: 102400, // 100KB
    })

    render(<MemoryDetail memory={memory} />)

    expect(screen.getByText('100 KB')).toBeInTheDocument()
  })

  it('does not display file size for text memories', () => {
    const memory = createMockMemory({
      type: 'text',
      content: '文字内容',
      file_size: null,
    })

    render(<MemoryDetail memory={memory} />)

    expect(screen.queryByText(/\d+ KB/)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const memory = createMockMemory()

    const { container } = render(
      <MemoryDetail memory={memory} className="custom-wrapper" />
    )

    expect(container.firstChild).toHaveClass('custom-wrapper')
  })
})
