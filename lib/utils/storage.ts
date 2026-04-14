import { createClient } from '@/lib/supabase/server'

/**
 * Upload a file to Supabase Storage.
 *
 * @param bucket - Storage bucket name (e.g., 'memories', 'avatars')
 * @param path - Full path within bucket (e.g., 'user123/profile456/memory789/file.jpg')
 * @param file - File to upload
 * @param onProgress - Optional progress callback (0-100)
 * @returns The path of the uploaded file
 * @throws Error if upload fails
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const supabase = await createClient()

  // Report initial progress
  onProgress?.(0)

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error || !data) {
    throw new Error(error?.message ?? 'Upload failed')
  }

  // Report completion
  onProgress?.(100)

  return data.path
}

/**
 * Upload a thumbnail image for a memory.
 *
 * @param profileId - Profile ID
 * @param memoryId - Memory ID
 * @param blob - Thumbnail image blob
 * @returns The path of the uploaded thumbnail
 */
export async function uploadThumbnail(
  profileId: string,
  memoryId: string,
  blob: Blob
): Promise<string> {
  const supabase = await createClient()

  const path = `${profileId}/${memoryId}/thumbnail.jpg`
  const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' })

  const { data, error } = await supabase.storage.from('memories').upload(path, file, {
    cacheControl: '3600',
    upsert: true, // Allow overwriting existing thumbnail
  })

  if (error || !data) {
    throw new Error(error?.message ?? 'Thumbnail upload failed')
  }

  return data.path
}

/**
 * Get the public URL for a file in Supabase Storage.
 *
 * @param bucket - Storage bucket name
 * @param path - Path within bucket
 * @returns Public URL string
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  // Construct public URL directly without needing a client
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
