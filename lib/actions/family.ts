'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { FamilyMemberWithUser, FamilyRole, InviteDetails } from '@/lib/types'

export type FamilyState = {
  error: string | null
  success: boolean
}

export type AcceptInviteState = {
  error: string | null
  success: boolean
  profileId?: string
}

// Validate that the current user is the profile owner
async function validateOwnerAccess(
  profileId: string
): Promise<{ valid: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { valid: false, error: '请先登录' }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (error || !profile) {
    return { valid: false, error: '记忆空间不存在' }
  }

  if (profile.user_id !== user.id) {
    return { valid: false, error: '只有档案主人可以管理家人' }
  }

  return { valid: true }
}

// Get all family members for a profile
export async function getFamilyMembers(
  profileId: string
): Promise<FamilyMemberWithUser[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Check if user has access to this profile (owner or family member)
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (!profile) {
    return []
  }

  const isOwner = profile.user_id === user.id

  // Family members can view the member list
  if (!isOwner) {
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('role')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    if (!familyMember) {
      return []
    }
  }

  // Get all family members for this profile
  const { data: members, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('profile_id', profileId)
    .is('deleted_at', null)
    .order('invited_at', { ascending: false })

  if (error) {
    console.error('Error fetching family members:', error)
    return []
  }

  // Batch fetch user data for all members with user_id (fixes N+1 query)
  const userIds = (members || [])
    .map((m) => m.user_id)
    .filter((id): id is string => id !== null)

  let userMap: Record<string, { email?: string; user_metadata?: { name?: string; avatar_url?: string } }> = {}

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, email, user_metadata')
      .in('id', userIds)

    if (users) {
      userMap = Object.fromEntries(users.map((u) => [u.id, u]))
    }
  }

  // Map user data to members
  const membersWithUser: FamilyMemberWithUser[] = (members || []).map((member) => {
    const memberWithUser: FamilyMemberWithUser = { ...member }
    const userData = member.user_id ? userMap[member.user_id] : undefined

    if (userData) {
      memberWithUser.user_email = userData.email
      memberWithUser.user_name = userData.user_metadata?.name
      memberWithUser.user_avatar_url = userData.user_metadata?.avatar_url || undefined
    }

    return memberWithUser
  })

  return membersWithUser as FamilyMemberWithUser[]
}

// Update a family member's role
export async function updateMemberRole(
  profileId: string,
  memberId: string,
  newRole: FamilyRole
): Promise<FamilyState> {
  const access = await validateOwnerAccess(profileId)
  if (!access.valid) {
    return { error: access.error || '无权限', success: false }
  }

  // Validate role
  if (!['admin', 'editor', 'viewer'].includes(newRole)) {
    return { error: '无效的角色', success: false }
  }

  const supabase = await createClient()

  // Check if member exists and belongs to this profile
  const { data: member, error: fetchError } = await supabase
    .from('family_members')
    .select('id, role, invited_by')
    .eq('id', memberId)
    .eq('profile_id', profileId)
    .is('deleted_at', null)
    .single()

  if (fetchError || !member) {
    return { error: '家庭成员不存在', success: false }
  }

  // Cannot change own role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && member.invited_by === user.id && newRole === 'viewer') {
    return { error: '不能将自己的角色降为查看者', success: false }
  }

  const { error: updateError } = await supabase
    .from('family_members')
    .update({ role: newRole })
    .eq('id', memberId)

  if (updateError) {
    console.error('Error updating member role:', updateError)
    return { error: '更新角色失败，请稍后重试', success: false }
  }

  revalidatePath(`/profile/${profileId}/family`)
  return { error: null, success: true }
}

// Remove a family member (soft delete)
export async function removeMember(
  profileId: string,
  memberId: string
): Promise<FamilyState> {
  const access = await validateOwnerAccess(profileId)
  if (!access.valid) {
    return { error: access.error || '无权限', success: false }
  }

  const supabase = await createClient()

  // Check if member exists
  const { data: member, error: fetchError } = await supabase
    .from('family_members')
    .select('id, user_id')
    .eq('id', memberId)
    .eq('profile_id', profileId)
    .is('deleted_at', null)
    .single()

  if (fetchError || !member) {
    return { error: '家庭成员不存在', success: false }
  }

  // Cannot remove self
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && member.user_id === user.id) {
    return { error: '不能移除自己', success: false }
  }

  // Soft delete
  const { error: deleteError } = await supabase
    .from('family_members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', memberId)

  if (deleteError) {
    console.error('Error removing member:', deleteError)
    return { error: '移除成员失败，请稍后重试', success: false }
  }

  revalidatePath(`/profile/${profileId}/family`)
  return { error: null, success: true }
}

// Revoke a pending invite
export async function revokeInvite(
  profileId: string,
  memberId: string
): Promise<FamilyState> {
  const access = await validateOwnerAccess(profileId)
  if (!access.valid) {
    return { error: access.error || '无权限', success: false }
  }

  const supabase = await createClient()

  // Check if invite exists and is still pending (no accepted_at)
  const { data: invite, error: fetchError } = await supabase
    .from('family_members')
    .select('id, accepted_at')
    .eq('id', memberId)
    .eq('profile_id', profileId)
    .is('deleted_at', null)
    .is('accepted_at', null) // Pending invites have no accepted_at
    .single()

  if (fetchError || !invite) {
    return { error: '邀请不存在或已被接受', success: false }
  }

  // Soft delete the invite
  const { error: deleteError } = await supabase
    .from('family_members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', memberId)

  if (deleteError) {
    console.error('Error revoking invite:', deleteError)
    return { error: '撤销邀请失败，请稍后重试', success: false }
  }

  revalidatePath(`/profile/${profileId}/family`)
  return { error: null, success: true }
}

// Generate invite link (used by invite action in profile)
export async function generateInviteLink(
  profileId: string,
  email: string | null,
  role: FamilyRole = 'viewer'
): Promise<{ link: string | null; error: string | null }> {
  const access = await validateOwnerAccess(profileId)
  if (!access.valid) {
    return { link: null, error: access.error || '无权限' }
  }

  // Validate email only if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { link: null, error: '请输入有效的邮箱地址' }
    }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { link: null, error: '请先登录' }
  }

  // Generate a unique invite token
  const inviteToken = crypto.randomUUID()

  // Create the invite record
  const { error: insertError } = await supabase
    .from('family_members')
    .insert({
      profile_id: profileId,
      invited_email: email,
      role: role,
      invite_token: inviteToken,
      invited_by: user.id,
    })

  if (insertError) {
    console.error('Error creating invite:', insertError)
    return { link: null, error: '创建邀请失败，请稍后重试' }
  }

  // Generate the invite link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const link = `${baseUrl}/invite/${inviteToken}`

  revalidatePath(`/profile/${profileId}/family`)
  return { link, error: null }
}

// Get profile owner info
export async function isProfileOwner(
  profileId: string
): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  return profile?.user_id === user.id
}

/**
 * Get invite details by token
 */
export async function getInviteByToken(
  token: string
): Promise<InviteDetails | null> {
  if (!token) {
    return null
  }

  const supabase = await createClient()

  const { data: invite, error } = await supabase
    .from('family_members')
    .select(`
      id,
      profile_id,
      role,
      invited_email,
      invited_at,
      profiles:profiles(name, avatar_path)
    `)
    .eq('invite_token', token)
    .is('accepted_at', null)
    .is('deleted_at', null)
    .single()

  if (error || !invite) {
    return null
  }

  return {
    id: invite.id,
    profile_id: invite.profile_id,
    role: invite.role as FamilyRole,
    invited_email: invite.invited_email,
    invited_at: invite.invited_at,
    profile_name: (invite.profiles as unknown as { name: string } | null)?.name || '未知',
    profile_avatar_path: (invite.profiles as unknown as { avatar_path: string | null } | null)?.avatar_path || null,
  }
}

/**
 * Accept an invite and link it to the current user
 * Updates family_members SET user_id = auth.uid(), accepted_at = now()
 */
export async function acceptInvite(
  token: string
): Promise<AcceptInviteState> {
  if (!token) {
    return { error: '邀请链接无效', success: false }
  }

  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录以接受邀请', success: false }
  }

  // Find the invite by token
  const { data: invite, error: inviteError } = await supabase
    .from('family_members')
    .select('id, profile_id, user_id, accepted_at')
    .eq('invite_token', token)
    .is('deleted_at', null)
    .single()

  if (inviteError || !invite) {
    return { error: '邀请链接不存在或已失效', success: false }
  }

  // Check if already accepted
  if (invite.accepted_at) {
    return { error: '该邀请已被接受', success: false }
  }

  // Check if already linked to another user
  if (invite.user_id && invite.user_id !== user.id) {
    return { error: '该邀请已被其他账号使用', success: false }
  }

  // Check if user is already a member of this profile (excluding this invite)
  const { data: existingMember } = await supabase
    .from('family_members')
    .select('id')
    .eq('profile_id', invite.profile_id)
    .eq('user_id', user.id)
    .not('id', 'eq', invite.id)
    .single()

  if (existingMember) {
    return { error: '您已是该记忆空间的成员', success: false }
  }

  // Accept the invite - update user_id and accepted_at
  const { error: updateError } = await supabase
    .from('family_members')
    .update({
      user_id: user.id,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invite.id)

  if (updateError) {
    console.error('Error accepting invite:', updateError)
    return { error: '接受邀请失败，请稍后重试', success: false }
  }

  revalidatePath('/dashboard')

  return {
    error: null,
    success: true,
    profileId: invite.profile_id,
  }
}
