'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TextViewerProps {
  content: string
  onClose?: () => void
  className?: string
}

// Parse and render formatted text with basic markdown-like formatting
function renderFormattedText(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let inQuote = false
  let quoteContent: string[] = []

  const flushQuote = () => {
    if (quoteContent.length > 0) {
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className="border-l-4 border-amber-400 pl-4 italic text-stone-600 my-2"
        >
          {quoteContent.join('\n')}
        </blockquote>
      )
      quoteContent = []
    }
    inQuote = false
  }

  lines.forEach((line, index) => {
    // Check for quote lines (starting with > or ：)
    if (line.trim().startsWith('>') || line.trim().startsWith('：') || line.trim().startsWith(':')) {
      if (!inQuote) {
        flushQuote()
        inQuote = true
      }
      const cleanLine = line.trim().replace(/^[>：:]\s*/, '')
      if (cleanLine) {
        quoteContent.push(cleanLine)
      }
      return
    }

    // Flush any pending quote
    if (inQuote) {
      flushQuote()
    }

    // Check for headers
    if (line.match(/^#{1,3}\s/)) {
      const level = line.match(/^(#+)/)?.[1].length || 1
      const content = line.replace(/^#+\s/, '')
      const sizeClass = level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm'
      elements.push(
        <p key={`text-${index}`} className={cn('font-semibold text-stone-800', sizeClass)}>
          {content}
        </p>
      )
      return
    }

    // Check for list items
    if (line.match(/^[-*]\s/) || line.match(/^\d+\.\s/)) {
      elements.push(
        <li key={`text-${index}`} className="ml-4 text-stone-700">
          {line.replace(/^[-*]\s|^\d+\.\s/, '')}
        </li>
      )
      return
    }

    // Check for separator
    if (line.match(/^[-*_]{3,}$/)) {
      elements.push(<hr key={`hr-${index}`} className="my-3 border-stone-200" />)
      return
    }

    // Regular paragraph
    if (line.trim()) {
      // Process inline formatting
      const processed = processInlineFormatting(line)
      elements.push(
        <p key={`text-${index}`} className="text-stone-700 leading-relaxed">
          {processed}
        </p>
      )
    }
  })

  // Flush any remaining quote
  flushQuote()

  return elements
}

// Process inline formatting (bold, italic)
function processInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Check for bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Check for italic
    const italicMatch = remaining.match(/\*(.+?)\*/)

    if (boldMatch && (!italicMatch || boldMatch.index! <= italicMatch.index!)) {
      if (boldMatch.index! > 0) {
        parts.push(remaining.substring(0, boldMatch.index!))
      }
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>)
      remaining = remaining.substring(boldMatch.index! + boldMatch[0].length)
    } else if (italicMatch) {
      if (italicMatch.index! > 0) {
        parts.push(remaining.substring(0, italicMatch.index!))
      }
      parts.push(<em key={key++}>{italicMatch[1]}</em>)
      remaining = remaining.substring(italicMatch.index! + italicMatch[0].length)
    } else {
      parts.push(remaining)
      break
    }
  }

  return parts.length > 0 ? parts : [text]
}

export function TextViewer({ content, onClose, className }: TextViewerProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [needsScroll, setNeedsScroll] = React.useState(false)

  // Check if content overflows
  React.useEffect(() => {
    const el = contentRef.current
    if (el) {
      setNeedsScroll(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
    }
  }, [content])

  const scrollToBottom = React.useCallback(() => {
    const el = contentRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  return (
    <div className={cn('flex flex-col rounded-xl bg-white shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
        <h3 className="text-sm font-medium text-stone-700">文字内容</h3>
        <div className="flex items-center gap-2">
          {needsScroll && !isExpanded && (
            <button
              onClick={scrollToBottom}
              className="text-xs text-amber-600 hover:text-amber-700 transition-colors"
            >
              滚动查看
            </button>
          )}
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

      {/* Content area */}
      <div
        ref={contentRef}
        className={cn(
          'p-4 overflow-y-auto',
          isExpanded ? 'max-h-none' : 'max-h-64'
        )}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="prose prose-stone max-w-none">
          {renderFormattedText(content)}
        </div>
      </div>

      {/* Expand/collapse for long content */}
      {needsScroll && (
        <button
          onClick={() => {
            setIsExpanded(!isExpanded)
            if (!isExpanded) {
              // Scroll to top when expanding
              if (contentRef.current) {
                contentRef.current.scrollTop = 0
              }
            }
          }}
          className="w-full border-t border-stone-100 py-2 text-center text-sm text-amber-600 hover:text-amber-700 transition-colors"
        >
          {isExpanded ? '收起' : '展开全部'}
        </button>
      )}
    </div>
  )
}
