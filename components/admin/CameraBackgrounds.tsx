'use client'

import { useEffect, useRef, useState } from 'react'
import { uploadViaSignedUrl } from '@/lib/upload'

interface Background {
  id: string
  image_url: string
}

export default function CameraBackgrounds() {
  const [items, setItems] = useState<Background[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function load() {
    fetch('/api/admin/camera-backgrounds')
      .then(r => r.json())
      .then(d => setItems(d.backgrounds ?? []))
      .catch(() => {})
  }

  useEffect(() => { load() }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setLoading(true); setMsg('')
    try {
      for (const file of files) {
        if (file.size > 15 * 1024 * 1024) throw new Error('최대 15MB')
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
        const path = `bg_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${ext}`
        const publicUrl = await uploadViaSignedUrl('camera-backgrounds', path, file)
        const res = await fetch('/api/admin/camera-backgrounds', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: publicUrl, path }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
      }
      setMsg(`${files.length}장 업로드 완료!`)
      if (inputRef.current) inputRef.current.value = ''
      load()
    } catch (e: any) {
      setMsg(`오류: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 사진을 삭제할까요?')) return
    await fetch(`/api/admin/camera-backgrounds/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="font-mono text-xs tracking-widest text-space-muted uppercase mb-2">
        Camera Backgrounds
      </h2>
      <p className="text-xs text-space-muted/70 mb-5">
        카메라 촬영 결과 배경으로 랜덤 사용되는 우주 사진 · 최대 15MB · JPEG/PNG/WEBP · 여러 장 선택 가능
      </p>

      <div className="flex items-center gap-3 mb-5">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          disabled={loading}
          className="text-sm text-space-muted
            file:mr-3 file:py-2 file:px-4 file:rounded-lg
            file:border file:border-space-border file:bg-transparent
            file:text-space-text file:text-xs file:cursor-pointer
            hover:file:border-space-blue/40"
        />
        {loading && <span className="text-xs text-space-muted">업로드 중...</span>}
      </div>

      {msg && (
        <p className={`mb-4 text-xs ${msg.startsWith('오류') ? 'text-space-danger' : 'text-space-success'}`}>
          {msg}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-xs text-space-muted/50">등록된 사진이 없습니다. (없으면 자동 생성 우주 배경 사용)</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {items.map(item => (
            <div key={item.id} className="relative group aspect-video rounded-lg overflow-hidden border border-space-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/texture-proxy?url=${encodeURIComponent(item.image_url)}`}
                alt="camera bg"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center
                  bg-black/60 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-space-danger"
                aria-label="삭제"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
