import dynamic from 'next/dynamic'
import { createAnonClient } from '@/lib/supabase-server'
import type { Planet } from '@/lib/types'

const SpaceSimulator = dynamic(
  () => import('@/components/public/SpaceSimulator'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-space-void">
        <p className="text-xs text-space-muted tracking-widest animate-pulse">INITIALIZING SYSTEM</p>
      </div>
    ),
  }
)

const CameraCapture = dynamic(() => import('@/components/public/CameraCapture'), { ssr: false })
const Guestbook = dynamic(() => import('@/components/public/Guestbook'), { ssr: false })

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

export default async function HomePage() {
  const planets = await getPlanets()

  return (
    <main className="bg-[#020208]">
      {/* ── 우주 시뮬레이터 ── */}
      <section className="w-screen h-screen overflow-hidden">
        <SpaceSimulator planets={planets} />
      </section>

      {/* ── 스크롤 유도 ── */}
      <div className="flex justify-center py-8">
        <div className="flex flex-col items-center gap-2 text-space-muted/40 animate-bounce">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs tracking-[0.2em]">scroll</span>
        </div>
      </div>

      {/* ── 카메라 섹션 ── */}
      <section className="max-w-2xl mx-auto px-6 py-16 border-t border-space-border/30">
        <CameraCapture />
      </section>

      {/* ── 방명록 섹션 ── */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-space-border/30">
        <Guestbook />
      </section>

      <footer className="text-center py-12 text-space-muted/30 text-xs tracking-[0.3em]">
        PALE BLUE DOT ARCHIVE
      </footer>
    </main>
  )
}
