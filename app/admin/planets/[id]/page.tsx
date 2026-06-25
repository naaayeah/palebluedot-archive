'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Planet } from '@/lib/types'
import { uploadViaSignedUrl } from '@/lib/upload'
import ImageCropper from '@/components/admin/ImageCropper'

const TEXT_FIELDS: { key: keyof Planet; label: string; type: 'text' | 'textarea' | 'url' }[] = [
  { key: 'name',            label: 'Planet Name',         type: 'text' },
  { key: 'subtitle',        label: 'Subtitle',            type: 'text' },
  { key: 'description',     label: 'Description',         type: 'textarea' },
  { key: 'distance',        label: 'Distance from Earth', type: 'text' },
  { key: 'question_prompt', label: 'Question Prompt',     type: 'textarea' },
  { key: 'video_url',       label: 'Video Embed URL',     type: 'url' },
]

function UploadSection({
  title,
  desc,
  accept,
  currentUrl,
  previewType,
  uploadLabel,
  cropAspect,
  onUpload,
  onDelete,
}: {
  title: string
  desc: string
  accept: string
  currentUrl: string | null
  previewType: 'image' | 'video' | 'audio'
  uploadLabel: string
  cropAspect?: number
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setMsg('')
    if (f && cropAspect) {
      // 크롭 모달 띄우기 (업로드 파일은 크롭 후 확정)
      setCropSource(f)
      return
    }
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  function onCropConfirm(cropped: File) {
    setFile(cropped)
    setPreview(URL.createObjectURL(cropped))
    setCropSource(null)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setMsg('')
    try {
      await onUpload(file)
      setMsg('업로드 완료!')
      setFile(null)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (e: any) {
      setMsg(`오류: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('삭제할까요?')) return
    setLoading(true)
    await onDelete()
    setMsg('삭제됨')
    setLoading(false)
  }

  return (
    <div className="glass-panel p-6 mb-6">
      <h2 className="text-xs tracking-[0.3em] text-space-blue uppercase mb-2">{title}</h2>
      <p className="text-xs text-space-muted mb-5">{desc}</p>

      <div className="flex items-start gap-5 mb-5">
        {/* 현재 */}
        <div className="shrink-0">
          <p className="label mb-2">현재</p>
          {previewType === 'audio' ? (
            currentUrl ? (
              <audio src={currentUrl} controls className="w-64 h-10" />
            ) : (
              <div className="w-64 h-10 rounded-lg border border-space-border bg-space-surface flex items-center px-3">
                <span className="text-xs text-space-muted/50">없음</span>
              </div>
            )
          ) : (
            <div className="w-28 h-28 rounded-xl overflow-hidden border border-space-border bg-space-surface flex items-center justify-center">
              {currentUrl ? (
                previewType === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/texture-proxy?url=${encodeURIComponent(currentUrl)}`}
                    alt="current"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video src={currentUrl} className="w-full h-full object-cover" muted playsInline />
                )
              ) : (
                <span className="text-xs text-space-muted/50">없음</span>
              )}
            </div>
          )}
          {currentUrl && (
            <button onClick={handleDelete} disabled={loading}
              className="mt-2 text-xs text-space-danger hover:opacity-70 transition-opacity">
              삭제
            </button>
          )}
        </div>

        {/* 미리보기 */}
        {preview && (
          <div className="shrink-0">
            <p className="label mb-2">미리보기</p>
            {previewType === 'audio' ? (
              <audio src={preview} controls className="w-64 h-10" />
            ) : (
              <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-space-blue/40 bg-space-surface">
                {previewType === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={preview} className="w-full h-full object-cover" muted playsInline autoPlay loop />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onFileChange}
          className="text-sm text-space-muted
            file:mr-3 file:py-2 file:px-4 file:rounded-lg
            file:border file:border-space-border file:bg-transparent
            file:text-space-text file:text-xs file:cursor-pointer
            hover:file:border-space-blue/40"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="btn-primary text-sm shrink-0"
        >
          {loading ? '업로드 중...' : uploadLabel}
        </button>
      </div>

      {msg && (
        <p className={`mt-3 text-xs ${msg.startsWith('오류') ? 'text-space-danger' : 'text-space-success'}`}>
          {msg}
        </p>
      )}

      {cropSource && cropAspect && (
        <ImageCropper
          file={cropSource}
          aspect={cropAspect}
          onConfirm={onCropConfirm}
          onCancel={() => { setCropSource(null); if (inputRef.current) inputRef.current.value = '' }}
        />
      )}
    </div>
  )
}

export default function PlanetEditPage() {
  const { id } = useParams<{ id: string }>()
  const [planet, setPlanet] = useState<Planet | null>(null)
  const [form, setForm] = useState<Partial<Planet>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/planets/${id}`)
      .then(r => r.json())
      .then(d => { setPlanet(d.planet); setForm(d.planet ?? {}) })
      .finally(() => setLoading(false))
  }, [id])

  function extOf(file: File, fallback: string) {
    return (file.name.split('.').pop() || fallback).toLowerCase()
  }

  async function uploadTexture(file: File) {
    const path = `${id}/texture_${Date.now()}.${extOf(file, 'jpg')}`
    const publicUrl = await uploadViaSignedUrl('planet-textures', path, file)
    const url = `${publicUrl}?v=${Date.now()}`
    const res = await fetch(`/api/admin/planets/${id}/texture`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, path }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setPlanet(p => p ? { ...p, texture_url: data.texture_url } : p)
  }

  async function deleteTexture() {
    await fetch(`/api/admin/planets/${id}/texture`, { method: 'DELETE' })
    setPlanet(p => p ? { ...p, texture_url: null } : p)
  }

  async function uploadVideo(file: File) {
    const path = `${id}/bg_${Date.now()}.${extOf(file, 'mp4')}`
    const publicUrl = await uploadViaSignedUrl('planet-videos', path, file)
    const res = await fetch(`/api/admin/planets/${id}/video`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: publicUrl, path }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setPlanet(p => p ? { ...p, bg_video_url: data.bg_video_url } : p)
  }

  async function deleteVideo() {
    await fetch(`/api/admin/planets/${id}/video`, { method: 'DELETE' })
    setPlanet(p => p ? { ...p, bg_video_url: null } : p)
  }

  async function uploadSound(file: File) {
    const path = `${id}/sound_${Date.now()}.${extOf(file, 'mp3')}`
    const publicUrl = await uploadViaSignedUrl('planet-sounds', path, file)
    const url = `${publicUrl}?v=${Date.now()}`
    const res = await fetch(`/api/admin/planets/${id}/sound`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, path }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setPlanet(p => p ? { ...p, sound_url: data.sound_url } : p)
  }

  async function deleteSound() {
    await fetch(`/api/admin/planets/${id}/sound`, { method: 'DELETE' })
    setPlanet(p => p ? { ...p, sound_url: null } : p)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    const { id: _id, created_at: _ca, texture_url: _tx, bg_video_url: _bv, sound_url: _sd, ...payload } = form as Planet
    const res = await fetch(`/api/admin/planets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const { planet: updated } = await res.json()
      setPlanet((p) => ({ ...p, ...updated }))
      setForm((f) => ({ ...f, ...updated }))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError('저장 실패')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-space-muted text-sm">로딩 중...</div>
  if (!planet) return <div className="p-8 text-space-danger text-sm">행성을 찾을 수 없습니다.</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/planets" className="text-xs text-space-muted hover:text-space-blue transition-colors">
          ← 행성 목록
        </Link>
        <div className="mt-3">
          <p className="text-xs tracking-[0.3em] text-space-blue uppercase mb-2">Planet Editor</p>
          <h1
            className="text-3xl text-space-text"
            style={{ fontFamily: '"Times New Roman", Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}
          >
            {planet.name}
          </h1>
        </div>
      </div>

      {/* ── 3D 텍스처 ── */}
      <UploadSection
        title="3D Planet Texture"
        desc="구체 표면에 입혀질 텍스처 이미지 (구형 투영 권장) · 최대 10MB · JPEG/PNG/WEBP"
        accept="image/jpeg,image/png,image/webp"
        currentUrl={planet.texture_url}
        previewType="image"
        uploadLabel="3D 텍스처 적용"
        cropAspect={2}
        onUpload={uploadTexture}
        onDelete={deleteTexture}
      />

      {/* ── 배경 영상 ── */}
      <UploadSection
        title="Background Video"
        desc="행성 상세 페이지 전체 화면 배경으로 재생됩니다 · 최대 200MB · MP4/WebM/MOV"
        accept="video/mp4,video/webm,video/quicktime"
        currentUrl={planet.bg_video_url}
        previewType="video"
        uploadLabel="배경 영상 적용"
        onUpload={uploadVideo}
        onDelete={deleteVideo}
      />

      {/* ── 행성 사운드 ── */}
      <UploadSection
        title="Planet Sound"
        desc="행성 입장 시 재생되는 배경 사운드 · 최대 50MB · MP3/WAV/OGG/MP4(M4A). 미등록 시: 배경영상 사운드 → 홈 사운드 순으로 재생"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,video/mp4"
        currentUrl={planet.sound_url}
        previewType="audio"
        uploadLabel="사운드 적용"
        onUpload={uploadSound}
        onDelete={deleteSound}
      />

      {/* ── 텍스트 정보 ── */}
      <form onSubmit={handleSave}>
        <div className="glass-panel p-6 space-y-5 mb-5">
          <h2 className="text-xs tracking-[0.3em] text-space-blue uppercase">Planet Info</h2>

          {TEXT_FIELDS.map(field => (
            <div key={field.key as string}>
              <label className="label">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  rows={field.key === 'description' ? 6 : 3}
                  value={(form[field.key] as string) ?? ''}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="input-field resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  value={(form[field.key] as string) ?? ''}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="input-field"
                />
              )}
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 border-t border-space-border">
            <div>
              <label className="label mb-0">공개 여부</label>
              <p className="text-xs text-space-muted mt-0.5">비공개 시 퍼블릭 사이트에서 숨김</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, is_visible: !f.is_visible }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                form.is_visible ? 'bg-space-blue' : 'bg-space-muted/30'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                form.is_visible ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-space-danger/10 border border-space-danger/30 text-space-danger text-xs mb-4">
            {error}
          </div>
        )}
        {saved && (
          <div className="p-3 rounded-lg bg-space-success/10 border border-space-success/30 text-space-success text-xs mb-4">
            저장되었습니다.
          </div>
        )}

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? '저장 중...' : '저장'}
          </button>
          <Link href="/admin/planets" className="btn-ghost text-sm">취소</Link>
        </div>
      </form>
    </div>
  )
}
