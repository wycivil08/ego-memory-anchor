interface SourceBadgeProps {
  label?: string
  className?: string
}

export function SourceBadge({
  label = '原始记录',
  className,
}: SourceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600 ring-1 ring-amber-100 ${className || ''}`}
    >
      {label}
    </span>
  )
}
