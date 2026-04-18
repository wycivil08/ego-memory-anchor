'use client'

import { Button } from '@/components/ui/button'

interface MainErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function MainError({ error: _error, reset }: MainErrorProps) {
// _error is intentionally unused - it's part of the Error boundary interface but we display a generic message
void _error
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-500"
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
        </div>

        {/* Error message */}
        <h1 className="text-xl font-medium text-stone-800">
          页面加载出错
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          抱歉，页面加载出现了问题。请稍后重试。
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={reset}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            重试
          </Button>
          <Button
            onClick={() => (window.location.href = '/dashboard')}
            variant="outline"
            className="border-stone-300 text-stone-700 hover:bg-stone-50"
          >
            返回仪表盘
          </Button>
        </div>
      </div>
    </div>
  )
}
