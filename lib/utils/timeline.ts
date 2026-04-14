// Re-export types from lib/types
import type { Memory, DatePrecision } from '@/lib/types'
export type { Memory, DatePrecision }
export type { CreateMemoryInput, MemoryFilters, ProfileWithMemoryCount } from '@/lib/types'

// Memory types for timeline
export type MemoryType = 'photo' | 'video' | 'audio' | 'text' | 'document'

export type MemoryDatePrecision = 'day' | 'month' | 'year' | 'unknown'

// Extended Memory with contributor join (used in timeline queries)
export interface MemoryWithContributor {
  id: string
  profile_id: string
  contributor_id: string
  type: MemoryType
  file_path: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  thumbnail_path: string | null
  duration_seconds: number | null
  content: string | null
  memory_date: string | null
  memory_date_precision: MemoryDatePrecision
  tags: string[]
  annotation: string | null
  source_label: string
  import_source: 'upload' | 'wechat_import'
  exif_data: Record<string, unknown> | null
  sort_order: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  // Joined data
  contributor?: {
    id: string
    email?: string
    user_metadata?: {
      name?: string
      avatar_url?: string
    }
  }
}

// Timeline grouping structures
export interface TimelineDay {
  date: string // YYYY-MM-DD format, or null for unknown
  dateLabel: string // Human readable label like "2024年1月15日"
  memories: Memory[]
}

export interface TimelineMonth {
  month: string // YYYY-MM format
  monthLabel: string // Human readable like "2024年1月"
  days: TimelineDay[]
}

export interface TimelineYear {
  year: string // YYYY format
  yearLabel: string // Human readable like "2024年"
  months: TimelineMonth[]
}

export interface TimelineUnknown {
  label: string
  memories: Memory[]
}

export type TimelineGroup =
  | { type: 'year'; data: TimelineYear }
  | { type: 'unknown'; data: TimelineUnknown }

// Filter parameters
export interface TimelineFilters {
  type?: MemoryType | 'all'
  tags?: string[]
  dateRange?: {
    start?: string
    end?: string
  }
  quickDateRange?: 'all' | 'this_year' | 'last_year' | 'older'
}

// Default initial page size
export const TIMELINE_PAGE_SIZE = 50

// Memory type labels
export const MEMORY_TYPE_LABELS: Record<MemoryType | 'all', string> = {
  all: '全部',
  photo: '照片',
  video: '视频',
  audio: '语音',
  text: '文字',
  document: '文档',
}

// Get memory type icon name
export function getMemoryTypeIcon(type: MemoryType): string {
  const icons: Record<MemoryType, string> = {
    photo: 'image',
    video: 'video',
    audio: 'audio',
    text: 'text',
    document: 'document',
  }
  return icons[type]
}

// Format date for display
export function formatMemoryDate(dateStr: string | null, precision: MemoryDatePrecision): string {
  if (!dateStr) return '日期未知'

  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const yearStr = `${year}年`
  const monthStr = `${month}月`
  const dayStr = `${day}日`

  switch (precision) {
    case 'year':
      return yearStr
    case 'month':
      return `${yearStr}${monthStr}`
    case 'day':
      return `${yearStr}${monthStr}${dayStr}`
    case 'unknown':
    default:
      return '日期未知'
  }
}

// Format date as YYYY-MM-DD
export function toISODateString(dateStr: string | null): string | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return date.toISOString().split('T')[0]
}

// Group memories by year/month/day
export function groupMemoriesByDate(memories: Memory[]): TimelineGroup[] {
  const yearMap = new Map<string, Map<string, Map<string, Memory[]>>>()
  const unknownMemories: Memory[] = []

  // First pass: separate dated and undated memories
  for (const memory of memories) {
    if (!memory.memory_date || memory.memory_date_precision === 'unknown') {
      unknownMemories.push(memory)
      continue
    }

    const date = new Date(memory.memory_date)
    const year = date.getFullYear().toString()
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map())
    }
    const monthMap = yearMap.get(year)!
    if (!monthMap.has(month)) {
      monthMap.set(month, new Map())
    }
    const dayMap = monthMap.get(month)!
    if (!dayMap.has(day)) {
      dayMap.set(day, [])
    }
    dayMap.get(day)!.push(memory)
  }

  // Build timeline groups
  const groups: TimelineGroup[] = []

  // Sort years in descending order
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => Number(b) - Number(a))

  for (const year of sortedYears) {
    const monthMap = yearMap.get(year)!
    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a))

    const months: TimelineMonth[] = []

    for (const monthStr of sortedMonths) {
      const dayMap = monthMap.get(monthStr)!
      const sortedDays = Array.from(dayMap.keys()).sort((a, b) => b.localeCompare(a))

      const days: TimelineDay[] = []

      for (const dayStr of sortedDays) {
        const dayMemories = dayMap.get(dayStr)!
        // Sort memories within day by created_at descending (newest first)
        dayMemories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        const date = new Date(dayStr)
        days.push({
          date: dayStr,
          dateLabel: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
          memories: dayMemories,
        })
      }

      const [yearStr, monthNum] = monthStr.split('-')
      months.push({
        month: monthStr,
        monthLabel: `${yearStr}年${parseInt(monthNum, 10)}月`,
        days,
      })
    }

    groups.push({
      type: 'year',
      data: {
        year,
        yearLabel: `${year}年`,
        months,
      } as TimelineYear,
    })
  }

  // Add unknown memories at the end
  if (unknownMemories.length > 0) {
    // Sort by created_at descending
    unknownMemories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    groups.push({
      type: 'unknown',
      data: {
        label: '日期未知',
        memories: unknownMemories,
      } as TimelineUnknown,
    })
  }

  return groups
}

// Apply filters to memories
export function applyFilters(memories: Memory[], filters: TimelineFilters): Memory[] {
  return memories.filter((memory) => {
    // Type filter
    if (filters.type && filters.type !== 'all') {
      if (memory.type !== filters.type) return false
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) => memory.tags.includes(tag))
      if (!hasMatchingTag) return false
    }

    // Date range filter
    if (filters.dateRange || filters.quickDateRange) {
      const memoryDate = memory.memory_date ? new Date(memory.memory_date) : null

      if (filters.quickDateRange && filters.quickDateRange !== 'all') {
        if (!memoryDate) return false

        const now = new Date()
        const thisYear = now.getFullYear()

        switch (filters.quickDateRange) {
          case 'this_year':
            if (memoryDate.getFullYear() !== thisYear) return false
            break
          case 'last_year':
            if (memoryDate.getFullYear() !== thisYear - 1) return false
            break
          case 'older':
            if (memoryDate.getFullYear() >= thisYear - 1) return false
            break
        }
      } else if (filters.dateRange) {
        if (!memoryDate) return false

        if (filters.dateRange.start) {
          const start = new Date(filters.dateRange.start)
          if (memoryDate < start) return false
        }

        if (filters.dateRange.end) {
          const end = new Date(filters.dateRange.end)
          // Set end to end of day
          end.setHours(23, 59, 59, 999)
          if (memoryDate > end) return false
        }
      }
    }

    return true
  })
}

// Get all unique tags from memories
export function getAllTags(memories: Memory[]): string[] {
  const tagSet = new Set<string>()
  for (const memory of memories) {
    for (const tag of memory.tags) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
}

// Extract unique contributor info from memories
export interface MemoryContributor {
  id: string
  displayName: string
  avatarUrl: string | null
}

export function getMemoryContributor(memory: MemoryWithContributor): MemoryContributor | null {
  if (!memory.contributor) return null

  return {
    id: memory.contributor.id,
    displayName: memory.contributor.user_metadata?.name || memory.contributor.email || '家人',
    avatarUrl: memory.contributor.user_metadata?.avatar_url || null,
  }
}

// Truncate text for preview
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
