'use client'

import { formatFileSize } from '@/lib/utils/file'

export type UploadStatus = 'waiting' | 'uploading' | 'processing' | 'done' | 'error'

export interface UploadProgressItem {
  id: string
  file: File
  memoryType: 'photo' | 'video' | 'audio' | 'text' | 'document'
  status: UploadStatus
  progress: number
  error?: string
  memoryDate?: string
}

interface UploadProgressProps {
  item: UploadProgressItem
  onRetry?: (id: string) => void
}

export function UploadProgress({ item, onRetry }: UploadProgressProps) {
  const { id, file, memoryType, status, progress, error, memoryDate } = item

  const getStatusText = () => {
    switch (status) {
      case 'waiting':
        return '等待上传'
      case 'uploading':
        return `上传中 ${progress}%`
      case 'processing':
        return '处理中...'
      case 'done':
        return '已完成'
      case 'error':
        return '上传失败'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'waiting':
        return (
          <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'uploading':
        return (
          <svg className="h-5 w-5 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )
      case 'processing':
        return (
          <svg className="h-5 w-5 animate-pulse text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'done':
        return (
          <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
  }

  const getMemoryTypeIcon = () => {
    switch (memoryType) {
      case 'photo':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'audio':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
          </svg>
        )
      case 'text':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'document':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {getMemoryTypeIcon()}
          <span className="truncate text-sm font-medium text-stone-800" title={file.name}>
            {file.name}
          </span>
          <span className="flex-shrink-0 text-xs text-stone-400">
            {formatFileSize(file.size)}
          </span>
        </div>

        {/* Memory date if set */}
        {memoryDate && (
          <p className="mt-0.5 text-xs text-stone-500">
            记忆日期: {memoryDate}
          </p>
        )}

        {/* Progress bar */}
        {(status === 'uploading' || status === 'processing') && (
          <div className="mt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {status === 'error' && error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}

        {/* Status text */}
        <p className="mt-1 text-xs text-stone-500">
          {getStatusText()}
        </p>
      </div>

      {/* Retry button */}
      {status === 'error' && onRetry && (
        <button
          onClick={() => onRetry(id)}
          className="flex-shrink-0 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200"
        >
          重试
        </button>
      )}
    </div>
  )
}
