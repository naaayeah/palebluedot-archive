'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Planet } from '@/lib/types'

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function PlanetsPage() {
  const router = useRouter()
  const [planets, setPlanets] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // 새 행성 추가 상태
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newId, setNewId] = useState('')
  const [newSubtitle, setNewSubtitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => {
    fetch('/api/admin/planets')
      .then(r => r.json())
      .then(d => setPlanets(d.planets ?? []))
      .finally(() => setLoading(false))
  }, [])

  function onNameChange(val: string) {
    setNewName(val)
    setNewId(slugify(val))
    setAddError('')
  }

  async function createPlanet(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newId.trim()) return
    setAdding(true)
    setAddError('')

    const res = await fetch('/api/admin/planets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newId.trim(),
        name: newName.trim(),
        subtitle: newSubtitle.trim() || null,
        is_visible: true,
      }),
    })

    if (res.ok) {
      const { planet } = await res.json()
      // 편집 페이지로 바로 이동
      router.push(`/admin/planets/${planet.id}`)
    } else {
      const { error } = await res.json()
      setAddError(error || '생성 실패')
      setAdding(false)
    }
  }

  async function toggleVisibility(id: string, current: boolean) {
    setTogglingId(id)
    const res = await fetch(`/api/admin/planets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !current }),
    })
    if (res.ok) setPlanets(prev => prev.map(p => p.id === id ? { ...p, is_visible: !current } : p))
    setTogglingId(null)
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.3em] text-space-blue uppercase mb-2">Content Management</p>
          <h1 className="text-3xl text-space-text" style={{ fontFamily: '"Times New Roman", Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}>
            Planets
          </h1>
          <p className="mt-1 text-sm text-space-muted">{planets.length}개 행성</p>
        </div>
        <button
          onClick={() => { setShowAdd(v => !v); setAddError('') }}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          New Planet
        </button>
      </div>

      {/* 새 행성 추가 폼 */}
      {showAdd && (
        <form onSubmit={createPlanet} className="glass-panel p-6 mb-6 space-y-4">
          <h2 className="text-xs tracking-[0.3em] text-space-blue uppercase">New Planet</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">행성 이름 *</label>
              <input
                type="text"
                value={newName}
                onChange={e => onNameChange(e.target.value)}
                placeholder="예: Kepler-452b"
                className="input-field"
                autoFocus
              />
            </div>
            <div>
              <label className="label">ID (URL slug) *</label>
              <input
                type="text"
                value={newId}
                onChange={e => { setNewId(e.target.value); setAddError('') }}
                placeholder="예: kepler-452b"
                className="input-field"
              />
              <p className="mt-1 text-xs text-space-muted">/planets/<span className="text-space-blue">{newId || '...'}</span></p>
            </div>
          </div>

          <div>
            <label className="label">부제 (선택)</label>
            <input
              type="text"
              value={newSubtitle}
              onChange={e => setNewSubtitle(e.target.value)}
              placeholder="예: The Earth's Twin"
              className="input-field"
            />
          </div>

          {addError && (
            <p className="text-xs text-space-danger">{addError}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={adding || !newName.trim() || !newId.trim()} className="btn-primary">
              {adding ? '생성 중...' : '생성 후 편집하기 →'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setNewName(''); setNewId(''); setNewSubtitle('') }}
              className="btn-ghost text-sm"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 행성 목록 */}
      {loading ? (
        <div className="text-center text-space-muted text-sm py-20">로딩 중...</div>
      ) : planets.length === 0 ? (
        <div className="text-center text-space-muted text-sm py-20">행성이 없습니다. 추가해보세요!</div>
      ) : (
        <div className="space-y-3">
          {planets.map(planet => (
            <div key={planet.id} className="glass-panel p-5 flex items-center gap-4">
              {/* 텍스처 썸네일 or 상태 도트 */}
              <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden border border-space-border flex items-center justify-center bg-space-surface">
                {planet.texture_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={planet.texture_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className={`w-3 h-3 rounded-full ${planet.is_visible ? 'bg-space-success' : 'bg-space-muted/50'}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-space-text font-semibold">{planet.name}</p>
                <p className="text-space-muted text-xs mt-0.5">{planet.subtitle || <span className="italic opacity-50">부제 없음</span>}</p>
              </div>

              <span className="font-mono text-xs text-space-muted hidden sm:block">{planet.id}</span>

              {planet.is_visible ? (
                <span className="badge-visible">공개</span>
              ) : (
                <span className="badge-hidden">비공개</span>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleVisibility(planet.id, planet.is_visible)}
                  disabled={togglingId === planet.id}
                  className={planet.is_visible ? 'btn-warning text-xs py-1.5 px-3' : 'btn-success text-xs py-1.5 px-3'}
                >
                  {togglingId === planet.id ? '...' : planet.is_visible ? '비공개' : '공개'}
                </button>
                <Link href={`/admin/planets/${planet.id}`} className="btn-ghost text-xs py-1.5 px-3">
                  편집
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
