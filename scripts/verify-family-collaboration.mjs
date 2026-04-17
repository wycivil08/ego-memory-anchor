#!/usr/bin/env node
/**
 * Verify Family Collaborative Editing
 *
 * Backend verification of family collaboration flow:
 * 1. Create owner user + profile
 * 2. Generate invite link
 * 3. Create invited user + accept invite
 * 4. Verify invited user can view profile (RLS check)
 * 5. Verify invited user can add memory (if editor role)
 *
 * Usage:
 *   node scripts/verify-family-collaboration.mjs
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

const TEST_PASSWORD = 'TestPassword123!'

async function cleanupTestUser(email) {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users?.find(u => u.email === email)

  if (user) {
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

    await supabaseAdmin.storage.from('memories').remove([user.id])
    await supabaseAdmin.storage.from('avatars').remove([user.id])
    await supabaseAdmin.auth.admin.deleteUser(user.id)
  }
}

async function cleanupProfile(profileId) {
  const { data: memories } = await supabaseAdmin.from('memories').select('id').eq('profile_id', profileId)
  for (const m of memories || []) {
    await supabaseAdmin.from('memories').delete().eq('id', m.id)
  }
  await supabaseAdmin.from('family_members').delete().eq('profile_id', profileId)
  await supabaseAdmin.from('profiles').delete().eq('id', profileId)
}

async function main() {
  const ownerEmail = `family_owner_test_${Date.now()}@test.com`
  const memberEmail = `family_member_test_${Date.now()}@test.com`
  const ownerName = 'Family Owner Test'
  const memberName = 'Family Member Test'
  const profileName = 'Family Collaboration Test Profile'

  console.log('\n' + cyan('═══════════════════════════════════════════════════════'))
  console.log(cyan('  🧪 Family Collaboration Verification Script'))
  console.log(cyan('═══════════════════════════════════════════════════════\n'))

  let ownerId, memberId, profileId, inviteToken

  try {
    // Step 1: Create owner user
    console.log(yellow('Step 1: Creating owner user...'))
    const { data: ownerAuth, error: ownerError } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password: TEST_PASSWORD,
      user_metadata: { name: ownerName },
      email_confirm: true
    })
    if (ownerError) throw new Error('Create owner: ' + ownerError.message)
    ownerId = ownerAuth.user.id
    console.log(green(`✅ Owner created: ${ownerId}`))

    // Step 2: Create profile for owner
    console.log('\n' + yellow('Step 2: Creating profile...'))
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: ownerId,
        name: profileName,
        species: 'human',
        birth_date: '1950-01-01',
        death_date: '2020-01-01',
        relationship: '测试关系'
      })
      .select()
      .single()
    if (profileError) throw new Error('Create profile: ' + profileError.message)
    profileId = profileData.id
    console.log(green(`✅ Profile created: ${profileId}`))

    // Step 3: Generate invite link
    console.log('\n' + yellow('Step 3: Generating invite link...'))
    inviteToken = crypto.randomUUID()
    const { error: inviteError } = await supabaseAdmin
      .from('family_members')
      .insert({
        profile_id: profileId,
        invited_email: memberEmail,
        role: 'editor',
        invite_token: inviteToken,
        invited_by: ownerId
      })
    if (inviteError) throw new Error('Create invite: ' + inviteError.message)
    console.log(green(`✅ Invite created: ${inviteToken}`))

    // Step 4: Create invited user
    console.log('\n' + yellow('Step 4: Creating invited user...'))
    const { data: memberAuth, error: memberError } = await supabaseAdmin.auth.admin.createUser({
      email: memberEmail,
      password: TEST_PASSWORD,
      user_metadata: { name: memberName },
      email_confirm: true
    })
    if (memberError) throw new Error('Create member: ' + memberError.message)
    memberId = memberAuth.user.id
    console.log(green(`✅ Invited user created: ${memberId}`))

    // Step 5: Accept invite (link user to family_members record)
    console.log('\n' + yellow('Step 5: Accepting invite...'))
    const { error: acceptError } = await supabaseAdmin
      .from('family_members')
      .update({
        user_id: memberId,
        accepted_at: new Date().toISOString()
      })
      .eq('invite_token', inviteToken)
    if (acceptError) throw new Error('Accept invite: ' + acceptError.message)
    console.log(green('✅ Invite accepted'))

    // Step 6: Verify family member record
    console.log('\n' + yellow('Step 6: Verifying family member record...'))
    const { data: familyMember, error: famError } = await supabaseAdmin
      .from('family_members')
      .select('id, user_id, role, invited_email, accepted_at')
      .eq('profile_id', profileId)
      .eq('user_id', memberId)
      .single()
    if (famError || !familyMember) throw new Error('Family member not found')
    console.log(green(`✅ Family member verified:`))
    console.log(`  - Role: ${familyMember.role}`)
    console.log(`  - Email: ${familyMember.invited_email}`)
    console.log(`  - Accepted: ${familyMember.accepted_at ? 'Yes' : 'No'}`)

    // Step 7: Create a memory as owner
    console.log('\n' + yellow('Step 7: Creating memory as owner...'))
    const { data: memoryData, error: memoryError } = await supabaseAdmin
      .from('memories')
      .insert({
        profile_id: profileId,
        contributor_id: ownerId,
        type: 'text',
        content: '这是由档案主人创建的记忆',
        memory_date: '2020-06-15',
        file_name: 'owner_memory.txt'
      })
      .select()
      .single()
    if (memoryError) throw new Error('Create memory: ' + memoryError.message)
    const memoryId = memoryData.id
    console.log(green(`✅ Memory created: ${memoryId}`))

    // Step 8: Create client with member's JWT to test RLS
    console.log('\n' + yellow('Step 8: Testing RLS - member reads profile...'))
    const memberClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    // Sign in as member
    const { error: signInError } = await memberClient.auth.signInWithPassword({
      email: memberEmail,
      password: TEST_PASSWORD
    })
    if (signInError) throw new Error('Member sign in: ' + signInError.message)

    // Try to read profile (should succeed due to family_members record)
    const { data: profileAsMember, error: profileReadError } = await memberClient
      .from('profiles')
      .select('id, name')
      .eq('id', profileId)
      .single()
    if (profileReadError) {
      console.log(red(`❌ RLS BLOCKED: Member cannot read profile`))
      console.log(red(`   Error: ${profileReadError.message}`))
      throw new Error('RLS blocking family member from reading profile')
    }
    console.log(green(`✅ Member can read profile: ${profileAsMember.name}`))

    // Step 9: Try to read memories as member
    console.log('\n' + yellow('Step 9: Testing RLS - member reads memories...'))
    const { data: memoriesAsMember, error: memoriesReadError } = await memberClient
      .from('memories')
      .select('id, content')
      .eq('profile_id', profileId)
    if (memoriesReadError) {
      console.log(red(`❌ RLS BLOCKED: Member cannot read memories`))
      throw new Error('RLS blocking family member from reading memories')
    }
    console.log(green(`✅ Member can read ${memoriesAsMember?.length || 0} memories`))

    // Step 10: Try to create memory as member (editor role)
    console.log('\n' + yellow('Step 10: Testing RLS - member creates memory (editor role)...'))
    const { data: memberMemory, error: memberMemoryError } = await memberClient
      .from('memories')
      .insert({
        profile_id: profileId,
        contributor_id: memberId,
        type: 'text',
        content: '这是由家庭成员创建的记忆',
        memory_date: '2020-06-16',
        file_name: 'member_memory.txt'
      })
      .select()
      .single()
    if (memberMemoryError) {
      console.log(red(`❌ RLS BLOCKED: Editor cannot create memory`))
      console.log(red(`   Error: ${memberMemoryError.message}`))
      throw new Error('RLS blocking editor from creating memory')
    }
    console.log(green(`✅ Member created memory: ${memberMemory.id}`))

    // Step 11: Get member's user_id from family_members for verification
    console.log('\n' + yellow('Step 11: Final verification...'))
    const { data: finalCheck } = await supabaseAdmin
      .from('family_members')
      .select(`
        id,
        role,
        user_id,
        accepted_at,
        profiles:profiles(name)
      `)
      .eq('profile_id', profileId)
      .eq('user_id', memberId)
      .single()

    console.log(green('\n✅ FAMILY COLLABORATION VERIFICATION: PASSED'))
    console.log(cyan('═══════════════════════════════════════════════════════'))
    console.log(cyan('\n📊 Summary:'))
    console.log(`  Owner: ${ownerEmail}`)
    console.log(`  Member: ${memberEmail}`)
    console.log(`  Profile: ${profileName}`)
    console.log(`  Member Role: ${finalCheck?.role}`)
    console.log(`  Memories Created: 2 (owner + member)`)
    console.log(cyan('═══════════════════════════════════════════════════════\n'))

    // Cleanup
    console.log(yellow('Cleaning up test data...'))
    await cleanupProfile(profileId)
    await cleanupTestUser(ownerEmail)
    await cleanupTestUser(memberEmail)
    console.log(green('✅ Cleanup complete'))

    process.exit(0)

  } catch (error) {
    console.error(red('\n❌ Error:'), error.message)
    // Cleanup on error
    if (profileId) await cleanupProfile(profileId)
    await cleanupTestUser(ownerEmail)
    await cleanupTestUser(memberEmail)
    process.exit(1)
  }
}

main()
