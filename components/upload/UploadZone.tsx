'use client'

import { useCallback, useState, useRef } from 'react'
import type { MemoryType } from '@/lib/types'
import { validateFile, getMemoryType } from '@/lib/utils/file'
import { CloudUpload, Image as ImageIcon, Video, Mic, FileText, File as FileIcon } from 'lucide-react'

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
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,text/plain,application/pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* V2 Style Upload Drop zone */}
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
          p-12 text-center group cursor-pointer transition-all duration-300 overflow-hidden
          ${
            disabled
              ? 'cursor-not-allowed bg-stone-50/50 border-stone-200 opacity-60'
              : isDragging
                ? 'border-amber-500 bg-amber-50/80 scale-[1.01] shadow-inner'
                : 'border-amber-700/30 bg-stone-50/50 hover:bg-stone-100/80 hover:border-amber-700/50'
          }
        `}
      >
        {/* Glow effect on drag */}
        {isDragging && <div className="absolute inset-0 bg-amber-200/20 blur-xl rounded-xl -z-10" />}

        {/* Big V2 Icon */}
        <div
          className={`
            mb-6 flex h-20 w-20 items-center justify-center rounded-full
            transition-all duration-300 group-hover:scale-110
            ${disabled ? 'bg-stone-200 text-stone-500' : 'bg-amber-100 text-amber-700'}
          `}
        >
          <CloudUpload className="h-10 w-10" />
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold mb-2 text-stone-900">
          {isDragging ? '放开以上传文件' : '点击或拖拽文件至此处'}
        </h3>
        <p className="mb-6 text-sm text-stone-500">
          支持 JPG, PNG, MP4, PDF (最大 100MB)
        </p>

        {/* Button Override */}
        <button 
          className={`
            px-8 py-3 rounded-full font-semibold shadow-md transition-all pointer-events-none
            ${disabled ? 'bg-stone-300 text-stone-50' : 'bg-amber-700 text-white group-hover:bg-amber-800'}
          `}
        >
          从本地选择
        </button>

        {/* Max files hint */}
        {maxFiles < 100 && (
          <p className="absolute bottom-4 left-0 right-0 text-xs text-stone-400">最多支持 {maxFiles} 个文件同时处理</p>
        )}
      </div>

      {/* File type hints */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <FileTypeHint type="photo" />
        <FileTypeHint type="video" />
        <FileTypeHint type="audio" />
        <FileTypeHint type="text" />
        <FileTypeHint type="document" />
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center animate-in slide-in-from-top-2">
          {errorMessage}
        </div>
      )}
    </div>
  )
}

function FileTypeHint({ type }: { type: MemoryType }) {
  const config = {
    photo: { label: '照片', icon: <ImageIcon className="h-3.5 w-3.5" /> },
    video: { label: '视频', icon: <Video className="h-3.5 w-3.5" /> },
    audio: { label: '音频', icon: <Mic className="h-3.5 w-3.5" /> },
    text: { label: '文字', icon: <FileText className="h-3.5 w-3.5" /> },
    document: { label: '文档', icon: <FileIcon className="h-3.5 w-3.5" /> },
  }

  const { label, icon } = config[type]

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100/80 px-3 py-1 text-xs font-medium text-stone-600 border border-stone-200">
      {icon}
      {label}
    </span>
  )
}
