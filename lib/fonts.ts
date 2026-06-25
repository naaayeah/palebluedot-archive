import type { CSSProperties } from 'react'

const KOREAN = /[ㄱ-힝]/

// 제목 스타일: 한글이면 Pretendard(bold), 영어면 Times New Roman italic bold
export function titleStyle(text: string | null | undefined): CSSProperties {
  if (text && KOREAN.test(text)) {
    return { fontFamily: 'Pretendard, sans-serif', fontStyle: 'normal', fontWeight: 700 }
  }
  return { fontFamily: '"Times New Roman", Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }
}
