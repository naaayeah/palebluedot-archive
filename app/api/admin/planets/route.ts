import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('planets')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ planets: data })
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('planets')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ planet: data }, { status: 201 })
}
