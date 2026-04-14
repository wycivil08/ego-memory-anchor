import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemberList } from '@/components/family/MemberList'
import type { FamilyMemberWithUser } from '@/lib/types'

// Mock server actions
vi.mock('@/lib/actions/family', () => ({
  updateMemberRole: vi.fn().mockResolvedValue({ success: true, error: null }),
  removeMember: vi.fn().mockResolvedValue({ success: true, error: null }),
  revokeInvite: vi.fn().mockResolvedValue({ success: true, error: null }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  revalidatePath: vi.fn(),
}))

const mockMembers: FamilyMemberWithUser[] = [
  {
    id: 'member-1',
    profile_id: 'profile-1',
    user_id: 'user-1',
    invited_email: null,
    display_name: null,
    role: 'admin',
    invite_token: null,
    invited_by: 'owner-user',
    invited_at: '2024-01-15T10:00:00Z',
    accepted_at: '2024-01-16T10:00:00Z',
    deleted_at: null,
    user_email: 'member1@example.com',
    user_name: '张三',
    user_avatar_url: null,
  },
  {
    id: 'member-2',
    profile_id: 'profile-1',
    user_id: 'user-2',
    invited_email: null,
    display_name: null,
    role: 'editor',
    invite_token: null,
    invited_by: 'owner-user',
    invited_at: '2024-01-20T10:00:00Z',
    accepted_at: '2024-01-21T10:00:00Z',
    deleted_at: null,
    user_email: 'member2@example.com',
    user_name: '李四',
    user_avatar_url: null,
  },
]

const mockPendingInvites: FamilyMemberWithUser[] = [
  {
    id: 'invite-1',
    profile_id: 'profile-1',
    user_id: null,
    invited_email: 'pending@example.com',
    display_name: null,
    role: 'viewer',
    invite_token: 'token-123',
    invited_by: 'owner-user',
    invited_at: '2024-02-01T10:00:00Z',
    accepted_at: null,
    deleted_at: null,
  },
]

describe('MemberList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render accepted members section when members exist', () => {
      render(
        <MemberList
          members={mockMembers}
          isOwner={true}
          profileId="profile-1"
        />
      )

      expect(screen.getByText('家庭成员 (2)')).toBeTruthy()
      expect(screen.getByText('张三')).toBeTruthy()
      expect(screen.getByText('李四')).toBeTruthy()
    })

    it('should render pending invites section when invites exist', () => {
      render(
        <MemberList
          members={mockPendingInvites}
          isOwner={true}
          profileId="profile-1"
        />
      )

      expect(screen.getByText('待接受邀请 (1)')).toBeTruthy()
      expect(screen.getByText('pending@example.com')).toBeTruthy()
    })

    it('should render empty state when no members', () => {
      render(
        <MemberList
          members={[]}
          isOwner={true}
          profileId="profile-1"
        />
      )

      expect(screen.getByText('暂无家庭成员')).toBeTruthy()
      expect(screen.getByText('邀请家人加入，一起守护记忆')).toBeTruthy()
    })

    it('should display role labels correctly', () => {
      render(
        <MemberList
          members={mockMembers}
          isOwner={true}
          profileId="profile-1"
        />
      )

      expect(screen.getByText('管理员')).toBeTruthy()
      expect(screen.getByText('编辑')).toBeTruthy()
    })
  })

  describe('Owner controls', () => {
    it('should show role change button for owner', () => {
      render(
        <MemberList
          members={mockMembers}
          isOwner={true}
          profileId="profile-1"
        />
      )

      expect(screen.getAllByText('更改角色')).toHaveLength(2)
    })

    it('should show remove button for owner', () => {
      render(
        <MemberList
          members={mockMembers}
          isOwner={true}
          profileId="profile-1"
        />
      )

      expect(screen.getAllByText('移除')).toHaveLength(2)
    })

    it('should not show controls for non-owner', () => {
      render(
        <MemberList
          members={mockMembers}
          isOwner={false}
          profileId="profile-1"
        />
      )

      expect(screen.queryByText('更改角色')).toBeNull()
      expect(screen.queryByText('移除')).toBeNull()
    })
  })

  describe('Pending invite controls', () => {
    it('should show copy link button for owner', () => {
      render(
        <MemberList
          members={mockPendingInvites}
          isOwner={true}
          profileId="profile-1"
        />
      )

      expect(screen.getByText('复制链接')).toBeTruthy()
    })

    it('should show revoke button for owner', () => {
      render(
        <MemberList
          members={mockPendingInvites}
          isOwner={true}
          profileId="profile-1"
        />
      )

      expect(screen.getByText('撤销邀请')).toBeTruthy()
    })

    it('should not show controls for non-owner', () => {
      render(
        <MemberList
          members={mockPendingInvites}
          isOwner={false}
          profileId="profile-1"
        />
      )

      expect(screen.queryByText('复制链接')).toBeNull()
      expect(screen.queryByText('撤销邀请')).toBeNull()
    });

    it('should show pending status badge', () => {
      render(
        <MemberList
          members={mockPendingInvites}
          isOwner={true}
          profileId="profile-1"
        />
      )

      expect(screen.getByText('待接受')).toBeTruthy()
    })
  })

  describe('Role change dropdown', () => {
    it('should open role dropdown when clicking 更改角色', async () => {
      render(
        <MemberList
          members={[mockMembers[0]]}
          isOwner={true}
          profileId="profile-1"
        />
      )

      const button = screen.getByText('更改角色')
      fireEvent.click(button)

      await waitFor(() => {
        // Use getAllByText since '管理员' appears in both role badge AND dropdown option
        const adminLabels = screen.getAllByText('管理员')
        expect(adminLabels.length).toBe(2) // role badge span + dropdown button
        expect(screen.getByText('编辑')).toBeTruthy()
        expect(screen.getByText('查看')).toBeTruthy()
      })
    })
  })

  describe('Confirm dialog', () => {
    it('should show confirm dialog when clicking remove', async () => {
      render(
        <MemberList
          members={[mockMembers[0]]}
          isOwner={true}
          profileId="profile-1"
        />
      )

      const removeButton = screen.getByText('移除')
      fireEvent.click(removeButton)

      await waitFor(() => {
        // Use getAllByText since both trigger button and dialog title contain '移除家庭成员'
        const removeTitles = screen.getAllByText('移除家庭成员')
        expect(removeTitles.length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText(/确定要移除.*张三.*吗/)).toBeTruthy()
      })
    })

    it('should show revoke dialog when clicking revoke', async () => {
      render(
        <MemberList
          members={mockPendingInvites}
          isOwner={true}
          profileId="profile-1"
        />
      )

      const revokeButton = screen.getByText('撤销邀请')
      fireEvent.click(revokeButton)

      await waitFor(() => {
        // Use getAllByText since both trigger button and dialog title contain '撤销邀请'
        const revokeTitles = screen.getAllByText('撤销邀请')
        expect(revokeTitles.length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText(/确定要撤销发送给/)).toBeTruthy()
      })
    })
  })
})
