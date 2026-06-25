import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createAnonClient } from '@/lib/supabase-server'
import SpaceBackdrop from '@/components/public/SpaceBackdrop'
import type { Planet } from '@/lib/types'

const CameraCapture = dynamic(() => import('@/components/public/CameraCapture'), { ssr: false })

async function getData() {
  const supabase = createAnonClient()
  const [{ data: planets }, { data: backgrounds }] = await Promise.all([
    supabase.from('planets').select('*').eq('is_visible', true).order('created_at', { ascending: true }),
    supabase.from('camera_backgrounds').select('image_url').order('created_at', { ascending: false }),
  ])
  return {
    planets: (planets as Planet[]) ?? [],
    spaceImages: (backgrounds ?? []).map((b: { image_url: string }) => b.image_url),
  }
}

export const revalidate = 60

export default async function CameraPage() {
  const { planets, spaceImages } = await getData()

  return (
    <main className="relative w-screen h-screen overflow-hidden flex items-center justify-center p-4">
      <SpaceBackdrop planets={planets} />

      {/* 팝업형 글래스 패널 */}
      <div className="relative z-10 w-full max-w-5xl max-h-[94vh] rounded-3xl overflow-hidden
        bg-white/[0.06] backdrop-blur-2xl border border-white/15 shadow-2xl">
        <div className="max-h-[94vh] overflow-y-auto px-6 md:px-10 py-8">
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
