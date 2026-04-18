#!/usr/bin/env node
/**
 * Upload files to a memory space (profile)
 *
 * Usage:
 *   node scripts/upload-memory.mjs <profileId> <filePaths...>
 *   node scripts/upload-memory.mjs <profileId> ./my-photos/
 *   node scripts/upload-memory.mjs <profileId> ./photo1.jpg ./photo2.jpg
 *
 * Examples:
 *   node scripts/upload-memory.mjs 68286462-a302-46d8-893c-cc71b5191f81 ./my-photos/
 *   node scripts/upload-memory.mjs 68286462-a302-46d8-893c-cc71b5191f81 ./photo.jpg "VACATION[1].jpg"
 *
 * Notes:
 *   - Only the file name is stored (no path in storage)
 *   - Original filename preserved in database
 *   - File is renamed to UUID in storage (safe, no special char issues)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

// Load .env.local
const envPath = join(__dirname, '..', '.env.local')
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (t && !t.startsWith('#')) {
      const ei = t.indexOf('=')
      if (ei > 0) {
        const k = t.slice(0, ei).trim()
        const v = t.slice(ei + 1).trim()
        if (!process.env[k]) process.env[k] = v
      }
    }
  }
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!URL || !ANON_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

// ============================================================
// Utils
// ============================================================

function green(t) { return `\x1b[32m${t}\x1b[0m` }
function red(t) { return `\x1b[31m${t}\x1b[0m` }
function yellow(t) { return `\x1b[33m${t}\x1b[0m` }
function cyan(t) { return `\x1b[36m${t}\x1b[0m` }

/**
 * Get all files from a path (recursive for directories)
 */
function getFiles(path) {
  const files = []
  const entries = readdirSync(path)
  for (const entry of entries) {
    const full = join(path, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      files.push(...getFiles(full))
    } else if (stat.isFile()) {
      files.push(full)
    }
  }
  return files
}

// ============================================================
// Uploader
// ============================================================

async function uploadFiles(profileId, filePaths, options = {}) {
  const { email = 'seed1@test.com', password = 'SeedTest123', memoryType = 'photo' } = options

  const supabase = createClient(URL, ANON_KEY)

  // Login
  console.log(cyan(`Logging in as ${email}...`))
  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
  if (loginError) {
    console.error(red(`Login failed: ${loginError.message}`))
    return false
  }
  console.log(green('Logged in'))

  // Get logged-in user ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error(red('No user found after login'))
    return false
  }

  // Resolve file paths
  const files = []
  for (const p of filePaths) {
    if (statSync(p).isDirectory()) {
      files.push(...getFiles(p))
    } else {
      files.push(p)
    }
  }

  console.log(cyan(`\nUploading ${files.length} file(s) to profile ${profileId}...\n`))

  let success = 0
  let failed = 0

  for (const filePath of files) {
    const originalName = basename(filePath)
    const memoryId = crypto.randomUUID()
    const ext = extname(originalName) || '.jpg'
    const storageName = `${memoryId}${ext}`
    const storagePath = `${profileId}/${memoryId}/${storageName}`

    process.stdout.write(`  ${originalName}... `)

    try {
      const content = readFileSync(filePath)
      const mimeType = getMimeType(ext)

      // Upload to storage
      const { error: uploadError } = await supabase
        .storage.from('memories')
        .upload(storagePath, content, { contentType: mimeType })

      if (uploadError) {
        console.log(red(`❌ ${uploadError.message}`))
        failed++
        continue
      }

      // Create memory record
      const { error: memError } = await supabase
        .from('memories')
        .insert({
          profile_id: profileId,
          contributor_id: user.id,
          type: memoryType,
          file_path: storagePath,
          file_name: originalName,
          file_size: statSync(filePath).size,
          mime_type: mimeType,
          import_source: 'upload'
        })

      if (memError) {
        // Rollback: delete uploaded file
        await supabase.storage.from('memories').remove([storagePath])
        console.log(red(`❌ DB error: ${memError.message}`))
        failed++
      } else {
        console.log(green(`✅`))
        success++
      }
    } catch (err) {
      console.log(red(`❌ ${err.message}`))
      failed++
    }
  }

  console.log(`\n${green(success)} uploaded, ${failed > 0 ? red(failed) : yellow(0)} failed`)
  return failed === 0
}

function getMimeType(ext) {
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.heic': 'image/heic', '.webp': 'image/webp',
    '.mp4': 'video/mp4', '.mov': 'video/quicktime',
    '.m4a': 'audio/m4a', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
    '.pdf': 'application/pdf', '.txt': 'text/plain'
  }
  return map[ext.toLowerCase()] || 'application/octet-stream'
}

// ============================================================
// Main
// ============================================================

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h') || args.length < 2) {
  console.log(`
${cyan('Usage:')} node scripts/upload-memory.mjs <profileId> <files...>

${cyan('Examples:')}
  node scripts/upload-memory.mjs 68286462-a302-46d8-893c-cc71b5191f81 ./photo.jpg
  node scripts/upload-memory.mjs 68286462-a302-46d8-893c-cc71b5191f81 ./my-folder/
  node scripts/upload-memory.mjs 68286462-a302-46d8-893c-cc71b5191f81 ./a.jpg ./b.jpg ./c.jpg
`)
  process.exit(1)
}

const profileId = args[0]
const filePaths = args.slice(1)

uploadFiles(profileId, filePaths).then(ok => process.exit(ok ? 0 : 1))
