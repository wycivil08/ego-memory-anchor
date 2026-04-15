'use server'

import { createClient } from '@/lib/supabase/server'

export type ConsentState = {
  error: string | null
  success: boolean
}

export async function recordPrivacyConsent(
  consentType: 'terms_accept' | 'sensitive_data_upload'
): Promise<ConsentState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录', success: false }
  }

  // Record consent without IP address for MVP (can be added later with proper middleware)
  const { error } = await supabase
    .from('privacy_consents')
    .insert({
      user_id: user.id,
      consent_type: consentType,
    })

  if (error) {
    console.error('Error recording consent:', error)
    return { error: '记录同意失败', success: false }
  }

  return { error: null, success: true }
}

export async function hasUserConsented(
  consentType: 'terms_accept' | 'sensitive_data_upload'
): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('privacy_consents')
    .select('id')
    .eq('user_id', user.id)
    .eq('consent_type', consentType)
    .single()

  return !!data
}
