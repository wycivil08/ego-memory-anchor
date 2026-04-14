import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}))

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}))

// We need to re-import after mocking
import { createMiddlewareClient } from '@/lib/supabase/middleware'

describe('createMiddlewareClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a supabase client with cookie-based auth', async () => {
    const client = await createMiddlewareClient()
    expect(client).toBeDefined()
    expect(client.auth.getUser).toBeDefined()
  })
})
