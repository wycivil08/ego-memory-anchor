import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VideoPlayer } from './VideoPlayer'

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

// Mock react-player
vi.mock('react-player', () => ({
  default: vi.fn(({ url, controls }) => (
    <div data-testid="react-player" data-url={url} data-controls={controls}>
      <video
        data-testid="mock-video"
        src={url}
        controls={controls}
      />
    </div>
  )),
}))

describe('VideoPlayer', () => {
  const defaultProps = {
    src: '/test-video.mp4',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders video player', () => {
    render(<VideoPlayer {...defaultProps} />)
    expect(screen.getByTestId('react-player')).toBeInTheDocument()
  })

  it('renders with correct src', () => {
    render(<VideoPlayer {...defaultProps} />)
    const player = screen.getByTestId('react-player')
    expect(player).toHaveAttribute('data-url', '/test-video.mp4')
  })

  it('renders with controls enabled', () => {
    render(<VideoPlayer {...defaultProps} />)
    const player = screen.getByTestId('react-player')
    expect(player).toHaveAttribute('data-controls', 'true')
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<VideoPlayer {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close video')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render close button when onClose is not provided', () => {
    render(<VideoPlayer {...defaultProps} />)
    expect(screen.queryByLabelText('Close video')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<VideoPlayer {...defaultProps} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders fullscreen button', () => {
    render(<VideoPlayer {...defaultProps} />)
    expect(screen.getByLabelText('Enter fullscreen')).toBeInTheDocument()
  })
})
