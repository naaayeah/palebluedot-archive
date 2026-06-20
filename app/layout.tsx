import type { Metadata } from 'next'
import './globals.css'
import ClickSound from '@/components/public/ClickSound'

export const metadata: Metadata = {
  title: 'Pale Blue Dot Archive',
  description: 'A planetary archive — messages and photographs from across our solar system.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="min-h-screen bg-space-void text-space-text antialiased">
        <ClickSound />
        {children}
      </body>
    </html>
  )
}
