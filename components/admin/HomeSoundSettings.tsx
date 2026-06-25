'use client'

import { useEffect, useRef, useState } from 'react'
import { uploadViaSignedUrl } from '@/lib/upload'

export default function HomeSoundSettings() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/settings/sound')
      .then(r => r.json())
      .then(d => setCurrentUrl(d.home_sound_url ?? null))
      .catch(() => {})
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setMsg('')
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function handleUpload() {
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { setMsg('오류: 최대 50MB'); return }
    setLoading(true); setMsg('')
    try {
      const ext = file.name.split('.').pop() || 'mp3'
      const path = `home_${Date.now()}.${ext}`
      // 브라우저 → Supabase 직접 업로드 (서버 본문 제한 우회)
      const publicUrl = await uploadViaSignedUrl('site-audio', path, file)
      const url = `${publicUrl}?v=${Date.now()}`
      // URL만 서버에 저장
      const res = await fetch('/api/admin/settings/sound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, path }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCurrentUrl(data.home_sound_url)
      setMsg('업로드 완료!')
      setFile(null); setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (e: any) {
      setMsg(`오류: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('홈 사운드를 삭제할까요? (기본 생성 사운드로 돌아갑니다)')) return
    setLoading(true)
    await fetch('/api/admin/settings/sound', { method: 'DELETE' })
    setCurrentUrl(null)
    setMsg('삭제됨')
    setLoading(false)
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="font-mono text-xs tracking-widest text-space-muted uppercase mb-2">
        Home Background Sound
      </h2>
      <p className="text-xs text-space-muted/70 mb-5">
        홈 우측 상단 사운드 버튼으로 재생되는 배경 음악 · 최대 50MB · MP3/WAV/OGG/MP4(M4A) · 미등록 시 기본 생성 사운드 재생
      </p>

      <div className="flex items-center gap-4 mb-5">
        <div>
          <p className="label mb-2">현재</p>
          {currentUrl ? (
            <audio src={currentUrl} controls className="w-64 h-10" />
          ) : (
            <div className="w-64 h-10 rounded-lg border border-space-border bg-space-surface flex items-center px-3">
              <span className="text-xs text-space-muted/50">기본 생성 사운드</span>
            </div>
          )}
        </div>
        {preview && (
          <div>
            <p className="label mb-2">미리듣기</p>
            <audio src={preview} controls className="w-64 h-10" />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,video/mp4"
          onChange={onFileChange}
          className="text-sm text-space-muted
            file:mr-3 file:py-2 file:px-4 file:rounded-lg
            file:border file:border-space-border file:bg-transparent
            file:text-space-text file:text-xs file:cursor-pointer
            hover:file:border-space-blue/40"
        />
        <button onClick={handleUpload} disabled={!file || loading} className="btn-primary text-sm shrink-0">
          {loading ? '업로드 중...' : '홈 사운드 적용'}
        </button>
        {currentUrl && (
          <button onClick={handleDelete} disabled={loading}
            className="text-xs text-space-danger hover:opacity-70 transition-opacity">
            삭제
          </button>
        )}
      </div>

      {msg && (
        <p className={`mt-3 text-xs ${msg.startsWith('오류') ? 'text-space-danger' : 'text-space-success'}`}>
          {msg}
        </p>
      )}
    </div>
  )
}
