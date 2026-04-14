import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createReminder,
  getRemindersByProfile,
  updateReminder,
  deleteReminder,
  toggleReminder,
} from '@/lib/actions/reminder'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Reminder Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createReminder', () => {
    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn(),
      })

      const formData = new FormData()
      formData.append('title', '爷爷的生日')
      formData.append('reminder_date', '2024-05-01')
      formData.append('recurrence', 'yearly')
      formData.append('profile_id', 'profile-id')

      const result = await createReminder({ error: null, success: false }, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录')
    })

    it('should return error when title is empty', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: vi.fn(),
      })

      const formData = new FormData()
      formData.append('title', '')
      formData.append('reminder_date', '2024-05-01')
      formData.append('recurrence', 'yearly')
      formData.append('profile_id', 'profile-id')

      const result = await createReminder({ error: null, success: false }, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('请输入提醒标题')
    })

    it('should return error when profile does not exist', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      })

      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: mockFrom,
      })

      const formData = new FormData()
      formData.append('title', '爷爷的生日')
      formData.append('reminder_date', '2024-05-01')
      formData.append('recurrence', 'yearly')
      formData.append('profile_id', 'non-existent-profile')

      const result = await createReminder({ error: null, success: false }, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('记忆空间不存在')
    })

    it('should return error when user does not own the profile', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'different-user-id' },
              error: null,
            }),
          }),
        }),
      })

      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: mockFrom,
      })

      const formData = new FormData()
      formData.append('title', '爷爷的生日')
      formData.append('reminder_date', '2024-05-01')
      formData.append('recurrence', 'yearly')
      formData.append('profile_id', 'profile-id')

      const result = await createReminder({ error: null, success: false }, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('您没有权限在此记忆空间添加提醒')
    })

    it('should create reminder successfully when user is owner', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'user-id' },
              error: null,
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'reminder-id' },
              error: null,
            }),
          }),
        }),
      })

      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: mockFrom,
      })

      const formData = new FormData()
      formData.append('title', '爷爷的生日')
      formData.append('reminder_date', '2024-05-01')
      formData.append('recurrence', 'yearly')
      formData.append('profile_id', 'profile-id')

      const result = await createReminder({ error: null, success: false }, formData)

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
    })
  })

  describe('getRemindersByProfile', () => {
    it('should return empty array when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn(),
      })

      const result = await getRemindersByProfile('profile-id')

      expect(result).toEqual([])
    })

    it('should return reminders for authenticated user', async () => {
      const mockReminders = [
        {
          id: 'reminder-1',
          profile_id: 'profile-id',
          user_id: 'user-id',
          title: '爷爷的生日',
          reminder_date: '2024-05-01',
          recurrence: 'yearly',
          enabled: true,
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockReminders,
                error: null,
              }),
            }),
          }),
        }),
      })

      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: mockFrom,
      })

      const result = await getRemindersByProfile('profile-id')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('reminder-1')
      expect(result[0].title).toBe('爷爷的生日')
    })
  })

  describe('deleteReminder', () => {
    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn(),
      })

      const result = await deleteReminder('reminder-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录')
    })

    it('should return error when reminder does not exist', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      })

      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: mockFrom,
      })

      const result = await deleteReminder('non-existent-reminder')

      expect(result.success).toBe(false)
      expect(result.error).toBe('提醒不存在')
    })

    it('should return error when user does not own the reminder', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { profile_id: 'profile-id', user_id: 'different-user-id' },
              error: null,
            }),
          }),
        }),
      })

      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: mockFrom,
      })

      const result = await deleteReminder('reminder-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('您没有权限删除此提醒')
    })

    it('should delete reminder successfully when user is owner', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { profile_id: 'profile-id', user_id: 'user-id' },
              error: null,
            }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: mockFrom,
      })

      const result = await deleteReminder('reminder-id')

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
    })
  })

  describe('toggleReminder', () => {
    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn(),
      })

      const result = await toggleReminder('reminder-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录')
    })

    it('should toggle reminder enabled state successfully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { profile_id: 'profile-id', user_id: 'user-id', enabled: true },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { enabled: false },
            error: null,
          }),
        }),
      })

      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: mockFrom,
      })

      const result = await toggleReminder('reminder-id')

      expect(result.success).toBe(true)
      expect(result.enabled).toBe(false)
    })
  })
})
