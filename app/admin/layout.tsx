import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mission Control · Pale Blue Dot Admin',
}

// The login page (app/admin/page.tsx) renders its own full-screen layout.
// Sub-routes like /admin/dashboard use app/admin/dashboard/layout.tsx for the sidebar.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
