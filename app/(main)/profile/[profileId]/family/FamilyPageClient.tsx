'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MemberList, InviteDialog } from '@/components/family'
import type { ProfileWithMemoryCount, FamilyMemberWithUser } from '@/lib/types'

interface FamilyPageClientProps {
  profile: ProfileWithMemoryCount
  members: FamilyMemberWithUser[]
  isOwner: boolean
  profileId: string
}

export function FamilyPageClient({
  profile,
  members,
  isOwner,
  profileId,
}: FamilyPageClientProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [memberListKey] = useState(0)

  return (
    <div className="min-h-screen">
      {/* Family Section */}
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-stone-800">家庭成员管理</h1>
              <p className="mt-1 text-sm text-stone-500">
                邀请家人加入，一起守护记忆空间
              </p>
            </div>
            {isOwner && (
              <Button
                onClick={() => setInviteDialogOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                邀请家人
              </Button>
            )}
          </div>

          {/* Member List - key forces refresh after invite actions */}
          <MemberList
            key={memberListKey}
            members={members}
            isOwner={isOwner}
            profileId={profileId}
          />
        </div>
      </div>

      {/* Invite Dialog */}
      {isOwner && (
        <InviteDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          profileId={profileId}
          profileName={profile.name}
        />
      )}
    </div>
  )
}
