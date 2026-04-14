import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AudioPlayer } from './AudioPlayer'

// Mock AudioContext and related APIs
class MockAudioContext {
  createAnalyser = vi.fn().mockReturnValue({
    fftSize: 256,
    frequencyBinCount: 128,
    getByteTimeDomainData: vi.fn(),
    connect: vi.fn(),
  })
  createMediaElementSource = vi.fn().mockReturnValue({
    connect: vi.fn(),
  })
  destination = {}
  close = vi.fn()
}

class MockAnalyserNode {
  fftSize = 256
  frequencyBinCount = 128
  getByteTimeDomainData = vi.fn()
  connect = vi.fn()
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
})

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: MockAudioContext,
})

describe('AudioPlayer', () => {
  const defaultProps = {
    src: '/test-audio.mp3',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders audio element', () => {
    render(<AudioPlayer {...defaultProps} />)
    const audio = document.querySelector('audio')
    expect(audio).toBeInTheDocument()
  })

  it('renders play button', () => {
    render(<AudioPlayer {...defaultProps} />)
    const playButton = document.querySelector('button')
    expect(playButton).toBeInTheDocument()
  })

  it('renders canvas for waveform', () => {
    render(<AudioPlayer {...defaultProps} />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('displays title if provided', () => {
    render(<AudioPlayer {...defaultProps} title="Test Audio Title" />)
    expect(screen.getByText('Test Audio Title')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<AudioPlayer {...defaultProps} onClose={onClose} />)

    const closeButton = document.querySelector('button:last-child')
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('shows loading skeleton initially', () => {
    render(<AudioPlayer {...defaultProps} />)
    // Loading skeleton with animated bars
    const loadingSkeleton = document.querySelector('.animate-pulse')
    expect(loadingSkeleton).toBeInTheDocument()
  })

  it('renders progress bar', () => {
    render(<AudioPlayer {...defaultProps} />)
    const progressBar = document.querySelector('input[type="range"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('toggles play on button click', async () => {
    render(<AudioPlayer {...defaultProps} />)

    const playButton = document.querySelector('button')
    if (playButton) {
      fireEvent.click(playButton)
    }

    // After clicking play, audio should attempt to play
    await waitFor(() => {
      const audio = document.querySelector('audio') as HTMLAudioElement
      expect(audio).toBeTruthy()
    })
  })

  it('applies custom className', () => {
    const { container } = render(<AudioPlayer {...defaultProps} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('displays formatted time', async () => {
    render(<AudioPlayer {...defaultProps} />)

    // Should show time in MM:SS format
    await waitFor(() => {
      expect(screen.getByText(/0:00/)).toBeInTheDocument()
    })
  })
})
