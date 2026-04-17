import { test as base, Page } from '@playwright/test'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Load .env.local for E2E test context (Playwright workers don't inherit it automatically)
const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim()
        const value = trimmed.slice(eqIndex + 1).trim()
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

/**
 * Seed data created by this fixture
 */
export interface SeedData {
  ownerEmail: string
  ownerPassword: string
  ownerId: string
  memberEmail: string
  memberPassword: string
  memberId: string
  profileId: string
  memoryId: string
  inviteToken: string
}

/**
 * Seed fixture that creates real test data via Service Role client.
 * This bypasses RLS to set up clean test state.
 */
class SeedFixture {
  private supabaseAdmin: SupabaseClient | null = null
  private data: SeedData | null = null

  private getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!url || !serviceRoleKey) {
        throw new Error(
          'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
        )
      }

      this.supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
    }

    return this.supabaseAdmin
  }

  async setup(): Promise<SeedData> {
    if (this.data) {
      return this.data
    }

    const admin = this.getAdminClient()
    const timestamp = Date.now()
    const ownerEmail = `e2e_owner_${timestamp}@test.com`
    const memberEmail = `e2e_member_${timestamp}@test.com`
    const ownerPassword = 'TestPassword123!'
    const memberPassword = 'TestPassword123!'

    try {
      // Step 1: Create owner user
      const { data: ownerAuth, error: ownerError } = await admin.auth.admin.createUser({
        email: ownerEmail,
        password: ownerPassword,
        user_metadata: { name: 'E2E Owner' },
        email_confirm: true
      })
      if (ownerError) throw new Error(`Create owner: ${ownerError.message}`)
      const ownerId = ownerAuth.user.id

      // Step 2: Create member user (for invite acceptance later)
      const { data: memberAuth, error: memberError } = await admin.auth.admin.createUser({
        email: memberEmail,
        password: memberPassword,
        user_metadata: { name: 'E2E Member' },
        email_confirm: true
      })
      if (memberError) throw new Error(`Create member: ${memberError.message}`)
      const memberId = memberAuth.user.id

      // Step 3: Create profile for owner
      const { data: profileData, error: profileError } = await admin
        .from('profiles')
        .insert({
          user_id: ownerId,
          name: '王奶奶',
          relationship: 'grandmother',
          birth_date: '1950-06-15',
          death_date: '2023-06-15',
          species: 'human'
        })
        .select()
        .single()
      if (profileError) throw new Error(`Create profile: ${profileError.message}`)
      const profileId = profileData.id

      // Step 4: Create a memory for the profile
      const { data: memoryData, error: memoryError } = await admin
        .from('memories')
        .insert({
          profile_id: profileId,
          contributor_id: ownerId,
          type: 'photo',
          content: '这张照片是奶奶80岁生日拍的',
          memory_date: '2020-06-15',
          file_name: 'birthday_photo.jpg',
          source_label: '原始记录'
        })
        .select()
        .single()
      if (memoryError) throw new Error(`Create memory: ${memoryError.message}`)
      const memoryId = memoryData.id

      // Step 5: Generate invite token and create family member record
      const inviteToken = crypto.randomUUID()
      const { error: inviteError } = await admin
        .from('family_members')
        .insert({
          profile_id: profileId,
          invited_email: memberEmail,
          role: 'editor',
          invite_token: inviteToken,
          invited_by: ownerId
        })
      if (inviteError) throw new Error(`Create invite: ${inviteError.message}`)

      // Step 6: Accept invite (link member to family_members record)
      const { error: acceptError } = await admin
        .from('family_members')
        .update({
          user_id: memberId,
          accepted_at: new Date().toISOString()
        })
        .eq('invite_token', inviteToken)
      if (acceptError) throw new Error(`Accept invite: ${acceptError.message}`)

      this.data = {
        ownerEmail,
        ownerPassword,
        ownerId,
        memberEmail,
        memberPassword,
        memberId,
        profileId,
        memoryId,
        inviteToken
      }

      return this.data
    } catch (error) {
      console.error('Seed setup failed:', error)
      // Cleanup on failure
      await this.cleanup()
      throw error
    }
  }

  async cleanup(): Promise<void> {
    if (!this.data) return

    const admin = this.getAdminClient()
    const { profileId, ownerEmail, memberEmail } = this.data

    try {
      // Delete memories for profile
      if (profileId) {
        await admin.from('memories').delete().eq('profile_id', profileId)
      }

      // Delete family members for profile
      if (profileId) {
        await admin.from('family_members').delete().eq('profile_id', profileId)
      }

      // Delete profile
      if (profileId) {
        await admin.from('profiles').delete().eq('id', profileId)
      }

      // Delete auth users
      for (const email of [ownerEmail, memberEmail]) {
        const { data: users } = await admin.auth.admin.listUsers()
        if (users?.users) {
          const user = users.users.find(u => u.email === email)
          if (user) {
            await admin.auth.admin.deleteUser(user.id)
          }
        }
      }
    } catch (error) {
      console.error('Seed cleanup error:', error)
    }

    this.data = null
  }
}

// Extend Playwright test with seed fixture
export const test = base.extend<{ seed: SeedFixture }>({
  seed: async ({}, fixture) => {
    const seedFixture = new SeedFixture()
    await fixture(seedFixture)
    await seedFixture.cleanup()
  }
})

export { expect } from '@playwright/test'

/**
 * Helper to login as a specific user
 */
export async function loginUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('邮箱').fill(email)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
}

/**
 * Helper to login as the seeded owner
 */
export async function loginAsOwner(page: Page, seedData: SeedData): Promise<void> {
  await loginUser(page, seedData.ownerEmail, seedData.ownerPassword)
}

/**
 * Helper to login as the seeded member
 */
export async function loginAsMember(page: Page, seedData: SeedData): Promise<void> {
  await loginUser(page, seedData.memberEmail, seedData.memberPassword)
}
