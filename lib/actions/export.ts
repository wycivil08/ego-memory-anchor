'use server'

import { createClient } from '@/lib/supabase/server'

export type ExportState = {
  error: string | null
  success: boolean
  exportUrl?: string
  profileName?: string
}

/**
 * Get all profiles accessible for export by the current user
 */
export async function getProfilesForExport() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get profiles owned by user (only owner can export)
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, species, relationship, created_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching profiles for export:', error)
    return []
  }

  return profiles || []
}

/**
 * Initiate profile data export - validates ownership and triggers export
 */
export async function exportProfileData(
  profileId: string
): Promise<ExportState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Check profile ownership
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, user_id')
    .eq('id', profileId)
    .single()

  if (profileError || !profile) {
    return { error: '记忆空间不存在', success: false }
  }

  if (profile.user_id !== user.id) {
    return { error: '只有档案创建者可以导出数据', success: false }
  }

  // Return success - the actual export happens via the API route
  return {
    error: null,
    success: true,
    profileName: profile.name,
  }
}

/**
 * Get export status for a profile (check if export is ready)
 * This is used by the frontend to poll for export completion
 */
export async function getExportStatus(
  profileId: string
): Promise<{ ready: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ready: false, error: '请先登录' }
  }

  // Verify ownership
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (error || !profile) {
    return { ready: false, error: '记忆空间不存在' }
  }

  if (profile.user_id !== user.id) {
    return { ready: false, error: '无权限访问' }
  }

  // Export is always ready since it streams
  return { ready: true }
}
