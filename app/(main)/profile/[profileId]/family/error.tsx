'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function FamilyError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error for debugging
    console.error('Family page error:', error)
  }, [error])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-50 to-stone-50 border-b border-stone-200">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="h-24 w-24 rounded-full bg-stone-200" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 rounded bg-stone-200" />
              <div className="h-4 w-64 rounded bg-stone-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Error content */}
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-red-800">
              加载家庭成员失败
            </h2>
            <p className="mt-2 text-sm text-red-600">
              {error.message || '发生了未知错误'}
            </p>
            <Button
              onClick={reset}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              重试
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
