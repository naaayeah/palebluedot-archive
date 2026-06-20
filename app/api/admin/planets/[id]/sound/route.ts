import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

const ALLOWED = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'video/mp4', 'audio/mp4', 'audio/x-m4a', 'audio/aac']

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: '최대 50MB' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'MP3/WAV/OGG/MP4(M4A)만 지원' }, { status: 400 })

  const supabase = createServiceClient()
  const ext = file.name.split('.').pop() || 'mp3'
  const ts = Date.now()
  const storagePath = `${params.id}/sound_${ts}.${ext}`

  // 기존 사운드 정리
  const { data: files } = await supabase.storage.from('planet-sounds').list(params.id)
  if (files && files.length) {
    await supabase.storage.from('planet-sounds').remove(files.map(f => `${params.id}/${f.name}`))
  }

  const { error: upErr } = await supabase.storage
    .from('planet-sounds')
    .upload(storagePath, file, { contentType: file.type, upsert: true })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('planet-sounds').getPublicUrl(storagePath)
  const url = `${publicUrl}?v=${ts}`

  const { error: dbErr } = await supabase.from('planets').update({ sound_url: url }).eq('id', params.id)
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ sound_url: url })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient()
  const { data: files } = await supabase.storage.from('planet-sounds').list(params.id)
  if (files && files.length) {
    await supabase.storage.from('planet-sounds').remove(files.map(f => `${params.id}/${f.name}`))
  }
  await supabase.from('planets').update({ sound_url: null }).eq('id', params.id)
  return NextResponse.json({ ok: true })
}
