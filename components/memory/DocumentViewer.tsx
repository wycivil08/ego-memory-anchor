'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DocumentViewerProps {
  src: string
  fileName?: string
  mimeType?: string | null
  onClose?: () => void
  className?: string
}

type DocumentType = 'pdf' | 'image' | 'unknown'

function getDocumentType(mimeType: string | null | undefined): DocumentType {
  if (!mimeType) return 'unknown'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('image/')) return 'image'
  return 'unknown'
}

export function DocumentViewer({ src, fileName, mimeType, onClose, className }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const documentType = getDocumentType(mimeType)
  const isImage = documentType === 'image'
  const isPdf = documentType === 'pdf'

  // Handle download
  const handleDownload = React.useCallback(() => {
    const link = document.createElement('a')
    link.href = src
    link.download = fileName || 'document'
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [src, fileName])

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    if (onClose) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Reset state when source changes
  React.useEffect(() => {
    setIsLoading(true)
    setError(null)
    setCurrentPage(1)
  }, [src])

  return (
    <div className={cn('flex flex-col rounded-xl bg-white shadow-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="h-5 w-5 flex-shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="truncate text-sm text-stone-700">{fileName || '文档'}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-md bg-stone-100 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载
          </button>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Document content */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-stone-100">
        {error ? (
          /* Error state */
          <div className="flex h-64 flex-col items-center justify-center text-stone-500">
            <svg className="mb-3 h-12 w-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm">{error}</p>
            <button
              onClick={handleDownload}
              className="mt-3 text-sm text-amber-600 hover:text-amber-700"
            >
              尝试下载查看
            </button>
          </div>
        ) : isPdf ? (
          /* PDF viewer using iframe */
          <div className="relative h-full min-h-96">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-amber-500" />
              </div>
            )}
            <iframe
              src={`${src}#toolbar=0&navpanes=0&scrollbar=1`}
              className="h-full w-full"
              title={fileName || 'PDF 文档'}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setError('无法加载 PDF')
              }}
            />
          </div>
        ) : isImage ? (
          /* Image viewer */
          <div className="flex h-full min-h-96 items-center justify-center p-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-amber-500" />
              </div>
            )}
            <img
              src={src}
              alt={fileName || '图片文档'}
              className={cn(
                'max-h-full max-w-full object-contain rounded-lg shadow-md',
                isLoading ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setError('无法加载图片')
              }}
            />
          </div>
        ) : (
          /* Unsupported type */
          <div className="flex h-64 flex-col items-center justify-center text-stone-500">
            <svg className="mb-3 h-12 w-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">此文件类型暂不支持预览</p>
            <button
              onClick={handleDownload}
              className="mt-3 text-sm text-amber-600 hover:text-amber-700"
            >
              下载文件
            </button>
          </div>
        )}
      </div>

      {/* PDF page navigation (if PDF) */}
      {isPdf && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-stone-100 py-3">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="rounded-md bg-stone-100 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <span className="text-sm text-stone-500">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-md bg-stone-100 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
