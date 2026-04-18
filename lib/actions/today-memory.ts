'use server'

import { createClient } from '@/lib/supabase/server'
import type { Memory } from '@/lib/types'

export async function getTodayMemories(profileId: string): Promise<Memory[]> {
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

  // Get today's month and day
  const today = new Date()
  const month = today.getMonth() + 1 // 1-12
  const day = today.getDate() // 1-31

  // Query memories where EXTRACT(MONTH FROM memory_date) = month AND EXTRACT(DAY FROM memory_date) = day
  // Using a more compatible approach with date functions
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('profile_id', profileId)
    .not('memory_date', 'is', null)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  // Filter to memories that match today's month and day
  const todayMemories = (data as Memory[]).filter((memory) => {
    if (!memory.memory_date) return false
    const memoryDate = new Date(memory.memory_date)
    return (
      memoryDate.getMonth() + 1 === month &&
      memoryDate.getDate() === day
    )
  })

  return todayMemories
}
