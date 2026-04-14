'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  CreateReminderInput,
  UpdateReminderInput,
  Recurrence,
  Reminder,
} from '@/lib/types'

export type ReminderState = {
  error: string | null
  success: boolean
}

// Validate date format (YYYY-MM-DD)
function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

export async function createReminder(
  _prevState: ReminderState,
  formData: FormData
): Promise<ReminderState> {
  const title = formData.get('title') as string
  const reminderDate = formData.get('reminder_date') as string
  const recurrence = formData.get('recurrence') as Recurrence
  const profileId = formData.get('profile_id') as string

  // Validate required fields
  if (!title || title.trim().length === 0) {
    return { error: '请输入提醒标题', success: false }
  }

  if (title.trim().length > 200) {
    return { error: '标题不能超过200个字符', success: false }
  }

  if (!reminderDate) {
    return { error: '请选择提醒日期', success: false }
  }

  if (!isValidDate(reminderDate)) {
    return { error: '日期格式不正确', success: false }
  }

  if (!profileId) {
    return { error: '缺少档案信息', success: false }
  }

  if (!['once', 'yearly', 'lunar_yearly'].includes(recurrence)) {
    return { error: '重复方式不正确', success: false }
  }

  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Verify profile ownership
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (profileError || !profile) {
    return { error: '记忆空间不存在', success: false }
  }

  if (profile.user_id !== user.id) {
    return { error: '您没有权限在此记忆空间添加提醒', success: false }
  }

  // Insert reminder
  const { error } = await supabase.from('reminders').insert({
    profile_id: profileId,
    user_id: user.id,
    title: title.trim(),
    reminder_date: reminderDate,
    recurrence,
    enabled: true,
  })

  if (error) {
    console.error('Error creating reminder:', error)
    return { error: '创建提醒失败，请稍后重试', success: false }
  }

  revalidatePath(`/profile/${profileId}/reminders`)
  return { error: null, success: true }
}

export async function getRemindersByProfile(
  profileId: string
): Promise<Reminder[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .order('reminder_date', { ascending: true })

  if (error) {
    console.error('Error fetching reminders:', error)
    return []
  }

  return (reminders || []) as Reminder[]
}

export async function updateReminder(
  reminderId: string,
  _prevState: ReminderState,
  formData: FormData
): Promise<ReminderState> {
  const title = formData.get('title') as string
  const reminderDate = formData.get('reminder_date') as string
  const recurrence = formData.get('recurrence') as Recurrence

  // Validate required fields
  if (!title || title.trim().length === 0) {
    return { error: '请输入提醒标题', success: false }
  }

  if (title.trim().length > 200) {
    return { error: '标题不能超过200个字符', success: false }
  }

  if (!reminderDate) {
    return { error: '请选择提醒日期', success: false }
  }

  if (!isValidDate(reminderDate)) {
    return { error: '日期格式不正确', success: false }
  }

  if (!['once', 'yearly', 'lunar_yearly'].includes(recurrence)) {
    return { error: '重复方式不正确', success: false }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Check if reminder exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('reminders')
    .select('profile_id, user_id')
    .eq('id', reminderId)
    .single()

  if (fetchError || !existing) {
    return { error: '提醒不存在', success: false }
  }

  if (existing.user_id !== user.id) {
    return { error: '您没有权限修改此提醒', success: false }
  }

  const { error } = await supabase
    .from('reminders')
    .update({
      title: title.trim(),
      reminder_date: reminderDate,
      recurrence,
    })
    .eq('id', reminderId)

  if (error) {
    console.error('Error updating reminder:', error)
    return { error: '更新提醒失败，请稍后重试', success: false }
  }

  revalidatePath(`/profile/${existing.profile_id}/reminders`)
  return { error: null, success: true }
}

export async function deleteReminder(
  reminderId: string
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Check if reminder exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('reminders')
    .select('profile_id, user_id')
    .eq('id', reminderId)
    .single()

  if (fetchError || !existing) {
    return { error: '提醒不存在', success: false }
  }

  if (existing.user_id !== user.id) {
    return { error: '您没有权限删除此提醒', success: false }
  }

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId)

  if (error) {
    console.error('Error deleting reminder:', error)
    return { error: '删除提醒失败，请稍后重试', success: false }
  }

  revalidatePath(`/profile/${existing.profile_id}/reminders`)
  return { error: null, success: true }
}

export async function toggleReminder(
  reminderId: string
): Promise<{ error: string | null; success: boolean; enabled?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Check if reminder exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('reminders')
    .select('profile_id, user_id, enabled')
    .eq('id', reminderId)
    .single()

  if (fetchError || !existing) {
    return { error: '提醒不存在', success: false }
  }

  if (existing.user_id !== user.id) {
    return { error: '您没有权限修改此提醒', success: false }
  }

  const newEnabled = !existing.enabled

  const { error } = await supabase
    .from('reminders')
    .update({ enabled: newEnabled })
    .eq('id', reminderId)

  if (error) {
    console.error('Error toggling reminder:', error)
    return { error: '更新提醒失败，请稍后重试', success: false }
  }

  revalidatePath(`/profile/${existing.profile_id}/reminders`)
  return { error: null, success: true, enabled: newEnabled }
}
