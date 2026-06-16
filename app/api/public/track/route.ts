import { NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const { page } = await request.json()
  if (!page) return NextResponse.json({ ok: true })

  const supabase = createAnonClient()
  await supabase.from('visitor_logs').insert({ page })
  return NextResponse.json({ ok: true })
}
