import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createAnonClient } from '@/lib/supabase-server'
import SpaceBackdrop from '@/components/public/SpaceBackdrop'
import type { Planet } from '@/lib/types'

const CameraCapture = dynamic(() => import('@/components/public/CameraCapture'), { ssr: false })

async function getPlanets(): Promise<Planet[]> {
  const supabase = createAnonClient()
  const { data } = await supabase
    .from('planets')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: true })
  return (data as Planet[]) ?? []
}

export const revalidate = 60

export default async function CameraPage() {
  const planets = await getPlanets()
  // 업로드된 우주 이미지(행성 텍스처)들을 결과 이미지 후보로 사용
  const spaceImages = planets
    .map(p => p.texture_url)
    .filter((u): u is string => !!u)

  return (
    <main className="relative w-screen h-screen overflow-hidden flex items-center justify-center p-4">
      <SpaceBackdrop planets={planets} />

      {/* 팝업형 글래스 패널 */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden
        bg-white/[0.06] backdrop-blur-2xl border border-white/15 shadow-2xl">
        <div className="max-h-[90vh] overflow-y-auto px-6 md:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-space-blue transition-colors mb-5"
          >
            ← Archive Index
          </Link>
          <CameraCapture spaceImages={spaceImages} />
        </div>
      </div>
    </main>
  )
}
