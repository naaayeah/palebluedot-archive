import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createAnonClient()
  const { data } = await supabase
    .from('planet_messages')
    .select('*, planets(name)')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(100)
  return NextResponse.json({ messages: data ?? [] })
}

export async function POST(request: Request) {
  const { content } = await request.json()
  if (!content || content.trim().length < 1) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }
  if (content.length > 500) {
    return NextResponse.json({ error: 'Message too long (max 500)' }, { status: 400 })
  }

  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('planet_messages')
    .insert({ planet_id: null, content: content.trim() })
    .select('*, planets(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data }, { status: 201 })
}
