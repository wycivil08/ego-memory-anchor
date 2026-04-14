import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Header } from '@/components/layout/Header'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64">
        <Sidebar user={user} />
      </div>

      {/* Mobile Header - hidden on desktop */}
      <div className="lg:hidden">
        <Header />
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - hidden on desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
