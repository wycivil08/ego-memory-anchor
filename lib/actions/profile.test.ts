import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProfile, updateProfile, deleteProfile } from './profile'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        then: vi.fn(),
      })),
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
      or: vi.fn(() => ({
        order: vi.fn(() => []),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        then: vi.fn(),
      })),
    })),
  })),
}

describe('Profile Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createProfile', () => {
    it('should return error when name is empty', async () => {
      const formData = new FormData()
      formData.append('name', '')
      formData.append('relationship', 'father')

      const state = await createProfile({ error: null, success: false }, formData)

      expect(state.success).toBe(false)
      expect(state.error).toBe('请输入姓名')
    })

    it('should return error when name is only whitespace', async () => {
      const formData = new FormData()
      formData.append('name', '   ')
      formData.append('relationship', 'father')

      const state = await createProfile({ error: null, success: false }, formData)

      expect(state.success).toBe(false)
      expect(state.error).toBe('请输入姓名')
    })

    it('should return error when name exceeds 100 characters', async () => {
      const formData = new FormData()
      formData.append('name', 'a'.repeat(101))
      formData.append('relationship', 'father')

      const state = await createProfile({ error: null, success: false }, formData)

      expect(state.success).toBe(false)
      expect(state.error).toBe('姓名不能超过100个字符')
    })

    it('should return error when relationship is not selected', async () => {
      const formData = new FormData()
      formData.append('name', '张三')
      formData.append('relationship', '')

      const state = await createProfile({ error: null, success: false }, formData)

      expect(state.success).toBe(false)
      expect(state.error).toBe('请选择与 TA 的关系')
    })

    it('should return error for invalid birth date format', async () => {
      const formData = new FormData()
      formData.append('name', '张三')
      formData.append('relationship', 'father')
      formData.append('birth_date', '2023-1-1') // Invalid format

      const state = await createProfile({ error: null, success: false }, formData)

      expect(state.success).toBe(false)
      expect(state.error).toBe('出生日期格式不正确')
    })

    it('should return error when death date is before birth date', async () => {
      const formData = new FormData()
      formData.append('name', '张三')
      formData.append('relationship', 'father')
      formData.append('birth_date', '2020-01-01')
      formData.append('death_date', '2010-01-01')

      const state = await createProfile({ error: null, success: false }, formData)

      expect(state.success).toBe(false)
      expect(state.error).toBe('去世日期不能早于出生日期')
    })

    it('should return error when description exceeds 500 characters', async () => {
      const formData = new FormData()
      formData.append('name', '张三')
      formData.append('relationship', 'father')
      formData.append('description', 'a'.repeat(501))

      const state = await createProfile({ error: null, success: false }, formData)

      expect(state.success).toBe(false)
      expect(state.error).toBe('描述不能超过500个字符')
    })
  })

  describe('updateProfile', () => {
    it('should return error when name is empty', async () => {
      const formData = new FormData()
      formData.append('name', '')
      formData.append('relationship', 'father')

      const state = await updateProfile('profile-id', { error: null, success: false }, formData)

      expect(state.success).toBe(false)
      expect(state.error).toBe('请输入姓名')
    })

    it('should return error when profile does not exist', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
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

      const formData = new FormData()
      formData.append('name', '张三')
      formData.append('relationship', 'father')

      const state = await updateProfile('non-existent-id', { error: null, success: false }, formData)

      expect(state.success).toBe(false)
      expect(state.error).toBe('记忆空间不存在')
    })
  })

  describe('deleteProfile', () => {
    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      })

      const result = await deleteProfile('profile-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录')
    })
  })
})
