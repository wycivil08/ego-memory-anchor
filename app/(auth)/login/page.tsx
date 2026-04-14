'use client'

import { useActionState } from 'react'
import { signInWithPassword, type AuthState } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const initialState: AuthState = { error: null, success: false }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInWithPassword, initialState)

  return (
    <Card className="shadow-sm border-stone-200 rounded-xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-medium text-stone-800">
          欢迎回来
        </CardTitle>
        <CardDescription className="text-stone-500">
          登录您的忆锚账号
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-stone-700">
              邮箱
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
              disabled={isPending}
              className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-stone-700">
              密码
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="请输入密码"
              required
              autoComplete="current-password"
              disabled={isPending}
              className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-600"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-500" role="alert">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            variant="default"
            size="lg"
            className="w-full"
          >
            {isPending ? '登录中...' : '登录'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          没有账号？{' '}
          <Link
            href="/register"
            className="text-amber-600 hover:text-amber-700 font-medium transition-colors duration-150"
          >
            去注册
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
