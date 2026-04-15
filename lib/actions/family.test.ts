import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateInviteLink,
  getInviteByToken,
  acceptInvite,
  getFamilyMembers,
  updateMemberRole,
  removeMember,
  revokeInvite,
} from './family'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Helper to create query builder mock that supports chaining
function createQueryBuilderMock(data: unknown, error: unknown = null) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['eq', 'is', 'not', 'single', 'order']

  methods.forEach((method) => {
    chain[method] = vi.fn(() => createQueryBuilderMock(data, error))
  })

  // Override single to return actual data
  chain['single'] = vi.fn().mockResolvedValue({ data, error })
  chain['order'] = vi.fn().mockResolvedValue({ data: [], error: null })

  return chain
}

function createSelectMock(data: unknown, error: unknown = null) {
  const selectChain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['eq', 'is', 'not', 'single', 'order']

  methods.forEach((method) => {
    selectChain[method] = vi.fn(() => createQueryBuilderMock(data, error))
  })

  selectChain['single'] = vi.fn().mockResolvedValue({ data, error })
  selectChain['order'] = vi.fn().mockResolvedValue({ data: [], error: null })

  return selectChain
}

describe('Family Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateInviteLink', () => {
    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(
            createQueryBuilderMock({ user_id: 'owner-id' })
          ),
        }),
      })

      const result = await generateInviteLink('profile-id', null, 'viewer')

      expect(result.link).toBeNull()
      expect(result.error).toBe('请先登录')
    })

    it('should return error when profile does not exist', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(
            createQueryBuilderMock(null, { message: 'Not found' })
          ),
        }),
      })

      const result = await generateInviteLink('non-existent-id', null, 'viewer')

      expect(result.link).toBeNull()
      expect(result.error).toBe('记忆空间不存在')
    })

    it('should return error when user is not the profile owner', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'other-user-id', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(
            createQueryBuilderMock({ user_id: 'owner-id' })
          ),
        }),
      })

      const result = await generateInviteLink('profile-id', null, 'viewer')

      expect(result.link).toBeNull()
      expect(result.error).toBe('只有档案主人可以管理家人')
    })

    it('should return error for invalid email format when email is provided', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'owner-id', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue(
            createQueryBuilderMock({ user_id: 'owner-id' })
          ),
        }),
      })

      const result = await generateInviteLink('profile-id', 'invalid-email', 'viewer')

      expect(result.link).toBeNull()
      expect(result.error).toBe('请输入有效的邮箱地址')
    })

    it('should generate invite link successfully without email', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'owner-id', email: 'test@test.com' } },
          }),
        },
        from: vi.fn()
          .mockReturnValueOnce({
            select: vi.fn().mockReturnValue(
              createQueryBuilderMock({ user_id: 'owner-id' })
            ),
          })
          .mockReturnValueOnce({
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'invite-id' }, error: null }),
              }),
            }),
          }),
      })

      const result = await generateInviteLink('profile-id', null, 'viewer')

      expect(result.error).toBeNull()
      expect(result.link).toContain('/invite/')
    })

    it('should generate invite link successfully with email', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'owner-id', email: 'test@test.com' } },
          }),
        },
        from: vi.fn()
          .mockReturnValueOnce({
            select: vi.fn().mockReturnValue(
              createQueryBuilderMock({ user_id: 'owner-id' })
            ),
          })
          .mockReturnValueOnce({
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'invite-id' }, error: null }),
              }),
            }),
          }),
      })

      const result = await generateInviteLink('profile-id', 'family@example.com', 'editor')

      expect(result.error).toBeNull()
      expect(result.link).toContain('/invite/')
    })
  })

  describe('getInviteByToken', () => {
    it('should return null for empty token', async () => {
      const result = await getInviteByToken('')

      expect(result).toBeNull()
    })

    it('should return null when invite not found', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                }),
              }),
            }),
          }),
        }),
      })

      const result = await getInviteByToken('invalid-token')

      expect(result).toBeNull()
    })

    it('should return invite details when found', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: 'invite-id',
                      profile_id: 'profile-id',
                      role: 'viewer',
                      invited_email: 'family@example.com',
                      invited_at: '2024-01-01T00:00:00.000Z',
                      profiles: { name: '张三', avatar_path: 'avatars/test.jpg' },
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      })

      const result = await getInviteByToken('valid-token')

      expect(result).not.toBeNull()
      expect(result?.profile_name).toBe('张三')
      expect(result?.role).toBe('viewer')
    })
  })

  describe('acceptInvite', () => {
    it('should return error for empty token', async () => {
      const result = await acceptInvite('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('邀请链接无效')
    })

    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      })

      const result = await acceptInvite('some-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录以接受邀请')
    })

    it('should return error when invite not found', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
              }),
            }),
          }),
        }),
      })

      const result = await acceptInvite('invalid-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('邀请链接不存在或已失效')
    })
  })

  describe('getFamilyMembers', () => {
    it('should return empty array when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      })

      const result = await getFamilyMembers('profile-id')

      expect(result).toEqual([])
    })

    it('should return empty array when profile not found', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
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

      const result = await getFamilyMembers('non-existent-id')

      expect(result).toEqual([])
    })
  })

  describe('updateMemberRole', () => {
    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        }),
      })

      const result = await updateMemberRole('profile-id', 'member-id', 'editor')

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录')
    })

    it('should return error for invalid role', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'owner-id', email: 'test@test.com' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'owner-id' },
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await updateMemberRole('profile-id', 'member-id', 'invalid-role' as 'editor')

      expect(result.success).toBe(false)
      expect(result.error).toBe('无效的角色')
    })
  })

  describe('removeMember', () => {
    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        }),
      })

      const result = await removeMember('profile-id', 'member-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录')
    })
  })

  describe('revokeInvite', () => {
    it('should return error when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                }),
              }),
            }),
          }),
        }),
      })

      const result = await revokeInvite('profile-id', 'invite-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录')
    })
  })
})
