'use client'

import { useCallback, useReducer } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { UploadProgressItem, UploadStatus } from '@/components/upload/UploadProgress'
import { UploadZone } from '@/components/upload/UploadZone'
import { BatchUploadList } from '@/components/upload/BatchUploadList'
import { extractExifDate, extractExifData } from '@/lib/utils/exif'
import { uploadMemoryFile } from '@/lib/actions/upload'

// Upload state
interface UploadState {
  items: UploadProgressItem[]
  isUploading: boolean
}

type UploadAction =
  | { type: 'ADD_FILES'; files: UploadProgressItem[] }
  | { type: 'UPDATE_ITEM'; id: string; updates: Partial<UploadProgressItem> }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'SET_UPLOADING'; isUploading: boolean }
  | { type: 'RETRY_ITEM'; id: string }

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case 'ADD_FILES':
      return {
        ...state,
        items: [...state.items, ...action.files],
      }
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, ...action.updates } : item
        ),
      }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      }
    case 'SET_UPLOADING':
      return {
        ...state,
        isUploading: action.isUploading,
      }
    case 'RETRY_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, status: 'waiting' as UploadStatus, error: undefined, progress: 0 }
            : item
        ),
      }
    default:
      return state
  }
}

// Generate unique memory ID
function generateMemoryId(): string {
  return crypto.randomUUID()
}

export default function UploadPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.profileId as string

  const [state, dispatch] = useReducer(uploadReducer, {
    items: [],
    isUploading: false,
  })

  // Process a single file upload
  const processFile = useCallback(
    async (item: UploadProgressItem) => {
      const memoryId = generateMemoryId()

      try {
        // Update status to uploading
        dispatch({
          type: 'UPDATE_ITEM',
          id: item.id,
          updates: { status: 'uploading', progress: 0 },
        })

        // Step 1: Extract EXIF date and data for photos/videos
        let memoryDate: string | undefined
        let exifData: Record<string, unknown> | undefined

        if (item.memoryType === 'photo' || item.memoryType === 'video') {
          try {
            const exifDate = await extractExifDate(item.file)
            if (exifDate) {
              memoryDate = exifDate.toISOString().split('T')[0]
            }
            exifData = await extractExifData(item.file)
          } catch {
            // Ignore EXIF errors silently
          }
        }

        // Step 2: Upload file to Supabase Storage via server action
        const filePath = `${profileId}/${memoryId}/${item.file.name}`

        // Update progress to indicate upload started
        dispatch({
          type: 'UPDATE_ITEM',
          id: item.id,
          updates: { progress: 20 },
        })

        const uploadResult = await uploadMemoryFile(
          'memories',
          profileId,
          memoryId,
          item.file.name,
          item.file
        )

        if (!uploadResult.success) {
          dispatch({
            type: 'UPDATE_ITEM',
            id: item.id,
            updates: {
              status: 'error',
              error: uploadResult.error || '上传失败',
            },
          })
          return
        }

        dispatch({
          type: 'UPDATE_ITEM',
          id: item.id,
          updates: { status: 'processing', progress: 85 },
        })

        // Step 3: Call server action to create memory record
        const { createMemory } = await import('@/lib/actions/memory')
        const result = await createMemory({
          profile_id: profileId,
          type: item.memoryType,
          file_path: filePath,
          file_name: item.file.name,
          file_size: item.file.size,
          mime_type: item.file.type,
          memory_date: memoryDate,
          exif_data: exifData,
        })

        if (result.success) {
          dispatch({
            type: 'UPDATE_ITEM',
            id: item.id,
            updates: { status: 'done', progress: 100, memoryDate },
          })
        } else {
          dispatch({
            type: 'UPDATE_ITEM',
            id: item.id,
            updates: {
              status: 'error',
              error: result.error || '保存记忆失败',
            },
          })
        }
      } catch (error) {
        dispatch({
          type: 'UPDATE_ITEM',
          id: item.id,
          updates: {
            status: 'error',
            error: error instanceof Error ? error.message : '上传失败',
          },
        })
      }
    },
    [profileId]
  )

  // Process multiple files with concurrency limit
  const processFilesWithConcurrency = useCallback(
    async (items: UploadProgressItem[], maxConcurrent: number = 3) => {
      dispatch({ type: 'SET_UPLOADING', isUploading: true })

      const pendingItems = items.filter((item) => item.status === 'waiting')
      const chunks: UploadProgressItem[][] = []

      // Split into chunks of maxConcurrent
      for (let i = 0; i < pendingItems.length; i += maxConcurrent) {
        chunks.push(pendingItems.slice(i, i + maxConcurrent))
      }

      // Process chunks sequentially
      for (const chunk of chunks) {
        await Promise.all(chunk.map((item) => processFile(item)))
      }

      dispatch({ type: 'SET_UPLOADING', isUploading: false })
    },
    [processFile]
  )

  // Handle files selected from UploadZone
  const handleFilesSelected = useCallback(
    (files: Array<{ file: File; memoryType: 'photo' | 'video' | 'audio' | 'text' | 'document' }>) => {
      const uploadItems: UploadProgressItem[] = files.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f.file,
        memoryType: f.memoryType,
        status: 'waiting' as UploadStatus,
        progress: 0,
      }))

      dispatch({ type: 'ADD_FILES', files: uploadItems })

      // Start uploading with concurrency limit
      setTimeout(() => {
        processFilesWithConcurrency(uploadItems, 3)
      }, 0)
    },
    [processFilesWithConcurrency]
  )

  // Handle retry
  const handleRetry = useCallback(
    (id: string) => {
      dispatch({ type: 'RETRY_ITEM', id })

      // Find the item and reprocess
      const item = state.items.find((i) => i.id === id)
      if (item) {
        setTimeout(() => {
          processFilesWithConcurrency([item], 1)
        }, 0)
      }
    },
    [state.items, processFilesWithConcurrency]
  )

  // Check if profile exists (redirect if not)
  if (!profileId) {
    router.push('/dashboard')
    return null
  }

  const completedCount = state.items.filter((item) => item.status === 'done').length
  const hasCompleted = completedCount > 0

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/profile/${profileId}`}
              className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              返回时间线
            </Link>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-medium text-stone-800">上传记忆</h1>
            <p className="mt-1 text-sm text-stone-500">
              上传照片、视频、语音或文字，记录关于 TA 的真实记忆
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Upload Zone - only show if not yet completed */}
          {!hasCompleted && (
            <UploadZone
              onFilesSelected={handleFilesSelected}
              maxFiles={100}
              disabled={state.isUploading}
            />
          )}

          {/* Upload Progress */}
          {state.items.length > 0 && (
            <BatchUploadList
              items={state.items}
              onRetry={handleRetry}
              profileId={profileId}
            />
          )}

          {/* Quick actions after completion */}
          {hasCompleted && (
            <div className="flex gap-4">
              <button
                onClick={() => {
                  // Reset state
                  dispatch({ type: 'SET_UPLOADING', isUploading: false })
                  // Note: items are kept until page refresh for now
                }}
                className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                继续上传
              </button>

              <Link
                href={`/profile/${profileId}`}
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                前往时间线
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
