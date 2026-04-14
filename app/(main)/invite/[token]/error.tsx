'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface InviteErrorProps {
  error: Error & {
    digest?: string
    message?: string
  }
  reset: () => void
}

export default function InviteError({ error, reset }: InviteErrorProps) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Invite page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <Card className="w-full max-w-md shadow-sm border-stone-200 rounded-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-medium text-stone-800">
            出错了
          </CardTitle>
          <CardDescription className="text-stone-500">
            {error?.message || '处理邀请时出现错误'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-stone-600 text-center">
            请稍后重试，或返回主页重新开始
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              重试
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              <Link href="/dashboard">返回主页</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
