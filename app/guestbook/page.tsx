import dynamic from 'next/dynamic'
import Link from 'next/link'

const Guestbook = dynamic(() => import('@/components/public/Guestbook'), { ssr: false })

export default function GuestbookPage() {
  return (
    <main className="relative min-h-screen bg-[#020208]">
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
