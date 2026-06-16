'use client'

import { useEffect, useState, useCallback } from 'react'
import type { PlanetMessage } from '@/lib/types'

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

export default function MessagesPage() {
  const [messages, setMessages] = useState<PlanetMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planet, setPlanet] = useState('all')
  const [sort, setSort] = useState('newest')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ planet, sort })
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/messages?${params}`)
    const data = await res.json()
    setMessages(data.messages ?? [])
    setLoading(false)
  }, [planet, sort, search])

  useEffect(() => {
    const timer = setTimeout(fetchMessages, 300)
    return () => clearTimeout(timer)
  }, [fetchMessages])

  async function toggleHide(id: string, currentlyHidden: boolean) {
    setActionLoading(id)
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hidden: !currentlyHidden }),
    })
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_hidden: !currentlyHidden } : m))
      )
    }
    setActionLoading(null)
  }

  async function confirmDelete(id: string) {
    setActionLoading(id)
    const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }
    setDeleteId(null)
    setActionLoading(null)
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-space-blue uppercase mb-2">Content Management</p>
        <h1 className="text-3xl font-display font-light text-space-text">Messages</h1>
        <p className="mt-1 text-sm text-space-muted font-mono">{messages.length} transmissions</p>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <select
          value={planet}
          onChange={(e) => setPlanet(e.target.value)}
          className="input-field sm:w-44"
        >
          {PLANETS.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-field sm:w-36"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-space-muted font-mono text-sm">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-space-muted font-mono text-sm">No messages found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-space-border">
                  <th className="text-left p-4 font-mono text-xs text-space-muted uppercase tracking-widest">ID</th>
                  <th className="text-left p-4 font-mono text-xs text-space-muted uppercase tracking-widest">Planet</th>
                  <th className="text-left p-4 font-mono text-xs text-space-muted uppercase tracking-widest w-1/2">Content</th>
                  <th className="text-left p-4 font-mono text-xs text-space-muted uppercase tracking-widest">Date</th>
                  <th className="text-left p-4 font-mono text-xs text-space-muted uppercase tracking-widest">Status</th>
                  <th className="text-right p-4 font-mono text-xs text-space-muted uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b border-space-border/50 table-row-hover">
                    <td className="p-4 font-mono text-xs text-space-muted">
                      {msg.id.slice(0, 8)}…
                    </td>
                    <td className="p-4 font-mono text-xs text-space-text capitalize">
                      {(msg.planets as any)?.name ?? msg.planet_id}
                    </td>
                    <td className="p-4 text-sm text-space-text/80 max-w-xs">
                      <span className="line-clamp-2">{msg.content}</span>
                    </td>
                    <td className="p-4 font-mono text-xs text-space-muted whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {msg.is_hidden ? (
                        <span className="badge-hidden">Hidden</span>
                      ) : (
                        <span className="badge-visible">Visible</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleHide(msg.id, msg.is_hidden)}
                          disabled={actionLoading === msg.id}
                          className={msg.is_hidden ? 'btn-success text-xs py-1 px-3' : 'btn-warning text-xs py-1 px-3'}
                        >
                          {actionLoading === msg.id ? '...' : msg.is_hidden ? 'Restore' : 'Hide'}
                        </button>
                        <button
                          onClick={() => setDeleteId(msg.id)}
                          className="btn-danger text-xs py-1 px-3"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-panel p-8 max-w-md w-full glow-blue">
            <h2 className="text-xl font-display text-space-text mb-2">Confirm Deletion</h2>
            <p className="text-space-muted text-sm font-mono mb-6">
              This action is permanent and cannot be undone. The message will be removed from the database.
            </p>
            <p className="text-space-muted/60 text-xs font-mono mb-6">
              Consider using <strong className="text-space-warning">Hide</strong> instead.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-ghost text-sm">
                Cancel
              </button>
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
