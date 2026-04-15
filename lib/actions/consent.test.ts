import { describe, it, expect, vi, beforeEach } from 'vitest'
import { recordPrivacyConsent, hasUserConsented } from './consent'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('consent actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { createClient } = await import('@/lib/supabase/server')
    // Reset the mock to a default state
    vi.mocked(createClient).mockReset()
  })

  describe('recordPrivacyConsent', () => {
    it('should record consent successfully when user is logged in', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockInsertResult = { data: { id: 'consent-1' }, error: null }

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockInsertResult),
            }),
          }),
          select: vi.fn().mockReturnValue({}),
        }),
      } as never)

      const result = await recordPrivacyConsent('sensitive_data_upload')

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should reject when user is not logged in', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
        from: vi.fn().mockReturnValue({}),
      } as never)

      const result = await recordPrivacyConsent('sensitive_data_upload')

      expect(result.success).toBe(false)
      expect(result.error).toBe('请先登录')
    })

    it('should handle database errors gracefully', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      // Mock insert to return error directly (without .select().single())
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
          select: vi.fn().mockReturnValue({}),
        }),
      } as never)

      const result = await recordPrivacyConsent('terms_accept')

      expect(result.success).toBe(false)
      expect(result.error).toBe('记录同意失败')
    })
  })

  describe('hasUserConsented', () => {
    it('should return true when user has given consent', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockSelectResult = { data: { id: 'consent-1' }, error: null }

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSelectResult),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({}),
        }),
      } as never)

      const result = await hasUserConsented('sensitive_data_upload')

      expect(result).toBe(true)
    })

    it('should return false when user has not given consent', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockSelectResult = { data: null, error: { code: 'PGRST116' } }

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSelectResult),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({}),
        }),
      } as never)

      const result = await hasUserConsented('sensitive_data_upload')

      expect(result).toBe(false)
    })

    it('should return false when user is not logged in', async () => {
      const { createClient } = await import('@/lib/supabase/server')

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
        from: vi.fn().mockReturnValue({}),
      } as never)

      const result = await hasUserConsented('terms_accept')

      expect(result).toBe(false)
    })
  })
})
