'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUp, type SignUpState } from '@/lib/actions/auth'
import { registerSchema, type RegisterInput } from '@/lib/schemas/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import Link from 'next/link'
import { useActionState } from 'react'

const initialState: SignUpState = {
  error: null,
  success: false,
  emailSent: false,
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      privacyConsent: false,
    },
  })

  const onSubmit = (data: RegisterInput) => {
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('confirmPassword', data.confirmPassword)
    // privacyConsent is not sent to server - handled by Zod validation
    formAction(formData)
  }

  if (state.emailSent) {
    return (
      <Card className="shadow-sm border-stone-200 rounded-xl">
        <CardHeader className="pb-6">
          <h2 className="text-2xl font-medium text-stone-800">
            注册成功
          </h2>
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
              className="text-amber-700 hover:text-amber-800 font-medium transition-colors duration-150"
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
        <h1 className="text-2xl font-semibold text-stone-800">
          创建账号
        </h1>
        <CardDescription className="text-stone-500">
          注册忆锚，守护真实记忆
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
              placeholder="至少 8 位，包含字母和数字"
              autoComplete="new-password"
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

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-stone-700"
            >
              确认密码
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              autoComplete="new-password"
              disabled={isPending}
              {...register('confirmPassword')}
              className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400 focus-visible:ring-amber-600"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {state.error && (
            <p className="text-sm text-red-500" role="alert">
              {state.error}
            </p>
          )}

          {/* Privacy consent checkbox */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacyConsent"
                disabled={isPending}
                {...register('privacyConsent')}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-amber-600 focus-visible:ring-amber-600"
              />
              <label
                htmlFor="privacyConsent"
                className="text-sm text-stone-600 leading-relaxed cursor-pointer"
              >
                我已阅读并同意
                <Link
                  href="/privacy"
                  className="text-amber-700 hover:text-amber-800 underline underline-offset-2 mx-0.5"
                  target="_blank"
                >
                  《隐私政策》
                </Link>
                和
                <Link
                  href="/terms"
                  className="text-amber-700 hover:text-amber-800 underline underline-offset-2 mx-0.5"
                  target="_blank"
                >
                  《用户协议》
                </Link>
              </label>
            </div>
            {errors.privacyConsent && (
              <p className="text-sm text-red-500 pl-7" role="alert">
                {errors.privacyConsent.message}
              </p>
            )}

            {/* Warm reassurance text */}
            <p className="text-xs text-stone-500 pl-7">
              你的数据只属于你。我们不做 AI 合成，不投广告。
            </p>
          </div>

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
            className="text-amber-700 hover:text-amber-800 font-medium transition-colors duration-150"
          >
            去登录
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
