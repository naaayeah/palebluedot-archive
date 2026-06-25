'use client'

import { createClient } from '@/lib/supabase'

// 서명된 URL을 받아 브라우저에서 Supabase로 직접 업로드 → public URL 반환
export async function uploadViaSignedUrl(bucket: string, path: string, file: File): Promise<string> {
  const res = await fetch('/api/admin/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, path }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '업로드 URL 발급 실패')

  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, data.token, file)
  if (error) throw new Error(error.message)

  return data.publicUrl as string
}
