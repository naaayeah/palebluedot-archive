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

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: '최대 15MB' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return NextResponse.json({ error: 'JPEG/PNG/WEBP만 지원' }, { status: 400 })

  const supabase = createServiceClient()
  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
  const ts = Date.now()
  const storagePath = `bg_${ts}.${ext}`

  const { error: upErr } = await supabase.storage
    .from('camera-backgrounds')
    .upload(storagePath, file, { contentType: file.type, upsert: false })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('camera-backgrounds').getPublicUrl(storagePath)

  const { data, error: dbErr } = await supabase
    .from('camera_backgrounds')
    .insert({ image_url: publicUrl, storage_path: storagePath })
    .select()
    .single()
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ background: data })
}
