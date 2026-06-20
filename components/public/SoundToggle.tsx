'use client'

import { useEffect, useRef, useState } from 'react'

// Web Audio API로 우주 앰비언트 드론 사운드 생성 (음원 파일 불필요)
export default function SoundToggle() {
  const [on, setOn] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ master: GainNode; stop: () => void } | null>(null)

  useEffect(() => {
    return () => {
      nodesRef.current?.stop()
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  function buildAmbient(ctx: AudioContext) {
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    // 부드러운 로우패스 필터
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 600
    filter.Q.value = 0.6
    filter.connect(master)

    // 여러 디튠된 오실레이터로 깊은 드론
    const freqs = [55, 82.5, 110, 164.8]
    const oscs: OscillatorNode[] = []
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = f
      osc.detune.value = (i - 1.5) * 6

      const g = ctx.createGain()
      g.gain.value = 0.18 / freqs.length
      osc.connect(g)
      g.connect(filter)
      osc.start()
      oscs.push(osc)
    })

    // 느린 LFO로 필터 흔들기 (살아있는 느낌)
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.06
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 220
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()

    // 페이드 인
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2)

    const stop = () => {
      try {
        master.gain.cancelScheduledValues(ctx.currentTime)
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
        setTimeout(() => {
          oscs.forEach(o => { try { o.stop() } catch {} })
          try { lfo.stop() } catch {}
        }, 700)
      } catch {}
    }

    return { master, stop }
  }

  async function toggle() {
    if (on) {
      nodesRef.current?.stop()
      nodesRef.current = null
      setOn(false)
      return
    }
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') await ctx.resume()
    nodesRef.current = buildAmbient(ctx)
    setOn(true)
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
