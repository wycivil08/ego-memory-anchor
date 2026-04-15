import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('profileId')

  if (!profileId) {
    return NextResponse.json({ error: 'Missing profileId' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch photos for this profile
  const { data: photos, error } = await supabase
    .from('memories')
    .select('id, file_path, file_name, thumbnail_path, memory_date')
    .eq('profile_id', profileId)
    .eq('type', 'photo')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(20) // Limit to 20 most recent photos for the cover selector

  if (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }

  return NextResponse.json({ photos: photos || [] })
}
