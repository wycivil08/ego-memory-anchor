'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-stone-100 bg-white px-4 shadow-sm">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-lg font-medium text-stone-800">忆锚</span>
      </Link>

      {/* Menu Button - placeholder for future hamburger menu */}
      <button
        type="button"
        className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
        aria-label="菜单"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </header>
  )
}
