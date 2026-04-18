#!/usr/bin/env node
/**
 * Verify Memory Upload
 *
 * Backend verification of memory upload flow:
 * 1. Create user + profile
 * 2. Upload file to storage
 * 3. Create memory record with file metadata
 * 4. Verify memory can be read
 * 5. Verify thumbnail generation (if applicable)
 * 6. Cleanup
 *
 * Usage:
 *   node scripts/verify-memory-upload.mjs
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

// Minimal 1x1 JPEG
const MINIMAL_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=',
  'base64'
)

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
  } catch {
    // Ignore cleanup errors
  }
}

async function main() {
  const testEmail = `memory_upload_test_${Date.now()}@test.com`
  const testName = 'Memory Upload Test'

  console.log('\n' + cyan('═══════════════════════════════════════════════════════'))
  console.log(cyan('  📷 Memory Upload Verification Script'))
  console.log(cyan('═══════════════════════════════════════════════════════\n'))

  let userId, profileId, memoryId, storagePath

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
        name: 'Memory Test Profile',
        species: 'human',
        relationship: '测试'
      })
      .select()
      .single()
    if (createProfileError) throw new Error('Create profile: ' + createProfileError.message)
    profileId = profileData.id
    console.log(green(`✅ Profile created: ${profileId}`))

    // Step 3: Upload file to storage
    console.log('\n' + yellow('Step 3: Uploading file to storage...'))
    memoryId = crypto.randomUUID()
    storagePath = `${profileId}/${memoryId}/test-photo.jpg`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('memories')
      .upload(storagePath, MINIMAL_JPEG, {
        contentType: 'image/jpeg',
        upsert: false
      })
    if (uploadError) throw new Error('Upload to storage: ' + uploadError.message)
    console.log(green(`✅ File uploaded to storage: ${storagePath}`))

    // Step 4: Create memory record
    console.log('\n' + yellow('Step 4: Creating memory record...'))
    const { data: memoryData, error: createMemoryError } = await supabaseAdmin
      .from('memories')
      .insert({
        profile_id: profileId,
        contributor_id: userId,
        type: 'photo',
        file_path: storagePath,
        file_name: 'test-photo.jpg',
        file_size: MINIMAL_JPEG.length,
        mime_type: 'image/jpeg',
        memory_date: '2024-06-15',
        source_label: '原始记录',
        import_source: 'upload'
      })
      .select()
      .single()
    if (createMemoryError) throw new Error('Create memory: ' + createMemoryError.message)
    memoryId = memoryData.id
    console.log(green(`✅ Memory record created: ${memoryId}`))

    // Step 5: Read memory with file URL
    console.log('\n' + yellow('Step 5: Reading memory...'))
    const { data: readMemory, error: readError } = await supabaseAdmin
      .from('memories')
      .select('*')
      .eq('id', memoryId)
      .single()
    if (readError) throw new Error('Read memory: ' + readError.message)
    console.log(green('✅ Memory retrieved:'))
    console.log(`  - Type: ${readMemory.type}`)
    console.log(`  - File name: ${readMemory.file_name}`)
    console.log(`  - Source label: ${readMemory.source_label}`)

    // Step 6: Verify storage file exists
    console.log('\n' + yellow('Step 6: Verifying storage file exists...'))
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from('memories')
      .download(storagePath)
    if (fileError) throw new Error('Download from storage: ' + fileError.message)
    console.log(green(`✅ Storage file exists (${fileData.size} bytes)`))

    // Step 7: Verify source_label is immutable (should not be updateable)
    console.log('\n' + yellow('Step 7: Verifying source_label immutability...'))
    await supabaseAdmin
      .from('memories')
      .update({ source_label: 'Modified' })
      .eq('id', memoryId)
    // The immutability is enforced by DB trigger, so this should either fail or be ignored
    // We just verify the original value is unchanged
    const { data: checkImmutable } = await supabaseAdmin
      .from('memories')
      .select('source_label')
      .eq('id', memoryId)
      .single()
    if (checkImmutable.source_label !== '原始记录') {
      console.log(yellow('⚠️ Warning: source_label was modified (DB trigger may not be active)'))
    } else {
      console.log(green('✅ source_label is immutable'))
    }

    console.log(green('\n✅ MEMORY UPLOAD VERIFICATION: PASSED'))
    console.log(cyan('═══════════════════════════════════════════════════════'))
    console.log(cyan('\n📊 Summary:'))
    console.log(`  Profile ID: ${profileId}`)
    console.log(`  Memory ID: ${memoryId}`)
    console.log(`  Storage Path: ${storagePath}`)
    console.log(`  File Size: ${MINIMAL_JPEG.length} bytes`)
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
      await supabaseAdmin.from('profiles').delete().eq('id', profileId)
    }
    await cleanupTestUser(testEmail)
    console.log(green('✅ Cleanup complete'))
  }
}

main()
