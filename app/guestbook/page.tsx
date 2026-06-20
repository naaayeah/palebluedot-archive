import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createAnonClient } from '@/lib/supabase-server'
import SpaceBackdrop from '@/components/public/SpaceBackdrop'
import type { Planet } from '@/lib/types'

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

export default async function GuestbookPage() {
  const planets = await getPlanets()

  return (
    <main className="relative min-h-screen bg-[#020208]">
      <SpaceBackdrop planets={planets} />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-space-muted hover:text-space-blue transition-colors mb-12"
        >
          ← Archive Index
        </Link>
        <Guestbook />
      </div>
    </main>
  )
}
