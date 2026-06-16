'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

export default function StarField({ count = 200 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current

    // Use a seeded sequence for deterministic positions
    const stars: Star[] = Array.from({ length: count }, (_, i) => ({
      x: ((i * 1618033) % 10000) / 100,
      y: ((i * 1144729) % 10000) / 100,
      size: (((i * 314159) % 100) / 100) * 1.8 + 0.4,
      opacity: (((i * 271828) % 100) / 100) * 0.7 + 0.3,
      duration: (((i * 161803) % 100) / 100) * 4 + 2,
      delay: -((i * 314159) % 6000) / 1000,
    }))

    el.innerHTML = stars
      .map(
        (s) =>
          `<span class="star" style="
            left:${s.x}%;
            top:${s.y}%;
            width:${s.size}px;
            height:${s.size}px;
            --max-opacity:${s.opacity};
            --duration:${s.duration}s;
            --delay:${s.delay}s;
          "></span>`
      )
      .join('')
  }, [count])

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  )
}
