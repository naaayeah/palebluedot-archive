import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// 브라우저가 Supabase에 직접 업로드 후, 결과 URL만 저장 (JSON { url, path })
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { url, path } = await request.json()
  if (!url) return NextResponse.json({ error: 'No url' }, { status: 400 })

  const supabase = createServiceClient()

  // 새 파일 외 기존 영상 정리
  const { data: files } = await supabase.storage.from('planet-videos').list(params.id)
  if (files && files.length) {
    const toRemove = files
      .filter(f => `${params.id}/${f.name}` !== path)
      .map(f => `${params.id}/${f.name}`)
    if (toRemove.length) await supabase.storage.from('planet-videos').remove(toRemove)
  }

  const { error: dbErr } = await supabase
    .from('planets')
    .update({ bg_video_url: url })
    .eq('id', params.id)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ bg_video_url: url })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient()

  await supabase.storage.from('planet-videos').remove([
    `${params.id}/bg.mp4`,
    `${params.id}/bg.webm`,
    `${params.id}/bg.mov`,
    `${params.id}/bg.avi`,
  ])

  await supabase.from('planets').update({ bg_video_url: null }).eq('id', params.id)
  return NextResponse.json({ ok: true })
}
