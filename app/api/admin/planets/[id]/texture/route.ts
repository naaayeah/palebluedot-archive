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

  // 새 파일 외 기존 텍스처 정리
  const { data: files } = await supabase.storage.from('planet-textures').list(params.id)
  if (files && files.length) {
    const toRemove = files
      .filter(f => `${params.id}/${f.name}` !== path)
      .map(f => `${params.id}/${f.name}`)
    if (toRemove.length) await supabase.storage.from('planet-textures').remove(toRemove)
  }

  const { error: dbErr } = await supabase
    .from('planets')
    .update({ texture_url: url })
    .eq('id', params.id)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ texture_url: url })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient()

  // 해당 행성 폴더의 모든 파일 삭제
  const { data: files } = await supabase.storage.from('planet-textures').list(params.id)
  if (files && files.length > 0) {
    await supabase.storage.from('planet-textures').remove(
      files.map(f => `${params.id}/${f.name}`)
    )
  }

  await supabase.from('planets').update({ texture_url: null }).eq('id', params.id)
  return NextResponse.json({ ok: true })
}
