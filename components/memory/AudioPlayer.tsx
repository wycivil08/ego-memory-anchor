'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Pre-computed skeleton heights for loading animation - deterministic values avoid impure Math.random() in module scope
const SKELETON_HEIGHTS = Array.from({ length: 50 }, (_, i) => 20 + ((i * 37 + 13) % 60))

interface AudioPlayerProps {
  src: string
  title?: string
  onClose?: () => void
  className?: string
}

export function AudioPlayer({ src, title, onClose, className }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const sourceRef = React.useRef<MediaElementAudioSourceNode | null>(null)
  const animationRef = React.useRef<number | undefined>(undefined)

  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [waveformData, setWaveformData] = React.useState<number[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Skeleton heights for loading animation - using module-level constant
  // (generated once at module load, not during render)

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize audio context and analyser
  const initAudioContext = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio || audioContextRef.current) return

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyserRef.current = analyser

    const source = audioContext.createMediaElementSource(audio)
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    sourceRef.current = source
    audioContextRef.current = audioContext
  }, [])

  // Generate static waveform data from audio file
  const generateWaveform = React.useCallback(async (audioUrl: string) => {
    try {
      const response = await fetch(audioUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      const channelData = audioBuffer.getChannelData(0)
      const samples = 100
      const blockSize = Math.floor(channelData.length / samples)
      const waveform: number[] = []

      for (let i = 0; i < samples; i++) {
        let sum = 0
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j])
        }
        waveform.push(sum / blockSize)
      }

      // Normalize waveform
      const maxVal = Math.max(...waveform)
      const normalized = waveform.map(v => v / maxVal)
      setWaveformData(normalized)
      audioContext.close()
    } catch {
      // Fallback to empty waveform if we can't decode
      setWaveformData(new Array(100).fill(0.3).map((v, i) => v + Math.sin(i * 0.1) * 0.1))
    }
  }, [])

  // Draw waveform visualization
  const drawWaveform = React.useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    if (analyser && isPlaying) {
      // Real-time visualization from analyser
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteTimeDomainData(dataArray)

      ctx.fillStyle = '#d6d3d1' // stone-300
      ctx.beginPath()

      const sliceWidth = width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }

      ctx.lineTo(width, height / 2)
      ctx.stroke()
    } else if (waveformData.length > 0) {
      // Static waveform
      const barWidth = width / waveformData.length
      const progress = duration > 0 ? currentTime / duration : 0

      waveformData.forEach((value, index) => {
        const barHeight = value * height * 0.8
        const x = index * barWidth
        const y = (height - barHeight) / 2
        const isPlayed = index / waveformData.length < progress

        ctx.fillStyle = isPlayed ? '#f59e0b' : '#d6d3d1' // amber-500 : stone-300
        ctx.fillRect(x, y, barWidth - 1, barHeight)
      })
    }

    // eslint-disable-next-line react-hooks/immutability -- recursive RAF is intentional
    animationRef.current = requestAnimationFrame(drawWaveform)
  }, [isPlaying, waveformData, currentTime, duration])

  // Start/stop waveform animation
  React.useEffect(() => {
    if (isPlaying) {
      drawWaveform()
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, drawWaveform])

  // Load audio and generate waveform
  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
      generateWaveform(src)
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [src, generateWaveform])

  // Cleanup audio context on unmount
  React.useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Toggle play/pause
  const togglePlay = React.useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      await initAudioContext()
      await audio.play()
    } else {
      audio.pause()
    }
  }, [initAudioContext])

  // Handle seek
  const handleSeek = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={cn('rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 p-4', className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title */}
      {title && (
        <p className="mb-3 text-center text-sm text-stone-600 truncate">{title}</p>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mb-4 flex h-16 items-end justify-center gap-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="w-1 animate-pulse rounded-full bg-stone-300"
              style={{ height: `${SKELETON_HEIGHTS[i]}%` }}
            />
          ))}
        </div>
      )}

      {/* Waveform visualization */}
      <canvas
        ref={canvasRef}
        width={400}
        height={64}
        className="mb-4 w-full rounded-lg bg-stone-50"
      />

      {/* Time display */}
      <div className="mb-3 flex items-center justify-between text-xs text-stone-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Progress bar */}
      <input
        type="range"
        min="0"
        max={duration || 100}
        value={currentTime}
        onChange={handleSeek}
        className="mb-4 h-1 w-full cursor-pointer rounded-full bg-stone-200 accent-amber-500"
        style={{ background: `linear-gradient(to right, #f59e0b ${progress}%, #e7e5e4 ${progress}%)` }}
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {/* Rewind 10s */}
        <button
          onClick={() => {
            const audio = audioRef.current
            if (audio) {
              audio.currentTime = Math.max(0, audio.currentTime - 10)
            }
          }}
          className="text-stone-500 hover:text-amber-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            <text x="9" y="15" fontSize="6" fill="currentColor">10</text>
          </svg>
        </button>

        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-md transition-transform hover:scale-105 disabled:opacity-50"
        >
          {isPlaying ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Forward 10s */}
        <button
          onClick={() => {
            const audio = audioRef.current
            if (audio) {
              audio.currentTime = Math.min(duration, audio.currentTime + 10)
            }
          }}
          className="text-stone-500 hover:text-amber-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
            <text x="9" y="15" fontSize="6" fill="currentColor">10</text>
          </svg>
        </button>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
