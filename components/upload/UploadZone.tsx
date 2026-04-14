'use client'

import { useCallback, useState, useRef } from 'react'
import type { MemoryType } from '@/lib/types'
import { validateFile, getMemoryType } from '@/lib/utils/file'

// File type validation
interface FileValidation {
  valid: boolean
  error?: string
  memoryType?: MemoryType
}

interface UploadFile {
  file: File
  memoryType: MemoryType
  validation: FileValidation
  id: string
}

interface UploadZoneProps {
  onFilesSelected: (files: UploadFile[]) => void
  maxFiles?: number
  disabled?: boolean
}

export function UploadZone({
  onFilesSelected,
  maxFiles = 100,
  disabled = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback(
    (files: File[]): UploadFile[] => {
      const uploadFiles: UploadFile[] = []
      let error = ''

      for (const file of files) {
        const memoryType = getMemoryType(file)
        const validation = validateFile(file, memoryType)

        if (!validation.valid) {
          error = `${file.name}: ${validation.error}`
          continue
        }

        uploadFiles.push({
          file,
          memoryType,
          validation,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        })
      }

      if (error) {
        setErrorMessage(error)
      } else {
        setErrorMessage(null)
      }

      return uploadFiles
    },
    []
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const items = e.dataTransfer.items
      const files: File[] = []

      // Handle both files and directories
      const processEntry = (entry: FileSystemEntry) => {
        if (entry.isFile) {
          (entry as FileSystemFileEntry).file((file) => {
            files.push(file)
          })
        } else if (entry.isDirectory) {
          const dirReader = (entry as FileSystemDirectoryEntry).createReader()
          dirReader.readEntries((entries) => {
            entries.forEach(processEntry)
          })
        }
      }

      // Collect files from data transfer
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry?.()
            if (entry) {
              processEntry(entry)
            } else {
              const file = item.getAsFile()
              if (file) files.push(file)
            }
          }
        }
      }

      // Fallback to direct files
      if (files.length === 0 && e.dataTransfer.files.length > 0) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          files.push(e.dataTransfer.files[i])
        }
      }

      if (files.length > maxFiles) {
        setErrorMessage(`最多只能选择 ${maxFiles} 个文件`)
        return
      }

      const validatedFiles = validateFiles(files)
      if (validatedFiles.length > 0) {
        onFilesSelected(validatedFiles)
      }
    },
    [disabled, maxFiles, onFilesSelected, validateFiles]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return

      const files = Array.from(e.target.files || [])

      if (files.length > maxFiles) {
        setErrorMessage(`最多只能选择 ${maxFiles} 个文件`)
        return
      }

      const validatedFiles = validateFiles(files)
      if (validatedFiles.length > 0) {
        onFilesSelected(validatedFiles)
      }

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [disabled, maxFiles, onFilesSelected, validateFiles]
  )

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click()
    }
  }, [disabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled]
  )

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,text/plain,application/pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
        // @ts-expect-error - webkitdirectory is not in TypeScript types but supported
        webkitdirectory=""
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="上传文件区域，点击或拖拽文件到这里上传"
        className={`
          relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed
          p-8 transition-all duration-150 cursor-pointer
          ${
            disabled
              ? 'cursor-not-allowed bg-stone-50 border-stone-300 opacity-60'
              : isDragging
                ? 'border-amber-500 bg-amber-50'
                : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50'
          }
        `}
      >
        {/* Icon */}
        <div
          className={`
            mb-4 flex h-16 w-16 items-center justify-center rounded-full
            ${isDragging ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400'}
            transition-colors duration-150
          `}
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-base font-medium text-stone-700">
            {isDragging ? '放开以上传文件' : '点击或拖拽文件到这里'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            支持照片、视频、音频、文字和文档
          </p>
        </div>

        {/* File type hints */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <FileTypeHint type="photo" />
          <FileTypeHint type="video" />
          <FileTypeHint type="audio" />
          <FileTypeHint type="text" />
          <FileTypeHint type="document" />
        </div>

        {/* File size limits */}
        <p className="mt-3 text-xs text-stone-400">
          照片最大 50MB，视频最大 500MB，音频最大 100MB
        </p>

        {/* Max files hint */}
        {maxFiles < 100 && (
          <p className="mt-2 text-xs text-stone-400">最多 {maxFiles} 个文件</p>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}
    </div>
  )
}

// File type hint badge
function FileTypeHint({ type }: { type: MemoryType }) {
  const config: Record<MemoryType, { label: string; icon: React.ReactNode }> = {
    photo: {
      label: '照片',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    video: {
      label: '视频',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    audio: {
      label: '音频',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      ),
    },
    text: {
      label: '文字',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    document: {
      label: '文档',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  }

  const { label, icon } = config[type]

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-600">
      {icon}
      {label}
    </span>
  )
}
