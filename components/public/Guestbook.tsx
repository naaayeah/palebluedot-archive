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

  useEffect(() => {
    Promise.all([
      fetch('/api/public/guestbook').then(r => r.json()),
      fetch('/api/public/selfie').then(r => r.json()),
    ]).then(([g, s]) => {
      setMessages(g.messages ?? [])
      setSelfies(s.selfies ?? [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] text-space-blue uppercase mb-3">Archive Records</p>
        <h2
          className="text-4xl text-space-text"
          style={{ fontFamily: '"Times New Roman", Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}
        >
          방명록
        </h2>
        <p className="text-sm text-space-muted mt-2">우주를 다녀간 이들의 흔적</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {selfies.map(s => (
              <div key={s.id} className="aspect-square rounded-xl overflow-hidden border border-space-border bg-space-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image_url}
                  alt="visitor"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
