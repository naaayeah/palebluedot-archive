import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const { planet_id, content } = await request.json()

  if (!planet_id || !content || content.trim().length < 1) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (content.length > 500) {
    return NextResponse.json({ error: 'Message too long (max 500 characters)' }, { status: 400 })
  }

  const supabase = createAnonClient()

  const { data, error } = await supabase
    .from('planet_messages')
    .insert({ planet_id, content: content.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data }, { status: 201 })
}
