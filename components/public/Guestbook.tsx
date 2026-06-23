'use client'

import { useEffect, useState } from 'react'
import type { PlanetMessage, VisitorSelfie } from '@/lib/types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export default function Guestbook() {
  const [messages, setMessages] = useState<PlanetMessage[]>([])
  const [selfies, setSelfies] = useState<VisitorSelfie[]>([])
  const [tab, setTab] = useState<'messages' | 'selfies'>('messages')
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/public/guestbook').then(r => r.json()),
      fetch('/api/public/selfie').then(r => r.json()),
    ]).then(([g, s]) => {
      setMessages(g.messages ?? [])
      setSelfies(s.selfies ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const showPrev = () => setLightbox(i => (i === null ? i : (i - 1 + selfies.length) % selfies.length))
  const showNext = () => setLightbox(i => (i === null ? i : (i + 1) % selfies.length))

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowLeft') showPrev()
      else if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, selfies.length])

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] text-space-blue uppercase mb-3">Archive Records</p>
        <h2
          className="text-5xl text-space-text"
          style={{ fontFamily: '"Times New Roman", Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}
        >
          Guestbook
        </h2>
        <p className="text-sm text-space-muted mt-3">우주를 다녀간 이들의 흔적</p>
      </div>

      {/* 탭 */}
      <div className="flex justify-center gap-1 mb-8">
        {(['messages', 'selfies'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-xs tracking-widest uppercase rounded-full transition-colors ${
              tab === t
                ? 'bg-space-blue/20 text-space-blue border border-space-blue/40'
                : 'text-space-muted hover:text-space-text border border-transparent'
            }`}
          >
            {t === 'messages' ? `메시지 (${messages.length})` : `우주 사진 (${selfies.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-space-blue animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      ) : tab === 'messages' ? (
        messages.length === 0 ? (
          <p className="text-center text-space-muted text-sm py-12">아직 메시지가 없어요.</p>
        ) : (
          <div className="grid gap-3 max-w-2xl mx-auto">
            {messages.map(msg => (
              <div key={msg.id} className="glass-panel px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-space-text text-sm leading-relaxed flex-1">{msg.content}</p>
                  <div className="text-right shrink-0">
                    {msg.planets?.name && (
                      <p className="text-xs text-space-blue mb-0.5">→ {msg.planets.name}</p>
                    )}
                    <p className="text-xs text-space-muted/50">{timeAgo(msg.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        selfies.length === 0 ? (
          <p className="text-center text-space-muted text-sm py-12">아직 촬영된 사진이 없어요.</p>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-3 max-w-4xl mx-auto [column-fill:_balance]">
            {selfies.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setLightbox(idx)}
                className="mb-3 w-full block rounded-xl overflow-hidden border border-space-border bg-space-surface
                  hover:border-space-blue/50 transition-colors break-inside-avoid"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image_url}
                  alt="visitor"
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )
      )}

      {/* 라이트박스 */}
      {lightbox !== null && selfies[lightbox] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          {/* 닫기 */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(null) }}
            aria-label="닫기"
            className="absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center
              bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* 이전 */}
          {selfies.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showPrev() }}
              aria-label="이전"
              className="absolute left-3 md:left-6 w-12 h-12 rounded-full flex items-center justify-center
                bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* 이미지 */}
          <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selfies[lightbox].image_url}
              alt="visitor"
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl"
            />
            <p className="text-xs text-white/50">{lightbox + 1} / {selfies.length} · {timeAgo(selfies[lightbox].created_at)}</p>
          </div>

          {/* 다음 */}
          {selfies.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showNext() }}
              aria-label="다음"
              className="absolute right-3 md:right-6 w-12 h-12 rounded-full flex items-center justify-center
                bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
