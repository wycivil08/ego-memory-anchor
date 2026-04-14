'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Memory detail page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <svg
              className="h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="mb-2 text-lg font-medium text-red-800">加载记忆时出错</h2>
          <p className="mb-6 text-sm text-red-600">
            {error.message || '请稍后重试'}
          </p>

          <div className="flex justify-center gap-3">
            <Button
              onClick={reset}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              重试
            </Button>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-stone-300 text-stone-700 hover:bg-stone-50"
              >
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
