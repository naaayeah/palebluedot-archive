import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('camera_backgrounds')
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json({ backgrounds: data ?? [] })
}

// 브라우저가 Supabase에 직접 업로드 후, 결과 URL만 저장 (JSON { url, path })
export async function POST(request: Request) {
  const { url, path } = await request.json()
  if (!url) return NextResponse.json({ error: 'No url' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error: dbErr } = await supabase
    .from('camera_backgrounds')
    .insert({ image_url: url, storage_path: path })
    .select()
    .single()
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ background: data })
}
