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

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <SpaceBackdrop planets={planets} />

      {/* 글래스 패널 — 홈 위에 떠오르듯 */}
      <div className="fixed inset-3 md:inset-6 z-10 rounded-3xl overflow-hidden
        bg-white/[0.06] backdrop-blur-2xl border border-white/15 shadow-2xl">
        <div className="h-full overflow-y-auto px-6 md:px-12 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-space-blue transition-colors mb-8"
          >
            ← Archive Index
          </Link>
          <CameraCapture />
        </div>
      </div>
    </main>
  )
}
