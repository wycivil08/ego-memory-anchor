import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getProfileById, deleteProfile } from '@/lib/actions/profile'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Button } from '@/components/ui/button'
import { RELATIONSHIP_LABELS } from '@/lib/types'

interface EditProfilePageProps {
  params: Promise<{ profileId: string }>
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { profileId } = await params
  const profile = await getProfileById(profileId)

  if (!profile) {
    notFound()
  }

  const relationshipLabel = RELATIONSHIP_LABELS[profile.relationship] || profile.relationship

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/profile/${profileId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回时间线
        </Link>
        <h1 className="text-2xl font-medium text-stone-800">编辑记忆空间</h1>
        <p className="mt-1 text-sm text-stone-500">
          编辑 {profile.name}（{relationshipLabel}）的信息
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <ProfileForm profile={profile} mode="edit" />
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h3 className="text-lg font-medium text-red-800">危险操作</h3>
          <p className="mt-1 text-sm text-red-600">
            删除后，所有记忆将被永久删除，此操作不可恢复
          </p>
          <form
            action={async () => {
              'use server'
              const confirmDelete = confirm('确定要删除这个记忆空间吗？所有记忆将被永久删除，此操作不可恢复。')
              if (confirmDelete) {
                const result = await deleteProfile(profileId)
                if (result.success) {
                  redirect('/dashboard')
                }
              }
            }}
          >
            <Button
              type="submit"
              variant="destructive"
              className="mt-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-150"
            >
              删除此记忆空间
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
