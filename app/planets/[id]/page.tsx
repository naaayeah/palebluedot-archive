import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAnonClient } from '@/lib/supabase-server'
import StarField from '@/components/public/StarField'
import PlanetInteractions from '@/components/public/PlanetInteractions'
import PlanetMedia from '@/components/public/PlanetMedia'
import type { Planet, PlanetMessage, PlanetPhoto } from '@/lib/types'

interface Props { params: { id: string } }

async function getData(id: string) {
  const supabase = createAnonClient()
  const [{ data: planet }, { data: messages }, { data: photos }, { data: settings }] = await Promise.all([
    supabase.from('planets').select('*').eq('id', id).eq('is_visible', true).single(),
    supabase.from('planet_messages').select('*').eq('planet_id', id).eq('is_hidden', false)
      .order('created_at', { ascending: false }).limit(50),
    supabase.from('planet_photos').select('*').eq('planet_id', id).eq('is_hidden', false)
      .order('created_at', { ascending: false }).limit(24),
    supabase.from('site_settings').select('home_sound_url').eq('id', 1).maybeSingle(),
  ])
  return {
    planet: planet as Planet | null,
    messages: (messages as PlanetMessage[]) ?? [],
    photos: (photos as PlanetPhoto[]) ?? [],
    homeSoundUrl: (settings?.home_sound_url as string | null) ?? null,
  }
}

export const revalidate = 30

export default async function PlanetPage({ params }: Props) {
  const { planet, messages, photos, homeSoundUrl } = await getData(params.id)
  if (!planet) notFound()

  return (
    <main className="relative min-h-screen bg-[#020208]">
      {/* ── 배경 영상 + 사운드 ── */}
      <PlanetMedia
        bgVideoUrl={planet.bg_video_url}
        soundUrl={planet.sound_url}
        homeSoundUrl={homeSoundUrl}
      />

      {/* 배경 영상 없을 때 별 */}
      {!planet.bg_video_url && <StarField count={200} />}

      {/* 콘텐츠 */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-space-muted hover:text-space-blue transition-colors mb-12"
        >
          ← Archive Index
        </Link>

        <header className="mb-16">
          {planet.distance && (
            <p className="text-xs tracking-[0.3em] text-space-blue mb-3 uppercase">
              {planet.distance}
            </p>
          )}
          <h1
            className="text-5xl text-space-text mb-2"
            style={{ fontFamily: '"Times New Roman", Georgia, serif', fontStyle: 'italic', fontWeight: 'bold' }}
          >
            {planet.name}
          </h1>
          {planet.subtitle && (
            <p className="text-space-muted text-sm mb-8">{planet.subtitle}</p>
          )}
          {planet.description && (
            <p className="text-space-text/80 leading-relaxed max-w-2xl">{planet.description}</p>
          )}
        </header>

        {/* 임베드 영상 (bg_video 아닌 별도 embed) */}
        {planet.video_url && (
          <div className="mb-16 glass-panel overflow-hidden aspect-video">
            <iframe
              src={planet.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <PlanetInteractions
          planetId={planet.id}
          questionPrompt={planet.question_prompt}
          initialMessages={messages}
          initialPhotos={photos}
        />
      </div>
    </main>
  )
}
