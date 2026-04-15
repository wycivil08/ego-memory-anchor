#!/usr/bin/env node
/**
 * Test upload script for ego-memory-anchor
 * Tests storage upload with various filename patterns
 *
 * Usage:
 *   node scripts/test-upload.mjs <profileId> [options]
 *   node scripts/test-upload.mjs --list-profiles
 *
 * Options:
 *   --service-role   Use service role key (bypasses RLS) to test path encoding only
 *   --sanitized      Test WITH sanitizeFilename applied (simulates fixed frontend)
 *   --user <email>   Login as user and test with their JWT (simulates real frontend flow)
 *
 * Environment variables (from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local manually
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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables. Copy .env.local.example to .env.local')
  process.exit(1)
}

// Create clients
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Login as user - modifies supabaseAnon client in place
 */
async function loginAndGetClient(email, password) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password
  })
  if (error || !data?.session) {
    throw new Error('Login failed: ' + (error?.message || 'no session'))
  }
  // Return the same client - signInWithPassword sets the session on it
  return supabaseAnon
}

// ============================================================
// Test file definitions
// ============================================================
const TEST_FILES_DIR = join(__dirname, '..', 'tests', 'fixtures', 'upload-test')

const testFiles = [
  { file: 'normal-photo.jpg', label: 'Normal filename', hasIssue: false },
  { file: 'photo-with-spaces test.jpg', label: 'Filename with spaces', hasIssue: 'spaces→_' },
  { file: 'photo-with-brackets[test].jpg', label: 'Filename with brackets []', hasIssue: '[] not sanitized' },
  { file: 'photo-with-braces{test}.jpg', label: 'Filename with braces {}', hasIssue: '{} not sanitized' },
  { file: 'photo-with-mixed[]{}test.jpg', label: 'Filename with mixed [] and {}', hasIssue: '[]{} not sanitized' },
  { file: 'photo-with-percent%sign.jpg', label: 'Filename with percent % sign', hasIssue: '% not sanitized' },
]

// ============================================================
// Utilities
// ============================================================

function green(text) { return `\x1b[32m${text}\x1b[0m` }
function red(text) { return `\x1b[31m${text}\x1b[0m` }
function yellow(text) { return `\x1b[33m${text}\x1b[0m` }
function cyan(text) { return `\x1b[36m${text}\x1b[0m` }

/**
 * Sanitize filename (mirrors lib/utils/storage.ts - FIXED version)
 */
function sanitizeFilename(filename) {
  const sanitized = filename
    .replace(/[/\\:*?"<>|[\]{}%]/g, '_')  // Fixed: includes [] {} %
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 200)
  return sanitized || 'file'
}

// ============================================================
// Commands
// ============================================================

async function listProfiles() {
  console.log('\n' + cyan('📋 Available profiles:'))

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, user_id, deleted_at')
    .is('deleted_at', null)
    .limit(10)

  if (error) {
    console.error(red('Error fetching profiles:'), error.message)
    return false
  }

  if (!data || data.length === 0) {
    console.log(yellow('No profiles found.'))
    return false
  }

  console.log()
  for (const p of data) {
    console.log(`  ${cyan(p.id)} — ${p.name}`)
  }
  console.log()
  return true
}

async function cleanupTestFiles(paths) {
  if (paths.length === 0) return
  const { error } = await supabaseAdmin.storage.from('memories').remove(paths)
  if (error) console.log(`  Cleanup warning: ${error.message}`)
}

async function testUpload(profileId, options = {}, supabaseOverride) {
  const { useServiceRole = false, applySanitize = false } = options
  const supabase = supabaseOverride || (useServiceRole ? supabaseAdmin : supabaseAnon)
  const modeLabel = useServiceRole
    ? cyan('[Service Role - RLS bypassed]')
    : yellow('[Anon Key - RLS active]')
  const sanitizeLabel = applySanitize ? cyan('[WITH sanitizeFilename]') : yellow('[WITHOUT sanitize]')

  console.log('\n' + cyan('🧪 Testing Storage Upload'))
  console.log('─'.repeat(60))
  console.log(`Profile ID: ${yellow(profileId)}`)
  console.log(`Mode: ${modeLabel} ${sanitizeLabel}`)
  console.log()

  // Verify profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, name')
    .eq('id', profileId)
    .single()

  if (!profile) {
    console.error(red('❌ Profile not found:', profileId))
    return false
  }
  console.log(`Profile: ${profile.name}`)
  console.log()

  const results = []
  const uploadedPaths = []

  for (const testFile of testFiles) {
    const originalName = testFile.file
    const memoryId = crypto.randomUUID()
    const finalName = applySanitize ? sanitizeFilename(originalName) : originalName
    const storagePath = `${profileId}/${memoryId}/${finalName}`

    const displayName = applySanitize && finalName !== originalName
      ? `${originalName} → ${finalName}`
      : originalName

    process.stdout.write(`  ${testFile.label}\n`)
    process.stdout.write(`    Path: ${storagePath}\n    `)

    try {
      const filePath = join(TEST_FILES_DIR, originalName)
      const fileContent = readFileSync(filePath)

      const { data, error } = await supabase
        .storage
        .from('memories')
        .upload(storagePath, fileContent, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        results.push({ file: originalName, label: testFile.label, finalName, success: false, error: error.message, status: error.status })
        console.log(red(`❌ FAIL [${error.status || '?'}] ${error.message}`))
      } else {
        results.push({ file: originalName, label: testFile.label, finalName, success: true })
        uploadedPaths.push(data.path)
        console.log(green(`✅ OK → ${data.path}`))
      }
    } catch (err) {
      results.push({ file: originalName, label: testFile.label, finalName, success: false, error: err.message })
      console.log(red(`❌ EXCEPTION: ${err.message}`))
    }
  }

  // Cleanup
  if (uploadedPaths.length > 0) {
    console.log()
    console.log(cyan('🧹 Cleaning up...'))
    await cleanupTestFiles(uploadedPaths)
  }

  // Summary
  console.log()
  console.log('─'.repeat(60))
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  console.log(cyan(`📊 Results: ${green(passed)} passed, ${failed > 0 ? red(failed) : yellow(0)} failed`))

  return failed === 0
}

// ============================================================
// Main
// ============================================================

const args = process.argv.slice(2)

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${cyan('Usage:')} node scripts/test-upload.mjs [profileId] [options]

${cyan('Commands:')}
  <profileId>              Test upload to specified profile
  --list-profiles         List available profiles

${cyan('Options:')}
  --service-role          Use service role key (bypasses RLS)
  --sanitized             Apply sanitizeFilename before upload

${cyan('Examples:')}
  node scripts/test-upload.mjs --list-profiles
  node scripts/test-upload.mjs <profileId>              # Anon key, no sanitize
  node scripts/test-upload.mjs <profileId> --sanitized  # Anon key, WITH sanitize
  node scripts/test-upload.mjs <profileId> --service-role --sanitized  # Full test
  node scripts/test-upload.mjs <profileId> --user seed1@test.com --sanitized  # Real user flow
`)
    return
  }

  if (args.includes('--list-profiles')) {
    await listProfiles()
    return
  }

  let profileId = args.find(a => !a.startsWith('--'))
  const useServiceRole = args.includes('--service-role')
  const applySanitize = args.includes('--sanitized')

  // Handle --user option
  const userIndex = args.indexOf('--user')
  const userEmail = userIndex >= 0 ? args[userIndex + 1] : null

  if (!profileId) {
    // Try to find first profile
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .is('deleted_at', null)
      .limit(1)

    if (profiles && profiles.length > 0) {
      profileId = profiles[0].id
      console.log(yellow(`Using profile: ${profileId}`))
    } else {
      console.error(red('❌ No profile ID provided and no profiles found.'))
      process.exit(1)
    }
  }

  // If --user specified, login and get user JWT client
  let supabaseToUse = useServiceRole ? supabaseAdmin : supabaseAnon
  if (userEmail && !useServiceRole) {
    console.log(cyan(`\n🔐 Logging in as ${userEmail}...`))
    supabaseToUse = await loginAndGetClient(userEmail, 'SeedTest123')
    console.log(green(`✅ Logged in as ${userEmail}`))
  }

  const success = await testUpload(profileId, { useServiceRole, applySanitize }, supabaseToUse)
  process.exit(success ? 0 : 1)
}

main().catch(err => {
  console.error(red('Unexpected error:'), err)
  process.exit(1)
})
