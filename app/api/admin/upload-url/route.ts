import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// 브라우저가 Supabase에 직접 업로드할 수 있는 서명된 URL 발급
// (Vercel 서버 함수 본문 크기 제한 우회 — 대용량 파일용)
const ALLOWED_BUCKETS = ['site-audio', 'planet-sounds', 'planet-videos', 'planet-textures', 'camera-backgrounds']

export async function POST(request: Request) {
  const { bucket, path } = await request.json()

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 403 })
  }
  if (typeof path !== 'string' || path.includes('..') || !/^[\w./-]+$/.test(path)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ token: data.token, path: data.path, publicUrl })
}
