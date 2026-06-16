import { NextResponse } from 'next/server'
import { validatePassword, createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!validatePassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await createSessionToken()
  const response = NextResponse.json({ ok: true })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
