'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  file: File
  aspect?: number          // 가로/세로 비율 (텍스처 기본 2:1)
  onConfirm: (file: File) => void
  onCancel: () => void
}

const VIEW_W = 520

export default function ImageCropper({ file, aspect = 2, onConfirm, onCancel }: Props) {
  const VIEW_H = Math.round(VIEW_W / aspect)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [ready, setReady] = useState(false)

  // 이미지 좌상단 위치(뷰포트 좌표)
  const posRef = useRef({ x: 0, y: 0 })
  const baseScaleRef = useRef(1)
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const drawScale = () => baseScaleRef.current * zoom

  const clamp = useCallback((x: number, y: number) => {
    const img = imgRef.current!
    const dw = img.naturalWidth * drawScale()
    const dh = img.naturalHeight * drawScale()
    const minX = VIEW_W - dw, minY = VIEW_H - dh
    return {
      x: Math.min(0, Math.max(minX, x)),
      y: Math.min(0, Math.max(minY, y)),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, VIEW_H])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, VIEW_W, VIEW_H)
    ctx.fillStyle = '#0a0a12'
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    const dw = img.naturalWidth * drawScale()
    const dh = img.naturalHeight * drawScale()
    ctx.drawImage(img, posRef.current.x, posRef.current.y, dw, dh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, VIEW_H])

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const base = Math.max(VIEW_W / img.naturalWidth, VIEW_H / img.naturalHeight)
      baseScaleRef.current = base
      const dw = img.naturalWidth * base
      const dh = img.naturalHeight * base
      posRef.current = { x: (VIEW_W - dw) / 2, y: (VIEW_H - dh) / 2 }
      setReady(true)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  // zoom 변경 시 중심 유지하며 재클램프
  useEffect(() => {
    if (!ready) return
    // 뷰포트 중심이 가리키던 지점을 유지
    const c = posRef.current
    const clamped = clamp(c.x, c.y)
    posRef.current = clamped
    draw()
  }, [zoom, ready, clamp, draw])

  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { x: e.clientX, y: e.clientY, ox: posRef.current.x, oy: posRef.current.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    posRef.current = clamp(dragRef.current.ox + dx, dragRef.current.oy + dy)
    draw()
  }
  function onPointerUp() { dragRef.current = null }

  function handleConfirm() {
    const img = imgRef.current
    if (!img) return
    const outW = Math.min(2048, Math.round(img.naturalWidth))
    const outW2 = Math.max(outW, 1024)
    const outH = Math.round(outW2 / aspect)
    const ratio = outW2 / VIEW_W
    const out = document.createElement('canvas')
    out.width = outW2
    out.height = outH
    const ctx = out.getContext('2d')!
    const dw = img.naturalWidth * drawScale() * ratio
    const dh = img.naturalHeight * drawScale() * ratio
    ctx.drawImage(img, posRef.current.x * ratio, posRef.current.y * ratio, dw, dh)
    out.toBlob((blob) => {
      if (!blob) return
      const cropped = new File([blob], (file.name.replace(/\.[^.]+$/, '') || 'texture') + '.jpg', { type: 'image/jpeg' })
      onConfirm(cropped)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={onCancel}>
      <div className="glass-panel p-6 max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xs tracking-[0.3em] text-space-blue uppercase mb-1">Crop Texture</h3>
        <p className="text-xs text-space-muted mb-4">드래그로 위치 이동, 슬라이더로 확대 · {aspect}:1 비율로 잘립니다</p>

        <div
          className="relative mx-auto rounded-xl overflow-hidden border border-space-border touch-none cursor-move"
          style={{ width: VIEW_W, height: VIEW_H, maxWidth: '100%' }}
        >
          <canvas
            ref={canvasRef}
            width={VIEW_W}
            height={VIEW_H}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className="block w-full h-full"
          />
          {/* 격자 가이드 */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/10" />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <span className="text-xs text-space-muted">확대</span>
          <input
            type="range" min={1} max={4} step={0.01}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-space-blue"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={onCancel} className="btn-ghost text-sm">취소</button>
          <button onClick={handleConfirm} className="btn-primary text-sm">크롭 적용</button>
        </div>
      </div>
    </div>
  )
}
