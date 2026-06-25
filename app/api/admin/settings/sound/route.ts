import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// 브라우저가 Supabase에 직접 업로드 후, 결과 URL만 저장 (JSON { url, path })
export async function POST(request: Request) {
  const { url, path } = await request.json()
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'No url' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 새 파일 외 기존 home_ 사운드 정리
  const { data: existing } = await supabase.storage.from('site-audio').list('')
  if (existing && existing.length) {
    const toRemove = existing
      .filter(f => f.name.startsWith('home_') && f.name !== path)
      .map(f => f.name)
    if (toRemove.length) await supabase.storage.from('site-audio').remove(toRemove)
  }

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
