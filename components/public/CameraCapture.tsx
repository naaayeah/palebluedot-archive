'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { playBeep, playShutter } from '@/lib/sfx'

type Stage = 'idle' | 'preview' | 'countdown' | 'result'

// 방문자 셀카를 찍고 우주 이미지+화살표를 보여주는 컴포넌트
export default function CameraCapture({ spaceImages = [] }: { spaceImages?: string[] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resultCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [stage, setStage] = useState<Stage>('idle')
  const [countdown, setCountdown] = useState(3)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  // 비디오 요소가 DOM에 렌더된 뒤 스트림 연결 (idle 상태엔 video가 없음)
  useEffect(() => {
    if ((stage === 'preview' || stage === 'countdown') && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [stage])

  async function startCamera() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setStage('preview') // video 요소 렌더 → useEffect에서 스트림 연결
    } catch {
      setError('카메라 접근 권한이 필요합니다.')
    }
  }

  function startCountdown() {
    setStage('countdown')
    setCountdown(3)
    playBeep(660)
    let c = 3
    const iv = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) {
        clearInterval(iv)
        playShutter()
        capture()
      } else {
        playBeep(c === 1 ? 990 : 660)
      }
    }, 1000)
  }

  async function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    stopCamera()
    setUploading(true)

    // 실제 사진 업로드
    canvas.toBlob(async (blob) => {
      if (blob) {
        const fd = new FormData()
        fd.append('file', blob, 'selfie.jpg')
        await fetch('/api/public/selfie', { method: 'POST', body: fd }).catch(() => {})
      }

      // 결과 화면 먼저 보여주고, 캔버스가 DOM에 그려진 뒤 그리기
      setStage('result')
      setUploading(false)
      requestAnimationFrame(() => { drawSpaceResult() })
    }, 'image/jpeg', 0.9)
  }

  function loadImg(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      // CORS 우회 프록시 경유
      img.src = `/api/texture-proxy?url=${encodeURIComponent(url)}`
    })
  }

  // 화살표 + "YOU ARE HERE" 를 캔버스 임의 위치에 그림
  function drawArrowAndLabel(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const ax = W * (0.2 + Math.random() * 0.6)
    const ay = H * (0.2 + Math.random() * 0.6)
    const arrowLen = 130 + Math.random() * 80
    const arrowAngle = Math.random() * Math.PI * 2
    const tx = ax + Math.cos(arrowAngle) * arrowLen
    const ty = ay + Math.sin(arrowAngle) * arrowLen

    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 8
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(tx, ty)
    ctx.stroke()

    const headLen = 20
    const headAngle = 0.4
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax + Math.cos(arrowAngle + headAngle) * headLen, ay + Math.sin(arrowAngle + headAngle) * headLen)
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax + Math.cos(arrowAngle - headAngle) * headLen, ay + Math.sin(arrowAngle - headAngle) * headLen)
    ctx.stroke()

    ctx.font = 'bold 30px Arial, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.98)'
    ;(ctx as any).letterSpacing = '4px'
    const label = 'YOU ARE HERE.'
    const textW = ctx.measureText(label).width
    const lx = tx + Math.cos(arrowAngle) * 30
    const ly = ty + Math.sin(arrowAngle) * 30
    const finalX = Math.max(textW / 2 + 24, Math.min(W - textW / 2 - 24, lx))
    const finalY = Math.max(46, Math.min(H - 24, ly))
    ctx.fillText(label, finalX - textW / 2, finalY)
    ctx.shadowBlur = 0
  }

  async function drawSpaceResult() {
    const canvas = resultCanvasRef.current
    if (!canvas) return
    const W = canvas.width = 1600
    const H = canvas.height = 1000
    const ctx = canvas.getContext('2d')!

    // 등록된 우주 이미지가 있으면 랜덤 선택해서 배경으로
    let img: HTMLImageElement | null = null
    if (spaceImages.length > 0) {
      const url = spaceImages[Math.floor(Math.random() * spaceImages.length)]
      img = await loadImg(url)
    }

    if (img) {
      // cover-fit
      const scale = Math.max(W / img.width, H / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
      // 가독성 위해 살짝 어둡게
      ctx.fillStyle = 'rgba(0,0,10,0.25)'
      ctx.fillRect(0, 0, W, H)
      drawArrowAndLabel(ctx, W, H)
      return
    }

    // 이미지 없으면 생성 우주 배경
    drawGeneratedSpace(ctx, W, H)
  }

  function drawGeneratedSpace(ctx: CanvasRenderingContext2D, W: number, H: number) {
    // 배경: 칠흑 우주
    ctx.fillStyle = '#000005'
    ctx.fillRect(0, 0, W, H)

    // 별 뿌리기
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      const r = Math.random() * 2.6
      const op = 0.4 + Math.random() * 0.6
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${op})`
      ctx.fill()
    }

    // 은하 글로우 (중심)
    const cx = W * (0.3 + Math.random() * 0.4)
    const cy = H * (0.3 + Math.random() * 0.4)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 320)
    grad.addColorStop(0, 'rgba(180,160,255,0.22)')
    grad.addColorStop(0.3, 'rgba(120,100,200,0.12)')
    grad.addColorStop(0.7, 'rgba(60,80,160,0.06)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(cx, cy, 320, 160, Math.PI * 0.3, 0, Math.PI * 2)
    ctx.fill()

    // 은하 코어
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60)
    core.addColorStop(0, 'rgba(255,240,200,0.5)')
    core.addColorStop(0.5, 'rgba(200,180,255,0.2)')
    core.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.ellipse(cx, cy, 60, 28, Math.PI * 0.3, 0, Math.PI * 2)
    ctx.fill()

    drawArrowAndLabel(ctx, W, H)
  }

  function reset() {
    setStage('idle')
    setError('')
  }

  return (
    <div className="w-full">
      {/* idle */}
      {stage === 'idle' && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] text-space-blue uppercase mb-3">Space Camera</p>
            <h2
              className="text-4xl text-space-text mb-3"
              style={{ fontFamily: '"Times New Roman", Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}
            >
              You Are Here
            </h2>
            <p className="text-sm text-space-muted max-w-sm mx-auto leading-relaxed">
              우주에서 당신을 찾아 사진을 찍어드립니다
            </p>
          </div>
          {error && <p className="text-space-danger text-xs">{error}</p>}
          <button onClick={startCamera} className="btn-primary px-8 py-3">
            촬영 시작
          </button>
        </div>
      )}

      {/* camera preview */}
      {(stage === 'preview' || stage === 'countdown') && (
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-space-border bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {stage === 'countdown' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span
                  className="text-[10rem] text-white font-bold"
                  style={{ fontFamily: '"Times New Roman", Georgia, serif', fontStyle: 'italic' }}
                >
                  {countdown}
                </span>
              </div>
            )}
            {/* 뷰파인더 코너 */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-space-blue/60" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-space-blue/60" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-space-blue/60" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-space-blue/60" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          {stage === 'preview' && (
            <div className="flex gap-3">
              <button onClick={startCountdown} className="btn-primary px-8 py-3">
                촬영
              </button>
              <button onClick={() => { stopCamera(); reset() }} className="btn-ghost text-sm px-5">
                취소
              </button>
            </div>
          )}
          {stage === 'countdown' && (
            <p className="text-xs text-space-muted tracking-[0.2em]">잠시 후 촬영됩니다...</p>
          )}
        </div>
      )}

      {/* uploading */}
      {uploading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-space-blue animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <p className="text-xs text-space-muted tracking-[0.2em]">우주에서 수신 중...</p>
        </div>
      )}

      {/* result */}
      {stage === 'result' && !uploading && (
        <div className="flex flex-col items-center gap-5">
          <div className="text-center mb-2">
            <p className="text-xs tracking-[0.3em] text-space-blue uppercase mb-2">Transmission Received</p>
            <p className="text-sm text-space-muted">우주에서 당신을 발견했습니다.</p>
          </div>
          <div className="w-full rounded-2xl overflow-hidden border border-space-border">
            <canvas
              ref={resultCanvasRef}
              className="w-full"
            />
          </div>
          <p className="text-xs text-space-muted/60 text-center">
            실제 촬영된 사진은 게스트 아카이브에서 확인할 수 있어요
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/guestbook" className="btn-primary px-6 py-3">
              게스트 아카이브로 이동 →
            </Link>
            <button onClick={reset} className="btn-ghost text-sm px-6">
              다시 찍기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
