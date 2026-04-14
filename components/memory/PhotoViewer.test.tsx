import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PhotoViewer } from './PhotoViewer'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('PhotoViewer', () => {
  const defaultProps = {
    src: '/test-photo.jpg',
    alt: 'Test photo',
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    render(<PhotoViewer {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', async () => {
    render(<PhotoViewer {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
  })

  it('displays close button', async () => {
    render(<PhotoViewer {...defaultProps} />)

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: '关闭' })
      expect(closeButton).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', async () => {
    render(<PhotoViewer {...defaultProps} />)

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: '关闭' })
      fireEvent.click(closeButton)
    })

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('shows loading skeleton while image is loading', () => {
    render(<PhotoViewer {...defaultProps} />)

    // Loading spinner should be visible initially
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('calls onClose when clicking background', async () => {
    render(<PhotoViewer {...defaultProps} />)

    await waitFor(() => {
      const img = screen.getByRole('img')
      // Click on the background overlay (not on the image)
      const overlay = img.parentElement?.parentElement
      if (overlay) {
        fireEvent.click(overlay as HTMLElement)
      }
    })

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('displays EXIF info button when exifData is provided', async () => {
    render(
      <PhotoViewer
        {...defaultProps}
        exifData={{
          dateTaken: '2024-01-15T10:30:00',
          device: 'iPhone 14 Pro',
        }}
      />
    )

    await waitFor(() => {
      const infoButton = screen.getByRole('button', { name: '显示照片信息' })
      expect(infoButton).toBeInTheDocument()
    })
  })

  it('toggles EXIF panel when info button is clicked', async () => {
    render(
      <PhotoViewer
        {...defaultProps}
        exifData={{
          dateTaken: '2024-01-15T10:30:00',
          device: 'iPhone 14 Pro',
        }}
      />
    )

    await waitFor(() => {
      const infoButton = screen.getByRole('button', { name: '显示照片信息' })
      fireEvent.click(infoButton)
    })

    await waitFor(() => {
      expect(screen.getByText('拍摄时间')).toBeInTheDocument()
      expect(screen.getByText('设备')).toBeInTheDocument()
    })
  })

  it('closes on Escape key press', async () => {
    render(<PhotoViewer {...defaultProps} />)

    await waitFor(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })

    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})
