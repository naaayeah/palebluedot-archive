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
