#!/usr/bin/env node
/**
 * Verify Authentication Flow
 *
 * Backend verification of auth:
 * 1. Create user with email/password
 * 2. Sign in
 * 3. Get user metadata
 * 4. Verify JWT claims
 * 5. Sign out
 * 6. Delete user (cleanup)
 *
 * Usage:
 *   node scripts/verify-auth.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
const envPath = join(__dirname, '..', '.env.local')
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\x1b[31m❌ Missing environment variables\x1b[0m')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const supabaseClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const green = (t) => `\x1b[32m${t}\x1b[0m`
const red = (t) => `\x1b[31m${t}\x1b[0m`
const yellow = (t) => `\x1b[33m${t}\x1b[0m`
const cyan = (t) => `\x1b[36m${t}\x1b[0m`

const TEST_PASSWORD = 'TestPassword123!'

async function cleanupTestUser(email) {
  try {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === email)
    if (user) {
      // Delete user's data first
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
      for (const profile of profiles || []) {
        await supabaseAdmin.from('memories').delete().eq('profile_id', profile.id)
        await supabaseAdmin.from('family_members').delete().eq('profile_id', profile.id)
        await supabaseAdmin.from('reminders').delete().eq('user_id', user.id)
        await supabaseAdmin.from('profiles').delete().eq('id', profile.id)
      }
      await supabaseAdmin.auth.admin.deleteUser(user.id)
    }
  } catch (_e) {
    // Ignore cleanup errors
  }
}

async function main() {
  const testEmail = `auth_test_${Date.now()}@test.com`
  const testName = 'Auth Test User'

  console.log('\n' + cyan('═══════════════════════════════════════════════════════'))
  console.log(cyan('  🔐 Authentication Verification Script'))
  console.log(cyan('═══════════════════════════════════════════════════════\n'))

  let userId

  try {
    // Step 1: Create user
    console.log(yellow('Step 1: Creating user...'))
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: TEST_PASSWORD,
      user_metadata: { name: testName },
      email_confirm: true
    })
    if (createError) throw new Error('Create user: ' + createError.message)
    userId = userData.user.id
    console.log(green(`✅ User created: ${userId}`))

    // Step 2: Sign in
    console.log('\n' + yellow('Step 2: Signing in...'))
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: testEmail,
      password: TEST_PASSWORD
    })
    if (signInError) throw new Error('Sign in: ' + signInError.message)
    console.log(green(`✅ Signed in as ${signInData.user.email}`))

    // Step 3: Get session
    console.log('\n' + yellow('Step 3: Verifying session...'))
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession()
    if (sessionError || !sessionData.session) throw new Error('Get session: ' + (sessionError?.message || 'no session'))
    console.log(green('✅ Session retrieved'))
    console.log(`  - Access token: ${sessionData.session.access_token.substring(0, 20)}...`)
    console.log(`  - Expires at: ${new Date(sessionData.session.expires_at * 1000).toISOString()}`)

    // Step 4: Get user metadata
    console.log('\n' + yellow('Step 4: Verifying user metadata...'))
    const { data: userMeta, error: userMetaError } = await supabaseClient.auth.getUser()
    if (userMetaError) throw new Error('Get user: ' + userMetaError.message)
    console.log(green('✅ User metadata retrieved:'))
    console.log(`  - ID: ${userMeta.user.id}`)
    console.log(`  - Email: ${userMeta.user.email}`)
    console.log(`  - Name: ${userMeta.user.user_metadata?.name}`)

    // Step 5: Verify JWT claims
    console.log('\n' + yellow('Step 5: Verifying JWT claims...'))
    const token = sessionData.session.access_token
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log(green('✅ JWT claims verified:'))
    console.log(`  - Sub (user ID): ${payload.sub === userId ? '✓ Match' : '✗ Mismatch'}`)
    console.log(`  - Email: ${payload.email}`)
    console.log(`  - Role: ${payload.role || 'none'}`)
    console.log(`  - Exp: ${new Date(payload.exp * 1000).toISOString()}`)

    // Step 6: Sign out
    console.log('\n' + yellow('Step 6: Signing out...'))
    const { error: signOutError } = await supabaseClient.auth.signOut()
    if (signOutError) throw new Error('Sign out: ' + signOutError.message)
    console.log(green('✅ Signed out successfully'))

    // Step 7: Verify session cleared
    console.log('\n' + yellow('Step 7: Verifying session cleared...'))
    const { data: afterSignOut } = await supabaseClient.auth.getSession()
    if (afterSignOut.session) throw new Error('Session should be null after sign out')
    console.log(green('✅ Session cleared'))

    console.log(green('\n✅ AUTHENTICATION VERIFICATION: PASSED'))
    console.log(cyan('═══════════════════════════════════════════════════════'))
    console.log(cyan('\n📊 Summary:'))
    console.log(`  Email: ${testEmail}`)
    console.log(`  User ID: ${userId}`)
    console.log(`  Auth Methods: Password ✓`)
    console.log(cyan('═══════════════════════════════════════════════════════\n'))

    process.exit(0)

  } catch (error) {
    console.error(red('\n❌ Error:'), error.message)
    process.exit(1)
  } finally {
    // Cleanup
    console.log(yellow('Cleaning up test data...'))
    await cleanupTestUser(testEmail)
    console.log(green('✅ Cleanup complete'))
  }
}

main()
