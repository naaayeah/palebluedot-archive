'use client'

// 페이지 간 사운드 on/off 의도를 공유 (localStorage)
const KEY = 'pbd_sound_on'

export function getSoundOn(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setSoundOn(on: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, on ? '1' : '0')
  } catch {}
}
