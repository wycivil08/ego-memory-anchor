import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FamilyMemberWithUser, FamilyRole } from '@/lib/types'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        not: vi.fn(() => ({
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              then: vi.fn((resolve: (value: unknown) => void) => resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        then: vi.fn((resolve: (value: unknown) => void) => resolve({ error: null })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        then: vi.fn((resolve: (value: unknown) => void) => resolve({ error: null })),
      })),
    })),
  })),
}

// Import after mocking
import {
  getFamilyMembers,
  updateMemberRole,
  removeMember,
  revokeInvite,
  generateInviteLink,
  isProfileOwner,
  getInviteByToken,
  acceptInvite,
} from '@/lib/actions/family'

describe('Family Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFamilyMembers', () => {
    it('should return empty array when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      } as unknown as ReturnType<typeof createClient>)

      const result = await getFamilyMembers('test-profile-id')
      expect(result).toEqual([])
    })

    it('should return empty array when profile does not exist', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: 'Not found' }),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await getFamilyMembers('nonexistent-profile')
      expect(result).toEqual([])
    })
  })

  describe('updateMemberRole', () => {
    it('should return error when user is not owner', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'different-user' },
                error: null,
              }),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await updateMemberRole('profile-1', 'member-1', 'admin')
      expect(result.success).toBe(false)
      expect(result.error).toBe('只有档案主人可以管理家人')
    })

    it('should return error for invalid role', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'user-1' },
                error: null,
              }),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await updateMemberRole('profile-1', 'member-1', 'invalid-role' as FamilyRole)
      expect(result.success).toBe(false)
      expect(result.error).toBe('无效的角色')
    })
  })

  describe('removeMember', () => {
    it('should return error when user is not owner', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'different-user' },
                error: null,
              }),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await removeMember('profile-1', 'member-1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('只有档案主人可以管理家人')
    })

    it('should return error when member does not exist', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      // Mock for profiles table - validateOwnerAccess
      const mockProfilesQuery = {
        select: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'user-1' },
              error: null,
            }),
          })),
        })),
      }

      // Mock for family_members table - member check
      const mockMemberQuery = {
        select: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockImplementation(() => ({
              is: vi.fn().mockImplementation(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: 'Not found' }),
              })),
            })),
          })),
        })),
      }

      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'profiles') {
            return mockProfilesQuery
          }
          return mockMemberQuery
        }),
      } as unknown as ReturnType<typeof createClient>)

      const result = await removeMember('profile-1', 'nonexistent-member')
      expect(result.success).toBe(false)
      expect(result.error).toBe('家庭成员不存在')
    })
  })

  describe('revokeInvite', () => {
    it('should return error when user is not owner', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'different-user' },
                error: null,
              }),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await revokeInvite('profile-1', 'invite-1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('只有档案主人可以管理家人')
    })
  })

  describe('generateInviteLink', () => {
    it('should return error for invalid email', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'user-1' },
                error: null,
              }),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await generateInviteLink('profile-1', 'invalid-email')
      expect(result.error).toBe('请输入有效的邮箱地址')
      expect(result.link).toBeNull()
    })

    it('should generate invite link for valid email', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'user-1' },
                error: null,
              }),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: 'invite-1' }, error: null }),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await generateInviteLink('profile-1', 'test@example.com')
      expect(result.error).toBeNull()
      expect(result.link).toContain('/invite/')
    })
  })

  describe('isProfileOwner', () => {
    it('should return false when user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      } as unknown as ReturnType<typeof createClient>)

      const result = await isProfileOwner('profile-1')
      expect(result).toBe(false)
    })

    it('should return true when user is the profile owner', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'user-1' },
                error: null,
              }),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await isProfileOwner('profile-1')
      expect(result).toBe(true)
    })

    it('should return false when user is not the profile owner', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'different-user' },
                error: null,
              }),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await isProfileOwner('profile-1')
      expect(result).toBe(false)
    })
  })

  describe('getInviteByToken', () => {
    it('should return null for empty token', async () => {
      const result = await getInviteByToken('')
      expect(result).toBeNull()
    })

    it('should return null when invite not found', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() => ({
                is: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                })),
              })),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await getInviteByToken('invalid-token')
      expect(result).toBeNull()
    })

    it('should return invite details when found', async () => {
      const mockInvite = {
        id: 'invite-123',
        profile_id: 'profile-456',
        role: 'viewer',
        invited_email: 'test@example.com',
        invited_at: '2024-01-15T10:00:00Z',
        profiles: { name: 'Grandma Wang', avatar_path: null },
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() => ({
                is: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ data: mockInvite, error: null }),
                })),
              })),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await getInviteByToken('valid-token')

      expect(result).toEqual({
        id: 'invite-123',
        profile_id: 'profile-456',
        role: 'viewer',
        invited_email: 'test@example.com',
        invited_at: '2024-01-15T10:00:00Z',
        profile_name: 'Grandma Wang',
        profile_avatar_path: null,
      })
    })
  })

  describe('acceptInvite', () => {
    it('should return error for empty token', async () => {
      const result = await acceptInvite('')

      expect(result).toEqual({
        error: '邀请链接无效',
        success: false,
      })
    })

    it('should return error when user not logged in', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      } as unknown as ReturnType<typeof createClient>)

      const result = await acceptInvite('some-token')

      expect(result).toEqual({
        error: '请先登录以接受邀请',
        success: false,
      })
    })

    it('should return error when invite not found', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'user@example.com' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
              })),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await acceptInvite('invalid-token')

      expect(result).toEqual({
        error: '邀请链接不存在或已失效',
        success: false,
      })
    })

    it('should return error when invite already accepted', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'user@example.com' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'invite-123',
                    profile_id: 'profile-456',
                    user_id: null,
                    accepted_at: '2024-01-15T10:00:00Z',
                  },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await acceptInvite('already-accepted-token')

      expect(result).toEqual({
        error: '该邀请已被接受',
        success: false,
      })
    })

    it('should return error when invite linked to another user', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'user@example.com' } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'invite-123',
                    profile_id: 'profile-456',
                    user_id: 'another-user-456',
                    accepted_at: null,
                  },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      } as unknown as ReturnType<typeof createClient>)

      const result = await acceptInvite('token-linked-to-other')

      expect(result).toEqual({
        error: '该邀请已被其他账号使用',
        success: false,
      })
    })

    it('should return error when user is already a member', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      // First query mock: .from().select().eq().is().single()
      const mockInviteQuery = {
        select: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            is: vi.fn().mockImplementation(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'invite-123',
                  profile_id: 'profile-456',
                  user_id: null,
                  accepted_at: null,
                },
                error: null,
              }),
            })),
          })),
        })),
      }

      // Second query mock: .from().select().eq().eq().not().single()
      const mockMemberQuery = {
        select: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockImplementation(() => ({
              not: vi.fn().mockImplementation(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'existing-member-789' },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }

      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'user@example.com' } },
          }),
        },
        from: vi.fn()
          .mockReturnValueOnce(mockInviteQuery)
          .mockReturnValueOnce(mockMemberQuery),
      } as unknown as ReturnType<typeof createClient>)

      const result = await acceptInvite('valid-token')

      expect(result).toEqual({
        error: '您已是该记忆空间的成员',
        success: false,
      })
    })

    it('should successfully accept invite', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      // First query mock: .from().select().eq().is().single()
      const mockInviteQuery = {
        select: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            is: vi.fn().mockImplementation(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'invite-123',
                  profile_id: 'profile-456',
                  user_id: null,
                  accepted_at: null,
                },
                error: null,
              }),
            })),
          })),
        })),
      }

      // Second query mock: .from().select().eq().eq().not().single() - no member found
      const mockNoMemberQuery = {
        select: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockImplementation(() => ({
              not: vi.fn().mockImplementation(() => ({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'No rows' },
                }),
              })),
            })),
          })),
        })),
      }

      // Update query mock
      const mockUpdateQuery = {
        update: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            then: vi.fn((resolve: (value: unknown) => void) => resolve({ error: null })),
          })),
        })),
      }

      vi.mocked(createClient).mockResolvedValue({
        ...mockSupabaseClient,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'user@example.com' } },
          }),
        },
        from: vi.fn()
          .mockReturnValueOnce(mockInviteQuery)
          .mockReturnValueOnce(mockNoMemberQuery)
          .mockReturnValueOnce(mockUpdateQuery),
      } as unknown as ReturnType<typeof createClient>)

      const result = await acceptInvite('valid-token')

      expect(result).toEqual({
        error: null,
        success: true,
        profileId: 'profile-456',
      })
    })
  })
})
