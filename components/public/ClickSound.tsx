'use client'

import { useEffect } from 'react'
import { playClick } from '@/lib/sfx'

// 전역 클릭 사운드 — 모든 클릭에 짧은 틱 재생
export default function ClickSound() {
  useEffect(() => {
    const handler = () => playClick()
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])
  return null
}
