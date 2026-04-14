'use client'

import { useActionState } from 'react'
import { useEffect } from 'react'
import { updatePassword, deleteAccount } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PasswordState, DeleteAccountState } from '@/lib/actions/settings'
import type { Profile } from '@/lib/types'

interface SettingsClientProps {
  profiles: Pick<Profile, 'id' | 'name' | 'species'>[]
}

export function SettingsClient({ profiles }: SettingsClientProps) {
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState<PasswordState, FormData>(
    updatePassword,
    { error: null, success: false }
  )

  const [deleteState, deleteFormAction, isDeletePending] = useActionState<DeleteAccountState, FormData>(
    deleteAccount,
    { error: null, success: false }
  )

  // Show success message for password update
  useEffect(() => {
    if (passwordState.success) {
      alert('密码更新成功！')
    }
  }, [passwordState.success])

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Password Update Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">修改密码</CardTitle>
          <CardDescription>更新您的账户密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordFormAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="请输入当前密码"
                required
                disabled={isPasswordPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="请输入新密码（至少8位，包含字母和数字）"
                required
                disabled={isPasswordPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                required
                disabled={isPasswordPending}
              />
            </div>

            {passwordState.error && (
              <p className="text-sm text-red-500">{passwordState.error}</p>
            )}

            {passwordState.success && (
              <p className="text-sm text-emerald-500">密码更新成功！</p>
            )}

            <Button
              type="submit"
              disabled={isPasswordPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isPasswordPending ? '更新中...' : '更新密码'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">数据导出</CardTitle>
          <CardDescription>将记忆空间导出为 ZIP 文件备份</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-600 mb-4">
            选择要导出的记忆空间，导出内容包含：
          </p>
          <ul className="text-sm text-stone-500 list-disc list-inside mb-4 space-y-1">
            <li>所有记忆素材（照片、视频、音频、文字）</li>
            <li>元数据（日期、标签、注释）</li>
            <li>家庭成员和提醒设置</li>
          </ul>
          {/* Export component will be rendered by parent */}
          <div id="export-section" />
        </CardContent>
      </Card>

      {/* About/Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">帮助与支持</CardTitle>
          <CardDescription>了解如何更好地使用忆锚</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="#"
            className="block text-sm text-amber-600 hover:text-amber-700 hover:underline"
          >
            使用指南 →
          </a>
          <a
            href="#"
            className="block text-sm text-amber-600 hover:text-amber-700 hover:underline"
          >
            常见问题 →
          </a>
          <a
            href="mailto:support@yimiao.app"
            className="block text-sm text-amber-600 hover:text-amber-700 hover:underline"
          >
            联系支持 →
          </a>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600">危险区域</CardTitle>
          <CardDescription>删除账户后，所有数据将无法恢复</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-600 mb-4">
            删除账户将永久删除：
          </p>
          <ul className="text-sm text-stone-500 list-disc list-inside mb-4 space-y-1">
            <li>您的账户和所有个人设置</li>
            <li>您创建的所有记忆空间</li>
            <li>所有上传的照片、视频和音频</li>
            <li>家庭成员邀请记录</li>
          </ul>
          <p className="text-sm text-red-500 mb-4">
            此操作不可撤销，请在删除前导出您的重要数据。
          </p>

          <form action={deleteFormAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation" className="text-red-600">
                请输入&quot;永久删除&quot;以确认
              </Label>
              <Input
                id="confirmation"
                name="confirmation"
                type="text"
                placeholder="永久删除"
                required
                disabled={isDeletePending}
              />
            </div>

            {deleteState.error && (
              <p className="text-sm text-red-500">{deleteState.error}</p>
            )}

            <Button
              type="submit"
              disabled={isDeletePending}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeletePending ? '删除中...' : '永久删除账户'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
