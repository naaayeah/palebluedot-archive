'use client'

import { useEffect, useRef, useState } from 'react'
import { getCtx, createDrone } from '@/lib/sfx'

interface Props {
  bgVideoUrl: string | null
  soundUrl: string | null
  homeSoundUrl: string | null
}

// 행성 배경 영상 + 사운드 토글
// 사운드 우선순위: 행성 사운드 → 배경영상 사운드 → 홈 사운드 → 생성 드론
export default function PlanetMedia({ bgVideoUrl, soundUrl, homeSoundUrl }: Props) {
  const [on, setOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stopDroneRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      stopDroneRef.current?.()
      audioRef.current?.pause()
    }
  }, [])

  function stopAll() {
    stopDroneRef.current?.()
    stopDroneRef.current = null
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (videoRef.current) videoRef.current.muted = true
  }

  function startAudio() {
    if (soundUrl) {
      const a = new Audio(soundUrl)
      a.loop = true; a.volume = 0.6; a.play().catch(() => {})
      audioRef.current = a
    } else if (bgVideoUrl && videoRef.current) {
      videoRef.current.muted = false
      videoRef.current.play().catch(() => {})
    } else if (homeSoundUrl) {
      const a = new Audio(homeSoundUrl)
      a.loop = true; a.volume = 0.6; a.play().catch(() => {})
      audioRef.current = a
    } else {
      const ctx = getCtx()
      if (ctx) stopDroneRef.current = createDrone(ctx)
    }
  }

  function toggle() {
    if (on) { stopAll(); setOn(false) }
    else { startAudio(); setOn(true) }
  }

  return (
    <>
      {bgVideoUrl && (
        <>
          <video
            ref={videoRef}
            autoPlay loop muted playsInline
            className="fixed inset-0 w-full h-full object-cover z-0"
            src={bgVideoUrl}
          />
          <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </>
      )}

      {/* 사운드 토글 */}
      <button
        onClick={toggle}
        aria-label={on ? '사운드 끄기' : '사운드 켜기'}
        className="fixed top-6 right-6 z-30 w-11 h-11 rounded-full flex items-center justify-center
          bg-white/5 hover:bg-white/10 backdrop-blur-md
          border border-white/15 hover:border-space-blue/50
          text-white/80 hover:text-white transition-all"
      >
        {on ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4z" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </svg>
        )}
      </button>
    </>
  )
}
