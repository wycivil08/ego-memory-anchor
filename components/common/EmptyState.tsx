import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center ${className || ''}`}
    >
      {/* Icon */}
      {icon ? (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          {icon}
        </div>
      ) : (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <svg
            className="h-8 w-8 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}

      {/* Title */}
      <h2 className="text-lg font-medium text-stone-700">{title}</h2>

      {/* Description */}
      {description && (
        <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>
      )}

      {/* Action button */}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors duration-150"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
