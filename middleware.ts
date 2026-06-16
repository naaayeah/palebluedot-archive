import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateSessionToken, COOKIE_NAME } from './lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get(COOKIE_NAME)?.value ?? ''
  const isAuthenticated = await validateSessionToken(token)

  // 로그인 페이지: 이미 인증됐으면 대시보드로
  if (pathname === '/admin') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 로그인 API는 항상 허용
  if (pathname === '/api/admin/auth') {
    return NextResponse.next()
  }

  // 나머지 어드민 라우트는 인증 필요
  if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    if (!isAuthenticated) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path+', '/api/admin/:path*'],
}
