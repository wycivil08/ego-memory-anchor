'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithPassword, type AuthState } from '@/lib/actions/auth'
import { loginSchema, type LoginInput } from '@/lib/schemas/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { useActionState } from 'react'

const initialState: AuthState = { error: null, success: false }

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(signInWithPassword, initialState)

  // Handle successful login - navigate on client side
  useEffect(() => {
    if (state.success) {
      router.push('/dashboard')
    }
  }, [state.success, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginInput) => {
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formAction(formData)
  }

  return (
    <Card className="shadow-sm border-stone-200 rounded-xl">
      <CardHeader className="space-y-1 pb-6">
        <h1 className="text-2xl font-semibold text-stone-800">
          欢迎回来
        </h1>
        <CardDescription className="text-stone-500">
          登录您的忆锚账号
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-stone-700">
              邮箱
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              disabled={isPending}
              {...register('email')}
              className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-600"
            />
            {errors.email && (
              <p className="text-sm text-red-500" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-stone-700">
              密码
            </label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              autoComplete="current-password"
              disabled={isPending}
              {...register('password')}
              className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-600"
            />
            {errors.password && (
              <p className="text-sm text-red-500" role="alert">
                {errors.password.message}
              </p>
            )}
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
            className="text-amber-700 hover:text-amber-800 font-medium transition-colors duration-150"
          >
            去注册
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
