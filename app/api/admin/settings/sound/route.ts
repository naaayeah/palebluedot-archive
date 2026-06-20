import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

const ALLOWED = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'video/mp4', 'audio/mp4', 'audio/x-m4a', 'audio/aac']

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: '최대 50MB' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'MP3/WAV/OGG/MP4(M4A)만 지원' }, { status: 400 })

  const supabase = createServiceClient()
  const ext = file.name.split('.').pop() || 'mp3'
  const ts = Date.now()
  const storagePath = `home_${ts}.${ext}`

  // 기존 home 사운드 정리
  const { data: existing } = await supabase.storage.from('site-audio').list('')
  if (existing && existing.length) {
    await supabase.storage.from('site-audio').remove(
      existing.filter(f => f.name.startsWith('home_')).map(f => f.name)
    )
  }

  const { error: upErr } = await supabase.storage
    .from('site-audio')
    .upload(storagePath, file, { contentType: file.type, upsert: true })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('site-audio').getPublicUrl(storagePath)
  const url = `${publicUrl}?v=${ts}`

  const { error: dbErr } = await supabase
    .from('site_settings')
    .upsert({ id: 1, home_sound_url: url })
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ home_sound_url: url })
}

export async function DELETE() {
  const supabase = createServiceClient()
  const { data: existing } = await supabase.storage.from('site-audio').list('')
  if (existing && existing.length) {
    await supabase.storage.from('site-audio').remove(
      existing.filter(f => f.name.startsWith('home_')).map(f => f.name)
    )
  }
  await supabase.from('site_settings').upsert({ id: 1, home_sound_url: null })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single()
  return NextResponse.json({ home_sound_url: data?.home_sound_url ?? null })
}
