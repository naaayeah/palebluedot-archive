import AdminNav from '@/components/admin/AdminNav'

export default function AdminMessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-space-void flex">
      <AdminNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
