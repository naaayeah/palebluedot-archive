'use client'

import { useEffect, useRef, useState } from 'react'
import { getCtx, createDrone } from '@/lib/sfx'
import { getSoundOn, setSoundOn } from '@/lib/soundState'

// 홈 배경 사운드 토글. 어드민에서 업로드한 파일이 있으면 그 파일을, 없으면 생성 드론을 재생
export default function SoundToggle() {
  const [on, setOn] = useState(false)
  const soundUrlRef = useRef<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stopDroneRef = useRef<(() => void) | null>(null)

  function start() {
    if (soundUrlRef.current) {
      const audio = new Audio(soundUrlRef.current)
      audio.loop = true
      audio.volume = 0.6
      audio.play().catch(() => {})
      audioRef.current = audio
    } else {
      const ctx = getCtx()
      if (ctx) stopDroneRef.current = createDrone(ctx)
    }
  }

  function stop() {
    stopDroneRef.current?.()
    stopDroneRef.current = null
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
  }

  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(d => {
        soundUrlRef.current = d.home_sound_url ?? null
        // 이전 페이지에서 켜둔 상태면 이어서 재생
        if (getSoundOn()) { start(); setOn(true) }
      })
      .catch(() => {})
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle() {
    if (on) {
      stop()
      setOn(false)
      setSoundOn(false)
    } else {
      start()
      setOn(true)
      setSoundOn(true)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={on ? '사운드 끄기' : '사운드 켜기'}
      className="w-11 h-11 rounded-full flex items-center justify-center
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
  )
}
