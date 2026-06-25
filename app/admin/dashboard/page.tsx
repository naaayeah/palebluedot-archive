'use client'

import { useEffect, useState } from 'react'
import type { AdminStats } from '@/lib/types'
import HomeSoundSettings from '@/components/admin/HomeSoundSettings'
import CameraBackgrounds from '@/components/admin/CameraBackgrounds'

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="font-mono text-xs text-space-muted w-20 shrink-0 truncate">{item.label}</span>
          <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
            <div
              className="h-full bg-space-blue/60 rounded transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-space-blue w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="glass-panel p-6">
      <p className="font-mono text-xs tracking-widest text-space-muted uppercase mb-3">{label}</p>
      <p className="text-4xl font-display font-light text-space-blue">{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs font-mono text-space-muted/60">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError('Failed to load statistics'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-space-blue uppercase mb-2">
          Archive Status
        </p>
        <h1 className="text-3xl font-display font-light text-space-text">Overview</h1>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-space-muted font-mono text-sm">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading telemetry...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-space-danger/10 border border-space-danger/30 text-space-danger font-mono text-sm">
          {error}
        </div>
      )}

      {stats && (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Visitors" value={stats.total_visitors} sub="unique homepage visits" />
            <StatCard label="Planet Visits" value={stats.total_planet_visits} sub="individual planet views" />
            <StatCard label="Messages" value={stats.total_messages} sub="total transmissions" />
            <StatCard label="Photographs" value={stats.total_photos} sub="uploaded images" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <h2 className="font-mono text-xs tracking-widest text-space-muted uppercase mb-6">
                Messages per Planet
              </h2>
              {stats.messages_per_planet.length > 0 ? (
                <BarChart
                  data={stats.messages_per_planet.map((p) => ({
                    label: p.planet_name,
                    value: p.count,
                  }))}
                />
              ) : (
                <p className="text-space-muted font-mono text-sm">No data yet.</p>
              )}
            </div>

            <div className="glass-panel p-6">
              <h2 className="font-mono text-xs tracking-widest text-space-muted uppercase mb-6">
                Photos per Planet
              </h2>
              {stats.photos_per_planet.length > 0 ? (
                <BarChart
                  data={stats.photos_per_planet.map((p) => ({
                    label: p.planet_name,
                    value: p.count,
                  }))}
                />
              ) : (
                <p className="text-space-muted font-mono text-sm">No data yet.</p>
              )}
            </div>
          </div>

          {/* Home sound settings */}
          <HomeSoundSettings />

          {/* Camera backgrounds */}
          <CameraBackgrounds />

          {/* System status */}
          <div className="glass-panel p-6">
            <h2 className="font-mono text-xs tracking-widest text-space-muted uppercase mb-4">
              System Status
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Database', status: 'Operational' },
                { label: 'Storage', status: 'Operational' },
                { label: 'Auth', status: 'Operational' },
                { label: 'API', status: 'Operational' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-space-success" />
                  <span className="font-mono text-xs text-space-muted">
                    {s.label} <span className="text-space-success">✓</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
