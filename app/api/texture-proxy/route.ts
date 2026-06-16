import { NextResponse } from 'next/server'

const ALLOWED_HOST = 'sbvptizfcyvcsrkzpcmz.supabase.co'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) return new NextResponse('Missing url', { status: 400 })

  // Supabase 스토리지 URL만 허용
  try {
    const parsed = new URL(url)
    if (parsed.hostname !== ALLOWED_HOST) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  const res = await fetch(url, { cache: 'force-cache' })
  if (!res.ok) return new NextResponse('Not found', { status: 404 })

  const data = await res.arrayBuffer()
  return new NextResponse(data, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
