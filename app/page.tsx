import dynamic from 'next/dynamic'
import { createAnonClient } from '@/lib/supabase-server'
import type { Planet } from '@/lib/types'

// Three.js must only run on client
const SpaceSimulator = dynamic(
  () => import('@/components/public/SpaceSimulator'),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-space-void">
      <p className="text-xs text-space-muted tracking-widest animate-pulse">INITIALIZING SYSTEM</p>
    </div>
  )}
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
    <main className="w-screen h-screen overflow-hidden bg-[#020208]">
      <SpaceSimulator planets={planets} />
    </main>
  )
}
