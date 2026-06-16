import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > 200 * 1024 * 1024) {
    return NextResponse.json({ error: '최대 200MB까지 업로드 가능합니다' }, { status: 400 })
  }

  const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'MP4/WebM/MOV/AVI만 지원합니다' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const ext = file.name.split('.').pop() || 'mp4'
  const storagePath = `${params.id}/bg.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('planet-videos')
    .upload(storagePath, file, { contentType: file.type, upsert: true })

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('planet-videos')
    .getPublicUrl(storagePath)

  const { error: dbErr } = await supabase
    .from('planets')
    .update({ bg_video_url: publicUrl })
    .eq('id', params.id)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ bg_video_url: publicUrl })
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
