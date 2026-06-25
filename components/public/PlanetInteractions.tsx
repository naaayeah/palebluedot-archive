'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { PlanetMessage, PlanetPhoto } from '@/lib/types'

interface Props {
  planetId: string
  questionPrompt: string | null
  initialMessages: PlanetMessage[]
  initialPhotos: PlanetPhoto[]
}

export default function PlanetInteractions({ planetId, questionPrompt, initialMessages, initialPhotos }: Props) {
  const [messages, setMessages] = useState<PlanetMessage[]>(initialMessages)
  const [photos] = useState<PlanetPhoto[]>(initialPhotos)
  const [msgText, setMsgText] = useState('')
  const [msgLoading, setMsgLoading] = useState(false)
  const [msgSuccess, setMsgSuccess] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/public/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: `/planets/${planetId}` }),
    }).catch(() => {})
  }, [planetId])

  async function submitMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!msgText.trim()) return
    setMsgLoading(true)
    try {
      const res = await fetch('/api/public/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planet_id: planetId, content: msgText.trim() }),
      })
      if (res.ok) {
        const { message } = await res.json()
        setMessages((prev) => [message, ...prev])
        setMsgText('')
        setMsgSuccess(true)
        setTimeout(() => setMsgSuccess(false), 3000)
      }
    } finally {
      setMsgLoading(false)
    }
  }

  return (
    <div className="space-y-16">
      {/* Message section */}
      <section>
        <h2 className="font-mono text-xs tracking-[0.3em] text-space-blue uppercase mb-6">
          Transmissions
        </h2>

        {questionPrompt && (
          <blockquote className="glass-panel p-6 mb-8 border-l-2 border-l-space-blue/40">
            <p className="text-space-text/90 italic leading-relaxed">{questionPrompt}</p>
          </blockquote>
        )}

        <form onSubmit={submitMessage} className="mb-10">
          <textarea
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            placeholder="Write your message to the void..."
            maxLength={500}
            rows={4}
            className="input-field resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-space-muted">{msgText.length}/500</span>
            <button type="submit" disabled={msgLoading || !msgText.trim()} className="btn-primary">
              {msgLoading ? 'Transmitting...' : 'Transmit'}
            </button>
          </div>
          {msgSuccess && (
            <p className="mt-2 text-xs font-mono text-space-success">Message transmitted successfully.</p>
          )}
        </form>

        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="glass-panel p-5">
                <p className="text-space-text/85 leading-relaxed">{msg.content}</p>
                <p className="mt-3 text-xs font-mono text-space-muted">
                  {new Date(msg.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-space-muted font-mono text-sm text-center py-8">
            No transmissions yet. Be the first.
          </p>
        )}
      </section>

      {/* Photo section */}
      <section>
        <h2 className="font-mono text-xs tracking-[0.3em] text-space-blue uppercase mb-6">
          Photographs
        </h2>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo.image_url)}
                className="relative aspect-square overflow-hidden rounded-lg border border-space-border
                           hover:border-space-blue/40 transition-colors duration-200 group"
              >
                <Image
                  src={photo.image_url}
                  alt="Planetary photograph"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-space-muted font-mono text-sm text-center py-8">
            No photographs submitted yet.
          </p>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-full w-full h-full">
            <Image
              src={lightbox}
              alt="Full size photograph"
              fill
              className="object-contain"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white font-mono text-sm"
            onClick={() => setLightbox(null)}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  )
}
