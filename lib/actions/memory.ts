'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateMemoryInput, Memory, MemoryFilters } from '@/lib/types'

export type MemoryState = {
  error: string | null
  success: boolean
  memory?: Memory
}

export type DeleteMemoryState = {
  error: string | null
  success: boolean
}

// Validate that the user has access to the profile
async function validateProfileAccess(profileId: string): Promise<{ valid: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { valid: false, error: '请先登录' }
  }

  // Check if user owns the profile or is a family member
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('id', profileId)
    .single()

  if (error || !profile) {
    return { valid: false, error: '记忆空间不存在' }
  }

  // Owner has full access
  if (profile.user_id === user.id) {
    return { valid: true }
  }

  // Check if user is a family member with appropriate role
  const { data: familyMember } = await supabase
    .from('family_members')
    .select('role')
    .eq('profile_id', profileId)
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null)
    .single()

  // If not accepted yet, no access
  if (!familyMember) {
    return { valid: false, error: '您没有权限添加记忆' }
  }

  // Check role - owner and editors can create memories
  if (familyMember.role !== 'admin' && familyMember.role !== 'editor') {
    return { valid: false, error: '您没有权限添加记忆' }
  }

  return { valid: true }
}

export async function createMemory(
  data: CreateMemoryInput
): Promise<MemoryState> {
  // Validate access
  const access = await validateProfileAccess(data.profile_id)
  if (!access.valid) {
    return { error: access.error || '无权限', success: false }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Prepare memory data with defaults
  const memoryData = {
    profile_id: data.profile_id,
    contributor_id: user.id,
    type: data.type,
    file_path: data.file_path || null,
    file_name: data.file_name || null,
    file_size: data.file_size || null,
    mime_type: data.mime_type || null,
    thumbnail_path: data.thumbnail_path || null,
    duration_seconds: data.duration_seconds || null,
    content: data.content || null,
    memory_date: data.memory_date || null,
    memory_date_precision: data.memory_date_precision || 'day',
    tags: data.tags || [],
    annotation: data.annotation || null,
    source_label: data.source_label || '原始记录',
    import_source: data.import_source || 'upload',
    exif_data: data.exif_data || null,
  }

  const { data: memory, error } = await supabase
    .from('memories')
    .insert(memoryData)
    .select()
    .single()

  if (error) {
    console.error('Error creating memory:', error)
    return { error: '保存记忆失败，请稍后重试', success: false }
  }

  revalidatePath(`/profile/${data.profile_id}`)
  return { error: null, success: true, memory }
}

export async function createMemoryBatch(
  dataArray: CreateMemoryInput[]
): Promise<{ memories: Memory[]; errors: string[] }> {
  if (dataArray.length === 0) {
    return { memories: [], errors: [] }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { memories: [], errors: ['请先登录'] }
  }

  const memories: Memory[] = []
  const errors: string[] = []

  // Validate all profiles first
  for (const data of dataArray) {
    const access = await validateProfileAccess(data.profile_id)
    if (!access.valid) {
      errors.push(`文件 ${data.file_path || data.content?.slice(0, 20)}: ${access.error}`)
      continue
    }
  }

  // If any validation errors, return early
  if (errors.length > 0 && memories.length === 0) {
    return { memories: [], errors }
  }

  // Prepare batch insert data
  const insertData = dataArray.map((data) => ({
    profile_id: data.profile_id,
    contributor_id: user.id,
    type: data.type,
    file_path: data.file_path || null,
    file_name: data.file_name || null,
    file_size: data.file_size || null,
    mime_type: data.mime_type || null,
    thumbnail_path: data.thumbnail_path || null,
    duration_seconds: data.duration_seconds || null,
    content: data.content || null,
    memory_date: data.memory_date || null,
    memory_date_precision: data.memory_date_precision || 'day',
    tags: data.tags || [],
    annotation: data.annotation || null,
    source_label: data.source_label || '原始记录',
    import_source: data.import_source || 'upload',
    exif_data: data.exif_data || null,
  }))

  const { data: insertedMemories, error } = await supabase
    .from('memories')
    .insert(insertData)
    .select()

  if (error) {
    console.error('Error creating memories batch:', error)
    return { memories: [], errors: ['批量创建记忆失败'] }
  }

  // Revalidate paths for all affected profiles
  const uniqueProfileIds = [...new Set(dataArray.map((d) => d.profile_id))]
  uniqueProfileIds.forEach((profileId) => {
    revalidatePath(`/profile/${profileId}`)
  })

  return { memories: (insertedMemories || []) as Memory[], errors: [] }
}

export async function getMemoriesByProfile(
  profileId: string,
  filters?: MemoryFilters
): Promise<Memory[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Check if user has access to this profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (!profile) {
    return []
  }

  // Check access: owner or family member
  const isOwner = profile.user_id === user.id

  let hasFamilyAccess = false
  if (!isOwner) {
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('role')
      .eq('profile_id', profileId)
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()

    hasFamilyAccess = !!familyMember
  }

  if (!isOwner && !hasFamilyAccess) {
    return []
  }

  // Build query
  let query = supabase
    .from('memories')
    .select('*')
    .eq('profile_id', profileId)

  // Apply type filter
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  // Apply date range filter
  if (filters?.dateRange) {
    query = query
      .gte('memory_date', filters.dateRange.start)
      .lte('memory_date', filters.dateRange.end)
  }

  // Order by memory date descending, then by created_at
  query = query
    .order('memory_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching memories:', error)
    return []
  }

  // Apply tag filter in memory (JSONB)
  if (filters?.tags && filters.tags.length > 0) {
    return (data || []).filter((memory) => {
      const memoryTags = memory.tags || []
      return filters.tags!.some((tag) => memoryTags.includes(tag))
    }) as Memory[]
  }

  return (data || []) as Memory[]
}

export async function deleteMemory(
  memoryId: string
): Promise<DeleteMemoryState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Get memory with profile info
  const { data: memory, error: fetchError } = await supabase
    .from('memories')
    .select('id, profile_id, profiles!inner(user_id)')
    .eq('id', memoryId)
    .single()

  if (fetchError || !memory) {
    return { error: '记忆不存在', success: false }
  }

  // Check if user is the profile owner
  // Supabase returns joined relations as arrays, so we need to access [0]
  const profiles = memory.profiles as unknown as { user_id: string }[] | null
  const profile = profiles?.[0]
  if (!profile || profile.user_id !== user.id) {
    return { error: '您没有权限删除此记忆', success: false }
  }

  // Delete the memory
  const { error: deleteError } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)

  if (deleteError) {
    console.error('Error deleting memory:', deleteError)
    return { error: '删除记忆失败，请稍后重试', success: false }
  }

  revalidatePath(`/profile/${memory.profile_id}`)
  return { error: null, success: true }
}
