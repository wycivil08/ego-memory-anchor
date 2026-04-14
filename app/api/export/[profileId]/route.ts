import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import archiver from 'archiver'
import type { Memory, Profile } from '@/lib/types'

/**
 * Export API Route - generates ZIP stream for profile data export
 *
 * Security: Only the profile owner can export data
 * Format: ZIP containing metadata.json + all media files
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  // Verify profile ownership
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: '记忆空间不存在' }, { status: 404 })
  }

  if (profile.user_id !== user.id) {
    return NextResponse.json({ error: '只有档案创建者可以导出数据' }, { status: 403 })
  }

  // Fetch all memories for this profile
  const { data: memories, error: memoriesError } = await supabase
    .from('memories')
    .select('*')
    .eq('profile_id', profileId)
    .is('deleted_at', null)
    .order('memory_date', { ascending: true })

  if (memoriesError) {
    console.error('Error fetching memories for export:', memoriesError)
    return NextResponse.json({ error: '获取记忆数据失败' }, { status: 500 })
  }

  // Fetch family members for this profile
  const { data: familyMembers, error: familyError } = await supabase
    .from('family_members')
    .select('*')
    .eq('profile_id', profileId)
    .is('deleted_at', null)

  // Fetch reminders for this profile
  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('*')
    .eq('profile_id', profileId)

  // Create ZIP archive with streaming
  const archive = archiver('zip', {
    zlib: { level: 5 }, // Moderate compression for speed
  })

  // Create a readable stream for the response
  const stream = new ReadableStream({
    start(controller) {
      archive.on('data', (chunk) => {
        controller.enqueue(chunk)
      })

      archive.on('end', () => {
        controller.close()
      })

      archive.on('error', (err) => {
        console.error('Archive error:', err)
        controller.error(err)
      })
    },
  })

  // Build metadata.json content
  const metadata = {
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    profile: {
      id: profile.id,
      name: profile.name,
      avatarPath: profile.avatar_path,
      birthDate: profile.birth_date,
      deathDate: profile.death_date,
      relationship: profile.relationship,
      species: profile.species,
      description: profile.description,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
    memories: (memories || []).map((m: Memory) => ({
      id: m.id,
      type: m.type,
      fileName: m.file_name,
      filePath: m.file_path,
      content: m.content,
      memoryDate: m.memory_date,
      memoryDatePrecision: m.memory_date_precision,
      tags: m.tags,
      annotation: m.annotation,
      sourceLabel: m.source_label,
      mimeType: m.mime_type,
      fileSize: m.file_size,
      createdAt: m.created_at,
    })),
    familyMembers: (familyMembers || []).map((fm) => ({
      id: fm.id,
      displayName: fm.display_name,
      role: fm.role,
      invitedEmail: fm.invited_email,
      invitedAt: fm.invited_at,
      acceptedAt: fm.accepted_at,
    })),
    reminders: (reminders || []).map((r) => ({
      id: r.id,
      title: r.title,
      reminderDate: r.reminder_date,
      recurrence: r.recurrence,
      enabled: r.enabled,
      createdAt: r.created_at,
    })),
    statistics: {
      totalMemories: (memories || []).length,
      totalPhotos: (memories || []).filter((m: Memory) => m.type === 'photo').length,
      totalVideos: (memories || []).filter((m: Memory) => m.type === 'video').length,
      totalAudio: (memories || []).filter((m: Memory) => m.type === 'audio').length,
      totalTexts: (memories || []).filter((m: Memory) => m.type === 'text').length,
      totalDocuments: (memories || []).filter((m: Memory) => m.type === 'document').length,
      totalFamilyMembers: (familyMembers || []).length,
      totalReminders: (reminders || []).length,
    },
  }

  // Add metadata.json to archive
  archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' })

  // Add media files to archive
  const memoryFiles = (memories || []).filter(
    (m: Memory) => m.file_path && m.type !== 'text'
  )

  for (const memory of memoryFiles) {
    try {
      // Get signed URL for the file (valid for 1 hour)
      const { data: signedData, error: signError } = await supabase.storage
        .from('memories')
        .createSignedUrl(memory.file_path!, 3600)

      if (signError || !signedData) {
        console.warn(`Could not get signed URL for ${memory.file_path}:`, signError)
        continue
      }

      // Fetch the file content
      const response = await fetch(signedData.signedUrl)
      if (!response.ok) {
        console.warn(`Could not fetch file ${memory.file_path}`)
        continue
      }

      const arrayBuffer = await response.arrayBuffer()
      const fileName = memory.file_name || `${memory.id}${getExtensionFromMime(memory.mime_type)}`
      const filePath = `media/${memory.type}/${fileName}`

      archive.append(Buffer.from(arrayBuffer), { name: filePath })
    } catch (err) {
      console.warn(`Error adding file ${memory.file_path} to archive:`, err)
    }
  }

  // Add avatar if exists
  if (profile.avatar_path) {
    try {
      const { data: signedData, error: signError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(profile.avatar_path, 3600)

      if (!signError && signedData) {
        const response = await fetch(signedData.signedUrl)
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          const fileName = profile.avatar_path.split('/').pop() || 'avatar'
          archive.append(Buffer.from(arrayBuffer), { name: `media/avatar/${fileName}` })
        }
      }
    } catch (err) {
      console.warn('Error adding avatar to archive:', err)
    }
  }

  // Finalize the archive
  archive.finalize()

  // Return streaming response
  const profileName = profile.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
  const filename = `${profileName}_回忆录_${new Date().toISOString().split('T')[0]}.zip`

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Cache-Control': 'no-store',
    },
  })
}

function getExtensionFromMime(mimeType: string | null): string {
  if (!mimeType) return ''
  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/m4a': '.m4a',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  }
  return mimeMap[mimeType] || ''
}
