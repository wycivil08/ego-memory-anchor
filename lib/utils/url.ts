/**
 * Get the public URL for a file in Supabase Storage.
 * This is a pure function that doesn't need Supabase client.
 * Can be used in both server and client components.
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
