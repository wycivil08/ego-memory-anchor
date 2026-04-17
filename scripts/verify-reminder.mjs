#!/usr/bin/env node
/**
 * Verify Reminder System
 *
 * Backend verification of reminder flow:
 * 1. Create user + profile
 * 2. Create reminder (once)
 * 3. Create reminder (yearly lunar)
 * 4. Read reminders
 * 5. Update reminder
 * 6. Delete reminder
 * 7. Cleanup
 *
 * Usage:
 *   node scripts/verify-reminder.mjs
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
  const testEmail = `reminder_test_${Date.now()}@test.com`
  const testName = 'Reminder Test User'

  console.log('\n' + cyan('═══════════════════════════════════════════════════════'))
  console.log(cyan('  🔔 Reminder Verification Script'))
  console.log(cyan('═══════════════════════════════════════════════════════\n'))

  let userId, profileId, reminderIdOnce, reminderIdYearly

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
        name: 'Reminder Test Profile',
        species: 'human',
        relationship: '测试'
      })
      .select()
      .single()
    if (createProfileError) throw new Error('Create profile: ' + createProfileError.message)
    profileId = profileData.id
    console.log(green(`✅ Profile created: ${profileId}`))

    // Step 3: Create "once" reminder
    console.log('\n' + yellow('Step 3: Creating once reminder...'))
    const { data: onceData, error: onceError } = await supabaseAdmin
      .from('reminders')
      .insert({
        user_id: userId,
        profile_id: profileId,
        title: '生日纪念日',
        reminder_date: '2024-06-15',
        recurrence: 'once',
        notes: '一次性提醒测试'
      })
      .select()
      .single()
    if (onceError) throw new Error('Create once reminder: ' + onceError.message)
    reminderIdOnce = onceData.id
    console.log(green(`✅ Once reminder created: ${reminderIdOnce}`))

    // Step 4: Create "yearly" reminder
    console.log('\n' + yellow('Step 4: Creating yearly reminder...'))
    const { data: yearlyData, error: yearlyError } = await supabaseAdmin
      .from('reminders')
      .insert({
        user_id: userId,
        profile_id: profileId,
        title: '忌日',
        reminder_date: '2024-06-15',
        recurrence: 'yearly',
        notes: '每年提醒测试'
      })
      .select()
      .single()
    if (yearlyError) throw new Error('Create yearly reminder: ' + yearlyError.message)
    reminderIdYearly = yearlyData.id
    console.log(green(`✅ Yearly reminder created: ${reminderIdYearly}`))

    // Step 5: Read all reminders
    console.log('\n' + yellow('Step 5: Reading reminders...'))
    const { data: reminders, error: readError } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at')
    if (readError) throw new Error('Read reminders: ' + readError.message)
    console.log(green(`✅ Retrieved ${reminders.length} reminders`))
    for (const r of reminders) {
      console.log(`  - ${r.title} (${r.recurrence})`)
    }

    // Step 6: Update reminder
    console.log('\n' + yellow('Step 6: Updating reminder...'))
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('reminders')
      .update({ notes: '已更新的备注' })
      .eq('id', reminderIdOnce)
      .select()
      .single()
    if (updateError) throw new Error('Update reminder: ' + updateError.message)
    console.log(green(`✅ Reminder updated: ${updateData.notes}`))

    // Step 7: Delete yearly reminder
    console.log('\n' + yellow('Step 7: Deleting reminder...'))
    const { error: deleteError } = await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('id', reminderIdYearly)
    if (deleteError) throw new Error('Delete reminder: ' + deleteError.message)
    console.log(green('✅ Reminder deleted'))

    // Step 8: Verify deletion
    console.log('\n' + yellow('Step 8: Verifying deletion...'))
    const { data: afterDelete } = await supabaseAdmin
      .from('reminders')
      .select('id')
      .eq('id', reminderIdYearly)
    if (afterDelete.length > 0) throw new Error('Reminder still exists after delete')
    console.log(green('✅ Deletion verified'))

    console.log(green('\n✅ REMINDER VERIFICATION: PASSED'))
    console.log(cyan('═══════════════════════════════════════════════════════'))
    console.log(cyan('\n📊 Summary:'))
    console.log(`  Profile ID: ${profileId}`)
    console.log(`  User ID: ${userId}`)
    console.log(`  Reminders Created: 2`)
    console.log(`  Reminders Deleted: 1`)
    console.log(`  Reminders Remaining: 1`)
    console.log(cyan('═══════════════════════════════════════════════════════\n'))

    process.exit(0)

  } catch (error) {
    console.error(red('\n❌ Error:'), error.message)
    process.exit(1)
  } finally {
    console.log(yellow('Cleaning up test data...'))
    if (profileId) {
      await supabaseAdmin.from('memories').delete().eq('profile_id', profileId)
      await supabaseAdmin.from('family_members').delete().eq('profile_id', profileId)
      await supabaseAdmin.from('reminders').delete().eq('profile_id', profileId)
      await supabaseAdmin.from('profiles').delete().eq('id', profileId)
    }
    await cleanupTestUser(testEmail)
    console.log(green('✅ Cleanup complete'))
  }
}

main()
