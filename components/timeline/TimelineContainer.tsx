'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Timeline } from '@/components/timeline/Timeline'
import { TimelineEmpty } from '@/components/timeline/TimelineEmpty'
import { groupMemoriesByDate, type Memory, type TimelineGroup, type TimelineFilters as TimelineFiltersType, type MemoryType, applyFilters, getAllTags } from '@/lib/utils/timeline'
import { fetchTimelineDataAction } from '@/lib/actions/timeline'
import type { ProfileWithMemoryCount } from '@/lib/types'

interface TimelineContainerProps {
  profileId: string
  profile: ProfileWithMemoryCount
  initialMemories?: Memory[]
}

export function TimelineContainer({ profileId, profile, initialMemories }: TimelineContainerProps) {
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [memories, setMemories] = useState<Memory[]>(initialMemories || [])
  const [groups, setGroups] = useState<TimelineGroup[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(!initialMemories)
  const [totalCount, setTotalCount] = useState(0)

  // Parse filters from search params
  const filters: TimelineFiltersType = {
    type: (searchParams.get('type') as MemoryType | 'all') || 'all',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    quickDateRange: (searchParams.get('quickRange') as TimelineFiltersType['quickDateRange']) || 'all',
  }

  // Fetch memories with current filters
  const fetchMemories = useCallback(
    (currentPage: number, currentFilters: TimelineFiltersType, append: boolean = false) => {
      startTransition(async () => {
        setIsLoading(true)
        try {
          const result = await fetchTimelineDataAction(profileId, profile, currentFilters, currentPage)

          if (append) {
            setMemories((prev) => [...prev, ...result.memories])
          } else {
            setMemories(result.memories)
            // Re-group memories
            const newGroups = groupMemoriesByDate(result.memories)
            setGroups(newGroups)
          }

          setHasMore(result.hasMore)
          setTotalCount(result.totalCount)
        } catch (error) {
          console.error('Error fetching timeline data:', error)
        } finally {
          setIsLoading(false)
        }
      })
    },
    [profileId, profile]
  )

  // Initial fetch and refetch when filters change
  useEffect(() => {
    setPage(0)
    fetchMemories(0, filters, false)
  }, [filters, fetchMemories])

  // Load more handler
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchMemories(nextPage, filters, true)
  }, [page, filters, fetchMemories])

  // Show empty state if no memories
  if (!isLoading && memories.length === 0) {
    return <TimelineEmpty profileId={profileId} />
  }

  return (
    <Timeline
      groups={groups}
      profileId={profileId}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      isLoading={isPending}
    />
  )
}
