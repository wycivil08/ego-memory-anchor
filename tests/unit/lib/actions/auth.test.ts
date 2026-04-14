import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()

vi.mocked(createClient).mockResolvedValue({
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signUp: mockSignUp,
    signOut: mockSignOut,
  },
} as unknown as Awaited<ReturnType<typeof createClient>>)

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('REDIRECT: testing redirect')
  }),
}))

// Import types and helpers after mocks
import {
  signInWithPassword,
  signUp,
  logout,
  type AuthState,
  type SignUpState,
} from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/server'

const assertAuthState = (state: AuthState) => {
  expect(state).toHaveProperty('error')
  expect(state).toHaveProperty('success')
  expect(typeof state.error).toBe('string')
  expect(typeof state.success).toBe('boolean')
}

const assertSignUpState = (state: SignUpState) => {
  expect(state).toHaveProperty('error')
  expect(state).toHaveProperty('success')
  expect(state).toHaveProperty('emailSent')
  expect(typeof state.error).toBe('string')
  expect(typeof state.success).toBe('boolean')
  expect(typeof state.emailSent).toBe('boolean')
}

describe('signInWithPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when email is missing', async () => {
    const formData = new FormData()
    formData.append('password', 'password123')

    const state = await signInWithPassword({ error: null, success: false }, formData)

    expect(state.error).toBe('请填写邮箱和密码')
    expect(state.success).toBe(false)
    assertAuthState(state)
  })

  it('returns error when password is missing', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')

    const state = await signInWithPassword({ error: null, success: false }, formData)

    expect(state.error).toBe('请填写邮箱和密码')
    expect(state.success).toBe(false)
  })

  it('returns error when credentials are invalid', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'wrongpassword')

    const state = await signInWithPassword({ error: null, success: false }, formData)

    expect(state.error).toBe('邮箱或密码错误，请重试')
    expect(state.success).toBe(false)
  })

  it('redirects on successful login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'correctpassword')

    try {
      await signInWithPassword({ error: null, success: false }, formData)
    } catch (e: unknown) {
      expect((e as Error).message).toBe('REDIRECT: testing redirect')
    }
  })
})

describe('signUp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when fields are missing', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')

    const state = await signUp(
      { error: null, success: false, emailSent: false },
      formData
    )

    expect(state.error).toBe('请填写所有字段')
    assertSignUpState(state)
  })

  it('returns error when password is too short', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'short')
    formData.append('confirmPassword', 'short')

    const state = await signUp(
      { error: null, success: false, emailSent: false },
      formData
    )

    expect(state.error).toBe('密码至少需要 8 位')
  })

  it('returns error when password lacks letters', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', '12345678')
    formData.append('confirmPassword', '12345678')

    const state = await signUp(
      { error: null, success: false, emailSent: false },
      formData
    )

    expect(state.error).toBe('密码必须包含字母和数字')
  })

  it('returns error when password lacks numbers', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'abcdefgh')
    formData.append('confirmPassword', 'abcdefgh')

    const state = await signUp(
      { error: null, success: false, emailSent: false },
      formData
    )

    expect(state.error).toBe('密码必须包含字母和数字')
  })

  it('returns error when passwords do not match', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'Password123')
    formData.append('confirmPassword', 'Password456')

    const state = await signUp(
      { error: null, success: false, emailSent: false },
      formData
    )

    expect(state.error).toBe('两次输入的密码不一致')
  })

  it('returns emailSent=true on successful signup', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'user-123' }, session: null },
      error: null,
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'Password123')
    formData.append('confirmPassword', 'Password123')

    const state = await signUp(
      { error: null, success: false, emailSent: false },
      formData
    )

    expect(state.success).toBe(true)
    expect(state.emailSent).toBe(true)
  })

  it('returns error on signup failure', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'User already registered' },
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'Password123')
    formData.append('confirmPassword', 'Password123')

    const state = await signUp(
      { error: null, success: false, emailSent: false },
      formData
    )

    expect(state.error).toBe('注册失败，请稍后重试')
    expect(state.success).toBe(false)
    expect(state.emailSent).toBe(false)
  })
})

describe('logout', () => {
  it('calls signOut on the client', async () => {
    mockSignOut.mockResolvedValueOnce({ error: null })

    try {
      await logout()
    } catch (e: unknown) {
      expect((e as Error).message).toBe('REDIRECT: testing redirect')
    }

    expect(mockSignOut).toHaveBeenCalled()
  })
})
