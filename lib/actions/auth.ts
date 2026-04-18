'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthState = {
  error: string | null
  success: boolean
}

export async function signInWithPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '请填写邮箱和密码', success: false }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: '邮箱或密码错误，请重试', success: false }
  }

  revalidatePath('/', 'layout')
  return { error: null, success: true }
}

export type SignUpState = {
  error: string | null
  success: boolean
  emailSent: boolean
}

export async function signUp(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!email || !password || !confirmPassword) {
    return { error: '请填写所有字段', success: false, emailSent: false }
  }

  if (password.length < 8) {
    return { error: '密码至少需要 8 位', success: false, emailSent: false }
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      error: '密码必须包含字母和数字',
      success: false,
      emailSent: false,
    }
  }

  if (password !== confirmPassword) {
    return { error: '两次输入的密码不一致', success: false, emailSent: false }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: '注册失败，请稍后重试', success: false, emailSent: false }
  }

  revalidatePath('/', 'layout')
  return { error: null, success: true, emailSent: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
