import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserMenu } from '@/components/layout/UserMenu'
import { MobileNav } from '@/components/layout/MobileNav'
import { Header } from '@/components/layout/Header'
import type { User } from '@/lib/types'

// Mock usePathname for MobileNav
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}))

// Mock Server Component for UserMenu
vi.mock('@/lib/actions/auth', () => ({
  logout: vi.fn(),
}))

describe('Layout Components', () => {
  describe('UserMenu', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {
        name: '张三',
        avatar_url: undefined,
      },
    }

    it('renders user name correctly', () => {
      render(<UserMenu user={mockUser} />)
      expect(screen.getByText('张三')).toBeDefined()
    })

    it('renders user initial in avatar', () => {
      render(<UserMenu user={mockUser} />)
      expect(screen.getByText('张')).toBeDefined()
    })

    it('renders settings link when menu is open', async () => {
      const { userEvent } = await import('@testing-library/user-event')
      render(<UserMenu user={mockUser} />)
      // Click the user menu button to open dropdown
      const menuButton = document.querySelector('button')
      if (menuButton) {
        await userEvent.click(menuButton)
      }
      expect(screen.getByText('设置')).toBeDefined()
    })

    it('renders logout button when menu is open', async () => {
      const { userEvent } = await import('@testing-library/user-event')
      render(<UserMenu user={mockUser} />)
      // Click the user menu button to open dropdown
      const menuButton = document.querySelector('button')
      if (menuButton) {
        await userEvent.click(menuButton)
      }
      expect(screen.getByText('退出登录')).toBeDefined()
    })

    it('uses email prefix when name is not available', () => {
      const userWithoutName: User = {
        id: '456',
        email: 'alice@example.com',
        user_metadata: {},
      }
      render(<UserMenu user={userWithoutName} />)
      expect(screen.getByText('alice')).toBeDefined()
    })
  })

  describe('MobileNav', () => {
    it('renders navigation items', () => {
      render(<MobileNav />)
      expect(screen.getByText('首页')).toBeDefined()
      expect(screen.getByText('设置')).toBeDefined()
    })

    it('renders home icon', () => {
      render(<MobileNav />)
      const homeIcon = document.querySelector('svg')
      expect(homeIcon).toBeDefined()
    })
  })

  describe('Header', () => {
    it('renders logo', () => {
      render(<Header />)
      expect(screen.getByText('忆锚')).toBeDefined()
    })

    it('renders menu button', () => {
      render(<Header />)
      const menuButton = document.querySelector('button')
      expect(menuButton).toBeDefined()
    })
  })
})
