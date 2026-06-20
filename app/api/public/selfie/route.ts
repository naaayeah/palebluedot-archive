import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const supabase = createServiceClient()
  const ext = file.type.includes('png') ? 'png' : 'jpg'
  const storagePath = `selfie_${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('visitor-selfies')
    .upload(storagePath, file, { contentType: file.type })

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('visitor-selfies')
    .getPublicUrl(storagePath)

  const { error: dbErr } = await supabase
    .from('visitor_selfies')
    .insert({ image_url: publicUrl, storage_path: storagePath })

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('visitor_selfies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(48)
  return NextResponse.json({ selfies: data ?? [] })
}
