'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type {
  CreateProfileInput,
  UpdateProfileInput,
  ProfileWithMemoryCount,
} from '@/lib/types'

export type ProfileState = {
  error: string | null
  success: boolean
  profileId?: string
}

// Validate date format (YYYY-MM-DD)
function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return true // null/undefined is valid (optional)
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

// Validate death date is after birth date
function isValidDateRange(
  birthDate: string | null | undefined,
  deathDate: string | null | undefined
): boolean {
  if (!birthDate || !deathDate) return true
  return new Date(birthDate) <= new Date(deathDate)
}

export async function createProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const name = formData.get('name') as string
  const relationship = formData.get('relationship') as string
  const birthDate = formData.get('birth_date') as string | null
  const deathDate = formData.get('death_date') as string | null
  const description = formData.get('description') as string | null
  const species = formData.get('species') as string || 'human'

  // Validate required fields
  if (!name || name.trim().length === 0) {
    return { error: '请输入姓名', success: false }
  }

  if (name.trim().length > 100) {
    return { error: '姓名不能超过100个字符', success: false }
  }

  if (!relationship) {
    return { error: '请选择与 TA 的关系', success: false }
  }

  // Validate dates
  if (!isValidDate(birthDate)) {
    return { error: '出生日期格式不正确', success: false }
  }

  if (!isValidDate(deathDate)) {
    return { error: '去世日期格式不正确', success: false }
  }

  if (!isValidDateRange(birthDate, deathDate)) {
    return { error: '去世日期不能早于出生日期', success: false }
  }

  if (description && description.length > 500) {
    return { error: '描述不能超过500个字符', success: false }
  }

  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Prepare profile data
  const profileData: CreateProfileInput = {
    name: name.trim(),
    relationship: relationship as CreateProfileInput['relationship'],
    species: species as CreateProfileInput['species'],
    birth_date: birthDate || null,
    death_date: deathDate || null,
    description: description?.trim() || null,
  }

  // Insert profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select('id')
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    return { error: '创建记忆空间失败，请稍后重试', success: false }
  }

  revalidatePath('/dashboard')
  redirect(`/profile/${profile.id}`)
}

export async function updateProfile(
  profileId: string,
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const name = formData.get('name') as string
  const relationship = formData.get('relationship') as string
  const birthDate = formData.get('birth_date') as string | null
  const deathDate = formData.get('death_date') as string | null
  const description = formData.get('description') as string | null
  const species = formData.get('species') as string || 'human'

  // Validate required fields
  if (!name || name.trim().length === 0) {
    return { error: '请输入姓名', success: false }
  }

  if (name.trim().length > 100) {
    return { error: '姓名不能超过100个字符', success: false }
  }

  if (!relationship) {
    return { error: '请选择与 TA 的关系', success: false }
  }

  // Validate dates
  if (!isValidDate(birthDate)) {
    return { error: '出生日期格式不正确', success: false }
  }

  if (!isValidDate(deathDate)) {
    return { error: '去世日期格式不正确', success: false }
  }

  if (!isValidDateRange(birthDate, deathDate)) {
    return { error: '去世日期不能早于出生日期', success: false }
  }

  if (description && description.length > 500) {
    return { error: '描述不能超过500个字符', success: false }
  }

  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user owns this profile
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (fetchError || !existingProfile) {
    return { error: '记忆空间不存在', success: false }
  }

  if (existingProfile.user_id !== user.id) {
    return { error: '您没有权限编辑此记忆空间', success: false }
  }

  // Update profile
  const updateData: UpdateProfileInput = {
    name: name.trim(),
    relationship: relationship as UpdateProfileInput['relationship'],
    species: species as UpdateProfileInput['species'],
    birth_date: birthDate || null,
    death_date: deathDate || null,
    description: description?.trim() || null,
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profileId)

  if (error) {
    console.error('Error updating profile:', error)
    return { error: '更新记忆空间失败，请稍后重试', success: false }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/profile/${profileId}`)
  return { error: null, success: true, profileId }
}

export async function deleteProfile(
  profileId: string
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Check if user owns this profile
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (fetchError || !existingProfile) {
    return { error: '记忆空间不存在', success: false }
  }

  if (existingProfile.user_id !== user.id) {
    return { error: '您没有权限删除此记忆空间', success: false }
  }

  // Soft delete - set deleted_at
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', profileId)

  if (error) {
    console.error('Error deleting profile:', error)
    return { error: '删除记忆空间失败，请稍后重试', success: false }
  }

  revalidatePath('/dashboard')
  return { error: null, success: true }
}

export async function getProfiles(): Promise<ProfileWithMemoryCount[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get profiles owned by user or where user is a family member
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      memories:memories(count)
    `)
    .is('deleted_at', null)
    .or(`user_id.eq.${user.id},family_members.user_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  // Transform to include memory_count
  return (profiles || []).map((profile) => ({
    ...profile,
    memory_count: Array.isArray(profile.memories)
      ? profile.memories[0]?.count || 0
      : 0,
  })) as ProfileWithMemoryCount[]
}

export async function getProfileById(
  profileId: string
): Promise<ProfileWithMemoryCount | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      memories:memories(count)
    `)
    .eq('id', profileId)
    .is('deleted_at', null)
    .single()

  if (error || !profile) {
    return null
  }

  return {
    ...profile,
    memory_count: Array.isArray(profile.memories)
      ? profile.memories[0]?.count || 0
      : 0,
  } as ProfileWithMemoryCount
}
