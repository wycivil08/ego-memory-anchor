#!/usr/bin/env node
/**
 * Create a memory space (profile) for ego-memory-anchor
 * Usage: node scripts/create-profile.mjs
 */

import { createClient } from '@supabase/supabase-js'

// Load env
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables')
  process.exit(1)
}

// Create admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Profile data
const profileData = {
  user_id: '810c603a-b365-44a0-bdb3-69c164774495', // seed1@test.com
  name: '老爸',
  relationship: 'father',
  species: 'human',
  birth_date: '1957-07-13',
  death_date: '2015-07-15',
  description: '一壶浊酒'
}

async function createProfile() {
  console.log('Creating profile:', profileData.name)

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert(profileData)
    .select()
    .single()

  if (error) {
    console.error('Error:', error.message)
    return false
  }

  console.log('Success! Profile ID:', data.id)
  return true
}

createProfile().then(success => process.exit(success ? 0 : 1))
