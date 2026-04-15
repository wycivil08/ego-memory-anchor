import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getInviteByToken, acceptInvite } from '@/lib/actions/family'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { AcceptInviteState } from '@/lib/actions/family'

interface InvitePageProps {
  params: Promise<{ token: string }>
}

// Dynamic OG metadata for invite link preview
export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { token } = await params
  const invite = await getInviteByToken(token)

  if (!invite) {
    return {
      title: '邀请链接已失效 - 忆锚',
    }
  }

  return {
    title: `邀请你共同守护 ${invite.profile_name} 的记忆`,
    description: `我在整理${invite.profile_name}的照片和录音，邀请你一起来补充。点击链接加入忆锚记忆空间。`,
    openGraph: {
      title: `邀请你共同守护 ${invite.profile_name} 的记忆`,
      description: `我在整理${invite.profile_name}的照片和录音，邀请你一起来补充。点击链接加入忆锚记忆空间。`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `邀请你共同守护 ${invite.profile_name} 的记忆`,
      description: `我在整理${invite.profile_name}的照片和录音，邀请你一起来补充。点击链接加入忆锚记忆空间。`,
    },
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params

  // Get invite details
  const invite = await getInviteByToken(token)

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <Card className="w-full max-w-md shadow-sm border-stone-200 rounded-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-medium text-stone-800">
              邀请链接已失效
            </CardTitle>
            <CardDescription className="text-stone-500">
              此邀请链接不存在或已被使用
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-stone-600 mb-6">
              请联系记忆空间的主人获取新的邀请链接
            </p>
            <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
              <Link href="/dashboard">返回主页</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user is logged in
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle form submission for accepting invite
  async function handleAcceptInvite(): Promise<AcceptInviteState> {
    'use server'
    return acceptInvite(token)
  }

  // Construct avatar URL if avatar_path exists
  const avatarUrl = invite.profile_avatar_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${invite.profile_avatar_path}`
    : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <Card className="w-full max-w-md shadow-sm border-stone-200 rounded-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-medium text-stone-800">
            加入记忆空间
          </CardTitle>
          <CardDescription className="text-stone-500">
            您收到了来自忆锚的记忆空间邀请
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Memory space info */}
          <div className="rounded-lg bg-stone-100 p-4 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={invite.profile_name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-2xl font-medium text-amber-700">
                  {invite.profile_name.charAt(0)}
                </span>
              )}
            </div>
            <h3 className="font-medium text-stone-800 text-lg">
              {invite.profile_name}
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              邀请您成为「{invite.profile_name}」记忆空间的成员
            </p>
          </div>

          {user ? (
            // Logged in - show join button
            <div className="space-y-4">
              <p className="text-sm text-stone-600 text-center">
                点击下方按钮加入此记忆空间
              </p>
              <form
                action={async () => {
                  'use server'
                  const result = await acceptInvite(token)
                  if (result.success && result.profileId) {
                    redirect(`/profile/${result.profileId}`)
                  }
                }}
              >
                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  加入此记忆空间
                </Button>
              </form>
            </div>
          ) : (
            // Not logged in - show login/register options
            <div className="space-y-4">
              <p className="text-sm text-stone-600 text-center">
                请先登录或注册账号以接受邀请
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  <Link href={`/login?redirect=/invite/${token}`}>
                    登录
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  <Link href={`/register?redirect=/invite/${token}`}>
                    注册
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-stone-400 text-center">
            接受邀请即表示您同意加入此记忆空间，与其他成员共同纪念
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
