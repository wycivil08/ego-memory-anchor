'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Error loading reminders:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg
            className="h-8 w-8 text-red-600"
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
        </div>
        <h2 className="text-xl font-medium text-stone-800 mb-2">
          加载提醒失败
        </h2>
        <p className="text-stone-500 mb-6">
          抱歉，加载提醒时出现问题。请稍后重试。
        </p>
        <Button
          onClick={reset}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
        >
          重试
        </Button>
      </div>
    </div>
  )
}
