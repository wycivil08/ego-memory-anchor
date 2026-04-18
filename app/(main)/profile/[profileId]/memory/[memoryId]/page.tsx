import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getMemoryById, deleteMemory, updateMemoryAnnotation } from '@/lib/actions/memory'
import { getProfileById } from '@/lib/actions/profile'
import { MemoryDetail } from '@/components/memory/MemoryDetail'
import { AnnotationEditor } from '@/components/memory/AnnotationEditor'
import { Button } from '@/components/ui/button'

interface MemoryDetailPageProps {
  params: Promise<{ profileId: string; memoryId: string }>
}

// Loading skeleton for memory detail
function MemoryDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-xl bg-stone-100 aspect-[4/3]" />
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-stone-100" />
        <div className="h-4 w-24 rounded bg-stone-100" />
      </div>
    </div>
  )
}

// Memory content with annotation editor
async function MemoryContent({
  profileId,
  memoryId,
}: {
  profileId: string
  memoryId: string
}) {
  const { memory, error } = await getMemoryById(memoryId)

  if (error || !memory) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">{error || '记忆不存在'}</p>
        <Link href={`/profile/${profileId}`} className="mt-4 inline-block">
          <Button variant="outline" className="border-stone-300 text-stone-700">
            返回时间线
          </Button>
        </Link>
      </div>
    )
  }

  // Get contributor info from the joined data
  // The contributor data structure depends on how Supabase returns it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contributor = (memory as any).contributor as {
    id: string
    email?: string
    user_metadata?: { name?: string; avatar_url?: string }
  } | null

  const contributorName = contributor?.user_metadata?.name || contributor?.email?.split('@')[0] || undefined
  const contributorAvatar = contributor?.user_metadata?.avatar_url || null

  // Check if user can delete (is profile owner)
  const profile = await getProfileById(profileId)
  const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
  const { data: userData } = await supabase.auth.getUser()

  const canDelete = profile?.user_id === userData?.user?.id

  // Handle delete
  async function handleDelete() {
    'use server'
    const result = await deleteMemory(memoryId)
    if (result.success) {
      redirect(`/profile/${profileId}`)
    }
    return result
  }

  // Handle annotation save
  async function handleAnnotationSave(memoryId: string, annotation: string) {
    'use server'
    return updateMemoryAnnotation(memoryId, annotation)
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/profile/${profileId}`}
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回时间线
      </Link>

      {/* Memory detail */}
      <MemoryDetail
        memory={memory}
        contributorName={contributorName}
        contributorAvatar={contributorAvatar}
        canDelete={canDelete}
        onDelete={handleDelete}
      />

      {/* Annotation section */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <AnnotationEditor
          memoryId={memoryId}
          initialAnnotation={memory.annotation}
          onSave={handleAnnotationSave}
        />
      </div>
    </div>
  )
}

export default async function MemoryDetailPage({ params }: MemoryDetailPageProps) {
  const { profileId, memoryId } = await params

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
        <Suspense fallback={<MemoryDetailLoading />}>
          <MemoryContent profileId={profileId} memoryId={memoryId} />
        </Suspense>
      </div>
    </div>
  )
}
