import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const planet = searchParams.get('planet')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'newest'

  const supabase = createServiceClient()

  let query = supabase
    .from('planet_messages')
    .select('*, planets(name)')
    .order('created_at', { ascending: sort === 'oldest' })

  if (planet && planet !== 'all') {
    query = query.eq('planet_id', planet)
  }

  if (search) {
    query = query.ilike('content', `%${search}%`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data })
}
