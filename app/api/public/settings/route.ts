import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createAnonClient()
  const { data } = await supabase.from('site_settings').select('home_sound_url').eq('id', 1).single()
  return NextResponse.json({ home_sound_url: data?.home_sound_url ?? null })
}
