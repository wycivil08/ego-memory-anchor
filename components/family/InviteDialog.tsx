'use client'

import { useState } from 'react'
import { generateInviteLink, type FamilyState } from '@/lib/actions/family'
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
  DialogClose,
} from '@/components/ui/dialog'
import type { FamilyRole } from '@/lib/types'
import { FAMILY_ROLE_LABELS } from '@/lib/types'

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string
}

export function InviteDialog({ open, onOpenChange, profileId }: InviteDialogProps) {
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

    const result = await generateInviteLink(profileId, email, role)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.link) {
      setInviteLink(result.link)
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Fallback for older browsers
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
              <Label htmlFor="invite-email">邮箱地址</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="family@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
            <div className="space-y-2">
              <Label>邀请链接</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="border-stone-300 bg-stone-50 text-stone-700 text-sm"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>
              <p className="text-xs text-stone-500">
                复制链接发送给家人，他们可以直接打开链接加入记忆空间
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
              <p className="text-xs text-amber-800">
                链接永久有效。对方注册并登录后即可加入此记忆空间。
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                onClick={handleCopy}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {copied ? '已复制' : '复制链接'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
