'use client'

// 공용 Web Audio 효과음 모듈 (음원 파일 불필요)

let ctx: AudioContext | null = null

export function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// 짧은 클릭 틱
export function playClick() {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  g.gain.setValueAtTime(0.0001, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.08)
  osc.connect(g)
  g.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + 0.09)
}

// 카운트다운 비프
export function playBeep(freq = 660) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.12, c.currentTime + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18)
  osc.connect(g)
  g.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + 0.2)
}

// 셔터음
export function playShutter() {
  const c = getCtx()
  if (!c) return
  // 노이즈 버스트
  const dur = 0.12
  const buffer = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
  }
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 3000
  const g = c.createGain()
  g.gain.value = 0.5
  noise.connect(bp)
  bp.connect(g)
  g.connect(c.destination)
  noise.start()

  // 찰칵 클릭
  const osc = c.createOscillator()
  const og = c.createGain()
  osc.frequency.value = 1500
  og.gain.setValueAtTime(0.0001, c.currentTime)
  og.gain.exponentialRampToValueAtTime(0.15, c.currentTime + 0.004)
  og.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.05)
  osc.connect(og)
  og.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + 0.06)
}

// 우주 앰비언트 드론 생성 → stop 함수 반환
export function createDrone(c: AudioContext) {
  const master = c.createGain()
  master.gain.value = 0
  master.connect(c.destination)

  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 600
  filter.Q.value = 0.6
  filter.connect(master)

  const freqs = [55, 82.5, 110, 164.8]
  const oscs: OscillatorNode[] = []
  freqs.forEach((f, i) => {
    const osc = c.createOscillator()
    osc.type = i % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.value = f
    osc.detune.value = (i - 1.5) * 6
    const g = c.createGain()
    g.gain.value = 0.18 / freqs.length
    osc.connect(g)
    g.connect(filter)
    osc.start()
    oscs.push(osc)
  })

  const lfo = c.createOscillator()
  lfo.frequency.value = 0.06
  const lfoGain = c.createGain()
  lfoGain.gain.value = 220
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  master.gain.linearRampToValueAtTime(0.5, c.currentTime + 2)

  return () => {
    try {
      master.gain.cancelScheduledValues(c.currentTime)
      master.gain.linearRampToValueAtTime(0, c.currentTime + 0.6)
      setTimeout(() => {
        oscs.forEach(o => { try { o.stop() } catch {} })
        try { lfo.stop() } catch {}
      }, 700)
    } catch {}
  }
}
