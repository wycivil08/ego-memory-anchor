'use server'

import { uploadFile } from '@/lib/utils/storage'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UploadState = {
  error: string | null
  success: boolean
  filePath?: string
}

// Upload a file to Supabase Storage and return the path
export async function uploadMemoryFile(
  bucket: 'memories' | 'avatars',
  profileId: string,
  memoryId: string,
  fileName: string,
  file: File
): Promise<UploadState> {
  try {
    // Validate file
    if (!file || file.size === 0) {
      return { error: '文件无效', success: false }
    }

    // Build storage path
    const filePath = `${profileId}/${memoryId}/${fileName}`

    // Upload to Supabase Storage
    const uploadedPath = await uploadFile(bucket, filePath, file)

    return { error: null, success: true, filePath: uploadedPath }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      error: error instanceof Error ? error.message : '上传失败',
      success: false,
    }
  }
}

// Delete a file from Supabase Storage
export async function deleteMemoryFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.storage.from('memories').remove([filePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    }
  }
}

// Get public URL for a storage file
export async function getStoragePublicUrl(
  bucket: 'memories' | 'avatars',
  filePath: string
): Promise<string> {
  const supabase = await createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}
