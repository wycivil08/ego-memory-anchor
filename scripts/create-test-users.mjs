#!/usr/bin/env node
/**
 * Create test users for ego-memory-anchor MVP testing
 * Usage: node scripts/create-test-users.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'

// Load env
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client (service_role key bypasses RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  { email: 'seed1@test.com', password: 'SeedTest123', metadata: { name: 'Seed User 1' } },
  { email: 'seed2@test.com', password: 'SeedTest123', metadata: { name: 'Seed User 2' } }
]

async function createUser(email, password, userMetadata) {
  console.log(`Creating user: ${email}`)

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Skip email confirmation for testing
    user_metadata: userMetadata
  })

  if (error) {
    console.error(`  Error: ${error.message}`)
    return false
  }

  console.log(`  Success! User ID: ${data.user.id}`)
  return true
}

async function main() {
  console.log('Creating test users for ego-memory-anchor...\n')

  for (const user of testUsers) {
    await createUser(user.email, user.password, user.metadata)
  }

  console.log('\nDone!')
}

main().catch(console.error)
