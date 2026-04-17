#!/usr/bin/env node
/**
 * Verify Profile CRUD Operations
 *
 * Backend verification of profile lifecycle:
 * 1. Create user
 * 2. Create profile with all fields
 * 3. Read profile
 * 4. Update profile
 * 5. Verify soft delete (deleted_at)
 * 6. Cleanup
 *
 * Usage:
 *   node scripts/verify-profile-crud.mjs
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
  console.error('\x1b[31m❌ Missing environment variables\x1b[0m')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
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
      const { data: profiles } = await supabaseAdmin.from('profiles').select('id').eq('user_id', user.id)
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
  const testEmail = `profile_crud_test_${Date.now()}@test.com`
  const testName = 'Profile CRUD Test'

  console.log('\n' + cyan('═══════════════════════════════════════════════════════'))
  console.log(cyan('  👤 Profile CRUD Verification Script'))
  console.log(cyan('═══════════════════════════════════════════════════════\n'))

  let userId, profileId

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

    // Step 2: Create profile
    console.log('\n' + yellow('Step 2: Creating profile...'))
    const { data: profileData, error: createProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        name: '王奶奶',
        relationship: 'grandmother',
        birth_date: '1950-06-15',
        death_date: '2023-06-15',
        species: 'human'
      })
      .select()
      .single()
    if (createProfileError) throw new Error('Create profile: ' + createProfileError.message)
    profileId = profileData.id
    console.log(green(`✅ Profile created: ${profileId}`))

    // Step 3: Read profile
    console.log('\n' + yellow('Step 3: Reading profile...'))
    const { data: readProfile, error: readError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()
    if (readError) throw new Error('Read profile: ' + readError.message)
    console.log(green('✅ Profile retrieved:'))
    console.log(`  - Name: ${readProfile.name}`)
    console.log(`  - Relationship: ${readProfile.relationship}`)
    console.log(`  - Birth: ${readProfile.birth_date}`)
    console.log(`  - Death: ${readProfile.death_date}`)

    // Step 4: Update profile
    console.log('\n' + yellow('Step 4: Updating profile...'))
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        name: '王奶奶（已更新）'
      })
      .eq('id', profileId)
      .select()
      .single()
    if (updateError) throw new Error('Update profile: ' + updateError.message)
    console.log(green('✅ Profile updated:'))
    console.log(`  - New name: ${updateData.name}`)

    // Step 5: Verify update persisted
    console.log('\n' + yellow('Step 5: Verifying update persisted...'))
    const { data: verifyUpdate, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', profileId)
      .single()
    if (verifyError) throw new Error('Verify update: ' + verifyError.message)
    if (verifyUpdate.name !== '王奶奶（已更新）') throw new Error('Update not persisted')
    console.log(green('✅ Update persisted correctly'))

    // Step 6: Soft delete profile
    console.log('\n' + yellow('Step 6: Soft deleting profile...'))
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', profileId)
    if (deleteError) throw new Error('Soft delete: ' + deleteError.message)
    console.log(green('✅ Profile soft deleted'))

    // Step 7: Verify deleted_at is set
    console.log('\n' + yellow('Step 7: Verifying soft delete...'))
    const { data: deletedProfile, error: deletedError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, deleted_at')
      .eq('id', profileId)
      .single()
    if (deletedError) throw new Error('Check deleted_at: ' + deletedError.message)
    if (!deletedProfile.deleted_at) throw new Error('deleted_at not set')
    console.log(green(`✅ Soft delete verified (deleted_at: ${deletedProfile.deleted_at})`))

    console.log(green('\n✅ PROFILE CRUD VERIFICATION: PASSED'))
    console.log(cyan('═══════════════════════════════════════════════════════'))
    console.log(cyan('\n📊 Summary:'))
    console.log(`  Profile ID: ${profileId}`)
    console.log(`  User ID: ${userId}`)
    console.log(`  CRUD Operations: Create ✓ Read ✓ Update ✓ Delete ✓`)
    console.log(cyan('═══════════════════════════════════════════════════════\n'))

    process.exit(0)

  } catch (error) {
    console.error(red('\n❌ Error:'), error.message)
    process.exit(1)
  } finally {
    console.log(yellow('Cleaning up test data...'))
    await cleanupTestUser(testEmail)
    console.log(green('✅ Cleanup complete'))
  }
}

main()
