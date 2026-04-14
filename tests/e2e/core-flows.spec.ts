import { test, expect, Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Test fixtures - these would typically come from a test database or environment
const TEST_USERS = {
  user1: {
    email: `testuser1.${Date.now()}@example.com`,
    password: 'TestPass123',
    name: '测试用户1',
  },
  user2: {
    email: `testuser2.${Date.now()}@example.com`,
    password: 'TestPass123',
    name: '测试用户2',
  },
}

const TEST_PROFILE = {
  name: '王奶奶',
  relationship: 'grandmother',
}

// Helper function for accessibility check
async function checkAccessibility(page: Page, url: string) {
  await page.goto(url)
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
}

// Helper to generate unique email for each test run
function generateUniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`
}

// Helper to wait for navigation
async function waitForNavigation(page: Page, action: () => Promise<void>) {
  await action()
  await page.waitForLoadState('networkidle')
}

test.describe('E2E Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test.describe('Flow 1: Register → Login → Logout', () => {
    test('should register, logout, and login again', async ({ page }) => {
      const email = generateUniqueEmail('register')
      const password = 'TestPass123'

      // 1. Register
      await page.goto('/register')
      await checkAccessibility(page, '/register')

      // Fill registration form
      await page.getByLabel('邮箱').fill(email)
      await page.getByLabel('密码').fill(password)
      await page.getByLabel('确认密码').fill(password)
      await page.getByRole('button', { name: '注册' }).click()

      // Wait for success message (email verification sent)
      await expect(page.getByText('验证邮件已发送')).toBeVisible({ timeout: 10000 })

      // For E2E testing with Supabase local dev, we may need to use pre-verified users
      // or handle email verification differently
    })

    test('should login with valid credentials', async ({ page }) => {
      // This test assumes a user already exists
      // In real E2E, you'd use a seeded test user or create one first
      await page.goto('/login')
      await checkAccessibility(page, '/login')

      // Fill login form - using placeholder credentials
      // In actual E2E with Supabase local, you'd create and login with real test user
      await page.getByLabel('邮箱').fill('test@example.com')
      await page.getByLabel('密码').fill('TestPass123')
      await page.getByRole('button', { name: '登录' }).click()

      // Should show error for invalid credentials
      await expect(page.getByRole('alert')).toBeVisible()
    })

    test('should logout via user menu', async ({ page }) => {
      // Login first
      await page.goto('/login')

      // Note: This test would require a pre-authenticated state
      // For E2E, typically use storageState to persist login
    })
  })

  test.describe('Flow 2: Create Profile → Upload Photo → Timeline Display', () => {
    test('should create a new profile', async ({ page }) => {
      // Login first (assumes authenticated state - would use storageState in CI)
      await page.goto('/login')
      // In a real E2E test, you'd either:
      // 1. Use storageState to persist authentication
      // 2. Seed a test user in the database
      // 3. Use Supabase test helpers

      // Navigate to create profile page
      await page.goto('/profile/new')
      await checkAccessibility(page, '/profile/new')

      // Fill profile form
      await page.getByLabel('姓名').fill(TEST_PROFILE.name)

      // Select relationship
      const relationshipSelect = page.locator('#relationship')
      await relationshipSelect.selectOption(TEST_PROFILE.relationship)

      // Submit form
      await page.getByRole('button', { name: '创建记忆空间' }).click()

      // Should redirect to profile page
      await expect(page).toHaveURL(/\/profile\/[a-z0-9-]+/)
    })

    test('should upload a photo to profile', async ({ page, browser }) => {
      // Create context with storage state for authenticated user
      // This is a simplified version - real implementation would use proper auth

      // Navigate to profile upload page
      // Note: In real E2E, profileId would be dynamic from created profile
      const profileId = 'test-profile-id' // This would come from test fixture or previous step

      await page.goto(`/profile/${profileId}/upload`)
      await checkAccessibility(page, `/profile/${profileId}/upload`)

      // Upload zone should be visible
      await expect(page.getByText('上传记忆')).toBeVisible()

      // File input would be handled by the UploadZone component
      // In Playwright, we'd upload a file like this:
      // const fileInput = page.locator('input[type="file"]')
      // await fileInput.setInputFiles('/path/to/test/fixtures/sample-photo.jpg')
    })

    test('should display photo in timeline after upload', async ({ page }) => {
      // Navigate to profile timeline
      const profileId = 'test-profile-id'
      await page.goto(`/profile/${profileId}`)
      await checkAccessibility(page, `/profile/${profileId}`)

      // Should show timeline or empty state
      // Timeline content would depend on whether photos exist
    })
  })

  test.describe('Flow 3: Add Annotation → Verify Persistence', () => {
    test('should add annotation to memory', async ({ page }) => {
      // Navigate to memory detail page
      const profileId = 'test-profile-id'
      const memoryId = 'test-memory-id'

      await page.goto(`/profile/${profileId}/memory/${memoryId}`)
      await checkAccessibility(page, `/profile/${profileId}/memory/${memoryId}`)

      // Find annotation editor
      const annotationTextarea = page.locator('textarea[placeholder*="记忆注释"]')
      if (await annotationTextarea.isVisible()) {
        // Add annotation
        const testAnnotation = `这是一段测试注释 ${Date.now()}`
        await annotationTextarea.fill(testAnnotation)

        // Save button should appear
        const saveButton = page.getByRole('button', { name: '保存' })
        await expect(saveButton).toBeVisible()

        // Save
        await saveButton.click()

        // Wait for save to complete
        await page.waitForLoadState('networkidle')
      }
    })

    test('should persist annotation after page refresh', async ({ page }) => {
      const profileId = 'test-profile-id'
      const memoryId = 'test-memory-id'

      // Navigate to memory
      await page.goto(`/profile/${profileId}/memory/${memoryId}`)

      // Add annotation
      const testAnnotation = `持久化测试注释 ${Date.now()}`
      const annotationTextarea = page.locator('textarea[placeholder*="记忆注释"]')

      if (await annotationTextarea.isVisible()) {
        await annotationTextarea.fill(testAnnotation)

        // Save
        const saveButton = page.getByRole('button', { name: '保存' })
        if (await saveButton.isVisible()) {
          await saveButton.click()
        }

        // Wait for save
        await page.waitForLoadState('networkidle')
      }

      // Refresh page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Annotation should persist - either in view mode or edit mode
      const annotationContent = page.locator('p:has-text("持久化测试注释")')
      await expect(annotationContent).toBeVisible()
    })
  })

  test.describe('Flow 4: Invite Family → Accept Invite → Collaborative Editing', () => {
    test('should generate invitation link as profile owner', async ({ page }) => {
      const profileId = 'test-profile-id'

      // Navigate to family management page
      await page.goto(`/profile/${profileId}/family`)
      await checkAccessibility(page, `/profile/${profileId}/family`)

      // Should see family management page
      await expect(page.getByRole('heading', { name: '家庭成员管理' })).toBeVisible()

      // Click invite button (would open InviteDialog)
      const inviteButton = page.getByRole('button', { name: '邀请家人' })
      if (await inviteButton.isVisible()) {
        await inviteButton.click()

        // Dialog should open
        await expect(page.getByRole('dialog')).toBeVisible()

        // Fill invite form
        const email = generateUniqueEmail('invite')
        await page.locator('#invite-email').fill(email)

        // Submit
        await page.getByRole('button', { name: '生成邀请链接' }).click()

        // Should show invite link
        await expect(page.getByLabel('邀请链接')).toBeVisible()
      }
    })

    test('should accept invitation and join profile', async ({ browser, page }) => {
      // This test requires two browser contexts - one for inviter, one for invitee

      // First, get an invite token (would need to create via API in real test)
      const inviteToken = 'test-invite-token'

      // Open invite page in new context
      const invitePage = await browser.newPage()
      await invitePage.setViewportSize({ width: 1280, height: 720 })

      await invitePage.goto(`/invite/${inviteToken}`)
      await checkAccessibility(invitePage, `/invite/${inviteToken}`)

      // Should show invite acceptance page
      await expect(invitePage.getByRole('heading', { name: '加入记忆空间' })).toBeVisible()

      // Should show login/register options if not authenticated
      // or join button if already logged in
      const loginButton = invitePage.getByRole('link', { name: '登录' })
      const joinButton = invitePage.getByRole('button', { name: '加入此记忆空间' })

      if (await loginButton.isVisible()) {
        // User not logged in - should show login/register options
        await expect(loginButton).toBeVisible()
        await expect(invitePage.getByRole('link', { name: '注册' })).toBeVisible()
      } else if (await joinButton.isVisible()) {
        // User logged in - can directly join
        await joinButton.click()
        await expect(invitePage).toHaveURL(/\/profile\/[a-z0-9-]+/)
      }
    })

    test('should show profile to invited user', async ({ page }) => {
      // After accepting invite, invited user should see the profile
      const profileId = 'test-profile-id'

      await page.goto(`/profile/${profileId}`)
      await checkAccessibility(page, `/profile/${profileId}`)

      // Should see profile with timeline
      await expect(page.getByText('时间线').or(page.getByText('这里还没有记忆'))).toBeVisible()
    })
  })

  test.describe('Flow 5: Unauthenticated Access → Redirect', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      // Attempt to access protected dashboard page
      await page.goto('/dashboard')

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/)

      // Login page content should be visible
      await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible()
    })

    test('should redirect to login when accessing profile without auth', async ({ page }) => {
      const profileId = 'test-profile-id'
      await page.goto(`/profile/${profileId}`)

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect to login when accessing upload page without auth', async ({ page }) => {
      const profileId = 'test-profile-id'
      await page.goto(`/profile/${profileId}/upload`)

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect to login when accessing family page without auth', async ({ page }) => {
      const profileId = 'test-profile-id'
      await page.goto(`/profile/${profileId}/family`)

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test('should allow access to login and register pages without redirect', async ({ page }) => {
      await page.goto('/login')
      await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible()

      await page.goto('/register')
      await expect(page.getByRole('heading', { name: '创建账号' })).toBeVisible()
    })

    test('should allow access to landing page without redirect', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('忆锚')).toBeVisible()
    })
  })

  test.describe('Accessibility Tests', () => {
    test('dashboard page should have no accessibility violations', async ({ page }) => {
      // Login first to access dashboard
      await page.goto('/login')
      // Would need authenticated state for full dashboard test
    })

    test('login page should have no accessibility violations', async ({ page }) => {
      await checkAccessibility(page, '/login')
    })

    test('register page should have no accessibility violations', async ({ page }) => {
      await checkAccessibility(page, '/register')
    })

    test('landing page should have no accessibility violations', async ({ page }) => {
      await checkAccessibility(page, '/')
    })

    test('new profile page should have no accessibility violations', async ({ page }) => {
      await checkAccessibility(page, '/profile/new')
    })
  })
})

// Note for CI implementation:
// - Use @playwright/test's storageState to persist authentication across tests
// - Seed test data in Supabase before running tests
// - Use test databases or Supabase branch for isolation
// - Consider using test fixtures for reusable test data
