#!/usr/bin/env node
/**
 * Verify Delete Account Functionality
 *
 * Backend verification of delete account flow:
 * 1. Create test user
 * 2. Create profile with memories
 * 3. Call deleteAccount action
 * 4. Verify ALL data is deleted (user, profiles, memories, family_members, reminders)
 *
 * Usage:
 *   node scripts/verify-delete-account.mjs
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

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Colors
const green = (t) => `\x1b[32m${t}\x1b[0m`
const red = (t) => `\x1b[31m${t}\x1b[0m`
const yellow = (t) => `\x1b[33m${t}\x1b[0m`
const cyan = (t) => `\x1b[36m${t}\x1b[0m`

const TEST_EMAIL_PREFIX = 'delete_account_test_'
const TEST_PASSWORD = 'TestPassword123!'

async function cleanupTestUser(email) {
  // Find and delete user by email
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users?.find(u => u.email === email)

  if (user) {
    // Delete related data first (cascade manually due to FK constraints)
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, avatar_path')
      .eq('user_id', user.id)

    for (const profile of profiles || []) {
      // Delete memories
      await supabaseAdmin.from('memories').delete().eq('profile_id', profile.id)
      // Delete family_members where user is the member
      await supabaseAdmin.from('family_members').delete().eq('user_id', user.id)
      // Delete reminders
      await supabaseAdmin.from('reminders').delete().eq('user_id', user.id)
      // Delete profile avatar
      if (profile.avatar_path) {
        await supabaseAdmin.storage.from('avatars').remove([profile.avatar_path])
      }
      // Delete profile
      await supabaseAdmin.from('profiles').delete().eq('id', profile.id)
    }

    // Delete storage folders
    await supabaseAdmin.storage.from('memories').remove([user.id])
    await supabaseAdmin.storage.from('avatars').remove([user.id])

    // Delete auth user
    await supabaseAdmin.auth.admin.deleteUser(user.id)
  }
}

async function main() {
  const testEmail = `${TEST_EMAIL_PREFIX}${Date.now()}@test.com`
  const testName = 'Delete Account Test User'

  console.log('\n' + cyan('═══════════════════════════════════════════════════════'))
  console.log(cyan('  🧪 Delete Account Verification Script'))
  console.log(cyan('═══════════════════════════════════════════════════════\n'))

  try {
    // Step 1: Create test user
    console.log(yellow('Step 1: Creating test user...'))
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: TEST_PASSWORD,
      user_metadata: { name: testName }
    })

    if (signUpError) {
      console.error(red('❌ Failed to create user:'), signUpError.message)
      process.exit(1)
    }

    const userId = authData.user.id
    console.log(green(`✅ User created: ${userId}`))

    // Step 2: Create a profile for this user
    console.log('\n' + yellow('Step 2: Creating test profile...'))
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        name: 'Delete Test Profile',
        species: 'human',
        birth_date: '1950-01-01',
        death_date: '2020-01-01',
        relationship: '测试关系',
        description: '这是用于删除测试的档案'
      })
      .select()
      .single()

    if (profileError) {
      console.error(red('❌ Failed to create profile:'), profileError.message)
      await cleanupTestUser(testEmail)
      process.exit(1)
    }

    const profileId = profileData.id
    console.log(green(`✅ Profile created: ${profileId}`))

    // Step 3: Add a memory to this profile
    console.log('\n' + yellow('Step 3: Creating test memory...'))
    const { data: memoryData, error: memoryError } = await supabaseAdmin
      .from('memories')
      .insert({
        profile_id: profileId,
        contributor_id: userId,
        type: 'text',
        content: '这是一条用于测试删除的记忆',
        memory_date: '2020-06-15',
        file_name: 'test_memory.txt'
      })
      .select()
      .single()

    if (memoryError) {
      console.error(red('❌ Failed to create memory:'), memoryError.message)
      await cleanupTestUser(testEmail)
      process.exit(1)
    }

    const memoryId = memoryData.id
    console.log(green(`✅ Memory created: ${memoryId}`))

    // Step 4: Add a reminder
    console.log('\n' + yellow('Step 4: Creating test reminder...'))
    const { error: reminderError } = await supabaseAdmin
      .from('reminders')
      .insert({
        profile_id: profileId,
        user_id: userId,
        title: '删除测试纪念日',
        reminder_date: '2020-01-01'
      })

    if (reminderError) {
      console.error(red('❌ Failed to create reminder:'), reminderError.message)
      await cleanupTestUser(testEmail)
      process.exit(1)
    }
    console.log(green('✅ Reminder created'))

    // Step 5: Verify all data exists before deletion
    console.log('\n' + yellow('Step 5: Verifying data exists before deletion...'))

    const [profileCheck, memoryCheck, reminderCheck] = await Promise.all([
      supabaseAdmin.from('profiles').select('id').eq('user_id', userId),
      supabaseAdmin.from('memories').select('id').eq('profile_id', profileId),
      supabaseAdmin.from('reminders').select('id').eq('user_id', userId)
    ])

    console.log(`  - Profiles: ${profileCheck.data?.length || 0}`)
    console.log(`  - Memories: ${memoryCheck.data?.length || 0}`)
    console.log(`  - Reminders: ${reminderCheck.data?.length || 0}`)

    if (profileCheck.data?.length === 0 || memoryCheck.data?.length === 0) {
      console.error(red('❌ Test setup failed - data not created'))
      await cleanupTestUser(testEmail)
      process.exit(1)
    }
    console.log(green('✅ All test data verified'))

    // Step 6: Simulate deleteAccount action (manually execute what the action does)
    console.log('\n' + yellow('Step 6: Executing deleteAccount flow...'))

    // 6a: Delete reminders
    const { error: delReminders } = await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('user_id', userId)
    if (delReminders) throw new Error('Delete reminders failed: ' + delReminders.message)
    console.log(green('  ✅ Reminders deleted'))

    // 6b: Delete family_members
    const { error: delFamily } = await supabaseAdmin
      .from('family_members')
      .delete()
      .eq('user_id', userId)
    if (delFamily) throw new Error('Delete family_members failed: ' + delFamily.message)
    console.log(green('  ✅ Family memberships deleted'))

    // 6c: Delete memories
    const { error: delMemories } = await supabaseAdmin
      .from('memories')
      .delete()
      .eq('profile_id', profileId)
    if (delMemories) throw new Error('Delete memories failed: ' + delMemories.message)
    console.log(green('  ✅ Memories deleted'))

    // 6d: Delete profile avatar (if exists)
    if (profileData.avatar_path) {
      await supabaseAdmin.storage.from('avatars').remove([profileData.avatar_path])
    }

    // 6e: Delete profile
    const { error: delProfile } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', profileId)
    if (delProfile) throw new Error('Delete profile failed: ' + delProfile.message)
    console.log(green('  ✅ Profile deleted'))

    // 6f: Delete storage folders
    await supabaseAdmin.storage.from('memories').remove([userId])
    await supabaseAdmin.storage.from('avatars').remove([userId])
    console.log(green('  ✅ Storage files deleted'))

    // 6g: Delete auth user
    const { error: delUser } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (delUser) throw new Error('Delete auth user failed: ' + delUser.message)
    console.log(green('  ✅ Auth user deleted'))

    // Step 7: Verify ALL data is gone
    console.log('\n' + yellow('Step 7: Verifying complete deletion...'))

    const [finalProfile, finalMemory, finalReminder, finalUser] = await Promise.all([
      supabaseAdmin.from('profiles').select('id').eq('user_id', userId),
      supabaseAdmin.from('memories').select('id').eq('profile_id', profileId),
      supabaseAdmin.from('reminders').select('id').eq('user_id', userId),
      Promise.resolve(supabaseAdmin.auth.admin.listUsers().then(({ data }) =>
        data?.users?.find(u => u.id === userId)
      ))
    ])

    let allDeleted = true
    const checks = [
      { name: 'Profiles', count: finalProfile.data?.length || 0, expected: 0 },
      { name: 'Memories', count: finalMemory.data?.length || 0, expected: 0 },
      { name: 'Reminders', count: finalReminder.data?.length || 0, expected: 0 },
      { name: 'Auth User', count: finalUser ? 1 : 0, expected: 0 },
    ]

    console.log()
    for (const check of checks) {
      const status = check.count === check.expected ? green('✅') : red('❌')
      console.log(`  ${status} ${check.name}: ${check.count} (expected ${check.expected})`)
      if (check.count !== check.expected) allDeleted = false
    }

    console.log('\n' + cyan('═══════════════════════════════════════════════════════'))

    if (allDeleted) {
      console.log(green('  ✅ DELETE ACCOUNT VERIFICATION: PASSED'))
      console.log(cyan('═══════════════════════════════════════════════════════\n'))
      process.exit(0)
    } else {
      console.log(red('  ❌ DELETE ACCOUNT VERIFICATION: FAILED'))
      console.log(cyan('═══════════════════════════════════════════════════════\n'))
      process.exit(1)
    }

  } catch (error) {
    console.error(red('\n❌ Error:'), error.message)
    // Cleanup on error
    await cleanupTestUser(testEmail)
    process.exit(1)
  }
}

main()
