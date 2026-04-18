'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { FamilyMemberWithUser, FamilyRole } from '@/lib/types'
import { FAMILY_ROLE_LABELS } from '@/lib/types'
import { updateMemberRole, removeMember, revokeInvite } from '@/lib/actions/family'

interface MemberListProps {
  members: FamilyMemberWithUser[]
  isOwner: boolean
  profileId: string
}

export function MemberList({ members, isOwner, profileId }: MemberListProps) {
  // Separate accepted members and pending invites
  const acceptedMembers = members.filter((m) => m.accepted_at !== null)
  const pendingInvites = members.filter((m) => m.accepted_at === null)

  return (
    <div className="space-y-6">
      {/* Accepted Members */}
      {acceptedMembers.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-medium text-stone-800">
            家庭成员 ({acceptedMembers.length})
          </h3>
          <div className="grid gap-4">
            {acceptedMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isOwner={isOwner}
                profileId={profileId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-medium text-stone-800">
            待接受邀请 ({pendingInvites.length})
          </h3>
          <div className="grid gap-4">
            {pendingInvites.map((invite) => (
              <PendingInviteCard
                key={invite.id}
                invite={invite}
                isOwner={isOwner}
                profileId={profileId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {members.length === 0 && (
        <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center">
          <p className="text-stone-500">暂无家庭成员</p>
          <p className="mt-1 text-sm text-stone-400">
            邀请家人加入，一起守护记忆
          </p>
        </div>
      )}
    </div>
  )
}

interface MemberCardProps {
  member: FamilyMemberWithUser
  isOwner: boolean
  profileId: string
}

function MemberCard({ member, isOwner, profileId }: MemberCardProps) {
  const [showRemoveDialog, setShowRemoveDialog] = React.useState(false)
  const [showRoleMenu, setShowRoleMenu] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)

  const displayName = member.user_name || member.display_name || member.invited_email || '未知'
  const displayRole = FAMILY_ROLE_LABELS[member.role] || member.role

  // Get avatar URL
  const avatarUrl = member.user_avatar_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${member.user_avatar_url}`
    : null

  const handleRoleChange = async (newRole: FamilyRole) => {
    setIsUpdating(true)
    await updateMemberRole(profileId, member.id, newRole)
    setShowRoleMenu(false)
    setIsUpdating(false)
    // Refresh will happen via revalidatePath
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    await removeMember(profileId, member.id)
    setShowRemoveDialog(false)
    setIsUpdating(false)
  }

  // Format invite time
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xl font-medium">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-stone-800 truncate">{displayName}</p>
                {member.user_email && (
                  <span className="text-sm text-stone-400 truncate">
                    ({member.user_email})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-stone-500">{displayRole}</span>
                <span className="text-xs text-stone-400">
                  加入于 {formatDate(member.invited_at)}
                </span>
              </div>
            </div>

            {/* Actions - only for owner */}
            {isOwner && (
              <div className="flex items-center gap-2">
                {/* Role dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    disabled={isUpdating}
                    className="rounded-lg"
                  >
                    更改角色
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>

                  {showRoleMenu && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowRoleMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-10 w-32 rounded-lg border bg-white shadow-lg">
                        {(['admin', 'editor', 'viewer'] as FamilyRole[]).map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(role)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-stone-50 ${
                              member.role === role ? 'font-medium text-amber-600' : 'text-stone-700'
                            }`}
                          >
                            {FAMILY_ROLE_LABELS[role]}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={isUpdating}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  移除
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove confirmation dialog */}
      <ConfirmDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="移除家庭成员"
        description={`确定要移除 ${displayName} 吗？移除后他们将无法再访问此记忆空间。`}
        confirmLabel="移除"
        onConfirm={handleRemove}
        variant="destructive"
        loading={isUpdating}
      />
    </>
  )
}

interface PendingInviteCardProps {
  invite: FamilyMemberWithUser
  isOwner: boolean
  profileId: string
}

function PendingInviteCard({ invite, isOwner, profileId }: PendingInviteCardProps) {
  const [showRevokeDialog, setShowRevokeDialog] = React.useState(false)
  const [showCopySuccess, setShowCopySuccess] = React.useState(false)
  const [isRevoking, setIsRevoking] = React.useState(false)

  const inviteEmail = invite.invited_email || '未知邮箱'
  const inviteRole = FAMILY_ROLE_LABELS[invite.role] || invite.role

  // Generate invite link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const inviteLink = invite.invite_token
    ? `${baseUrl}/invite/${invite.invite_token}`
    : null

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      setShowCopySuccess(true)
      setTimeout(() => setShowCopySuccess(false), 2000)
    }
  }

  const handleRevoke = async () => {
    setIsRevoking(true)
    await revokeInvite(profileId, invite.id)
    setShowRevokeDialog(false)
    setIsRevoking(false)
  }

  // Format invite time
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <Card className="overflow-hidden border-dashed border-stone-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Pending icon */}
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-stone-600 truncate">{inviteEmail}</p>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                  待接受
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-stone-400">{inviteRole}</span>
                <span className="text-xs text-stone-400">
                  邀请于 {formatDate(invite.invited_at)}
                </span>
              </div>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="flex items-center gap-2">
                {/* Copy link button */}
                {inviteLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="rounded-lg"
                  >
                    {showCopySuccess ? (
                      <>
                        <svg className="mr-1 h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        已复制
                      </>
                    ) : (
                      <>
                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        复制链接
                      </>
                    )}
                  </Button>
                )}

                {/* Revoke button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRevokeDialog(true)}
                  disabled={isRevoking}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  撤销邀请
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revoke confirmation dialog */}
      <ConfirmDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        title="撤销邀请"
        description={`确定要撤销发送给 ${inviteEmail} 的邀请吗？`}
        confirmLabel="撤销"
        onConfirm={handleRevoke}
        variant="destructive"
        loading={isRevoking}
      />
    </>
  )
}
