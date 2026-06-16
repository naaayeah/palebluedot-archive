import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const planet = searchParams.get('planet')

  const supabase = createServiceClient()

  let query = supabase
    .from('planet_photos')
    .select('*, planets(name)')
    .order('created_at', { ascending: false })

  if (planet && planet !== 'all') {
    query = query.eq('planet_id', planet)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ photos: data })
}
