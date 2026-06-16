import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServiceClient()

  const [
    { count: totalMessages },
    { count: totalPhotos },
    { count: totalVisitors },
    { count: totalPlanetVisits },
    { data: messagesByPlanet },
    { data: photosByPlanet },
  ] = await Promise.all([
    supabase.from('planet_messages').select('*', { count: 'exact', head: true }),
    supabase.from('planet_photos').select('*', { count: 'exact', head: true }),
    supabase.from('visitor_logs').select('*', { count: 'exact', head: true }).eq('page', '/'),
    supabase.from('visitor_logs').select('*', { count: 'exact', head: true }).neq('page', '/'),
    supabase.from('planet_messages').select('planet_id, planets(name)').order('planet_id'),
    supabase.from('planet_photos').select('planet_id, planets(name)').order('planet_id'),
  ])

  // Aggregate messages per planet
  const msgMap: Record<string, { planet_id: string; planet_name: string; count: number }> = {}
  for (const row of messagesByPlanet || []) {
    const pid = row.planet_id
    if (!msgMap[pid]) {
      msgMap[pid] = { planet_id: pid, planet_name: (row.planets as any)?.name || pid, count: 0 }
    }
    msgMap[pid].count++
  }

  // Aggregate photos per planet
  const photoMap: Record<string, { planet_id: string; planet_name: string; count: number }> = {}
  for (const row of photosByPlanet || []) {
    const pid = row.planet_id
    if (!photoMap[pid]) {
      photoMap[pid] = { planet_id: pid, planet_name: (row.planets as any)?.name || pid, count: 0 }
    }
    photoMap[pid].count++
  }

  return NextResponse.json({
    total_visitors: totalVisitors ?? 0,
    total_planet_visits: totalPlanetVisits ?? 0,
    total_messages: totalMessages ?? 0,
    total_photos: totalPhotos ?? 0,
    messages_per_planet: Object.values(msgMap),
    photos_per_planet: Object.values(photoMap),
  })
}
