import Link from 'next/link'
import { UserMenu } from './UserMenu'
import type { User } from '@/lib/types'

interface SidebarProps {
  user: User
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-white shadow-sm">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-stone-100 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-medium text-stone-800">忆锚</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav aria-label="主导航" className="flex-1 space-y-1 px-3 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-800"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>首页</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-800"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>设置</span>
        </Link>
      </nav>

      {/* User Menu at Bottom */}
      <div className="border-t border-stone-100 p-3">
        <UserMenu user={user} />
      </div>
    </aside>
  )
}
