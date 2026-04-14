'use client'

import { useRef, useEffect, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'
import { TimelineItem } from './TimelineItem'
import { TimelineEmpty } from './TimelineEmpty'
import {
  type TimelineGroup,
  type Memory,
} from '@/lib/utils/timeline'

interface TimelineProps {
  groups: TimelineGroup[]
  profileId: string
  hasMore?: boolean
  onLoadMore?: () => void
  isLoading?: boolean
}

// Timeline row for virtualization
interface TimelineRow {
  type: 'year-header' | 'month-header' | 'memory-row'
  key: string
  year?: string
  yearLabel?: string
  month?: string
  monthLabel?: string
  memories: Memory[]
  memory?: Memory
}

export function Timeline({ groups, profileId, hasMore, onLoadMore, isLoading }: TimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(3) // Default to desktop 3-column

  // Responsive column layout
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) {
        setColumns(1) // Mobile: single column
      } else if (width < 1024) {
        setColumns(2) // Tablet: double column
      } else {
        setColumns(3) // Desktop: triple column
      }
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // Flatten timeline into rows for virtualization
  const rows: TimelineRow[] = []

  for (const group of groups) {
    if (group.type === 'year') {
      const yearData = group.data
      // Year header row
      rows.push({
        type: 'year-header',
        key: `year-${yearData.year}`,
        year: yearData.year,
        yearLabel: yearData.yearLabel,
        memories: [],
      })

      // For each month, add month header and then memory rows
      for (const month of yearData.months) {
        rows.push({
          type: 'month-header',
          key: `month-${month.month}`,
          month: month.month,
          monthLabel: month.monthLabel,
          memories: [],
        })

        // Collect all memories from all days in this month
        for (const day of month.days) {
          for (const memory of day.memories) {
            rows.push({
              type: 'memory-row',
              key: `memory-${memory.id}`,
              memories: [memory],
              memory,
            })
          }
        }
      }
    } else {
      // Unknown group
      rows.push({
        type: 'year-header',
        key: 'unknown',
        yearLabel: group.data.label,
        memories: [],
      })

      for (const memory of group.data.memories) {
        rows.push({
          type: 'memory-row',
          key: `memory-${memory.id}`,
          memories: [memory],
          memory,
        })
      }
    }
  }

  // Virtual scroll setup
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = rows[index]
      if (row.type === 'year-header') return 48
      if (row.type === 'month-header') return 36
      return 280 // Memory card height
    },
    overscan: 5,
    getItemKey: (index) => rows[index].key,
  })

  const virtualItems = virtualizer.getVirtualItems()

  // Load more when reaching end
  useEffect(() => {
    if (!hasMore || !onLoadMore || isLoading) return

    const lastItem = virtualItems[virtualItems.length - 1]
    if (lastItem && lastItem.index >= rows.length - 10) {
      onLoadMore()
    }
  }, [virtualItems, hasMore, onLoadMore, isLoading, rows.length])

  if (rows.length === 0) {
    return <TimelineEmpty profileId={profileId} />
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-200px)] overflow-auto"
    >
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualItems.map((virtualItem) => {
          const row = rows[virtualItem.index]

          if (row.type === 'year-header') {
            return (
              <div
                key={virtualItem.key}
                className={cn(
                  'sticky top-0 z-20 bg-stone-50 px-2 py-3 border-b border-stone-200',
                )}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <h2 className="text-xl font-medium text-stone-700">
                  {row.yearLabel}
                </h2>
              </div>
            )
          }

          if (row.type === 'month-header') {
            return (
              <div
                key={virtualItem.key}
                className="bg-stone-50/80 px-2 py-2 backdrop-blur-sm"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <h3 className="text-sm font-medium text-stone-500">
                  {row.monthLabel}
                </h3>
              </div>
            )
          }

          // Memory row
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '8px',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                }}
              >
                {row.memories.map((memory) => (
                  <TimelineItem
                    key={memory.id}
                    memory={memory}
                    profileId={profileId}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          <span className="ml-2 text-sm text-stone-500">加载中...</span>
        </div>
      )}

      {/* Load more trigger */}
      {hasMore && !isLoading && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  )
}
