import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createAnonClient } from '@/lib/supabase-server'
import type { Planet } from '@/lib/types'

const SoundToggle = dynamic(() => import('@/components/public/SoundToggle'), { ssr: false })

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
    <main className="relative w-screen h-screen overflow-hidden bg-[#020208]">
      <SpaceSimulator planets={planets} />

      {/* ── 사운드 토글 ── */}
      <div className="absolute top-6 right-6 z-20">
        <SoundToggle />
      </div>

      {/* ── 하단 네비게이션 버튼 ── */}
      <nav className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        <Link
          href="/camera"
          className="px-6 py-2.5 rounded-full text-xs tracking-[0.15em] uppercase
            bg-white/5 hover:bg-white/10 backdrop-blur-md
            border border-white/15 hover:border-space-blue/50
            text-white/80 hover:text-white transition-all"
        >
          Space Camera
        </Link>
        <Link
          href="/guestbook"
          className="px-6 py-2.5 rounded-full text-xs tracking-[0.15em] uppercase
            bg-white/5 hover:bg-white/10 backdrop-blur-md
            border border-white/15 hover:border-space-blue/50
            text-white/80 hover:text-white transition-all"
        >
          Guestbook
        </Link>
      </nav>
    </main>
  )
}
