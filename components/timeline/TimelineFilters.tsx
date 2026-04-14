'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { MEMORY_TYPE_LABELS, type MemoryType, type TimelineFilters } from '@/lib/utils/timeline'

interface TimelineFiltersProps {
  availableTags: string[]
  className?: string
}

// Icons
function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function AudioIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function TextIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-3 w-3', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// Type button component
const typeIcons: Record<MemoryType, React.FC<{ className?: string }>> = {
  photo: PhotoIcon,
  video: VideoIcon,
  audio: AudioIcon,
  text: TextIcon,
  document: DocumentIcon,
}

interface TypeFilterButtonProps {
  type: MemoryType | 'all'
  selected: boolean
  onClick: () => void
}

function TypeFilterButton({ type, selected, onClick }: TypeFilterButtonProps) {
  const Icon = type === 'all' ? FilterIcon : typeIcons[type as MemoryType]
  const label = MEMORY_TYPE_LABELS[type]

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
        selected
          ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
          : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

// Date range quick options
const quickDateRanges = [
  { value: 'all', label: '全部' },
  { value: 'this_year', label: '今年' },
  { value: 'last_year', label: '去年' },
  { value: 'older', label: '更早' },
] as const

interface DateRangeButtonProps {
  value: string
  selected: boolean
  onClick: () => void
}

function DateRangeButton({ value, selected, onClick }: DateRangeButtonProps) {
  const range = quickDateRanges.find((r) => r.value === value)
  if (!range) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
        selected
          ? 'bg-stone-700 text-white'
          : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
      )}
    >
      {range.label}
    </button>
  )
}

// Tag chip component
interface TagChipProps {
  tag: string
  selected: boolean
  onClick: () => void
}

function TagChip({ tag, selected, onClick }: TagChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-150',
        selected
          ? 'bg-stone-700 text-white'
          : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50'
      )}
    >
      {tag}
      {selected && <XIcon />}
    </button>
  )
}

// Active filter chip for display
interface ActiveFilterChipProps {
  label: string
  onRemove: () => void
}

function ActiveFilterChip({ label, onRemove }: ActiveFilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700 ring-1 ring-amber-200">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-amber-100"
      >
        <XIcon />
      </button>
    </span>
  )
}

export function TimelineFilters({ availableTags, className }: TimelineFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Parse current filters from URL
  const currentType = (searchParams.get('type') as MemoryType | 'all') || 'all'
  const currentTags = useMemo(() => {
    const tags = searchParams.get('tags')
    return tags ? tags.split(',').filter(Boolean) : []
  }, [searchParams])
  const currentQuickRange = (searchParams.get('quickRange') as TimelineFilters['quickDateRange']) || 'all'

  // Update URL with new filters
  const updateFilters = useCallback(
    (updates: Partial<{ type: string; tags: string[]; quickRange: string }>) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.type !== undefined) {
        if (updates.type === 'all') {
          params.delete('type')
        } else {
          params.set('type', updates.type)
        }
      }

      if (updates.tags !== undefined) {
        if (updates.tags.length === 0) {
          params.delete('tags')
        } else {
          params.set('tags', updates.tags.join(','))
        }
      }

      if (updates.quickRange !== undefined) {
        if (updates.quickRange === 'all') {
          params.delete('quickRange')
        } else {
          params.set('quickRange', updates.quickRange)
        }
      }

      // Reset page when filters change
      params.delete('page')

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // Toggle type filter
  const handleTypeToggle = (type: MemoryType | 'all') => {
    updateFilters({ type })
  }

  // Toggle tag filter
  const handleTagToggle = (tag: string) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    updateFilters({ tags: newTags })
  }

  // Toggle date range filter
  const handleDateRangeToggle = (range: string) => {
    updateFilters({ quickRange: range })
  }

  // Remove type filter
  const handleRemoveType = () => {
    updateFilters({ type: 'all' })
  }

  // Remove all filters
  const handleClearAll = () => {
    router.push(pathname, { scroll: false })
  }

  // Check if any filters are active
  const hasActiveFilters = currentType !== 'all' || currentTags.length > 0 || currentQuickRange !== 'all'

  // Get active filter count
  const activeFilterCount = [
    currentType !== 'all',
    currentTags.length > 0,
    currentQuickRange !== 'all',
  ].filter(Boolean).length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Type filters */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          类型
        </h3>
        <div className="flex flex-wrap gap-2">
          <TypeFilterButton
            type="all"
            selected={currentType === 'all'}
            onClick={() => handleTypeToggle('all')}
          />
          <TypeFilterButton
            type="photo"
            selected={currentType === 'photo'}
            onClick={() => handleTypeToggle('photo')}
          />
          <TypeFilterButton
            type="video"
            selected={currentType === 'video'}
            onClick={() => handleTypeToggle('video')}
          />
          <TypeFilterButton
            type="audio"
            selected={currentType === 'audio'}
            onClick={() => handleTypeToggle('audio')}
          />
          <TypeFilterButton
            type="text"
            selected={currentType === 'text'}
            onClick={() => handleTypeToggle('text')}
          />
          <TypeFilterButton
            type="document"
            selected={currentType === 'document'}
            onClick={() => handleTypeToggle('document')}
          />
        </div>
      </div>

      {/* Date range filters */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          时间
        </h3>
        <div className="flex flex-wrap gap-2">
          {quickDateRanges.map((range) => (
            <DateRangeButton
              key={range.value}
              value={range.value}
              selected={currentQuickRange === range.value}
              onClick={() => handleDateRangeToggle(range.value)}
            />
          ))}
        </div>
      </div>

      {/* Tag filters (only show if there are tags) */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <TagChip
                key={tag}
                tag={tag}
                selected={currentTags.includes(tag)}
                onClick={() => handleTagToggle(tag)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <span className="text-xs text-stone-400">当前筛选:</span>
          {currentType !== 'all' && (
            <ActiveFilterChip
              label={MEMORY_TYPE_LABELS[currentType]}
              onRemove={handleRemoveType}
            />
          )}
          {currentQuickRange !== 'all' && (
            <ActiveFilterChip
              label={quickDateRanges.find((r) => r.value === currentQuickRange)?.label || ''}
              onRemove={() => handleDateRangeToggle('all')}
            />
          )}
          {currentTags.map((tag) => (
            <ActiveFilterChip
              key={tag}
              label={tag}
              onRemove={() => handleTagToggle(tag)}
            />
          ))}
          <button
            onClick={handleClearAll}
            className="ml-2 text-xs text-stone-400 hover:text-stone-600"
          >
            清除全部
          </button>
        </div>
      )}

      {/* Filter count badge */}
      {activeFilterCount > 0 && (
        <div className="text-xs text-stone-400">
          已选择 {activeFilterCount} 个筛选条件
        </div>
      )}
    </div>
  )
}
