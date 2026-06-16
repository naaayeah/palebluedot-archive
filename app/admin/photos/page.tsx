'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import type { PlanetPhoto } from '@/lib/types'

const PLANETS = [
  { id: 'all', name: 'All Planets' },
  { id: 'mercury', name: 'Mercury' },
  { id: 'venus', name: 'Venus' },
  { id: 'earth', name: 'Earth' },
  { id: 'mars', name: 'Mars' },
  { id: 'jupiter', name: 'Jupiter' },
  { id: 'saturn', name: 'Saturn' },
  { id: 'uranus', name: 'Uranus' },
  { id: 'neptune', name: 'Neptune' },
]

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PlanetPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [planet, setPlanet] = useState('all')
  const [preview, setPreview] = useState<PlanetPhoto | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ planet })
    const res = await fetch(`/api/admin/photos?${params}`)
    const data = await res.json()
    setPhotos(data.photos ?? [])
    setLoading(false)
  }, [planet])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  async function toggleHide(id: string, currentlyHidden: boolean) {
    setActionLoading(id)
    const res = await fetch(`/api/admin/photos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hidden: !currentlyHidden }),
    })
    if (res.ok) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_hidden: !currentlyHidden } : p))
      )
    }
    setActionLoading(null)
  }

  async function confirmDelete(id: string) {
    setActionLoading(id)
    const res = await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== id))
    }
    setDeleteId(null)
    setActionLoading(null)
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-space-blue uppercase mb-2">Content Management</p>
        <h1 className="text-3xl font-display font-light text-space-text">Photographs</h1>
        <p className="mt-1 text-sm text-space-muted font-mono">{photos.length} images</p>
      </div>

      {/* Filter */}
      <div className="glass-panel p-4 mb-6">
        <select
          value={planet}
          onChange={(e) => setPlanet(e.target.value)}
          className="input-field w-full sm:w-52"
        >
          {PLANETS.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center text-space-muted font-mono text-sm py-20">Loading...</div>
      ) : photos.length === 0 ? (
        <div className="text-center text-space-muted font-mono text-sm py-20">No photographs found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`glass-panel overflow-hidden group relative ${photo.is_hidden ? 'opacity-50' : ''}`}
            >
              {/* Thumbnail */}
              <button
                onClick={() => setPreview(photo)}
                className="relative aspect-square w-full block"
              >
                <Image
                  src={photo.image_url}
                  alt="Planet photograph"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-mono">Preview</span>
                </div>
              </button>

              {/* Meta */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-space-text capitalize">
                    {(photo.planets as any)?.name ?? photo.planet_id}
                  </span>
                  {photo.is_hidden ? (
                    <span className="badge-hidden">Hidden</span>
                  ) : (
                    <span className="badge-visible">Visible</span>
                  )}
                </div>
                <p className="font-mono text-xs text-space-muted">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => toggleHide(photo.id, photo.is_hidden)}
                    disabled={actionLoading === photo.id}
                    className={`flex-1 text-xs py-1 px-2 rounded ${photo.is_hidden ? 'btn-success' : 'btn-warning'}`}
                  >
                    {actionLoading === photo.id ? '...' : photo.is_hidden ? 'Restore' : 'Hide'}
                  </button>
                  <button
                    onClick={() => setDeleteId(photo.id)}
                    className="btn-danger text-xs py-1 px-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="glass-panel overflow-hidden">
              <div className="relative aspect-video">
                <Image src={preview.image_url} alt="Preview" fill className="object-contain" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-space-text capitalize">
                    {(preview.planets as any)?.name ?? preview.planet_id}
                  </p>
                  <p className="font-mono text-xs text-space-muted">
                    {new Date(preview.created_at).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => setPreview(null)} className="btn-ghost text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-panel p-8 max-w-md w-full glow-blue">
            <h2 className="text-xl font-display text-space-text mb-2">Confirm Deletion</h2>
            <p className="text-space-muted text-sm font-mono mb-2">
              This will permanently delete the photo record and remove the image from storage.
            </p>
            <p className="text-space-muted/60 text-xs font-mono mb-6">
              Consider using <strong className="text-space-warning">Hide</strong> instead.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-ghost text-sm">Cancel</button>
              <button
                onClick={() => confirmDelete(deleteId)}
                disabled={!!actionLoading}
                className="btn-danger text-sm"
              >
                {actionLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
