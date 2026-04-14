'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type PasswordState = {
  error: string | null
  success: boolean
}

export async function updatePassword(
  _prevState: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate inputs
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: '请填写所有密码字段', success: false }
  }

  if (newPassword.length < 8) {
    return { error: '新密码至少需要 8 位', success: false }
  }

  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return { error: '新密码必须包含字母和数字', success: false }
  }

  if (newPassword !== confirmPassword) {
    return { error: '两次输入的新密码不一致', success: false }
  }

  const supabase = await createClient()

  // Verify current password by signing in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { error: '请先登录', success: false }
  }

  // Re-authenticate user with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { error: '当前密码错误', success: false }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { error: '更新密码失败，请稍后重试', success: false }
  }

  return { error: null, success: true }
}

export type DeleteAccountState = {
  error: string | null
  success: boolean
}

export async function deleteAccount(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const confirmation = formData.get('confirmation') as string

  // Validate confirmation text
  if (confirmation !== '永久删除') {
    return { error: '请输入"永久删除"以确认', success: false }
  }

  const supabase = await createClient()

  // Verify user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Delete all user's data in order due to foreign key constraints

  // 1. Delete reminders
  const { error: remindersError } = await supabase
    .from('reminders')
    .delete()
    .eq('user_id', user.id)

  if (remindersError) {
    console.error('Error deleting reminders:', remindersError)
    return { error: '删除提醒数据失败', success: false }
  }

  // 2. Delete family members (where user is the invited member)
  const { error: familyError } = await supabase
    .from('family_members')
    .delete()
    .eq('user_id', user.id)

  if (familyError) {
    console.error('Error deleting family memberships:', familyError)
    return { error: '删除家庭成员数据失败', success: false }
  }

  // 3. Get profiles owned by user to delete memories and profile avatars
  const { data: userProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, avatar_path')
    .eq('user_id', user.id)

  if (profilesError) {
    console.error('Error fetching user profiles:', profilesError)
    return { error: '获取档案数据失败', success: false }
  }

  // 4. Delete memories for each profile (this also handles storage files via triggers)
  for (const profile of userProfiles || []) {
    // Delete memories
    const { error: memoriesError } = await supabase
      .from('memories')
      .delete()
      .eq('profile_id', profile.id)

    if (memoriesError) {
      console.error('Error deleting memories for profile:', profile.id, memoriesError)
      return { error: '删除记忆数据失败', success: false }
    }

    // Delete profile avatar from storage
    if (profile.avatar_path) {
      await supabase.storage.from('avatars').remove([profile.avatar_path])
    }

    // Delete profile
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profile.id)

    if (profileDeleteError) {
      console.error('Error deleting profile:', profile.id, profileDeleteError)
      return { error: '删除档案失败', success: false }
    }
  }

  // 5. Delete storage buckets files (user's folder)
  await supabase.storage.from('memories').remove([user.id])
  await supabase.storage.from('avatars').remove([user.id])

  // 6. Finally delete the auth user
  const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)

  if (deleteUserError) {
    console.error('Error deleting auth user:', deleteUserError)
    return { error: '删除账户失败，请稍后重试', success: false }
  }

  // Sign out and redirect
  await supabase.auth.signOut()
  redirect('/')
}
