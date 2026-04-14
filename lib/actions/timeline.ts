'use server'

import { createClient } from '@/lib/supabase/server'
import type { ProfileWithMemoryCount, Memory } from '@/lib/types'
import type { TimelineFilters, TimelineGroup, MemoryWithContributor } from '@/lib/utils/timeline'
import { groupMemoriesByDate, TIMELINE_PAGE_SIZE } from '@/lib/utils/timeline'

export async function fetchTimelineDataAction(
  profileId: string,
  _profile: ProfileWithMemoryCount,
  filters?: TimelineFilters,
  page: number = 0
): Promise<{ memories: MemoryWithContributor[]; hasMore: boolean; totalCount: number }> {
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('memories')
    .select(`
      *,
      contributor:auth.users!memories_contributor_id_fkey (
        id,
        email,
        user_metadata
      )
    `, { count: 'exact' })
    .eq('profile_id', profileId)
    .order('memory_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  // Apply type filter
  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  // Apply pagination
  const from = page * TIMELINE_PAGE_SIZE
  const to = from + TIMELINE_PAGE_SIZE - 1

  // Execute query with pagination
  const { data: memories, error, count } = await query.range(from, to)

  if (error) {
    console.error('Error fetching timeline data:', error)
    return { memories: [], hasMore: false, totalCount: 0 }
  }

  // Transform memories to ensure proper types
  const transformedMemories: MemoryWithContributor[] = (memories || []).map((m) => {
    const memory = m as unknown as Record<string, unknown>
    return {
      ...memory,
      tags: Array.isArray(memory.tags) ? memory.tags as string[] : [],
      memory_date_precision: (memory.memory_date_precision as Memory['memory_date_precision']) || 'day',
      source_label: (memory.source_label as string) || '原始记录',
      import_source: (memory.import_source as 'upload' | 'wechat_import') || 'upload',
    } as MemoryWithContributor
  })

  // Apply tag and date filters in memory (since we can't do these easily in Supabase query)
  let filteredMemories = transformedMemories
  if (filters?.tags && filters.tags.length > 0) {
    filteredMemories = filteredMemories.filter((m) =>
      filters.tags!.some((tag) => m.tags.includes(tag))
    )
  }

  if (filters?.dateRange || filters?.quickDateRange) {
    // Apply date filters
    filteredMemories = filteredMemories.filter((memory) => {
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
          end.setHours(23, 59, 59, 999)
          if (memoryDate > end) return false
        }
      }

      return true
    })
  }

  const totalCount = count || 0
  const hasMore = to < totalCount - 1

  return { memories: filteredMemories, hasMore, totalCount }
}

export async function fetchAllMemoriesForTagsAction(
  profileId: string
): Promise<Memory[]> {
  const supabase = await createClient()

  const { data: memories, error } = await supabase
    .from('memories')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all memories for tags:', error)
    return []
  }

  return (memories || []) as Memory[]
}
