import { cn } from '@/lib/utils'
import type { FamilyRole } from '@/lib/types'
import { FAMILY_ROLE_LABELS } from '@/lib/types'

interface RoleBadgeProps {
  role: FamilyRole
  className?: string
}

const roleStyles: Record<FamilyRole, string> = {
  admin: 'bg-amber-100 text-amber-800 border-amber-200',
  editor: 'bg-blue-100 text-blue-800 border-blue-200',
  viewer: 'bg-stone-100 text-stone-600 border-stone-200',
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border',
        roleStyles[role],
        className
      )}
    >
      {FAMILY_ROLE_LABELS[role]}
    </span>
  )
}
