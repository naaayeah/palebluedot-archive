import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createAnonClient()
  const { data } = await supabase
    .from('camera_backgrounds')
    .select('image_url')
    .order('created_at', { ascending: false })
  return NextResponse.json({ images: (data ?? []).map(d => d.image_url) })
}
