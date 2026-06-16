// Web Crypto API 사용 — Edge Runtime(middleware) + Node.js(API routes) 둘 다 호환

export const COOKIE_NAME = 'pbd_admin_session'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7일

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSessionToken(): Promise<string> {
  return hmacHex('pbd-admin-v1', getSecret())
}

export async function validateSessionToken(token: string): Promise<boolean> {
  if (!token) return false
  try {
    const expected = await createSessionToken()
    if (token.length !== expected.length) return false
    let diff = 0
    for (let i = 0; i < token.length; i++) {
      diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
    }
    return diff === 0
  } catch {
    return false
  }
}

export function validatePassword(input: string): boolean {
  const stored = process.env.ADMIN_PASSWORD
  if (!stored || !input) return false
  if (input.length !== stored.length) return false
  let diff = 0
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ stored.charCodeAt(i)
  }
  return diff === 0
}
