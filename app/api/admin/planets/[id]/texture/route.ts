import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Max 10MB' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return NextResponse.json({ error: 'JPEG/PNG/WEBP only' }, { status: 400 })

  const supabase = createServiceClient()
  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
  // 타임스탬프로 파일명 고유화 → CDN/브라우저 캐시 무효화
  const ts = Date.now()
  const storagePath = `${params.id}/texture_${ts}.${ext}`

  // 기존 텍스처 파일 삭제 (용량 절약)
  await supabase.storage.from('planet-textures').remove([
    `${params.id}/texture.jpg`,
    `${params.id}/texture.jpeg`,
    `${params.id}/texture.png`,
    `${params.id}/texture.webp`,
    ...(await supabase.storage.from('planet-textures').list(params.id))
      .data?.map(f => `${params.id}/${f.name}`) ?? [],
  ])

  const { error: uploadErr } = await supabase.storage
    .from('planet-textures')
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('planet-textures')
    .getPublicUrl(storagePath)

  // 캐시 버스팅 쿼리 파라미터 추가
  const urlWithCacheBust = `${publicUrl}?v=${ts}`

  const { error: dbErr } = await supabase
    .from('planets')
    .update({ texture_url: urlWithCacheBust })
    .eq('id', params.id)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ texture_url: urlWithCacheBust })
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
