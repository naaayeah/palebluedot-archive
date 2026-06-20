'use client'

import dynamic from 'next/dynamic'
import type { Planet } from '@/lib/types'

const SpaceSimulator = dynamic(() => import('./SpaceSimulator'), { ssr: false })

// 홈 시뮬레이터를 어둡게 깔아주는 배경 (인터랙션 비활성)
export default function SpaceBackdrop({ planets }: { planets: Planet[] }) {
  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none select-none">
      <div className="absolute inset-0">
        <SpaceSimulator planets={planets} showOverlay={false} />
      </div>
      {/* 살짝만 어둡게 — 글래스 패널이 그 위에 올라감 */}
      <div className="absolute inset-0 bg-[#020208]/30" />
    </div>
  )
}
