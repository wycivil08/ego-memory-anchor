import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

describe('VideoPlayer', () => {
  const defaultProps = {
    src: '/test-video.mp4',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders video element', () => {
    render(<VideoPlayer {...defaultProps} />)
    expect(screen.getByRole('video')).toBeInTheDocument()
  })

  it('renders with poster image if provided', () => {
    render(<VideoPlayer {...defaultProps} poster="/test-poster.jpg" />)
    const video = screen.getByRole('video') as HTMLVideoElement
    expect(video.poster).toBe('/test-poster.jpg')
  })

  it('shows play button when paused', () => {
    render(<VideoPlayer {...defaultProps} />)
    // The component should show the big play button overlay when paused
    const playButton = document.querySelector('button')
    expect(playButton).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<VideoPlayer {...defaultProps} onClose={onClose} />)

    // Find and click the close button
    const buttons = screen.getAllByRole('button')
    const closeButton = buttons.find(btn =>
      btn.querySelector('svg')?.getAttribute('fill') === 'none'
    )
    if (closeButton) {
      fireEvent.click(closeButton)
    }

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('toggles play/pause on video click', async () => {
    render(<VideoPlayer {...defaultProps} />)

    const video = screen.getByRole('video')

    // Initially paused
    expect(video.paused).toBe(true)

    // Click to play
    fireEvent.click(video)

    await waitFor(() => {
      // Video should be playing (or at least not paused)
      expect(video.paused).toBe(false)
    })
  })

  it('shows loading spinner when waiting', () => {
    render(<VideoPlayer {...defaultProps} />)
    // Loading spinner is shown by default initially
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('displays time correctly', async () => {
    render(<VideoPlayer {...defaultProps} />)

    // Should show 0:00 / 0:00 initially
    await waitFor(() => {
      expect(screen.getByText(/0:00/)).toBeInTheDocument()
    })
  })

  it('handles volume change', async () => {
    render(<VideoPlayer {...defaultProps} />)

    const video = screen.getByRole('video') as HTMLVideoElement

    // Find volume slider
    const volumeSlider = document.querySelector('input[type="range"]') as HTMLInputElement
    if (volumeSlider) {
      fireEvent.change(volumeSlider, { target: { value: '0.5' } })
      expect(video.volume).toBe(0.5)
    }
  })

  it('toggles mute button', async () => {
    render(<VideoPlayer {...defaultProps} />)

    const video = screen.getByRole('video') as HTMLVideoElement

    // Initially not muted
    expect(video.muted).toBe(false)

    // Find and click mute button
    const muteButton = document.querySelector('button')
    if (muteButton) {
      fireEvent.click(muteButton)
      expect(video.muted).toBe(true)
    }
  })

  it('applies custom className', () => {
    const { container } = render(<VideoPlayer {...defaultProps} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
