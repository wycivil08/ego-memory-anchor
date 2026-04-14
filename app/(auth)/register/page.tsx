'use client'

import { useActionState } from 'react'
import { signUp, type SignUpState } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

const initialState: SignUpState = {
  error: null,
  success: false,
  emailSent: false,
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState)

  if (state.emailSent) {
    return (
      <Card className="shadow-sm border-stone-200 rounded-xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-medium text-stone-800">
            注册成功
          </CardTitle>
          <CardDescription className="text-stone-500">
            验证邮件已发送至您的邮箱
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-600">
            请查收邮箱中的验证链接，完成账号激活后即可登录忆锚。
          </p>
          <p className="mt-4 text-center text-sm text-stone-500">
            已有账号？{' '}
            <Link
              href="/login"
              className="text-amber-600 hover:text-amber-700 font-medium transition-colors duration-150"
            >
              去登录
            </Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-stone-200 rounded-xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-medium text-stone-800">
          创建账号
        </CardTitle>
        <CardDescription className="text-stone-500">
          注册忆锚，守护真实记忆
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
              placeholder="至少 8 位，包含字母和数字"
              required
              autoComplete="new-password"
              disabled={isPending}
              className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-600"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-stone-700"
            >
              确认密码
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              required
              autoComplete="new-password"
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
            {isPending ? '注册中...' : '注册'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          已有账号？{' '}
          <Link
            href="/login"
            className="text-amber-600 hover:text-amber-700 font-medium transition-colors duration-150"
          >
            去登录
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
