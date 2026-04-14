import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  groupMemoriesByDate,
  applyFilters,
  getAllTags,
  truncateText,
  formatMemoryDate,
  MEMORY_TYPE_LABELS,
  type Memory,
  type TimelineFilters,
} from '@/lib/utils/timeline'

// Helper to create mock memories
function createMockMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: crypto.randomUUID(),
    profile_id: 'profile-1',
    contributor_id: 'user-1',
    type: 'photo',
    file_path: '/test/path.jpg',
    thumbnail_path: '/test/thumb.jpg',
    content: null,
    memory_date: '2024-06-15',
    memory_date_precision: 'day',
    tags: [],
    annotation: null,
    source_label: '原始记录',
    exif_data: null,
    file_size: 1024,
    mime_type: 'image/jpeg',
    sort_order: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('groupMemoriesByDate', () => {
  it('should group 10 memories correctly by year/month/day', () => {
    // Create 10 mock memories across different dates
    const memories: Memory[] = [
      // 2024
      createMockMemory({ id: '1', memory_date: '2024-01-15', memory_date_precision: 'day' }),
      createMockMemory({ id: '2', memory_date: '2024-01-20', memory_date_precision: 'day' }),
      createMockMemory({ id: '3', memory_date: '2024-03-10', memory_date_precision: 'day' }),
      createMockMemory({ id: '4', memory_date: '2024-12-25', memory_date_precision: 'day' }),
      // 2023
      createMockMemory({ id: '5', memory_date: '2023-05-01', memory_date_precision: 'day' }),
      createMockMemory({ id: '6', memory_date: '2023-08-15', memory_date_precision: 'day' }),
      createMockMemory({ id: '7', memory_date: '2023-12-31', memory_date_precision: 'day' }),
      // 2022
      createMockMemory({ id: '8', memory_date: '2022-06-15', memory_date_precision: 'day' }),
      createMockMemory({ id: '9', memory_date: '2022-09-01', memory_date_precision: 'day' }),
      // Unknown date
      createMockMemory({ id: '10', memory_date: null, memory_date_precision: 'unknown' }),
    ]

    const groups = groupMemoriesByDate(memories)

    // Should have 3 years + 1 unknown group = 4 groups
    expect(groups).toHaveLength(4)

    // First group should be 2024 (most recent year)
    expect(groups[0].type).toBe('year')
    if (groups[0].type === 'year') {
      const yearData = groups[0].data
      expect(yearData.year).toBe('2024')
      expect(yearData.yearLabel).toBe('2024年')
      // 4 memories across 3 months
      expect(yearData.months).toHaveLength(3)
    }

    // Last group should be unknown
    const unknownGroup = groups[groups.length - 1]
    expect(unknownGroup.type).toBe('unknown')
    if (unknownGroup.type === 'unknown') {
      expect(unknownGroup.data.memories).toHaveLength(1)
      expect(unknownGroup.data.label).toBe('日期未知')
    }
  })

  it('should sort memories within day by created_at descending', () => {
    const memories: Memory[] = [
      createMockMemory({
        id: '1',
        memory_date: '2024-01-15',
        created_at: '2024-01-15T10:00:00Z',
      }),
      createMockMemory({
        id: '2',
        memory_date: '2024-01-15',
        created_at: '2024-01-15T12:00:00Z', // newer
      }),
      createMockMemory({
        id: '3',
        memory_date: '2024-01-15',
        created_at: '2024-01-15T08:00:00Z', // oldest
      }),
    ]

    const groups = groupMemoriesByDate(memories)

    const dayGroup = groups[0].type === 'year' ? groups[0].data.months[0].days[0] : null
    expect(dayGroup).not.toBeNull()
    if (dayGroup) {
      expect(dayGroup.memories[0].id).toBe('2') // newest first
      expect(dayGroup.memories[1].id).toBe('1')
      expect(dayGroup.memories[2].id).toBe('3') // oldest last
    }
  })

  it('should handle month precision dates', () => {
    const memories: Memory[] = [
      createMockMemory({
        id: '1',
        memory_date: '2024-06',
        memory_date_precision: 'month',
      }),
    ]

    const groups = groupMemoriesByDate(memories)
    expect(groups).toHaveLength(1)
    expect(groups[0].type).toBe('year')
  })

  it('should handle year precision dates', () => {
    const memories: Memory[] = [
      createMockMemory({
        id: '1',
        memory_date: '2024',
        memory_date_precision: 'year',
      }),
    ]

    const groups = groupMemoriesByDate(memories)
    expect(groups).toHaveLength(1)
    expect(groups[0].type).toBe('year')
  })

  it('should return empty groups for empty memories array', () => {
    const groups = groupMemoriesByDate([])
    expect(groups).toHaveLength(0)
  })

  it('should put all memories in unknown group when no dates', () => {
    const memories: Memory[] = [
      createMockMemory({ id: '1', memory_date: null, memory_date_precision: 'unknown' }),
      createMockMemory({ id: '2', memory_date: null, memory_date_precision: 'unknown' }),
    ]

    const groups = groupMemoriesByDate(memories)

    expect(groups).toHaveLength(1)
    expect(groups[0].type).toBe('unknown')
    if (groups[0].type === 'unknown') {
      expect(groups[0].data.memories).toHaveLength(2)
    }
  })
})

describe('applyFilters', () => {
  const baseMemories: Memory[] = [
    createMockMemory({ id: '1', type: 'photo', tags: ['旅行', '家庭'] }),
    createMockMemory({ id: '2', type: 'video', tags: ['旅行'] }),
    createMockMemory({ id: '3', type: 'audio', tags: ['家庭'] }),
    createMockMemory({ id: '4', type: 'text', tags: ['工作'] }),
    createMockMemory({ id: '5', type: 'document', tags: ['旅行', '工作'] }),
  ]

  it('should return all memories when no filters', () => {
    const result = applyFilters(baseMemories, {})
    expect(result).toHaveLength(5)
  })

  it('should filter by type', () => {
    const filters: TimelineFilters = { type: 'photo' }
    const result = applyFilters(baseMemories, filters)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('photo')
  })

  it('should filter by tags', () => {
    const filters: TimelineFilters = { tags: ['旅行'] }
    const result = applyFilters(baseMemories, filters)
    expect(result).toHaveLength(3) // 1, 2, 5
  })

  it('should filter by multiple tags (OR logic)', () => {
    const filters: TimelineFilters = { tags: ['旅行', '家庭'] }
    const result = applyFilters(baseMemories, filters)
    expect(result).toHaveLength(4) // 1, 2, 3, 5 (all except 4)
  })

  it('should filter by quick date range this_year', () => {
    const thisYear = new Date().getFullYear().toString()
    const memories: Memory[] = [
      createMockMemory({ id: '1', memory_date: `${thisYear}-06-15` }),
      createMockMemory({ id: '2', memory_date: `${thisYear}-01-01` }),
      createMockMemory({ id: '3', memory_date: `${parseInt(thisYear) - 1}-06-15` }),
    ]

    const filters: TimelineFilters = { quickDateRange: 'this_year' }
    const result = applyFilters(memories, filters)
    expect(result).toHaveLength(2)
  })

  it('should filter by quick date range older', () => {
    const thisYear = new Date().getFullYear()
    // "older" means years before last year (thisYear - 1)
    // So with thisYear=2026, older means years < 2025
    // 2024 is < 2025, so it should be included
    // 2021 is also < 2025, so it should be included
    const memories: Memory[] = [
      createMockMemory({ id: '1', memory_date: `${thisYear}-06-15` }), // this year - filtered out
      createMockMemory({ id: '2', memory_date: `${thisYear - 1}-06-15` }), // last year - filtered out
      createMockMemory({ id: '3', memory_date: `${thisYear - 2}-06-15` }), // older - included
    ]

    const filters: TimelineFilters = { quickDateRange: 'older' }
    const result = applyFilters(memories, filters)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })
})

describe('getAllTags', () => {
  it('should extract and sort unique tags', () => {
    const memories: Memory[] = [
      createMockMemory({ tags: ['旅行', '家庭'] }),
      createMockMemory({ tags: ['旅行', '工作'] }),
      createMockMemory({ tags: ['家庭'] }),
      createMockMemory({ tags: [] }),
    ]

    const tags = getAllTags(memories)
    // Tags are sorted by Unicode code point (Chinese chars sorted by their Unicode values)
    // 家=23478, 工=24037, 旅=26053
    expect(tags).toEqual(['家庭', '工作', '旅行'])
  })

  it('should return empty array for no tags', () => {
    const memories: Memory[] = [
      createMockMemory({ tags: [] }),
    ]

    const tags = getAllTags(memories)
    expect(tags).toEqual([])
  })
})

describe('truncateText', () => {
  it('should not truncate short text', () => {
    const result = truncateText('Hello', 10)
    expect(result).toBe('Hello')
  })

  it('should truncate long text with ellipsis', () => {
    const result = truncateText('Hello World', 5)
    expect(result).toBe('Hello...')
  })

  it('should handle exact length', () => {
    const result = truncateText('Hello', 5)
    expect(result).toBe('Hello')
  })
})

describe('formatMemoryDate', () => {
  it('should format day precision correctly', () => {
    const result = formatMemoryDate('2024-06-15', 'day')
    expect(result).toBe('2024年6月15日')
  })

  it('should format month precision correctly', () => {
    const result = formatMemoryDate('2024-06-15', 'month')
    expect(result).toBe('2024年6月')
  })

  it('should format year precision correctly', () => {
    const result = formatMemoryDate('2024-06-15', 'year')
    expect(result).toBe('2024年')
  })

  it('should return unknown for null date', () => {
    const result = formatMemoryDate(null, 'day')
    expect(result).toBe('日期未知')
  })

  it('should return unknown for unknown precision', () => {
    const result = formatMemoryDate('2024-06-15', 'unknown')
    expect(result).toBe('日期未知')
  })
})

describe('MEMORY_TYPE_LABELS', () => {
  it('should have all memory type labels in Chinese', () => {
    expect(MEMORY_TYPE_LABELS.all).toBe('全部')
    expect(MEMORY_TYPE_LABELS.photo).toBe('照片')
    expect(MEMORY_TYPE_LABELS.video).toBe('视频')
    expect(MEMORY_TYPE_LABELS.audio).toBe('语音')
    expect(MEMORY_TYPE_LABELS.text).toBe('文字')
    expect(MEMORY_TYPE_LABELS.document).toBe('文档')
  })
})
