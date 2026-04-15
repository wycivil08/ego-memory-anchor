'use client'

import { useState } from 'react'
import { generateInviteLink } from '@/lib/actions/family'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { FamilyRole } from '@/lib/types'
import { FAMILY_ROLE_LABELS } from '@/lib/types'

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string
  /** The name of the profile (deceased person/pet) for WeChat template text */
  profileName: string
}

export function InviteDialog({ open, onOpenChange, profileId, profileName }: InviteDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<FamilyRole>('viewer')
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await generateInviteLink(profileId, email || null, role)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.link) {
      setInviteLink(result.link)
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        const textArea = document.createElement('textarea')
        textArea.value = inviteLink
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  // Generate WeChat-friendly invite text template
  const wechatTemplateText = inviteLink
    ? `我在整理${profileName}的照片和录音，邀请你一起来补充。点击链接加入：\n${inviteLink}`
    : null

  const handleCopyTemplate = async () => {
    if (wechatTemplateText) {
      try {
        await navigator.clipboard.writeText(wechatTemplateText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        const textArea = document.createElement('textarea')
        textArea.value = wechatTemplateText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleClose = () => {
    setEmail('')
    setRole('viewer')
    setInviteLink(null)
    setError(null)
    setCopied(false)
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleClose()
    } else {
      onOpenChange(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>邀请家人</DialogTitle>
          <DialogDescription>
            分享链接给家人，让他们可以查看和参与纪念空间
          </DialogDescription>
        </DialogHeader>

        {!inviteLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">邮箱地址（选填）</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="family@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-stone-300 bg-white text-stone-800 placeholder:text-stone-400"
              />
              <p className="text-xs text-stone-500">
                选填。对方的邮箱仅用于识别身份，不会用于发送邮件
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">角色权限</Label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as FamilyRole)}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="viewer">{FAMILY_ROLE_LABELS.viewer} - 可以查看记忆</option>
                <option value="editor">{FAMILY_ROLE_LABELS.editor} - 可以上传和编辑记忆</option>
                <option value="admin">{FAMILY_ROLE_LABELS.admin} - 完整访问权限</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isLoading ? '生成中...' : '生成邀请链接'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            {/* URL display with character count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>邀请链接</Label>
                <span
                  className={`text-xs ${
                    (inviteLink?.length || 0) > 100
                      ? 'text-red-500 font-medium'
                      : 'text-stone-400'
                  }`}
                >
                  {inviteLink?.length || 0} / 100 字符
                </span>
              </div>
              <Input
                value={inviteLink || ''}
                readOnly
                className="border-stone-300 bg-stone-50 text-stone-700 text-sm font-mono"
              />
              <p className="text-xs text-stone-500">
                微信内直接粘贴链接，或复制后发送
              </p>
            </div>

            {/* WeChat template text */}
            {wechatTemplateText && (
              <div className="space-y-2">
                <Label>微信分享文案（推荐）</Label>
                <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                  <p className="text-sm text-green-800 whitespace-pre-wrap">
                    {wechatTemplateText}
                  </p>
                </div>
                <p className="text-xs text-stone-500">
                  一键复制，直接粘贴到微信发送
                </p>
              </div>
            )}

            <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
              <p className="text-xs text-amber-800">
                链接永久有效。对方注册并登录后即可加入此记忆空间。
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-1 border-stone-300 text-stone-700 hover:bg-stone-100"
              >
                {copied ? '已复制' : '复制链接'}
              </Button>
              {wechatTemplateText && (
                <Button
                  onClick={handleCopyTemplate}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {copied ? '已复制' : '复制微信文案'}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
