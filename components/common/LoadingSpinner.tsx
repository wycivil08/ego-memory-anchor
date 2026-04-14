interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-[1.5px]',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-stone-300 border-t-amber-600 ${sizeClasses[size]} ${className || ''}`}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = '加载中...' }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-50/80">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <span className="text-sm text-stone-500">{message}</span>
      </div>
    </div>
  )
}
