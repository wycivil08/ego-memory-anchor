import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProfilesForExport, exportProfileData } from './export'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => []),
        single: vi.fn(),
      })),
    })),
  })),
}

describe('Export Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfilesForExport', () => {
    it('should return empty array when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      })

      const result = await getProfilesForExport()

      expect(result).toEqual([])
    })

    it('should return profiles owned by user', async () => {
      const mockProfiles = [
        { id: 'profile-1', name: '爷爷', species: 'human', relationship: 'grandfather', created_at: '2024-01-01' },
        { id: 'profile-2', name: '豆豆', species: 'pet', relationship: 'pet_dog', created_at: '2024-01-02' },
      ]

      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
              }),
            }),
          }),
        }),
      })

      const result = await getProfilesForExport()

      expect(result).toEqual(mockProfiles)
    })

    it('should return empty array on error', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
              }),
            }),
          }),
        }),
      })

      const result = await getProfilesForExport()

      expect(result).toEqual([])
    })
  })

  describe('exportProfileData', () => {
    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      })

      const result = await exportProfileData('profile-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录')
    })

    it('should return error when profile does not exist', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        }),
      })

      const result = await exportProfileData('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('记忆空间不存在')
    })

    it('should return error when user is not the owner', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'profile-1', name: '爷爷', user_id: 'other-user' },
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await exportProfileData('profile-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('只有档案创建者可以导出数据')
    })

    it('should return success when user is the owner', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'profile-1', name: '爷爷', user_id: 'user-1' },
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await exportProfileData('profile-1')

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(result.profileName).toBe('爷爷')
    })
  })
})
