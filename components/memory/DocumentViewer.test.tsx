import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DocumentViewer } from './DocumentViewer'

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

describe('DocumentViewer', () => {
  const defaultProps = {
    src: '/test-document.pdf',
    fileName: 'test-document.pdf',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset URL.createObjectURL
    URL.createObjectURL = vi.fn(() => 'blob:test-url')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders file name in header', () => {
    render(<DocumentViewer {...defaultProps} />)
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
  })

  it('renders download button', () => {
    render(<DocumentViewer {...defaultProps} />)
    const downloadButton = screen.getByRole('button', { name: '下载' })
    expect(downloadButton).toBeInTheDocument()
  })

  it('renders close button when onClose is provided', () => {
    const onClose = vi.fn()
    render(<DocumentViewer {...defaultProps} onClose={onClose} />)
    const closeButton = screen.getByRole('button')
    expect(closeButton).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<DocumentViewer {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders iframe for PDF files', () => {
    render(<DocumentViewer {...defaultProps} mimeType="application/pdf" />)
    const iframe = document.querySelector('iframe')
    expect(iframe).toBeInTheDocument()
  })

  it('renders img for image files', () => {
    render(<DocumentViewer {...defaultProps} src="/test-image.png" mimeType="image/png" />)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
  })

  it('shows unsupported message for unknown file types', () => {
    render(<DocumentViewer {...defaultProps} mimeType="application/zip" />)
    expect(screen.getByText('此文件类型暂不支持预览')).toBeInTheDocument()
  })

  it('shows loading spinner initially', () => {
    render(<DocumentViewer {...defaultProps} mimeType="application/pdf" />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('shows error message on image load failure', async () => {
    render(<DocumentViewer {...defaultProps} src="/test-image.png" mimeType="image/png" />)

    await waitFor(() => {
      const img = screen.getByRole('img')
      fireEvent.error(img)
    })

    await waitFor(() => {
      expect(screen.getByText('无法加载图片')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(<DocumentViewer {...defaultProps} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('closes on Escape key press', () => {
    const onClose = vi.fn()
    render(<DocumentViewer {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows download option when preview fails', async () => {
    render(<DocumentViewer {...defaultProps} mimeType="application/zip" />)

    const downloadLink = screen.getByText('下载文件')
    expect(downloadLink).toBeInTheDocument()
  })
})
