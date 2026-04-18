/**
 * Storage URL construction utilities - SINGLE SOURCE OF TRUTH.
 *
 * IMPORTANT: Use these functions to construct ALL storage URLs.
 * DO NOT inline URL construction like `${SUPABASE_URL}/storage/...` in components.
 * This prevents bugs from inconsistent URL construction.
 *
 * Usage:
 *   import { getMemoryFileUrl, getAvatarFileUrl } from '@/lib/utils/storage-urls'
 *   const url = getMemoryFileUrl('profileId/memoryId/photo.jpg')
 *
 * These functions are client-safe (no server-only imports).
 */

/**
 * Get a public URL for a file in Supabase Storage.
 * This is the SINGLE SOURCE OF TRUTH for constructing storage URLs.
 * Using this function prevents bugs from inconsistent URL construction.
 *
 * @param bucket - Storage bucket name ('memories' | 'avatars')
 * @param path - Path within bucket (e.g., 'profileId/memoryId/file.jpg')
 * @returns Full public URL string
 */
export function getStoragePublicUrl(bucket: string, path: string): string {
  if (!path) return ''
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

/**
 * Get a public URL for a memory file (stored in 'memories' bucket).
 * Convenience wrapper for memory-specific file paths.
 *
 * @param path - Path within memories bucket
 * @returns Full public URL string
 */
export function getMemoryFileUrl(path: string): string {
  return getStoragePublicUrl('memories', path)
}

/**
 * Get a public URL for an avatar file (stored in 'avatars' bucket).
 * Convenience wrapper for avatar-specific file paths.
 *
 * @param path - Path within avatars bucket
 * @returns Full public URL string
 */
export function getAvatarFileUrl(path: string): string {
  return getStoragePublicUrl('avatars', path)
}
