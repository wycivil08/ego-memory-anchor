'use client'

import Link from 'next/link'
import type { UploadProgressItem } from './UploadProgress'
import { UploadProgress } from './UploadProgress'

interface BatchUploadListProps {
  items: UploadProgressItem[]
  onRetry?: (id: string) => void
  profileId: string
}

export function BatchUploadList({ items, onRetry, profileId }: BatchUploadListProps) {
  const completedCount = items.filter((item) => item.status === 'done').length
  const totalCount = items.length
  const hasErrors = items.some((item) => item.status === 'error')
  const allDone = completedCount === totalCount
  const inProgressCount = items.filter(
    (item) => item.status === 'uploading' || item.status === 'processing'
  ).length

  // Calculate overall progress
  const overallProgress = items.reduce((acc, item) => {
    if (item.status === 'done') return acc + 100
    if (item.status === 'uploading') return acc + item.progress
    if (item.status === 'processing') return acc + 50 // Processing is halfway
    return acc
  }, 0) / totalCount

  if (items.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-stone-800">
            上传列表
          </h3>
          <p className="mt-0.5 text-sm text-stone-500">
            {allDone
              ? `${completedCount} 条记忆已保存`
              : inProgressCount > 0
                ? `正在上传 ${inProgressCount} 个文件...`
                : `${completedCount} / ${totalCount} 已完成`}
          </p>
        </div>

        {/* Overall progress bar (when not all done) */}
        {!allDone && (
          <div className="w-32">
            <div className="h-2 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* File list */}
      <div className="space-y-2">
        {items.map((item) => (
          <UploadProgress
            key={item.id}
            item={item}
            onRetry={onRetry}
          />
        ))}
      </div>

      {/* Completion state */}
      {allDone && (
        <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-6 w-6 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h4 className="text-lg font-medium text-emerald-800">
            {completedCount} 条记忆已保存
          </h4>

          <p className="mt-1 text-sm text-emerald-600">
            您的记忆已安全保存在时间线中
          </p>

          <Link
            href={`/profile/${profileId}`}
            className="mt-4 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            前往时间线查看
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
          </Link>
        </div>
      )}

      {/* Error summary */}
      {hasErrors && !allDone && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <p className="font-medium">部分文件上传失败</p>
          <p className="mt-0.5 text-xs text-red-500">
            点击失败文件右侧的&quot;重试&quot;按钮重新上传
          </p>
        </div>
      )}
    </div>
  )
}
