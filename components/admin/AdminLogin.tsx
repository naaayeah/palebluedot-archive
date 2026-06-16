'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StarField from '@/components/public/StarField'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError('ACCESS DENIED — Invalid credentials')
        setPassword('')
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-space-gradient flex items-center justify-center p-6">
      <StarField count={200} />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-space-blue/30 bg-space-blue/10 mb-6 glow-blue">
            <svg className="w-7 h-7 text-space-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <p className="font-mono text-xs tracking-[0.4em] text-space-blue uppercase mb-3">
            Mission Control
          </p>
          <h1 className="text-3xl font-display font-light text-space-text">
            Archive Access
          </h1>
          <p className="mt-2 text-sm text-space-muted font-mono">
            Pale Blue Dot · Admin Terminal
          </p>
        </div>

        {/* Login form */}
        <div className="glass-panel p-8 glow-blue">
          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-space-border">
            <span className="w-2 h-2 rounded-full bg-space-success animate-pulse-slow" />
            <span className="text-xs font-mono text-space-muted">SYSTEM ONLINE · AWAITING AUTHENTICATION</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Access Code</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input-field tracking-widest"
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-space-danger/10 border border-space-danger/30">
                <span className="w-1.5 h-1.5 rounded-full bg-space-danger shrink-0" />
                <p className="text-xs font-mono text-space-danger">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !password} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs font-mono text-space-muted/40">
          Unauthorized access is prohibited
        </p>
      </div>
    </div>
  )
}
